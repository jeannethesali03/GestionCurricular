using GestionCurricular.Api.Contracts;
using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
public sealed class UsuariosController(
    GestionCurricularDbContext db,
    IPasswordHasher<Usuario> passwordHasher) : ControllerBase
{
    [HttpGet("{id:int}/detalles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerDetalles(
        int id,
        [FromQuery] bool incluirInactivos = false,
        CancellationToken cancellationToken = default)
    {
        var usuario = await db.Usuarios
            .AsNoTracking()
            .AsSplitQuery()
            .Include(entity => entity.Rol)
            .Include(entity => entity.Facultad)
            .Include(entity => entity.TokensAutenticacion)
            .Include(entity => entity.RegistrosCambios)
            .Include(entity => entity.PlanesParticipados).ThenInclude(relacion => relacion.PlanEstudio)
            .Include(entity => entity.AsignaturasParticipadas).ThenInclude(relacion => relacion.Asignatura)
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);

        if (usuario is null)
        {
            return NotFound();
        }

        return Ok(new
        {
            usuario = ConvertirRespuesta(usuario),
            tokens = usuario.TokensAutenticacion.Select(token => new
            {
                token.IdToken,
                tipo = token.TipoToken switch
                {
                    TipoTokenAutenticacion.Activacion => "activacion",
                    TipoTokenAutenticacion.Invitacion => "invitacion",
                    TipoTokenAutenticacion.ResetPassword => "reset_password",
                    _ => throw new InvalidOperationException($"Tipo de token no soportado: {token.TipoToken}.")
                },
                token.Expiracion,
                consumido = token.Consumido ?? false
            }),
            historialCambios = usuario.RegistrosCambios
                .OrderByDescending(registro => registro.FechaHora)
                .Select(registro => new
                {
                    registro.IdRegistroCambio,
                    registro.TituloCambio,
                    registro.DetalleCambio,
                    registro.TipoCambio,
                    registro.FechaHora
                }),
            planesParticipados = usuario.PlanesParticipados
                .Where(relacion => incluirInactivos || relacion.EstadoRegistro == EstadoRegistro.Activo)
                .Select(relacion => new
                {
                    relacion.IdUsuarioParticipantePlan,
                    relacion.IdPlan,
                    relacion.PlanEstudio.CicloInicio,
                    relacion.PlanEstudio.CicloFin,
                    estado = relacion.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            asignaturasParticipadas = usuario.AsignaturasParticipadas
                .Where(relacion => incluirInactivos || relacion.EstadoRegistro == EstadoRegistro.Activo)
                .Select(relacion => new
                {
                    relacion.IdUsuarioParticipanteAsignatura,
                    relacion.IdAsignatura,
                    relacion.Asignatura.NombreAsignatura,
                    estado = relacion.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                })
        });
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UsuarioResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<UsuarioResponse>>> ObtenerTodos(
        [FromQuery] bool incluirInactivos = false,
        CancellationToken cancellationToken = default)
    {
        var query = db.Usuarios
            .AsNoTracking()
            .Include(usuario => usuario.Rol)
            .Include(usuario => usuario.Facultad)
            .AsQueryable();

        if (!incluirInactivos)
        {
            query = query.Where(usuario => usuario.EstadoCuenta == EstadoCuenta.Activo);
        }

        var usuarios = await query
            .OrderBy(usuario => usuario.IdUsuario)
            .ToListAsync(cancellationToken);

        return Ok(usuarios.Select(ConvertirRespuesta).ToList());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UsuarioResponse>> ObtenerPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var usuario = await db.Usuarios
            .AsNoTracking()
            .Include(entity => entity.Rol)
            .Include(entity => entity.Facultad)
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);

        return usuario is null
            ? NotFound()
            : Ok(ConvertirRespuesta(usuario));
    }

    [HttpPost]
    [ProducesResponseType(typeof(UsuarioResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UsuarioResponse>> Crear(
        CrearUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var validacion = await ValidarRelacionesAsync(
            request.IdRol,
            request.IdFacultad,
            cancellationToken);
        if (validacion is not null)
        {
            return validacion;
        }

        var correo = request.Correo.Trim();
        if (await db.Usuarios.AnyAsync(
                usuario => usuario.Correo == correo,
                cancellationToken))
        {
            return Conflict(new ProblemDetails
            {
                Title = "El correo ya está registrado.",
                Status = StatusCodes.Status409Conflict
            });
        }

        var usuario = new Usuario
        {
            IdRol = request.IdRol,
            IdFacultad = request.IdFacultad,
            NombreUsuario = request.Usuario.Trim(),
            NombreCompleto = request.NombreCompleto.Trim(),
            GradoAcademico = request.GradoAcademico.Trim(),
            ExperienciaEducacionSuperior = request.ExperienciaEducacionSuperior,
            Correo = correo,
            EstadoCuenta = EstadoCuenta.Activo,
            FechaRegistro = DateTime.UtcNow
        };
        usuario.Password = passwordHasher.HashPassword(usuario, request.Password);

        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync(cancellationToken);

        await CargarRelacionesAsync(usuario, cancellationToken);
        var respuesta = ConvertirRespuesta(usuario);

        return CreatedAtAction(
            nameof(ObtenerPorId),
            new { id = usuario.IdUsuario },
            respuesta);
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
        var usuario = await db.Usuarios
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);
        if (usuario is null)
        {
            return NotFound();
        }

        var validacion = await ValidarRelacionesAsync(
            request.IdRol,
            request.IdFacultad,
            cancellationToken);
        if (validacion is not null)
        {
            return validacion;
        }

        var correo = request.Correo.Trim();
        if (await db.Usuarios.AnyAsync(
                entity => entity.IdUsuario != id && entity.Correo == correo,
                cancellationToken))
        {
            return Conflict(new ProblemDetails
            {
                Title = "El correo ya está registrado por otro usuario.",
                Status = StatusCodes.Status409Conflict
            });
        }

        usuario.IdRol = request.IdRol;
        usuario.IdFacultad = request.IdFacultad;
        usuario.NombreUsuario = request.Usuario.Trim();
        usuario.NombreCompleto = request.NombreCompleto.Trim();
        usuario.GradoAcademico = request.GradoAcademico.Trim();
        usuario.ExperienciaEducacionSuperior = request.ExperienciaEducacionSuperior;
        usuario.Correo = correo;

        if (request.Password is not null)
        {
            usuario.Password = passwordHasher.HashPassword(usuario, request.Password);
        }

        await db.SaveChangesAsync(cancellationToken);
        await CargarRelacionesAsync(usuario, cancellationToken);

        return Ok(ConvertirRespuesta(usuario));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Desactivar(
        int id,
        CancellationToken cancellationToken)
    {
        var usuario = await db.Usuarios
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);
        if (usuario is null)
        {
            return NotFound();
        }

        usuario.EstadoCuenta = EstadoCuenta.Inactivo;
        var tokens = await db.TokensAutenticacion
            .Where(token => token.IdUsuario == id)
            .ToListAsync(cancellationToken);
        foreach (var token in tokens)
        {
            token.Consumido = true;
        }

        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    [HttpPut("{id:int}/activar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Activar(
        int id,
        CancellationToken cancellationToken)
    {
        var usuario = await db.Usuarios
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);
        if (usuario is null)
        {
            return NotFound();
        }

        usuario.EstadoCuenta = EstadoCuenta.Activo;
        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private async Task<BadRequestObjectResult?> ValidarRelacionesAsync(
        int idRol,
        int? idFacultad,
        CancellationToken cancellationToken)
    {
        if (!await db.Roles.AnyAsync(rol => rol.IdRol == idRol, cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "El rol indicado no existe.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (idFacultad.HasValue
            && !await db.Facultades.AnyAsync(
                facultad => facultad.IdFacultad == idFacultad.Value,
                cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "La facultad indicada no existe.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        return null;
    }

    private async Task CargarRelacionesAsync(
        Usuario usuario,
        CancellationToken cancellationToken)
    {
        await db.Entry(usuario).Reference(entity => entity.Rol).LoadAsync(cancellationToken);
        if (usuario.IdFacultad.HasValue)
        {
            await db.Entry(usuario).Reference(entity => entity.Facultad).LoadAsync(cancellationToken);
        }
    }

    private static UsuarioResponse ConvertirRespuesta(Usuario usuario) =>
        new(
            usuario.IdUsuario,
            usuario.IdRol,
            usuario.Rol?.NombreRol,
            usuario.IdFacultad,
            usuario.Facultad?.NombreFacultad,
            usuario.NombreUsuario,
            usuario.NombreCompleto,
            usuario.GradoAcademico,
            usuario.ExperienciaEducacionSuperior,
            usuario.Correo,
            usuario.EstadoCuenta == EstadoCuenta.Activo ? "activo" : "inactivo",
            usuario.FechaRegistro,
            usuario.UltimoAcceso);
}
