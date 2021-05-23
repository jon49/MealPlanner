using static MealPlanner.User.Databases.Database;
using Microsoft.Data.Sqlite;
using System.Collections.Generic;
using MealPlanner.User.Databases;
using System.Linq;
using System.Text.RegularExpressions;
using System;
using MealPlanner.Data.Data.Models;
using MealPlanner.Data.Data.Models.DatabaseModels;

#nullable enable

namespace MealPlanner.Data.Data.Actions
{
    public class RecipeSearch
    {
        private readonly SqliteConnection connection;

        private const string SaveQuery = "INSERT INTO search (id, name) VALUES ($id, $name);";

        public RecipeSearch(IEnumerable<Recipe> recipes)
        {
            connection = new SqliteConnection("Data Source=:memory:");
            connection.Open();

            ExecuteCommand(connection, "CREATE VIRTUAL TABLE search USING fts5(id, name);");
            BulkInsert(connection, SaveQuery, recipes.Select(CreateSaveParam));
        }

        public void Save(Recipe recipe)
            => ExecuteCommand(connection, SaveQuery, null, CreateSaveParam(recipe));

        private DBParams[] CreateSaveParam(Recipe recipe)
            => new DBParams[]
            {
                new(Name: "$id", Value: recipe.Id),
                new(Name: "$name", Value: recipe.Name),
            };

        private static readonly string searchQuery = $@"
SELECT id
FROM search
WHERE search MATCH $match
ORDER BY rank
limit 10;";
        public List<long> Search(string match, bool strictSearch)
        {
            if (!strictSearch)
            {
                match = CleanSearchTerm(match);
            }
            var list = new List<long>();
            ExecuteCommand(
                connection,
                searchQuery,
                x => list.Add((long)x["id"]),
                new[] { new DBParams(Name: "$match", Value: match) } );
            return list;
        }

        private static readonly string[] _keywords = new[] { "AND", "OR", "NOT" };
        private static readonly Regex _wordsOnly = new(@"[^A-Za-z0-9^:()]", RegexOptions.Compiled);
        private string CleanSearchTerm(string s)
        {
            var split = _wordsOnly.Replace(s, " ").Trim().Split(' ');
            var length = split.Length;
            var clean = new string?[length];
            for (int i = 0; i < length; i++)
            {
                var toClean = split[i].Trim();
                if (toClean.Length > 0)
                {
                    clean[i] = toClean;
                    if (Array.IndexOf(_keywords, toClean) == -1)
                    {
                        clean[i] += '*';
                    }
                }
            }

            for (int i = length - 1; i > -1; i--)
            {
                if (clean[i]?.Length > 0 && Array.IndexOf(_keywords, clean[i]) == -1)
                {
                    break;
                }
                else
                {
                    clean[i] = null;
                }
            }

            return string.Join(' ', clean).Trim();
        }

    }
}
