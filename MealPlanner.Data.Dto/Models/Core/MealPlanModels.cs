using System;

namespace MealPlanner.Data.Dto.Models.Core
{
    public enum MealPlanRecipeStatus
    {
        ProgrammaticallyChosen,
        Confirmed,
    }
    public record MealPlanRecipe(long RecipeId, MealPlanRecipeStatus Status);
    public record MealPlanV2(string Date, MealPlanRecipe[] MealPlanRecipes);
    [Obsolete]
    public record MealPlan(string Date, long[] RecipeIds);
    public static class MealPlanExtensions
    {
#pragma warning disable CS0612 // Type or member is obsolete
        public static MealPlanV2 ToV2(this MealPlan plan)
#pragma warning restore CS0612 // Type or member is obsolete
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
