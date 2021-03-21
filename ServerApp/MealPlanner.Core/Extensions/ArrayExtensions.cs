namespace MealPlanner.Core.Extensions
{
    public static class ArrayExtensions
    {
        public static T GetOrDefault<T>(this T[] xs, int index)
            => xs.Length > index ? xs[index] : default;
    }
}
