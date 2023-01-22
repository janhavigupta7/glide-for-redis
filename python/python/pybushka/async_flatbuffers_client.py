import asyncio
from typing import Awaitable, Optional, Type
import sys
sys.path.append("/home/ubuntu/babushka/python/python/pybushka")
import async_timeout
from pybushka.commands.core import CoreCommands
from pybushka.config import ClientConfiguration
from pybushka.utils import to_url
import flatbuffers
import Request.Babushka.Request
import Response.Babushka.Response

from .pybushka import (
    HEADER_LENGTH_IN_BYTES,
    PyRequestType,
    PyResponseType,
    start_socket_listener_external,
)

HEADER_LEN = 4

class RedisAsyncFlatbuffersClient(CoreCommands):
    @classmethod
    async def create(cls, config: ClientConfiguration = None):
        config = config or ClientConfiguration.get_default_config()
        self = RedisAsyncFlatbuffersClient()
        self.config: Type[ClientConfiguration] = config
        self.socket_connect_timeout = config.config_args.get("connection_timeout")
        self.write_buffer: bytearray = bytearray(1024)
        self._availableFutures: dict[int, Awaitable[Optional[str]]] = {}
        self._availableCallbackIndexes: set[int] = set()
        self._availableBuilders = set()
        self._lock = asyncio.Lock()
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
        start_socket_listener_external(init_callback=init_callback)

        # Wait for the socket listener to complete its initialization
        await init_future
        # Create UDS connection
        await self._create_uds_connection()
        # Start the reader loop as a background task
        self._reader_task = asyncio.create_task(self._reader_loop())
        server_url = to_url(**self.config.config_args)
        # Set the server address
        await self.execute_command(PyRequestType.ServerAddress, server_url)
        return self

    async def _wait_for_init_complete(self):
        while not self._done_init:
            await asyncio.sleep(0.1)

    async def _create_uds_connection(self):
        try:
            # Open an UDS connection
            async with async_timeout.timeout(self.socket_connect_timeout):
                reader, writer = await asyncio.open_unix_connection(
                    path=self.socket_path
                )
            self._reader = reader
            self._writer = writer
        except Exception as e:
            self.close(f"Failed to create UDS connection: {e}")
            raise

    def __del__(self):
        try:
            if self._reader_task:
                self._reader_task.cancel()
            pass
        except RuntimeError as e:
            if "no running event loop" in str(e):
                # event loop already closed
                pass

    def close(self, err=""):
        if err:
            for response_future in self._availableFutures.values():
                response_future.set_exception(err)
        self.__del__()

    def _get_header_length(self, num_of_args: int) -> int:
        return HEADER_LENGTH_IN_BYTES + 4 * (num_of_args - 1)

    def _create_fbs_request(self, callback_index, command_type, *args, **kwargs):
        # Use a `FlatBufferBuilder`, which will be used to create our request' FlatBuffers.
        builder = flatbuffers.Builder(1024)
        args_bytes = []
        for arg in args:
            arg_bytes = builder.CreateSharedString(arg)
            args_bytes.append(arg_bytes)
        Request.Babushka.Request.RequestStartArgVector(builder, len(args))
        for arg_b in reversed(args_bytes):
            builder.PrependSOffsetTRelative(arg_b)
        arg_vec = builder.EndVector(len(args))
        Request.Babushka.Request.RequestStart(builder)
        Request.Babushka.Request.RequestAddArg(builder, arg_vec)
        Request.Babushka.Request.RequestAddRequestType(builder, int(command_type))
        Request.Babushka.Request.RequestAddCallbackIdx(builder, callback_index)
        res = Request.Babushka.Request.RequestEnd(builder)
        builder.Finish(res)
        request_buf = builder.Output()  # Of type `bytearray`
        return request_buf
    
    async def execute_command(self, command_type, *args, **kwargs):
        callback_index = self._get_callback_index()
        request_buf = self._create_fbs_request(callback_index, command_type, *args, **kwargs)
        response_future = await self._write_to_socket(request_buf, callback_index)
        # print(f"executing command type {request.request_type}, with args {request.arg}")
        await response_future
        return response_future.result()

    async def set(self, key, value):
        return await self.execute_command(PyRequestType.SetString, key, value)

    async def get(self, key):
        return await self.execute_command(PyRequestType.GetString, key)

    def _write_int_to_buffer(self, int_arg, bytes_offset, length=4, byteorder="little"):
        bytes_end = bytes_offset + length
        self.write_buffer[bytes_offset:bytes_end] = (int_arg).to_bytes(
            length=length, byteorder=byteorder
        )

    def _get_callback_index(self):
        if not self._availableCallbackIndexes:
            # Set is empty
            return len(self._availableFutures) + 1
        return self._availableCallbackIndexes.pop()
    
    def _get_fbs_builder(self):
        if not self._availableBuilders:
            # Set is empty
            return flatbuffers.Builder(1024)
        return self._availableBuilders.pop()

    async def _write_to_socket(self, request, callback_index):
        async with self._lock:
            request_len = len(request)
            # Write the header to the buffer
            self._write_int_to_buffer(request_len, 0)
            # Write the request to the buffer
            self.write_buffer[HEADER_LEN:request_len+HEADER_LEN] = request
            # Create a response future for this reqest and add it to the available futures map
            response_future = asyncio.Future()
            self._writer.write(self.write_buffer[0:request_len+HEADER_LEN])
            await self._writer.drain()
            self._availableFutures.update({callback_index: response_future})
            return response_future

    async def _reader_loop(self):
        # Socket reader loop
        while True:
            try:
                data = await self._reader.readexactly(HEADER_LEN)
                # Parse the received header and wait for the rest of the message
                await self._handle_read_data(data)
            except asyncio.IncompleteReadError:
                self.close("The server closed the connection")

    async def _handle_read_data(self, data):
        msg_length = int.from_bytes(data[0:HEADER_LEN], "little")
        if msg_length > 0:
            message = await self._reader.readexactly(msg_length)
            response = Response.Babushka.Response.Response.GetRootAs(message, 0)
        else:
            raise Exception("got message with size 0")
        res_future = self._availableFutures.get(response.CallbackIdx())
        if not res_future:
            self.close("Got wrong callback index: {}", response.CallbackIdx())
        else:
            if response.Error() is not None:
                res_future.set_exception(response.Error())
            elif response.Response() is not None:
                res_future.set_result(response.Response().decode())
            else:
                res_future.set_result(None)
            self._availableCallbackIndexes.add(response.CallbackIdx())
