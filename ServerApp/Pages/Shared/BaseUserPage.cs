using MealPlanner.Data.Data;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ServerApp.Actions;
using System.Linq;
using System.Threading.Tasks;

#nullable enable

namespace ServerApp.Pages.Shared
{
    public abstract class BaseUserPage : PageModel
    {
        private readonly UserData _data;

        public BaseUserPage(UserData data)
        {
            _data = data ?? throw new global::System.ArgumentNullException(nameof(data));
        }

        protected long UserId => long.Parse(User.Claims.First(x => x.Type == "userId").Value);
        protected Task<UserDataAction> UserAction => _data.GetUserData(UserId);
    }
}
