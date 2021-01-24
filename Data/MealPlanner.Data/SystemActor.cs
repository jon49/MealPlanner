using MealPlanner.User;
using MealPlanner.User.Actors;
using Proto;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.Data
{
    public static class SystemActor
    {
        public static readonly ActorSystem System = new();
        public static UserProcess User;

        public static void Init()
        {
            User = new UserProcess(System);
            //System.EventStream.Subscribe<DeadLetterEvent>(msg => Console.WriteLine($"Sender: {msg.Sender}, Pid: {msg.Pid}, Message: {msg.Message}"));
        }
    }

    public class UserProcess
    {
        private readonly PID _sessionRef;
        private readonly PID _userRef;
        private readonly ActorSystem _system;

        public UserProcess(ActorSystem system)
        {
            _system = system;
            var sessionStrategy = new OneForOneStrategy((pid, reason) =>
            {
                Debug.WriteLine(reason);
                return SupervisorDirective.Resume;
            }, 1, null);
            var sessionProps =
                Props.FromProducer(() => new SessionActor())
                .WithChildSupervisorStrategy(sessionStrategy);
            _sessionRef = system.Root.Spawn(sessionProps);
            var userProps = Props.FromProducer(() => new UserActor(_sessionRef));
            _userRef = system.Root.Spawn(userProps);
            system.Root.Send(_sessionRef, null!);
        }

        public void Hydrate()
            => _system.Root.Send(_sessionRef, new Hydrate());

        public Task<Session?> GetSession(Guid sessionId)
            => _system.Root.RequestAsync<Session?>(_sessionRef, new GetSession(Id: sessionId));

        public Task<Session?> LogoutSession(Guid sessionId)
            => _system.Root.RequestAsync<Session?>(_sessionRef, new LogoutSession(Id: sessionId));

        public Task<Session> NewSession()
            => _system.Root.RequestAsync<Session>(_sessionRef, new NewSession());

        public Task<Session?> LoginUser(User.Actors.LoginUser user)
            => _system.Root.RequestAsync<Session?>(_userRef, user);

        public Task<Session?> RegisterUser(RegisterUser user)
            => _system.Root.RequestAsync<Session?>(_userRef, user);
    }
}
