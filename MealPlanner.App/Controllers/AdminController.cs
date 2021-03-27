using MealPlanner.User.Actions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using ServerApp.Actions;
using ServerApp.System;
using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
#nullable enable

namespace ServerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AdminSettings _adminSettings;
        private readonly UserAction _user;
        private readonly IHostApplicationLifetime _appLifetime;

        public AdminController(
            IOptions<AdminSettings> adminSettings,
            UserAction user,
            IHostApplicationLifetime appLifetime)
        {
            _adminSettings = adminSettings.Value;
            _user = user ?? throw new ArgumentNullException(nameof(user));
            _appLifetime = appLifetime ?? throw new ArgumentNullException(nameof(appLifetime));
        }

        [HttpPost]
        [Route("beta-users")]
        public async Task<IActionResult> PostBetaUser([FromBody][EmailAddress] string email)
        {
            var authResult = IsNotAuthorized();
            if (authResult is { }) return authResult;

            var result = await _user.AddBetaUser(email);

            if (result > 0)
            {
                return Ok();
            }
            else
            {
                return Problem();
            }
        }

        [HttpGet]
        [Route("beta-users")]
        public async Task<IActionResult> GetBetaUsers()
        {
            var authResult = IsNotAuthorized();
            if (authResult is { }) return authResult;
            return Ok(await _user.GetBetaUsers());
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
