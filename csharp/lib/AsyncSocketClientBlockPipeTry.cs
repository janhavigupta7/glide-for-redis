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

namespace babushka
{
    public class AsyncSocketClientBlockPipeTry : AsyncSocketClientBase
    {
        #region public methods

        public static async ValueTask<IAsyncSocketClient?> CreateSocketClient(string host, uint port, bool useTLS)
        {
            var socketName1 = await GetSocketNameAsync();
            var socket1 = await GetSocketAsync(socketName1, host, port, useTLS);

            var socketName2 = await GetSocketNameAsync();
            var socket2 = await GetSocketAsync(socketName2, host, port, useTLS);
            Console.WriteLine($"New client post creation socketName = {socketName1}, {socketName2}");
            Console.WriteLine($"New client post creation socket = {socket1}");

            // if logger has been initialized by the external-user on info level this log will be shown
            Logger.Log(Level.Info, "connection info", "new connection established");
            return (socket1 == null || socket2 == null) ? null : new AsyncSocketClientBlockPipeTry(socket1, socket2);
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

        private AsyncSocketClientBlockPipeTry(Socket socket1,Socket socket2)
        {
            this.socket1 = socket1;
            this.writeStream1 = new NetworkStream(socket1, FileAccess.Write, false);
            this.socket2 = socket2;
            this.writeStream2 = new NetworkStream(socket2, FileAccess.Write, false);
            Thread T_read1 = new Thread(()=> StartListeningOnReadSocket(socket1));
            Thread T_read2 = new Thread(()=> StartListeningOnReadSocket(socket2));
            T_read1.Name = "ReadSocket1";
            T_read2.Name = "ReadSocket2";
            T_read1.Priority = ThreadPriority.Highest;        
            T_read2.Priority = ThreadPriority.Highest;        

            Thread T_write1 = new Thread(()=>StartSendingToSocket(messagesQueueBytesBlocking1, writeStream1, socket1));
            Thread T_write2 = new Thread(()=>StartSendingToSocket(messagesQueueBytesBlocking2, writeStream2, socket2));
            T_write1.Name = "SendingSocket1";
            T_write2.Name = "SendingSocket2";
            Console.WriteLine("Start T1 and T2 AsyncSocketClientBlockPipeTry");            
            T_write1.Priority = ThreadPriority.Highest;        
            T_write2.Priority = ThreadPriority.Highest;        
            
            T_read1.Start();
            T_read2.Start();
            T_write1.Start();
            T_write2.Start();
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
                   /* if (ii % 10000 == 0)
                    {
                        Console.WriteLine($"Starting {ii}, bytesRead = {bytesRead}");
                    }*/
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
            double elaspsedTimeParse = 0;
            int countParse = 0;
            int CountMessage = 0;
            while (true)
            {
                //ReadResult result = await reader.ReadAsync();
                //Console.WriteLine("After ReadAsync");
                //Console.WriteLine("Before Parse");
                //ReadOnlySequence<byte> buffer = result.Buffer;
                //Console.WriteLine($"read {buffer.Length} bytes");
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
                        Console.WriteLine($"ReadPipeAsync CountMessage = {CountMessage} message time = {messageTime}");                        
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


        private void StartListeningOnReadSocket(Socket socket)
        {
            //Task.Run(() =>
            //{
                Console.WriteLine("Before ProcessReadReqAsync StartListeningOnReadSocket");
                ProcessReadReqAsync(socket, "READ");
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

        private void StartSendingToSocket(BlockingCollection<Byte[]> messagesQueueBytes, NetworkStream writeStream, Socket? socket)         {
            
//            Task.Run(() =>
            //{
                int ii = 0;
                int countSend = 0;
                Console.WriteLine($"New StartSendingToSocket");
                double elaspsedTimeSend = 0;
                while (socket!.Connected)
                {
                     var stopwatch = new Stopwatch();
                    stopwatch.Start();
        
           
                    foreach(var message in messagesQueueBytes.GetConsumingEnumerable())
//                    if (messagesQueueBytes.TryDequeue(out var message))
                    //if (messagesQueue.TryDequeue(out var message))
                    {
                        ++ii;
                       // Console.WriteLine($"message string = {message.ToString()}, message size = {message.Length}");
                        if (ii % 100000 == 0){
                            Console.WriteLine($"StartSendingToSocke mq size = {messagesQueueBytes.Count}");
                        }

                        //int res = -1;
                        
                        
                        //message.WriteDelimitedTo(writeStream);
                        int res = socket.Send(message);
                        
                            
                        
                        //Console.WriteLine($"res = {res}");
                        


                    }
                 //   if (ii % 10 == 0){
                   //     writeStream.FlushAsync();
                    //}
                    

                    
                    countSend++;
                    stopwatch.Stop();            
                    elaspsedTimeSend += (double)(stopwatch.ElapsedMilliseconds);
                    if (countSend % 500000 == 0)
                    {
                     //   Console.WriteLine($"SendAverageTime = {elaspsedTimeSend/500000} countSend = {countSend}");
                        elaspsedTimeSend = 0;   
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
    
            //
            MemoryStream memstream = new MemoryStream();
            
            var stopwatch = new Stopwatch();
            stopwatch.Start();
        
            writeRequest.WriteDelimitedTo(memstream);
            
                  

            byte[] messageBuffer = memstream.ToArray();
            //Console.WriteLine($"writeRequest = {writeRequest.ToString()}");
            if (countWrite % 2 == 0){
                //messagesQueue1.Enqueue(writeRequest);   
                messagesQueueBytesBlocking1.Add(messageBuffer); 

            } else {
                //messagesQueue2.Enqueue(writeRequest);   
                messagesQueueBytesBlocking2.Add(messageBuffer); 
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
