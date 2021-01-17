using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MealPlanner.User
{
    public static class Data
    {
        private static readonly SortedDictionary<Guid, Session> Session = new();

        public static void Initialize()
            => SessionDB.GetAll((Action<Session>)(session =>
            {
                if (Session.ContainsKey(session.Id))
                {
                    if (session.Deleted) Session.Remove(session.Id);
                    else Session[session.Id] = session;
                }
                else if (!session.Deleted)
                {
                    Session.Add(session.Id, session);
                }
            }));

        public static async Task<Session> TryGetOrAddOrDeleteSession(Guid? sessionId)
        {
            if (!sessionId.HasValue)
            {
                return await CreateNewSession();
            }

            var now = GetUnixNowInSeconds();
            if (Session.TryGetValue(sessionId.Value, out var session) && session.Expiration > now)
            {
                return session;
            }
            else
            {
                Session.Remove(sessionId.Value);
                return await CreateNewSession();
            }

            static async Task<Session> CreateNewSession()
            {
                var newSession = await SessionDB.CreateSession();
                var fullSession = new Session(Id: newSession.Id, Expiration: newSession.Expiration, UserId: null, Deleted: false);
                Session.Add(newSession.Id, fullSession);
                return fullSession;
            }
        }

        public static async Task<Session> LoginUser(LoginUser user)
        {
            var now = GetUnixNowInSeconds();
            if (Session.TryGetValue(user.SessionId, out var session)
                && session.Expiration > now
                && session.UserId is null)
            {
                var userId = await UserDB.ValidateUser(user.Email, user.EncryptedPassword);
                if (userId > 0)
                {
                    var newSession = session with { UserId = userId };
                    Session[session.Id] = newSession;
                    await SessionDB.LoginUser(newSession);
                    return newSession;
                }
            }
            return null;
        }

        public static Task LogoutUser(Guid sessionId)
        {
            if (Session.ContainsKey(sessionId))
            {
                Session.Remove(sessionId);
                return SessionDB.RemoveSession(sessionId);
            }
            return Task.CompletedTask;
        }

        public static async Task<int?> RegisterNewUser(Guid sessionId, ParamNewUser newUser)
        {
            var now = GetUnixNowInSeconds();
            if (Session.TryGetValue(sessionId, out var session)
                && session.Expiration > now
                && session.UserId is null)
            {
                var result = await UserDB.CreateUser(newUser);
                if (result > 0)
                {
                    var newSession = session with { UserId = result };
                    Session[sessionId] = newSession;
                    await SessionDB.LoginUser(newSession);
                    return newSession.UserId;
                }
            }
            return 0;
        }

        private static long GetUnixNowInSeconds()
            => DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    }
}
