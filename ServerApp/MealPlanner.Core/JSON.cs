using System;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.Core
{
    public static class JSON
    {
        public static async Task<T?> Deserialize<T>(byte[]? data) where T : class
        {
            if (data is null)
            {
                return null;
            }
            using var stream = new MemoryStream(data);
            var result = await JsonSerializer.DeserializeAsync<T>(stream);
            return result;
        }
    }
}
