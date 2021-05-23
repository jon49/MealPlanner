namespace MealPlanner.Data.Data.Models.DatabaseModels
{
    public enum MealPlanRecipeStatus
    {
        ProgrammaticallyChosen,
        Confirmed,
    }
    public record MealPlanRecipe(long RecipeId, MealPlanRecipeStatus Status);
    public record MealPlanV2(string Date, MealPlanRecipe[] MealPlanRecipes);
    internal record MealPlan(string Date, long[] RecipeIds);
    public static class MealPlanExtensions
    {
        internal static MealPlanV2 ToV2(this MealPlan plan)
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
