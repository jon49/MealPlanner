using MealPlanner.Data.Dto.Models.Core;
using Microsoft.AspNetCore.Mvc;
using ServerApp.Actions;
using ServerApp.Pages.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

#nullable enable

namespace ServerApp.Pages.App.Recipes
{
    [ResponseCache(Duration = 10, Location = ResponseCacheLocation.Client, NoStore = false)]
    public class IndexModel : BaseUserPage
    {
        public IndexModel(UserData data) : base(data)
        {
        }

        public IEnumerable<RecipeListViewModel> Recipes { get; set; } = Array.Empty<RecipeListViewModel>();

        public async Task OnGetAsync()
        {
            var action = await UserAction;
            var recipes = action.GetAllRecipes();
            Array.Sort(recipes);
            Recipes = recipes.Where(x => x is { }).Select(x => x.ToListViewModel());
        }
    }

    public record RecipeListViewModel
        ( string Title
        , long Id
        , Uri? Url);

    public static class RecipeViewModelExtensions
    {
        public static RecipeListViewModel ToListViewModel(this Recipe recipe)
            => new(
                Title: recipe.Name!,
                Id: recipe.Id!.Value,
                Url: recipe.Url );
    }
}
