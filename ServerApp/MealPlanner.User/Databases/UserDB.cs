using System;
using System.Threading.Tasks;
using T = MealPlanner.User.Databases.Table;
using static MealPlanner.User.Databases.Database;
using System.IO;
using Microsoft.Data.Sqlite;
using System.Collections.Generic;
using System.Linq;

#nullable enable

namespace MealPlanner.User.Databases
{
    public record User
        ( long Id,
          string Email,
          string Password,
          string FirstName,
          string LastName );

    public record ParamQueryLogin
        ( string Email,
          string Password );

    public class UserDB : IDisposable
    {
        private readonly SqliteConnection ReadWriteConnection;
        private readonly SqliteConnection ReadOnlyConnection;
        private static readonly string commandCreateDatabase = $@"
CREATE TABLE IF NOT EXISTS {T.User.Table} (
    {T.User.Id} INTEGER NOT NULL PRIMARY KEY,
    {T.User.Email} TEXT NOT NULL,
    {T.User.Password} TEXT NOT NULL,
    {T.User.FirstName} TEXT NULL,
    {T.User.LastName} TEXT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON {T.User.Table} ({T.User.Email});
CREATE TABLE IF NOT EXISTS {T.BetaUser.Table} (
    {T.BetaUser.Id} INTEGER NOT NULL PRIMARY KEY,
    {T.BetaUser.Email} TEXT NOT NULL);";

        public UserDB()
        {
            var connectionString = $"Data Source={Path.Combine(AppDir, "users.db")}";
            ExecuteCommand($"{connectionString};Mode=ReadWriteCreate;", commandCreateDatabase);
            ReadWriteConnection = new SqliteConnection($"{connectionString};Mode=ReadWrite;");
            ReadWriteConnection.Open();
            ReadOnlyConnection = new SqliteConnection($"{connectionString};Mode=ReadOnly;");
            ReadOnlyConnection.Open();
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
            if ((await IsBetaUser(email)) is null) return null;

            var @params = new DBParams[]
            {
                new(T.User._Email, email),
                new(T.User._Password, password),
                new(T.User._FirstName, (firstName as object) ?? DBNull.Value),
                new(T.User._LastName, (lastName as object) ?? DBNull.Value),
            };

            return await ExecuteCommandAsync<long?>(ReadWriteConnection, createUserCommand, @params);
        }

        private static readonly string addBetaUser = $@"
INSERT INTO {T.BetaUser.Table} ({T.BetaUser.Email})
VALUES ({T.BetaUser._Email});
SELECT last_insert_rowid();";
        public Task<long?> AddBetaUser(string email)
        {
            var @params = new DBParams[]
            {
                new(T.BetaUser._Email, email),
            };

            return ExecuteCommandAsync<long?>(ReadWriteConnection, addBetaUser, @params);
        }

        private static readonly string getBetaUsers = $@"
SELECT {T.BetaUser.Email}
FROM {T.BetaUser.Table};";
        public async Task<IEnumerable<string>> GetBetaUsers()
        {
            var list = new List<string?>();
            await ExecuteCommandAsync(
                ReadOnlyConnection,
                getBetaUsers,
                x => list.Add(x[T.BetaUser.Email] as string)
                ,Array.Empty<DBParams>());
#pragma warning disable CS8619 // Nullability of reference types in value doesn't match target type.
            return list.Where(x => x is { });
#pragma warning restore CS8619 // Nullability of reference types in value doesn't match target type.
        }

        private static readonly string isBetaUserQuery = $@"
SELECT {T.BetaUser.Id}
FROM {T.BetaUser.Table}
WHERE {T.BetaUser.Email} = {T.BetaUser._Email}";
        private Task<long?> IsBetaUser(string email)
        {
            var @params = new DBParams[]
            {
                new(T.BetaUser._Email, email),
            };

            return ExecuteCommandAsync<long?>(ReadOnlyConnection, isBetaUserQuery, @params);
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
