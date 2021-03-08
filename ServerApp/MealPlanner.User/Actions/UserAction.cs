using MealPlanner.User.Databases;
using System;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.User.Actions
{
    public record LoginUser
        ( string Email,
          string EncryptedPassword );

    public record RegisterUser
        ( string Email,
          string EncryptedPassword,
          string FirstName,
          string LastName );

    public class UserAction : IDisposable
    {
        private readonly UserDB userDB;

        public UserAction()
        {
            userDB = new UserDB();
        }

        public void Dispose() => userDB.Dispose();

        public async Task<long?> ProcessRegisterUser(RegisterUser registerUser)
        {
            var userId = await userDB.CreateUser(
                email: registerUser.Email,
                password: registerUser.EncryptedPassword,
                firstName: registerUser.FirstName,
                lastName: registerUser.LastName );
            return userId;
        }

        public Task<long?> ProcessLoginUser(LoginUser loginUser)
            => userDB.ValidateUser(loginUser.Email, loginUser.EncryptedPassword);
    }
}
