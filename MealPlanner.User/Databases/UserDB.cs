using System;
using System.Threading.Tasks;
using T = MealPlanner.User.Databases.Table;
using static MealPlanner.User.Databases.Database;
using Microsoft.Data.Sqlite;
using System.Collections.Generic;
using System.Linq;

#nullable enable

namespace MealPlanner.User.Databases
{
    public class UserDB : IDisposable
    {
        private readonly SqliteConnection ReadWriteConnection;
        private readonly SqliteConnection ReadOnlyConnection;

        private static readonly string commandCreateTable = $@"
CREATE TABLE IF NOT EXISTS {T.User.Table} (
    {T.User.Id} INTEGER NOT NULL PRIMARY KEY,
    {T.User.Email} TEXT NOT NULL,
    {T.User.Password} TEXT NOT NULL,
    {T.User.FirstName} TEXT NULL,
    {T.User.LastName} TEXT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON {T.User.Table} ({T.User.Email});";
        public UserDB(
            SqliteConnection connectionStringReadWriteCreate,
            SqliteConnection connectionStringReadOnly,
            SqliteConnection connectionStringReadWrite)
        {
            ExecuteCommand(connectionStringReadWriteCreate, commandCreateTable);
            ReadWriteConnection = connectionStringReadWrite;
            ReadOnlyConnection = connectionStringReadOnly;
        }

        public void Dispose()
        {
            ReadOnlyConnection.Close();
            ReadWriteConnection.Close();
        }

        private static readonly string createUserCommand = $@"
INSERT INTO {T.User.Table} ({T.User.Email}, {T.User.FirstName}, {T.User.LastName}, {T.User.Password})
SELECT {T.User._Email}, {T.User._FirstName}, {T.User._LastName}, {T.User._Password}
WHERE NOT EXISTS (SELECT * FROM {T.User.Table} WHERE {T.User.Email} = {T.User._Email});
SELECT last_insert_rowid();";
        public async Task<long?> CreateUser(string email, string password, string? firstName, string? lastName)
        {
            var @params = new DBParams[]
            {
                new(T.User._Email, email),
                new(T.User._Password, password),
                new(T.User._FirstName, (firstName as object) ?? DBNull.Value),
                new(T.User._LastName, (lastName as object) ?? DBNull.Value),
            };

            return await ExecuteCommandAsync<long?>(ReadWriteConnection, createUserCommand, @params);
        }

        private static readonly string loginCommand = $@"
SELECT {T.User.Id}
FROM {T.User.Table}
WHERE {T.User.Email} = {T.User._Email}
  AND {T.User.Password} = {T.User._Password}";
        public Task<long?> ValidateUser(string email, string encryptedPassword)
        {
            var @params = new DBParams[]
            {
                new(T.User._Email, email),
                new(T.User._Password, encryptedPassword),
            };

            return ExecuteCommandAsync<long?>(ReadOnlyConnection, loginCommand, @params);
        }
    }
}
