using System;
using System.Collections.Generic;

namespace MealPlanner.Core.Extensions
{
    public static class ListExtensions
    {
        public static void AddOrUpdate<T>(this List<T> xs, T value, Predicate<T> match)
        {
            var index = xs.FindIndex(match);
            if (index > 0)
            {
                xs[index] = value;
            }
            else
            {
                xs.Add(value);
            }
        }
    }
}
