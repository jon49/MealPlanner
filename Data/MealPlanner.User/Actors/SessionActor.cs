using LanguageExt;
using MealPlanner.User.Databases;
using Proto;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MealPlanner.User.Actors
{
    public record LogoutSession
        ( Guid Id );

    public record GetSession
        ( Guid Id );

    public record NewSession();

    public record LoginSession
        ( Guid Id,
          long UserId );

    public record Hydrate();

    public class SessionActor : IActor
    {
        private PID _persist;
        private readonly SortedDictionary<Guid, Session> S = new();

        public Task ReceiveAsync(IContext context)
        {
            _ = context.Message switch
            {
                GetSession getSession => ProcessGetSession(context, getSession),
                NewSession _ => ProcessNewSession(context),
                LogoutSession logoutSession => ProcessLogoutSession(context, logoutSession),
                LoginSession loginSession => ProcessLoginSession(context, loginSession),
                Hydrate _ => Unit.Default,
                Started _ => ProcessStart(context),
                _ => Unit.Default,
            };

            return Task.CompletedTask;
        }

        private long GetUnixTime() => DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        private Unit ProcessLoginSession(IContext context, LoginSession loginSession)
        {
            if (GetValidSession(loginSession.Id, out var session))
            {
                var loggedInSession = session with { UserId = loginSession.UserId };
                S[session.Id] = loggedInSession;
                context.Send(_persist, loggedInSession);
                context.Respond(loggedInSession);
            }
            else
            {
                context.Respond(null);
            }

            return Unit.Default;
        }

        private Unit ProcessGetSession(IContext context, GetSession getSession)
        {
            if (GetValidSession(getSession.Id, out var session))
            {
                context.Respond(session);
            }
            else
            {
                context.Respond(null);
            }
            return Unit.Default;
        }

        private Unit ProcessLogoutSession(IContext context, LogoutSession logoutSession)
        {
            if (S.ContainsKey(logoutSession.Id))
            {
                var session = new Session(Id: logoutSession.Id, 0, 0, true);
                S[session.Id] = session;
                context.Send(_persist, session);
                context.Respond(session);
            }
            else
            {
                context.Respond(null);
            }
            return Unit.Default;
        }

        private Unit ProcessNewSession(IContext context)
        {
            var expiration = DateTimeOffset.UtcNow.AddMonths(1).ToUnixTimeSeconds();
            var session = new Session(
                    Deleted: false,
                    Expiration: expiration,
                    Id: Guid.NewGuid(),
                    UserId: null);
            S.Add(session.Id, session);

            context.Send(_persist, session);

            context.Respond(session);

            return Unit.Default;
        }

        private bool GetValidSession(Guid id, out Session value, out long time)
        {
            time = GetUnixTime();
            if (S.TryGetValue(id, out var session) && !session.Deleted && session.Expiration > time)
            {
                value = session;
                return true;
            }

            value = null;
            return false;
        }

        private bool GetValidSession(Guid id, out Session value)
        {
            if (GetValidSession(id, out var session, out var _))
            {
                value = session;
                return true;
            }

            value = null;
            return false;
        }

        private Unit ProcessStart(IContext context)
        {
            var strategy = new OneForOneStrategy((pid, reason) => SupervisorDirective.Resume, 1, null);
            var props =
                Props.FromProducer(() => new UpdateSessionActor())
                .WithChildSupervisorStrategy(strategy);
                //    new OneForOneStrategy((pid, reason) =>
                //{
                //    Debug.WriteLine(reason.ToString());
                //    return SupervisorDirective.Resume;
                //}, 1, TimeSpan.FromSeconds(2)));
            _persist = context.Spawn(props);

            SessionDB.GetAll(session =>
            {
                S[session.Id] = session;
            });

            return Unit.Default;
        }

    }
}
