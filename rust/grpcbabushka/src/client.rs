#![cfg_attr(not(unix), allow(unused_imports))]

pub mod hello_world {
    tonic::include_proto!("grpcbabushka");
}

use hello_world::{greeter_client::GreeterClient, GetRequest, SetRequest, ConnectRequest};
use std::convert::TryFrom;
#[cfg(unix)]
use tokio::net::UnixStream;
use tonic::transport::{Endpoint, Uri};
use tower::service_fn;
use std::rc::Rc;
use std::borrow::Borrow;
pub struct Babushka {
    client: GreeterClient<tonic::transport::Channel>,
    client_id: Rc<String>
}

impl Babushka {
    async fn new() -> Self {
        let channel = Endpoint::try_from("http://[::]:50051").unwrap()
        .connect_with_connector(service_fn(|_: Uri| {
            let path = "/tmp/tonic/helloworld";

            // Connect to a Uds socket
            UnixStream::connect(path)
        }))
        .await.unwrap();
        let mut client = GreeterClient::new(channel);

        let connect_request = tonic::Request::new(ConnectRequest {
            server_address: "redis://localhost:6379".into(),
        });

        let conn_response = client.connect_server(connect_request).await.unwrap().into_inner();
        let client_id = Rc::new(conn_response.client_id);
        Babushka {
            client,
            client_id
        }
    }

    async fn get(&mut self, key: String) -> Result<String, Box<dyn std::error::Error>> {
        let get_request = tonic::Request::new(GetRequest {
            client_id: self.client_id.to_string(),
            key: key.into()
        });
        Ok(self.client.get(get_request).await?.into_inner().value)
    }

    async fn set(&mut self, key: String, value: String) -> Result<String, Box<dyn std::error::Error>> {
        let set_request = tonic::Request::new(SetRequest {
            client_id: self.client_id.to_string(),
            key: key.into(),
            value: value.into(),
        });
        Ok(self.client.set(set_request).await?.into_inner().response)
    }

}

#[cfg(unix)]
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // We will ignore this uri because uds do not use it
    // if your connector does use the uri it will be provided
    // as the request to the `MakeConnection`.

    let mut c = Babushka::new().await;
    let res = c.set("foo".into(), "barnewnew".into()).await.unwrap();
    println!("got {}", res);
    let res = c.get("foo".into()).await.unwrap();
    println!("got {}", res);
    Ok(())
}

#[cfg(not(unix))]
fn main() {
    panic!("The `uds` example only works on unix systems!");
}
