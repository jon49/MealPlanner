﻿using System;
using System.Threading.Tasks;
using T = MealPlanner.User.Databases.Table;
using static MealPlanner.User.Databases.Database;
using System.IO;

#nullable enable

namespace MealPlanner.User.Databases
{
    public record Session
        ( Guid Id,
          long Expiration,
          long? UserId,
          bool Deleted );

    public record QueryResultSessionData
        ( int? UserId,
          long Expiration );

    public static class SessionDB
    {
        private static readonly string ConnectionString = $@"Data Source={Path.Combine(AppDir, "sessions.db")}";
        private static readonly string ConnectionStringReadOnly = $@"{ConnectionString};Mode=ReadOnly;";
        private static readonly string ConnectionStringReadWrite = $@"{ConnectionString};Mode=ReadWrite;";
        private static readonly string ConnectionStringReadWriteCreate = $@"{ConnectionString};Mode=ReadWriteCreate;";

        private static readonly string commandCreateDatabase = $@"
CREATE TABLE IF NOT EXISTS {T.Session.Table} (
    {T.Session.Id} TEXT NOT NULL,
    {T.Session.Expiration} INTEGER NOT NULL,
    {T.Session.UserId} INTEGER NOT NULL DEFAULT 0,
    {T.Session.Deleted} INTEGER NOT NULL DEFAULT 0);";
        public static void Init()
        {
            ExecuteCommand(ConnectionStringReadWriteCreate, commandCreateDatabase);
        }

        private static readonly string commandSaveSession = $@"
INSERT INTO {T.Session.Table} ({T.Session.Id}, {T.Session.Expiration}, {T.Session.UserId}, {T.Session.Deleted})
VALUES ({T.Session._Id}, {T.Session._Expiration}, {T.Session._UserId}, {T.Session._Deleted});";
        public static Task SaveSession(Session session)
            => ExecuteCommandAsync(ConnectionStringReadWrite, commandSaveSession, new DBParams[]
            {
                new(T.Session._UserId, session.UserId ?? 0),
                new(T.Session._Id, session.Id.ToString()),
                new(T.Session._Expiration, session.Expiration),
                new(T.Session._Deleted, session.Deleted),
            });

        private static readonly string queryAll = $@"
SELECT {T.Session.Id}, {T.Session.Expiration}, {T.Session.UserId}, {T.Session.Deleted}
FROM {T.Session.Table}
WHERE {T.Session.Expiration} > {T.Session._Expiration};";
        public static void GetAll(Action<Session> action)
            => ExecuteCommand(ConnectionStringReadOnly, queryAll, reader =>
            {
                var userId = reader[T.Session.UserId] as int?;
                var sessionId = Guid.Parse(reader[T.Session.Id].ToString());
                action(new Session
                ( Expiration: (long)reader[T.Session.Expiration],
                  Id: sessionId,
                  UserId: userId,
                  Deleted: ((long)reader[T.Session.Deleted]) > 0 ));
            }, new DBParams[]
            {
                new(T.Session._Expiration, DateTimeOffset.UtcNow.ToUnixTimeSeconds()),
            });
    }
}
