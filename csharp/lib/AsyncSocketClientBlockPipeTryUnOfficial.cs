using System;
using System.Buffers;
using System.Collections.Concurrent;
using System.Linq;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Channels;
using Google.Protobuf;
using System.IO.Pipelines;
using System.Diagnostics;
using Pipelines.Sockets.Unofficial;

namespace babushka
{
    public class AsyncSocketClientBlockPipeTryUnofficial : AsyncSocketClientBase : IDisposable
    {
        #region public methods
        private const int MINIMUM_SEGMENT_SIZE = 8 * 1024;

        public static async ValueTask<IAsyncSocketClient?> CreateSocketClient(string host, uint port, bool useTLS)
        {

            PipeScheduler Scheduler = PipeScheduler.ThreadPool;

            const long Receive_PauseWriterThreshold = 4L * 1024 * 1024 * 1024; // receive: let's give it up to 4GiB of buffer for now
            const long Receive_ResumeWriterThreshold = 3L * 1024 * 1024 * 1024; // (large replies get crazy big)

            var defaultPipeOptions = PipeOptions.Default;

            long Send_PauseWriterThreshold = Math.Max(
                4L * 1024 * 1024 * 1024,// send: let's give it up to 4GiB
                defaultPipeOptions.PauseWriterThreshold); // or the default, whichever is bigger
            long Send_ResumeWriterThreshold = Math.Max(
                Send_PauseWriterThreshold,
                defaultPipeOptions.ResumeWriterThreshold);
            var SendPipeOptions = new PipeOptions(
                pool: defaultPipeOptions.Pool,
                readerScheduler: Scheduler,
                writerScheduler: Scheduler,
                pauseWriterThreshold: Send_PauseWriterThreshold,
                resumeWriterThreshold: Send_ResumeWriterThreshold,
                minimumSegmentSize: Math.Max(defaultPipeOptions.MinimumSegmentSize, MINIMUM_SEGMENT_SIZE),
                useSynchronizationContext: false);
            var ReceivePipeOptions = new PipeOptions(
                pool: defaultPipeOptions.Pool,
                readerScheduler: Scheduler,
                writerScheduler: Scheduler,
                pauseWriterThreshold: Receive_PauseWriterThreshold,
                resumeWriterThreshold: Receive_ResumeWriterThreshold,
                minimumSegmentSize: Math.Max(defaultPipeOptions.MinimumSegmentSize, MINIMUM_SEGMENT_SIZE),
                useSynchronizationContext: false);

      
            var socketName1 = await GetSocketNameAsync();
            var socket1 = await GetSocketAsync(socketName1, host, port, useTLS);

            var socketName2 = await GetSocketNameAsync();
            var socket2 = await GetSocketAsync(socketName2, host, port, useTLS);
            Console.WriteLine($"New client post creation socketName = {socketName1}, {socketName2}");
            Console.WriteLine($"New client post creation socket = {socket1}");

            IDuplexPipe pipe1 = SocketConnection.Create(socket1, SendPipeOptions, ReceivePipeOptions, name: "babuska pipe1");
            IDuplexPipe pipe2 = SocketConnection.Create(socket2, SendPipeOptions, ReceivePipeOptions, name: "babuska pipe2");
          /*  await WriteToSocket(socket1, pipe1, new[] { new WriteRequest { args = new() { address }, type = RequestType.SetServerAddress, callbackIndex = 0 } }, new());
            //var buffer = new byte[HEADER_LENGTH_IN_BYTES];

            Console.WriteLine($"Reading...");
            var input = pipe.Input;
            var readResult = await input.ReadAsync();
            Console.WriteLine($"ADDRESS: IsCompleted:{readResult.IsCompleted}, IsCanceled:{readResult.IsCanceled}, Length:{readResult.Buffer.Length}");
            var buffer = readResult.Buffer;
            var len = checked((int)buffer.Length);
            var arr = ArrayPool<byte>.Shared.Rent(len);
            buffer.CopyTo(arr);
            var header = GetHeader(arr, 0);
            if (header.responseType == ResponseType.ClosingError || header.responseType == ResponseType.RequestError)
            {
                throw new Exception("failed sending address");
            }

            input.AdvanceTo(readResult.Buffer.End);
            ArrayPool<byte>.Shared.Return(arr);*/
            

            // if logger has been initialized by the external-user on info level this log will be shown
            Logger.Log(Level.Info, "connection info", "new connection established");
            return (socket1 == null || socket2 == null) ? null : new AsyncSocketClientBlockPipeTryUnofficial(socket1, socket2, pipe1, pipe2);
        }

        #endregion public methods

        #region Protecte Members
        /// Returns a new ready to use socket.
        protected static async ValueTask<Socket?> GetSocketAsync(string socketName, string host, uint port, bool useTLS)
        {
            var socket = ConnectToSocket(socketName);

            var request = new ConnectionRequest.ConnectionRequest { UseTls = useTLS, ResponseTimeout = 60, ConnectionTimeout = 600 };
            request.Addresses.Add(new ConnectionRequest.AddressInfo() { Host = host, Port = port });
            request.ConnectionRetryStrategy = new ConnectionRequest.ConnectionRetryStrategy { NumberOfRetries = 3, Factor = 10, ExponentBase = 2 };
            using (var stream = new NetworkStream(socket, FileAccess.Write, false))
            {
                WriteToSocket(socket, stream, new[] { request });
            }
            var response = await ReadFromSocket(socket);
            if (response == null)
            {
                Logger.Log(Level.Error, "AsyncSocketClient.GetSocketAsync", "socket connection failed");
                socket.Dispose();
                return null;
            }
            return socket;
        }


        #endregion

        #region Private Memebrs

        private NetworkStream writeStream1;
        private NetworkStream writeStream2;

        Double elaspsedTimeWrite = 0;
        int countWrite = 0;

        private ConcurrentQueue<IMessage> messagesQueue1 = new ConcurrentQueue<IMessage>();
        private ConcurrentQueue<IMessage> messagesQueue2 = new ConcurrentQueue<IMessage>();
        private BlockingCollection<Byte[]> messagesQueueBytesBlocking1 = new BlockingCollection<Byte[]>();
        private BlockingCollection<Byte[]> messagesQueueBytesBlocking2 = new BlockingCollection<Byte[]>();
        private ConcurrentQueue<Byte[]> messagesQueueBytes1 = new ConcurrentQueue<Byte[]>();
        private ConcurrentQueue<Byte[]> messagesQueueBytes2 = new ConcurrentQueue<Byte[]>();
        

        #endregion

        #region Private Methods

        private AsyncSocketClientBlockPipeTryUnofficial(Socket socket1,Socket socket2, IDuplexPipe? pipe1 = null, IDuplexPipe? pipe2 = null)
        {
            this.socket1 = socket1;
            this.writeStream1 = new NetworkStream(socket1, FileAccess.Write, false);
            this.socket2 = socket2;
            this.writeStream2 = new NetworkStream(socket2, FileAccess.Write, false);
            Thread T_read1 = new Thread(()=> StartListeningOnReadSocket(socket1, pipe1));
            Thread T_read2 = new Thread(()=> StartListeningOnReadSocket(socket2, pipe2));
            T_read1.Name = "ReadSocket1";
            T_read2.Name = "ReadSocket2";
            T_read1.Priority = ThreadPriority.Highest;        
            T_read2.Priority = ThreadPriority.Highest;        

            Thread T_write1 = new Thread(()=>StartListeningOnWriteChannel(socket1, pipe1));
            Thread T_write2 = new Thread(()=>StartListeningOnWriteChannel(socket1, pipe2));
            T_write1.Name = "SendingSocket1";
            T_write2.Name = "SendingSocket2";
            Console.WriteLine("Start T1 and T2 AsyncSocketClientBlockPipeTryUnofficial");            
            T_write1.Priority = ThreadPriority.Highest;        
            T_write2.Priority = ThreadPriority.Highest;        
            
            T_read1.Start();
            T_read2.Start();
            T_write1.Start();
            T_write2.Start();
            Console.WriteLine("After Start T1 AsyncSocketClientBlockPipeTryUnofficial");          
        }

        ~AsyncSocketClientBlockPipeTryUnofficial()
        {
            Dispose();
        }


        private async void StartListeningOnWriteChannel(Socket socket, IDuplexPipe pipe)
        {
               
                while (socket.Connected)
                {
                    await this.writeRequestsChannel.Reader.WaitToReadAsync();
                    this.writeRequestsChannel.Reader.TryRead(out var writeRequest);                    
                    var output = pipe.Output;
                    
                    
                    var memory = output.GetMemory(writeRequest!.Length);                                        
                    
                    //Console.WriteLine($"Flush:IsCompleted:{flushResult.IsCompleted}, IsCanceled:{flushResult.IsCanceled}");   
                    var flushResult = await output.FlushAsync();
                }               
            
        }

        // This is a sample scheduler that async callbacks on a single dedicated thread.
        public class SingleThreadPipeScheduler : PipeScheduler
        {
            private readonly BlockingCollection<(Action<object> Action, object State)> _queue =
            new BlockingCollection<(Action<object> Action, object State)>();
            private readonly Thread _thread;

            public SingleThreadPipeScheduler(string name)
            {
                _thread = new Thread(DoWork);
                _thread.Name = name;
                _thread.Start();
            }

            private void DoWork()
            {
                foreach (var item in _queue.GetConsumingEnumerable())
                {
                    item.Action(item.State);
                }
            }

            public override void Schedule(Action<object?> action, object? state)
            {
                if (state is not null)
                {
                    _queue.Add((action, state));
                }
                // else log the fact that _queue.Add was not called.
            }
        }

        private void StartListeningOnReadSocket(Socket socket, IDuplexPipe? pipe)
        {
            //Task.Run(() =>
            //{
                
 
                var reader = pipe!.Input;
                double elaspsedTimeParse = 0;
                int countParse = 0;
                int CountMessage = 0;
                while (true){
                    var stopwatch = new Stopwatch();
                    stopwatch.Start();
                        
                    var responseFromSocket = Response.Response.Parser.ParseDelimitedFrom(reader.AsStream(true)); //ParseDelimitedFrom(buffer);
            
                // Console.WriteLine("StartListeningOnReadSocket", $"read {responseFromSocket} message");
                    Logger.Log(Level.Trace, "StartListeningOnReadSocket", $"read {responseFromSocket} message");
                    if (responseFromSocket != null && responseFromSocket.ValueCase != Response.Response.ValueOneofCase.ClosingError)
                    {
                    //  Console.WriteLine("Resolve message");
                        uint callbackIndex = responseFromSocket.CallbackIdx;
                        var message = messageContainer.GetMessage((int)callbackIndex);
                        if (CountMessage % 500000 == 0){
                            message.stopWatch.Stop();
                            double messageTime = (double)(message.stopWatch.ElapsedMilliseconds);
                            Console.WriteLine($"StartListeningOnReadSocket CountMessage = {CountMessage} message time = {messageTime}");                        
                        }
                        CountMessage++;
                        ResolveMessage(message, responseFromSocket);
                    }
                    stopwatch.Stop();            
                    elaspsedTimeParse += (double)(stopwatch.ElapsedMilliseconds);
                    countParse++;
                    if (countParse % 500000 == 0)
                    {
                        
                        
                        Console.WriteLine($"ParseAverageTime = {elaspsedTimeParse/500000}");
                        elaspsedTimeParse = 0;   
                    }
                }

        }

        

        
        private static Socket ConnectToSocket(string socketAddress)
        {
            Console.WriteLine("ConnectToSocket AsyncSocketClientBlockPipeTryUnofficial");

            var socket = new Socket(AddressFamily.Unix, SocketType.Stream, ProtocolType.IP);
            var endpoint = new UnixDomainSocketEndPoint(socketAddress);
            socket.Blocking = true;
            socket.Connect(endpoint);
            return socket;
        }

        protected override void WriteToSocket(IMessage writeRequest)
        {
            //            Console.WriteLine("WriteToSocket AsyncSocketClientBlockPipeTryUnofficial");
    
            //
            MemoryStream memstream = new MemoryStream();
            
            var stopwatch = new Stopwatch();
            stopwatch.Start();
        
            writeRequest.WriteDelimitedTo(memstream);
            
                  

            byte[] messageBuffer = memstream.ToArray();
            //Console.WriteLine($"writeRequest = {writeRequest.ToString()}");

            if (IsDisposed)
            {
                throw new ObjectDisposedException(null);
            }
            if (!this.writeRequestsChannel.Writer.TryWrite(messageBuffer))
            {
                throw new ObjectDisposedException("Writing after channel is closed");
            }
            //
            countWrite++;
            stopwatch.Stop();            
            elaspsedTimeWrite += (double)(stopwatch.ElapsedMilliseconds);
            if (countWrite % 500000 == 0)
            {                                                                    
                        
                Console.WriteLine($"WriteAverageTime = {elaspsedTimeWrite/500000}");
                elaspsedTimeWrite = 0;   
            }
        }

        private static void WriteToSocket(Socket socket, NetworkStream stream, IEnumerable<IMessage> WriteRequests)
        {
            Console.WriteLine("WriteToSocket Errror!!!!!!!!!!!!!");
            foreach (var writeRequest in WriteRequests)
            {
                Console.WriteLine("WriteToSocket Errror!!!!!!!!!!!!!");
                lock (socket)
                {
                    writeRequest.WriteDelimitedTo(stream);
                }
            }
        }

        private readonly Channel<Byte[]> writeRequestsChannel = Channel.CreateUnbounded<Byte[]>(new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false,
            AllowSynchronousContinuations = false
        });

        private static async ValueTask<Response.Response?> ReadFromSocket(Socket socket)
        {
            try
            {
                using (var stream = new NetworkStream(socket, FileAccess.Read, false))
                {
                    var responseFromSocket = await Task.Run(() => Response.Response.Parser.ParseDelimitedFrom(stream));
                    
                    Logger.Log(Level.Info, "ReadFromSocket", $"read {responseFromSocket} message");
                    return responseFromSocket;
                }
            }
            catch (Exception exc)
            {
                Logger.Log(Level.Error, "ReadFromSocket", $"read failed {exc}");
                return null;
            }
        }

        #endregion private methods

    }
}
