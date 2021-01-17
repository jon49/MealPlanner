using MealPlanner.Data.Utils;
using System;
using System.ComponentModel.DataAnnotations;

namespace MealPlanner.Data.Features.Users.Models
{
    public class LoginUser
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required, MinLength(1, ErrorMessage = "Password required")]
        public string Password { get; set; }
    }

    public static class LoginUserExtensions
    {
        public static User.LoginUser ToDBUser(this LoginUser user, Guid sessionId, byte[] salt)
            => new User.LoginUser
            ( Email: user.Email,
              EncryptedPassword: SecurePasswordHasher.Hash(user.Password, salt),
              SessionId: sessionId );
    }
}
