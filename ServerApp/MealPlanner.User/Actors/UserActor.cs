using MealPlanner.Core;
using MealPlanner.User.Databases;
using Proto;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.User.Actors
{
    public record LoginUser
        ( string Email,
          string EncryptedPassword );

    public record RegisterUser
        ( string Email,
          string EncryptedPassword,
          string FirstName,
          string LastName );

    public class UserActor : IActor
    {
        private readonly UserDB userDB;

        public UserActor()
        {
            userDB = new UserDB();
        }

        public Task ReceiveAsync(IContext context)
            => context.Message switch
            {
                LoginUser loginUser => ProcessLoginUser(context, loginUser),
                RegisterUser registerUser => ProcessRegisterUser(context, registerUser),
                Started _ => userDB.Init(),
                Stopped _ => userDB.Dispose(),
                _ => Task.CompletedTask,
            };

        private async Task ProcessRegisterUser(IContext context, RegisterUser registerUser)
        {
            var userId = await userDB.CreateUser(
                email: registerUser.Email,
                password: registerUser.EncryptedPassword,
                firstName: registerUser.FirstName,
                lastName: registerUser.LastName );
            context.Respond(userId);
        }

        private async Task ProcessLoginUser(IContext context, LoginUser loginUser)
        {
            var userId = await userDB.ValidateUser(loginUser.Email, loginUser.EncryptedPassword);
            context.Respond(userId);
        }
    }
}
