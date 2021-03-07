using MealPlanner.Core;
using MealPlanner.Data.Actors.Models;
using Proto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.Data.Actors.UserDataActions
{
    internal static class MealPlanActions
    {
        public static Task GetMealPlansForWeek(
            this Dictionary<string, MealPlan> MealPlans,
            IContext context,
            string? startDate,
            Dictionary<long, MealTime> MealTimes,
            Dictionary<long, Recipe> Recipes)
        {
            if (MealTimes.Count == 0)
            {
                context.Respond(new MealPlanModel[7]);
                return Task.CompletedTask;
            }

            DateTime? date = null;
            if (startDate is { })
            {
                var splitDate = startDate.Split('-').Select(x => int.Parse(x)).ToArray();
                if (splitDate.Length == 3)
                {
                    date = new DateTime(splitDate[0], splitDate[1], splitDate[2]);
                }
            }

            if (!date.HasValue)
            {
                date = DateTime.UtcNow;
            }

            var dates =
                Enumerable.Range(0, 7)
                .Select(x => date.Value.AddDays(x).ToString("yyyy-MM-dd"));

            var mealPlans = new MealPlanModel[7];
            var count = 0;
            var rand = new Random();
            foreach (var d in dates)
            {
                if (MealPlans.TryGetValue(d, out var value))
                {
                    var recipes = Recipes.TryGetValuesOrDefault(value.RecipeIds);
                    mealPlans[count++] = new(Date: d, recipes);
                }
                else
                {
                    var recipe = Recipes.RandomValue(rand);
                    MealPlanModel newPlan;
                    if (recipe is { })
                    {
                        newPlan = new MealPlanModel(Date: d, new[] { recipe });
                    }
                    else
                    {
                        newPlan = new MealPlanModel(Date: d, Array.Empty<Recipe>());
                    }
                    mealPlans[count++] = newPlan;
                    context.Send(context.Self!, new MealPlan(newPlan.Date, newPlan.Recipes.Select(x => x.Id ?? 0).ToArray()));
                }
            }

            context.Respond(mealPlans);

            return Task.CompletedTask;
        }
    }
}
