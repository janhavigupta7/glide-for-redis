using System.Net;
using System.Net.Sockets;
using System.Text;

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
        static void Main(string[] args)
        {
            System.Console.WriteLine("Hello World!");
            Task.Run(() =>
            {
                connectToSocketTCP();
            });
            while(true){}
     
        }
    }
}
