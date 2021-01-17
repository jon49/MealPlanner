using MealPlanner.Data.Utils;
using MealPlanner.User;
using System.ComponentModel.DataAnnotations;

namespace MealPlannerData.Models
{
    public class NewUser
    {
        [Required, EmailAddress]
        public string Email { get; set; }
        [Required, MinLength(1, ErrorMessage = "Password required")]
        public string Password { get; set; }
        [Required, MinLength(1)]
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public static class NewUserActions
    {
        public static ParamNewUser ToDBUser(this NewUser user, byte[] salt)
        {
            var encryptedPassword = SecurePasswordHasher.Hash(user.Password, salt);
            return new ParamNewUser
                ( Email: user.Email,
                  Password: encryptedPassword,
                  FirstName: user.FirstName,
                  LastName: user.LastName );
        }
    }
}
