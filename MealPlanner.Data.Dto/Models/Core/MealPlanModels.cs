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
}
