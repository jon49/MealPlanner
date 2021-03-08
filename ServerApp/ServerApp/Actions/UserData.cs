using MealPlanner.Data.Data;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Threading.Tasks;

#nullable enable

namespace ServerApp.Actions
{
    public class UserData
    {
        private readonly UserDataPersistAction persistenceRef;
        private readonly UserDataFetchAction fetchRef;
        private readonly IMemoryCache _cache;
        private readonly MemoryCacheEntryOptions _option;

        public UserData(IMemoryCache cache)
        {
            persistenceRef = new();
            fetchRef = new();
            _cache = cache;
            _option = new MemoryCacheEntryOptions
            {
                Priority = CacheItemPriority.High
            };
            _option.SetSlidingExpiration(TimeSpan.FromMinutes(20));
        }

        public async Task<UserDataAction> GetUserData(long userId)
        {
            if (userId <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(userId));
            }

            if (_cache.TryGetValue(userId, out UserDataAction user))
            {
                return user;
            }
            else
            {
                var newUser = await UserDataAction.Create(persistenceRef, fetchRef, userId);
                _cache.Set(userId, newUser, _option);
                return newUser;
            }
        }
    }
}
