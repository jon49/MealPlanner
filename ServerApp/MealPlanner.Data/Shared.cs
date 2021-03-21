using System;
using System.Linq;

#nullable enable

namespace MealPlanner.Data
{
    public static class Shared
    {
        public static string? ToMealPlanId(DateTime? date) => date?.ToString("yyyy-MM-dd");
        public static DateTime? FromMealPlanId(string? date)
        {
            if (date is null) return null;
            var split = date.Split("-");
            if (split.Length != 3) return null;
            var nums = split.Select(x => int.Parse(x)).ToArray();
            return new DateTime(nums[0], nums[1], nums[2]);
        }
    }
}
