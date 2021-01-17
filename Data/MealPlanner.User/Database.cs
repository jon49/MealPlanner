using Npgsql;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MealPlanner.User
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
        public const string ConnectionString = "Host=localhost;Port=5432;Username=postgres;Password=s;Database=userdb;";

        public static async Task ExecuteCommandAsync(string sql, params DBParams[] @params)
        {
            using var connection = new NpgsqlConnection(ConnectionString);
            await connection.OpenAsync();
            using var command = new NpgsqlCommand(sql, connection);

            foreach (var p in @params)
            {
                command.Parameters.AddWithValue(p.Name, p.Value);
            }
            command.Prepare();

            await command.ExecuteNonQueryAsync();
        }

        public static async Task ExecuteCommandAsync(string sql, Action<NpgsqlDataReader> map, params DBParams[] @params)
        {
            using var connection = new NpgsqlConnection(ConnectionString);
            await connection.OpenAsync();
            using var command = new NpgsqlCommand(sql, connection);

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

        public static void ExecuteCommand(string sql, Action<NpgsqlDataReader> map, params DBParams[] @params)
        {
            using var connection = new NpgsqlConnection(ConnectionString);
            connection.Open();
            using var command = new NpgsqlCommand(sql, connection);

            foreach (var p in @params)
            {
                command.Parameters.AddWithValue(p.Name, p.Value);
            }
            command.Prepare();

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                map(reader);
            }
        }

        public static async Task<T> ExecuteCommandAsync<T>(string sql, DBParams[] @params)
        {
            using var connection = new NpgsqlConnection(ConnectionString);
            await connection.OpenAsync();
            using var command = new NpgsqlCommand(sql, connection);

            foreach (var p in @params)
            {
                command.Parameters.AddWithValue(p.Name, p.Value);
            }
            command.Prepare();

            var result = await command.ExecuteScalarAsync();
            return (T)result;
        }

        public static T ExecuteCommand<T>(string sql, DBParams[] @params)
        {
            using var connection = new NpgsqlConnection(ConnectionString);
            connection.Open();
            using var command = new NpgsqlCommand(sql, connection);

            foreach (var p in @params)
            {
                command.Parameters.AddWithValue(p.Name, p.Value);
            }
            command.Prepare();

            return (T)command.ExecuteScalar();
        }

    }
}
