using MealPlanner.Data.Dto.Models.Core;
using MealPlanner.Core;
using MealPlanner.Data.Data.Actions;
using MealPlanner.Data.Databases;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MealPlanner.Data.Dto.Models.ViewModels;
using MealPlanner.Data.Data.Core;

#nullable enable

namespace MealPlanner.Data.Data
{
    public class UserDataAction
    {
        private readonly UserDataPersistAction _persist;
        private readonly UserDataFetchAction _fetch;
        private readonly long _userId;
        private bool _initializing = false;
        private readonly Random _random = new();
        private readonly Dictionary<long, Recipe> Recipes = new();
        private readonly Dictionary<long, MealTime> MealTimes = new();
        private readonly Dictionary<string, MealPlanV2> MealPlans = new();
        private readonly RecipePicker RecipePicker;
        private RecipeSearch? RecipeSearch = null;

        private UserDataAction(UserDataPersistAction persist, UserDataFetchAction fetch, long userId)
        {
            _persist = persist;
            _fetch = fetch;
            _userId = userId;
            RecipePicker = new(Recipes, _random);
        }

        public static async Task<UserDataAction> Create(UserDataPersistAction persist, UserDataFetchAction fetch, long userId)
        {
            var @this = new UserDataAction(persist, fetch, userId)
            {
                _initializing = true
            };
            await @this.Init();
            @this._initializing = false;
            return @this;
        }

        public long? Save(MealTime? mealTime)
        {
            mealTime = AddOrUpdate(MealTimes, mealTime, (id, x) => x with { Id = id });
            if (mealTime is null) return null;
            Persist(mealTime.Id.ToString(), mealTime);
            return mealTime.Id;
        }

        public long? Save(Recipe? recipe)
        {
            recipe = AddOrUpdate(Recipes, recipe, (id, x) => x with { Id = id });
            if (recipe is null) return null;
            Persist(recipe.Id.ToString(), recipe);
            if (RecipeSearch is { })
            {
                RecipeSearch.Save(recipe);
            }
            return recipe.Id;
        }

        public bool Delete(Recipe recipe)
        {
            if (!recipe.Id.HasValue) return false;
            var result = Recipes.Remove(recipe.Id.Value);
            if (result) Persist<Recipe>(recipe.Id.ToString(), null, false);
            return result;
        }

        public string? Save(MealPlanV2? mealPlan)
        {
            if (mealPlan is null) return null;
            MealPlans.AddOrUpdate(mealPlan.Date, mealPlan);
            Persist(mealPlan.Date, mealPlan);
            return mealPlan.Date;
        }

        private string? Save(MealPlan? mealPlan)
        {
            if (mealPlan is null) return null;
            MealPlans.AddOrUpdate(mealPlan.Date, mealPlan.ToV2());
            return mealPlan.Date;
        }

        public MealTime[] GetAllMealTimes() => MealTimes.Values.ToArray();

        public MealPlanModel?[] GetMealPlansForWeek(DateTime? startDate)
            => MealPlans.GetMealPlansForWeek(this, startDate, MealTimes, Recipes, _random);
        public RecipePicker GetRecipePicker() => RecipePicker;

        private T? AddOrUpdate<T>(Dictionary<long, T> dic, T? item, Func<long, T, T> updateId) where T : class, IId, IName
        {
            if (item is null) return null;
            if (item.Id is null)
            {
                if (item.Id is null && dic.Values.Any(x => x.Name == item.Name)) return null;
                if (item.Id is { } && dic.Values.Any(x => x.Name == item.Name && x.Id != item.Id)) return null;
                item = updateId(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), item);
            }
            dic.AddOrUpdate(item.Id!.Value, item);

            return item;
        }

        private void Persist<T>(string key, T? @class, bool deleted = false)
        {
            if (!_initializing)
            {
                var @event = new Databases.EventItem(
                    Deleted: deleted,
                    ItemId: key,
                    ItemType: typeof(T).Name,
                    Source: "server",
                    UserId: _userId,
                    Value: JsonSerializer.SerializeToUtf8Bytes(@class));
                _persist.Queue(@event);
            }
        }

        private async Task Init()
        {
            var allData = await _fetch.GetAllUserData(_userId);
            foreach (var data in allData ?? new List<AllUserData>())
            {
                switch (data.Type)
                {
                    case nameof(Recipe):
                        Save(await JSON.Deserialize<Recipe>(data.Value));
                        break;
                    case nameof(MealTime):
                        Save(await JSON.Deserialize<MealTime>(data.Value));
                        break;
                    case nameof(MealPlanV2):
                        Save(await JSON.Deserialize<MealPlanV2>(data.Value));
                        break;
                    case nameof(MealPlan):
                        Save(await JSON.Deserialize<MealPlan>(data.Value));
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(data.Type);
                }
            }

            DefaultMealTime();
        }

        private void DefaultMealTime()
        {
            if (MealTimes.Count == 0)
            {
                Save(new MealTime(Id: null, Name: "Dinner"));
            }
        }

        public Recipe[] GetAllRecipes()
            => Recipes.Values.ToArray();

        public Recipe? GetRecipe(long id)
            => Recipes.GetValueOrDefault(id);

        public MealPlanV2? GetMealPlan(string id)
            => MealPlans.GetValueOrDefault(id);

        public List<Recipe> SearchRecipes(string search, bool strictSearch)
        {
            if (RecipeSearch is null)
            {
                RecipeSearch = new(Recipes.Values);
            }
            var ids = RecipeSearch.Search(search, strictSearch);
            var recipes = new List<Recipe>();
            foreach (var id in ids)
            {
                if (Recipes.TryGetValue(id, out var recipe))
                {
                    recipes.Add(recipe);
                }
            }

            return recipes;
        }
    }
}
