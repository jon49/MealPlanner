using System;

namespace MealPlanner.User
{
    public record LoginUser
        ( string Email,
          string EncryptedPassword,
          Guid SessionId );
}
