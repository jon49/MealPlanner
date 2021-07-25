using MealPlanner.App.Actions;
using MealPlanner.Data.Data;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System;
using System.Threading.Tasks;

#nullable enable

namespace ServerApp.Pages.Shared
{
    public abstract class BaseUserPage : PageModel
    {
        private readonly UserData _data;

        public BaseUserPage(UserData data)
        {
            _data = data ?? throw new ArgumentNullException(nameof(data));
        }

        protected Task<UserDataAction> UserAction => _data.GetUserData((long?)HttpContext.Items["userId"] ?? 0);

        protected bool IsHTMFRequest()
            => HttpContext.Request.Headers.ContainsKey("HF-Request");
    }
}
