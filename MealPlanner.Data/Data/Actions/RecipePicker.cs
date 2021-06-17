using MealPlanner.Data.Dto.Models.Core;
using MealPlanner.Core;
using System;
using System.Collections.Generic;
using System.Linq;

#nullable enable

namespace MealPlanner.Data.Data.Actions
{
    public class RecipePicker
    {
        private readonly Dictionary<long, Recipe> _recipes;
        private readonly Random _random;

        public RecipePicker(Dictionary<long, Recipe> recipes, Random random)
        {
            _recipes = recipes;
            _random = random;
        }

        public (IEnumerable<long>, int?) Next(IEnumerable<long> list, int index)
        {
            long? id;
            if (list.Any())
            {
                index++;
                if (index >= list.Count())
                {
                    id = GetRandomRecipe(list);
                    if (id is { })
                    {
                        return (list.Append(id.Value), index);
                    }
                    index = 0;
                }
                return (list, index);
            }

            id = _recipes.RandomValue(_random).Id;
            if (id.HasValue)
            {
                return (new[] { id.Value }, 0);
            }

            return (list, null);
        }

        public (IEnumerable<long>, int?) Previous(IEnumerable<long> list, int index)
        {
            if (list.Any())
            {
                if (index > 0)
                {
                    index--;
                }
                else
                {
                    index = list.Count() - 1;
                }
                return (list, index);
            }

            var id = _recipes.RandomValue(_random).Id;
            if (id.HasValue)
            {
                return (new[] { id.Value }, 0);
            }

            return (list, null);
        }

        private long? GetRandomRecipe(IEnumerable<long> chosen)
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
