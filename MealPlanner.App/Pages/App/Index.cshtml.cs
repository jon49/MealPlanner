using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ServerApp.Pages.App
{
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any, NoStore = false)]
    public class IndexModel : PageModel
    {
        public void OnGet()
        {
        }
    }
}
