using A = MealPlanner.Data.Actors.Actions.Action;
using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ServerApp.Actors;
using Model = MealPlanner.Data.Actors;

#nullable enable

namespace ServerApp.Pages.App.Recipes
{
    [Authorize]
    public class AddModel : PageModel
    {
        private readonly UserData data;

        public AddModel(SystemActor actor)
        {
            data = actor.Data;
        }

        private long UserId => long.Parse(User.Claims.First(x => x.Type == "userId").Value);

        [ViewData]
        public string Title => "Add Meal";
        [ViewData]
        public string Header => "Add Meal";

        [BindProperty]
        public Recipe? Recipe { get; set; }

        public MealTime[] MealTimes { get; set; } = Array.Empty<MealTime>();
        [BindProperty]
        [Required, MinLength(1)]
        public long[] SelectedMealTimes { get; set; } = Array.Empty<long>();

        public Task OnGetAsync()
        {
            return SetInitials(UserId);
        }

        private async Task SetInitials(long userId)
        {
            var mealTimes = await data.RequestAsync<Model.MealTime[]>(userId, A.GetAllMealTimes.Default);
            MealTimes = mealTimes?.ToMealTimeViewModel() ?? Array.Empty<MealTime>();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid || Recipe is null)
            {
                await SetInitials(UserId);
                return Page();
            }

            var recipe = Recipe.ToModel(SelectedMealTimes);
            var id = await data.RequestAsync<long?>(UserId, recipe);

            if (id is null)
            {
                await SetInitials(UserId);
                ModelState.AddModelError("Recipe.Name", "Recipe name already exists.");
                return Page();
            }

            return Redirect("./add");
        }
    }

    public class Recipe
    {
        public int? Id { get; set; }
        [Required, MinLength(1)]
        public string? Name { get; set; }
        public bool[]? MealTimes { get; set; }
        public WebSource? WebSource { get; set; }
        public BookSource? BookSource { get; set; }
        public OtherSource? OtherSource { get; set; }
    }

    public class WebSource
    {
        public string? Title { get; set; }
        public Uri? Url { get; set; }
    }

    public class BookSource
    {
        public string? Title { get; set; }
        public int? Page { get; set; }
    }

    public class OtherSource
    {
        public string? Title { get; set; }
    }

    public record MealTime
        ( string Id
        , string Name );

    public record Links(string Name, Uri Link);

    public static class MealTimeExtensions
    {
        public static MealTime[] ToMealTimeViewModel(this MealPlanner.Data.Actors.MealTime[] mealTimes)
        {
            var length = mealTimes.Length;
            var view = new MealTime[length];

            for (int i = 0; i < length; i++)
            {
                var model = mealTimes[i];
                view[i] = new MealTime
                    ( Id: model.Id!.Value.ToString(),
                        Name: model.Name );
            }

            return view;
        }
    }

    public static class RecipeExtensions
    {
        public static Model.BookSource? ToModel(this BookSource? x)
            => x?.Title is { } ? new MealPlanner.Data.Actors.BookSource(Title: x.Title, Page: x.Page) : null;

        public static Model.OtherSource? ToModel(this OtherSource? x)
            => x?.Title is { } ? new MealPlanner.Data.Actors.OtherSource(Title: x.Title) : null;

        public static Model.WebSource? ToModel(this WebSource? x)
            => x?.Url is { } ? new Model.WebSource(Title: x.Title ?? x.Url.ToString(), Url: x.Url) : null;

        public static Model.Recipe ToModel(this Recipe recipe, long[] mealTimes)
            => new(
                Id: null,
                Name: recipe.Name!,
                BookSource: recipe.BookSource.ToModel(),
                OtherSource: recipe.OtherSource.ToModel(),
                WebSource: recipe.WebSource.ToModel(),
                MealTimes: mealTimes);
    }
}
