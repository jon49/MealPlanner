using LanguageExt;
using Proto;
using System;
//using Proto.Timers;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MealPlanner.User.Actors
{
    public record Tick();

    public class UpdateSessionActor : IActor
    {
        private readonly Queue<Session> _queue = new();
        //private readonly ISimpleScheduler _scheduler = new SimpleScheduler();

        public async Task ReceiveAsync(IContext context)
        {
            _ = (context.Message switch
            {
                Session s => await QueueData(context, s),
                Tick _ => await SaveData(context),
                Started _ => ProcessStart(context),
                _ => Unit.Default,
            });
        }

        private Unit ProcessStart(IContext context)
        {
            //_scheduler.ScheduleTellRepeatedly(TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(1), context.Self, new Tick(), out _);
            return Unit.Default;
        }

        private async Task<Unit> QueueData(IContext context, Session s)
        {
            //_queue.Enqueue(s);
            //if (_queue.Count == 5)
            //{
            //    context.Send(context.Self, new Tick());
            //}
            var watch = new System.Diagnostics.Stopwatch();
            watch.Start();
            await SessionDB.SaveSession(s);
            watch.Stop();
            var elapsed = watch.ElapsedMilliseconds;
            Console.WriteLine($"Save Session: {elapsed}");

            return Unit.Default;
        }

        private async Task<Unit> SaveData(IContext context)
        {
            var sessions = _queue.ToArray();
            _queue.Clear();
            foreach (var session in sessions)
            {
                await SessionDB.SaveSession(session);
            }
            return Unit.Default;
        }
    }
}
