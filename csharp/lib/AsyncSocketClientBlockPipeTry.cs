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


namespace babushka
{
    public class AsyncSocketClientBlockPipeTry : AsyncSocketClientBase
    {
        #region public methods

        public static async ValueTask<IAsyncSocketClient?> CreateSocketClient(string host, uint port, bool useTLS)
        {
            var socketName = await GetSocketNameAsync();
            var socket = await GetSocketAsync(socketName, host, port, useTLS);

            // if logger has been initialized by the external-user on info level this log will be shown
            Logger.Log(Level.Info, "connection info", "new connection established");
            return socket == null ? null : new AsyncSocketClientBlockPipeTry(socket);
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

        private NetworkStream writeStream;

        private BlockingCollection<IMessage> messagesQueue = new BlockingCollection<IMessage>();
        private BlockingCollection<Byte[]> messagesQueueBytes = new BlockingCollection<Byte[]>();

        #endregion

        #region Private Methods

        private AsyncSocketClientBlockPipeTry(Socket socket)
        {
            this.socket = socket;
            this.writeStream = new NetworkStream(socket, FileAccess.Write, false);
            Thread T2 = new Thread(StartListeningOnReadSocket);
            T2.Name = "ReadSocket";
            Thread T1 = new Thread(StartSendingToSocket);
            T1.Name = "SendingSocket";
            Console.WriteLine("Start T1 and T2 AsyncSocketClientBlockPipeTry");
            T1.Name = "StartSendingToSocket";
            T1.Priority = ThreadPriority.Highest;        
            T2.Priority = ThreadPriority.Highest;        
            T1.Start();
            T2.Start();
            Console.WriteLine("After Start T1 AsyncSocketClientBlockPipeTry");
            //StartSendingToSocket();
        }

        ~AsyncSocketClientBlockPipeTry()
        {
            Dispose();
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


        private void ProcessReadReqAsync(Socket socket, string name)
        {
            var writeScheduler = new SingleThreadPipeScheduler("writeScheduler" + name);
            var readScheduler = new SingleThreadPipeScheduler("readScheduler" + name);
            const long Receive_PauseWriterThreshold = 4L * 1024 * 1024 * 1024; // receive: let's give it up to 4GiB of buffer for now
            const long Receive_ResumeWriterThreshold = 3L * 1024 * 1024 * 1024; // (large replies get crazy big)

            // Tell the Pipe what schedulers to use and disable the SynchronizationContext.
            var options = new PipeOptions(
                        pauseWriterThreshold: Receive_PauseWriterThreshold,
                        resumeWriterThreshold: Receive_ResumeWriterThreshold,
                            readerScheduler: readScheduler,
                                  writerScheduler: writeScheduler,
                                  useSynchronizationContext: false);
            var pipe = new Pipe(options);
            Task writing = FillPipeAsync(socket, pipe.Writer);
            Task reading = ReadPipeAsync(pipe.Reader);

            Task.WhenAll(reading, writing);            
        }

        private async Task FillPipeAsync(Socket socket, PipeWriter writer)
        {
            const int minimumBufferSize = 512*16;
            int ii = 0;
            while (true)
            {
                // Allocate at least 512 bytes from the PipeWriter.
                Memory<byte> memory = writer.GetMemory(minimumBufferSize);
                try
                {
                    //Console.WriteLine("Before ReceiveAsync FillPipeAsync");
                    int bytesRead = await socket.ReceiveAsync(memory, SocketFlags.None);
                    ++ii;
                    if (ii % 100000 == 0)
                        Console.WriteLine($"Starting {ii}, bytesRead = {bytesRead}");
                    //Console.WriteLine("after ReceiveAsync FillPipeAsync");
                    if (bytesRead == 0)
                    {
                        Console.WriteLine("break ReceiveAsync FillPipeAsync");
                        break;
                    }
                    // Tell the PipeWriter how much was read from the Socket.
                    writer.Advance(bytesRead);
                }
                catch (Exception ex)
                {
                    //LogError(ex);
                    Console.WriteLine("Exception ReceiveAsync FillPipeAsync");
                    break;
                }

                // Make the data available to the PipeReader.
                FlushResult result = await writer.FlushAsync();

                if (result.IsCompleted)
                {
                    continue;
                }
            }

            // By completing PipeWriter, tell the PipeReader that there's no more data coming.
            await writer.CompleteAsync();
        }

        async Task ReadPipeAsync(PipeReader reader)
        {
            while (true)
            {
                //ReadResult result = await reader.ReadAsync();
                //Console.WriteLine("After ReadAsync");
                //Console.WriteLine("Before Parse");
                //ReadOnlySequence<byte> buffer = result.Buffer;
                //Console.WriteLine($"read {buffer.Length} bytes");
                var responseFromSocket = Response.Response.Parser.ParseDelimitedFrom(reader.AsStream(true)); //ParseDelimitedFrom(buffer);
                //Console.WriteLine("StartListeningOnReadSocket", $"read {responseFromSocket} message");
                Logger.Log(Level.Trace, "StartListeningOnReadSocket", $"read {responseFromSocket} message");
                if (responseFromSocket != null && responseFromSocket.ValueCase != Response.Response.ValueOneofCase.ClosingError)
                {
                  //  Console.WriteLine("Resolve message");
                    uint callbackIndex = responseFromSocket.CallbackIdx;
                    var message = messageContainer.GetMessage((int)callbackIndex);
                    ResolveMessage(message, responseFromSocket);
                }
            

                // Tell the PipeReader how much of the buffer has been consumed.
                //reader.AdvanceTo(buffer.Start, buffer.End);

                // Stop reading if there's no more data coming.
                //if (result.IsCompleted)
                //{
                    //continue;
                //}
            }

            // Mark the PipeReader as complete.
            await reader.CompleteAsync();
        }


        private void StartListeningOnReadSocket()
        {
            //Task.Run(() =>
            //{
                Console.WriteLine("Before ProcessReadReqAsync StartListeningOnReadSocket");
                ProcessReadReqAsync(socket!, "READ");
                Console.WriteLine("After ProcessReadReqAsync StartListeningOnReadSocket");
                /*
                using (var stream = new NetworkStream(socket!, FileAccess.Read, false))
                {
                    Console.WriteLine("ConnectToSocket StartListeningOnReadSocket");
                    while (socket!.Connected && !IsDisposed)
                    {
                        try
                        {
                            var responseFromSocket = Response.Response.Parser.ParseDelimitedFrom(stream);
                            Logger.Log(Level.Trace, "StartListeningOnReadSocket", $"read {responseFromSocket} message");
                            if (responseFromSocket != null && responseFromSocket.ValueCase != Response.Response.ValueOneofCase.ClosingError)
                            {
                                uint callbackIndex = responseFromSocket.CallbackIdx;
                                var message = messageContainer.GetMessage((int)callbackIndex);
                                ResolveMessage(message, responseFromSocket);
                            }
                        }
                        catch (Exception exc)
                        {
                            if (socket.Connected)
                            {
                                Logger.Log(Level.Error, "StartListeningOnReadSocket", $"read failed {exc}");
                            }
                            else
                            {
                                DisposeWithError(exc);
                            }
                        }
                    }
                }
            //});
            */
        }

        private void StartSendingToSocket()         {
            
//            Task.Run(() =>
            //{
                int ii = 0;
                while (socket!.Connected)
                {
                    
                    foreach(var message in messagesQueueBytes.GetConsumingEnumerable())
                    {
                        ++ii;
                        //Console.WriteLine($"message string = {message.ToString()}, message size = {message.Length}");
                        if (ii % 100000 == 0){
                            Console.WriteLine($"StartSendingToSocke mq size = {messagesQueueBytes.Count}");
                        }
                        //message.WriteDelimitedTo(writeStream);
                        int res = socket.Send(message);
                        //Console.WriteLine($"res = {res}");

                    }
                }
            //});
        }

        private static Socket ConnectToSocket(string socketAddress)
        {
            Console.WriteLine("ConnectToSocket AsyncSocketClientBlockPipeTry");

            var socket = new Socket(AddressFamily.Unix, SocketType.Stream, ProtocolType.IP);
            var endpoint = new UnixDomainSocketEndPoint(socketAddress);
            socket.Blocking = true;
            socket.Connect(endpoint);
            return socket;
        }

        protected override void WriteToSocket(IMessage writeRequest)
        {
            //            Console.WriteLine("WriteToSocket AsyncSocketClientBlockPipeTry");

            //messagesQueue.Add(writeRequest);   
            MemoryStream memstream = new MemoryStream();
            writeRequest.WriteDelimitedTo(memstream);
            byte[] messageBuffer = memstream.ToArray();
            //Console.WriteLine($"writeRequest = {writeRequest.ToString()} bytes = {writeRequest.WriteDelimitedTo()");
            messagesQueueBytes.Add(messageBuffer); 
        }

        private static void WriteToSocket(Socket socket, NetworkStream stream, IEnumerable<IMessage> WriteRequests)
        {
            foreach (var writeRequest in WriteRequests)
            {
                lock (socket)
                {
                    writeRequest.WriteDelimitedTo(stream);
                }
            }
        }

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
