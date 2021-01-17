using System;
using System.IO;
using System.Reflection;
using System.Text;
using System.Text.Json;

namespace MealPlanner.Data
{
    public record SessionSetting(string Salt)
    {
        private byte[] _Salt;
        public byte[] GetSalt
        {
            get
            {
                if (_Salt is null)
                {
                    _Salt = Encoding.UTF8.GetBytes(Salt);
                }
                return _Salt;
            }
        }
    };
    public record AppSettings ( SessionSetting Session );
    public record AppSetting ( AppSettings App );

    public static class Setting
    {
        private static AppSettings _App;
        public static AppSettings App
        {
            get
            {
                if (_App is null)
                {
                    var path = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
                    var bytes = File.ReadAllBytes(Path.Combine(path, "appsettings.json"));
                    _App = JsonSerializer.Deserialize<AppSetting>(bytes).App;
                }
                return _App;
            }
        }
        public static readonly string AppDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "meal-planner");
    }
}
