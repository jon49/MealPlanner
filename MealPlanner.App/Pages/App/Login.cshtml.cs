using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc;
using ServerApp.Utils;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Text;
using Microsoft.Extensions.Options;
using ServerApp.System;
using MealPlanner.User.Actions;
using System;
using Microsoft.AspNetCore.Authentication.Cookies;
using MealPlanner.User.Dto.Actions;

#nullable enable

namespace ServerApp.Pages
{
    public class LoginModel : PageModel
    {
        private readonly byte[] _salt;
        private readonly UserAction _user;

        public LoginModel(IOptions<UserSettings> userSettings, UserAction user)
        {
            _salt = Encoding.UTF8.GetBytes(userSettings.Value.Salt);
            _user = user ?? throw new ArgumentNullException(nameof(user));
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
                var claims = new Claim[]
                {
                    new("session", user.SessionId),
                };

                await HttpContext.SignInAsync(new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));

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
            return _user.ProcessLoginUser(hashedUser);
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
