using System;
using System.IO;

namespace MealPlanner.App.Utils
{
    public static class Paths
    {
        public static string GetAppDir()
        {
            var mealPlannerDirectoryName = "meal-planner";
            var localAppPath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            var path =
                string.IsNullOrWhiteSpace(localAppPath)
                    ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Personal), ".local", mealPlannerDirectoryName)
                : Path.Combine(localAppPath, mealPlannerDirectoryName);
            Directory.CreateDirectory(path);
            return path;
        }
    }
}
