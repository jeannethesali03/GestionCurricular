using GestionCurricular.Api.Services;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace GestionCurricular.Api.Middleware;

public sealed class UsuarioServiceExceptionHandler(
    ILogger<UsuarioServiceExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not UsuarioServiceException serviceException)
        {
            return false;
        }

        logger.LogWarning(
            exception,
            "La operación de usuarios fue rechazada con HTTP {StatusCode}.",
            serviceException.StatusCode);

        httpContext.Response.StatusCode = serviceException.StatusCode;
        await httpContext.Response.WriteAsJsonAsync(
            new ProblemDetails
            {
                Status = serviceException.StatusCode,
                Title = serviceException.Message,
                Instance = httpContext.Request.Path
            },
            cancellationToken);

        return true;
    }
}
