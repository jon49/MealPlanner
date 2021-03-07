using MealPlanner.Data.Actors;
using Proto;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using static MealPlanner.Data.Actors.Actions.Action;

#nullable enable

namespace ServerApp.Actors
{
    public class UserData
    {
        private readonly ActorSystem system;
        private readonly Dictionary<long, PID> userDataActors = new();
        private readonly PID persistenceRef;
        private readonly PID fetchRef;
        private readonly Props userProps;

        public UserData(ActorSystem system)
        {
            this.system = system;
            var strategy = new OneForOneStrategy((pid, reason) =>
            {
                Debug.WriteLine(reason);
                return SupervisorDirective.Resume;
            }, 1, null);
            var persistenceProp = Props.FromProducer(() => new UserDataPersistActor())
                .WithChildSupervisorStrategy(strategy);
            var fetchProp = Props.FromProducer(() => new UserDataFetchActor())
                .WithChildSupervisorStrategy(strategy);
            persistenceRef = system.Root.Spawn(persistenceProp);
            fetchRef = system.Root.Spawn(fetchProp);

            userProps = Props.FromProducer(() => new UserDataActor(persistenceRef, fetchRef))
                .WithChildSupervisorStrategy(strategy);
        }

        public Task<TReturn?> RequestAsync<TReturn>(long userId, object action)
        {
            var userDataRef = GetUserData(userId);
            return system.Root.RequestAsync<TReturn?>(userDataRef, action, TimeSpan.FromMilliseconds(500));
        }

        public void Send(long userId, object action)
        {
            var userDataRef = GetUserData(userId);
            system.Root.Send(userDataRef, action);
        }

        private PID GetUserData(long userId)
        {
            if (userId <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(userId));
            }

            if (userDataActors.TryGetValue(userId, out var pid))
            {
                return pid;
            }
            else
            {
                var actor = system.Root.Spawn(userProps);
                system.Root.Send(actor, new WithUser(userId));
                userDataActors.Add(userId, actor);
                return actor;
            }
        }
    }
}
