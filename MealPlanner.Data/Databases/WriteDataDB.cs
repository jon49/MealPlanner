using Event = MealPlanner.Data.Databases.Table.Events;
using Microsoft.Data.Sqlite;
using System.IO;
using static MealPlanner.User.Databases.Database;
using System.Linq;
using MealPlanner.User.Databases;
using System;

#nullable enable

namespace MealPlanner.Data.Databases
{
    public record EventItem
        ( bool Deleted
        , string ItemId
        , string ItemType
        , string Source
        , long UserId
        , byte[] Value );

    public class WriteDataDB : IDisposable
    {
        private readonly SqliteConnection ReadWriteConnection;
        private static readonly string commandCreateDatabase = $@"
CREATE TABLE IF NOT EXISTS {Event.Table} (
    {Event.Id} INTEGER NOT NULL PRIMARY KEY,
    {Event.UserId} INTEGER NOT NULL,
    {Event.ItemType} TEXT NOT NULL,
    {Event.ItemId} TEXT NOT NULL,
    {Event.Value} BLOB NULL,
    {Event.Source} TEXT NOT NULL DEFAULT 'server',
    {Event.Deleted} INTEGER NOT NULL DEFAULT 0);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fetch ON {Event.Table} ({Event.UserId}, {Event.ItemType}, {Event.ItemId}, {Event.Id});";

        public WriteDataDB()
        {
            var connectionString = $"Data Source={Path.Combine(GetAppDir(), "user-data.db")}";
            ExecuteCommand($"{connectionString};Mode=ReadWriteCreate;", commandCreateDatabase);
            ReadWriteConnection = new SqliteConnection($"{connectionString};Mode=ReadWrite;");
            ReadWriteConnection.Open();
        }

        public void Dispose()
            => ReadWriteConnection.Close();

        private static readonly string CreateEventCommand = $@"
INSERT INTO {Event.Table} ({Event.Deleted}, {Event.ItemId}, {Event.ItemType}, {Event.Source}, {Event.UserId}, {Event.Value})
VALUES ({Event._Deleted}, {Event._ItemId}, {Event._ItemType}, {Event._Source}, {Event._UserId}, {Event._Value});";
        public void SaveEvents(EventItem[] eventItems)
            => BulkInsert(
                ReadWriteConnection,
                CreateEventCommand,
                eventItems.Select(x => new DBParams[]
                {
                    new(Name: Event._Deleted, x.Deleted),
                    new(Name: Event._ItemId, x.ItemId),
                    new(Name: Event._ItemType, x.ItemType),
                    new(Name: Event._Source, x.Source),
                    new(Name: Event._UserId, x.UserId),
                    new(Name: Event._Value, x.Value),
                }));
    }
}
