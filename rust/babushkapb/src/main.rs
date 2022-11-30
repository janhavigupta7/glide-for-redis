// use protobuf::{EnumOrUnknown, Message};
include!(concat!(env!("OUT_DIR"), "/proto/mod.rs"));


use babushkaproto::{CommandReply};

fn main() {
    // Encode example request
    let mut out_msg = CommandReply::new();
    out_msg.response = None;
    println!("{}", env!("OUT_DIR"));
    println!("{}", std::env::var("OUT_DIR").unwrap());
}
