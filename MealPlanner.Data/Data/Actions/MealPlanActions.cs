using MealPlanner.Data.Dto.Models.Core;
using MealPlanner.Core;
using MealPlanner.Data.Data.Models;
using MealPlanner.Data.Data.Models.DatabaseModels;
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
            this Dictionary<string, MealPlanV2> MealPlans,
            UserDataAction userAction,
            DateTime? startDate,
            Dictionary<long, MealTime> MealTimes,
            Dictionary<long, Recipe> Recipes,
            Random rand)
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

            var mealPlans = new MealPlanModel?[7];
            var count = 0;
            foreach (var date in dates)
            {
                var d = ToMealPlanId(date);
                if (MealPlans.TryGetValue(d ?? "", out var value))
                {
                    var recipes = Recipes.TryGetValuesOrDefault(value.MealPlanRecipes.Select(x => x.RecipeId));
                    mealPlans[count++] = new(Date: d!, Recipes:
                        from x in recipes
                        where x?.Id.HasValue ?? false
                        select x?.ToMealPlanRecipeModel(value.MealPlanRecipes.FirstOrDefault()?.Status ?? MealPlanRecipeStatus.ProgrammaticallyChosen));
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
                        newPlan = new MealPlanModel(Date: d!, new[]
                        {
                            recipe.ToMealPlanRecipeModel(MealPlanRecipeStatus.ProgrammaticallyChosen)
                        });
                        userAction.Save(new MealPlanV2(
                            newPlan.Date,
                            (from x in newPlan.Recipes
                            where x.Id.HasValue
                            select new MealPlanRecipe(x.Id!.Value, x.MealPlanStatus))
                            .ToArray()));
                    }
                    else
                    {
                        newPlan = new MealPlanModel(Date: d!, Array.Empty<MealPlanRecipeModel>());
                    }
                    mealPlans[count++] = newPlan;
                }
            }

            return mealPlans;
        }

    }
}
