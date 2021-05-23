using MealPlanner.Data.Data.Models.DatabaseModels;
using System;
using System.Collections.Generic;

#nullable enable

namespace MealPlanner.Data.Data.Models
{
    public record MealPlanRecipeModel
        ( long? Id,
          string Name,
          string? BookName,
          int? BookPage,
          string? Other,
          Uri? Url,
          long[] MealTimes,
          MealPlanRecipeStatus MealPlanStatus
        ) : Recipe(Id, Name, BookName, BookPage, Other, Url, MealTimes);
    public record MealPlanModel
        (string Date
        , IEnumerable<MealPlanRecipeModel> Recipes);

    public static class ModelsExtensions
    {
        public static MealPlanRecipeModel ToMealPlanRecipeModel(this Recipe recipe, MealPlanRecipeStatus status)
            => new(recipe.Id, recipe.Name, recipe.BookName, recipe.BookPage, recipe.Other, recipe.Url, recipe.MealTimes, status);
        public static MealPlanRecipe ToMealPlanRecipe(this MealPlanRecipeModel model, MealPlanRecipeStatus? status = null)
            => new(model.Id!.Value, status ?? model.MealPlanStatus);
    }
}
