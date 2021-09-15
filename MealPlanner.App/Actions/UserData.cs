using MealPlanner.Data.Data;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.App.Actions
{
    public class UserData
    {
        private readonly UserDataPersistAction persistenceRef;
        private readonly UserDataFetchAction fetchRef;
        private readonly IMemoryCache _cache;
        private readonly MemoryCacheEntryOptions _option;

        public UserData(IMemoryCache cache, IHostApplicationLifetime appLifetime, string userDataDBPath)
        {
            persistenceRef = new(userDataDBPath);
            fetchRef = new(userDataDBPath);
            _cache = cache;
            _option = new MemoryCacheEntryOptions
            {
                Priority = CacheItemPriority.High
            };
            _option.SetSlidingExpiration(TimeSpan.FromMinutes(20));
            appLifetime.ApplicationStopped.Register(Dispose);
        }

        public async Task<UserDataAction> GetUserData(long userId)
        {
            if (userId < 1)
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

        private void Dispose()
            => persistenceRef.Dispose();
    }
}
