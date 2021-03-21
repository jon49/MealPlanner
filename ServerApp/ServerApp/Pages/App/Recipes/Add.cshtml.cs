using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using MealPlanner.Data.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ServerApp.Actions;
using static ServerApp.Utils.HTMF;
using ServerApp.Pages.App.Recipes.Shared;

#nullable enable

namespace ServerApp.Pages.App.Recipes
{
    public class AddModel : PageModel
    {
        private readonly UserData _data;

        public AddModel(UserData data)
        {
            _data = data;
        }

        private long UserId => long.Parse(User.Claims.First(x => x.Type == "userId").Value);
        private Task<UserDataAction> UserAction => _data.GetUserData(UserId);

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
            MealTimes = mealTimes?.ToMealTimeViewModel() ?? Array.Empty<MealTimeViewModel>();
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

            if (IsHTMFRequest(HttpContext))
            {
                return Content($@"<p target=""#added-recipes"" hf-swap=""prepend""><a href=""/app/recipes/{id}"">{recipe.Name}</a></p>", "text/html");
            }

            return Redirect("./add");
        }
    }
}
