using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using System;
using ServerApp.Actions;
using MealPlanner.Data.Data.Models;
using MealPlanner.Data.Data;
using static MealPlanner.Data.Shared;
using System.Collections.Generic;
using ServerApp.Pages.Shared;

#nullable enable

namespace ServerApp.Pages.App.Meal_Plans
{
    [ResponseCache(Duration = 5, Location = ResponseCacheLocation.Client, NoStore = false)]
    public class IndexModel : BaseUserPage
    {
        public IndexModel(UserData data) : base(data) { }

        [ViewData]
        public string Title => "Meal Plan";
        [ViewData]
        public string Header => "Meal Planner";

        public IEnumerable<MealViewModel?> MealPlans { get; set; } = Array.Empty<MealViewModel>();

        [BindProperty(SupportsGet = true)]
        public DateTime? StartDate { get; set; }
        public string? StartDateView => ToMealPlanId(StartDate);

        public async Task<IActionResult> OnGetAsync(string? startDate = null)
        {
            var action = await UserAction;
            SetMealPlans(action, startDate, ChangeSource.None, "");
            var pickedRecipes = action.GetPickedRecipes();
            foreach (var mealPlan in MealPlans)
            {
                if (mealPlan?.Recipes.Any() ?? false)
                {
                    pickedRecipes.Next(mealPlan.Date, mealPlan.Recipes[0]);
                }
            }
            return Page();
        }

        public async Task<IActionResult> OnPostCancelAsync(string id, string? startDate = null)
        {
            var action = await UserAction;
            action.Save(new MealPlan(id, Array.Empty<long>()));
            SetMealPlans(action, startDate, ChangeSource.AddRecipe, id);

            if (IsHTMFRequest())
            {
                var model = MealPlans.First(x => x?.Date == id);
                return Partial("_CancelledTemplate", model);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostPreviousAsync(string id, string? startDate = null)
        {
            var action = await UserAction;
            var pickedRecipes = action.GetPickedRecipes();

            var recipeId = pickedRecipes.Previous(id);
            action.Save(new MealPlan(id, new[] { recipeId }));

            SetMealPlans(action, startDate, ChangeSource.Previous, id);

            if (IsHTMFRequest())
            {
                var model = MealPlans.First(x => x?.Date == id);
                return Partial("_RecipeTitleTemplate", model);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostNextAsync(string id, string? startDate = null)
        {
            var action = await UserAction;

            var pickedRecipes = action.GetPickedRecipes();

            var recipeId = pickedRecipes.Next(id);
            action.Save(new MealPlan(id, new[] { recipeId }));

            SetMealPlans(action, startDate, ChangeSource.Next, id);

            if (IsHTMFRequest())
            {
                var model = MealPlans.First(x => x?.Date == id);
                return Partial("_RecipeTitleTemplate", model);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAddRecipeAsync(string id, string? startDate = null)
        {
            var action = await UserAction;

            var pickedRecipes = action.GetPickedRecipes();
            var recipeId = pickedRecipes.Next(id);
            action.Save(new MealPlan(id, new[] { recipeId }));

            SetMealPlans(action, startDate, ChangeSource.Next, id);

            if (IsHTMFRequest())
            {
                var model = MealPlans.First(x => x?.Date == id);
                return Partial("_RecipeTemplate", model);
            }

            return Page();
        }

        [BindProperty]
        public string Source { get; set; }
        [BindProperty]
        public string Target { get; set; }
        public async Task<IActionResult> OnPostSwapAsync(string startDate)
        {
            var action = await UserAction;
            var date = DateTime.Parse(startDate);
            var mealPlans = action.GetMealPlansForWeek(date);
            var source = mealPlans.First(x => x is { } && x.Date == Source);
            var target = mealPlans.First(x => x is { } && x.Date == Target);
            if (source is { } && target is { })
            {
                action.Save(new MealPlan(Target, source.Recipes.Where(x => x.Id.HasValue).Select(x => x.Id!.Value).ToArray()));
                action.Save(new MealPlan(Source, target.Recipes.Where(x => x.Id.HasValue).Select(x => x.Id!.Value).ToArray()));
            }

            SetMealPlans(action, ToMealPlanId(date), ChangeSource.None, Target);

            return Partial("_MealsTemplate", this);
        }

        private void SetMealPlans(UserDataAction action, string? startDate, ChangeSource source, string dateSelection)
        {
            StartDate = FromMealPlanId(startDate);
            MealPlans = action.GetMealPlansForWeek(StartDate).Select(x => x?.ToMealViewModel(startDate: startDate, source, dateSelection));
            if (StartDate is null)
            {
                StartDate = FromMealPlanId(MealPlans.FirstOrDefault()?.Date);
            }
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
        , string? StartDate
        , CurrentSelection ChangeSource);

    public static class MealViewModelExtensions
    {
        public static MealViewModel ToMealViewModel(
            this MealPlanModel plan,
            string? startDate,
            ChangeSource changeSource,
            string dateSelection)
            => new
            ( Date: plan.Date
            , Recipes: plan.Recipes
            , StartDate: startDate
            , ChangeSource: new CurrentSelection(changeSource, dateSelection));
    }

    public record CurrentSelection
        ( ChangeSource Source
        , string Date );

    public enum ChangeSource
    {
        Next,
        Previous,
        None,
        AddRecipe,
    }

}
