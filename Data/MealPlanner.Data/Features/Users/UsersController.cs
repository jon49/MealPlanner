using MealPlanner.Data.Features.Sessions;
using MealPlanner.Data.Features.Users.Models;
using MealPlanner.Data.Utils;
using MealPlannerData.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using D = MealPlanner.User.Data;

namespace MealPlanner.Data.Controllers.Users
{
    [Route("api/users")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> RegisterUser([FromBody] NewUser user, [FromHeader] Guid? sessionId)
        {
            if (!sessionId.HasValue) return StatusCode(StatusCodes.Status401Unauthorized);
            var encryptedUser = user.ToDBUser(Setting.App.Session.GetSalt);
            var userId = await D.RegisterNewUser(sessionId.Value, encryptedUser);
            if (userId is null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            if (userId == 0)
            {
                return BadRequest(new Http.BadRequest("User already exists"));
            }

            return Created($"/api/users/{userId}", userId);
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> LoginUser([FromBody] LoginUser user, [FromHeader] Guid? sessionId)
        {
            if (!sessionId.HasValue) return StatusCode(StatusCodes.Status401Unauthorized);
            var encryptedUser = user.ToDBUser(sessionId.Value, Setting.App.Session.GetSalt);
            var result = await D.LoginUser(encryptedUser);
            if (result is { })
            {
                return Ok(new SessionUser
                    (Expiration: result.Expiration,
                      Id: result.Id,
                      IsLoggedIn: result.UserId > 0 ));
            }
            return BadRequest("Cannot log in.");
        }

        [HttpPost]
        [Route("logout")]
        public async Task<IActionResult> LogoutUser([FromHeader] Guid sessionId)
        {
            await D.LogoutUser(sessionId);
            return Ok();
        }
    }
}
