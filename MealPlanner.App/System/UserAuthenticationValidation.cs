using MealPlanner.User.Actions;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Authentication.Cookies;

#nullable enable

namespace MealPlanner.App.System
{
    public class UserAuthenticationValidationMiddleware
    {
        private readonly RequestDelegate _next;

        public UserAuthenticationValidationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            if ((!context.Request.Path.StartsWithSegments("/app", StringComparison.OrdinalIgnoreCase)
                && !context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase))
                || context.Request.Path.StartsWithSegments("/app/login", StringComparison.OrdinalIgnoreCase)
                || context.Request.Path.StartsWithSegments("/app/register", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }
            
            var user = context.RequestServices.GetRequiredService<UserAction>();

            var session = context.User.Claims.FirstOrDefault(x => x.Type == "session")?.Value;
            if (session is null)
            {
                await SignOut();
                return;
            }

            var userId = user.GetSession(session);
            if (userId is null)
            {
                await SignOut();
                return;
            }

            context.Items.Add("userId", userId);

            await _next(context);

            async Task SignOut()
            {
                context.Response.Redirect("/app/login");
                await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                await _next(context);
            }
        }

    }

    public static class AuthenticationMiddlewareExtensions
    {
        public static IApplicationBuilder UseUserAuthenticationValidationMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<UserAuthenticationValidationMiddleware>();
        }
    }
}
