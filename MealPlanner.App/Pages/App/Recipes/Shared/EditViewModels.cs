using MealPlanner.Data.Dto.Models.Core;
using System;
using System.ComponentModel.DataAnnotations;

#nullable enable

namespace ServerApp.Pages.App.Recipes.Shared
{

    public interface IRecipeViewModel
    {
        RecipeViewModel? Recipe { get; set; }
        MealTimeViewModel[] MealTimes { get; set; }
    }

    public class RecipeViewModel
    {
        public long? Id { get; set; }
        [Required, MinLength(1)]
        public string Name { get; set; } = string.Empty;
        public Uri? Url { get; set; }
        public string? BookName { get; set; }
        public int? BookPage { get; set; }
        public string? Other { get; set; }
    }

    public record MealTimeViewModel
        ( string Id
        , string Name
        , bool Selected );

    public record Links(string Name, Uri Link);

    public static class MealTimeExtensions
    {
        public static MealTimeViewModel[] ToMealTimeViewModel(this MealTime[] mealTimes, long[] selected)
        {
            var length = mealTimes.Length;
            var view = new MealTimeViewModel[length];

            var allSelected = length == 1;
            for (int i = 0; i < length; i++)
            {
                var model = mealTimes[i];
                view[i] = new
                    ( Id: model.Id!.Value.ToString()
                    , Name: model.Name
                    , Selected: allSelected || Array.IndexOf(selected, model.Id) > -1);
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

        public static RecipeViewModel ToViewModel(this Recipe recipe)
            => new()
            {
                Id = recipe.Id,
                Name = recipe.Name,
                BookName = recipe.BookName,
                BookPage = recipe.BookPage,
                Other = recipe.Other,
                Url = recipe.Url,
            };
    }
}
