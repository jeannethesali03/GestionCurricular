using GestionCurricular.Api.Contracts;
using GestionCurricular.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GestionCurricular.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AutenticacionController(IUsuariosService usuarios) : ControllerBase
{
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
