using Microsoft.Data.Sqlite;
using System;
using System.IO;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.User.Databases
{

    public struct DBParams
    {
        public DBParams(string name, object value)
        {
            Name = name;
            Value = value;
        }

        public readonly string Name;
        public readonly object Value;
    }

    public static class Database
    {
        public static readonly string AppDir =
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "meal-planner");

        public static async Task ExecuteCommandAsync(string connectionString, string sql, params DBParams[] @params)
        {
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();
            var command = connection.CreateCommand();
            command.CommandText = sql;

            foreach (var p in @params)
            {
                command.Parameters.AddWithValue(p.Name, p.Value);
            }
            command.Prepare();

            await command.ExecuteNonQueryAsync();
        }

        public static async Task ExecuteCommandAsync(
            string connectionString,
            string sql,
            Action<SqliteDataReader> map,
            params DBParams[] @params)
        {
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;

            foreach (var p in @params)
            {
                command.Parameters.AddWithValue(p.Name, p.Value);
            }
            command.Prepare();

            using var reader = await command.ExecuteReaderAsync();
            while (reader.Read())
            {
                map(reader);
            }
        }

        public static void ExecuteCommand(
            string connectionString,
            string sql,
            Action<SqliteDataReader>? map = null,
            DBParams[]? @params = null)
        {
            using var connection = new SqliteConnection(connectionString);
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = sql;

            if (@params is { })
            {
                foreach (var p in @params)
                {
                    command.Parameters.AddWithValue(p.Name, p.Value);
                }
                command.Prepare();
            }

            if (map is { })
            {
                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    map(reader);
                }
            }
            else
            {
                command.ExecuteNonQuery();
            }
        }

        public static async Task<T> ExecuteCommandAsync<T>(
            string connectionString,
            string sql,
            DBParams[] @params)
        {
            using var connection = new SqliteConnection(connectionString);
            await connection.OpenAsync();
            using var command = connection.CreateCommand();
            command.CommandText = sql;

            foreach (var p in @params)
            {
                command.Parameters.AddWithValue(p.Name, p.Value);
            }
            command.Prepare();

            var result = await command.ExecuteScalarAsync();
            return (T)result;
        }

        public static T ExecuteCommand<T>(
            string connectionString,
            string sql,
            DBParams[] @params)
        {
            using var connection = new SqliteConnection(connectionString);
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = sql;

            foreach (var p in @params)
            {
                command.Parameters.AddWithValue(p.Name, p.Value);
            }
            command.Prepare();

            return (T)command.ExecuteScalar();
        }

    }
}
