using MealPlanner.User.Databases;
using Microsoft.Data.Sqlite;
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using MealPlanner.User.Dto;

#nullable enable

namespace MealPlanner.User.Actions
{
    internal class UserAction : IDisposable
    {
        private readonly UserDB userDB;
        private readonly SessionDB sessionDB;
        private readonly ConcurrentDictionary<string, long?> Sessions = new();

        public UserAction(string userDBPath)
        {
            var ConnectionString = $@"Data Source={userDBPath}";

            using var connectionStringReadWriteCreate = new SqliteConnection($@"{ConnectionString};Mode=ReadWriteCreate;");
            connectionStringReadWriteCreate.Open();

            var connectionStringReadOnly = new SqliteConnection($@"{ConnectionString};Mode=ReadOnly;");
            connectionStringReadOnly.Open();
            var connectionStringReadWrite = new SqliteConnection($@"{ConnectionString};Mode=ReadWrite;");
            connectionStringReadWrite.Open();

            userDB = new(
                connectionStringReadWrite: connectionStringReadWrite,
                connectionStringReadOnly: connectionStringReadOnly,
                connectionStringReadWriteCreate: connectionStringReadWriteCreate);
            sessionDB = new(
                connectionStringReadWrite: connectionStringReadWrite,
                connectionStringReadOnly: connectionStringReadOnly,
                connectionStringReadWriteCreate: connectionStringReadWriteCreate);
        }

        public void Dispose()
        {
            userDB.Dispose();
            sessionDB.Dispose();
        }

        public Task<LoggedInUser?> ProcessRegisterUser(RegisterUser registerUser)
            => CreateSession(userDB.CreateUser(
                email: registerUser.Email,
                password: registerUser.EncryptedPassword,
                firstName: registerUser.FirstName,
                lastName: registerUser.LastName ));

        public long? GetUserId(string session)
            => Sessions.GetOrAdd(session, s => sessionDB.GetUserId(session));

        public Task<LoggedInUser?> ProcessLoginUser(LoginUser loginUser)
            => CreateSession(userDB.ValidateUser(loginUser.Email, loginUser.EncryptedPassword));

        private async Task<LoggedInUser?> CreateSession(Task<long?> userIdTask)
        {
            var userId = await userIdTask;
            if (userId > 0)
            {
                var session = await sessionDB.CreateSession(userId.Value);
                return new(SessionId: session, UserId: userId.Value);
            }
            return null;
        }

    }
}
