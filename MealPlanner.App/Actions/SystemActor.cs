using Proto;

#nullable enable

namespace MealPlanner.App.Actions
{
    public class SystemActor
    {
        private readonly ActorSystem _system = new();

        public SystemActor()
        {
            //System.EventStream.Subscribe<DeadLetterEvent>(msg => Console.WriteLine($"Sender: {msg.Sender}, Pid: {msg.Pid}, Message: {msg.Message}"));
            User = new User(_system);
        }

        public User User { get; }
    }
}
