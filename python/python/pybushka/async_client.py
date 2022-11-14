import logging
import asyncio
import async_timeout
from typing import Awaitable, Optional
from pybushka.commands.core import CoreCommands
from pybushka.config import ClientConfiguration
from pybushka.utils import to_url

from .pybushka import AsyncClient, start_socket_listener_external, REQ_GET, \
    REQ_SET, REQ_ADDRESS, RES_NULL, RES_STRING, HEADER_LENGTH_IN_BYTES

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
    async def create(cls, config: ClientConfiguration = None):
        config = config or ClientConfiguration.get_default_config()
        self = RedisAsyncSocketClient()
        self.config = config
        self.callback_index = 1
        self.socket_connect_timeout = config.config_args.get("connection_timeout")
        self.write_buffer = bytearray(1024)
        self.read_buffer = bytearray(1024)
        self.availableFutures: dict[int, Awaitable[Optional[str]]] = {} 
        self._lock = asyncio.Lock()
        self._done_init = False
        def init_callback(socket_path: Optional[str], err: Optional[str]):
            if err is not None:
                raise(f"Failed to initialize the socket connection: {str(err)}")
            elif socket_path is None:
                raise("Recieved None as the socket_path")
            else:
                # Recieved socket path
                self.socket_path = socket_path
                self._done_init = True
        start_socket_listener_external(
            init_callback=init_callback
        )
        
        # Wait for the socket listener to complete its initialization
        await asyncio.wait_for(self._wait_for_init_complete(), self.socket_connect_timeout)
        await self._create_uds_connection()
        # Start the reader loop as a background task
        self.reader_task = asyncio.create_task(self._reader_loop())
        server_url = to_url(**self.config.config_args)
        # Set the server address
        await self._set_address(server_url)
        return self

    async def _wait_for_init_complete(self):
        while not self._done_init:
            await asyncio.sleep(0.1)
    
    async def _create_uds_connection(self):
            try:
                # Open an UDS connection
                async with async_timeout.timeout(self.socket_connect_timeout):
                    reader, writer = await asyncio.open_unix_connection(path=self.socket_path)
                self._reader = reader
                self._writer = writer
            except Exception as e:
                print(str(e))
                self.close()
                raise
            
    def __del__(self):
        if self.reader_task:
            self.reader_task.cancel()

    def close(self, err=""):
        self.__del__()

    def _get_header_length(self, num_of_args: int) -> int:
        return HEADER_LENGTH_IN_BYTES + 4*(num_of_args - 1)
    
    async def execute_command(self, command, *args, **kwargs):
        response_future = await self._write_to_socket(command, *args, **kwargs)
        await response_future
        return response_future.result()
    
    async def _set_address(self, address):
        return await self.execute_command(REQ_ADDRESS, address)

    async def set(self, key, value):
        return await self.execute_command(REQ_SET, key, value)
    
    async def get(self, key):
        return await self.execute_command(REQ_GET, key)

    def _write_int_to_socket(self, int_arg, bytes_offset, length=4, byteorder="little"):
        bytes_end = bytes_offset + length
        self.write_buffer[bytes_offset:bytes_end] = (int_arg).to_bytes(length=length, byteorder=byteorder)

    def _write_header(self, callback_index, message_length, header_len, operation_type, args_len_array):
        self._write_int_to_socket(message_length, 0)
        self._write_int_to_socket(callback_index, 4)
        self._write_int_to_socket(operation_type, 8)
        # Except for the last argument, which can be calculated from the message length 
        # minus all other arguments + header, write the length of all additional arguments
        num_of_args = len(args_len_array)
        if num_of_args > 1:
            bytes_offset = 12
            for i in range(num_of_args-1):
                self._write_int_to_socket(args_len_array[i], bytes_offset)
                bytes_offset += 4


    async def _write_to_socket(self, operation_type, *args, **kwargs):
        async with self._lock:
            callback_index = self.callback_index
            self.callback_index += 1
            header_len = self._get_header_length(len(args))
            args_len_array = []
            bytes_offest = header_len
            for arg in args:
                arg_in_bytes = arg.encode('UTF-8')
                arg_len = len(arg_in_bytes)
                # Adds the argument length to the array so we can add it to the header later
                args_len_array.append(arg_len)
                end_pos = bytes_offest + arg_len
                # Write the arguement tot the buffer
                self.write_buffer[bytes_offest:end_pos] = arg_in_bytes
                bytes_offest = end_pos

            message_length = header_len + sum(len for len in args_len_array)
            # Write the header to the buffer
            self._write_header(callback_index, message_length, header_len, operation_type, args_len_array)
            self._writer.write(self.write_buffer[0:message_length])
            await self._writer.drain()
            # Create a response future for this reqest and add it to the available futures map
            response_future = asyncio.Future()
            self.availableFutures.update({callback_index: response_future})
            return response_future

    async def _reader_loop(self):
        # Socket reader loop
        while True:
            data = await self._reader.read(HEADER_LENGTH_IN_BYTES)
            if len(data) != HEADER_LENGTH_IN_BYTES:
                if len(data)== 0:
                    self.close("The server closed the connection")
                else:
                    self.close(f"Recieced wrong number of bytes: {data}")
                break
            # Parse the recieved header and wait for the rest of the message
            await self._handle_read_data(data)
    
    def _parse_header(self, data):
        msg_length = int.from_bytes(data[0:4], "little")
        callback_idx = int.from_bytes(data[4:8], "little")
        requset_type = int.from_bytes(data[8:12], "little")
        return msg_length, callback_idx, requset_type
        
    async def _handle_read_data(self, data):
        length, callback_idx, type = self._parse_header(data)
        response = None
        if type == RES_NULL:
            response = None
        elif type == RES_STRING:
            msg_length = (length - HEADER_LENGTH_IN_BYTES)
            if msg_length > 0:
                offset =  msg_length % 4
                if offset != 0:
                    msg_length += (4 - offset)
                # Wait for the rest of the message
                message = await self._reader.read(msg_length)
                response = message.decode('UTF-8')
            else:
                response = ""
        res_future = self.availableFutures.get(callback_idx)
        if not res_future:
            raise Exception(f"found invalid callback index: {callback_idx}")
        else:
            res_future.set_result(response)
        
