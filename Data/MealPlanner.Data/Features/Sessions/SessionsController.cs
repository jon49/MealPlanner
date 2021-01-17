using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using D = MealPlanner.User.Data;

namespace MealPlanner.Data.Features.Sessions
{
    [Route("api/sessions")]
    [ApiController]
    public class SessionsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> GetCreateOrDeleteSession([FromQuery] Guid? sessionId)
        {
            var session = await D.TryGetOrAddOrDeleteSession(sessionId);
            return Ok(new SessionUser
                ( Expiration: session.Expiration,
                  Id: session.Id,
                  IsLoggedIn: session.UserId > 0 ));
        }
    }
}
