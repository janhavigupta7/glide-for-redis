use super::headers::*;
use byteorder::{LittleEndian, ReadBytesExt};
use lifeguard::{pool, Pool, StartingSize, Supplier};
use pb_message::Request;
use protobuf::Message;
use std::{
    io,
    mem,
    ops::Range,
    rc::Rc,
};

/// An enum representing a request during the parsing phase.
pub(super) enum RequestState {
    /// Parsing completed.
    Complete {
        request: WholeRequest,
        /// The index of the beginning of the next request.
        cursor_next: usize,
    },
    /// Parsing failed because the buffer didn't contain the full header of the request.
    PartialNoHeader,
    /// Parsing failed because the buffer didn't contain the body of the request.
    PartialWithHeader {
        /// Length of the request.
        length: usize,
    },
}

pub(super) struct ReadHeader {
    pub(super) length: usize,
}

/// An object handling a arranging read buffers, and parsing the data in the buffers into requests.
pub(super) struct RotatingBuffer {
    /// Object pool for the internal buffers.
    pool: Rc<Pool<Vec<u8>>>,
    /// Buffer for next read request.
    current_read_buffer: Buffer,
}

impl RotatingBuffer {
    pub(super) fn with_pool(pool: Rc<Pool<Vec<u8>>>) -> Self {
        let next_read = pool.new_rc();
        RotatingBuffer {
            pool,
            current_read_buffer: next_read,
        }
    }

    pub(super) fn new(initial_buffers: usize, buffer_size: usize) -> Self {
        let pool = Rc::new(
            pool()
                .with(StartingSize(initial_buffers))
                .with(Supplier(move || Vec::with_capacity(buffer_size)))
                .build(),
        );
        Self::with_pool(pool)
    }

    fn read_header(input: &[u8]) -> io::Result<ReadHeader> {
        let length = (&input[..MESSAGE_LENGTH_END]).read_u32::<LittleEndian>()? as usize;

        Ok(ReadHeader { length })
    }

    fn parse_request(
        &self,
        request_range: &Range<usize>,
        buffer: SharedBuffer,
    ) -> io::Result<RequestState> {
        if request_range.len() < HEADER_END {
            return Ok(RequestState::PartialNoHeader);
        }
        let header = Self::read_header(&buffer[request_range.start..request_range.end])?;
        let header_end = request_range.start + HEADER_END;
        let next = request_range.start + HEADER_END + header.length;
        if next > request_range.end {
            return Ok(RequestState::PartialWithHeader {
                length: header.length + HEADER_END,
            });
        }
        
        match Request::parse_from_bytes(&buffer[header_end..header_end + header.length]) {
            Ok(request) => {        
                let request = WholeRequest { request };
                Ok(RequestState::Complete {
                    request,
                    cursor_next: next,
                })
            },
            Err(err) => {
                Err(std::io::Error::new(
                    std::io::ErrorKind::InvalidInput,
                    format!("failed to parse request: {err}"),
                ))
            }
        }
    }

    /// Adjusts the current buffer size so that it will fit required_length.
    fn match_capacity(&mut self, required_length: usize) {
        let extra_capacity = required_length - self.current_read_buffer.len();
        self.current_read_buffer.reserve(extra_capacity);
    }

    /// Replace the buffer, and copy the ending of the current incomplete message to the beginning of the next buffer.
    fn copy_from_old_buffer(
        &mut self,
        old_buffer: SharedBuffer,
        required_length: Option<usize>,
        cursor: usize,
    ) {
        self.match_capacity(required_length.unwrap_or_else(|| self.current_read_buffer.capacity()));
        let old_buffer_len = old_buffer.len();
        let slice = &old_buffer[cursor..old_buffer_len];
        debug_assert!(self.current_read_buffer.len() == 0);
        self.current_read_buffer.extend_from_slice(slice);
    }

    fn get_new_buffer(&mut self) -> Buffer {
        let mut buffer = self.pool.new_rc();
        buffer.clear();
        buffer
    }

    /// Parses the requests in the buffer.
    pub(super) fn get_requests(&mut self) -> io::Result<Vec<WholeRequest>> {
        let mut cursor = 0;
        // We replace the buffer on every call, because we want to prevent the next read from affecting existing results.
        let new_buffer = self.get_new_buffer();
        let buffer = Rc::new(mem::replace(&mut self.current_read_buffer, new_buffer));
        let mut results = vec![];
        let buffer_length = buffer.len();
        while cursor < buffer_length {
            let parse_result = self.parse_request(&(cursor..buffer_length), buffer.clone())?;
            match parse_result {
                RequestState::Complete {
                    request,
                    cursor_next: next,
                } => {
                    results.push(request);
                    cursor = next;
                }
                RequestState::PartialNoHeader => {
                    self.copy_from_old_buffer(buffer, None, cursor);
                    return Ok(results);
                }
                RequestState::PartialWithHeader { length } => {
                    self.copy_from_old_buffer(buffer, Some(length), cursor);
                    return Ok(results);
                }
            };
        }

        self.current_read_buffer.clear();
        Ok(results)
    }

    pub(super) fn current_buffer(&mut self) -> &mut Vec<u8> {
        debug_assert!(self.current_read_buffer.capacity() > self.current_read_buffer.len());
        &mut self.current_read_buffer
    }
}

#[cfg(test)]
mod tests {
    use std::io::Write;
    use byteorder::WriteBytesExt;
    use super::*;

    // fn write_message(
    //     rotating_buffer: &mut RotatingBuffer,
    //     length: usize,
    //     callback_index: u32,
    //     request_type: u32,
    //     key_length: Option<usize>,
    // ) {
    //     let buffer = rotating_buffer.current_buffer();
    //     let capacity = buffer.capacity();
    //     let initial_buffer_length = buffer.len();
    //     rotating_buffer.write_to_buffer(length as u32);
    //     rotating_buffer.write_to_buffer(callback_index);
    //     rotating_buffer.write_to_buffer(request_type);
    //     if let Some(key_length) = key_length {
    //         rotating_buffer.write_to_buffer(key_length as u32);
    //     }
    //     if capacity > rotating_buffer.current_read_buffer.len() {
    //         let buffer = rotating_buffer.current_buffer();
    //         let mut message = vec![0_u8; length + initial_buffer_length - buffer.len()];
    //         buffer.append(&mut message);
    //     }
    // }

    // fn write_get_message(rotating_buffer: &mut RotatingBuffer, length: usize, callback_index: u32) {
    //     write_message(
    //         rotating_buffer,
    //         length,
    //         callback_index,
    //         RequestType::GetString.to_u32().unwrap(),
    //         None,
    //     );
    // }

    fn write_header(
        buffer: &mut Vec<u8>,
        length: usize,
    ) {
        buffer.write_u32::<LittleEndian>(length as u32).unwrap();

    }

    fn create_request(buffer: &mut Vec<u8>, callback_index: u32, args: Vec<String>, request_type: u32) -> Request {
        let mut request = Request::new();
        request.callback_idx = callback_index;
        request.request_type = request_type;
        request.args = args;
        request
    }

    fn write_message(rotating_buffer: &mut RotatingBuffer, callback_index: u32, args: Vec<String>, request_type: u32) {
        let buffer = rotating_buffer.current_buffer();
        let capacity = buffer.capacity();
        let initial_buffer_length = buffer.len();
        let request = create_request(buffer, callback_index, args, request_type);
        let message_length = request.compute_size() as usize;

        write_header(buffer, message_length);
        let _ = buffer.write_all(&request.write_to_bytes().unwrap());
        if capacity > rotating_buffer.current_read_buffer.len() {
            let buffer = rotating_buffer.current_buffer();
            let mut message = vec![0_u8; message_length + initial_buffer_length - buffer.len()];
            buffer.append(&mut message);
        }
    }

    fn write_get(rotating_buffer: &mut RotatingBuffer, callback_index: u32, key: &str) {
        write_message(rotating_buffer, callback_index, vec![key.to_string()], RequestType::GetString as u32);
    }

    fn write_set(rotating_buffer: &mut RotatingBuffer, callback_index: u32, key: &str, value: String) {
        write_message(rotating_buffer,
            callback_index, 
            vec![key.to_string(), value],
            RequestType::SetString as u32
        );
    }
    // fn write_set_message(
    //     rotating_buffer: &mut RotatingBuffer,
    //     length: usize,
    //     callback_index: u32,
    //     key_length: usize,
    // ) {
    //     write_message(
    //         rotating_buffer,
    //         length,
    //         callback_index,
    //         RequestType::SetString.to_u32().unwrap(),
    //         Some(key_length),
    //     );
    // }

    fn assert_request(request: &Request, expected_type: u32, expected_index: u32, expected_args: Vec<String>) {
        assert_eq!(
            request.request_type,
            expected_type
        );
        assert_eq!(request.callback_idx, expected_index);
        assert_eq!(request.args, expected_args);
    }
    #[test]
    fn get_right_sized_buffer() {
        let mut rotating_buffer = RotatingBuffer::new(1, 128);
        assert_eq!(rotating_buffer.current_buffer().capacity(), 128);
        assert_eq!(rotating_buffer.current_buffer().len(), 0);
    }

    #[test]
    fn get_requests() {
        const BUFFER_SIZE: usize = 50;
        let mut rotating_buffer = RotatingBuffer::new(1, BUFFER_SIZE);
        write_get(&mut rotating_buffer, 100, "key");
        write_set(&mut rotating_buffer, 5, "key", "value".to_string());
        let requests = rotating_buffer.get_requests().unwrap();
        assert_eq!(requests.len(), 2);
        assert_request(&requests[0].request, RequestType::GetString as u32, 100, vec!["key".to_string()]);
        assert_request(&requests[0].request, RequestType::SetString as u32, 100, vec!["key".to_string(), "value".to_string()]);
    }

    #[test]
    fn repeating_requests_from_same_buffer() {
        const BUFFER_SIZE: usize = 50;
        let mut rotating_buffer = RotatingBuffer::new(1, BUFFER_SIZE);
        //write_get_message(&mut rotating_buffer, FIRST_MESSAGE_LENGTH, 100);
        write_get(&mut rotating_buffer, 100, "key");
        let requests = rotating_buffer.get_requests().unwrap();
        assert_request(&requests[0].request, RequestType::GetString as u32, 100, vec!["key".to_string()]);


        write_set(&mut rotating_buffer, 5, "key", "value".to_string());

        let requests = rotating_buffer.get_requests().unwrap();
        assert_eq!(requests.len(), 1);
        assert_request(&requests[0].request, RequestType::SetString as u32, 100, vec!["key".to_string(), "value".to_string()]);
    }

    #[test]
    fn next_write_doesnt_affect_values() {
        const BUFFER_SIZE: u32 = 16;
        const MESSAGE_LENGTH: usize = 16;
        let mut rotating_buffer = RotatingBuffer::new(1, BUFFER_SIZE as usize);
        write_get(&mut rotating_buffer, 100, "key");

        let requests = rotating_buffer.get_requests().unwrap();
        assert_eq!(requests.len(), 1);
        assert_request(&requests[0].request, RequestType::GetString as u32, 100, vec!["key".to_string()]);

        while rotating_buffer.current_read_buffer.len()
            < rotating_buffer.current_read_buffer.capacity()
        {
            rotating_buffer.current_read_buffer.push(0_u8);
        }
        assert_request(&requests[0].request, RequestType::GetString as u32, 100, vec!["key".to_string()]);
    }

    // #[test]
    // fn copy_header_and_partial_message_to_next_buffer() {
    //     const NUM_OF_MESSAGE_BYTES: usize = 2;
    //     let mut rotating_buffer = RotatingBuffer::new(1, 24);
    //     let buffer = rotating_buffer.current_buffer();
    //     write_get(&mut rotating_buffer, 100, "key1");
    //     //write_get_message(&mut rotating_buffer, FIRST_MESSAGE_LENGTH, 100);
    //     let request = create_request(buffer, 101, vec!["key2".to_string()], RequestType::GetString as u32);
    //     let request_bytes = request.write_to_bytes().unwrap();
    //     let second_message_length = request.compute_size() as usize;
    //     write_header(rotating_buffer.current_buffer(), second_message_length);
    //     let _ = buffer.append(&mut request_bytes[..NUM_OF_MESSAGE_BYTES].into());
    //     let requests = rotating_buffer.get_requests().unwrap();
    //     assert_eq!(requests.len(), 1);
    //     assert_request(&requests[0].request, RequestType::GetString as u32, 100, vec!["key1".to_string()]);
    //     let buffer = rotating_buffer.current_buffer();
    //     assert_eq!(buffer.len(), HEADER_END);
    //     let _ = buffer.append(&mut request_bytes[NUM_OF_MESSAGE_BYTES..].into());
    //     let requests = rotating_buffer.get_requests().unwrap();
    //     assert_eq!(requests.len(), 1);
    //     assert_request(&requests[0].request, RequestType::GetString as u32, 101, vec!["key2".to_string()]);
    // }

    // #[test]
    // fn copy_full_message_to_next_buffer_and_increase_buffer_size() {
    //     const FIRST_MESSAGE_LENGTH: usize = 16;
    //     const SECOND_MESSAGE_LENGTH: usize = 32;
    //     const BUFFER_SIZE: usize = SECOND_MESSAGE_LENGTH - 4;
    //     let mut rotating_buffer = RotatingBuffer::new(1, BUFFER_SIZE);
    //     write_get(&mut rotating_buffer, 100, "key");

    //     //write_get_message(&mut rotating_buffer, FIRST_MESSAGE_LENGTH, 100);
    //     rotating_buffer.write_to_buffer(SECOND_MESSAGE_LENGTH as u32); // 2nd message length
    //     rotating_buffer.write_to_buffer(5); // 2nd message callback index
    //     rotating_buffer.write_to_buffer(RequestType::SetString as u32); // 2nd message operation type
    //     let requests = rotating_buffer.get_requests().unwrap();
    //     assert_eq!(requests.len(), 1);
    //     assert_eq!(
    //         requests[0].request_type,
    //         RequestRanges::Get {
    //             key: (HEADER_END..FIRST_MESSAGE_LENGTH)
    //         }
    //     );
    //     assert_eq!(requests[0].callback_index, 100);

    //     rotating_buffer.write_to_buffer(8); // 2nd message key length
    //     let buffer = rotating_buffer.current_buffer();
    //     assert_eq!(buffer.len(), HEADER_WITH_KEY_LENGTH_END);
    //     let mut message = vec![0_u8; SECOND_MESSAGE_LENGTH - buffer.len()];
    //     buffer.append(&mut message);
    //     assert_eq!(buffer.len(), SECOND_MESSAGE_LENGTH);
    //     let requests = rotating_buffer.get_requests().unwrap();
    //     assert_eq!(requests.len(), 1);
    //     assert_eq!(
    //         requests[0].request_type,
    //         RequestRanges::Set {
    //             key: (HEADER_WITH_KEY_LENGTH_END..24),
    //             value: (24..32)
    //         }
    //     );
    //     assert_eq!(requests[0].callback_index, 5);
    // }

    // #[test]
    // fn copy_partial_header_message_to_next_buffer_and_then_increase_size() {
    //     const FIRST_MESSAGE_LENGTH: usize = 16;
    //     const SECOND_MESSAGE_LENGTH: usize = 40;
    //     const BUFFER_SIZE: usize = SECOND_MESSAGE_LENGTH - 12;
    //     let mut rotating_buffer = RotatingBuffer::new(1, BUFFER_SIZE);
    //     write_get_message(&mut rotating_buffer, FIRST_MESSAGE_LENGTH, 100);
    //     rotating_buffer.write_to_buffer(SECOND_MESSAGE_LENGTH as u32); // 2nd message length
    //     rotating_buffer.write_to_buffer(5); // 2nd message callback index
    //     let requests = rotating_buffer.get_requests().unwrap();
    //     assert_eq!(requests.len(), 1);
    //     assert_eq!(
    //         requests[0].request_type,
    //         RequestRanges::Get {
    //             key: (HEADER_END..FIRST_MESSAGE_LENGTH)
    //         }
    //     );
    //     assert_eq!(requests[0].callback_index, 100);

    //     rotating_buffer.write_to_buffer(RequestType::SetString as u32); // 2nd message operation type
    //     rotating_buffer.write_to_buffer(8); // 2nd message key length
    //     let buffer = rotating_buffer.current_buffer();
    //     let mut message = vec![0_u8; SECOND_MESSAGE_LENGTH - buffer.len()];
    //     buffer.append(&mut message);
    //     let requests = rotating_buffer.get_requests().unwrap();
    //     assert_eq!(requests.len(), 1);
    //     assert_eq!(
    //         requests[0].request_type,
    //         RequestRanges::Set {
    //             key: (HEADER_WITH_KEY_LENGTH_END..24),
    //             value: (24..SECOND_MESSAGE_LENGTH)
    //         }
    //     );
    //     assert_eq!(requests[0].callback_index, 5);
    // }
}
