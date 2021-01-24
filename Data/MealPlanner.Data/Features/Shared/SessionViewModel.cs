using MealPlanner.User;
using System;

namespace MealPlanner.Data.Features.Shared
{
    public record SessionViewModel
        ( Guid Id,
          long Expiration,
          bool IsLoggedIn );

    public static class SessionExtensions
    {
        public static SessionViewModel ToViewModel(this Session session)
            => new(Id: session.Id, Expiration: session.Expiration, IsLoggedIn: session.UserId > 0);
    }
}
