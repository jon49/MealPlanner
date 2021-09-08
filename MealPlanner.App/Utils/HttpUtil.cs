using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authentication.Cookies;
using MealPlanner.User.Dto;

namespace MealPlanner.App.Utils
{
    public static class HttpUtil
    {
        public static Task Login(LoggedInUser user, HttpContext context)
        {
            var claims = new Claim[]
            {
                new("session", user.SessionId),
            };

            var claimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme));
            var authProperties = new AuthenticationProperties
            {
                AllowRefresh = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddMonths(1),
                IsPersistent = true,
            };

            return context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, claimsPrincipal, authProperties);
        }
    }
}

