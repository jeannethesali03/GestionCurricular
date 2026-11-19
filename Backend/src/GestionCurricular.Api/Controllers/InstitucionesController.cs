using GestionCurricular.Api.Contracts;
using GestionCurricular.Api.Services;
using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Api.Controllers;

[ApiController]
[Route("api/sedes")]
public sealed class SedesController(
    GestionCurricularDbContext db,
    IDesactivacionesUniversidadService desactivaciones) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SedeResponse>>> ObtenerTodas(
        [FromQuery] bool incluirInactivas = false,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Sede> query = db.Sedes.AsNoTracking()
            .AsSplitQuery()
            .Include(sede => sede.Facultades);
        if (!incluirInactivas)
        {
            query = query.Where(sede => sede.EstadoRegistro == EstadoRegistro.Activo);
        }

        var sedes = await query.OrderBy(sede => sede.IdSede).ToListAsync(cancellationToken);
        return Ok(sedes.Select(ConvertirRespuesta).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SedeResponse>> ObtenerPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var sede = await db.Sedes.AsNoTracking()
            .AsSplitQuery()
            .Include(entity => entity.Facultades)
            .FirstOrDefaultAsync(entity => entity.IdSede == id, cancellationToken);
        return sede is null ? NotFound() : Ok(ConvertirRespuesta(sede));
    }

    [HttpPost]
    public async Task<ActionResult<SedeResponse>> Crear(
        SedeRequest request,
        CancellationToken cancellationToken)
    {
        var sede = new Sede
        {
            NombreSede = request.NombreSede.Trim(),
            Direccion = request.Direccion?.Trim(),
            Telefono = request.Telefono?.Trim(),
            EstadoRegistro = EstadoRegistro.Activo
        };
        db.Sedes.Add(sede);
        await db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(ObtenerPorId),
            new { id = sede.IdSede },
            ConvertirRespuesta(sede));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(
        int id,
        SedeRequest request,
        CancellationToken cancellationToken)
    {
        var sede = await db.Sedes.FindAsync([id], cancellationToken);
        if (sede is null) return NotFound();
        if (sede.EstadoRegistro == EstadoRegistro.Inactivo) return EstadoInactivo("sede");

        sede.NombreSede = request.NombreSede.Trim();
        sede.Direccion = request.Direccion?.Trim();
        sede.Telefono = request.Telefono?.Trim();
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Desactivar(
        int id,
        ConfirmarDesactivacionRequest request,
        CancellationToken cancellationToken)
    {
        await desactivaciones.DesactivarAsync(
            "sede",
            id,
            request.IdUsuario,
            request.Codigo,
            cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/codigo-desactivacion")]
    public async Task<IActionResult> SolicitarCodigo(
        int id,
        SolicitarCodigoDesactivacionRequest request,
        CancellationToken cancellationToken)
    {
        await desactivaciones.SolicitarCodigoAsync("sede", id, request.IdUsuario, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:int}/activar")]
    public async Task<IActionResult> Activar(
        int id,
        ActivarEntidadUniversitariaRequest request,
        CancellationToken cancellationToken)
    {
        await desactivaciones.ActivarAsync("sede", id, request.IdUsuario, cancellationToken);
        return NoContent();
    }

    private static SedeResponse ConvertirRespuesta(Sede sede) =>
        new(
            sede.IdSede,
            sede.NombreSede,
            sede.Direccion,
            sede.Telefono,
            sede.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo",
            sede.Facultades
                .Where(facultad => facultad.EstadoRegistro == EstadoRegistro.Activo)
                .OrderBy(facultad => facultad.IdFacultad)
                .Select(facultad => new FacultadResumenResponse(
                    facultad.IdFacultad,
                    facultad.NombreFacultad,
                    facultad.DescripcionFacultad,
                    "activo"))
                .ToList());

    private ConflictObjectResult EstadoInactivo(string tipo) =>
        Conflict(new ProblemDetails
        {
            Title = $"No se puede editar una {tipo} inactiva. Actívela primero.",
            Status = StatusCodes.Status409Conflict
        });
}

[ApiController]
[Route("api/facultades")]
public sealed class FacultadesController(
    GestionCurricularDbContext db,
    IDesactivacionesUniversidadService desactivaciones) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FacultadResponse>>> ObtenerTodas(
        [FromQuery] bool incluirInactivas = false,
        CancellationToken cancellationToken = default)
    {
        var query = db.Facultades.AsNoTracking()
            .AsSplitQuery()
            .Include(facultad => facultad.Sede)
            .Include(facultad => facultad.Carreras)
            .Include(facultad => facultad.Usuarios)
            .AsQueryable();
        if (!incluirInactivas)
        {
            query = query.Where(facultad =>
                facultad.EstadoRegistro == EstadoRegistro.Activo
                && facultad.Sede.EstadoRegistro == EstadoRegistro.Activo);
        }

        var facultades = await query
            .OrderBy(facultad => facultad.IdFacultad)
            .ToListAsync(cancellationToken);
        return Ok(facultades.Select(ConvertirRespuesta).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FacultadResponse>> ObtenerPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var facultad = await db.Facultades.AsNoTracking()
            .AsSplitQuery()
            .Include(entity => entity.Sede)
            .Include(entity => entity.Carreras)
            .Include(entity => entity.Usuarios)
            .FirstOrDefaultAsync(entity => entity.IdFacultad == id, cancellationToken);
        return facultad is null ? NotFound() : Ok(ConvertirRespuesta(facultad));
    }

    [HttpPost]
    public async Task<ActionResult<FacultadResponse>> Crear(
        FacultadRequest request,
        CancellationToken cancellationToken)
    {
        if (!await db.Sedes.AnyAsync(
                sede => sede.IdSede == request.IdSede
                    && sede.EstadoRegistro == EstadoRegistro.Activo,
                cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "La sede indicada no existe o está inactiva.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var facultad = new Facultad
        {
            IdSede = request.IdSede,
            NombreFacultad = request.NombreFacultad.Trim(),
            Decano = request.Decano?.Trim(),
            DescripcionFacultad = request.DescripcionFacultad?.Trim(),
            EstadoRegistro = EstadoRegistro.Activo
        };
        db.Facultades.Add(facultad);
        await db.SaveChangesAsync(cancellationToken);
        await db.Entry(facultad).Reference(entity => entity.Sede).LoadAsync(cancellationToken);
        return CreatedAtAction(
            nameof(ObtenerPorId),
            new { id = facultad.IdFacultad },
            ConvertirRespuesta(facultad));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(
        int id,
        FacultadRequest request,
        CancellationToken cancellationToken)
    {
        var facultad = await db.Facultades.FindAsync([id], cancellationToken);
        if (facultad is null) return NotFound();
        if (facultad.EstadoRegistro == EstadoRegistro.Inactivo)
        {
            return Conflict(new ProblemDetails
            {
                Title = "No se puede editar una facultad inactiva. Actívela primero.",
                Status = StatusCodes.Status409Conflict
            });
        }

        if (!await db.Sedes.AnyAsync(
                sede => sede.IdSede == request.IdSede
                    && sede.EstadoRegistro == EstadoRegistro.Activo,
                cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "La sede indicada no existe o está inactiva.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        facultad.IdSede = request.IdSede;
        facultad.NombreFacultad = request.NombreFacultad.Trim();
        facultad.Decano = request.Decano?.Trim();
        facultad.DescripcionFacultad = request.DescripcionFacultad?.Trim();
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Desactivar(
        int id,
        ConfirmarDesactivacionRequest request,
        CancellationToken cancellationToken)
    {
        await desactivaciones.DesactivarAsync(
            "facultad",
            id,
            request.IdUsuario,
            request.Codigo,
            cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/codigo-desactivacion")]
    public async Task<IActionResult> SolicitarCodigo(
        int id,
        SolicitarCodigoDesactivacionRequest request,
        CancellationToken cancellationToken)
    {
        await desactivaciones.SolicitarCodigoAsync(
            "facultad",
            id,
            request.IdUsuario,
            cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:int}/activar")]
    public async Task<IActionResult> Activar(
        int id,
        ActivarEntidadUniversitariaRequest request,
        CancellationToken cancellationToken)
    {
        await desactivaciones.ActivarAsync("facultad", id, request.IdUsuario, cancellationToken);
        return NoContent();
    }

    private static FacultadResponse ConvertirRespuesta(Facultad facultad) =>
        new(
            facultad.IdFacultad,
            facultad.IdSede,
            facultad.Sede?.NombreSede,
            facultad.NombreFacultad,
            facultad.Decano,
            facultad.DescripcionFacultad,
            facultad.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo",
            facultad.Carreras
                .Where(carrera => carrera.EstadoRegistro == EstadoRegistro.Activo)
                .OrderBy(carrera => carrera.IdCarrera)
                .Select(carrera => new CarreraResumenResponse(
                    carrera.IdCarrera,
                    carrera.NombreCarrera,
                    "activo"))
                .ToList(),
            facultad.Usuarios
                .Where(usuario => usuario.EstadoCuenta == EstadoCuenta.Activo)
                .OrderBy(usuario => usuario.IdUsuario)
                .Select(usuario => new UsuarioFacultadResponse(
                    usuario.IdUsuario,
                    usuario.NombreCompleto,
                    usuario.Correo,
                    "activo"))
                .ToList());
}

[ApiController]
[Route("api/carreras")]
public sealed class CarrerasController(
    GestionCurricularDbContext db,
    IDesactivacionesUniversidadService desactivaciones) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CarreraResponse>>> ObtenerTodas(
        [FromQuery] bool incluirInactivas = false,
        CancellationToken cancellationToken = default)
    {
        var query = CrearConsulta();
        if (!incluirInactivas)
        {
            query = query.Where(carrera =>
                carrera.EstadoRegistro == EstadoRegistro.Activo
                && carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                && carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo);
        }

        var carreras = await query.OrderBy(carrera => carrera.IdCarrera)
            .ToListAsync(cancellationToken);
        return Ok(carreras.Select(ConvertirRespuesta).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CarreraResponse>> ObtenerPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var carrera = await CrearConsulta()
            .FirstOrDefaultAsync(entity => entity.IdCarrera == id, cancellationToken);
        return carrera is null ? NotFound() : Ok(ConvertirRespuesta(carrera));
    }

    [HttpPost]
    public async Task<ActionResult<CarreraResponse>> Crear(
        CarreraRequest request,
        CancellationToken cancellationToken)
    {
        if (!await db.Facultades.AnyAsync(
                facultad => facultad.IdFacultad == request.IdFacultad
                    && facultad.EstadoRegistro == EstadoRegistro.Activo
                    && facultad.Sede.EstadoRegistro == EstadoRegistro.Activo,
                cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "La facultad indicada no existe o está inactiva.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var ids = request.IdsAsignaturas?.Distinct().ToArray() ?? [];
        if (!await AsignaturasActivasAsync(ids, cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Una o más asignaturas no existen o están inactivas.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var carrera = new Carrera
        {
            IdFacultad = request.IdFacultad,
            NombreCarrera = request.NombreCarrera.Trim(),
            EstadoRegistro = EstadoRegistro.Activo
        };
        db.Carreras.Add(carrera);
        await db.SaveChangesAsync(cancellationToken);
        foreach (var idAsignatura in ids)
        {
            db.AsignaturasCarrera.Add(new AsignaturaCarrera
            {
                IdCarrera = carrera.IdCarrera,
                IdAsignatura = idAsignatura
            });
        }

        await db.SaveChangesAsync(cancellationToken);
        var resultado = await CrearConsulta()
            .FirstAsync(entity => entity.IdCarrera == carrera.IdCarrera, cancellationToken);
        return CreatedAtAction(
            nameof(ObtenerPorId),
            new { id = carrera.IdCarrera },
            ConvertirRespuesta(resultado));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(
        int id,
        CarreraRequest request,
        CancellationToken cancellationToken)
    {
        var carrera = await db.Carreras.FindAsync([id], cancellationToken);
        if (carrera is null) return NotFound();
        if (carrera.EstadoRegistro == EstadoRegistro.Inactivo)
        {
            return Conflict(new ProblemDetails
            {
                Title = "No se puede editar una carrera inactiva. Actívela primero.",
                Status = StatusCodes.Status409Conflict
            });
        }

        if (!await db.Facultades.AnyAsync(
                facultad => facultad.IdFacultad == request.IdFacultad
                    && facultad.EstadoRegistro == EstadoRegistro.Activo
                    && facultad.Sede.EstadoRegistro == EstadoRegistro.Activo,
                cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "La facultad indicada no existe o está inactiva.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var nuevosIds = request.IdsAsignaturas?.Distinct().ToArray();
        if (nuevosIds is not null
            && !await AsignaturasActivasAsync(nuevosIds, cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Una o más asignaturas no existen o están inactivas.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        carrera.IdFacultad = request.IdFacultad;
        carrera.NombreCarrera = request.NombreCarrera.Trim();

        if (nuevosIds is not null)
        {
            var relaciones = await db.AsignaturasCarrera
                .Where(relacion => relacion.IdCarrera == id)
                .ToListAsync(cancellationToken);

            var relacionesRemovidas = relaciones
                .Where(relacion => !nuevosIds.Contains(relacion.IdAsignatura))
                .ToArray();
            db.AsignaturasCarrera.RemoveRange(relacionesRemovidas);

            var idsExistentes = relaciones
                .Where(relacion => nuevosIds.Contains(relacion.IdAsignatura))
                .Select(relacion => relacion.IdAsignatura)
                .ToHashSet();
            foreach (var idAsignatura in nuevosIds.Where(idAsignatura => !idsExistentes.Contains(idAsignatura)))
            {
                db.AsignaturasCarrera.Add(new AsignaturaCarrera
                {
                    IdCarrera = id,
                    IdAsignatura = idAsignatura
                });
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Desactivar(
        int id,
        ConfirmarDesactivacionRequest request,
        CancellationToken cancellationToken)
    {
        await desactivaciones.DesactivarAsync(
            "carrera",
            id,
            request.IdUsuario,
            request.Codigo,
            cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/codigo-desactivacion")]
    public async Task<IActionResult> SolicitarCodigo(
        int id,
        SolicitarCodigoDesactivacionRequest request,
        CancellationToken cancellationToken)
    {
        await desactivaciones.SolicitarCodigoAsync(
            "carrera",
            id,
            request.IdUsuario,
            cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:int}/activar")]
    public async Task<IActionResult> Activar(
        int id,
        ActivarEntidadUniversitariaRequest request,
        CancellationToken cancellationToken)
    {
        await desactivaciones.ActivarAsync("carrera", id, request.IdUsuario, cancellationToken);
        return NoContent();
    }

    private IQueryable<Carrera> CrearConsulta() =>
        db.Carreras.AsNoTracking()
            .AsSplitQuery()
            .Include(carrera => carrera.Facultad)
            .Include(carrera => carrera.PlanesEstudio)
            .Include(carrera => carrera.AsignaturasCarrera)
                .ThenInclude(relacion => relacion.Asignatura);

    private async Task<bool> AsignaturasActivasAsync(
        int[] ids,
        CancellationToken cancellationToken)
    {
        if (ids.Length == 0) return true;
        var activas = await db.Asignaturas.CountAsync(
            asignatura => ids.Contains(asignatura.IdAsignatura)
                && asignatura.EstadoAsignatura == EstadoAsignatura.Activo,
            cancellationToken);
        return activas == ids.Length;
    }

    private static CarreraResponse ConvertirRespuesta(Carrera carrera) =>
        new(
            carrera.IdCarrera,
            carrera.IdFacultad,
            carrera.Facultad?.NombreFacultad,
            carrera.NombreCarrera,
            carrera.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo",
            carrera.PlanesEstudio
                .Where(plan => plan.EstadoPlan != EstadoPlanEstudio.Desactivado)
                .OrderBy(plan => plan.IdPlan)
                .Select(plan => new PlanResumenResponse(
                    plan.IdPlan,
                    plan.CicloInicio,
                    plan.CicloFin,
                    plan.EstadoPlan switch
                    {
                        EstadoPlanEstudio.Borrador => "borrador",
                        EstadoPlanEstudio.EnRevision => "en_revision",
                        EstadoPlanEstudio.Aprobado => "aprobado",
                        EstadoPlanEstudio.SalienteHistorico => "saliente_historico",
                        EstadoPlanEstudio.Desactivado => "desactivado",
                        null => "borrador",
                        _ => throw new InvalidOperationException(
                            $"Estado de plan no soportado: {plan.EstadoPlan}.")
                    }))
                .ToList(),
            carrera.AsignaturasCarrera
                .Where(relacion => relacion.Asignatura.EstadoAsignatura == EstadoAsignatura.Activo)
                .OrderBy(relacion => relacion.Asignatura.IdAsignatura)
                .Select(relacion => new AsignaturaCarreraResumenResponse(
                    relacion.Asignatura.IdAsignatura,
                    relacion.Asignatura.CodigoAsignatura,
                    relacion.Asignatura.NombreAsignatura,
                    "activo",
                    "activo"))
                .ToList());
}
