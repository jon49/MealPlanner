using MealPlanner.User.Dto;
using Proto;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.User.Actions
{
    internal class UserActor : IActor
    {
        private static UserAction? _action;

        public Task ReceiveAsync(IContext context)
            => context.Message switch
            {
                GetUserId x => ProcessGetUserId(context, x),
                LoginUser x => ProcessLoginUser(context, x),
                RegisterUser x => ProcessRegisterUser(context, x),
                Initialize x => ProcessCreate(x),
                _ => Task.CompletedTask,
            };


        private Task ProcessCreate(Initialize x)
        {
            _action = new(x.UserDBPath);
            return Task.CompletedTask;
        }

        private Task ProcessGetUserId(IContext context, GetUserId x)
        {
            var result = _action!.GetUserId(x.Session);
            context.Respond(result!);
            return Task.CompletedTask;
        }

        private async Task ProcessRegisterUser(IContext context, RegisterUser user)
        {
            var result = await _action!.ProcessRegisterUser(user);
            context.Respond(result!);
        }

        private async Task ProcessLoginUser(IContext context, LoginUser user)
        {
            var result = await _action!.ProcessLoginUser(user);
            context.Respond(result!);
        }
    }
}
