using System.ComponentModel.DataAnnotations;

namespace MealPlannerData.Models
{
    public class NewUser
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required, MinLength(1, ErrorMessage = "Password required")]
        public string Password { get; set; }

        [Required, Compare(nameof(Password), ErrorMessage = "Password and Confirmation Password must be the same")]
        public string ConfirmationPassword { get; set; }

        [Required, MinLength(1)]
        public string FirstName { get; set; }

        public string LastName { get; set; }
    }
}
