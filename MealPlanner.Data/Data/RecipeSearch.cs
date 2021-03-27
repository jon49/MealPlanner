using static MealPlanner.User.Databases.Database;
using Microsoft.Data.Sqlite;
using System.Collections.Generic;
using MealPlanner.User.Databases;
using System.Linq;
using System.Text.RegularExpressions;
using System;

#nullable enable

namespace MealPlanner.Data.Data
{
    public class RecipeSearch
    {
        private readonly SqliteConnection connection;

        public RecipeSearch(IEnumerable<Recipe> recipes)
        {
            connection = new SqliteConnection("Data Source=:memory:");
            connection.Open();

            ExecuteCommand(connection, "CREATE VIRTUAL TABLE search USING fts5(id, name);");
            BulkInsert(connection, $@"
INSERT INTO search (id, name)
VALUES ($id, $name);", recipes.Select(x => new DBParams[]
                                      {
                                          new(Name: "$name", Value: x.Name),
                                          new(Name: "$id", Value: x.Id)
                                      }));
        }

        private static readonly string[] _keywords = new[] { "AND", "OR" };
        private static readonly Regex _wordsOnly = new(@"[^A-Za-z0-9]", RegexOptions.Compiled);
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

        private string CleanSearchTerm(string s)
        {
            var split = _wordsOnly.Replace(s, " ").Split(' ');
            var length = split.Length;
            var clean = new string[length];
            for (int i = 0; i < length; i++)
            {
                var toClean = split[i].Trim();
                if (toClean.Length > 0)
                {
                    clean[i] = toClean;
                    if (char.IsLetterOrDigit(toClean[^1]) && Array.IndexOf(_keywords, toClean) == -1)
                    {
                        clean[i] += '*';
                    }
                }
            }

            return string.Join(' ', clean);
        }

    }
}
