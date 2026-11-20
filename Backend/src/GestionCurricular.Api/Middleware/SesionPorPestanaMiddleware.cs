using GestionCurricular.Api.Services;

namespace GestionCurricular.Api.Middleware;

public sealed class SesionPorPestanaMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, SesionPorPestanaService sesiones)
    {
        if (context.Request.Headers.TryGetValue("X-Session-Token", out var valores))
        {
            var token = valores.ToString();
            if (string.IsNullOrWhiteSpace(token)
                || !sesiones.TryObtener(token, out var principal)
                || principal is null)
            {
                context.User = new System.Security.Claims.ClaimsPrincipal();
            }
            else
            {
                context.User = principal;
            }
        }

        await next(context);
    }
}
