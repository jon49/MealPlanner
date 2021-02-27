using MealPlanner.User.Actors;
using Proto;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

#nullable enable

namespace ServerApp.Actors
{
    public class UserProcess
    {
        private readonly PID _userRef;
        private readonly ActorSystem _system;

        public UserProcess(ActorSystem system)
        {
            _system = system;
            var strategy = new OneForOneStrategy((pid, reason) =>
            {
                Debug.WriteLine(reason);
                return SupervisorDirective.Resume;
            }, 1, null);
            var userProps = Props.FromProducer(() => new UserActor())
                .WithChildSupervisorStrategy(strategy);
            _userRef = system.Root.Spawn(userProps);
        }

        public Task<long?> LoginUser(LoginUser user)
            => _system.Root.RequestAsync<long?>(_userRef, user, TimeSpan.FromSeconds(2));

        public Task<long?> RegisterUser(RegisterUser user)
            => _system.Root.RequestAsync<long?>(_userRef, user, TimeSpan.FromSeconds(2));
    }
}
