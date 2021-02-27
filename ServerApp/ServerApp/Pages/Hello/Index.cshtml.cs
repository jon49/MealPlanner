using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ServerApp.Pages.Hello
{
    public class IndexModel : PageModel
    {
        public string Message { get; private set; } = "The time is";

        public void OnGet()
        {
            Message += $" {DateTime.Now.ToString("h:mm:ss")}";
        }
    }
}
