using System.Security.Claims;
using GestionCurricular.Api.Contracts;
using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/asignaciones")]
public sealed class AsignacionesController(GestionCurricularDbContext db) : ControllerBase
{
    [HttpGet("opciones")]
    [ProducesResponseType(typeof(AsignacionesOpcionesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AsignacionesOpcionesResponse>> ObtenerOpciones(
        CancellationToken cancellationToken)
    {
        var actor = await ObtenerActorAsync(cancellationToken);
        if (actor is null) return Unauthorized();
        var esSuperUsuario = EsRol(actor, "SUPER_USUARIO");
        var esAdministrador = EsRol(actor, "ADMINISTRADOR");
        if (!esSuperUsuario && !esAdministrador) return Forbid();
        if (esAdministrador && (actor.IdFacultad is null
            || actor.Facultad?.EstadoRegistro != EstadoRegistro.Activo))
        {
            return Forbid();
        }

        var facultadFiltro = esAdministrador ? actor.IdFacultad : null;
        var facultades = await db.Facultades.AsNoTracking()
            .Where(facultad => facultad.EstadoRegistro == EstadoRegistro.Activo
                && (!facultadFiltro.HasValue || facultad.IdFacultad == facultadFiltro.Value))
            .OrderBy(facultad => facultad.NombreFacultad)
            .Select(facultad => new FacultadAsignacionOpcionResponse(
                facultad.IdFacultad,
                facultad.NombreFacultad))
            .ToListAsync(cancellationToken);

        var usuarios = await db.Usuarios.AsNoTracking()
            .Include(usuario => usuario.Rol)
            .Include(usuario => usuario.Facultad)
            .Where(usuario => usuario.EstadoCuenta == EstadoCuenta.Activo
                && usuario.Rol.NombreRol == "USUARIO"
                && usuario.IdFacultad.HasValue
                && usuario.Facultad!.EstadoRegistro == EstadoRegistro.Activo
                && (!facultadFiltro.HasValue || usuario.IdFacultad == facultadFiltro.Value))
            .OrderBy(usuario => usuario.NombreCompleto)
            .Select(usuario => new UsuarioAsignacionOpcionResponse(
                usuario.IdUsuario,
                usuario.NombreCompleto,
                usuario.Correo,
                usuario.IdFacultad!.Value,
                usuario.Facultad!.NombreFacultad))
            .ToListAsync(cancellationToken);

        var planes = await db.PlanesEstudio.AsNoTracking()
            .Where(plan => (plan.EstadoPlan == null || plan.EstadoPlan != EstadoPlanEstudio.Desactivado)
                && plan.Carrera.EstadoRegistro == EstadoRegistro.Activo
                && plan.Carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                && plan.Carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo
                && (!facultadFiltro.HasValue || plan.Carrera.IdFacultad == facultadFiltro.Value))
            .OrderBy(plan => plan.Carrera.NombreCarrera)
            .ThenBy(plan => plan.CicloInicio)
            .Select(plan => new PlanAsignacionOpcionResponse(
                plan.IdPlan,
                plan.CicloInicio,
                plan.CicloFin,
                plan.Carrera.NombreCarrera,
                plan.Carrera.IdFacultad,
                plan.Carrera.Facultad.NombreFacultad))
            .ToListAsync(cancellationToken);

        var relacionesAsignatura = await db.AsignaturasCarrera.AsNoTracking()
            .Where(relacion => relacion.Asignatura.EstadoAsignatura == EstadoAsignatura.Activo
                && relacion.Carrera.EstadoRegistro == EstadoRegistro.Activo
                && relacion.Carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                && relacion.Carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo
                && (!facultadFiltro.HasValue || relacion.Carrera.IdFacultad == facultadFiltro.Value))
            .OrderBy(relacion => relacion.Asignatura.NombreAsignatura)
            .Select(relacion => new AsignaturaAsignacionOpcionResponse(
                relacion.IdAsignatura,
                relacion.Asignatura.CodigoAsignatura,
                relacion.Asignatura.NombreAsignatura,
                relacion.Carrera.IdFacultad,
                relacion.Carrera.Facultad.NombreFacultad))
            .ToListAsync(cancellationToken);
        var asignaturas = relacionesAsignatura
            .DistinctBy(asignatura => asignatura.IdAsignatura)
            .ToList();

        return Ok(new AsignacionesOpcionesResponse(facultades, usuarios, planes, asignaturas));
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Crear(
        CrearAsignacionesRequest request,
        CancellationToken cancellationToken)
    {
        var actor = await ObtenerActorAsync(cancellationToken);
        if (actor is null) return Unauthorized();

        var esSuperUsuario = EsRol(actor, "SUPER_USUARIO");
        var esAdministrador = EsRol(actor, "ADMINISTRADOR");
        if (!esSuperUsuario && !esAdministrador) return Forbid();
        if (esAdministrador && (actor.IdFacultad is null
            || actor.Facultad?.EstadoRegistro != EstadoRegistro.Activo))
        {
            return Forbid();
        }

        var idsUsuarios = request.IdsUsuarios.Distinct().ToArray();
        var idsPlanes = request.IdsPlanes.Distinct().ToArray();
        var idsAsignaturas = request.IdsAsignaturas.Distinct().ToArray();
        if (idsUsuarios.Length == 0 || (idsPlanes.Length == 0 && idsAsignaturas.Length == 0))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Selecciona usuarios y al menos un plan o una asignatura.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var usuarios = await db.Usuarios.AsNoTracking()
            .Include(usuario => usuario.Rol)
            .Include(usuario => usuario.Facultad)
            .Where(usuario => idsUsuarios.Contains(usuario.IdUsuario))
            .ToListAsync(cancellationToken);
        if (usuarios.Count != idsUsuarios.Length
            || usuarios.Any(usuario =>
                usuario.EstadoCuenta != EstadoCuenta.Activo
                || !EsRol(usuario, "USUARIO")
                || !usuario.IdFacultad.HasValue
                || usuario.Facultad?.EstadoRegistro != EstadoRegistro.Activo
                || (esAdministrador && usuario.IdFacultad != actor.IdFacultad)))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Uno o más destinatarios no son usuarios estándar activos de la facultad permitida.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (idsPlanes.Length > 0)
        {
            var planesValidos = await db.PlanesEstudio.AsNoTracking()
                .Where(plan => idsPlanes.Contains(plan.IdPlan)
                    && (plan.EstadoPlan == null || plan.EstadoPlan != EstadoPlanEstudio.Desactivado)
                    && plan.Carrera.EstadoRegistro == EstadoRegistro.Activo
                    && plan.Carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                    && plan.Carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo
                    && (!esAdministrador || plan.Carrera.IdFacultad == actor.IdFacultad))
                .Select(plan => plan.IdPlan)
                .ToListAsync(cancellationToken);
            if (planesValidos.Count != idsPlanes.Length)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Uno o más planes no existen, están inactivos o pertenecen a otra facultad.",
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        if (idsAsignaturas.Length > 0)
        {
            var asignaturasValidas = await db.Asignaturas.AsNoTracking()
                .Where(asignatura => idsAsignaturas.Contains(asignatura.IdAsignatura)
                    && asignatura.EstadoAsignatura == EstadoAsignatura.Activo
                    && asignatura.Carreras.Any(relacion =>
                        relacion.Carrera.EstadoRegistro == EstadoRegistro.Activo
                        && relacion.Carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                        && relacion.Carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo
                        && (!esAdministrador || relacion.Carrera.IdFacultad == actor.IdFacultad)))
                .Select(asignatura => asignatura.IdAsignatura)
                .ToListAsync(cancellationToken);
            if (asignaturasValidas.Count != idsAsignaturas.Length)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Una o más asignaturas no existen, están inactivas o pertenecen a otra facultad.",
                    Status = StatusCodes.Status400BadRequest
                });
            }
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        if (idsPlanes.Length > 0)
        {
            var existentes = await db.UsuariosParticipantesPlan
                .Where(relacion => idsUsuarios.Contains(relacion.IdUsuario)
                    && idsPlanes.Contains(relacion.IdPlan))
                .Select(relacion => new { relacion.IdUsuario, relacion.IdPlan })
                .ToListAsync(cancellationToken);
            var paresExistentes = existentes
                .Select(relacion => (relacion.IdUsuario, relacion.IdPlan))
                .ToHashSet();
            foreach (var idUsuario in idsUsuarios)
            foreach (var idPlan in idsPlanes)
            {
                if (!paresExistentes.Contains((idUsuario, idPlan)))
                {
                    db.UsuariosParticipantesPlan.Add(new UsuarioParticipantePlan
                    {
                        IdUsuario = idUsuario,
                        IdPlan = idPlan
                    });
                }
            }
        }

        if (idsAsignaturas.Length > 0)
        {
            var existentes = await db.UsuariosParticipantesAsignatura
                .Where(relacion => idsUsuarios.Contains(relacion.IdUsuario)
                    && idsAsignaturas.Contains(relacion.IdAsignatura))
                .Select(relacion => new { relacion.IdUsuario, relacion.IdAsignatura })
                .ToListAsync(cancellationToken);
            var paresExistentes = existentes
                .Select(relacion => (relacion.IdUsuario, relacion.IdAsignatura))
                .ToHashSet();
            foreach (var idUsuario in idsUsuarios)
            foreach (var idAsignatura in idsAsignaturas)
            {
                if (!paresExistentes.Contains((idUsuario, idAsignatura)))
                {
                    db.UsuariosParticipantesAsignatura.Add(new UsuarioParticipanteAsignatura
                    {
                        IdUsuario = idUsuario,
                        IdAsignatura = idAsignatura
                    });
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return NoContent();
    }

    private static bool EsRol(Usuario usuario, string nombreRol) =>
        string.Equals(usuario.Rol.NombreRol, nombreRol, StringComparison.OrdinalIgnoreCase);

    private async Task<Usuario?> ObtenerActorAsync(CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var idUsuario))
        {
            return null;
        }

        return await db.Usuarios.AsNoTracking()
            .Include(usuario => usuario.Rol)
            .Include(usuario => usuario.Facultad)
            .FirstOrDefaultAsync(usuario =>
                usuario.IdUsuario == idUsuario
                && usuario.EstadoCuenta == EstadoCuenta.Activo,
                cancellationToken);
    }
}
