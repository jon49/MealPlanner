#nullable enable

namespace MealPlanner.Data.Actors.Actions
{
    public static class Action
    {
        // Meal Times
        public class GetAllMealTimes { public static GetAllMealTimes Default = new(); }

        // Recipes
        public class GetRandomRecipe { public static GetRandomRecipe Default = new(); }

        // Meal Plans
        public record GetMealPlansForWeek(string? StartDate);

        // Other
        public record GetTempData(string[] Keys);
    }
}
