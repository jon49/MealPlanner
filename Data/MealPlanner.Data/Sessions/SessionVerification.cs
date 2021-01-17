using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace MealPlanner.Data.Sessions
{
    public interface ISessionResult { }

    public static class SessionVerification
    {
        //public static async Task GetCreateOrDeleteSession(Guid? sessionId)
        //{
        //    if (sessionId.HasValue)
        //    {
        //        var sessionData = DB.Session.GetSessionData(sessionId.Value).FirstOrDefault();
        //        var now = DateTimeOffset.Now.ToUnixTimeSeconds();
        //        if (sessionData?.Expiration > now)
        //        {
        //            return Ok(sessionData);
        //        }
        //        else if (sessionData?.Expiration < now)
        //        {
        //            await DB.Session.DeleteSession(sessionId.Value);
        //            return await CreateSession();
        //        }
        //    }
        //    else
        //    {
        //        return await CreateSession();
        //    }

        //    return StatusCode(StatusCodes.Status401Unauthorized);
        //    async Task<CreatedResult> CreateSession()
        //    {
        //        var session = await DB.Session.CreateSession();
        //        return Created($"/api/sessions/{session.Id}", session);
        //    }
        //}
    }
}
