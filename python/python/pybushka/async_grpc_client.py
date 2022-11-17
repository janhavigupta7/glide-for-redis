import sys
from typing import Optional
sys.path.append("/home/ubuntu/babushka/python/python/pybushka")
import grpc
import grpcbabushka_pb2
import grpcbabushka_pb2_grpc
import asyncio
import logging
from config import ClientConfiguration
from utils import to_url
from .pybushka import start_grpc_listener_external

class RedisAsyncGRPCClient:
    @classmethod
    async def create(cls, config: ClientConfiguration = None):
        self = RedisAsyncGRPCClient()
        self.config = config or ClientConfiguration.get_default_config()
        self.server_url = to_url(**self.config.config_args)
        
        init_future = asyncio.Future()
        loop = asyncio.get_event_loop()

        def init_callback(socket_path: Optional[str], err: Optional[str]):
            if err is not None:
                raise (f"Failed to initialize the socket connection: {str(err)}")
            elif socket_path is None:
                raise ("Received None as the socket_path")
            else:
                # Received socket path
                self.socket_path = socket_path
                loop.call_soon_threadsafe(init_future.set_result, True)

        start_grpc_listener_external(init_callback=init_callback)
        # Wait for the socket listener to complete its initialization
        await init_future

        channel =  grpc.aio.insecure_channel("unix://"+self.socket_path, options=[("SingleThreadedUnaryStream",1)])
        stub = grpcbabushka_pb2_grpc.GreeterStub(channel)
        response = await stub.ConnectServer(
            grpcbabushka_pb2.ConnectRequest(server_address=self.server_url))
        self.client_id = response.client_id
        self.stub = stub
        #logging.info('Received: %s', response.client_id)  
        return self
    
    async def get(self, key: str):
        return await self.stub.Get(
            grpcbabushka_pb2.GetRequest(client_id=self.client_id, key=key))
        #logging.info('Received: %s', response.value)
        
    async def set(self, key: str, value: str):
        return await self.stub.Set(
            grpcbabushka_pb2.SetRequest(client_id=self.client_id, key=key, value=value))
        #logging.info('Received: %s', response.response)
        
async def run() -> None:    
    grc_client = await RedisAsyncGRPCClient.create()
    await grc_client.set("foo", "barbara")
    await grc_client.get("foo")


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run())
