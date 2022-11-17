from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class ConnectReply(_message.Message):
    __slots__ = ["client_id"]
    CLIENT_ID_FIELD_NUMBER: _ClassVar[int]
    client_id: str
    def __init__(self, client_id: _Optional[str] = ...) -> None: ...

class ConnectRequest(_message.Message):
    __slots__ = ["server_address"]
    SERVER_ADDRESS_FIELD_NUMBER: _ClassVar[int]
    server_address: str
    def __init__(self, server_address: _Optional[str] = ...) -> None: ...

class GetReply(_message.Message):
    __slots__ = ["value"]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    value: str
    def __init__(self, value: _Optional[str] = ...) -> None: ...

class GetRequest(_message.Message):
    __slots__ = ["client_id", "key"]
    CLIENT_ID_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    client_id: str
    key: str
    def __init__(self, client_id: _Optional[str] = ..., key: _Optional[str] = ...) -> None: ...

class SetReply(_message.Message):
    __slots__ = ["response"]
    RESPONSE_FIELD_NUMBER: _ClassVar[int]
    response: str
    def __init__(self, response: _Optional[str] = ...) -> None: ...

class SetRequest(_message.Message):
    __slots__ = ["client_id", "key", "value"]
    CLIENT_ID_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    client_id: str
    key: str
    value: str
    def __init__(self, client_id: _Optional[str] = ..., key: _Optional[str] = ..., value: _Optional[str] = ...) -> None: ...
