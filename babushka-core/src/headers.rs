use lifeguard::RcRecycled;
use num_derive::{FromPrimitive, ToPrimitive};
use std::rc::Rc;
include!(concat!(env!("OUT_DIR"), "/protobuf/mod.rs"));
use pb_message::Request;

/// An enum representing the values of the request type field.
#[derive(ToPrimitive, FromPrimitive)]
pub enum RequestType {
    /// Invalid request type
    InvalidRequest = 0,
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
    /// Type of a response that returns a redis value, and not an error.
    Value = 1,
    /// Type of response containing an error that impacts a single request.
    RequestError = 2,
    /// Type of response containing an error causes the connection to close.
    ClosingError = 3,
}
/// An enum representing the values of the request type field.
#[derive(ToPrimitive, FromPrimitive, PartialEq, Eq, Debug)]
pub enum ErrorType {
    /// Type of response containing an error that impacts a single request.
    RequestError = 0,
    /// Type of response containing an error causes the connection to close.
    ClosingError = 1,
}

pub(super) type Buffer = RcRecycled<Vec<u8>>;
/// Buffer needs to be wrapped in Rc, because RcRecycled's clone implementation
/// involves copying the array.
pub(super) type SharedBuffer = Rc<Buffer>;

/// The full parsed information for a request from the client's caller.
pub(super) struct WholeRequest {
    pub(super) request: Request,
}
