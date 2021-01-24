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

    public record QueryResultSessionData
        ( int? UserId,
          long Expiration );

    public static class SessionDB
    {

        private static readonly string commandSaveSession = $@"
INSERT INTO {T.Session.Table} ({T.Session.Id}, {T.Session.Expiration}, {T.Session.UserId}, {T.Session.Deleted})
VALUES (@{T.Session.Id}, @{T.Session.Expiration}, @{T.Session.UserId}, @{T.Session.Deleted});";
        public static Task SaveSession(Session session)
            => ExecuteCommandAsync(commandSaveSession, new DBParams[]
            {
                new(T.Session.UserId, session.UserId ?? 0),
                new(T.Session.Id, session.Id.ToString()),
                new(T.Session.Expiration, session.Expiration),
                new(T.Session.Deleted, session.Deleted),
            });

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
    }
}
