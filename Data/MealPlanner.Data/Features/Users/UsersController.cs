using MealPlanner.Data.Features.Shared;
using MealPlanner.Data.Features.Users.Models;
using MealPlanner.Data.Utils;
using MealPlannerData.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

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
            var encryptedPassword = SecurePasswordHasher.Hash(user.Password, Setting.App.Session.GetSalt);
            var session = await SystemActor.User.RegisterUser(
                new User.Actors.RegisterUser(
                    SessionId: sessionId.Value,
                    Email: user.Email,
                    EncryptedPassword: encryptedPassword,
                    FirstName: user.FirstName,
                    LastName: user.LastName ));
            if (session?.Id is null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            if (session.UserId == 0)
            {
                return BadRequest(new Http.BadRequest("User already exists"));
            }

            return Created("/api/sessions", session.ToViewModel());
        }

        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> LoginUser([FromBody] LoginUser user, [FromHeader] Guid? sessionId)
        {
            if (!sessionId.HasValue) return StatusCode(StatusCodes.Status401Unauthorized);
            var encryptedUser = user.ToDBUser(sessionId.Value, Setting.App.Session.GetSalt);
            var session = await SystemActor.User.LoginUser(encryptedUser);
            if (session is { })
            {
                return Ok(session.ToViewModel());
            }
            return BadRequest("Cannot log in.");
        }

        [HttpPost]
        [Route("logout")]
        public async Task<IActionResult> LogoutUser([FromHeader] Guid sessionId)
        {
            await SystemActor.User.LogoutSession(sessionId);
            return Ok();
        }
    }
}
