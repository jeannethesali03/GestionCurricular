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
[Route("api/planes-estudio/{idPlan:int}/asignaturas")]
public sealed class PlanAsignaturasController(GestionCurricularDbContext db) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(AsignaturasDePlanResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AsignaturasDePlanResponse>> ObtenerAsignaturas(
        int idPlan,
        CancellationToken cancellationToken)
    {
        var (actor, plan) = await ObtenerContextoAsync(idPlan, cancellationToken);
        if (actor is null) return Unauthorized();
        if (plan is null) return NotFound();
        if (!await PuedeAccederAsync(actor, plan, cancellationToken)) return Forbid();

        var relaciones = await db.PlanesAsignaturas.AsNoTracking()
            .Include(relacion => relacion.Asignatura).ThenInclude(asignatura => asignatura.Objetivos)
            .Include(relacion => relacion.Asignatura).ThenInclude(asignatura => asignatura.UnidadesDidacticas)
            .Include(relacion => relacion.Asignatura).ThenInclude(asignatura => asignatura.ReferenciasBibliograficas)
            .Include(relacion => relacion.Asignatura).ThenInclude(asignatura => asignatura.FuentesElectronicas)
            .Where(relacion => relacion.IdPlan == idPlan)
            .OrderBy(relacion => relacion.NumeroCiclo)
            .ThenBy(relacion => relacion.NumeroOrden)
            .ToListAsync(cancellationToken);
        var asignaturas = relaciones.Select(relacion => new PlanAsignaturaResponse(
                relacion.IdAsignatura,
                relacion.Asignatura.CodigoAsignatura,
                relacion.Asignatura.NombreAsignatura,
                relacion.Asignatura.AreaFormacion,
                relacion.Asignatura.UnidadesValorativas,
                relacion.NumeroCiclo,
                relacion.NumeroOrden,
                SeccionesCompletas(relacion.Asignatura),
                7))
            .ToArray();
        var opciones = await db.AsignaturasCarrera.AsNoTracking()
            .Where(relacion => relacion.IdCarrera == plan.IdCarrera
                && relacion.Asignatura.EstadoAsignatura == EstadoAsignatura.Activo
                && !db.PlanesAsignaturas.Any(planAsignatura =>
                    planAsignatura.IdPlan == idPlan
                    && planAsignatura.IdAsignatura == relacion.IdAsignatura))
            .OrderBy(relacion => relacion.Asignatura.CodigoAsignatura)
            .Select(relacion => new AsignaturaPlanOpcionResponse(
                relacion.IdAsignatura,
                relacion.Asignatura.CodigoAsignatura,
                relacion.Asignatura.NombreAsignatura,
                relacion.Asignatura.AreaFormacion,
                relacion.Asignatura.UnidadesValorativas))
            .Distinct()
            .ToListAsync(cancellationToken);

        return Ok(new AsignaturasDePlanResponse(
            plan.IdPlan,
            plan.IdCarrera,
            plan.Carrera.NombreCarrera,
            plan.CicloInicio,
            plan.CicloFin,
            opciones,
            asignaturas));
    }

    [HttpPut("{idAsignatura:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> VincularAsignatura(
        int idPlan,
        int idAsignatura,
        ActualizarPlanAsignaturaRequest request,
        CancellationToken cancellationToken)
    {
        var (actor, plan) = await ObtenerContextoAsync(idPlan, cancellationToken);
        if (actor is null) return Unauthorized();
        if (plan is null) return NotFound();
        if (!await PuedeAccederAsync(actor, plan, cancellationToken)) return Forbid();
        if (plan.EstadoPlan == EstadoPlanEstudio.Desactivado)
        {
            return Conflict(new ProblemDetails
            {
                Title = "No se puede modificar un plan desactivado.",
                Status = StatusCodes.Status409Conflict
            });
        }

        var asignaturaValida = await db.AsignaturasCarrera.AnyAsync(relacion =>
            relacion.IdAsignatura == idAsignatura
            && relacion.IdCarrera == plan.IdCarrera
            && relacion.Asignatura.EstadoAsignatura == EstadoAsignatura.Activo,
            cancellationToken);
        if (!asignaturaValida)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "La asignatura no está activa o no pertenece a la carrera de este plan.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var relacion = await db.PlanesAsignaturas.FirstOrDefaultAsync(item =>
            item.IdPlan == idPlan && item.IdAsignatura == idAsignatura,
            cancellationToken);
        if (relacion is null)
        {
            db.PlanesAsignaturas.Add(new PlanAsignatura
            {
                IdPlan = idPlan,
                IdAsignatura = idAsignatura,
                NumeroCiclo = request.NumeroCiclo,
                NumeroOrden = request.NumeroOrden
            });
        }
        else
        {
            relacion.NumeroCiclo = request.NumeroCiclo;
            relacion.NumeroOrden = request.NumeroOrden;
        }

        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{idAsignatura:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DesvincularAsignatura(
        int idPlan,
        int idAsignatura,
        CancellationToken cancellationToken)
    {
        var (actor, plan) = await ObtenerContextoAsync(idPlan, cancellationToken);
        if (actor is null) return Unauthorized();
        if (plan is null) return NotFound();
        if (!await PuedeAccederAsync(actor, plan, cancellationToken)) return Forbid();
        if (plan.EstadoPlan == EstadoPlanEstudio.Desactivado)
        {
            return Conflict(new ProblemDetails
            {
                Title = "No se puede modificar un plan desactivado.",
                Status = StatusCodes.Status409Conflict
            });
        }

        var relacion = await db.PlanesAsignaturas.FirstOrDefaultAsync(item =>
            item.IdPlan == idPlan && item.IdAsignatura == idAsignatura,
            cancellationToken);
        if (relacion is not null)
        {
            db.PlanesAsignaturas.Remove(relacion);
            await db.SaveChangesAsync(cancellationToken);
        }

        return NoContent();
    }

    private async Task<(Usuario? Actor, PlanEstudio? Plan)> ObtenerContextoAsync(
        int idPlan,
        CancellationToken cancellationToken)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var idUsuario))
        {
            return (null, null);
        }

        var actor = await db.Usuarios.AsNoTracking()
            .Include(usuario => usuario.Rol)
            .FirstOrDefaultAsync(usuario =>
                usuario.IdUsuario == idUsuario
                && usuario.EstadoCuenta == EstadoCuenta.Activo,
                cancellationToken);
        var plan = await db.PlanesEstudio.AsNoTracking()
            .Include(item => item.Carrera)
            .FirstOrDefaultAsync(item => item.IdPlan == idPlan, cancellationToken);
        return (actor, plan);
    }

    private async Task<bool> PuedeAccederAsync(
        Usuario actor,
        PlanEstudio plan,
        CancellationToken cancellationToken)
    {
        if (string.Equals(actor.Rol.NombreRol, "SUPER_USUARIO", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (string.Equals(actor.Rol.NombreRol, "ADMINISTRADOR", StringComparison.OrdinalIgnoreCase))
        {
            return actor.IdFacultad == plan.Carrera.IdFacultad;
        }

        return (string.Equals(actor.Rol.NombreRol, "USUARIO", StringComparison.OrdinalIgnoreCase)
                || string.Equals(actor.Rol.NombreRol, "USUARIO_ESTANDAR", StringComparison.OrdinalIgnoreCase))
            && await db.UsuariosParticipantesPlan.AnyAsync(relacion =>
                relacion.IdPlan == plan.IdPlan
                && relacion.IdUsuario == actor.IdUsuario,
                cancellationToken);
    }

    private static int SeccionesCompletas(Asignatura asignatura) =>
        1
        + (string.IsNullOrWhiteSpace(asignatura.DescripcionAsignatura) ? 0 : 1)
        + (asignatura.Objetivos.Any(item => item.TipoObjetivo == TipoObjetivo.General)
            && asignatura.Objetivos.Any(item => item.TipoObjetivo == TipoObjetivo.Especifico) ? 1 : 0)
        + (asignatura.UnidadesDidacticas.Count > 0 ? 1 : 0)
        + (string.IsNullOrWhiteSpace(asignatura.EstrategiaMetodologica) ? 0 : 1)
        + (string.IsNullOrWhiteSpace(asignatura.Evaluacion) ? 0 : 1)
        + (asignatura.ReferenciasBibliograficas.Count > 0
            && asignatura.FuentesElectronicas.Count > 0 ? 1 : 0);
}
