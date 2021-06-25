using MealPlanner.Data.Dto.Models.Core;

namespace MealPlanner.Data.Data.Core
{
    //[Obsolete]
    internal record MealPlan(string Date, long[] RecipeIds);
    internal static class MealPlanExtensions
    {
        public static MealPlanV2 ToV2(this MealPlan plan)
        {
            var length = plan.RecipeIds.Length;
            var recipes = new MealPlanRecipe[length];
            for (int i = 0; i < length; i++)
            {
                recipes[i] = new(plan.RecipeIds[i], MealPlanRecipeStatus.Confirmed);
            }
            return new(plan.Date, recipes);
        }
    }
}
