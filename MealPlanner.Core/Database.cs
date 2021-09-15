using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.User.Databases
{

    public record DBParams(string Name, object? Value);

    public static class Database
    {
        public static async Task ExecuteCommandAsync(
            SqliteConnection connection,
            string sql,
            Action<SqliteDataReader>? map,
            params DBParams[] @params)
        {
            using var command = connection.CreateCommand();
            command.CommandText = sql;

            foreach (var p in @params)
            {
                command.Parameters.AddWithValue(p.Name, p.Value);
            }
            command.Prepare();

            if (map is { })
            {
                using var reader = await command.ExecuteReaderAsync();
                while (reader.Read())
                {
                    map(reader);
                }
            }
            else
            {
                await command.ExecuteNonQueryAsync();
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
            ExecuteCommand(connection, sql, map, @params);
        }

        public static void ExecuteCommand(
            SqliteConnection connection,
            string sql,
            Action<SqliteDataReader>? map = null,
            DBParams[]? @params = null)
        {
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
            SqliteConnection connection,
            string sql,
            DBParams[] @params)
        {
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
            return ExecuteCommand<T>(connection, sql, @params);
        }

        public static T ExecuteCommand<T>(
            SqliteConnection connection,
            string sql,
            params DBParams[] @params)
        {
            using var command = connection.CreateCommand();
            command.CommandText = sql;

            foreach (var p in @params)
            {
                command.Parameters.AddWithValue(p.Name, p.Value);
            }
            command.Prepare();

            return (T)command.ExecuteScalar();
        }

        public static void BulkInsert(
            SqliteConnection connection,
            string sql,
            IEnumerable<DBParams[]> @params)
        {
            if (!@params.Any())
            {
                return;
            }

            using var transaction = connection.BeginTransaction();
            using var command = connection.CreateCommand();
            command.CommandText = sql;

            var paramList = @params.First().Select(x =>
            {
                var sqliteParam = command.CreateParameter();
                sqliteParam.ParameterName = x.Name;
                command.Parameters.Add(sqliteParam);
                return sqliteParam;
            }).ToList();

            var length = paramList.Count();
            foreach (var p in @params)
            {
                for (int i = 0; i < length; i++)
                {
                    var val = p[i].Value;
                    paramList[i].Value = val ?? DBNull.Value;
                }
                command.ExecuteNonQuery();
            }

            transaction.Commit();
        }

    }
}
