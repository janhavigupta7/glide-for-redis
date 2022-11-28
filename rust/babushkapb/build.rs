fn main() {
    protobuf_codegen::Codegen::new()
        .cargo_out_dir("proto")
        .include("src")
        .input("src/proto/babushkaproto.proto")
        .run_from_script();
}
