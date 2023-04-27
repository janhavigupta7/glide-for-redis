using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Diagnostics;


// Hello World! program
namespace HelloWorld
{
    class Hello {   


        protected static async void connectToSocket(bool tcp) {
        Socket client = null;
        if (tcp) {
            IPEndPoint ipEndPoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), 11224);            
        
            client = new(
                ipEndPoint.AddressFamily, 
                SocketType.Stream, 
                ProtocolType.Tcp);
                await client.ConnectAsync(ipEndPoint);
        }else {
            var endpoint = new UnixDomainSocketEndPoint("/tmp/asaf1111");
        
            client = new(
                AddressFamily.Unix, 
                SocketType.Stream, 
                ProtocolType.IP);

            await client.ConnectAsync(endpoint);
        }

        
        var stopwatch = new Stopwatch();
        stopwatch.Start();
        int count = 0;
        while (true)
        {
            // Send message.
            var message = "Hi friends 👋!<|EOM|>";
            var messageBytes = Encoding.UTF8.GetBytes(message);
            _ = await client.SendAsync(messageBytes, SocketFlags.None);
            //Console.WriteLine($"Socket client sent message: \"{message}\"");

            // Receive ack.
            var buffer = new byte[1_024];
            var received = await client.ReceiveAsync(buffer, SocketFlags.None);
            var response = Encoding.UTF8.GetString(buffer, 0, received);
            if (response == "<|ACK|>")
            {
                //Console.WriteLine(
                  //  $"Socket client received acknowledgment: \"{response}\"");
                //break;
            }
            // Sample output:
            //     Socket client sent message: "Hi friends 👋!<|EOM|>"
            //     Socket client received acknowledgment: "<|ACK|>"
            ++count;
            if (count == 1000000) {
                stopwatch.Stop();                  
                double elaspsedTimeWrite = (double)(stopwatch.ElapsedMilliseconds);
                Console.WriteLine($"WriteAverageTime = {elaspsedTimeWrite/1000000.0}");
                break;


            }
        }

        client.Shutdown(SocketShutdown.Both);


        }      
        static void Main(string[] args)
        {
            System.Console.WriteLine("Hello World!");
            Task.Run(() =>
            {  
                connectToSocket(true);
            });
            while(true){}
     
        }
    }
}
