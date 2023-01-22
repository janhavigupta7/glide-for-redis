use lifeguard::{RcRecycled, Pool};
use num_derive::{FromPrimitive, ToPrimitive};
use std::{ops::Range, rc::Rc};

extern crate flatbuffers;
 
// import the generated code
#[allow(dead_code, unused_imports)]
#[path = "./babushka_request_generated.rs"]
mod babushka_request_generated;
pub use babushka_request_generated::request::babushka::{Request, RequestArgs, root_as_request};
#[path = "./babushka_response_generated.rs"]
mod babushka_response_generated;
pub use babushka_response_generated::response::babushka::{Response, ResponseArgs, root_as_response};


/// Length of the message field in the request & response.
pub const MESSAGE_LENGTH_FIELD_LENGTH: usize = 4;
/// Length of the callback index field in the request & response.
pub const CALLBACK_INDEX_FIELD_LENGTH: usize = 4;
/// Length of the type field in the request & response.
pub const TYPE_FIELD_LENGTH: usize = 4;

// Request format:
// [0..4] bytes -> message length.
// [4..8] bytes -> callback index.
// [8..12] bytes -> type. RequestType for request, ResponseType for response.
// if get -  [12..message length] -> key.
// if set -  [12..16] -> key length
//       [16..16 + key length] -> key
//       [16+key length .. message length] -> value

/// The index at the end of the message length field.
pub const MESSAGE_LENGTH_END: usize = MESSAGE_LENGTH_FIELD_LENGTH;
/// The index at the end of the callback index length field.
pub const CALLBACK_INDEX_END: usize = MESSAGE_LENGTH_END + CALLBACK_INDEX_FIELD_LENGTH;
/// The index at the end of the type field.
pub const TYPE_END: usize = CALLBACK_INDEX_END + TYPE_FIELD_LENGTH;
/// The length of the header.
pub const HEADER_END: usize = MESSAGE_LENGTH_END;
/// The length of the header, when it contains a second argument.
pub const HEADER_WITH_KEY_LENGTH_END: usize = HEADER_END + MESSAGE_LENGTH_FIELD_LENGTH;

/// An enum representing the values of the request type field.
#[derive(ToPrimitive, FromPrimitive)]
pub enum RequestType {
    /// Type of a server address request
    ServerAddress = 1,
    /// Type of a get string request.
    GetString = 2,
    /// Type of a set string request.
    SetString = 3,
}

/// An enum representing the values of the request type field.
#[derive(ToPrimitive, FromPrimitive, PartialEq, Eq, Debug)]
pub enum ResponseType {
    /// Type of a response that returns a null.
    Null = 0,
    /// Type of a response that returns a string.
    String = 1,
    /// Type of response containing an error that impacts a single request.
    RequestError = 2,
    /// Type of response containing an error causes the connection to close.
    ClosingError = 3,
}

#[derive(PartialEq, Debug, Clone)]
pub(super) enum RequestRanges {
    ServerAddress {
        // address: Range<usize>,
        address: Vec<u8>,
    },
    Get {
        // key: Range<usize>,
        key: Vec<u8>,
    },
    Set {
    //     key: Range<usize>,
    //     value: Range<usize>,
        key: Vec<u8>,
        value: Vec<u8>,
    },
}

pub(super) type Buffer = RcRecycled<Vec<u8>>;
/// Buffer needs to be wrapped in Rc, because RcRecycled's clone implementation
/// involves copying the array.
pub(super) type SharedBuffer = Rc<Buffer>;
pub(super) type BuilderPool<'a> = Rc<Pool<Vec<flatbuffers::FlatBufferBuilder<'a>>>>;

/// The full parsed information for a request from the client's caller.
// pub(super) struct WholeRequest {
//     pub(super) callback_index: u32,
//     pub(super) request_type: RequestRanges,
//     /// A buffer containing the original request, and all the non-structured values that weren't copied.
//     pub(super) buffer: SharedBuffer,
// }
/// The full parsed information for a request from the client's caller.
pub(super) struct WholeRequest {
    pub(super) buffer: SharedBuffer,
    pub(super) request_start: usize,
    pub(super) request_end: usize,

}
