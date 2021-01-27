using MealPlanner.Data.Features.Shared;
using MealPlanner.User.Databases;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

#nullable enable

namespace MealPlanner.Data.Features.Sessions
{
    [Route("api/sessions")]
    [ApiController]
    public class SessionsController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> GetCreateOrDeleteSession([FromQuery] Guid? sessionId)
        {
            Session? session = null;
            if (sessionId.HasValue)
            {
                session = await SystemActor.User.GetSession(sessionId.Value);
            }

            if (session is null)
            {
                session = await SystemActor.User.NewSession();
            }

            return Ok(session.ToViewModel());
        }

        [HttpGet, Route("hydrate")]
        public IActionResult Hydrate()
        {
            SystemActor.User.Hydrate();
            return Ok();
        }
    }
}
