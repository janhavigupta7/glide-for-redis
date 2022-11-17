#![cfg_attr(not(unix), allow(unused_imports))]
use std::path::Path;
#[cfg(unix)]
use tokio::net::UnixListener;
#[cfg(unix)]
use tokio_stream::wrappers::UnixListenerStream;
#[cfg(unix)]
use tonic::transport::server::UdsConnectInfo;
use tonic::{transport::Server, Request, Response, Status};
use redis::{self, RedisError, Client};
use redis::aio::MultiplexedConnection;
use redis::{RedisResult};
use redis::AsyncCommands;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{RwLock, Mutex};
use tokio::runtime::Builder;
pub mod hello_world {
    tonic::include_proto!("grpcbabushka");
}
use std::{io, thread};
use tokio::task;

use hello_world::{
    greeter_server::{Greeter, GreeterServer},
    GetReply, GetRequest, SetReply, SetRequest,
    ConnectRequest, ConnectReply
};
use std::rc::Rc;
#[derive(Default)]
pub struct MyGreeter {
    client_server_map: Arc<RwLock<HashMap<String, Arc<MultiplexedConnection>>>>,
}

impl MyGreeter {
    fn new() -> Self {
        let client_server_map: Arc<RwLock<HashMap<String, Arc<MultiplexedConnection>>>> = Arc::new(RwLock::new(HashMap::new()));
        MyGreeter {
            client_server_map
        }
    }
}


#[tonic::async_trait]
impl Greeter for MyGreeter {
    async fn get(
        &self,
        request: Request<GetRequest>,
    ) -> Result<Response<GetReply>, Status> {
        let borrow_request = request.into_inner();
        let client_id = borrow_request.client_id.clone();
        let client_map = self.client_server_map.read().await;
        let connection: Arc<MultiplexedConnection> = match client_map.get(&client_id.clone()) {
            Some(conn) => conn.clone(),
            None => panic!("didn't find any connection for client id {}", client_id)
        };
        let mut connection = (*connection).clone();

        let key = borrow_request.key.clone();
        let res: Option<Vec<u8>> = connection.get(key).await.unwrap();
        let ret = match res {
            Some(result_bytes) => result_bytes,
            None => "None".into()
        };
        let reply = hello_world::GetReply {
            value: std::str::from_utf8(&ret).unwrap().into(),
        };
        Ok(Response::new(reply))
    }

    async fn set(
        &self,
        request: Request<SetRequest>,
    ) -> Result<Response<SetReply>, Status> {
        let borrow_request = request.into_inner();
        let client_id = borrow_request.client_id.clone();
        let client_map = self.client_server_map.read().await;
        let connection: Arc<MultiplexedConnection> = match client_map.get(&client_id.clone()) {
            Some(conn) => conn.clone(),
            None => panic!("didn't find any connection for client id {}", client_id)
        };
        let mut connection = (*connection).clone();
        let key = borrow_request.key;
        let value = borrow_request.value;
        let _: redis::Value =  match connection.set(key, value).await {
            Ok(_msg) => _msg,
            Err(e) => panic!("{}", e)
        };
        let reply = hello_world::SetReply {
            response: "OK".into(),
        };
        Ok(Response::new(reply))
    }


    async fn connect_server(
        &self,
        request: Request<ConnectRequest>,
    ) -> Result<Response<ConnectReply>, Status> {
        let borrow_request = request.into_inner();

        let client = Client::open(borrow_request.server_address).unwrap();
        let connection = match client.get_multiplexed_async_connection().await {
            Ok(conn) => conn,
            Err(e) => panic!("{}", e)
        };
        let mut client_map = self.client_server_map.write().await;
        let client_id: String = client_map.keys().len().to_string();
        client_map.insert(client_id.clone(), Arc::new(connection));

        let reply = hello_world::ConnectReply {
            client_id: client_id,
        };
        Ok(Response::new(reply))
    }

}


async fn run_test() -> Result<(), Box<dyn std::error::Error>> 
    {
    let path = "/tmp/tonic/helloworld";

    tokio::fs::create_dir_all(Path::new(path).parent().unwrap()).await?;

    let greeter = MyGreeter::default();
    println!("here!1");

    let uds = UnixListener::bind(path)?;
    let uds_stream = UnixListenerStream::new(uds);
    let local = task::LocalSet::new();
    println!("here!2");

    local.run_until(async move {Server::builder()
        .add_service(GreeterServer::new(greeter))
        .serve_with_incoming(uds_stream)
        .await.unwrap();
        println!("here!3");
    }).await;
    println!("here!4");

    Ok(())
}
#[cfg(unix)]
fn main() {
    println!("here!1");
    // thread::Builder::new()
    // .name("grpc_thread".to_string())
    // .spawn(move || {
        println!("here!1");

        let runtime = Builder::new_current_thread()
            .enable_all()
            .thread_name("grpc_thread")
            .build();
        match runtime {
            Ok(runtime) => {
                match runtime.block_on(run_test()) {
                    Ok(msg) => println!("OK!"),
                    Err(err) => panic!("failed: {}", err)
                }
            },
            Err(err) => {
                panic!("failed init runtime: {}", err)
            }
        };
    // })
    // .expect("Thread spawn failed. Cannot report error because callback was moved.");

}

#[cfg(not(unix))]
fn main() {
    panic!("The `uds` example only works on unix systems!");
}



async fn run<InitCallback>(init_callback: Rc<InitCallback>) -> Result<(), Box<dyn std::error::Error>> 
    where
    InitCallback: Fn(Result<String, RedisError>) + Send + 'static,
    {
    let path = "/tmp/tonic/helloworld";

    tokio::fs::create_dir_all(Path::new(path).parent().unwrap()).await?;
    let greeter = MyGreeter::default();

    let uds = UnixListener::bind(path)?;
    let uds_stream = UnixListenerStream::new(uds);
    init_callback(Ok(path.to_string()));
    let local = task::LocalSet::new();
    local.run_until(async move {Server::builder()
        .add_service(GreeterServer::new(greeter))
        .serve_with_incoming(uds_stream)
        .await.unwrap();}).await;

    Ok(())
}

pub fn start_grpc_listener<InitCallback>(init_callback: InitCallback)
where
    InitCallback: Fn(Result<String, RedisError>) + Send + 'static,
{
    thread::Builder::new()
    .name("grpc_thread".to_string())
    .spawn(move || {
        let runtime = Builder::new_current_thread()
            .enable_all()
            .thread_name("grpc_thread")
            .build();
        match runtime {
            Ok(runtime) => {
                match runtime.block_on(run(Rc::new(init_callback))) {
                    Ok(msg) => println!("OK!"),
                    Err(err) => panic!("failed: {}", err)
                }
            },
            Err(err) => {
                panic!("failed init runtime: {}", err)
            }
        };
    })
    .expect("Thread spawn failed. Cannot report error because callback was moved.");
}
