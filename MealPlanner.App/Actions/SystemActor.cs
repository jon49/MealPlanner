using Proto;
using System.Diagnostics;
using System.IO;
using static MealPlanner.App.Utils.Paths;

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

            var dbPath = Path.Combine(GetAppDir(), "users.db");
            User = new(_system, strategy, dbPath);
        }

        public User.User User { get; }
    }
}
