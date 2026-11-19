using GestionCurricular.Api.Contracts;
using GestionCurricular.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GestionCurricular.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
public sealed class UsuariosController(IUsuariosService usuarios) : ControllerBase
{
    [HttpGet("catalogos")]
    [ProducesResponseType(typeof(CatalogosUsuarioResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<CatalogosUsuarioResponse>> ObtenerCatalogos(
        CancellationToken cancellationToken)
    {
        return Ok(await usuarios.ObtenerCatalogosAsync(cancellationToken));
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UsuarioResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<UsuarioResponse>>> ObtenerTodos(
        [FromQuery] bool incluirInactivos = false,
        CancellationToken cancellationToken = default)
    {
        return Ok(await usuarios.ObtenerTodosAsync(incluirInactivos, cancellationToken));
    }

    [HttpGet("{id:int}/detalles")]
    [ProducesResponseType(typeof(DetalleUsuarioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DetalleUsuarioResponse>> ObtenerDetalles(
        int id,
        CancellationToken cancellationToken)
    {
        var detalle = await usuarios.ObtenerDetallesAsync(id, cancellationToken);
        return detalle is null ? NotFound() : Ok(detalle);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UsuarioResponse>> ObtenerPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var usuario = await usuarios.ObtenerPorIdAsync(id, cancellationToken);
        return usuario is null ? NotFound() : Ok(usuario);
    }

    [HttpPost]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UsuarioResponse>> Crear(
        CrearUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await usuarios.CrearAsync(request, cancellationToken);
        return CreatedAtAction(
            nameof(ObtenerPorId),
            new { id = usuario.IdUsuario },
            usuario);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UsuarioResponse>> Actualizar(
        int id,
        ActualizarUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await usuarios.ActualizarAsync(id, request, cancellationToken);
        return usuario is null ? NotFound() : Ok(usuario);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Desactivar(
        int id,
        CancellationToken cancellationToken)
    {
        return await usuarios.CambiarEstadoAsync(id, false, cancellationToken)
            ? NoContent()
            : NotFound();
    }

    [HttpPut("{id:int}/activar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Activar(
        int id,
        CancellationToken cancellationToken)
    {
        return await usuarios.CambiarEstadoAsync(id, true, cancellationToken)
            ? NoContent()
            : NotFound();
    }

    [HttpPut("{id:int}/perfil")]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UsuarioResponse>> ActualizarPerfil(
        int id,
        ActualizarPerfilUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await usuarios.ActualizarPerfilAsync(id, request, cancellationToken);
        return usuario is null ? NotFound() : Ok(usuario);
    }

    [HttpPut("{id:int}/contrasena")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CambiarContrasena(
        int id,
        CambiarContrasenaUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        return await usuarios.CambiarContrasenaAsync(id, request, cancellationToken)
            ? NoContent()
            : NotFound();
    }
}
