using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using MealPlanner.User.Actions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Options;
using ServerApp.System;
using ServerApp.Utils;

namespace ServerApp.Pages
{
    public class RegisterModel : PageModel
    {
        private readonly byte[] _salt;
        private readonly UserAction _user;

        public RegisterModel(IOptions<UserSettings> userSettings, UserAction user)
        {
            _salt = Encoding.UTF8.GetBytes(userSettings.Value.Salt);
            _user = user;
        }

        [BindProperty]
        public UserRegister UserRegister { get; set; }

        public string ErrorMessage { get; set; } = null;

        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            var id = await _user.ProcessRegisterUser(UserRegister.ToRegisterUser(_salt));
            if (id > 0)
            {
                var claims = new List<Claim>
                {
                    new("userId", id.ToString()),
                    new("role", "Member"),
                };

                await HttpContext.SignInAsync(new ClaimsPrincipal(new ClaimsIdentity(claims, "Cookies", "user", "role")));

                return Redirect("/app");
            }

            ErrorMessage = "Incorrect email or password, try again!";
            return Page();
        }
    }

    public class UserRegister
    {
        [Required, MinLength(3, ErrorMessage = "Must be at least 3 characters long.")]
        public string Email { get; set; }

        [Required, MinLength(5, ErrorMessage = "Password Required")]
        public string Password { get; set; }

        [Required, MinLength(5), Compare(nameof(Password), ErrorMessage = "Password and Confirmation Password must be the same")]
        public string ConfirmationPassword { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public static class UserRegisterExtensions
    {
        public static RegisterUser ToRegisterUser(this UserRegister user, byte[] salt)
            => new(
                Email: user.Email.Trim(),
                EncryptedPassword: SecurePasswordHasher.Hash(user.Password, salt),
                FirstName: user.FirstName?.Trim(),
                LastName: user.LastName?.Trim());
    }
}
