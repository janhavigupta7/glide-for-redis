use std::io::Result;
fn main() -> Result<()> {
    prost_build::compile_protos(&["src/protobuf/pb_message.proto"], &["src/"])?;
    Ok(())
}
