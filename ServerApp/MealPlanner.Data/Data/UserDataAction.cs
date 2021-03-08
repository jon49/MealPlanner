using MealPlanner.Core;
using MealPlanner.Data.Data.Actions;
using MealPlanner.Data.Data.Models;
using MealPlanner.Data.Databases;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using static MealPlanner.Data.Shared;

#nullable enable

namespace MealPlanner.Data.Data
{
    public interface IId { public long? Id { get; } }
    public interface IName { public string Name { get; } }

    public record Recipe
        ( long? Id
        , string Name
        , BookSource? BookSource
        , OtherSource? OtherSource
        , WebSource? WebSource
        , long[] MealTimes ) : IId, IName;

    public record BookSource(string Title, int? Page);
    public record OtherSource(string Title);
    public record WebSource(string? Title, Uri Url);

    public record MealTime(long? Id, string Name) : IId, IName;

    public record MealPlan(string Date, long[] RecipeIds);

    public record WithUser(long UserId);
    public record TempData(string Key, object Value);

    public class UserDataAction
    {
        private readonly UserDataPersistAction _persist;
        private readonly UserDataFetchAction _fetch;
        private readonly long _userId;
        private bool _initializing = false;
        private readonly Dictionary<long, Recipe> Recipes = new();
        private readonly Dictionary<long, MealTime> MealTimes = new();
        private readonly Dictionary<string, MealPlan> MealPlans = new();
        private readonly Dictionary<string, object> TempData = new();

        private UserDataAction(UserDataPersistAction persist, UserDataFetchAction fetch, long userId)
        {
            _persist = persist;
            _fetch = fetch;
            _userId = userId;
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
            return recipe.Id;
        }

        public string? Save(MealPlan? mealPlan)
        {
            if (mealPlan is null) return null;
            MealPlans.AddOrUpdate(mealPlan.Date, mealPlan);
            Persist(mealPlan.Date, mealPlan);
            return mealPlan.Date;
        }

        public MealTime[] GetAllMealTimes() => MealTimes.Values.ToArray();
        public string? ToMealPlanId(DateTime? date) => ToMealPlanId(date);
        public DateTime? FromMealPlanId(string? date) => FromMealPlanId(date);
        public MealPlanModel?[] GetMealPlansForWeek(DateTime? startDate)
            => MealPlans.GetMealPlansForWeek(this, startDate, MealTimes, Recipes);
        public Recipe GetRandomRecipe() => Recipes.RandomValue(new Random());
        public object[] GetTempData(string[] keys) => TempData.TryGetValuesOrDefault(keys);
        public void SetTempData(TempData data) => TempData.AddOrUpdate(data.Key, data.Value);

        private T? AddOrUpdate<T>(Dictionary<long, T> dic, T? item, Func<long, T, T> updateId) where T : class, IId, IName
        {
            if (item is null) return null;
            if (item.Id is null)
            {
                if (dic.Values.Any(x => x.Name == item.Name)) return null;
                item = updateId(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), item);
            }
            dic.AddOrUpdate(item.Id!.Value, item);

            return item;
        }

        private void Persist<T>(string key, T @class, bool deleted = false)
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
    }
}
