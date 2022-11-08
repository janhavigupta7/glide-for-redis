from email.base64mime import header_length
from enum import Enum
import logging
import socket
import socketserver
import sys
import asyncio
import async_timeout
from typing import Awaitable, Optional
from pybushka.commands.core import CoreCommands
from pybushka.config import ClientConfiguration
from pybushka.utils import to_url

from .pybushka import AsyncClient, start_socket_listener_external, REQ_GET, REQ_SET, REQ_ADDRESS, RES_NULL, RES_STRING, HEADER_LENGTH_IN_BYTES

LOGGER = logging.getLogger(__name__)
    
class RedisAsyncFFIClient(CoreCommands):
    @classmethod
    async def create(cls, config: ClientConfiguration = None):
        config = config or ClientConfiguration.get_default_config()
        self = RedisAsyncFFIClient()
        self.config = config
        self.connection = await self._create_multiplexed_conn()
        self.rust_functions = self._initialize_functions([CoreCommands])
        return self

    def _initialize_functions(self, classes):
        funcs = dict()
        for cls in classes:
            for method in dir(cls):
                if not method.startswith("__"):
                    try:
                        func = getattr(self.connection, method)
                        funcs[method] = func
                    except AttributeError:
                        # The connection doesn't have this method
                        pass
        return funcs

    async def _create_multiplexed_conn(self):
        return await AsyncClient.create_client(to_url(**self.config.config_args))

    async def execute_command(self, command, *args, **kwargs):
        conn_rust_func = self.rust_functions.get(command)
        return await conn_rust_func(*args, **kwargs)

    def create_pipeline(self):
        return self.connection.create_pipeline()


class RedisAsyncSocketClient(CoreCommands):
    @classmethod
    async def create(cls, config: ClientConfiguration = None, socket_connect_timeout=1):
        config = config or ClientConfiguration.get_default_config()
        self = RedisAsyncSocketClient()
        self.config = config
        self.callback_index = 1
        self.socket_connect_timeout = socket_connect_timeout
        self.write_buffer = bytearray(1024)
        self.read_buffer = bytearray(1024)
        self._should_close = False
        # Get the current event loop.
        loop = asyncio.get_running_loop()
        self.loop = loop
        # Create a new Future object.
        fut = loop.create_future()
        self._init_future = fut
        self._done_init = False
        print(" future: ", self._init_future)
        self.availableFutures: dict[int, Awaitable[Optional[str]]] = {} 
        def init_callback(socket_path: Optional[str], err: Optional[str]):
            print("callback called!")
            if err is not None:
                raise(f"Failed to initialize the socket connection: {str(err)}")
            elif socket_path is None:
                raise("Recieved None as the socket_path")
            else:
                print("callback: Received path: ", socket_path)
                self.socket_path = socket_path
                self._done_init = True
        start_socket_listener_external(
            init_callback=init_callback
        )
        
        print("awaiting for future...")
        await asyncio.wait_for(self.wait_for_init_complete(), 5)
        print("future completed!")
        await self._create_uds_connection(self.socket_path, None)
        server_url = to_url(**self.config.config_args)
        print(f"setting address={server_url}")
        res_future = await self._set_address(server_url)
        print("waiting to read")
        await self.wait_for_data()
        assert res_future.result() is None
        return self

    async def wait_for_init_complete(self):
        while not self._done_init:
            asyncio.sleep(0.1)
    
    async def _create_uds_connection(self, socket_path: Optional[str], err: Optional[str]):
            try:
                print("Python connecting to UDS")
                async with async_timeout.timeout(self.socket_connect_timeout):
                    reader, writer = await asyncio.open_unix_connection(path=self.socket_path)
                self._reader = reader
                self._writer = writer
                print("Python: Connected!")
            except Exception as e:
                print(str(e))
                self.close()
                raise
            
        
    def close_socket(self, err=""):
        print(f"Closing socket {err}")

    def _get_header_length(self, num_of_strings: int) -> int:
        return HEADER_LENGTH_IN_BYTES + 4*(num_of_strings - 1)
    
    async def _set_address(self, address):
        return await self._write_to_socket(REQ_ADDRESS, address)

    async def execute_command(self, command, *args, **kwargs):
        pass

    def _write_int_to_socket(self, int_arg, bytes_offset, length=4, byteorder="little"):
        bytes_end = bytes_offset + length
        self.write_buffer[bytes_offset:bytes_end] = (int_arg).to_bytes(length=length, byteorder=byteorder)

    def _write_header(self, callback_index, message_length, header_len, operation_type, args_len):
        self._write_int_to_socket(message_length, 0)
        self._write_int_to_socket(callback_index, 4)
        self._write_int_to_socket(operation_type, 8)
        if len(args_len) > 1:
            bytes_offset = 12
            for i in range(0..len(args_len)-1):
                self._write_int_to_socket(args_len[i], 0)
                bytes_offset += 4


    async def _write_to_socket(self, operation_type, *args, **kwargs):
        callback_index = self.callback_index
        self.callback_index += 1
        header_len = self._get_header_length(len(args))
        args_len = []
        bytes_offest = header_len
        for arg in args:
            b_arg = arg.encode('UTF-8')
            arg_len = len(b_arg)
            args_len.append(arg_len)
            end_pos = bytes_offest + arg_len
            self.write_buffer[bytes_offest:end_pos] = b_arg
            bytes_offest = end_pos

        message_length = header_len + sum(len for len in args_len)
        self._write_header(callback_index, message_length, header_len, operation_type, args_len)
        print(f'Send: {self.write_buffer[0:message_length]!r}')
        self._writer.write(self.write_buffer[0:message_length])
        await self._writer.drain()
        response_future = asyncio.Future()
        self.availableFutures.update({callback_index: response_future})
        return response_future

    async def wait_for_data(self):
        # print("waiting for data")
        # while not self._should_close:
        print("waiting...")
        data = await asyncio.wait_for(self._reader.read(HEADER_LENGTH_IN_BYTES), 10)
        await self._handle_read_data(data)
    
    def _parse_header(self, data):
        assert len(data) == HEADER_LENGTH_IN_BYTES
        msg_length = int.from_bytes(data[0:4], "little")
        callback_idx = int.from_bytes(data[4:8], "little")
        requset_type = int.from_bytes(data[8:12], "little")
        return msg_length, callback_idx, requset_type
        
    async def _handle_read_data(self, data):
        print("Got data!")
        # length, callback_idx, type = self._to_header(data)
        # if length - HEADER_LENGTH_IN_BYTES > 0:
        # message = await self._reader.read(length - HEADER_LENGTH_IN_BYTES)
        length, callback_idx, type = self._parse_header(data)
        print(f"recieved valus: {length}, {callback_idx}, {type}")
        response = None
        if type == RES_NULL:
            print("type is none")
            response = None
        elif type == RES_STRING:
            print("type is string")
            msg_length = length - HEADER_LENGTH_IN_BYTES
            if msg_length > 0:
                print("start waiting for message")
                message = await self._reader.read(msg_length)
                response = message.decode('UTF-8')
                print(f"Got message! {response}")
        self.availableFutures.get(callback_idx).set_result(response)
        
