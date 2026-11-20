using GestionCurricular.Api.Contracts;
using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Api.Controllers;

public sealed partial class AsignaturasController
{
    [HttpPut("{id:int}/generalidades")]
    public async Task<IActionResult> ActualizarGeneralidades(
        int id,
        ActualizarGeneralidadesAsignaturaRequest request,
        CancellationToken cancellationToken)
    {
        var error = await ValidarEdicionAsync(id, cancellationToken);
        if (error is not null) return error;
        var usuario = await ObtenerUsuarioActualAsync(cancellationToken);
        if (usuario is null) return Unauthorized();

        var asignatura = await db.Asignaturas
            .Include(item => item.ComoAsignatura)
            .Include(item => item.PrerrequisitosNoAsignatura)
            .FirstAsync(item => item.IdAsignatura == id, cancellationToken);

        if (!AreaFormacionValida(request.AreaFormacion))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "El área de formación debe ser Humanísticas, Básicas o Técnica.",
                Status = StatusCodes.Status400BadRequest
            });
        }
        if (request.IdPrerrequisitoAsignatura.HasValue
            && !string.IsNullOrWhiteSpace(request.PrerrequisitoNoAsignatura))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Selecciona un prerrequisito de asignatura o uno no asignatura, no ambos.",
                Status = StatusCodes.Status400BadRequest
            });
        }
        if (request.IdPrerrequisitoAsignatura == id
            || (request.IdPrerrequisitoAsignatura.HasValue
                && (!await db.Asignaturas.AnyAsync(item =>
                    item.IdAsignatura == request.IdPrerrequisitoAsignatura
                    && item.EstadoAsignatura == EstadoAsignatura.Activo,
                    cancellationToken)
                    || !await PuedeVerAsync(
                        usuario,
                        request.IdPrerrequisitoAsignatura.Value,
                        cancellationToken))))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "El prerrequisito seleccionado no existe o no es válido.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        if (await db.Asignaturas.AnyAsync(item =>
                item.CodigoAsignatura == request.CodigoAsignatura.Trim()
                && item.IdAsignatura != id,
                cancellationToken))
        {
            return Conflict(new ProblemDetails
            {
                Title = "El código ya está asignado a otra asignatura.",
                Status = StatusCodes.Status409Conflict
            });
        }

        asignatura.NombreAsignatura = request.NombreAsignatura.Trim();
        asignatura.CodigoAsignatura = request.CodigoAsignatura.Trim();
        asignatura.AreaFormacion = request.AreaFormacion.Trim();
        asignatura.HorasCiclo = request.HorasCiclo;
        asignatura.HorasSemana = request.HorasSemana;
        asignatura.HorasPracticas = request.HorasPracticas;
        asignatura.DuracionCicloSemana = request.DuracionCicloSemana;
        asignatura.DuracionHoraClase = request.DuracionHoraClase;
        asignatura.UnidadesValorativas = request.UnidadesValorativas;
        asignatura.Modalidad = request.Modalidad switch
        {
            "presencial" => ModalidadAsignatura.Presencial,
            "semipresencial" => ModalidadAsignatura.Semipresencial,
            "nopresencial" => ModalidadAsignatura.Nopresencial,
            _ => throw new InvalidOperationException("La modalidad de asignatura no es válida.")
        };

        var prerrequisitoActual = request.IdPrerrequisitoAsignatura.HasValue
            ? asignatura.ComoAsignatura.FirstOrDefault(item =>
                item.IdPrerrequisitoAsignatura == request.IdPrerrequisitoAsignatura.Value)
            : null;
        db.PrerrequisitosAsignatura.RemoveRange(
            asignatura.ComoAsignatura.Where(item => item != prerrequisitoActual));
        if (request.IdPrerrequisitoAsignatura.HasValue && prerrequisitoActual is null)
        {
            asignatura.ComoAsignatura.Add(new PrerrequisitoAsignatura
            {
                IdAsignatura = id,
                IdPrerrequisitoAsignatura = request.IdPrerrequisitoAsignatura.Value
            });
        }

        db.PrerrequisitosNoAsignatura.RemoveRange(asignatura.PrerrequisitosNoAsignatura);
        if (!string.IsNullOrWhiteSpace(request.PrerrequisitoNoAsignatura))
        {
            asignatura.PrerrequisitosNoAsignatura.Add(new PrerrequisitoNoAsignatura
            {
                IdAsignatura = id,
                Nombre = request.PrerrequisitoNoAsignatura.Trim()
            });
        }

        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:int}/descripcion")]
    public Task<IActionResult> ActualizarDescripcion(
        int id,
        ActualizarDescripcionAsignaturaRequest request,
        CancellationToken cancellationToken) =>
        ActualizarCampoTextoAsync(
            id, request.DescripcionAsignatura, "descripcion", cancellationToken);

    [HttpPut("{id:int}/estrategia")]
    public Task<IActionResult> ActualizarEstrategia(
        int id,
        ActualizarTextoAsignaturaRequest request,
        CancellationToken cancellationToken) =>
        ActualizarCampoTextoAsync(
            id, request.Texto, "estrategia", cancellationToken);

    [HttpPut("{id:int}/evaluacion")]
    public Task<IActionResult> ActualizarEvaluacion(
        int id,
        ActualizarTextoAsignaturaRequest request,
        CancellationToken cancellationToken) =>
        ActualizarCampoTextoAsync(
            id, request.Texto, "evaluacion", cancellationToken);

    [HttpPut("{id:int}/objetivos")]
    public async Task<IActionResult> ActualizarObjetivos(
        int id,
        ObjetivosAsignaturaRequest request,
        CancellationToken cancellationToken)
    {
        var error = await ValidarEdicionAsync(id, cancellationToken);
        if (error is not null) return error;
        if (string.IsNullOrWhiteSpace(request.ObjetivoGeneral)
            || request.ObjetivosEspecificos.Count == 0
            || request.ObjetivosEspecificos.Any(string.IsNullOrWhiteSpace))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Registra el objetivo general y al menos un objetivo específico no vacío.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var actuales = await db.ObjetivosAsignatura
            .Where(item => item.IdAsignatura == id)
            .ToListAsync(cancellationToken);
        db.ObjetivosAsignatura.RemoveRange(actuales);
        db.ObjetivosAsignatura.Add(new ObjetivoAsignatura
        {
            IdAsignatura = id,
            TipoObjetivo = TipoObjetivo.General,
            DescripcionObjetivo = request.ObjetivoGeneral.Trim()
        });
        foreach (var objetivo in request.ObjetivosEspecificos)
        {
            db.ObjetivosAsignatura.Add(new ObjetivoAsignatura
            {
                IdAsignatura = id,
                TipoObjetivo = TipoObjetivo.Especifico,
                DescripcionObjetivo = objetivo.Trim()
            });
        }

        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:int}/unidades")]
    public async Task<IActionResult> ActualizarUnidades(
        int id,
        UnidadesAsignaturaRequest request,
        CancellationToken cancellationToken)
    {
        var error = await ValidarEdicionAsync(id, cancellationToken);
        if (error is not null) return error;
        if (request.Unidades.Count == 0
            || request.Unidades.Any(unidad =>
                string.IsNullOrWhiteSpace(unidad.Nombre)
                || string.IsNullOrWhiteSpace(unidad.Objetivo)
                || unidad.Contenidos.Count == 0
                || unidad.Contenidos.Any(contenido =>
                    string.IsNullOrWhiteSpace(contenido.Nombre)
                    || contenido.Nombre.Trim().Length > 100)))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Cada unidad debe tener nombre, objetivo y al menos un contenido válido.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var unidadesActuales = await db.UnidadesDidacticas
            .Where(item => item.IdAsignatura == id)
            .Include(item => item.Contenidos)
            .ToListAsync(cancellationToken);
        db.Contenidos.RemoveRange(unidadesActuales.SelectMany(item => item.Contenidos));
        db.UnidadesDidacticas.RemoveRange(unidadesActuales);

        foreach (var unidad in request.Unidades)
        {
            db.UnidadesDidacticas.Add(new UnidadDidactica
            {
                IdAsignatura = id,
                Nombre = unidad.Nombre.Trim(),
                Objetivo = unidad.Objetivo.Trim(),
                Contenidos = unidad.Contenidos.Select(contenido => new Contenido
                {
                    Nombre = contenido.Nombre.Trim(),
                    Descripcion = contenido.Descripcion?.Trim()
                }).ToList()
            });
        }

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:int}/referencias")]
    public async Task<IActionResult> ActualizarReferencias(
        int id,
        ReferenciasAsignaturaRequest request,
        CancellationToken cancellationToken)
    {
        var error = await ValidarEdicionAsync(id, cancellationToken);
        if (error is not null) return error;
        if (request.ReferenciasBibliograficas.Count == 0
            || request.FuentesElectronicas.Count == 0
            || request.ReferenciasBibliograficas.Any(string.IsNullOrWhiteSpace)
            || request.FuentesElectronicas.Any(string.IsNullOrWhiteSpace))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Conserva al menos una referencia y una fuente electrónica, ambas con contenido.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var referenciasActuales = await db.ReferenciasBibliograficasAsignatura
            .Where(item => item.IdAsignatura == id)
            .ToListAsync(cancellationToken);
        var fuentesActuales = await db.FuentesElectronicasAsignatura
            .Where(item => item.IdAsignatura == id)
            .ToListAsync(cancellationToken);
        db.ReferenciasBibliograficasAsignatura.RemoveRange(referenciasActuales);
        db.FuentesElectronicasAsignatura.RemoveRange(fuentesActuales);
        db.ReferenciasBibliograficasAsignatura.AddRange(request.ReferenciasBibliograficas
            .Select(referencia => new ReferenciaBibliograficaAsignatura
            {
                IdAsignatura = id,
                Referencia = referencia.Trim()
            }));
        db.FuentesElectronicasAsignatura.AddRange(request.FuentesElectronicas
            .Select(fuente => new FuenteElectronicaAsignatura
            {
                IdAsignatura = id,
                Referencia = fuente.Trim()
            }));

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return NoContent();
    }

    private async Task<IActionResult?> ValidarEdicionAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var usuario = await ObtenerUsuarioActualAsync(cancellationToken);
        if (usuario is null) return Unauthorized();
        if (!await PuedeEditarAsync(usuario, id, cancellationToken)) return Forbid();

        var activa = await db.Asignaturas.AnyAsync(item =>
            item.IdAsignatura == id && item.EstadoAsignatura == EstadoAsignatura.Activo,
            cancellationToken);
        if (!activa)
        {
            return Conflict(new ProblemDetails
            {
                Title = "No se puede editar una asignatura desactivada. Actívela primero.",
                Status = StatusCodes.Status409Conflict
            });
        }

        return null;
    }

    private async Task<IActionResult> ActualizarCampoTextoAsync(
        int id,
        string? texto,
        string campo,
        CancellationToken cancellationToken)
    {
        var error = await ValidarEdicionAsync(id, cancellationToken);
        if (error is not null) return error;

        var asignatura = await db.Asignaturas
            .FirstAsync(item => item.IdAsignatura == id, cancellationToken);
        switch (campo)
        {
            case "descripcion":
                asignatura.DescripcionAsignatura = texto;
                break;
            case "estrategia":
                asignatura.EstrategiaMetodologica = texto;
                break;
            case "evaluacion":
                asignatura.Evaluacion = texto;
                break;
            default:
                throw new InvalidOperationException("Campo de asignatura no reconocido.");
        }

        await db.SaveChangesAsync(cancellationToken);
        return new NoContentResult();
    }

    private static bool EsSuperUsuario(Usuario usuario) =>
        string.Equals(usuario.Rol.NombreRol, "SUPER_USUARIO", StringComparison.OrdinalIgnoreCase);

    private static bool EsAdministrador(Usuario usuario) =>
        string.Equals(usuario.Rol.NombreRol, "ADMINISTRADOR", StringComparison.OrdinalIgnoreCase);

    private static bool EsUsuarioEstandar(Usuario usuario) =>
        string.Equals(usuario.Rol.NombreRol, "USUARIO", StringComparison.OrdinalIgnoreCase)
        || string.Equals(usuario.Rol.NombreRol, "USUARIO_ESTANDAR", StringComparison.OrdinalIgnoreCase);

    private IQueryable<Asignatura> AplicarAlcance(IQueryable<Asignatura> query, Usuario usuario)
    {
        if (EsSuperUsuario(usuario)) return query;
        if (EsAdministrador(usuario))
        {
            return usuario.IdFacultad.HasValue
                ? query.Where(asignatura => asignatura.Carreras.Any(relacion =>
                    relacion.Carrera.IdFacultad == usuario.IdFacultad.Value))
                : query.Where(_ => false);
        }

        if (!EsUsuarioEstandar(usuario)) return query.Where(_ => false);
        return query.Where(asignatura =>
            asignatura.UsuariosParticipantes.Any(relacion => relacion.IdUsuario == usuario.IdUsuario)
            || db.PlanesAsignaturas.Any(planAsignatura =>
                planAsignatura.IdAsignatura == asignatura.IdAsignatura
                && db.UsuariosParticipantesPlan.Any(participacion =>
                    participacion.IdUsuario == usuario.IdUsuario
                    && participacion.IdPlan == planAsignatura.IdPlan
                    && (participacion.PlanEstudio.EstadoPlan == null
                        || participacion.PlanEstudio.EstadoPlan != EstadoPlanEstudio.Desactivado)
                    && participacion.PlanEstudio.Carrera.EstadoRegistro == EstadoRegistro.Activo
                    && participacion.PlanEstudio.Carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                    && participacion.PlanEstudio.Carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo)));
    }

    private async Task<bool> PuedeVerAsync(
        Usuario usuario,
        int idAsignatura,
        CancellationToken cancellationToken)
    {
        if (EsSuperUsuario(usuario))
        {
            return await db.Asignaturas.AnyAsync(item => item.IdAsignatura == idAsignatura, cancellationToken);
        }

        if (EsAdministrador(usuario))
        {
            return usuario.IdFacultad.HasValue && await db.AsignaturasCarrera.AnyAsync(relacion =>
                relacion.IdAsignatura == idAsignatura
                && relacion.Carrera.IdFacultad == usuario.IdFacultad.Value,
                cancellationToken);
        }

        if (!EsUsuarioEstandar(usuario)) return false;
        var asignaturaActiva = await db.Asignaturas.AnyAsync(item =>
            item.IdAsignatura == idAsignatura && item.EstadoAsignatura == EstadoAsignatura.Activo,
            cancellationToken);
        return asignaturaActiva && await db.Asignaturas.AnyAsync(item =>
            item.IdAsignatura == idAsignatura
            && (item.UsuariosParticipantes.Any(relacion => relacion.IdUsuario == usuario.IdUsuario)
                || db.PlanesAsignaturas.Any(planAsignatura =>
                    planAsignatura.IdAsignatura == item.IdAsignatura
                    && db.UsuariosParticipantesPlan.Any(participacion =>
                        participacion.IdUsuario == usuario.IdUsuario
                        && participacion.IdPlan == planAsignatura.IdPlan
                        && (participacion.PlanEstudio.EstadoPlan == null
                            || participacion.PlanEstudio.EstadoPlan != EstadoPlanEstudio.Desactivado)
                        && participacion.PlanEstudio.Carrera.EstadoRegistro == EstadoRegistro.Activo
                        && participacion.PlanEstudio.Carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                        && participacion.PlanEstudio.Carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo))),
            cancellationToken);
    }

    private async Task<bool> PuedeEditarAsync(
        Usuario usuario,
        int idAsignatura,
        CancellationToken cancellationToken) =>
        await PuedeVerAsync(usuario, idAsignatura, cancellationToken);

    private async Task<bool> CarreraPermitidaAsync(
        Usuario usuario,
        int idCarrera,
        CancellationToken cancellationToken) =>
        await db.Carreras.AnyAsync(carrera =>
            carrera.IdCarrera == idCarrera
            && carrera.EstadoRegistro == EstadoRegistro.Activo
            && carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
            && carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo
            && (EsSuperUsuario(usuario) || carrera.IdFacultad == usuario.IdFacultad),
            cancellationToken);

    private async Task<HashSet<int>> ObtenerIdsAsignadosPorPlanAsync(
        int idUsuario,
        CancellationToken cancellationToken)
    {
        return await db.UsuariosParticipantesPlan.AsNoTracking()
            .Where(relacion => relacion.IdUsuario == idUsuario
                && (relacion.PlanEstudio.EstadoPlan == null
                    || relacion.PlanEstudio.EstadoPlan != EstadoPlanEstudio.Desactivado)
                && relacion.PlanEstudio.Carrera.EstadoRegistro == EstadoRegistro.Activo
                && relacion.PlanEstudio.Carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                && relacion.PlanEstudio.Carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo)
            .SelectMany(relacion => relacion.PlanEstudio.Asignaturas)
            .Select(relacion => relacion.IdAsignatura)
            .Distinct()
            .ToHashSetAsync(cancellationToken);
    }

    private async Task<AsignaturaResponse> ConvertirRespuestaAsync(
        Asignatura asignatura,
        int idUsuario,
        CancellationToken cancellationToken)
    {
        var idsPorPlan = await ObtenerIdsAsignadosPorPlanAsync(idUsuario, cancellationToken);
        var asignadaDirectamente = await db.UsuariosParticipantesAsignatura.AnyAsync(relacion =>
            relacion.IdUsuario == idUsuario && relacion.IdAsignatura == asignatura.IdAsignatura,
            cancellationToken);
        return ConvertirRespuesta(
            asignatura,
            idsPorPlan.Contains(asignatura.IdAsignatura),
            asignadaDirectamente);
    }

    private async Task<AsignaturaResponse> ObtenerRespuestaAsync(
        int id,
        int idUsuario,
        CancellationToken cancellationToken)
    {
        var asignatura = await db.Asignaturas.AsNoTracking()
            .AsSplitQuery()
            .Include(item => item.FuentesElectronicas)
            .Include(item => item.Carreras).ThenInclude(relacion => relacion.Carrera)
                .ThenInclude(carrera => carrera.Facultad).ThenInclude(facultad => facultad.Sede)
            .Include(item => item.UsuariosParticipantes).ThenInclude(relacion => relacion.Usuario)
            .Include(item => item.Objetivos)
            .Include(item => item.UnidadesDidacticas)
            .Include(item => item.ReferenciasBibliograficas)
            .FirstAsync(item => item.IdAsignatura == id, cancellationToken);
        return await ConvertirRespuestaAsync(asignatura, idUsuario, cancellationToken);
    }

    private async Task<IReadOnlyList<object>> ObtenerPlanesAsync(
        int idAsignatura,
        CancellationToken cancellationToken)
    {
        var planes = await db.PlanesAsignaturas.AsNoTracking()
            .Where(relacion => relacion.IdAsignatura == idAsignatura)
            .OrderBy(plan => plan.IdPlan)
            .Select(plan => new
            {
                plan.IdPlan,
                nombreCarrera = plan.PlanEstudio.Carrera.NombreCarrera,
                cicloInicio = plan.PlanEstudio.CicloInicio,
                cicloFin = plan.PlanEstudio.CicloFin,
                estadoPlan = plan.PlanEstudio.EstadoPlan == null ? "borrador" : plan.PlanEstudio.EstadoPlan.ToString(),
                plan.NumeroCiclo,
                plan.NumeroOrden
            })
            .ToListAsync(cancellationToken);
        return planes.Cast<object>().ToArray();
    }
}
