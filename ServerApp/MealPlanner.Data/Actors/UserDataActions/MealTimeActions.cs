using Proto;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MealPlanner.Data.Actors.UserDataActions
{
    internal static class MealTimeActions
    {
        public static Task GetAllMealTimes(this Dictionary<long, MealTime> times, IContext context)
        {
            context.Respond(times.Values.ToArray());
            return Task.CompletedTask;
        }
    }
}
