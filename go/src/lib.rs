/*
 * Copyright GLIDE-for-Redis Project Contributors - SPDX Identifier: Apache-2.0
 */

// TODO: Investigate using uniffi bindings for Go instead of cbindgen
// TODO: Uncomment this line after Rust code is finalized. It is commented out to avoid compilation errors about unsafe usage.
// #![deny(unsafe_op_in_unsafe_fn)]
use glide_core::client::Client as GlideClient;
use glide_core::connection_request;
use glide_core::errors;
use glide_core::errors::RequestErrorType;
use glide_core::ConnectionRequest;
use glide_core::request_type::RequestType;
use protobuf::Message;
use redis::{FromRedisValue, RedisResult, Value};
use std::{
    ffi::{c_void, CStr, CString},
    mem,
    os::raw::{c_char, c_long, c_double},
};
use tokio::runtime::Builder;
use tokio::runtime::Runtime;
use std::slice::from_raw_parts;
use std::str::Utf8Error;

#[repr(C)]
pub struct CommandResponse {
    int_value: c_long,
    float_value: c_double,
    bool_value: bool,
    string_value: *mut c_char,
    string_value_len: c_long,
    array_value: *mut *mut c_char,
    array_elements_len: *mut c_long,
    array_value_len: c_long,
}

/// Success callback that is called when a Redis command succeeds.
///
/// The success callback needs to copy the given string synchronously, since it will be dropped by Rust once the callback returns. The callback should be offloaded to a separate thread in order not to exhaust the client's thread pool.
///
/// `index_ptr` is a baton-pass back to the caller language to uniquely identify the promise.
/// `message` is the value returned by the Redis command. The 'message' is managed by Rust and is freed when the callback returns control back to the caller.
// TODO: Change message type when implementing command logic
// TODO: Consider using a single response callback instead of success and failure callbacks
pub type SuccessCallback =
    unsafe extern "C" fn(index_ptr: usize, message: *const CommandResponse) -> ();

/// Failure callback that is called when a Redis command fails.
///
/// The failure callback needs to copy the given string synchronously, since it will be dropped by Rust once the callback returns. The callback should be offloaded to a separate thread in order not to exhaust the client's thread pool.
///
/// `index_ptr` is a baton-pass back to the caller language to uniquely identify the promise.
/// `error_message` is the error message returned by Redis for the failed command. The 'error_message' is managed by Rust and is freed when the callback returns control back to the caller.
/// `error_type` is the type of error returned by glide-core, depending on the `RedisError` returned.
pub type FailureCallback = unsafe extern "C" fn(
    index_ptr: usize,
    error_message: *const c_char,
    error_type: RequestErrorType,
) -> ();

/// The connection response.
///
/// It contains either a connection or an error. It is represented as a struct instead of a union for ease of use in the wrapper language.
///
/// The struct is freed by the external caller by using `free_connection_response` to avoid memory leaks.
#[repr(C)]
pub struct ConnectionResponse {
    conn_ptr: *const c_void,
    connection_error_message: *const c_char,
}

/// A `GlideClient` adapter.
// TODO: Remove allow(dead_code) once connection logic is implemented
#[allow(dead_code)]
pub struct ClientAdapter {
    client: GlideClient,
    success_callback: SuccessCallback,
    failure_callback: FailureCallback,
    runtime: Runtime,
}

fn create_client_internal(
    connection_request_bytes: &[u8],
    success_callback: SuccessCallback,
    failure_callback: FailureCallback,
) -> Result<ClientAdapter, String> {
    let request = connection_request::ConnectionRequest::parse_from_bytes(connection_request_bytes)
        .map_err(|err| err.to_string())?;
    // TODO: optimize this using multiple threads instead of a single worker thread (e.g. by pinning each go thread to a rust thread)
    let runtime = Builder::new_multi_thread()
        .enable_all()
        .worker_threads(1)
        .thread_name("GLIDE for Redis Go thread")
        .build()
        .map_err(|err| {
            let redis_error = err.into();
            errors::error_message(&redis_error)
        })?;
    let client = runtime
        .block_on(GlideClient::new(ConnectionRequest::from(request)))
        .map_err(|err| err.to_string())?;
    Ok(ClientAdapter {
        client,
        success_callback,
        failure_callback,
        runtime,
    })
}

/// Creates a new `ClientAdapter` with a new `GlideClient` configured using a Protobuf `ConnectionRequest`.
///
/// The returned `ConnectionResponse` will only be freed by calling [`free_connection_response`].
///
/// `connection_request_bytes` is an array of bytes that will be parsed into a Protobuf `ConnectionRequest` object.
/// `connection_request_len` is the number of bytes in `connection_request_bytes`.
/// `success_callback` is the callback that will be called when a Redis command succeeds.
/// `failure_callback` is the callback that will be called when a Redis command fails.
///
/// # Safety
///
/// * `connection_request_bytes` must point to `connection_request_len` consecutive properly initialized bytes. It must be a well-formed Protobuf `ConnectionRequest` object. The array must be allocated by the caller and subsequently freed by the caller after this function returns.
/// * `connection_request_len` must not be greater than the length of the connection request bytes array. It must also not be greater than the max value of a signed pointer-sized integer.
/// * The `conn_ptr` pointer in the returned `ConnectionResponse` must live while the client is open/active and must be explicitly freed by calling [`close_client`].
/// * The `connection_error_message` pointer in the returned `ConnectionResponse` must live until the returned `ConnectionResponse` pointer is passed to [`free_connection_response`].
/// * Both the `success_callback` and `failure_callback` function pointers need to live while the client is open/active. The caller is responsible for freeing both callbacks.
// TODO: Consider making this async
#[no_mangle]
pub unsafe extern "C" fn create_client(
    connection_request_bytes: *const u8,
    connection_request_len: usize,
    success_callback: SuccessCallback,
    failure_callback: FailureCallback,
) -> *const ConnectionResponse {
    let request_bytes =
        unsafe { std::slice::from_raw_parts(connection_request_bytes, connection_request_len) };
    let response = match create_client_internal(request_bytes, success_callback, failure_callback) {
        Err(err) => ConnectionResponse {
            conn_ptr: std::ptr::null(),
            connection_error_message: CString::into_raw(CString::new(err).unwrap()),
        },
        Ok(client) => ConnectionResponse {
            conn_ptr: Box::into_raw(Box::new(client)) as *const c_void,
            connection_error_message: std::ptr::null(),
        },
    };
    Box::into_raw(Box::new(response))
}

/// Closes the given `GlideClient`, freeing it from the heap.
///
/// `client_adapter_ptr` is a pointer to a valid `GlideClient` returned in the `ConnectionResponse` from [`create_client`].
///
/// # Panics
///
/// This function panics when called with a null `client_adapter_ptr`.
///
/// # Safety
///
/// * `close_client` can only be called once per client. Calling it twice is undefined behavior, since the address will be freed twice.
/// * `close_client` must be called after `free_connection_response` has been called to avoid creating a dangling pointer in the `ConnectionResponse`.
/// * `client_adapter_ptr` must be obtained from the `ConnectionResponse` returned from [`create_client`].
/// * `client_adapter_ptr` must be valid until `close_client` is called.
// TODO: Ensure safety when command has not completed yet
#[no_mangle]
pub unsafe extern "C" fn close_client(client_adapter_ptr: *const c_void) {
    assert!(!client_adapter_ptr.is_null());
    drop(unsafe { Box::from_raw(client_adapter_ptr as *mut ClientAdapter) });
}

/// Deallocates a `ConnectionResponse`.
///
/// This function also frees the contained error. If the contained error is a null pointer, the function returns and only the `ConnectionResponse` is freed.
///
/// # Panics
///
/// This function panics when called with a null `ConnectionResponse` pointer.
///
/// # Safety
///
/// * `free_connection_response` can only be called once per `ConnectionResponse`. Calling it twice is undefined behavior, since the address will be freed twice.
/// * `connection_response_ptr` must be obtained from the `ConnectionResponse` returned from [`create_client`].
/// * `connection_response_ptr` must be valid until `free_connection_response` is called.
/// * The contained `connection_error_message` must be obtained from the `ConnectionResponse` returned from [`create_client`].
/// * The contained `connection_error_message` must be valid until `free_connection_response` is called and it must outlive the `ConnectionResponse` that contains it.
#[no_mangle]
pub unsafe extern "C" fn free_connection_response(
    connection_response_ptr: *mut ConnectionResponse,
) {
    assert!(!connection_response_ptr.is_null());
    let connection_response = unsafe { Box::from_raw(connection_response_ptr) };
    let connection_error_message = connection_response.connection_error_message;
    drop(connection_response);
    if !connection_error_message.is_null() {
        drop(unsafe { CString::from_raw(connection_error_message as *mut c_char) });
    }
}

/// Deallocates a `CommandResponse`.
///
/// This function also frees the contained string_value and array_value. If the string_value and array_value are null pointers, the function returns and only the `CommandResponse` is freed.
///
/// # Panics
///
/// This function panics when called with a null `CommandResponse` pointer.
///
/// # Safety
///
/// * `free_command_response` can only be called once per `CommandResponse`. Calling it twice is undefined behavior, since the address will be freed twice.
/// * `command_response_ptr` must be obtained from the `CommandResponse` returned in [`success_callback`] from [`command`].
/// * `command_response_ptr` must be valid until `free_command_response` is called.
/// * The contained `string_value` must be obtained from the `CommandResponse` returned in [`success_callback`] from [`command`].
/// * The contained `string_value` must be valid until `free_command_response` is called and it must outlive the `CommandResponse` that contains it.
/// * The contained `array_elements_len` must be obtained from the `CommandResponse` returned in [`success_callback`] from [`command`].
/// * The contained `array_elements_len` must be valid until `free_command_response` is called and it must outlive the `CommandResponse` that contains it.
/// * The contained `array_value` must be obtained from the `CommandResponse` returned in [`success_callback`] from [`command`].
/// * The contained `array_value` must be valid until `free_command_response` is called and it must outlive the `CommandResponse` that contains it.
#[no_mangle]
pub unsafe extern "C" fn free_command_response(command_response_ptr: *mut CommandResponse) {
    assert!(!command_response_ptr.is_null());
    let command_response = unsafe { Box::from_raw(command_response_ptr) };
    let string_value = command_response.string_value;
    let string_value_len = command_response.string_value_len;
    let array_value = command_response.array_value;
    let array_value_len = command_response.array_value_len;
    let array_elements_len = command_response.array_elements_len;
    drop(command_response);
    if !string_value.is_null() {
        let len = string_value_len as usize;
        Vec::from_raw_parts(string_value, len, len);
    }
    if !array_value.is_null() {
        let len = array_value_len as usize;
        let vec = Vec::from_raw_parts(array_value, len, len);
        let elem_len = Vec::from_raw_parts(array_elements_len, len, len);
        for i in 0..len {
            if !vec[i].is_null() {
                let e_len = elem_len[i] as usize;
                Vec::from_raw_parts(vec[i], e_len, e_len);
            }
        }
    }
}

// TODO: Finish documentation
/// Converts a double pointer to a vec.
///
/// # Safety
///
/// * TODO: finish safety section.
pub unsafe fn convert_double_pointer_to_vec(
    data: *const *const c_char,
    len: usize,
) -> Result<Vec<String>, Utf8Error> {
    from_raw_parts(data, len)
        .iter()
        .map(|arg| CStr::from_ptr(*arg).to_str().map(ToString::to_string))
        .collect()
}

pub fn convert_vec_to_pointer<T>(mut vec: Vec<T>) -> (*mut T, c_long) {
    vec.shrink_to_fit();
    let vec_ptr = vec.as_mut_ptr();
    let len = vec.len() as c_long;
    mem::forget(vec);
    (vec_ptr, len)
}

// TODO: Finish documentation
/// Executes a command.
///
/// # Safety
///
/// * TODO: finish safety section.
#[no_mangle]
pub unsafe extern "C" fn command(
    client_adapter_ptr: *const c_void,
    channel: usize,
    command_type: RequestType,
    arg_count: usize,
    args: *const *const c_char,
) {
    let client_adapter =
        unsafe { Box::leak(Box::from_raw(client_adapter_ptr as *mut ClientAdapter)) };
    // The safety of this needs to be ensured by the calling code. Cannot dispose of the pointer before all operations have completed.
    let ptr_address = client_adapter_ptr as usize;

    let arg_vec = unsafe { convert_double_pointer_to_vec(args, arg_count) }.unwrap(); // TODO check

    let mut client_clone = client_adapter.client.clone();
    client_adapter.runtime.spawn(async move {
        let mut cmd = command_type.get_command().unwrap(); // TODO check cmd
                                                          //print!("{:?}", cmd.args);
        cmd.arg(arg_vec);

        let result = client_clone.send_command(&cmd, None).await;
        let client_adapter = unsafe { Box::leak(Box::from_raw(ptr_address as *mut ClientAdapter)) };
        let value = match result {
            Ok(value) => value,
            Err(err) => {
                println!(" === err {:?}", err);
                let message = errors::error_message(&err);
                let error_type = errors::error_type(&err);

                let c_err_str = CString::into_raw(CString::new(message).unwrap());
                unsafe { (client_adapter.failure_callback)(channel, c_err_str, error_type) };
                return;
            }
        };

        let mut command_response = CommandResponse {
            int_value: 0,
            float_value: 0.0,
            bool_value: false,
            string_value: std::ptr::null_mut(),
            string_value_len: 0,
            array_value: std::ptr::null_mut(),
            array_elements_len: std::ptr::null_mut(),
            array_value_len: 0,
        };
        let result: RedisResult<Option<CommandResponse>> = match value {
            Value::Nil => Ok(None),
            Value::Int(num) => {
                command_response.int_value = num;
                Ok(Some(command_response))
            }
            Value::SimpleString(text) => {
                let vec = text.chars().map(|b| b as c_char).collect::<Vec<_>>();
                let (vec_ptr, len) = convert_vec_to_pointer(vec);
                command_response.string_value = vec_ptr;
                command_response.string_value_len = len;
                Ok(Some(command_response))
            }
            Value::BulkString(text) => {
                let vec = text.iter().map(|b| *b as c_char).collect::<Vec<_>>();
                let (vec_ptr, len) = convert_vec_to_pointer(vec);
                command_response.string_value = vec_ptr;
                command_response.string_value_len = len;
                Ok(Some(command_response))
            }
            Value::VerbatimString { format: _, text } => {
                let vec = text.chars().map(|b| b as c_char).collect::<Vec<_>>();
                let (vec_ptr, len) = convert_vec_to_pointer(vec);
                command_response.string_value = vec_ptr;
                command_response.string_value_len = len;
                Ok(Some(command_response))
            }
            Value::Okay => {
                let vec = "OK".chars().map(|b| b as c_char).collect::<Vec<_>>();
                let (vec_ptr, len) = convert_vec_to_pointer(vec);
                command_response.string_value = vec_ptr;
                command_response.string_value_len = len;
                Ok(Some(command_response))
            }
            Value::Double(num) => {
                command_response.float_value = num;
                Ok(Some(command_response))
            }
            Value::Boolean(boolean) => {
                command_response.bool_value = boolean;
                Ok(Some(command_response))
            }
            Value::Array(array) => {
                let mut vec_elements_len: Vec<c_long> = Vec::new();
                let vec = array
                    .iter()
                    .map(|x| {
                        if *x == Value::Nil {
                            vec_elements_len.push(0);
                            return std::ptr::null_mut();
                        } 
                        let res = <String>::from_owned_redis_value(x.clone()).unwrap().chars().map(|b| b as c_char).collect::<Vec<_>>();
                        let (res_ptr, res_len) = convert_vec_to_pointer(res);
                        vec_elements_len.push(res_len);
                        return res_ptr;   
                    })
                    .collect::<Vec<_>>();
                let (vec_ptr, len) = convert_vec_to_pointer(vec);
                let (vec_elements_len_ptr, _) = convert_vec_to_pointer(vec_elements_len);
                command_response.array_value = vec_ptr;
                command_response.array_value_len = len;
                command_response.array_elements_len = vec_elements_len_ptr;
                Ok(Some(command_response))
            }
            _ => todo!(),
        };

        unsafe {
            match result {
                Ok(None) => (client_adapter.success_callback)(channel, std::ptr::null()),
                Ok(Some(message)) => {
                    (client_adapter.success_callback)(channel, Box::into_raw(Box::new(message)))
                }
                Err(err) => {
                    let message = errors::error_message(&err);
                    let error_type = errors::error_type(&err);

                    let c_err_str = CString::into_raw(CString::new(message).unwrap());
                    (client_adapter.failure_callback)(channel, c_err_str, error_type);
                }
            };
        }
    });
}
