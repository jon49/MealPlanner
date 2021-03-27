using Microsoft.AspNetCore.Mvc;
using ServerApp.Actions;
using ServerApp.Pages.App.Recipes.Shared;
using ServerApp.Pages.Shared;
using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

#nullable enable

namespace ServerApp.Pages.App.Recipes
{
    public class EditModel : BaseUserPage, IRecipeViewModel
    {
        public EditModel(UserData data) : base(data) { }

        [ViewData] public string Title => "Edit Meal";
        [ViewData] public string Header => "Edit Meal";

        [BindProperty]
        public RecipeViewModel? Recipe { get; set; }
        [BindProperty]
        [Required, MinLength(1)]
        public long[] SelectedMealTimes { get; set; } = Array.Empty<long>();

        public MealTimeViewModel[] MealTimes { get; set; } = Array.Empty<MealTimeViewModel>();
        public string Message { get; set; } = string.Empty;

        public Task<IActionResult> OnGetAsync(long id)
            => Init(id);

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid || Recipe is null)
            {
                return await Init(Recipe?.Id);
            }

            var action = await UserAction;

            var recipe = Recipe.ToModel(SelectedMealTimes);
            var id = action.Save(recipe);

            if (id is null)
            {
                ModelState.AddModelError("Recipe.Name", "Recipe name already exists.");
            }

            return Redirect("/app/recipes");
        }

        public async Task<IActionResult> OnPostDeleteAsync()
        {
            if (Recipe?.Id is null)
            {
                Message = "Could not delete recipe, unknown recipe.";
                return await Init(Recipe?.Id);
            }

            var action = await UserAction;
            var result = action.Delete(Recipe.ToModel(SelectedMealTimes));

            if (result)
            {
                return Redirect("/app/recipes");
            }

            Message = "Recipe could not be deleted.";

            return Page();
        }

        private async Task<IActionResult> Init(long? id)
        {
            var action = await UserAction;

            if (id is null)
            {
                return NotFound();
            }

            var recipe = action.GetRecipe(id.Value);
            if (recipe is null)
            {
                return NotFound();
            }

            var mealTimes = action.GetAllMealTimes();

            Recipe = recipe.ToViewModel();
            MealTimes = mealTimes?.ToMealTimeViewModel(recipe.MealTimes) ?? Array.Empty<MealTimeViewModel>();

            return Page();
        }
    }
}
