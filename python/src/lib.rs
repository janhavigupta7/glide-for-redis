use pyo3::prelude::*;
use pyo3::types::{IntoPyDict, PyString};
use redis::aio::MultiplexedConnection;
use redis::socket_listener::headers::{HEADER_END, RequestType, ResponseType};
use redis::socket_listener::start_socket_listener;
use redis::{AsyncCommands, RedisResult};


// #[pyclass]
// #[derive(Debug, PartialEq, Eq, Clone)]
// pub enum PyRequestType {
//     /// Type of a server address request
//     ServerAddress = RequestType::ServerAddress as isize,
//     /// Type of a get string request.
//     GetString = RequestType::GetString as isize,
//     /// Type of a set string request.
//     SetString = RequestType::SetString as isize,
// }

// #[pyclass]
// #[derive(Debug, PartialEq, Eq, Clone)]
// pub enum PyResponseType {
//     /// Type of a response that returns a null.
//     Null = ResponseType::Null as isize,
//     /// Type of a response that returns a string.
//     String = ResponseType::String as isize,
// }

#[pyclass]
struct AsyncClient {
    multiplexer: MultiplexedConnection,
}

#[pymethods]
impl AsyncClient {
    #[staticmethod]
    fn create_client(address: String, py: Python) -> PyResult<&PyAny> {
        pyo3_asyncio::tokio::future_into_py(py, async move {
            let client = redis::Client::open(address).unwrap();
            let multiplexer = client.get_multiplexed_async_connection().await.unwrap();
            let client = AsyncClient { multiplexer };
            Ok(Python::with_gil(|py| client.into_py(py)))
        })
    }

    fn get<'a>(&self, key: String, py: Python<'a>) -> PyResult<&'a PyAny> {
        let mut connection = self.multiplexer.clone();
        pyo3_asyncio::tokio::future_into_py(py, async move {
            let result: RedisResult<Option<String>> = connection.get(key).await;
            match result {
                Ok(result) => match result {
                    Some(result) => Ok(Python::with_gil(|py| result.into_py(py))),
                    None => Ok(Python::with_gil(|py| py.None())),
                },
                Err(err) => Err(PyErr::new::<PyString, _>(err.to_string())),
            }
        })
    }

    fn set<'a>(&self, key: String, value: String, py: Python<'a>) -> PyResult<&'a PyAny> {
        let mut connection = self.multiplexer.clone();
        pyo3_asyncio::tokio::future_into_py(py, async move {
            let result: RedisResult<()> = connection.set(key, value).await;
            match result {
                Ok(_) => Ok(Python::with_gil(|py| py.None())),
                Err(err) => Err(PyErr::new::<PyString, _>(err.to_string())),
            }
        })
    }

    fn create_pipeline(&self) -> AsyncPipeline {
        AsyncPipeline::new(self.multiplexer.clone())
    }
}

#[pyclass]
struct AsyncPipeline {
    internal_pipeline: redis::Pipeline,
    multiplexer: MultiplexedConnection,
}

impl AsyncPipeline {
    fn new(multiplexer: MultiplexedConnection) -> Self {
        AsyncPipeline {
            internal_pipeline: redis::Pipeline::new(),
            multiplexer,
        }
    }
}

#[pymethods]
impl AsyncPipeline {
    fn get(this: &PyCell<Self>, key: String) -> &PyCell<Self> {
        let mut pipeline = this.borrow_mut();
        pipeline.internal_pipeline.get(key);
        this
    }

    #[args(ignore_result = false)]
    fn set(this: &PyCell<Self>, key: String, value: String, ignore_result: bool) -> &PyCell<Self> {
        let mut pipeline = this.borrow_mut();
        pipeline.internal_pipeline.set(key, value);
        if ignore_result {
            pipeline.internal_pipeline.ignore();
        }
        this
    }

    fn execute<'a>(&self, py: Python<'a>) -> PyResult<&'a PyAny> {
        let mut connection = self.multiplexer.clone();
        let pipeline = self.internal_pipeline.clone();
        pyo3_asyncio::tokio::future_into_py(py, async move {
            let result: RedisResult<Vec<String>> = pipeline.query_async(&mut connection).await;
            match result {
                Ok(results) => Ok(Python::with_gil(|py| results.into_py(py))),
                Err(err) => Err(PyErr::new::<PyString, _>(err.to_string())),
            }
        })
    }
}

/// A Python module implemented in Rust.
#[pymodule]
fn pybushka(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<AsyncClient>()?;
    m.add("HEADER_LENGTH_IN_BYTES", HEADER_END).unwrap();
    m.add("REQ_ADDRESS", RequestType::ServerAddress as u8).unwrap();
    m.add("REQ_GET", RequestType::GetString as u8).unwrap();
    m.add("REQ_SET", RequestType::SetString as u8).unwrap();
    m.add("RES_NULL", ResponseType::Null as u8).unwrap();
    m.add("RES_STRING", ResponseType::String as u8).unwrap();

    #[pyfn(m)]
    fn start_socket_listener_external(
        init_callback: PyObject,
    ) -> PyResult<PyObject> {
        start_socket_listener(
            move |socket_path| {
                let gil = Python::acquire_gil();
                let py = gil.python();
                match socket_path {
                    Ok(path) => {
                        let _ = init_callback.call(py, (path, py.None()), None);
                    },
                    Err(err) => {let _ =init_callback.call(py, (py.None(), err.to_string()), None);},
                    };
                });
        Ok(Python::with_gil(|py| "OK".into_py(py)))
    }

    Ok(())
}
