using MealPlanner.Core;
using MealPlanner.Data.Data.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using static MealPlanner.Data.Shared;

#nullable enable

namespace MealPlanner.Data.Data.Actions
{
    internal static class MealPlanActions
    {
        public static MealPlanModel?[] GetMealPlansForWeek(
            this Dictionary<string, MealPlan> MealPlans,
            UserDataAction userAction,
            DateTime? startDate,
            Dictionary<long, MealTime> MealTimes,
            Dictionary<long, Recipe> Recipes)
        {
            var today = DateTime.UtcNow.AddDays(-1);
            if (MealTimes.Count == 0)
            {
                return new MealPlanModel[7];
            }

            DateTime? start = null;
            if (startDate is { })
            {
                start = startDate;
            }

            if (!start.HasValue)
            {
                start = DateTime.UtcNow;
            }

            var dates =
                Enumerable.Range(0, 7)
                .Select(x => start.Value.AddDays(x));

            var mealPlans = new MealPlanModel[7];
            var count = 0;
            var rand = new Random();
            foreach (var date in dates)
            {
                var d = ToMealPlanId(date);
                if (date is { } && MealPlans.TryGetValue(d ?? "", out var value))
                {
                    var recipes = Recipes.TryGetValuesOrDefault(value.RecipeIds);
                    mealPlans[count++] = new(Date: d, recipes.Where(x => x is { }).ToArray());
                }
                else
                {
                    Recipe? recipe = null;
                    if (date >= today)
                    {
                        recipe = Recipes.RandomValue(rand);
                    }
                    MealPlanModel newPlan;
                    if (recipe is { })
                    {
                        newPlan = new MealPlanModel(Date: d, new[] { recipe });
                        userAction.Save(new MealPlan(newPlan.Date, newPlan.Recipes.Select(x => x.Id ?? 0).ToArray()));
                    }
                    else
                    {
                        newPlan = new MealPlanModel(Date: d, Array.Empty<Recipe>());
                    }
                    mealPlans[count++] = newPlan;
                }
            }

            return mealPlans;
        }

    }
}
