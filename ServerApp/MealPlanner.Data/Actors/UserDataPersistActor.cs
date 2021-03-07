using MealPlanner.Core;
using MealPlanner.Data.Databases;
using Proto;
using Proto.Timers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MealPlanner.Data.Actors
{
    public class UserDataPersistActor : IActor
    {
        private readonly WriteDataDB db;
        private readonly Queue<EventItem> queue = new();

        public UserDataPersistActor()
        {
            db = new WriteDataDB();
        }

        public Task ReceiveAsync(IContext context)
            => context.Message switch
            {
                EventItem item => QueueData(item),
                Tick _ => SaveData(),
                Started _ => Started(context),
                Stopped _ => db.Dispose(),
                _ => Task.CompletedTask,
            };

        private Task SaveData()
        {
            if (queue.Any())
            {
                var items = queue.ToArray();
                db.SaveEvents(items);
                queue.Clear();
            }
            return Task.CompletedTask;
        }

        private Task QueueData(EventItem item)
        {
            queue.Enqueue(item);
            return Task.CompletedTask;
        }

        private Task Started(IContext context)
        {
            context.Scheduler().SendRepeatedly(TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(2), context.Self, Tick.Default);
            return db.Init();
        }

    }
}
