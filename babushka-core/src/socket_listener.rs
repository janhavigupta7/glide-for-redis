use super::{headers::*, rotating_buffer::RotatingBuffer};
use bytes::BufMut;
use dispose::{Disposable, Dispose};
use futures::stream::StreamExt;
use logger_core::{log, Level};
use num_traits::FromPrimitive;
use pb_message::{Request, Response};
use protobuf::Message;
use redis::aio::MultiplexedConnection;
use redis::{AsyncCommands, RedisResult, Value};
use redis::{Client, RedisError};
use signal_hook::consts::signal::*;
use signal_hook_tokio::Signals;
use std::cell::Cell;
use std::rc::Rc;
use std::str;
use std::{io, thread};
use tokio::io::ErrorKind::AddrInUse;
use tokio::net::{UnixListener, UnixStream};
use tokio::runtime::Builder;
use tokio::sync::mpsc::{channel, Sender};
use tokio::sync::Mutex;
use tokio::task;
use ClosingReason::*;
use PipeListeningResult::*;

/// The socket file name
pub const SOCKET_FILE_NAME: &str = "babushka-socket";

/// struct containing all objects needed to bind to a socket and clean it.
struct SocketListener {
    socket_path: String,
    cleanup_socket: bool,
}

impl Dispose for SocketListener {
    fn dispose(self) {
        if self.cleanup_socket {
            close_socket(self.socket_path);
        }
    }
}

/// struct containing all objects needed to read from a unix stream.
struct UnixStreamListener {
    read_socket: Rc<UnixStream>,
    rotating_buffer: RotatingBuffer,
}

/// struct containing all objects needed to write to a socket.
struct Writer {
    socket: Rc<UnixStream>,
    lock: Mutex<()>,
    accumulated_outputs: Cell<Vec<u8>>,
    closing_sender: Sender<ClosingReason>,
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

impl UnixStreamListener {
    fn new(read_socket: Rc<UnixStream>) -> Self {
        // if the logger has been initialized by the user (external or internal) on info level this log will be shown
        logger_core::log(
            logger_core::Level::Info,
            "connection",
            "new socket listener initiated",
        );
        let rotating_buffer = RotatingBuffer::new(2, 65_536);
        Self {
            read_socket,
            rotating_buffer,
        }
    }

    pub(crate) async fn next_values(&mut self) -> PipeListeningResult {
        loop {
            if let Err(err) = self.read_socket.readable().await {
                return ClosingReason::UnhandledError(err.into()).into();
            }

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
                Err(err) => return UnhandledError(err.into()).into(),
            }
        }
    }
}

async fn write_to_output(writer: &Rc<Writer>) {
    let Ok(_guard) = writer.lock.try_lock() else {
        return;
    };

    let mut output = writer.accumulated_outputs.take();
    loop {
        if output.is_empty() {
            return;
        }
        let mut total_written_bytes = 0;
        while total_written_bytes < output.len() {
            if let Err(err) = writer.socket.writable().await {
                let _ = writer.closing_sender.send(err.into()).await; // we ignore the error, because it means that the reader was dropped, which is ok.
                return;
            }
            match writer.socket.try_write(&output[total_written_bytes..]) {
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
                    let _ = writer.closing_sender.send(err.into()).await; // we ignore the error, because it means that the reader was dropped, which is ok.
                }
            }
        }
        output.clear();
        output = writer.accumulated_outputs.replace(output);
    }
}

async fn send_set_request(
    request: &Request,
    mut connection: MultiplexedConnection,
    writer: Rc<Writer>,
) -> RedisResult<()> {
    let args = request.args.to_vec();
    let result = connection.set(&args[0], &args[1]).await;
    write_response(result, request.callback_idx, &writer, ResponseType::Value).await?;
    Ok(())
}

async fn write_response(
    resp_result: Result<Value, RedisError>,
    callback_index: u32,
    writer: &Rc<Writer>,
    response_type: ResponseType,
) -> Result<(), io::Error> {
    let mut response = Response::new();
    response.callback_idx = callback_index;
    match resp_result {
        Ok(value) => {
            if value != Value::Nil {
                // Since null values don't require any additional data, they can be sent without any extra effort.
                // Move the value to the heap and leak it. The wrapper should use `Box::from_raw` to recreate the box, use the value, and drop the allocation.
                let pointer = Box::leak(Box::new(value));
                let raw_pointer = pointer as *mut redis::Value;
                response.value = Some(pb_message::response::Value::RespPointer(raw_pointer as u64))
                //write_pointer_to_output(&writer.accumulated_outputs, pointer);
            }
        }
        Err(err) => match response_type {
            ResponseType::ClosingError => {
                response.value = Some(pb_message::response::Value::ClosingError(err.to_string()))
            }
            _ => response.value = Some(pb_message::response::Value::RequestError(err.to_string())),
        },
    }

    let mut vec = writer.accumulated_outputs.take();
    let length = response.compute_size() as u32;
    vec.put_u32_le(length);
    vec.extend_from_slice(&response.write_to_bytes().unwrap());
    // println!("Writing response {:?}, length = {}", &vec, length);
    writer.accumulated_outputs.set(vec);
    write_to_output(&writer).await;
    Ok(())
}

async fn send_get_request(
    request: &Request,
    mut connection: MultiplexedConnection,
    writer: Rc<Writer>,
) -> RedisResult<()> {
    let result = connection.get(&request.args.first().unwrap()).await;
    write_response(result, request.callback_idx, &writer, ResponseType::Value).await?;
    Ok(())
}

fn handle_request(
    whole_request: WholeRequest,
    connection: MultiplexedConnection,
    writer: Rc<Writer>,
) {
    task::spawn_local(async move {
        let request = &whole_request.request;
        let result = match FromPrimitive::from_u32(request.request_type.clone()).unwrap() {
            RequestType::GetString => send_get_request(request, connection, writer.clone()).await,
            RequestType::SetString => send_set_request(request, connection, writer.clone()).await,
            RequestType::ServerAddress => {
                unreachable!("Server address can only be sent once")
            }
        };
        if let Err(err) = result {
            let _ = write_response(
                Err(err),
                request.callback_idx,
                &writer,
                ResponseType::ClosingError,
            )
            .await;
        }
    });
}

async fn handle_requests(
    received_requests: Vec<WholeRequest>,
    connection: &MultiplexedConnection,
    writer: &Rc<Writer>,
) {
    // TODO - can use pipeline here, if we're fine with the added latency.
    for request in received_requests {
        handle_request(request, connection.clone(), writer.clone())
    }
    // Yield to ensure that the subtasks aren't starved.
    task::yield_now().await;
}

fn close_socket(socket_path: String) {
    let _ = std::fs::remove_file(socket_path);
}

fn to_babushka_result<T, E: std::fmt::Display>(
    result: Result<T, E>,
    err_msg: Option<&str>,
) -> Result<T, ClientCreationError> {
    result.map_err(|err: E| {
        ClientCreationError::UnhandledError(match err_msg {
            Some(msg) => format!("{msg}: {err}"),
            None => format!("{err}"),
        })
    })
}

async fn parse_address_create_conn(
    writer: &Rc<Writer>,
    request: &Request,
) -> Result<MultiplexedConnection, ClientCreationError> {
    let address = request.args.first().unwrap();
    let client = to_babushka_result(
        Client::open(address.as_str()),
        Some("Failed to open redis-rs client"),
    )?;
    let connection = to_babushka_result(
        client.get_multiplexed_async_connection().await,
        Some("Failed to create a multiplexed connection"),
    )?;

    // Send response
    write_response(
        Ok(Value::Nil),
        request.callback_idx,
        &writer,
        ResponseType::Null,
    )
    .await
    .expect("Failed writing address response.");
    Ok(connection)
}

async fn wait_for_server_address_create_conn(
    client_listener: &mut UnixStreamListener,
    writer: &Rc<Writer>,
) -> Result<MultiplexedConnection, ClientCreationError> {
    // Wait for the server's address
    match client_listener.next_values().await {
        Closed(reason) => Err(ClientCreationError::SocketListenerClosed(reason)),
        ReceivedValues(received_requests) => {
            if let Some(whole_request) = received_requests.first() {
                let request = &whole_request.request;
                match FromPrimitive::from_u32(request.request_type).unwrap() {
                    RequestType::ServerAddress => {
                        return parse_address_create_conn(writer, &request).await
                    }
                    _ => {
                        return Err(ClientCreationError::UnhandledError(
                            "Received another request before receiving server address".to_string(),
                        ))
                    }
                }
            } else {
                Err(ClientCreationError::UnhandledError(
                    "No received requests".to_string(),
                ))
            }
        }
    }
}

async fn read_values_loop(
    mut client_listener: UnixStreamListener,
    connection: MultiplexedConnection,
    writer: Rc<Writer>,
) -> ClosingReason {
    loop {
        match client_listener.next_values().await {
            Closed(reason) => {
                return reason;
            }
            ReceivedValues(received_requests) => {
                handle_requests(received_requests, &connection, &writer).await;
            }
        }
    }
}

async fn listen_on_client_stream(socket: UnixStream) {
    let socket = Rc::new(socket);
    // Spawn a new task to listen on this client's stream
    let write_lock = Mutex::new(());
    let mut client_listener = UnixStreamListener::new(socket.clone());
    let accumulated_outputs = Cell::new(Vec::new());
    let (sender, mut receiver) = channel(1);
    let writer = Rc::new(Writer {
        socket,
        lock: write_lock,
        accumulated_outputs,
        closing_sender: sender,
    });
    let connection = match wait_for_server_address_create_conn(&mut client_listener, &writer).await
    {
        Ok(conn) => conn,
        Err(ClientCreationError::SocketListenerClosed(reason)) => {
            let error_message = format!("Socket listener closed due to {reason:?}");
            write_error(&error_message, u32::MAX, writer, ResponseType::ClosingError).await;
            logger_core::log(logger_core::Level::Error, "client creation", error_message);
            return; // TODO: implement error protocol, handle closing reasons different from ReadSocketClosed
        }
        Err(ClientCreationError::UnhandledError(err)) => {
            write_error(
                &err.to_string(),
                u32::MAX,
                writer,
                ResponseType::ClosingError,
            )
            .await;
            logger_core::log(
                logger_core::Level::Error,
                "client creation",
                format!("Recieved error: {err}"),
            );
            return; // TODO: implement error protocol
        }
    };
    tokio::select! {
            reader_closing = read_values_loop(client_listener, connection, writer.clone()) => {
                if let ClosingReason::UnhandledError(err) = reader_closing {
                    let _ = write_response(Err(err), u32::MAX, &writer, ResponseType::ClosingError).await;
                };
            },
            writer_closing = receiver.recv() => {
                if let Some(ClosingReason::UnhandledError(err)) = writer_closing {
                    log(Level::Error, "writer closing", err.to_string());
                }
            }
    }
}

impl SocketListener {
    fn new() -> Self {
        SocketListener {
            socket_path: get_socket_path(),
            cleanup_socket: true,
        }
    }

    pub(crate) async fn listen_on_socket<InitCallback>(&mut self, init_callback: InitCallback)
    where
        InitCallback: FnOnce(Result<String, String>) + Send + 'static,
    {
        // Bind to socket
        let listener = match UnixListener::bind(self.socket_path.clone()) {
            Ok(listener) => listener,
            Err(err) if err.kind() == AddrInUse => {
                init_callback(Ok(self.socket_path.clone()));
                // Don't cleanup the socket resources since the socket is being used
                self.cleanup_socket = false;
                return;
            }
            Err(err) => {
                init_callback(Err(err.to_string()));
                return;
            }
        };
        let local = task::LocalSet::new();
        init_callback(Ok(self.socket_path.clone()));
        local
            .run_until(async move {
                loop {
                    tokio::select! {
                        listen_v = listener.accept() => {
                            if let Ok((stream, _addr)) = listen_v {
                                // New client
                                task::spawn_local(listen_on_client_stream(stream));
                            } else if listen_v.is_err() {
                                return
                            }
                        },
                        // Interrupt was received, close the socket
                        _ = handle_signals() => return
                    }
                }
            })
            .await;
    }
}

#[derive(Debug)]
/// Enum describing the reason that a socket listener stopped listening on a socket.
pub enum ClosingReason {
    /// The socket was closed. This is the expected way that the listener should be closed.
    ReadSocketClosed,
    /// The listener encounter an error it couldn't handle.
    UnhandledError(RedisError),
}

impl From<io::Error> for ClosingReason {
    fn from(error: io::Error) -> Self {
        UnhandledError(error.into())
    }
}

/// Enum describing errors received during client creation.
pub enum ClientCreationError {
    /// An error was returned during the client creation process.
    UnhandledError(String),
    /// Socket listener was closed before receiving the server address.
    SocketListenerClosed(ClosingReason),
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
    loop {
        if let Some(signal) = signals.next().await {
            match signal {
                SIGTERM | SIGQUIT | SIGINT | SIGHUP => {
                    logger_core::log(
                        logger_core::Level::Info,
                        "connection",
                        format!("Signal {signal:?} received"),
                    );
                    return;
                }
                _ => continue,
            }
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
    InitCallback: FnOnce(Result<String, String>) + Send + 'static,
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
                    let mut listener = Disposable::new(SocketListener::new());
                    runtime.block_on(listener.listen_on_socket(init_callback));
                }
                Err(err) => init_callback(Err(err.to_string())),
            };
        })
        .expect("Thread spawn failed. Cannot report error because callback was moved.");
}
