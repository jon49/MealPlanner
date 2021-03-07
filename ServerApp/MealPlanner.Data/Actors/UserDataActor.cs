using MealPlanner.Core;
using MealPlanner.Core.Extensions;
using MealPlanner.Data.Databases;
using Proto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MealPlanner.Data.Actors.UserDataActions;
using static MealPlanner.Data.Actors.Actions.Action;

#nullable enable

namespace MealPlanner.Data.Actors
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

    public class UserDataActor : IActor
    {
        private readonly PID userDataPersistenceActor;
        private readonly PID fetchActor;
        private long userId;
        private readonly Dictionary<long, Recipe> Recipes = new();
        private readonly Dictionary<long, MealTime> MealTimes = new();
        private readonly Dictionary<string, MealPlan> MealPlans = new();
        private readonly Dictionary<string, object> TempData = new();
        private bool Initializing = false;

        public UserDataActor(PID userDataPersistenceActor, PID fetchActor)
        {
            this.userDataPersistenceActor = userDataPersistenceActor;
            this.fetchActor = fetchActor;
            UpsertMealTime = CreateUpsert(MealTimes, (id, x) => x with { Id = id });
            UpsertRecipe = CreateUpsert(Recipes, (id, x) => x with { Id = id });
        }

        public Task ReceiveAsync(IContext context)
            => context.Message switch
            {
                Recipe recipe => Pipe(UpsertRecipe, Persist<Recipe>(false), recipe, context),
                MealTime mealTime => Pipe(UpsertMealTime, Persist<MealTime>(false), mealTime, context),
                MealPlan mealPlan => UpsertMealPlanAndPersist(context, mealPlan, false),

                GetAllMealTimes _ => MealTimes.GetAllMealTimes(context),
                GetMealPlansForWeek x => MealPlans.GetMealPlansForWeek(context, x.StartDate, MealTimes, Recipes),
                GetRandomRecipe _ => Recipes.GetRandomRecipe(context),
                GetTempData data => GetTempData(context, data.Keys),
                TempData data => SetTempData(data),

                WithUser user => SetUser(context, user),
                _ => Task.CompletedTask,
            };

        private Task SetTempData(TempData data)
        {
            TempData.AddOrUpdate(data.Key, data.Value);
            return Task.CompletedTask;
        }

        private Task GetTempData(IContext context, string[] keys)
        {
            var data = TempData.TryGetValuesOrDefault(keys);
            context.Respond(data);
            return Task.CompletedTask;
        }

        private Func<IContext, Recipe?, Recipe?> UpsertRecipe { get; init; }
        private Func<IContext, MealTime?, MealTime?> UpsertMealTime { get; init; }

        private async Task SetUser(IContext context, WithUser user)
        {
            Initializing = true;
            userId = user.UserId;
            await Init(context);
            Initializing = false;
        }

        private Action<IContext, T> Persist<T>(bool deleted) where T : class, IId
            => (IContext context, T x) => context.Send(
                userDataPersistenceActor,
                new EventItem(
                    Deleted: deleted,
                    ItemId: x.Id?.ToString() ?? throw new ArgumentNullException(nameof(IId.Id), "Persisted Ids should never be null."),
                    ItemType: typeof(T).Name,
                    Source: "server",
                    UserId: userId,
                    Value: JsonSerializer.SerializeToUtf8Bytes(x)));

        private MealPlan? UpsertMealPlan(MealPlan? mealPlan)
        {
            if (mealPlan is null) return null;
            MealPlans.AddOrUpdate(mealPlan.Date, mealPlan);
            return mealPlan;
        }

        private Task UpsertMealPlanAndPersist(IContext context, MealPlan? mealPlan, bool deleted)
        {
            mealPlan = UpsertMealPlan(mealPlan);
            if (mealPlan is { })
            {
                context.Send(userDataPersistenceActor, new EventItem(
                    Deleted: deleted,
                    ItemId: mealPlan.Date,
                    ItemType: nameof(MealPlan),
                    Source: "server",
                    UserId: userId,
                    Value: JsonSerializer.SerializeToUtf8Bytes(mealPlan) ));
                context.Respond(mealPlan.Date);
                return Task.CompletedTask;
            }

            context.Respond(null!);
            return Task.CompletedTask;
        }


        private Func<IContext, T?, T?> CreateUpsert<T>(Dictionary<long, T> ts, Func<long, T, T> update) where T : class, IId, IName
            => (IContext context, T? item) =>
            {
                if (item is null) return null;
                if (item.Id is null)
                {
                    if (ts.Values.Any(x => x.Name == item.Name)) return null;
                    item = update(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), item);
                }

                ts.AddOrUpdate(item.Id!.Value, item);

                return item;
            };

        private async Task Init(IContext context)
        {
            var allData = await context.RequestAsync<List<AllUserData>>(fetchActor, new GetAllUserData(userId));
            foreach (var data in allData ?? new List<AllUserData>())
            {
                switch (data.Type)
                {
                    case nameof(Recipe):
                        var recipe = await JSON.Deserialize<Recipe>(data.Value);
                        UpsertRecipe(context, recipe);
                        break;
                    case nameof(MealTime):
                        var mealTime = await JSON.Deserialize<MealTime>(data.Value);
                        UpsertMealTime(context, mealTime);
                        break;
                    case nameof(MealPlan):
                        var mealPlan = await JSON.Deserialize<MealPlan>(data.Value);
                        UpsertMealPlan(mealPlan);
                        break;
                    default:
                        throw new ArgumentOutOfRangeException(data.Type);
                }
            }

            await DefaultMealTime(context);
        }

        private async Task DefaultMealTime(IContext context)
        {
            if (MealTimes.Count == 0)
            {
                var mealTime = new MealTime(Id: null, Name: "Dinner");
                await Pipe(UpsertMealTime, Persist<MealTime>(false), mealTime, context);
            }
        }

        private Task Pipe<T>(Func<IContext, T, T?> f1, Action<IContext, T> f2, T? value, IContext context)
            where T : class, IId
        {
            if (value is { })
            {
                var r1 = f1(context, value);
                if (r1 is null)
                {
                    if (!Initializing) context.Respond(null!);
                    return Task.CompletedTask;
                }
                if (!Initializing) context.Respond(r1.Id!);
                f2(context, r1);
            }
            return Task.CompletedTask;
        }

    }
}
