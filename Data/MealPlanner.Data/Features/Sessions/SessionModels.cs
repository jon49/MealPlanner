using System;

namespace MealPlanner.Data.Features.Sessions
{
    public record SessionUser
        ( Guid Id,
          long Expiration,
          bool IsLoggedIn );
}
