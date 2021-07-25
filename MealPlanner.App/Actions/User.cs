using MealPlanner.User.Actions;
using MealPlanner.User.Dto.Actions;
using Proto;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.App.Actions
{
    public class User
    {
        private readonly PID _userRef;
        private readonly ActorSystem _system;

        public User(ActorSystem system)
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

        public Task<LoggedInUser?> LoginUser(LoginUser user)
            => _system.Root.RequestAsync<LoggedInUser?>(_userRef, user, TimeSpan.FromSeconds(2));

        public Task<LoggedInUser?> RegisterUser(RegisterUser user)
            => _system.Root.RequestAsync<LoggedInUser?>(_userRef, user, TimeSpan.FromSeconds(2));

        public Task<long?> AddBetaUser(AddBetaUser betaUser)
            => _system.Root.RequestAsync<long?>(_userRef, betaUser, TimeSpan.FromSeconds(2));

        public Task<long?> GetBetaUsers()
            => _system.Root.RequestAsync<long?>(_userRef, BetaUsers.Get, TimeSpan.FromSeconds(2));

        public Task<long?> GetSession(string session)
            => _system.Root.RequestAsync<long?>(_userRef, new GetSession(session), TimeSpan.FromSeconds(2));
    }
}
