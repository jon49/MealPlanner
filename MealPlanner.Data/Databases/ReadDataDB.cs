using Event = MealPlanner.Data.Databases.Table.Events;
using static MealPlanner.User.Databases.Database;
using Microsoft.Data.Sqlite;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.IO;
using System;

#nullable enable

namespace MealPlanner.Data.Databases
{
    public record AllUserData(string? Type, byte[]? Value);

    public class ReadDataDB : IDisposable
    {
        private readonly SqliteConnection ReadOnlyConnection;

        public ReadDataDB(string userDataDBPath)
        {
            var connectionString = $"Data Source={userDataDBPath}";
            ReadOnlyConnection = new SqliteConnection($"{connectionString};Mode=ReadOnly;");
            ReadOnlyConnection.Open();
        }

        public void Dispose()
            => ReadOnlyConnection.Close();

        private static readonly string GetAllUserDataQuery = $@"
WITH Duplicates AS (
	SELECT *, ROW_NUMBER() OVER (PARTITION BY {Event.ItemType}, {Event.ItemId} ORDER BY {Event.Id} DESC) DupNum
	FROM {Event.Table}
    WHERE {Event.UserId} = {Event._UserId}
)
SELECT d.{Event.ItemType}, d.{Event.Value}
FROM Duplicates d
WHERE DupNum = 1
  AND Deleted = 0;";
        public async Task<List<AllUserData>> GetAllUserData(long userId)
        {
            var list = new List<AllUserData>();
            await ExecuteCommandAsync(
                ReadOnlyConnection,
                GetAllUserDataQuery,
                x => list.Add(new(x[Event.ItemType] as string, x[Event.Value] as byte[])),
                new User.Databases.DBParams(Name: Event._UserId, Value: userId));
            return list;
        }

    }
}
