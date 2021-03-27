using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServerApp.Actions;
using ServerApp.Pages.App.Recipes.Shared;
using ServerApp.Pages.Shared;

#nullable enable

namespace ServerApp.Pages.App.Recipes
{
    [ResponseCache(Duration = 5, Location = ResponseCacheLocation.Client, NoStore = false)]
    public class AddModel : BaseUserPage, IRecipeViewModel
    {
        public AddModel(UserData data) : base(data) { }

        [ViewData]
        public string Title => "Add Meal";
        [ViewData]
        public string Header => "Add Meal";

        [BindProperty]
        public RecipeViewModel? Recipe { get; set; }

        public MealTimeViewModel[] MealTimes { get; set; } = Array.Empty<MealTimeViewModel>();
        [BindProperty]
        [Required, MinLength(1)]
        public long[] SelectedMealTimes { get; set; } = Array.Empty<long>();

        public Task OnGetAsync()
        {
            return SetInitials();
        }

        private async Task SetInitials()
        {
            var action = await UserAction;
            var mealTimes = action.GetAllMealTimes();
            MealTimes = mealTimes?.ToMealTimeViewModel(Array.Empty<long>()) ?? Array.Empty<MealTimeViewModel>();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid || Recipe is null)
            {
                await SetInitials();
                return Page();
            }

            var action = await UserAction;

            var recipe = Recipe.ToModel(SelectedMealTimes);
            var id = action.Save(recipe);

            if (id is null)
            {
                await SetInitials();
                ModelState.AddModelError("Recipe.Name", "Recipe name already exists.");
                return Page();
            }

            return IsHTMFRequest()
                ? Content($@"<p target=""#added-recipes"" hf-swap=""prepend""><a href=""/app/recipes/edit?id={id}"">{recipe.Name}</a></p>", "text/html")
            : Redirect("./add");
        }
    }
}
