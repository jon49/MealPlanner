using Microsoft.AspNetCore.Http;

namespace ServerApp.Utils
{
    public static class HTMF
    {
        public static bool IsHTMFRequest(HttpContext httpContext)
            => httpContext.Request.Headers.ContainsKey("HF-Request");
    }
}
