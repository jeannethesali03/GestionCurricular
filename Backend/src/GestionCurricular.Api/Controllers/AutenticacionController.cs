using GestionCurricular.Api.Contracts;
using GestionCurricular.Api.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;

namespace GestionCurricular.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AutenticacionController(
    IUsuariosService usuarios,
    SesionPorPestanaService sesiones) : ControllerBase
{
    /// <summary>Valida una invitación de un solo uso y activa la cuenta con una contraseña nueva.</summary>
    [HttpPost("activar-cuenta")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ActivarCuenta(
        ActivarCuentaRequest request,
        CancellationToken cancellationToken)
    {
        await usuarios.ActivarCuentaAsync(request, cancellationToken);
        return NoContent();
    }

    /// <summary>Consume un enlace de restablecimiento y guarda la contraseña nueva.</summary>
    [HttpPost("restablecer-contrasena")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RestablecerContrasena(
        RestablecerContrasenaRequest request,
        CancellationToken cancellationToken)
    {
        await usuarios.RestablecerContrasenaAsync(request, cancellationToken);
        return NoContent();
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(SesionUsuarioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SesionUsuarioResponse>> IniciarSesion(
        IniciarSesionRequest request,
        CancellationToken cancellationToken)
    {
        var sesion = await usuarios.IniciarSesionAsync(request, cancellationToken);
        if (sesion is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Correo o contraseña incorrectos, o la cuenta está inactiva.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        var sessionToken = sesiones.Crear(
            sesion.Id,
            sesion.Nombre,
            sesion.Email,
            sesion.Rol);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, sesion.Id),
            new Claim(ClaimTypes.Name, sesion.Nombre),
            new Claim(ClaimTypes.Email, sesion.Email),
            new Claim(ClaimTypes.Role, sesion.Rol)
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(identity),
            new AuthenticationProperties { IsPersistent = true });

        return Ok(sesion with { SessionToken = sessionToken });
    }

    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CerrarSesion()
    {
        if (Request.Headers.TryGetValue("X-Session-Token", out var valores))
            sesiones.Revocar(valores.ToString());
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }
}
