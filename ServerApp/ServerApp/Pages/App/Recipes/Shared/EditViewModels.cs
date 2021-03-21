using MealPlanner.Data.Data;
using System;
using System.ComponentModel.DataAnnotations;
using Model = MealPlanner.Data.Data;

#nullable enable

namespace ServerApp.Pages.App.Recipes.Shared
{
    public class RecipeViewModel
    {
        public int? Id { get; set; }
        [Required, MinLength(1)]
        public string Name { get; set; } = string.Empty;
        public bool[]? MealTimes { get; set; }
        public Uri? Url { get; set; }
        public string? BookName { get; set; }
        public int? BookPage { get; set; }
        public string? Other { get; set; }
    }

    public record MealTimeViewModel
        ( string Id
        , string Name );

    public record Links(string Name, Uri Link);

    public static class MealTimeExtensions
    {
        public static MealTimeViewModel[] ToMealTimeViewModel(this MealTime[] mealTimes)
        {
            var length = mealTimes.Length;
            var view = new MealTimeViewModel[length];

            for (int i = 0; i < length; i++)
            {
                var model = mealTimes[i];
                view[i] = new MealTimeViewModel
                    ( Id: model.Id!.Value.ToString(),
                        Name: model.Name );
            }

            return view;
        }
    }

    public static class RecipeExtensions
    {
        public static Recipe ToModel(this RecipeViewModel recipe, long[] mealTimes)
            => new(
                Id: recipe.Id,
                Name: recipe.Name,
                BookName: recipe.BookName,
                BookPage: recipe.BookPage,
                Other: recipe.Other,
                Url: recipe.Url,
                MealTimes: mealTimes);
    }
}
