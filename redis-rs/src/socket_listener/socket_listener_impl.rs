use super::super::{AsyncCommands, RedisResult};
use super::{headers::*, rotating_buffer::RotatingBuffer};
use crate::aio::MultiplexedConnection;
use crate::{Client, RedisError};
use byteorder::{LittleEndian, WriteBytesExt};
use futures::stream::StreamExt;
use lifeguard::{pool, Pool, RcRecycled, StartingSize, Supplier};
use num_traits::ToPrimitive;
use signal_hook::consts::signal::*;
use signal_hook_tokio::Signals;
use std::ops::Range;
use std::rc::Rc;
use std::str;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::{io, thread};
use tokio::io::ErrorKind::AddrInUse;
use tokio::net::{UnixListener, UnixStream};
use tokio::runtime::Builder;
use tokio::sync::Mutex;
use tokio::sync::Notify;
use tokio::task;
use ClosingReason::*;
use PipeListeningResult::*;
use protobuf::Message;
use flatbuffers_pool::{FlatBufferBuilderPool, FlatBufferBuilderLocalPool};

//use babushkaproto::{CommandReply, Request, NullResp, StrResponse};
use num_traits::FromPrimitive;
/// The socket file name
pub const SOCKET_FILE_NAME: &str = "babushka-socket";
const INIT_POOL_SIZE: usize = 4_096;
const MAX_POOL_SIZE: usize = 8_192;
const BUFFER_CAPACITY: usize = 1_024;
struct SocketListener {
    read_socket: Rc<UnixStream>,
    rotating_buffer: RotatingBuffer,
    pool: Rc<Pool<Vec<u8>>>
}

enum PipeListeningResult {
    Closed(ClosingReason),
    ReceivedValues(Vec<WholeRequest>),
}

impl From<ClosingReason> for PipeListeningResult {
    fn from(result: ClosingReason) -> Self {
        Closed(result)
    }
}

impl SocketListener {
    fn new(read_socket: Rc<UnixStream>) -> Self {
        let pool = Rc::new(
            pool()
                .with(StartingSize(2))
                .with(Supplier(move || Vec::<u8>::with_capacity(65_536)))
                .build(),
        );
        let rotating_buffer = RotatingBuffer::with_pool(pool.clone());
        SocketListener {
            read_socket,
            rotating_buffer,
            pool,
        }
    }

    pub(crate) async fn next_values(&mut self) -> PipeListeningResult {
        loop {
            self.read_socket
                .readable()
                .await
                .expect("Readable check failed");

            let read_result = self
                .read_socket
                .try_read_buf(self.rotating_buffer.current_buffer());
            match read_result {
                Ok(0) => {
                    return ReadSocketClosed.into();
                }
                Ok(_) => {
                    return match self.rotating_buffer.get_requests() {
                        Ok(requests) => ReceivedValues(requests),
                        Err(err) => UnhandledError(err.into()).into(),
                    };
                }
                Err(ref e)
                    if e.kind() == io::ErrorKind::WouldBlock
                        || e.kind() == io::ErrorKind::Interrupted =>
                {
                    continue;
                }
                Err(err) => {
                    // println!("next_values: recieved error: {}", err);
                    return UnhandledError(err.into()).into()},
            }
        }
    }
}

async fn write_to_output(output: &[u8], write_socket: &UnixStream, write_lock: &Rc<Mutex<()>>) {
    let _guard = write_lock.lock().await;
    let mut total_written_bytes = 0;
    while total_written_bytes < output.len() {
        write_socket
            .writable()
            .await
            .expect("Writable check failed");
        match write_socket.try_write(&output[total_written_bytes..]) {
            Ok(written_bytes) => {
                total_written_bytes += written_bytes;
            }
            Err(err)
                if err.kind() == io::ErrorKind::WouldBlock
                    || err.kind() == io::ErrorKind::Interrupted =>
            {
                continue;
            }
            Err(err) => {
                // TODO - add proper error handling.
                panic!("received unexpected error {:?}", err);
            }
        }
    }
}

fn write_response_header_to_vec(
    output_buffer: &mut Vec<u8>,
    callback_index: u32,
    response_type: ResponseType,
    length: usize,
) -> Result<(), io::Error> {
    // TODO - use serde for easier serialization.
    output_buffer.write_u32::<LittleEndian>(length as u32)?;
    output_buffer.write_u32::<LittleEndian>(callback_index)?;
    output_buffer.write_u32::<LittleEndian>(response_type.to_u32().ok_or_else(|| {
        io::Error::new(
            io::ErrorKind::InvalidData,
            format!("Response type {:?} wasn't found", response_type),
        )
    })?)?;
    Ok(())
}
//use crate::socket_listener::socket_listener_impl::babushkaproto::command_reply::Response;
fn write_response_header(
    output_buffer: &mut [u8],
    callback_index: u32,
    response_type: ResponseType,
) -> Result<(), io::Error> {
    let length = output_buffer.len();
    // TODO - use serde for easier serialization.
    (&mut output_buffer[..MESSAGE_LENGTH_END]).write_u32::<LittleEndian>(length as u32)?;
    (&mut output_buffer[MESSAGE_LENGTH_END..CALLBACK_INDEX_END])
        .write_u32::<LittleEndian>(callback_index)?;
    (&mut output_buffer[CALLBACK_INDEX_END..HEADER_END]).write_u32::<LittleEndian>(
        response_type.to_u32().ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::InvalidData,
                format!("Response type {:?} wasn't found", response_type),
            )
        })?,
    )?;
    Ok(())
}

fn create_fbs_builder() -> flatbuffers::FlatBufferBuilder<'static>{
    flatbuffers::FlatBufferBuilder::with_capacity(1024)
}

async fn write_command_reply(
    write_socket: Rc<UnixStream>,
    write_lock: Rc<Mutex<()>>,
    callback_index: u32,
    response: Option<String>,
    pool: &Pool<Vec<u8>>,
    is_error: bool,
    )
    -> RedisResult<()>  {
        //let mut builder = FlatBufferBuilderPool::get();
        //let bf_pool: object_pool::Pool<flatbuffers::FlatBufferBuilder> = object_pool::Pool::new(2, || flatbuffers::FlatBufferBuilder::with_capacity(1024));
        //let mut builder = bf_pool.pull(create_fbs_builder);
        let mut builder = flatbuffers::FlatBufferBuilder::with_capacity(1024); //TODO: change it to be reused
        let out_msg: flatbuffers::WIPOffset<Response>;
        if is_error {
            let resp_offset = builder.create_string(&response.unwrap());
            out_msg = Response::create(&mut builder, &ResponseArgs{
                response: None,
                callback_idx: callback_index,
                error: Some(resp_offset),
                ..Default::default()
            });
        } else {
            match response {
                Some(res) => {
                    let resp_offset = builder.create_string(&res);
                    out_msg = Response::create(&mut builder, &ResponseArgs{
                        response: Some(resp_offset),
                        callback_idx: callback_index,
                        error: None,
                        ..Default::default()
                    });
                },
                None => {
                    out_msg = Response::create(&mut builder, &ResponseArgs{
                        response: None,
                        callback_idx: callback_index,
                        error: None,
                        ..Default::default()
                    });
                }
            }
        };
        builder.finish(out_msg, None);
        let buf = builder.finished_data();
        let msg_length = buf.len();
        // println!("out msg={}, msg_length={}", protobuf::text_format::print_to_string(&out_msg), msg_length);
        let mut output_buffer = get_vec(pool, msg_length as usize + HEADER_END);
        // Write header
        output_buffer.write_u32::<LittleEndian>(msg_length as u32)?;
        // Write response
        output_buffer.extend_from_slice(&buf);
        write_to_output(&output_buffer, &write_socket, &write_lock).await;
        Ok(())
    }
async fn send_set_request(
    request: Request<'_>,
    mut connection: MultiplexedConnection,
    write_socket: Rc<UnixStream>,
    write_lock: Rc<Mutex<()>>,
    pool: &Pool<Vec<u8>>
) -> RedisResult<()> {
    let key = request.arg().unwrap().get(0);
    let value = request.arg().unwrap().get(1);
    connection
        .set(key, value)
        .await?;
    write_command_reply(write_socket.clone(), write_lock.clone(), request.callback_idx(), None, pool, false).await?;
    Ok(())
}

fn get_vec(pool: &Pool<Vec<u8>>, required_capacity: usize) -> RcRecycled<Vec<u8>> {
    let mut vec = pool.new_rc();
    vec.clear();
    vec.reserve(required_capacity);
    vec
}
use flatbuffers::{ForwardsUOffset, Vector, FlatBufferBuilder};
async fn send_get_request(
    request: Request<'_>,
    mut connection: MultiplexedConnection,
    write_socket: Rc<UnixStream>,
    pool: &Pool<Vec<u8>>,
    write_lock: Rc<Mutex<()>>,
) -> RedisResult<()> {
    let key = request.arg().unwrap().get(0);
    let result: Option<String> = connection.get(key).await?;
    write_command_reply(write_socket, write_lock, request.callback_idx(), result, pool, false).await?;
    Ok(())
}

fn handle_request(
    whole_request: WholeRequest,
    connection: MultiplexedConnection,
    write_socket: Rc<UnixStream>,
    pool: Rc<Pool<Vec<u8>>>,
    write_lock: Rc<Mutex<()>>,
    fbs_pool: Rc<FlatBufferBuilderLocalPool<'_>>
) {
    task::spawn_local(async move {
        let request = match root_as_request(&whole_request.buffer[whole_request.request_start..whole_request.request_end]) {
            Ok(res) => res,
            Err(err) => {
                println!("Error decoding protocol message");
                println!("|── Protobuf error was: {:?}", err.to_string());
                //println!("|── Bytes were: {:?}", arr);
                panic!();
            },
        };
        let result = match FromPrimitive::from_u32(request.request_type()) {
            Some(RequestType::GetString) => {
                send_get_request(
                    request,
                    connection,
                    write_socket.clone(),
                    &pool,
                    write_lock.clone(),
                )
                .await
            }
            Some(RequestType::SetString) => {
                let res = send_set_request(
                    request,
                    connection,
                    write_socket.clone(),
                    write_lock.clone(),
                    &pool,
                )
                .await;
                res
            }
            Some(RequestType::ServerAddress) => {
                unreachable!("Server address can only be sent once")
            }
            None => panic!("Unkown request type"), // TODO: better error handling
        };
        if let Err(err) = result {
            write_error(
                err,
                request.callback_idx(),
                write_socket,
                &pool,
                write_lock,
                ResponseType::RequestError,
            )
            .await;
        }
    });
}

async fn write_error(
    err: RedisError,
    callback_index: u32,
    write_socket: Rc<UnixStream>,
    pool: &Rc<Pool<Vec<u8>>>,
    write_lock: Rc<Mutex<()>>,
    response_type: ResponseType,
) {
    let err_str = err.to_string();
    write_command_reply(write_socket, write_lock, callback_index, Some(err_str.into()), pool, true).await.expect("Failed writing error to vec");
    
}

async fn handle_requests(
    received_requests: Vec<WholeRequest>,
    connection: &MultiplexedConnection,
    write_socket: &Rc<UnixStream>,
    pool: Rc<Pool<Vec<u8>>>,
    write_lock: &Rc<Mutex<()>>,
    fbs_pool: Rc<FlatBufferBuilderLocalPool<'_>>
) {
    // TODO - can use pipeline here, if we're fine with the added latency.
    for request in received_requests {
        handle_request(
            request,
            connection.clone(),
            write_socket.clone(),
            pool.clone(),
            write_lock.clone(),
            fbs_pool.clone()
        );
    }
    // Yield to ensure that the subtasks aren't starved.
    task::yield_now().await;
}

fn close_socket() {
    std::fs::remove_file(get_socket_path()).expect("Failed to delete socket file");
}

fn to_babushka_result<T, E: std::fmt::Display>(
    result: Result<T, E>,
    err_msg: Option<&str>,
) -> Result<T, BabushkaError> {
    result.map_err(|err: E| {
        BabushkaError::BaseError(match err_msg {
            Some(msg) => format!("{}: {}", msg, err),
            None => format!("{}", err),
        })
    })
}

async fn parse_address_create_conn(
    write_socket: &Rc<UnixStream>,
    request: Request<'_>,
    write_lock: &Rc<Mutex<()>>,
    pool: Rc<Pool<Vec<u8>>>,
) -> Result<MultiplexedConnection, BabushkaError> {
    let address = request.arg().unwrap().get(0);
    let client = to_babushka_result(
        Client::open(address),
        Some("Failed to open redis-rs client"),
    )?;
    let connection = to_babushka_result(
        client.get_multiplexed_async_connection().await,
        Some("Failed to create a multiplexed connection"),
    )?;

    // Send response
    to_babushka_result(write_command_reply(
        write_socket.clone(), 
        write_lock.clone(),
        request.callback_idx(),
        None,
        &pool,
        false).await,
        Some("Failed to write address response"))?;
    Ok(connection)
}

async fn wait_for_server_address_create_conn(
    client_listener: &mut SocketListener,
    socket: &Rc<UnixStream>,
    write_lock: &Rc<Mutex<()>>,
) -> Result<MultiplexedConnection, BabushkaError> {
    // Wait for the server's address
    let pool = client_listener.pool.clone();
    // let builder_pool = client_listener.builder_pool.clone();
    match client_listener.next_values().await {
        Closed(reason) => {
            return Err(BabushkaError::CloseError(reason));
        }
        ReceivedValues(received_requests) => {
            if let Some(index) = (0..received_requests.len()).next() {
                let whole_request = received_requests
                    .get(index)
                    .ok_or_else(|| BabushkaError::BaseError("No received requests".to_string()))?;
                let request = match root_as_request(&whole_request.buffer[whole_request.request_start..whole_request.request_end]) {
                    Ok(res) => res,
                    Err(err) => {
                        println!("Error decoding protocol message");
                        println!("|── Protobuf error was: {:?}", err.to_string());
                        //println!("|── Bytes were: {:?}", arr);
                        panic!();
                    },
                };
                match FromPrimitive::from_u32(request.request_type().clone()).unwrap() {
                    RequestType::ServerAddress => {
                        return parse_address_create_conn(
                            socket,
                            request,
                            write_lock,
                            pool,
                        )
                        .await
                    }
                    _ => {
                        return Err(BabushkaError::BaseError(
                            "Received another request before receiving server address".to_string(),
                        ))
                    }
                }
            }
        }
    }
    Err(BabushkaError::BaseError(
        "Failed to get the server's address".to_string(),
    ))
}

fn update_notify_connected_clients(
    connected_clients: Arc<AtomicUsize>,
    close_notifier: Arc<Notify>,
) {
    // Check if the entire socket listener should be closed before
    // closing the client's connection task
    if connected_clients.fetch_sub(1, Ordering::Relaxed) == 1 {
        // No more clients connected, close the socket
        close_notifier.notify_one();
    }
}

async fn listen_on_client_stream(
    stream: UnixStream,
    notify_close: Arc<Notify>,
    connected_clients: Arc<AtomicUsize>,
) {
    // Spawn a new task to listen on this client's stream
    let rc_stream = Rc::new(stream);
    let write_lock = Rc::new(Mutex::new(()));
    let mut client_listener = SocketListener::new(rc_stream.clone());
    let mut fbs_pool = Rc::new(FlatBufferBuilderPool::new().build());
    let connection = match wait_for_server_address_create_conn(
        &mut client_listener,
        &rc_stream,
        &write_lock.clone(),
    )
    .await
    {
        Ok(conn) => conn,
        Err(BabushkaError::CloseError(_reason)) => {
            update_notify_connected_clients(connected_clients, notify_close);
            return; // TODO: implement error protocol, handle closing reasons different from ReadSocketClosed
        }
        Err(BabushkaError::BaseError(err)) => {
            println!("Recieved error: {:?}", err); // TODO: implement error protocol
            return;
        }
    };
    loop {
        let pool = client_listener.pool.clone();
        match client_listener.next_values().await {
            Closed(reason) => {
                if let ClosingReason::UnhandledError(err) = reason {
                    println!("Got unhandled errors: {}", err);
                    write_error(
                        err,
                        u32::MAX,
                        rc_stream.clone(),
                        &client_listener.pool,
                        write_lock.clone(),
                        ResponseType::ClosingError,
                    )
                    .await;
                };
                update_notify_connected_clients(connected_clients, notify_close);
                return; // TODO: implement error protocol, handle error closing reasons
            }
            ReceivedValues(received_requests) => {
                handle_requests(
                    received_requests,
                    &connection,
                    &rc_stream,
                    pool,
                    &write_lock.clone(),
                    fbs_pool.clone()
                )
                .await;
            }
        }
    }
}

async fn listen_on_socket<InitCallback>(init_callback: InitCallback)
where
    InitCallback: FnOnce(Result<String, RedisError>) + Send + 'static,
{
    // Bind to socket
    let listener = match UnixListener::bind(get_socket_path()) {
        Ok(listener) => listener,
        Err(err) if err.kind() == AddrInUse => {
            init_callback(Ok(get_socket_path()));
            return;
        }
        Err(err) => {
            init_callback(Err(err.into()));
            return;
        }
    };
    let local = task::LocalSet::new();
    let connected_clients = Arc::new(AtomicUsize::new(0));
    let notify_close = Arc::new(Notify::new());
    init_callback(Ok(get_socket_path()));
    flatbuffers_pool::FlatBufferBuilderPool::init_global_pool_size(INIT_POOL_SIZE);
    flatbuffers_pool::FlatBufferBuilderPool::max_global_pool_size(MAX_POOL_SIZE);
    flatbuffers_pool::FlatBufferBuilderPool::global_buffer_capacity(BUFFER_CAPACITY);
    local.run_until(async move {
        loop {
            tokio::select! {
                listen_v = listener.accept() => {
                    if let Ok((stream, _addr)) = listen_v {
                        // New client
                        let cloned_close_notifier = notify_close.clone();
                        let cloned_connected_clients = connected_clients.clone();
                        cloned_connected_clients.fetch_add(1, Ordering::Relaxed);
                        task::spawn_local(listen_on_client_stream(stream, cloned_close_notifier.clone(), cloned_connected_clients));
                    } else if listen_v.is_err() {
                        close_socket();
                        return;
                    }
                },
                // `notify_one` was called to indicate no more clients are connected,
                // close the socket
                _ = notify_close.notified() => {close_socket(); return;},
                // Interrupt was received, close the socket
                _ = handle_signals() => {close_socket(); return;}
            }
        };
        })
    .await;
}

#[derive(Debug)]
/// Enum describing the reason that a socket listener stopped listening on a socket.
pub enum ClosingReason {
    /// The socket was closed. This is usually the required way to close the listener.
    ReadSocketClosed,
    /// The listener encounter an error it couldn't handle.
    UnhandledError(RedisError),
    /// No clients left to handle, close the connection
    AllConnectionsClosed,
}

/// Enum describing babushka errors
pub enum BabushkaError {
    /// Base error
    BaseError(String),
    /// Close error
    CloseError(ClosingReason),
}

/// Get the socket path as a string
fn get_socket_path() -> String {
    let socket_name = format!("{}-{}", SOCKET_FILE_NAME, std::process::id());
    std::env::temp_dir()
        .join(socket_name)
        .into_os_string()
        .into_string()
        .expect("Couldn't create socket path")
}

async fn handle_signals() {
    // Handle Unix signals
    let mut signals =
        Signals::new([SIGTERM, SIGQUIT, SIGINT, SIGHUP]).expect("Failed creating signals");
    while let Some(signal) = signals.next().await {
        match signal {
            SIGTERM | SIGQUIT | SIGINT | SIGHUP => {
                // Close the socket
                close_socket();
            }
            sig => unreachable!("Received an unregistered signal `{}`", sig),
        }
    }
}

/// Creates a new thread with a main loop task listening on the socket for new connections.
/// Every new connection will be assigned with a client-listener task to handle their requests.
///
/// # Arguments
/// * `init_callback` - called when the socket listener fails to initialize, with the reason for the failure.
pub fn start_socket_listener<InitCallback>(init_callback: InitCallback)
where
    InitCallback: FnOnce(Result<String, RedisError>) + Send + 'static,
{
    thread::Builder::new()
        .name("socket_listener_thread".to_string())
        .spawn(move || {
            let runtime = Builder::new_current_thread()
                .enable_all()
                .thread_name("socket_listener_thread")
                .build();
            match runtime {
                Ok(runtime) => {
                    runtime.block_on(listen_on_socket(init_callback));
                }
                Err(err) => {
                    close_socket();
                    init_callback(Err(err.into()))
                }
            };
        })
        .expect("Thread spawn failed. Cannot report error because callback was moved.");
}
