from email.base64mime import header_length
import logging
import socket
import socketserver
import sys
import asyncio
import async_timeout
from typing import Optional
from pybushka.commands.core import CoreCommands
from pybushka.config import ClientConfiguration
from pybushka.utils import to_url

from .pybushka import AsyncClient, start_socket_listener_external, REQ_GET, REQ_SET, REQ_ADDRESS, HEADER_LENGTH_IN_BYTES

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


class RedisAsyncUDSClient(CoreCommands):
    @classmethod
    async def create(cls, config: ClientConfiguration = None, socket_connect_timeout=1):
        config = config or ClientConfiguration.get_default_config()
        self = RedisAsyncUDSClient()
        self.config = config
        self.callback_index = 1
        self._init_future = asyncio.Future()
        self.socket_connect_timeout = socket_connect_timeout
        self.write_buffer = bytearray(1024)
        self.read_buffer = bytearray(1024)
        print(
            start_socket_listener_external(
                init_callback=self.init_connection,
            )
        )
        print("awaiting for future...")
        await self._init_future
        print("future completed!")
        return self

    def init_connection(self, socket_path: Optional[str], err: Optional[str]):
        print("init connection called")
        asyncio.run(self._create_uds_connection(socket_path, err))

    async def _create_uds_connection(self, socket_path: Optional[str], err: Optional[str]):
        print("Python: start function was called")
        if err:
            print(f"Failed to initialize the socket connection: {str(e)}")
            raise(f"Failed to initialize the socket connection: {str(e)}")
        elif socket_path is None:
            raise("Recieved None as the socket_path")
        else:
            self.socket_path = socket_path
            try:
                print("Python connecting to UDS")
                async with async_timeout.timeout(self.socket_connect_timeout):
                    reader, writer = await asyncio.open_unix_connection(path=self.socket_path)
                self._reader = reader
                self._writer = writer
                print("Python: Connected!")
                server_url = to_url(**self.config.config_args)
                print(f"setting address={server_url}")
                await self._set_address(server_url)
                self._init_future.set_result("connected!")
            except Exception as e:
                print(str(e))
                self.close()
                raise

    def close_socket(self, err=""):
        print(f"Closing socket {err}")
        self._writer.close()
        self._reader.close()

    def _get_header_length(num_of_strings: int) -> int:
        return HEADER_LENGTH_IN_BYTES + 4*(num_of_strings - 1)
    
    async def _set_address(self, address):
        print(f"REQ_ADDRESS:{REQ_ADDRESS}, type: {type(REQ_ADDRESS)}")
        await self._write_to_socket(REQ_ADDRESS, address)
        await self.read_from_socket() == None

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
            b_arg = arg.encode('utf-8')
            arg_len = len(b_arg)
            args_len.append(arg_len)
            end_pos = bytes_offest + arg_len
            self.write_buffer[bytes_offest:end_pos] = b_arg
            bytes_offest = end_pos

        message_length = header_len + sum(len for len in args_len)
        self._write_header(callback_index, message_length, header_len, operation_type, args_len)
        print(f'Send: {self.write_buffer!r}')
        self._writer.write(self.write_buffer[0:message_length])
        await self._writer.drain()

    async def read_from_socket(self):
        pass
