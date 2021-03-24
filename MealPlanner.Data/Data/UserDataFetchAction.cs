using MealPlanner.Data.Databases;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.Data.Data
{
    public class UserDataFetchAction : IDisposable
    {
        private readonly ReadDataDB ReadDataDB;

        public UserDataFetchAction()
        {
            ReadDataDB = new ReadDataDB();
        }

        public void Dispose()
            => ReadDataDB.Dispose();

        public Task<List<AllUserData>> GetAllUserData(long userId)
            => ReadDataDB.GetAllUserData(userId);

    }
}
