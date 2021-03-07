using System;
using System.Collections.Generic;
using System.Linq;

namespace MealPlanner.Core
{
    public static class DictionaryExtensions
    {
        public static void AddOrUpdate<TKey, TValue>(this IDictionary<TKey, TValue> dic, TKey key, TValue value)
        {
            if (dic.ContainsKey(key))
            {
                dic[key] = value;
            }
            else
            {
                dic.Add(key, value);
            }
        }

        public static TValue[] TryGetValuesOrDefault<TKey, TValue>(this IDictionary<TKey, TValue> dic, TKey[] keys)
        {
            var values = new TValue[keys.Length];
            var count = 0;
            foreach (var key in keys)
            {
                if (dic.TryGetValue(key, out var value))
                {
                    values[count++] = value;
                }
                else
                {
                    values[count++] = default;
                }
            }
            return values;
        }

        public static TValue RandomValue<TKey, TValue>(this IDictionary<TKey, TValue> dic, Random rand)
            => dic.Values.ElementAt(rand.Next(0, dic.Count));
    }
}
