using MealPlanner.Core;
using MealPlanner.User.Databases;
using Proto;
using System.Threading.Channels;
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
        private UserDB userDB;

        public UserActor()
        {
            userDB = new UserDB();
        }

        public async Task ReceiveAsync(IContext context)
        {
            _ = context.Message switch
            {
                LoginUser loginUser => await ProcessLoginUser(context, loginUser),
                RegisterUser registerUser => await ProcessRegisterUser(context, registerUser),
                Started _ => await Init(),
                Stopped _ => await Dispose(),
                _ => Unit.Default,
            };
        }

        private async Task<Unit> Dispose()
        {
            await userDB.Dispose();
            return Unit.Default;
        }

        private async Task<Unit> Init()
        {
            await userDB.Init();
            return Unit.Default;
        }

        private async Task<Unit> ProcessRegisterUser(IContext context, RegisterUser registerUser)
        {
            var userId = await userDB.CreateUser(
                email: registerUser.Email,
                password: registerUser.EncryptedPassword,
                firstName: registerUser.FirstName,
                lastName: registerUser.LastName );
            context.Respond(userId);
            return Unit.Default;
        }

        private async Task<Unit> ProcessLoginUser(IContext context, LoginUser loginUser)
        {
            var userId = await userDB.ValidateUser(loginUser.Email, loginUser.EncryptedPassword);
            context.Respond(userId);
            return Unit.Default;
        }
    }
}
