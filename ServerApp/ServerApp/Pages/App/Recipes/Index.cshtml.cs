using MealPlanner.Data.Data;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ServerApp.Actions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

#nullable enable

namespace ServerApp.Pages.App.Recipes
{
    public class IndexModel : PageModel
    {
        private readonly UserData _data;

        public IndexModel(UserData data)
        {
            _data = data;
        }

        private long UserId => long.Parse(User.Claims.First(x => x.Type == "userId").Value);
        private Task<UserDataAction> UserAction => _data.GetUserData(UserId);

        public IEnumerable<RecipeViewModel> Recipes { get; set; } = Array.Empty<RecipeViewModel>();

        public async Task OnGetAsync()
        {
            var action = await UserAction;
            var recipes = action.GetAllRecipes();
            Array.Sort(recipes);
            Recipes = recipes.Where(x => x is { }).Select(x => x.ToViewModel());
        }
    }

    public record RecipeViewModel
        ( string Title
        , long Id
        , Uri? Url);

    public static class RecipeViewModelExtensions
    {
        public static RecipeViewModel ToViewModel(this MealPlanner.Data.Data.Recipe recipe)
            => new(
                Title: recipe.Name!,
                Id: recipe.Id!.Value,
                Url: recipe.WebSource?.Url );
    }
}
