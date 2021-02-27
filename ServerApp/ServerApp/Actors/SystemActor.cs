using Proto;

#nullable enable

namespace ServerApp.Actors
{
    public class SystemActor
    {
        public static readonly ActorSystem System = new();

        public SystemActor()
        {
            //System.EventStream.Subscribe<DeadLetterEvent>(msg => Console.WriteLine($"Sender: {msg.Sender}, Pid: {msg.Pid}, Message: {msg.Message}"));
            User = new UserProcess(System);
        }

        public UserProcess User { get; private set; }
    }
}
