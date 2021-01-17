using System;
using System.Threading.Tasks;
using T = MealPlanner.User.Table;
using static MealPlanner.User.Database;

namespace MealPlanner.User
{
    public record Session
        ( Guid Id,
          long Expiration,
          int? UserId,
          bool Deleted );

    public record NewSession
        ( Guid Id,
          long Expiration );

    public record QueryResultSessionData
        ( int? UserId,
          long Expiration );

    public static class SessionDB
    {
        private static readonly string commandAddUser = $@"
INSERT INTO {T.Session.Table} ({T.Session.Id}, {T.Session.Expiration}, {T.Session.UserId})
VALUES (@{T.Session.Id}, @{T.Session.Expiration}, @{T.Session.UserId});";
        public static Task LoginUser(Session session)
            => ExecuteCommandAsync(commandAddUser,
                new DBParams[]
                {
                    new(T.Session.UserId, session.UserId),
                    new(T.Session.Id, session.Id.ToString()),
                    new(T.Session.Expiration, session.Expiration),
                });

        private static readonly string commandCreateSession = $@"
INSERT INTO {T.Session.Table} ({T.Session.Id}, {T.Session.Expiration})
VALUES (@{T.Session.Id}, @{T.Session.Expiration});";
        public static async Task<NewSession> CreateSession()
        {
            var session = new NewSession(Id: Guid.NewGuid(), Expiration: DateTimeOffset.Now.AddMonths(1).ToUnixTimeSeconds());
            await ExecuteCommandAsync(
                commandCreateSession,
                new DBParams[]
                {
                    new(T.Session.Id, session.Id.ToString()),
                    new(T.Session.Expiration, session.Expiration),
                });

            return session;
        }

        private static readonly string queryAll = $@"
SELECT {T.Session.Id}, {T.Session.Expiration}, {T.Session.UserId}, {T.Session.Deleted}
FROM {T.Session.Table}
WHERE {T.Session.Expiration} > @{T.Session.Expiration};";
        public static void GetAll(Action<Session> action)
            => ExecuteCommand(queryAll, reader =>
            {
                var userId = reader[T.Session.UserId] as int?;
                var sessionId = Guid.Parse(reader[T.Session.Id].ToString());
                action(new Session
                ( Expiration: (long)reader[T.Session.Expiration],
                  Id: sessionId,
                  UserId: userId,
                  Deleted: (bool)reader[T.Session.Deleted]) );
            }, new DBParams[]
            {
                new(T.Session.Expiration, DateTimeOffset.UtcNow.ToUnixTimeSeconds()),
            });

        private static readonly string removeSession = $@"
INSERT INTO {T.Session.Table} ({T.Session.Id}, {T.Session.Expiration}, {T.Session.Deleted})
VALUES (@{T.Session.Id}, @{T.Session.Expiration}, true);";
        public static Task RemoveSession(Guid sessionId)
            => ExecuteCommandAsync(removeSession, new DBParams[]
            {
                new(T.Session.Id, sessionId.ToString()),
                new(T.Session.Expiration, DateTimeOffset.UtcNow.AddMonths(1).ToUnixTimeSeconds()),
            });
    }
}
