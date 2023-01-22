Using [Pyo3](https://github.com/PyO3/pyo3) and [Maturin](https://github.com/PyO3/maturin).

### Create venv
`python -m venv .env` in order to create a new virtual env.

### Source venv

`source .env/bin/activate` in order to enter virtual env.

### Build

`maturin develop` to build rust code and create python wrapper.

### [Optional] Build for release

`maturin develop --release` to build rust code optimized for release and create python wrapper.

### [Optional] Autogenerate flatbuffers files
1. Install flatc compiler, using the instructions in the first comment: https://stackoverflow.com/questions/55394537/how-to-install-flatc-and-flatbuffers-on-linux-ubuntu 
2. CD to `babushka/python/python/pybushka` and autogenerate python's flatbuffer files with:
   `flatc --python /home/ubuntu/babushka/rust/babushkaflatbuffers/babushka_response.fbs /home/ubuntu/babushka/rust/babushkaflatbuffers/babushka_request.fbs`
3. CD to `babushka/rust/src/socket_listener` and autogenerate flatbuffer files to Rust with:
   `flatc --rust /home/ubuntu/babushka/rust/babushkaflatbuffers/babushka_response.fbs /home/ubuntu/babushka/rust/babushkaflatbuffers/babushka_request.fbs`
4. Run flatbuffer test:
   `pytest --asyncio-mode=auto ~/babushka/python/python/tests/test_async_client.py::TestFlatbuffersClient -s`

### [Optional] Autogenerate protobuf files
Install protobuf compoler, for ubuntu:
`sudo apt install protobuf-compiler`
Autogenerate python's protobuf files with:
`protoc -IPATH=/home/ubuntu/babushka/rust/babushkapb/src/proto/ --python_out=/home/ubuntu/babushka/python /home/ubuntu/babushka/rust/babushkapb/src/proto/babushkaproto.proto`
Run protobuf test:
`pytest --asyncio-mode=auto /home/ubuntu/babushka/python/pyton/tests/test_async_client.py::TestProtobufClient -s`

### Running tests

Run `pytest --asyncio-mode=auto` from this folder, or from the `tests` folder. Make sure your shell uses your virtual environment.
