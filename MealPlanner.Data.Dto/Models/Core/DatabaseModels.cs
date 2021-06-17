using System;

#nullable enable

namespace MealPlanner.Data.Dto.Models.Core
{

    public record Recipe
        (long? Id
        , string Name
        , string? BookName
        , int? BookPage
        , string? Other
        , Uri? Url
        , long[] MealTimes) : IId, IName, IComparable
    {
        public int CompareTo(object obj)
            => obj is Recipe recipe
                ? Name.CompareTo(recipe.Name)
            : -1;
    }

    public record MealTime(long? Id, string Name) : IId, IName;

}
