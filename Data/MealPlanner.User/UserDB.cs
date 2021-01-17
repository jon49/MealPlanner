using System;
using System.Threading.Tasks;
using T = MealPlanner.User.Table;
using static MealPlanner.User.Database;

namespace MealPlanner.User
{
    public record User
        ( int Id,
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
        private static readonly string createUserCommand = @$"
INSERT INTO {T. User.Table} ({T.User.Email}, {T.User.FirstName}, {T.User.LastName}, {T.User.Password})
VALUES (@{T.User.Email}, @{T.User.FirstName}, @{T.User.LastName}, @{T.User.Password})
ON CONFLICT ({T.User.Email}) DO NOTHING
RETURNING {T.User.Id};";
        public static Task<int?> CreateUser(ParamNewUser user)
        {
            var @params = new DBParams[]
            {
                new(T.User.Email, user.Email),
                new(T.User.Password, user.Password),
                new(T.User.FirstName, user.FirstName),
                new(T.User.LastName, (object)user.LastName ?? DBNull.Value),
            };

            return ExecuteCommandAsync<int?>(createUserCommand, @params);
        }

        private static readonly string loginCommand = $@"
SELECT {T.User.Id}
FROM {T.User.Table}
WHERE {T.User.Email} = @{T.User.Email}
  AND {T.User.Password} = @{T.User.Password}";
        public static async Task<int?> ValidateUser(string email, string encryptedPassword)
        {
            var @params = new DBParams[]
            {
                new(T.User.Email, email),
                new(T.User.Password, encryptedPassword),
            };
            var result = await ExecuteCommandAsync<int?>(loginCommand, @params);
            return result;
        }
    }
}
