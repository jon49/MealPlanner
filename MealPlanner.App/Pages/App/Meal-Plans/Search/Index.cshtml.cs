using MealPlanner.App.Actions;
using MealPlanner.Data.Dto.Models.Core;
using Microsoft.AspNetCore.Mvc;
using ServerApp.Pages.Shared;
using System.Collections.Generic;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.App.Pages.App.Meal_Plans.Search
{
    public class IndexModel: BaseUserPage
    {
        public IndexModel(UserData data) : base(data) { }

        [BindProperty(SupportsGet = true)]
        public string? Search { get; set; }
        [BindProperty]
        public bool StrictSearch { get; set; }
        public string? ReturnUrl { get; set; }
        public ResultViewModel? Results { get; set; }
        public string Message { get; set; } = "";
        public string Date { get; set; } = "";

        public void OnGet(string returnUrl, string date)
        {
            ReturnUrl = returnUrl;
            Date = date;
        }

        public async Task<IActionResult> OnPostAsync(string returnUrl, string date)
        {
            ReturnUrl = returnUrl;
            if (Search is null)
            {
                Message = "Search Term Required";
                return IsHTMFRequest()
                    ? Partial("_ErrorMessage", Message)
                : Page();
            }
            var action = await UserAction;
            Results = new(action.SearchRecipes(Search, StrictSearch), returnUrl, date);

            return IsHTMFRequest()
                ? Partial("_SearchResultItems", Results)
            : Page();
        }

        public async Task<IActionResult> OnPostRecipeAsync(string returnUrl, long id, string date)
        {
            var action = await UserAction;
            action.Save(new MealPlanV2(date, new[] { new MealPlanRecipe(id, MealPlanRecipeStatus.Confirmed) }));
            return Redirect(returnUrl);
        }
    }

    public struct ResultViewModel
    {
        public readonly List<Recipe> recipes;
        public readonly string returnUrl;
        public readonly string date;

        public ResultViewModel(List<Recipe> recipes, string returnUrl, string date)
        {
            this.recipes = recipes;
            this.returnUrl = returnUrl;
            this.date = date;
        }
    }
}
