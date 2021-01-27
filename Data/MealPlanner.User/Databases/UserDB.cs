using System;
using System.Threading.Tasks;
using T = MealPlanner.User.Databases.Table;
using static MealPlanner.User.Databases.Database;
using System.IO;

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

    public record ParamNewUser
        ( string Email,
          string Password,
          string FirstName,
          string LastName );

    public static class UserDB
    {
        private static readonly string ConnectionString = $"Data Source={Path.Combine(AppDir, "users.db")}";
        private static readonly string ConnectionStringReadOnly = $"{ConnectionString};Mode=ReadOnly;";
        private static readonly string ConnectionStringReadWrite = $"{ConnectionString};Mode=ReadWrite;";
        private static readonly string ConnectionStringReadWriteCreate = $"{ConnectionString};Mode=ReadWriteCreate;";

        private static readonly string commandCreateDatabase = $@"
CREATE TABLE IF NOT EXISTS {T.User.Table} (
    {T.User.Id} INTEGER NOT NULL PRIMARY KEY,
    {T.User.Email} TEXT NOT NULL,
    {T.User.Password} TEXT NOT NULL,
    {T.User.FirstName} TEXT NULL,
    {T.User.LastName} TEXT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON {T.User.Table} ({T.User.Email});";
        public static void Init()
        {
            ExecuteCommand(ConnectionStringReadWriteCreate, commandCreateDatabase);
        }

        private static readonly string createUserCommand = $@"
INSERT INTO {T.User.Table} ({T.User.Email}, {T.User.FirstName}, {T.User.LastName}, {T.User.Password})
SELECT {T.User._Email}, {T.User._FirstName}, {T.User._LastName}, {T.User._Password}
WHERE NOT EXISTS (SELECT * FROM {T.User.Table} WHERE {T.User.Email} = {T.User._Email});
SELECT last_insert_rowid();";
        public static Task<long?> CreateUser(ParamNewUser user)
        {
            var @params = new DBParams[]
            {
                new(T.User._Email, user.Email),
                new(T.User._Password, user.Password),
                new(T.User._FirstName, user.FirstName),
                new(T.User._LastName, (object)user.LastName ?? DBNull.Value),
            };

            return ExecuteCommandAsync<long?>(ConnectionStringReadWrite, createUserCommand, @params);
        }

        private static readonly string loginCommand = $@"
SELECT {T.User.Id}
FROM {T.User.Table}
WHERE {T.User.Email} = {T.User._Email}
  AND {T.User.Password} = {T.User._Password}";
        public static async Task<long?> ValidateUser(string email, string encryptedPassword)
        {
            var @params = new DBParams[]
            {
                new(T.User._Email, email),
                new(T.User._Password, encryptedPassword),
            };
            var result = await ExecuteCommandAsync<long?>(ConnectionStringReadOnly, loginCommand, @params);
            return result;
        }
    }
}
