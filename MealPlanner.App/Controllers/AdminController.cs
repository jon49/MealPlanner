using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using ServerApp.System;
using System;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
#nullable enable

namespace ServerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AdminSettings _adminSettings;
        private readonly IHostApplicationLifetime _appLifetime;

        public AdminController(
            IOptions<AdminSettings> adminSettings,
            IHostApplicationLifetime appLifetime)
        {
            _adminSettings = adminSettings.Value;
            _appLifetime = appLifetime ?? throw new ArgumentNullException(nameof(appLifetime));
        }

        [HttpPost]
        [Route("shutdown")]
        public IActionResult PostShutdown()
        {
            var authResult = IsNotAuthorized();
            if (authResult is { }) return authResult;
            _appLifetime.StopApplication();
            return Ok();
        }

        private IActionResult? IsNotAuthorized()
        {
            if (!Guid.TryParse(HttpContext.Request.Headers["Authorization"], out var guid))
            {
                return Unauthorized();
            }

            return _adminSettings.AdminPassword != guid
                ? Unauthorized()
           : null;
        }
    }
}
