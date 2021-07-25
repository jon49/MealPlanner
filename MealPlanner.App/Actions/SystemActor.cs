using Proto;
using System.Diagnostics;

#nullable enable

namespace MealPlanner.App.Actions
{
    public class SystemActor
    {
        private readonly ActorSystem _system = new();

        public SystemActor()
        {
            //System.EventStream.Subscribe<DeadLetterEvent>(msg => Console.WriteLine($"Sender: {msg.Sender}, Pid: {msg.Pid}, Message: {msg.Message}"));
            var strategy = new OneForOneStrategy((pid, reason) =>
            {
                Debug.WriteLine(reason);
                return SupervisorDirective.Resume;
            }, 1, null);

            User = new(_system, strategy);
        }

        public User.User User { get; }
    }
}
