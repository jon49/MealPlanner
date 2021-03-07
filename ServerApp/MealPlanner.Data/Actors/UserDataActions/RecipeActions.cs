using MealPlanner.Core;
using Proto;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MealPlanner.Data.Actors.UserDataActions
{
    internal static class RecipeActions
    {
        public static Task GetRandomRecipe(this Dictionary<long, Recipe> Recipes, IContext context)
        {
            var rand = new Random();
            var recipe = Recipes.RandomValue(rand);
            context.Respond(recipe);
            return Task.CompletedTask;
        }
    }
}
