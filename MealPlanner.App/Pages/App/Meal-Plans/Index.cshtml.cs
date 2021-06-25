using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using System;
using ServerApp.Actions;
using MealPlanner.Data.Data;
using static MealPlanner.Data.Shared;
using System.Collections.Generic;
using ServerApp.Pages.Shared;
using MealPlanner.Data.Dto.Models.Core;
using MealPlanner.Data.Dto.Models.ViewModels;

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

        [BindProperty]
        public string ChosenRecipes { get; set; } = "";
        [BindProperty]
        public int ChosenRecipeIndex { get; set; } = -1;

        public async Task<IActionResult> OnGetAsync(string? startDate = null)
        {
            var action = await UserAction;
            SetMealPlans(action, startDate, ChangeSource.None, "");
            return Page();
        }

        public async Task<IActionResult> OnPostCancelAsync(string id, string? startDate = null)
        {
            var action = await UserAction;
            action.Save(new MealPlanV2(id, Array.Empty<MealPlanRecipe>()));
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
            var (chosenRecipes, index) = GetRecipe(id, action, next: false);

            SetMealPlans(action, startDate, ChangeSource.Previous, id);

            var model = SetRecipeState(id, chosenRecipes, index);
            if (IsHTMFRequest())
            {
                return Partial("_RecipeTitleTemplate", model);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostNextAsync(string id, string? startDate = null)
        {
            var action = await UserAction;

            var (chosenRecipes, index) = GetRecipe(id, action, next: true);

            SetMealPlans(action, startDate, ChangeSource.Next, id);

            var model = SetRecipeState(id, chosenRecipes, index);
            if (IsHTMFRequest())
            {
                return Partial("_RecipeTitleTemplate", model);
            }

            return Page();
        }

        public async Task<IActionResult> OnPostConfirmAsync(string id, string? startDate = null)
        {
            var action = await UserAction;

            var plan = action.GetMealPlan(id)!;
            var confirmedPlan =
                plan with
                {
                    MealPlanRecipes =
                    plan.MealPlanRecipes.Select(x => x with {
                        Status = MealPlanRecipeStatus.Confirmed
                    }).ToArray()
                };
            action.Save(confirmedPlan);
            SetMealPlans(action, startDate, ChangeSource.None, id);

            if (IsHTMFRequest())
            {
                var plann = MealPlans.First(x => x!.Date == id);
                return Partial("_RecipeTitleTemplate", plann);
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAddRecipeAsync(string id, string? startDate = null)
        {
            var action = await UserAction;

            var (chosenRecipes, index) = GetRecipe(id, action, next: true);

            SetMealPlans(action, startDate, ChangeSource.Next, id);

            var model = SetRecipeState(id, chosenRecipes, index);
            if (IsHTMFRequest())
            {
                return Partial("_RecipeTemplate", model);
            }

            return Page();
        }

        [BindProperty]
        public string Source { get; set; } = "";
        [BindProperty]
        public string Target { get; set; } = "";
        public async Task<IActionResult> OnPostSwapAsync(string startDate)
        {
            var action = await UserAction;
            var date = DateTime.Parse(startDate);
            var mealPlans = action.GetMealPlansForWeek(date);
            var source = mealPlans.First(x => x is { } && x.Date == Source);
            var target = mealPlans.First(x => x is { } && x.Date == Target);
            if (source is { } && target is { })
            {
                action.Save(new MealPlanV2(
                    Target,
                    source.Recipes.Select(x => x.ToMealPlanRecipe(MealPlanRecipeStatus.Confirmed)).ToArray()));
                action.Save(new MealPlanV2(
                    Source,
                    target.Recipes.Select(x => x.ToMealPlanRecipe(MealPlanRecipeStatus.Confirmed)).ToArray()));
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

        private IEnumerable<long> GetChosenRecipes()
            => from x in ChosenRecipes.Split(",")
               where x.Length > 0
               select long.Parse(x);

        private MealViewModel? SetRecipeState(string date, IEnumerable<long> chosenRecipes, int? index)
        {
            var model = MealPlans.First(x => x?.Date == date);

            if (model is { })
            {
                model.RecipesState = chosenRecipes;
                model.RecipeIndex = index;
            }

            return model;
        }

        private (IEnumerable<long>, int?) GetRecipe(string date, UserDataAction action, bool next)
        {
            var recipePicker = action.GetRecipePicker();
            var (chosenRecipes, index) =
                next
                    ? recipePicker.Next(GetChosenRecipes(), ChosenRecipeIndex)
                : recipePicker.Previous(GetChosenRecipes(), ChosenRecipeIndex);
            if (index.HasValue)
            {
                action.Save(new MealPlanV2(
                    date, new[]
                    {
                        new MealPlanRecipe(chosenRecipes.ElementAt(index.Value), MealPlanRecipeStatus.Confirmed)
                    }));
            }

            return (chosenRecipes, index);
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
        , IEnumerable<MealPlanRecipeModel> Recipes
        , string? StartDate
        , string DayOfWeek
        , CurrentSelection ChangeSource)
    {
        public IEnumerable<long> RecipesState { get; set; } = Array.Empty<long>();
        public int? RecipeIndex { get; set; }
    };

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
            , DayOfWeek: FromMealPlanId(plan.Date)?.DayOfWeek.ToString() ?? ""
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
