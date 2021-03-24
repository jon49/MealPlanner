using MealPlanner.Data.Databases;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading;

namespace MealPlanner.Data.Data
{
    public class UserDataPersistAction : IDisposable
    {
        private readonly WriteDataDB db;
        private readonly Timer timer;
        private readonly ConcurrentQueue<EventItem> queue = new();
        private volatile bool _saving = false;

        public UserDataPersistAction()
        {
            db = new WriteDataDB();
            timer = new Timer(SaveData, null, TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(1));
        }

        public void Dispose()
        {
            timer.Dispose();
            db.Dispose();
        }

        public void Queue(EventItem item)
            => queue.Enqueue(item);

        private void SaveData(object _)
        {
            if (queue.Any() && !_saving)
            {
                _saving = true;
                var items = queue.ToArray();
                queue.Clear();
                db.SaveEvents(items);
                _saving = false;
            }
        }
    }
}
