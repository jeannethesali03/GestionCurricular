using GestionCurricular.Api.Contracts;
using GestionCurricular.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GestionCurricular.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AutenticacionController(IUsuariosService usuarios) : ControllerBase
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
        return sesion is null
            ? Unauthorized(new ProblemDetails
            {
                Title = "Correo o contraseña incorrectos, o la cuenta está inactiva.",
                Status = StatusCodes.Status401Unauthorized
            })
            : Ok(sesion);
    }
}
