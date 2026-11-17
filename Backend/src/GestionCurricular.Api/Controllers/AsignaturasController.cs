using GestionCurricular.Api.Contracts;
using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Api.Controllers;

[ApiController]
[Route("api/asignaturas")]
public sealed class AsignaturasController(GestionCurricularDbContext db) : ControllerBase
{
    [HttpGet("{id:int}/detalles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerDetalles(
        int id,
        [FromQuery] bool incluirInactivos = false,
        CancellationToken cancellationToken = default)
    {
        var asignatura = await db.Asignaturas
            .AsNoTracking()
            .AsSplitQuery()
            .Include(entity => entity.Carreras).ThenInclude(relacion => relacion.Carrera)
            .Include(entity => entity.UsuariosParticipantes).ThenInclude(relacion => relacion.Usuario)
            .Include(entity => entity.UnidadesDidacticas).ThenInclude(unidad => unidad.Contenidos)
            .Include(entity => entity.Objetivos)
            .Include(entity => entity.TematicasLey)
            .Include(entity => entity.ReferenciasBibliograficas)
            .Include(entity => entity.ComoAsignatura).ThenInclude(relacion => relacion.Prerrequisito)
            .Include(entity => entity.ComoPrerrequisito).ThenInclude(relacion => relacion.Asignatura)
            .Include(entity => entity.PlanesAbsorcion).ThenInclude(relacion => relacion.PlanEstudio)
            .Include(entity => entity.PlanesAbsorcionEquivalentes).ThenInclude(relacion => relacion.PlanEstudio)
            .Include(entity => entity.MatricesCambios)
            .Include(entity => entity.MatricesCongruencia)
            .FirstOrDefaultAsync(entity => entity.IdAsignatura == id, cancellationToken);

        if (asignatura is null)
        {
            return NotFound();
        }

        return Ok(new
        {
            asignatura = ConvertirRespuesta(asignatura),
            carreras = asignatura.Carreras
                .Where(relacion => incluirInactivos || relacion.EstadoRegistro == EstadoRegistro.Activo)
                .Select(relacion => new
                {
                    relacion.IdAsignaturaCarrera,
                    relacion.IdCarrera,
                    relacion.Carrera.NombreCarrera,
                    estado = relacion.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            participantes = asignatura.UsuariosParticipantes
                .Where(relacion => incluirInactivos || relacion.EstadoRegistro == EstadoRegistro.Activo)
                .Select(relacion => new
                {
                    relacion.IdUsuarioParticipanteAsignatura,
                    relacion.IdUsuario,
                    relacion.Usuario.NombreUsuario,
                    relacion.Usuario.NombreCompleto,
                    estado = relacion.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            unidadesDidacticas = asignatura.UnidadesDidacticas
                .Where(unidad => incluirInactivos || unidad.EstadoRegistro == EstadoRegistro.Activo)
                .Select(unidad => new
                {
                    unidad.IdUnidadDidactica,
                    unidad.Nombre,
                    unidad.Objetivo,
                    estado = unidad.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo",
                    contenidos = unidad.Contenidos
                        .Where(contenido => incluirInactivos || contenido.EstadoRegistro == EstadoRegistro.Activo)
                        .Select(contenido => new
                        {
                            contenido.IdContenido,
                            contenido.Nombre,
                            contenido.Descripcion,
                            estado = contenido.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                        })
                }),
            objetivos = asignatura.Objetivos
                .Where(item => incluirInactivos || item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => new
                {
                    item.IdObjetivoAsignatura,
                    tipo = item.TipoObjetivo == TipoObjetivo.General ? "general" : "especifico",
                    item.DescripcionObjetivo,
                    estado = item.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            tematicasLey = asignatura.TematicasLey
                .Where(item => incluirInactivos || item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => new
                {
                    item.IdTematicaLey,
                    item.Nombre,
                    item.Legislacion,
                    item.OtrasEstrategias,
                    estado = item.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            referenciasBibliograficas = asignatura.ReferenciasBibliograficas
                .Where(item => incluirInactivos || item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => new
                {
                    item.IdReferenciaBibliograficaAsignatura,
                    item.Referencia,
                    estado = item.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            asignaturasQueRequierenComoPrerrequisito = asignatura.ComoPrerrequisito
                .Where(item => incluirInactivos || item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => new
                {
                    item.IdAsignatura,
                    item.Asignatura.NombreAsignatura,
                    estado = item.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            prerrequisitos = asignatura.ComoAsignatura
                .Where(item => incluirInactivos || item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => new
                {
                    item.IdPrerrequisitoAsignatura,
                    item.Prerrequisito.NombreAsignatura,
                    estado = item.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            planesAbsorcion = asignatura.PlanesAbsorcion
                .Where(item => incluirInactivos || item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => new
                {
                    item.IdPlanAbsorcion,
                    item.IdAsignaturaEquivalente,
                    item.PlanEstudio.CicloInicio,
                    item.PlanEstudio.CicloFin,
                    estado = item.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            planesAbsorcionComoEquivalente = asignatura.PlanesAbsorcionEquivalentes
                .Where(item => incluirInactivos || item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => new
                {
                    item.IdPlanAbsorcion,
                    item.IdAsignatura,
                    item.PlanEstudio.CicloInicio,
                    item.PlanEstudio.CicloFin,
                    estado = item.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            matricesCambios = asignatura.MatricesCambios
                .Where(item => incluirInactivos || item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => new
                {
                    item.IdMatrizCambios,
                    item.IdPlan,
                    item.Cambio,
                    item.PlanVigente,
                    item.PlanActualizado,
                    item.Justificacion,
                    estado = item.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                }),
            matricesCongruencia = asignatura.MatricesCongruencia
                .Where(item => incluirInactivos || item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => new
                {
                    item.IdMatrizCongruenciaAsignatura,
                    item.IdMatrizCongruencia,
                    estado = item.EstadoRegistro == EstadoRegistro.Activo ? "activo" : "inactivo"
                })
        });
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AsignaturaResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AsignaturaResponse>>> ObtenerTodas(
        [FromQuery] bool incluirInactivas = false,
        CancellationToken cancellationToken = default)
    {
        var query = db.Asignaturas.AsNoTracking().AsQueryable();
        if (!incluirInactivas)
        {
            query = query.Where(asignatura =>
                asignatura.EstadoAsignatura == EstadoAsignatura.Activo);
        }

        var asignaturas = await query
            .OrderBy(asignatura => asignatura.IdAsignatura)
            .ToListAsync(cancellationToken);

        return Ok(asignaturas.Select(ConvertirRespuesta).ToList());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(AsignaturaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AsignaturaResponse>> ObtenerPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var asignatura = await db.Asignaturas
            .AsNoTracking()
            .FirstOrDefaultAsync(entity => entity.IdAsignatura == id, cancellationToken);

        return asignatura is null
            ? NotFound()
            : Ok(ConvertirRespuesta(asignatura));
    }

    [HttpPost]
    [ProducesResponseType(typeof(AsignaturaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AsignaturaResponse>> Crear(
        AsignaturaRequest request,
        CancellationToken cancellationToken)
    {
        var validacion = ValidarModalidad(request.Modalidad);
        if (validacion is not null)
        {
            return validacion;
        }

        var ordenEnUso = await ValidarOrdenAsync(request.NumeroOrden, null, cancellationToken);
        if (ordenEnUso)
        {
            return Conflict(new ProblemDetails
            {
                Title = "El número de orden ya está asignado a otra asignatura.",
                Status = StatusCodes.Status409Conflict
            });
        }

        var asignatura = new Asignatura
        {
            EstadoAsignatura = EstadoAsignatura.Activo
        };
        AplicarCambios(asignatura, request);

        db.Asignaturas.Add(asignatura);
        await db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(
            nameof(ObtenerPorId),
            new { id = asignatura.IdAsignatura },
            ConvertirRespuesta(asignatura));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(AsignaturaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AsignaturaResponse>> Actualizar(
        int id,
        AsignaturaRequest request,
        CancellationToken cancellationToken)
    {
        var asignatura = await db.Asignaturas
            .FirstOrDefaultAsync(entity => entity.IdAsignatura == id, cancellationToken);
        if (asignatura is null)
        {
            return NotFound();
        }

        if (asignatura.EstadoAsignatura == EstadoAsignatura.Inactivo)
        {
            return Conflict(new ProblemDetails
            {
                Title = "No se puede editar una asignatura desactivada. Actívela primero.",
                Status = StatusCodes.Status409Conflict
            });
        }

        var validacion = ValidarModalidad(request.Modalidad);
        if (validacion is not null)
        {
            return validacion;
        }

        if (await ValidarOrdenAsync(request.NumeroOrden, id, cancellationToken))
        {
            return Conflict(new ProblemDetails
            {
                Title = "El número de orden ya está asignado a otra asignatura.",
                Status = StatusCodes.Status409Conflict
            });
        }

        AplicarCambios(asignatura, request);
        await db.SaveChangesAsync(cancellationToken);

        return Ok(ConvertirRespuesta(asignatura));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Desactivar(
        int id,
        CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var asignatura = await db.Asignaturas
            .FirstOrDefaultAsync(entity => entity.IdAsignatura == id, cancellationToken);
        if (asignatura is null)
        {
            return NotFound();
        }

        asignatura.EstadoAsignatura = EstadoAsignatura.Inactivo;

        var relacionesCarrera = await db.AsignaturasCarrera
            .Where(entity => entity.IdAsignatura == id)
            .ToListAsync(cancellationToken);
        var participantes = await db.UsuariosParticipantesAsignatura
            .Where(entity => entity.IdAsignatura == id)
            .ToListAsync(cancellationToken);
        var unidades = await db.UnidadesDidacticas
            .Where(entity => entity.IdAsignatura == id)
            .ToListAsync(cancellationToken);
        var unidadIds = unidades.Select(entity => entity.IdUnidadDidactica).ToArray();
        var contenidos = await db.Contenidos
            .Where(entity => unidadIds.Contains(entity.IdUnidadDidactica))
            .ToListAsync(cancellationToken);
        var objetivos = await db.ObjetivosAsignatura
            .Where(entity => entity.IdAsignatura == id)
            .ToListAsync(cancellationToken);
        var tematicas = await db.TematicasLey
            .Where(entity => entity.IdAsignatura == id)
            .ToListAsync(cancellationToken);
        var referencias = await db.ReferenciasBibliograficasAsignatura
            .Where(entity => entity.IdAsignatura == id)
            .ToListAsync(cancellationToken);
        var prerrequisitos = await db.PrerrequisitosAsignatura
            .Where(entity => entity.IdAsignatura == id || entity.IdPrerrequisitoAsignatura == id)
            .ToListAsync(cancellationToken);
        var planesAbsorcion = await db.PlanesAbsorcion
            .Where(entity => entity.IdAsignatura == id || entity.IdAsignaturaEquivalente == id)
            .ToListAsync(cancellationToken);
        var matricesCambios = await db.MatricesCambios
            .Where(entity => entity.IdAsignatura == id)
            .ToListAsync(cancellationToken);
        var matricesCongruencia = await db.MatricesCongruenciaAsignatura
            .Where(entity => entity.IdAsignatura == id)
            .ToListAsync(cancellationToken);

        MarcarInactivos(relacionesCarrera, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(participantes, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(unidades, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(contenidos, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(objetivos, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(tematicas, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(referencias, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(prerrequisitos, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(planesAbsorcion, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(matricesCambios, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(matricesCongruencia, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return NoContent();
    }

    [HttpPut("{id:int}/activar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Activar(
        int id,
        CancellationToken cancellationToken)
    {
        var asignatura = await db.Asignaturas
            .FirstOrDefaultAsync(entity => entity.IdAsignatura == id, cancellationToken);
        if (asignatura is null)
        {
            return NotFound();
        }

        asignatura.EstadoAsignatura = EstadoAsignatura.Activo;
        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private async Task<bool> ValidarOrdenAsync(
        int? numeroOrden,
        int? idExcluir,
        CancellationToken cancellationToken)
    {
        if (!numeroOrden.HasValue)
        {
            return false;
        }

        return await db.Asignaturas.AnyAsync(
            asignatura => asignatura.NumeroOrden == numeroOrden
                && (!idExcluir.HasValue || asignatura.IdAsignatura != idExcluir.Value),
            cancellationToken);
    }

    private BadRequestObjectResult? ValidarModalidad(string modalidad)
    {
        if (modalidad is "presencial" or "semipresencial" or "nopresencial")
        {
            return null;
        }

        return BadRequest(new ProblemDetails
        {
            Title = "La modalidad debe ser presencial, semipresencial o nopresencial.",
            Status = StatusCodes.Status400BadRequest
        });
    }

    private static void AplicarCambios(Asignatura asignatura, AsignaturaRequest request)
    {
        asignatura.NombreAsignatura = request.NombreAsignatura.Trim();
        asignatura.CodigoAsignatura = request.CodigoAsignatura.Trim();
        asignatura.AreaFormacion = request.AreaFormacion.Trim();
        asignatura.NumeroOrden = request.NumeroOrden;
        asignatura.HorasCiclo = request.HorasCiclo;
        asignatura.HorasSemana = request.HorasSemana;
        asignatura.HorasPracticas = request.HorasPracticas;
        asignatura.DuracionCicloSemana = request.DuracionCicloSemana;
        asignatura.DuracionHoraClase = request.DuracionHoraClase;
        asignatura.UnidadesValorativas = request.UnidadesValorativas;
        asignatura.CicloAcademico = request.CicloAcademico.Trim();
        asignatura.Modalidad = request.Modalidad switch
        {
            "presencial" => ModalidadAsignatura.Presencial,
            "semipresencial" => ModalidadAsignatura.Semipresencial,
            "nopresencial" => ModalidadAsignatura.Nopresencial,
            _ => throw new InvalidOperationException(
                $"Modalidad de asignatura no soportada: {request.Modalidad}.")
        };
        asignatura.DescripcionAsignatura = request.DescripcionAsignatura;
        asignatura.EstrategiaMetodologica = request.EstrategiaMetodologica;
        asignatura.Evaluacion = request.Evaluacion;
        asignatura.FuentesElectronicas = request.FuentesElectronicas;
    }

    private static AsignaturaResponse ConvertirRespuesta(Asignatura asignatura) =>
        new(
            asignatura.IdAsignatura,
            asignatura.NombreAsignatura,
            asignatura.CodigoAsignatura,
            asignatura.AreaFormacion,
            asignatura.NumeroOrden,
            asignatura.HorasCiclo,
            asignatura.HorasSemana,
            asignatura.HorasPracticas,
            asignatura.DuracionCicloSemana,
            asignatura.DuracionHoraClase,
            asignatura.UnidadesValorativas,
            asignatura.CicloAcademico,
            asignatura.Modalidad switch
            {
                ModalidadAsignatura.Presencial => "presencial",
                ModalidadAsignatura.Semipresencial => "semipresencial",
                ModalidadAsignatura.Nopresencial => "nopresencial",
                _ => throw new InvalidOperationException(
                    $"Modalidad de asignatura no soportada: {asignatura.Modalidad}.")
            },
            asignatura.EstadoAsignatura == EstadoAsignatura.Activo ? "activo" : "inactivo",
            asignatura.DescripcionAsignatura,
            asignatura.EstrategiaMetodologica,
            asignatura.Evaluacion,
            asignatura.FuentesElectronicas);

    private static void MarcarInactivos<TEntity>(
        IEnumerable<TEntity> entidades,
        Func<TEntity, EstadoRegistro> obtenerEstado,
        Action<TEntity, EstadoRegistro> establecerEstado)
    {
        foreach (var entidad in entidades)
        {
            if (obtenerEstado(entidad) == EstadoRegistro.Activo)
            {
                establecerEstado(entidad, EstadoRegistro.Inactivo);
            }
        }
    }
}
