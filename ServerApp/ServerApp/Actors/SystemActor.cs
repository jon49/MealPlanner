using Proto;

#nullable enable

namespace ServerApp.Actors
{
    public class SystemActor
    {
        public static readonly ActorSystem system = new();

        public SystemActor()
        {
            //System.EventStream.Subscribe<DeadLetterEvent>(msg => Console.WriteLine($"Sender: {msg.Sender}, Pid: {msg.Pid}, Message: {msg.Message}"));
            User = new UserProcess(system);
            Data = new UserData(system);
        }

        public UserProcess User { get; }
        public UserData Data { get; }
    }
}
