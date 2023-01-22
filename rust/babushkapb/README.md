1. For running node benchmark: Add to install_and_test::runNodeBenchmark
cp /home/ubuntu/babushka/node/src/compiled.js /home/ubuntu/babushka/node/build-ts/src/ 
2. execute ```cargo run``` in babushka/rust/babushkapb/, and take the printed path and past it to the include! in headers.rs and test_socket_listener.rs
3. to regenerate the auto generated protobuf file for node/python see the readme in each folder

### [Optional] Autogenerate flatbuffers files
1. Install flatc compiler, using the instructions in the first comment: https://stackoverflow.com/questions/55394537/how-to-install-flatc-and-flatbuffers-on-linux-ubuntu 
2. CD to `babushka/rust/src/socket_listener` and autogenerate flatbuffer files to Rust with:
   `flatc --rust /home/ubuntu/babushka/rust/babushkaflatbuffers/babushka_response.fbs /home/ubuntu/babushka/rust/babushkaflatbuffers/babushka_request.fbs`
