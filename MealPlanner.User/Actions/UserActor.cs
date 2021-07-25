using MealPlanner.User.Dto;
using Proto;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.User.Actions
{
    internal class UserActor : IActor
    {
        private static readonly UserAction _action = new();

        public Task ReceiveAsync(IContext context)
        {
            _ = context.Message switch
            {
                LoginUser x => ProcessLoginUser(context, x),
                RegisterUser x => ProcessRegisterUser(context, x),
                GetUserId x => ProcessGetUserId(context, x),
                AddBetaUser x => ProcessAddBetaUser(context, x),
                _ => Task.CompletedTask,
            };

            return Task.CompletedTask;
        }

        private async Task ProcessAddBetaUser(IContext context, AddBetaUser x)
        {
            context.Respond(await _action.AddBetaUser(x.Email));
        }

        private Task ProcessGetUserId(IContext context, GetUserId x)
        {
            var result = _action.GetUserId(x.Session);
            context.Respond(result!);
            return Task.CompletedTask;
        }

        private async Task ProcessRegisterUser(IContext context, RegisterUser user)
        {
            var result = await _action.ProcessRegisterUser(user);
            context.Respond(result!);
        }

        private async Task ProcessLoginUser(IContext context, LoginUser user)
        {
            var result = await _action.ProcessLoginUser(user);
            context.Respond(result!);
        }
    }
}
