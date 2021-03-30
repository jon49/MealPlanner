using MealPlanner.Core;
using System;
using System.Collections.Generic;
using System.Linq;

#nullable enable

namespace MealPlanner.Data.Data.Models
{
    public class ListIndex
    {
        private ListIndex() { }
        public ListIndex(long id)
        {
            List.Add(id);
        }

        public int Index { get; set; }
        public List<long> List { get; set; } = new();
    }

    public class PickedValues
    {
        private readonly Dictionary<long, Recipe> _recipes;
        private readonly Random _random;
        private Dictionary<string, ListIndex> recipeDates = new();

        public PickedValues(Dictionary<long, Recipe> recipes, Random random)
        {
            _recipes = recipes;
            _random = random;
        }

        public long Next(string date, Recipe? recipe = null)
        {
            long? id;
            if (recipeDates.TryGetValue(date, out var recipes))
            {
                recipes.Index++;
                if (recipes.Index >= recipes.List.Count)
                {
                    id = GetRandomRecipe(recipes.List);
                    if (id is { })
                    {
                        recipes.List.Add(id.Value);
                        return id.Value;
                    }
                    recipes.Index = 0;
                }
                return recipes.List[recipes.Index];
            }

            if (recipe is { })
            {
                id = recipe.Id!.Value;
            }
            else
            {
                id = _recipes.RandomValue(_random).Id!.Value;
            }

            recipeDates.Add(date, new(id.Value));
            return id.Value;
        }

        public long Previous(string date)
        {
            if (recipeDates.TryGetValue(date, out var recipes))
            {
                if (recipes.Index > 0)
                {
                    recipes.Index--;
                }
                else
                {
                    recipes.Index = recipes.List.Count - 1;
                }
                return recipes.List[recipes.Index];
            }

            var id = _recipes.RandomValue(_random).Id!.Value;
            recipeDates.Add(date, new(id));
            return id;
        }

        private long? GetRandomRecipe(List<long> chosen)
        {
            var notChosen = _recipes.Keys.Except(chosen).ToArray();
            if (notChosen.Length > 0)
            {
                return notChosen[_random.Next(0, notChosen.Length)];
            }
            return null;
        }
    }
}
