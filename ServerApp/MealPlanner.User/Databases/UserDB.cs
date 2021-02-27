using System;
using System.Threading.Tasks;
using T = MealPlanner.User.Databases.Table;
using static MealPlanner.User.Databases.Database;
using System.IO;
using Microsoft.Data.Sqlite;

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

    public class UserDB
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
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON {T.User.Table} ({T.User.Email});";

        public UserDB()
        {
            var connectionString = $"Data Source={Path.Combine(AppDir, "users.db")}";
            ExecuteCommand($"{connectionString};Mode=ReadWriteCreate;", commandCreateDatabase);
            ReadWriteConnection = new SqliteConnection($"{connectionString};Mode=ReadWrite;");
            ReadOnlyConnection = new SqliteConnection($"{connectionString};Mode=ReadOnly;");
        }

        public Task Init()
        {
            var open1Task = ReadWriteConnection.OpenAsync();
            var open2Task = ReadOnlyConnection.OpenAsync();
            return Task.WhenAll(open1Task, open2Task);
        }

        public Task Dispose()
        {
            var close1Task = ReadOnlyConnection.CloseAsync();
            var close2Task = ReadWriteConnection.CloseAsync();
            return Task.WhenAll(close1Task, close2Task);
        }

        private static readonly string createUserCommand = $@"
INSERT INTO {T.User.Table} ({T.User.Email}, {T.User.FirstName}, {T.User.LastName}, {T.User.Password})
SELECT {T.User._Email}, {T.User._FirstName}, {T.User._LastName}, {T.User._Password}
WHERE NOT EXISTS (SELECT * FROM {T.User.Table} WHERE {T.User.Email} = {T.User._Email});
SELECT last_insert_rowid();";
        public Task<long?> CreateUser(string email, string password, string? firstName, string? lastName)
        {
            var @params = new DBParams[]
            {
                new(T.User._Email, email),
                new(T.User._Password, password),
                new(T.User._FirstName, (firstName as object) ?? DBNull.Value),
                new(T.User._LastName, (lastName as object) ?? DBNull.Value),
            };

            return ExecuteCommandAsync<long?>(ReadWriteConnection, createUserCommand, @params);
        }

        private static readonly string loginCommand = $@"
SELECT {T.User.Id}
FROM {T.User.Table}
WHERE {T.User.Email} = {T.User._Email}
  AND {T.User.Password} = {T.User._Password}";
        public async Task<long?> ValidateUser(string email, string encryptedPassword)
        {
            var @params = new DBParams[]
            {
                new(T.User._Email, email),
                new(T.User._Password, encryptedPassword),
            };
            var result = await ExecuteCommandAsync<long?>(ReadOnlyConnection, loginCommand, @params);

            return result;
        }
    }
}
