using System.Net;
using System.Net.Sockets;
using System.Text;
using Google.Protobuf;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using System.Diagnostics;
using System.IO.Pipelines;
using Pipelines.Sockets.Unofficial;

// Hello World! program
namespace HelloWorld
{
    class Hello {   


        protected static async void connectToSocketTCP() {
            IPEndPoint ipEndPoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 11224);            

            using Socket listener = new(
            ipEndPoint.AddressFamily,
            SocketType.Stream,
            ProtocolType.Tcp);
            System.Console.WriteLine("Listen");      
            listener.Bind(ipEndPoint);
            listener.Listen(100);
            System.Console.WriteLine("Bind Done");      
            var handler = await listener.AcceptAsync();
            int count = 0;
            while (true)
            {
                // Receive message.
               // System.Console.WriteLine("ReceiveAsync before");      
                var buffer = new byte[1_024];
                var received = await handler.ReceiveAsync(buffer, SocketFlags.None);
                var response = Encoding.UTF8.GetString(buffer, 0, received);
                //System.Console.WriteLine("ReceiveAsync");      
                var eom = "<|EOM|>";
                if (response.IndexOf(eom) > -1 /* is end of message */)
                {
                  //  Console.WriteLine(
                    //    $"Socket server received message: \"{response.Replace(eom, "")}\"");

                    var ackMessage = "<|ACK|>";
                    var echoBytes = Encoding.UTF8.GetBytes(ackMessage);
                    await handler.SendAsync(echoBytes, 0);
                    //Console.WriteLine(
                      //  $"Socket server sent acknowledgment: \"{ackMessage}\"");

                    //break;
                }
                ++count;
                // Sample output:
                //    Socket server received message: "Hi friends 👋!"
                //    Socket server sent acknowledgment: "<|ACK|>"
            }
            System.Console.WriteLine("Hello World! Done");


        }      
        protected static async void connectToSocketUDS() {
//            IPEndPoint ipEndPoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 11224);            
            var endpoint = new UnixDomainSocketEndPoint("/tmp/asaf1111");
            


            using Socket listener = new(
            endpoint.AddressFamily,
            SocketType.Stream,
            ProtocolType.IP);
            System.Console.WriteLine("Listen UDS");      
            listener.Bind(endpoint);
            listener.Listen(100);
            System.Console.WriteLine("Bind Done");      
            var handler = await listener.AcceptAsync();
            int count = 0;
            while (true)
            {
                // Receive message.
               // System.Console.WriteLine("ReceiveAsync before");      
                var buffer = new byte[1_024];
                var received = await handler.ReceiveAsync(buffer, SocketFlags.None);
                var response = Encoding.UTF8.GetString(buffer, 0, received);
                //System.Console.WriteLine("ReceiveAsync");      
                var eom = "<|EOM|>";
                if (response.IndexOf(eom) > -1 /* is end of message */)
                {
                  //  Console.WriteLine(
                    //    $"Socket server received message: \"{response.Replace(eom, "")}\"");

                    var ackMessage = "<|ACK|>";
                    var echoBytes = Encoding.UTF8.GetBytes(ackMessage);
                    await handler.SendAsync(echoBytes, 0);
                    //Console.WriteLine(
                      //  $"Socket server sent acknowledgment: \"{ackMessage}\"");

                    //break;
                }
                ++count;
                // Sample output:
                //    Socket server received message: "Hi friends 👋!"
                //    Socket server sent acknowledgment: "<|ACK|>"
            }
            System.Console.WriteLine("Hello World! Done");


        }    
      protected static async void connectToSocketUDSBabushka(bool use_uds, String socketName, int port) {
//            IPEndPoint ipEndPoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 11224); 
            
            Console.WriteLine($"socketName {socketName} port = {port}");  
            var endpoint = new UnixDomainSocketEndPoint(socketName);
            IPEndPoint ipEndPoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), port);            
            Socket listener = null;
            if (use_uds){
                listener = new(
                    endpoint.AddressFamily,
                    SocketType.Stream,
                    ProtocolType.IP);
                    System.Console.WriteLine("Listen UDS");      
                    listener.Bind(endpoint);
                    listener.Listen(100);
                    System.Console.WriteLine("Bind Done");      
            } else {                

                listener = new(
                    ipEndPoint.AddressFamily,
                    SocketType.Stream,
                    ProtocolType.Tcp);
                System.Console.WriteLine("Listen");      
                    listener.Bind(ipEndPoint);
                    listener.Listen(100);
                    System.Console.WriteLine("Bind Done");      
            }
            
            var handler = await listener.AcceptAsync();            
            int count = 0;
            var stream = new NetworkStream(handler, FileAccess.Read, false);
            var stream_w = new NetworkStream(handler, FileAccess.Write, false);

            var buffer = new byte[1_024];

            var responseFromSocket = await Task.Run(() => RedisRequest.RedisRequest.Parser.ParseDelimitedFrom(stream));
            Console.WriteLine($"ReadFromSocket read {responseFromSocket} message");  

            var ackMessage = "<|ACK|>"; 
            var echoBytes = Encoding.UTF8.GetBytes(ackMessage);
            await handler.SendAsync(echoBytes, 0);           

            var stopwatch = new Stopwatch();
            stopwatch.Start();
            while (true)
            {
                // Receive message.
               // System.Console.WriteLine("ReceiveAsync before");      
                   
                
                responseFromSocket = await Task.Run(() => RedisRequest.RedisRequest.Parser.ParseDelimitedFrom(stream));
              //  Console.WriteLine($"ReadFromSocket read {responseFromSocket} message"); 
                var response = new Response.Response { CallbackIdx = responseFromSocket.CallbackIdx, ConstantResponse = Response.ConstantResponse.Ok };
                response.WriteDelimitedTo(stream_w);
                ++count;
                if (count == 1000000) {
                    stopwatch.Stop();                  
                    double elaspsedTimeWrite = (double)(stopwatch.ElapsedMilliseconds);
                    Console.WriteLine($"elapsed = {elaspsedTimeWrite}");
                    Console.WriteLine($"TPS = {1000*(1000000.0/elaspsedTimeWrite)}");
                    stopwatch = new Stopwatch();
                    stopwatch.Start();
                    count = 0;
                }



                // Sample output:
                //    Socket server received message: "Hi friends 👋!"
                //    Socket server sent acknowledgment: "<|ACK|>"
            }
            System.Console.WriteLine("Hello World! Done");


        }  

        static void Main(string[] args)
        {
            System.Console.WriteLine("Hello World!");
            bool use_uds = false;
            Thread T_serv1 = new Thread(()=> connectToSocketUDSBabushka(use_uds, "/tmp/asaf1", 11223));
            Thread T_serv2 = new Thread(()=> connectToSocketUDSBabushka(use_uds, "/tmp/asaf2", 11224));
            Thread T_serv3 = new Thread(()=> connectToSocketUDSBabushka(use_uds, "/tmp/asaf3", 11225));
            Thread T_serv4 = new Thread(()=> connectToSocketUDSBabushka(use_uds, "/tmp/asaf4", 11226));
            T_serv1.Name = "Serv1";
            T_serv2.Name = "Serv2";
            T_serv3.Name = "Serv3";
            T_serv4.Name = "Serv4";            
            T_serv1.Priority = ThreadPriority.Highest;  
            T_serv2.Priority = ThreadPriority.Highest;  
            T_serv3.Priority = ThreadPriority.Highest;  
            T_serv4.Priority = ThreadPriority.Highest;  
            T_serv1.Start();
            T_serv2.Start();
            T_serv3.Start();
            T_serv4.Start();
            while(true){ Thread.Sleep(2000);}
     
        }
    }
}
