using System;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ServerApp.Pages.Hello
{
    public class IndexModel : PageModel
    {
        public string Message { get; private set; } = "The time is";

        public void OnGet()
        {
            Message += $" {DateTime.Now:h:mm:ss}";
        }
    }
}
