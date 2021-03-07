using Microsoft.AspNetCore.Mvc.RazorPages;
using ServerApp.Actors;
using A = MealPlanner.Data.Actors.Actions.Action;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using System;
using MealPlanner.Data.Actors.Models;
using MealPlanner.Data.Actors;
using Proto;

#nullable enable

namespace ServerApp.Pages.App.Meal_Plans
{
    public class IndexModel : PageModel
    {
        private readonly UserData data;

        public IndexModel(SystemActor actor)
        {
            data = actor.Data;
        }

        private long UserId => long.Parse(User.Claims.First(x => x.Type == "userId").Value);

        [ViewData]
        public string Title => "Meal Plan";
        [ViewData]
        public string Header => "Meal Planner";

        public MealPlanModel[] MealPlans { get; set; } = Array.Empty<MealPlanModel>();

        [BindProperty(SupportsGet = true)]
        public string? StartDate { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            await SetMealPlans();
            return Page();
        }

        public async Task<IActionResult> OnPostCancelAsync(string id)
        {
            await data.RequestAsync<string?>(UserId, new MealPlan(id, Array.Empty<long>()));
            await SetMealPlans();
            return Page();
        }

        public async Task<IActionResult> OnPostPreviousAsync(string id)
        {
            var recipeIds = await GetMealSelections(id);
            if (recipeIds is { } && recipeIds.Length > 1)
            {
                var idx = recipeIds[0]!.Value - 1;
                if (idx > 0)
                {
                    recipeIds[0] = idx;
                    var recipeId = recipeIds[idx]!.Value;
                    data.Send(UserId, new MealPlan(id, new[] { recipeId }));
                }
            }

            await SetMealPlans();
            return Page();
        }

        public async Task<IActionResult> OnPostNextAsync(string id)
        {
            var recipeIds = (await GetMealSelections(id)) ?? new long?[] { 0L };

            var idx = recipeIds[0] + 1;
            if (idx < recipeIds.Length)
            {
                recipeIds[0] = idx;
                var recipeId = recipeIds[(int)idx]!.Value;
                data.Send(UserId, new MealPlan(id, new[] { recipeId }));
            }
            else
            {
                var randomRecipe = await data.RequestAsync<Recipe?>(UserId, A.GetRandomRecipe.Default);
                if (randomRecipe?.Id is { })
                {
                    var newRecipeIds = new long?[recipeIds.Length + 1];
                    recipeIds.CopyTo(newRecipeIds, 0);
                    newRecipeIds[^1] = randomRecipe.Id;
                    newRecipeIds[0] = idx;
                    data.Send(UserId, new TempData(id, newRecipeIds));
                    data.Send(UserId, new MealPlan(id, new[] { randomRecipe.Id.Value }));
                }
            }

            await SetMealPlans();
            return Page();
        }

        public async Task<IActionResult> OnPostAddRecipeAsync(string id)
        {
            var recipeIdsTask = GetMealSelections(id);
            var randomRecipe = await data.RequestAsync<Recipe?>(UserId, A.GetRandomRecipe.Default);
            if (randomRecipe?.Id is { })
            {
                var recipeIds = await recipeIdsTask;
                if (recipeIds?.Length > 0)
                {
                    var newRecipeIds = new long?[recipeIds.Length + 1];
                    recipeIds.CopyTo(newRecipeIds, 0);
                    newRecipeIds[0] = newRecipeIds.Length - 1;
                    newRecipeIds[^1] = randomRecipe.Id.Value;
                    recipeIds = newRecipeIds;
                }
                else
                {
                    recipeIds = new long?[] { 0, randomRecipe.Id.Value };
                }
                data.Send(UserId, new TempData(id, recipeIds));
                data.Send(UserId, new MealPlan(id, new[] { randomRecipe.Id.Value }));
            }

            await SetMealPlans();
            return Page();
        }

        private async Task SetMealPlans()
        {
            MealPlans = await data.RequestAsync<MealPlanModel[]>(UserId, new A.GetMealPlansForWeek(StartDate)) ?? Array.Empty<MealPlanModel>();
            if (StartDate is null)
            {
                StartDate = MealPlans.FirstOrDefault()?.Date;
            }
        }

        private async Task<long?[]?> GetMealSelections(string id)
        {
            var tempData = await data.RequestAsync<object[]>(UserId, new A.GetTempData(new[] { id }));
            var tempData2 = tempData?[0];
            var longData = tempData2 as long?[];
            return longData;
        }
    }

    public class MealPlanViewModel
    {
        /// <summary>
        /// Identifier
        /// </summary>
        public string? Date { get; set; }
        public string? Recipe { get; set; }
        // TODO
        //public string MealTime { get; set; }
    }

}
