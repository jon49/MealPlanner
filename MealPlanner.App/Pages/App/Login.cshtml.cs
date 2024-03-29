using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc;
using ServerApp.Utils;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using System.Text;
using Microsoft.Extensions.Options;
using ServerApp.System;
using System;
using Microsoft.AspNetCore.Authentication.Cookies;
using MealPlanner.App.Actions;
using MealPlanner.User.Dto;
using MealPlanner.User;
using MealPlanner.App.Utils;

#nullable enable

namespace ServerApp.Pages
{
    public class LoginModel : PageModel
    {
        private readonly byte[] _salt;
        private readonly User _user;

        public LoginModel(IOptions<UserSettings> userSettings, SystemActor system)
        {
            _salt = Encoding.UTF8.GetBytes(userSettings.Value.Salt);
            _user = system?.User ?? throw new ArgumentNullException(nameof(system));
        }

        [BindProperty]
        public UserLogin? UserLogin { get; set; }
        public string ErrorMessage { get; set; } = "";

        public void OnGet(string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
        }

        public async Task<IActionResult> OnPost(string? returnUrl = null)
        {
            var user = await ValidateLogin(UserLogin);
            if (user?.UserId > 0)
            {
                await HttpUtil.Login(user, HttpContext);

                return
                    Url.IsLocalUrl(returnUrl) && returnUrl != "/"
                        ? Redirect(returnUrl)
                    : Redirect("/app");
            }

            ErrorMessage = "Incorrect email or password, try again!";
            return Page();
        }

        public async Task OnGetLogout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            HttpContext.Response.Redirect("/hello");
        }

        private Task<LoggedInUser?> ValidateLogin(UserLogin? user)
        {
            if (user is null) return Task.FromResult<LoggedInUser?>(null);
            var hashedUser = user.ToDBUser(_salt);
            return _user.LoginUser(hashedUser);
        }
    }

    public class UserLogin
    {
        [Required, MinLength(3)]
        public string? Email { get; set; }
        [Required, MinLength(5)]
        public string? Password { get; set; }
    }

    public static class LoginUserExtensions
    {
        public static LoginUser ToDBUser(this UserLogin user, byte[] salt)
            => new
            ( Email: user.Email ?? "",
              EncryptedPassword: SecurePasswordHasher.Hash(user.Password, salt) );
    }
}
