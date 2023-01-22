import asyncio
import random
import string
from datetime import datetime
import sys
import redis
import pytest
import redis.asyncio as redispy


def get_random_string(length):
    letters = string.ascii_letters + string.digits + string.punctuation
    result_str = "".join(random.choice(letters) for i in range(length))
    return result_str

import flatbuffers
import pybushka.Request.Babushka.Request
import pybushka.Response.Babushka.Response
@pytest.mark.asyncio
class TestFlatbuffersClient:
    def test_request_flutbuffers(self):
        builder = flatbuffers.Builder(100)
        all_args = [["foo1", "bar1", "bar"], ["foo2", "bar2"]]

        for i in range(2):
            args = all_args[i]
            command_type = 1
            callback_index = 3
            args_bytes = []
            for arg in args:
                arg_bytes = builder.CreateString(arg)
                args_bytes.append(arg_bytes)
            pybushka.Request.Babushka.Request.RequestStartArgVector(builder, len(args))
            for arg_b in reversed(args_bytes):
                builder.PrependSOffsetTRelative(arg_b)
            arg_vec = builder.EndVector(len(args))
            pybushka.Request.Babushka.Request.RequestStart(builder)
            pybushka.Request.Babushka.Request.RequestAddArg(builder, arg_vec)
            pybushka.Request.Babushka.Request.RequestAddRequestType(builder, int(command_type))
            pybushka.Request.Babushka.Request.RequestAddCallbackIdx(builder, callback_index)
            res = pybushka.Request.Babushka.Request.RequestEnd(builder)
            builder.Finish(res)
            request_buf = builder.Output()  # Of type `bytearray`
            print(request_buf)
            parsed_req = pybushka.Request.Babushka.Request.Request.GetRootAs(request_buf, 0)
            assert parsed_req.CallbackIdx() == callback_index
            print(type(parsed_req.Arg))
            parsed_req.Arg()
            for i in range(len(args)):
                assert parsed_req.Arg(i).decode() == args[i]
            assert parsed_req.RequestType() == command_type
        
    def test_response_flutbuffers(self):
        resp = "OK"
        callback_index = 3
        builder = flatbuffers.Builder(100)
        resp_bytes = builder.CreateString(resp)
        pybushka.Response.Babushka.Response.ResponseStart(builder)
        pybushka.Response.Babushka.Response.ResponseAddCallbackIdx(builder, callback_index)
        pybushka.Response.Babushka.Response.ResponseAddResponse(builder, resp_bytes)
        res = pybushka.Response.Babushka.Response.ResponseEnd(builder)
        builder.Finish(res)
        response_buf = builder.Output()  # Of type `bytearray`
        parsed_response = pybushka.Response.Babushka.Response.Response.GetRootAs(response_buf, 0)
        assert parsed_response.Response().decode() == resp
        assert parsed_response.CallbackIdx() == callback_index
        assert parsed_response.Error() == None
        builder.Clear

    async def test_set_get(self, async_flatbuffers_client):
        key = get_random_string(5)
        value = datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
        value = 'b' * 1000000
        #print(key, value)
        assert await async_flatbuffers_client.set(key, value) is None
        assert await async_flatbuffers_client.get(key) == value
        #print("2")
    async def test_set_get_redispy(self):
        r = await redispy.Redis(host="localhost", port=6379, decode_responses=True)
        key = get_random_string(5)
        value = datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
        value = 'b' * 1000000
        #print(value)
        assert await r.set(key, value) is True
        assert await r.get(key) == value


    #@pytest.mark.parametrize("value_size", [100, 2**16])
    @pytest.mark.parametrize("value_size", [5])
    async def test_concurrent_tasks(self, async_flatbuffers_client, value_size):
        num_of_concurrent_tasks = 100
        running_tasks = set()

        async def exec_command(i):
            for j in range(200):
                value = get_random_string(value_size)
                key = str(i)+str(j)
                #print(f"set({key}")
                await async_flatbuffers_client.set(key, value)
                assert await async_flatbuffers_client.get(key) == value

        for i in range(num_of_concurrent_tasks):
            task = asyncio.create_task(exec_command(i))
            running_tasks.add(task)
            task.add_done_callback(running_tasks.discard)
        await asyncio.gather(*(list(running_tasks)))
        #print("2")
# sys.path.append("/home/ubuntu/babushka/python/PATH")
# from babushkaproto_pb2 import Response as babushkaResponse
# from babushkaproto_pb2 import CommandReply, StrResponse, RepStrResponse
# from google.protobuf.json_format import MessageToDict
# from protobuf_to_dict import protobuf_to_dict
# from protobuf_decoder.protobuf_decoder import Parser
# @pytest.mark.asyncio
# class TestProtobufClient:
#     def test_protobuf(self):
#         rep1 = RepStrResponse()
#         rep1.arg.extend(["bar1", "bar2", "bar3"])
#         print(type(rep1.arg))
#         rep = CommandReply()
#         rep.resp1.arg = "barbara"
#         rep.callback_idx = 1
#         #rep.resp1 = str_res
#         print(MessageToDict(rep.resp1, preserving_proto_field_name=True).get("arg"))
#         response = babushkaResponse()
#         slot = response.slot.add()
#         slot.start_range = 0
#         slot.end_range = 10
#         node1 = slot.node.add()
#         node1.address = "localhost1"
#         node2 = slot.node.add()
#         node2.address = "localhost2"
#         ser = response.SerializeToString()
#         res = babushkaResponse().FromString(ser)
#         dict_obj = MessageToDict(res)
#         res = protobuf_to_dict(res)
#         print(type(res))
#         print(res)
#         print(type(dict_obj))
#         print(dict_obj)
#         # print(type(res.slot))
#         # print(res.slot)
#         # print(type(list(res.slot)))
        


    # @pytest.mark.parametrize("value_size", [100, 2**16])
    # async def test_concurrent_tasks(self, async_protobuf_client, value_size):
    #     num_of_concurrent_tasks = 20
    #     running_tasks = set()

    #     async def exec_command(i):
    #         value = get_random_string(value_size)
    #         await async_protobuf_client.set(str(i), value)
    #         assert await async_protobuf_client.get(str(i)) == value

    #     for i in range(num_of_concurrent_tasks):
    #         task = asyncio.create_task(exec_command(i))
    #         running_tasks.add(task)
    #         task.add_done_callback(running_tasks.discard)
    #     await asyncio.gather(*(list(running_tasks)))
        
@pytest.mark.asyncio
class TestSocketClient:
    async def test_set_get(self, async_socket_client):
        key = get_random_string(5)
        value = datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
        assert await async_socket_client.set(key, value) is None
        assert await async_socket_client.get(key) == value

    async def test_large_values(self, async_socket_client):
        length = 2**16
        key = get_random_string(length)
        value = get_random_string(length)
        assert len(key) == length
        assert len(value) == length
        await async_socket_client.set(key, value)
        assert await async_socket_client.get(key) == value

    async def test_non_ascii_unicode(self, async_socket_client):
        key = "foo"
        value = "שלום hello 汉字"
        assert value == "שלום hello 汉字"
        await async_socket_client.set(key, value)
        assert await async_socket_client.get(key) == value

    @pytest.mark.parametrize("value_size", [100, 2**16])
    async def test_concurrent_tasks(self, async_socket_client, value_size):
        num_of_concurrent_tasks = 20
        running_tasks = set()

        async def exec_command(i):
            value = get_random_string(value_size)
            await async_socket_client.set(str(i), value)
            assert await async_socket_client.get(str(i)) == value

        for i in range(num_of_concurrent_tasks):
            task = asyncio.create_task(exec_command(i))
            running_tasks.add(task)
            task.add_done_callback(running_tasks.discard)
        await asyncio.gather(*(list(running_tasks)))


@pytest.mark.asyncio
class TestCoreCommands:
    async def test_set_get(self, async_ffi_client):
        time_str = datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
        await async_ffi_client.set("key", time_str)
        result = await async_ffi_client.get("key")
        assert result == time_str


@pytest.mark.asyncio
class TestPipeline:
    async def test_set_get_pipeline(self, async_ffi_client):
        pipeline = async_ffi_client.create_pipeline()
        time_str = datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
        pipeline.set("pipeline_key", time_str)
        pipeline.get("pipeline_key")
        result = await pipeline.execute()
        assert result == ["OK", time_str]

    async def test_set_get_pipeline_chained_requests(self, async_ffi_client):
        pipeline = async_ffi_client.create_pipeline()
        time_str = datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
        result = (
            await pipeline.set("pipeline_key", time_str).get("pipeline_key").execute()
        )
        assert result == ["OK", time_str]

    async def test_set_with_ignored_result(self, async_ffi_client):
        pipeline = async_ffi_client.create_pipeline()
        time_str = datetime.now().strftime("%m/%d/%Y, %H:%M:%S")
        result = (
            await pipeline.set("pipeline_key", time_str, True)
            .get("pipeline_key")
            .execute()
        )
        assert result == [time_str]
