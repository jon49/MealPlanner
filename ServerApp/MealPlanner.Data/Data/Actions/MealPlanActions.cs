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
            if (MealTimes.Count == 0)
            {
                return new MealPlanModel[7];
            }

            DateTime? date = null;
            if (startDate is { })
            {
                date = startDate;
            }

            if (!date.HasValue)
            {
                date = DateTime.UtcNow;
            }

            var dates =
                Enumerable.Range(0, 7)
                .Select(x => ToMealPlanId(date.Value.AddDays(x)));

            var mealPlans = new MealPlanModel[7];
            var count = 0;
            var rand = new Random();
            foreach (var d in dates)
            {
                if (d is { } && MealPlans.TryGetValue(d, out var value))
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
                    userAction.Save(new MealPlan(newPlan.Date, newPlan.Recipes.Select(x => x.Id ?? 0).ToArray()));
                }
            }

            return mealPlans;
        }

    }
}
