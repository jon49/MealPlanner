using LanguageExt;
using Proto;
using System;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.User.Actors
{
    public record LoginUser
        ( Guid SessionId,
          string Email,
          string EncryptedPassword );

    public record RegisterUser
        ( Guid SessionId,
          string Email,
          string EncryptedPassword,
          string FirstName,
          string LastName );

    public class UserActor : IActor
    {
        private readonly PID _sessionActor;

        public UserActor(PID sessionActor)
        {
            _sessionActor = sessionActor;
        }

        public async Task ReceiveAsync(IContext context)
        {
            _ = context.Message switch
            {
                LoginUser loginUser => await ProcessLoginUser(context, loginUser),
                RegisterUser registerUser => await ProcessRegisterUser(context, registerUser),
                _ => Unit.Default,
            };
        }

        private async Task<Unit> ProcessRegisterUser(IContext context, RegisterUser registerUser)
        {
            var session = await context.RequestAsync<Session?>(_sessionActor, new GetSession(registerUser.SessionId));
            if (session is { })
            {
                var userId = await UserDB.CreateUser(new ParamNewUser(
                    Email: registerUser.Email,
                    Password: registerUser.EncryptedPassword,
                    FirstName: registerUser.FirstName,
                    LastName: registerUser.LastName ));
                if (userId > 0)
                {
                    var loggedInSession =
                        await context.RequestAsync<Session?>(_sessionActor, new LoginSession(registerUser.SessionId, userId.Value));
                    context.Respond(loggedInSession!);
                    return Unit.Default;
                }
            }

            context.Respond(null!);
            return Unit.Default;
        }

        private async Task<Unit> ProcessLoginUser(IContext context, LoginUser loginUser)
        {
            var session = await context.RequestAsync<Session?>(_sessionActor, new GetSession(loginUser.SessionId));
            if (session is { })
            {
                var userId = await UserDB.ValidateUser(loginUser.Email, loginUser.EncryptedPassword);
                if (userId > 0)
                {
                    var loggedInUser =
                        await context.RequestAsync<Session?>(_sessionActor, new LoginSession(loginUser.SessionId, userId.Value));
                    context.Respond(loggedInUser!);
                    return Unit.Default;
                }
            }

            context.Respond(null!);
            return Unit.Default;
        }
    }
}
