using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using System;
using ServerApp.Actions;
using MealPlanner.Data.Data.Models;
using MealPlanner.Data.Data;
using static MealPlanner.Data.Shared;
using System.Collections.Generic;

#nullable enable

namespace ServerApp.Pages.App.Meal_Plans
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

        [ViewData]
        public string Title => "Meal Plan";
        [ViewData]
        public string Header => "Meal Planner";

        //public MealPlanModel?[] MealPlans { get; set; } = Array.Empty<MealPlanModel>();

        public IEnumerable<MealViewModel?> MealPlans { get; set; } = Array.Empty<MealViewModel>();

        [BindProperty(SupportsGet = true)]
        public DateTime? StartDate { get; set; }
        public string? StartDateView => ToMealPlanId(StartDate);

        public async Task<IActionResult> OnGetAsync(string? startDate = null)
        {
            var action = await UserAction;
            SetMealPlans(action, startDate);
            return Page();
        }

        public async Task<IActionResult> OnPostCancelAsync(string id, string? startDate = null)
        {
            var action = await UserAction;
            action.Save(new MealPlan(id, Array.Empty<long>()));
            SetMealPlans(action, startDate);

            if (HttpContext.Request.Headers.ContainsKey("HX-Request"))
            {
                var model = MealPlans.First(x => x?.Date == id);
                return Partial("_CancelledTemplate", model);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostPreviousAsync(string id, string? startDate = null)
        {
            var action = await UserAction;
            var recipeIds = GetMealSelections(id, action);
            if (recipeIds is { } && recipeIds.Length > 1)
            {
                var idx = recipeIds[0]!.Value - 1;
                if (idx > 0)
                {
                    recipeIds[0] = idx;
                    var recipeId = recipeIds[idx]!.Value;
                    action.Save(new MealPlan(id, new[] { recipeId }));
                }
            }

            SetMealPlans(action, startDate);

            if (HttpContext.Request.Headers.ContainsKey("HX-Request"))
            {
                var model = MealPlans.First(x => x?.Date == id);
                return Partial("_RecipeTemplate", model);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostNextAsync(string id, string? startDate = null)
        {
            var action = await UserAction;

            var recipeIds = (GetMealSelections(id, action)) ?? new long?[] { 0L };

            var idx = recipeIds[0] + 1;
            if (idx < recipeIds.Length)
            {
                recipeIds[0] = idx;
                var recipeId = recipeIds[(int)idx]!.Value;
                action.Save(new MealPlan(id, new[] { recipeId }));
            }
            else
            {
                var randomRecipe = action.GetRandomRecipe();
                if (randomRecipe?.Id is { })
                {
                    var newRecipeIds = new long?[recipeIds.Length + 1];
                    recipeIds.CopyTo(newRecipeIds, 0);
                    newRecipeIds[^1] = randomRecipe.Id;
                    newRecipeIds[0] = idx;
                    action.SetTempData(new TempData(id, newRecipeIds));
                    action.Save(new MealPlan(id, new[] { randomRecipe.Id.Value }));
                }
            }

            SetMealPlans(action, startDate);

            if (HttpContext.Request.Headers.ContainsKey("HX-Request"))
            {
                var model = MealPlans.First(x => x?.Date == id);
                return Partial("_RecipeTemplate", model);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAddRecipeAsync(string id, string? startDate = null)
        {
            var action = await UserAction;
            var randomRecipe = action.GetRandomRecipe();
            if (randomRecipe?.Id is { })
            {
                var recipeIds = GetMealSelections(id, action);
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
                action.SetTempData(new TempData(id, recipeIds));
                action.Save(new MealPlan(id, new[] { randomRecipe.Id.Value }));
            }

            SetMealPlans(action, startDate);

            if (HttpContext.Request.Headers.ContainsKey("HX-Request"))
            {
                var model = MealPlans.First(x => x?.Date == id);
                return Partial("_RecipeTemplate", model);
            }

            return Page();
        }

        private void SetMealPlans(UserDataAction action, string? startDate)
        {
            ViewData["StartDate"] = startDate;
            StartDate = FromMealPlanId(startDate);
            MealPlans = action.GetMealPlansForWeek(StartDate).Select(x => x?.ToMealViewModel(startDate: startDate));
            if (StartDate is null)
            {
                StartDate = FromMealPlanId(MealPlans.FirstOrDefault()?.Date);
            }
        }

        private static long?[]? GetMealSelections(string id, UserDataAction action)
        {
            var tempData = action.GetTempData(new[] { id });
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

    public record MealViewModel
        ( string Date
        , Recipe[] Recipes 
        , string StartDate );

    public static class MealViewModelExtensions
    {
        public static MealViewModel ToMealViewModel(this MealPlanModel plan, string? startDate)
            => new
            ( Date: plan.Date
            , Recipes: plan.Recipes
            , StartDate: startDate);
    }

}
