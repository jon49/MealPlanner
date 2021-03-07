using MealPlanner.Data.Databases;
using Proto;
using System.Threading.Tasks;

namespace MealPlanner.Data.Actors
{
    public record GetAllUserData(long UserId);

    public class UserDataFetchActor : IActor
    {
        private readonly ReadDataDB ReadDataDB;

        public UserDataFetchActor()
        {
            ReadDataDB = new ReadDataDB();
        }

        public Task ReceiveAsync(IContext context)
            => context.Message switch
            {
                GetAllUserData user => GetAllUserData(context, user.UserId),
                Started _ => ReadDataDB.Init(),
                Stopped _ => ReadDataDB.Dispose(),
                _ => Task.CompletedTask,
            };

        private async Task GetAllUserData(IContext context, long userId)
        {
            var data = await ReadDataDB.GetAllUserData(userId);
            context.Respond(data);
        }

    }
}
