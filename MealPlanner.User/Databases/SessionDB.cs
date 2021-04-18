using System;
using System.IO;
using T = MealPlanner.User.Databases.Table.Session;
using static MealPlanner.User.Databases.Database;
using System.Threading.Tasks;
using Microsoft.Data.Sqlite;

#nullable enable

namespace MealPlanner.User.Databases
{

    public class SessionDB
    {
        private readonly SqliteConnection ConnectionStringReadOnly;
        private readonly SqliteConnection ConnectionStringReadWrite;

        private static readonly string commandCreateDatabase = $@"
CREATE TABLE IF NOT EXISTS {T.Table} (
    {T.SessionId} TEXT NOT NULL,
    {T.UserId} INTEGER NOT NULL DEFAULT 0,
    {T.CreatedDate} INTEGER NOT NULL );
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_user_id ON {T.Table} ({T.UserId}, {T.SessionId});
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_session_id ON {T.Table} ({T.SessionId});";
        public SessionDB(
            SqliteConnection connectionStringReadWriteCreate,
            SqliteConnection connectionStringReadOnly,
            SqliteConnection connectionStringReadWrite)
        {
            ExecuteCommand(connectionStringReadWriteCreate, commandCreateDatabase);
            ConnectionStringReadOnly = connectionStringReadOnly;
            ConnectionStringReadWrite = connectionStringReadWrite;
        }

        public void Dispose()
        {
            ConnectionStringReadOnly.Close();
            ConnectionStringReadWrite.Close();
        }

        private static readonly string commandCreateSession = $@"
INSERT INTO {T.Table} ({T.SessionId}, {T.CreatedDate}, {T.UserId})
VALUES ({T._SessionId}, {T._CreatedDate}, {T._UserId});";
        public async Task<string> CreateSession(long userId)
        {
            var session = Convert.ToBase64String(Guid.NewGuid().ToByteArray())[0..^2].ToString();
            await ExecuteCommandAsync(ConnectionStringReadWrite, commandCreateSession, null, new DBParams[]
            {
                new(T._UserId, userId),
                new(T._SessionId, session),
                new(T._CreatedDate, DateTimeOffset.UtcNow.ToUnixTimeSeconds()),
            });
            return session;
        }

        private static readonly string commandGetSession = $@"
SELECT {T.UserId}
FROM {T.Table}
WHERE {T.SessionId} = {T._SessionId};";
        public long? GetSession(string session)
            => ExecuteCommand<long?>(ConnectionStringReadOnly, commandGetSession, new DBParams(T._SessionId, session));

        private static readonly string commandDeleteSession = $@"
DELETE FROM {T.Table}
WHERE {T.SessionId} = {T._SessionId};";
        public Task DeleteSession(string session)
            => ExecuteCommandAsync(ConnectionStringReadWrite, commandCreateSession, null, new DBParams(T._SessionId, session));

        private static readonly string commandDeleteAllUserSession = $@"
DELETE FROM {T.Table}
WHERE {T.UserId} = {T._UserId};";
        public Task DeleteAllUserSession(long userId)
            => ExecuteCommandAsync(ConnectionStringReadWrite, commandCreateSession, null, new DBParams(T._UserId, userId));

    }
}
