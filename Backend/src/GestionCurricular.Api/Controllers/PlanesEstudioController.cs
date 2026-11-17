using GestionCurricular.Api.Contracts;
using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Api.Controllers;

[ApiController]
[Route("api/planes-estudio")]
public sealed class PlanesEstudioController(GestionCurricularDbContext db) : ControllerBase
{
    [HttpGet("{id:int}/detalles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerDetalles(
        int id,
        [FromQuery] bool incluirInactivos = false,
        CancellationToken cancellationToken = default)
    {
        var plan = await db.PlanesEstudio
            .AsNoTracking()
            .AsSplitQuery()
            .Include(entity => entity.Carrera)
            .Include(entity => entity.UsuariosParticipantes).ThenInclude(relacion => relacion.Usuario)
            .Include(entity => entity.Actividades)
            .Include(entity => entity.OrientacionesMetodologicas)
            .Include(entity => entity.RequisitosPermanenciaGraduacion)
            .Include(entity => entity.EvaluacionesAprendizaje)
            .Include(entity => entity.ItemsJustificacion)
            .Include(entity => entity.MaterialesDidacticos)
            .Include(entity => entity.ObjetivosCarrera).ThenInclude(objetivo => objetivo.MatricesCongruencia)
                .ThenInclude(matriz => matriz.Asignaturas).ThenInclude(relacion => relacion.Asignatura)
            .Include(entity => entity.PerfilesCurriculares).ThenInclude(perfil => perfil.PerfilesIngreso)
            .Include(entity => entity.PerfilesCurriculares).ThenInclude(perfil => perfil.PerfilesEgreso)
            .Include(entity => entity.ReferenciasBibliograficas)
            .Include(entity => entity.PlanesAbsorcion).ThenInclude(relacion => relacion.Asignatura)
            .Include(entity => entity.PlanesAbsorcion).ThenInclude(relacion => relacion.AsignaturaEquivalente)
            .Include(entity => entity.MatricesCambios).ThenInclude(matriz => matriz.Asignatura)
            .Include(entity => entity.MatricesCongruencia)
                .ThenInclude(matriz => matriz.Asignaturas).ThenInclude(relacion => relacion.Asignatura)
            .FirstOrDefaultAsync(entity => entity.IdPlan == id, cancellationToken);

        if (plan is null)
        {
            return NotFound();
        }

        return Ok(new
        {
            plan = ConvertirRespuesta(plan),
            participantes = Filtrar(plan.UsuariosParticipantes, incluirInactivos, item => item.EstadoRegistro)
                .Select(relacion => new
                {
                    relacion.IdUsuarioParticipantePlan,
                    relacion.IdUsuario,
                    relacion.Usuario.NombreUsuario,
                    relacion.Usuario.NombreCompleto,
                    estado = Estado(relacion.EstadoRegistro)
                }),
            actividades = Filtrar(plan.Actividades, incluirInactivos, item => item.EstadoRegistro)
                .Select(item => new
                {
                    item.IdActividad,
                    item.NombreActividad,
                    item.FechaInicio,
                    item.FechaFin,
                    item.ResponsableImplementacion,
                    item.Observacion,
                    estado = Estado(item.EstadoRegistro)
                }),
            orientacionesMetodologicas = Filtrar(plan.OrientacionesMetodologicas, incluirInactivos, item => item.EstadoRegistro)
                .Select(item => new
                {
                    item.IdOrientacionMetodologica,
                    item.Nombre,
                    item.Descripcion,
                    estado = Estado(item.EstadoRegistro)
                }),
            requisitosPermanenciaGraduacion = Filtrar(plan.RequisitosPermanenciaGraduacion, incluirInactivos, item => item.EstadoRegistro)
                .Select(item => new
                {
                    item.IdRequisitoPermanenciaGraduacion,
                    item.Nombre,
                    item.Descripcion,
                    estado = Estado(item.EstadoRegistro)
                }),
            evaluacionesAprendizaje = Filtrar(plan.EvaluacionesAprendizaje, incluirInactivos, item => item.EstadoRegistro)
                .Select(item => new
                {
                    item.IdEvaluacionAprendizaje,
                    item.Nombre,
                    item.Descripcion,
                    estado = Estado(item.EstadoRegistro)
                }),
            itemsJustificacion = Filtrar(plan.ItemsJustificacion, incluirInactivos, item => item.EstadoRegistro)
                .Select(item => new
                {
                    item.IdItemJustificacion,
                    item.Nombre,
                    item.Descripcion,
                    estado = Estado(item.EstadoRegistro)
                }),
            materialesDidacticos = Filtrar(plan.MaterialesDidacticos, incluirInactivos, item => item.EstadoRegistro)
                .Select(item => new
                {
                    item.IdMaterialDidactico,
                    item.Nombre,
                    item.Descripcion,
                    item.Imagen,
                    estado = Estado(item.EstadoRegistro)
                }),
            objetivosCarrera = Filtrar(plan.ObjetivosCarrera, incluirInactivos, item => item.EstadoRegistro)
                .Select(item => new
                {
                    item.IdObjetivoCarrera,
                    tipo = item.TipoObjetivo == TipoObjetivo.General ? "general" : "especifico",
                    item.DescripcionObjetivo,
                    estado = Estado(item.EstadoRegistro),
                    matricesCongruencia = item.MatricesCongruencia
                        .Where(matriz => incluirInactivos || matriz.EstadoRegistro == EstadoRegistro.Activo)
                        .Select(matriz => new
                        {
                            matriz.IdMatrizCongruencia,
                            matriz.CompetenciaDiagnostico,
                            estado = Estado(matriz.EstadoRegistro),
                            asignaturas = matriz.Asignaturas
                                .Where(relacion => incluirInactivos || relacion.EstadoRegistro == EstadoRegistro.Activo)
                                .Select(relacion => new
                                {
                                    relacion.IdAsignatura,
                                    relacion.Asignatura.NombreAsignatura,
                                    estado = Estado(relacion.EstadoRegistro)
                                })
                        })
                }),
            perfilesCurriculares = Filtrar(plan.PerfilesCurriculares, incluirInactivos, item => item.EstadoRegistro)
                .Select(perfil => new
                {
                    perfil.IdPerfilCurricular,
                    estado = Estado(perfil.EstadoRegistro),
                    perfilesIngreso = Filtrar(perfil.PerfilesIngreso, incluirInactivos, item => item.EstadoRegistro)
                        .Select(item => new
                        {
                            item.IdPerfilIngreso,
                            item.Nombre,
                            item.Descripcion,
                            estado = Estado(item.EstadoRegistro)
                        }),
                    perfilesEgreso = Filtrar(perfil.PerfilesEgreso, incluirInactivos, item => item.EstadoRegistro)
                        .Select(item => new
                        {
                            item.IdPerfilEgreso,
                            item.Nombre,
                            item.Descripcion,
                            estado = Estado(item.EstadoRegistro)
                        })
                }),
            referenciasBibliograficas = Filtrar(plan.ReferenciasBibliograficas, incluirInactivos, item => item.EstadoRegistro)
                .Select(item => new
                {
                    item.IdReferenciaBibliograficaPlan,
                    item.Referencia,
                    item.FragmentoTextoAsociado,
                    estado = Estado(item.EstadoRegistro)
                }),
            planesAbsorcion = Filtrar(plan.PlanesAbsorcion, incluirInactivos, item => item.EstadoRegistro)
                .Select(item => new
                {
                    item.IdPlanAbsorcion,
                    asignatura = new { item.IdAsignatura, item.Asignatura.NombreAsignatura },
                    equivalente = new { item.IdAsignaturaEquivalente, item.AsignaturaEquivalente.NombreAsignatura },
                    estado = Estado(item.EstadoRegistro)
                }),
            matricesCambios = Filtrar(plan.MatricesCambios, incluirInactivos, item => item.EstadoRegistro)
                .Select(item => new
                {
                    item.IdMatrizCambios,
                    item.IdAsignatura,
                    nombreAsignatura = item.Asignatura == null ? null : item.Asignatura.NombreAsignatura,
                    item.Cambio,
                    item.PlanVigente,
                    item.PlanActualizado,
                    item.Justificacion,
                    estado = Estado(item.EstadoRegistro)
                }),
            matricesCongruencia = Filtrar(plan.MatricesCongruencia, incluirInactivos, item => item.EstadoRegistro)
                .Select(matriz => new
                {
                    matriz.IdMatrizCongruencia,
                    matriz.IdObjetivoCarrera,
                    matriz.CompetenciaDiagnostico,
                    estado = Estado(matriz.EstadoRegistro),
                    asignaturas = matriz.Asignaturas
                        .Where(relacion => incluirInactivos || relacion.EstadoRegistro == EstadoRegistro.Activo)
                        .Select(relacion => new
                        {
                            relacion.IdAsignatura,
                            relacion.Asignatura.NombreAsignatura,
                            estado = Estado(relacion.EstadoRegistro)
                        })
                })
        });
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<PlanEstudioResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PlanEstudioResponse>>> ObtenerTodos(
        [FromQuery] bool incluirDesactivados = false,
        CancellationToken cancellationToken = default)
    {
        var query = db.PlanesEstudio
            .AsNoTracking()
            .Include(plan => plan.Carrera)
            .AsQueryable();

        if (!incluirDesactivados)
        {
            query = query.Where(plan =>
                plan.EstadoPlan == null
                || plan.EstadoPlan != EstadoPlanEstudio.Desactivado);
        }

        var planes = await query
            .OrderBy(plan => plan.IdPlan)
            .ToListAsync(cancellationToken);

        return Ok(planes.Select(ConvertirRespuesta).ToList());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PlanEstudioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PlanEstudioResponse>> ObtenerPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var plan = await db.PlanesEstudio
            .AsNoTracking()
            .Include(entity => entity.Carrera)
            .FirstOrDefaultAsync(entity => entity.IdPlan == id, cancellationToken);

        return plan is null
            ? NotFound()
            : Ok(ConvertirRespuesta(plan));
    }

    [HttpPost]
    [ProducesResponseType(typeof(PlanEstudioResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PlanEstudioResponse>> Crear(
        PlanEstudioRequest request,
        CancellationToken cancellationToken)
    {
        var validacion = ValidarEstado(request.EstadoPlan);
        if (validacion is not null)
        {
            return validacion;
        }

        var carreraInvalida = await ValidarCarreraAsync(
            request.IdCarrera,
            cancellationToken);
        if (carreraInvalida is not null)
        {
            return carreraInvalida;
        }

        var plan = new PlanEstudio
        {
            EstadoPlan = EstadoPlanEstudio.Borrador
        };
        AplicarCambios(plan, request);

        db.PlanesEstudio.Add(plan);
        await db.SaveChangesAsync(cancellationToken);
        await CargarCarreraAsync(plan, cancellationToken);

        return CreatedAtAction(
            nameof(ObtenerPorId),
            new { id = plan.IdPlan },
            ConvertirRespuesta(plan));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PlanEstudioResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PlanEstudioResponse>> Actualizar(
        int id,
        PlanEstudioRequest request,
        CancellationToken cancellationToken)
    {
        var plan = await db.PlanesEstudio
            .FirstOrDefaultAsync(entity => entity.IdPlan == id, cancellationToken);
        if (plan is null)
        {
            return NotFound();
        }

        if (plan.EstadoPlan == EstadoPlanEstudio.Desactivado)
        {
            return Conflict(new ProblemDetails
            {
                Title = "No se puede editar un plan desactivado.",
                Status = StatusCodes.Status409Conflict
            });
        }

        var validacion = ValidarEstado(request.EstadoPlan);
        if (validacion is not null)
        {
            return validacion;
        }

        var carreraInvalida = await ValidarCarreraAsync(
            request.IdCarrera,
            cancellationToken);
        if (carreraInvalida is not null)
        {
            return carreraInvalida;
        }

        AplicarCambios(plan, request);
        await db.SaveChangesAsync(cancellationToken);
        await CargarCarreraAsync(plan, cancellationToken);

        return Ok(ConvertirRespuesta(plan));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Desactivar(
        int id,
        CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var plan = await db.PlanesEstudio
            .FirstOrDefaultAsync(entity => entity.IdPlan == id, cancellationToken);
        if (plan is null)
        {
            return NotFound();
        }

        if (plan.EstadoPlan == EstadoPlanEstudio.Desactivado)
        {
            return NoContent();
        }

        plan.EstadoPlan = EstadoPlanEstudio.Desactivado;

        var participantes = await db.UsuariosParticipantesPlan
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var actividades = await db.Actividades
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var orientaciones = await db.OrientacionesMetodologicas
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var requisitos = await db.RequisitosPermanenciaGraduacion
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var evaluaciones = await db.EvaluacionesAprendizaje
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var itemsJustificacion = await db.ItemsJustificacion
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var materiales = await db.MaterialesDidacticos
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var objetivos = await db.ObjetivosCarrera
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var perfiles = await db.PerfilesCurriculares
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var referencias = await db.ReferenciasBibliograficasPlan
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var planesAbsorcion = await db.PlanesAbsorcion
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var matricesCambio = await db.MatricesCambios
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);
        var matricesCongruencia = await db.MatricesCongruencia
            .Where(entity => entity.IdPlan == id)
            .ToListAsync(cancellationToken);

        var perfilIds = perfiles.Select(entity => entity.IdPerfilCurricular).ToArray();
        var perfilesIngreso = await db.PerfilesIngreso
            .Where(entity => perfilIds.Contains(entity.IdPerfilCurricular))
            .ToListAsync(cancellationToken);
        var perfilesEgreso = await db.PerfilesEgreso
            .Where(entity => perfilIds.Contains(entity.IdPerfilCurricular))
            .ToListAsync(cancellationToken);

        var matrizCongruenciaIds = matricesCongruencia
            .Select(entity => entity.IdMatrizCongruencia)
            .ToArray();
        var asignaturasCongruencia = await db.MatricesCongruenciaAsignatura
            .Where(entity => matrizCongruenciaIds.Contains(entity.IdMatrizCongruencia))
            .ToListAsync(cancellationToken);

        MarcarInactivos(participantes, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(actividades, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(orientaciones, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(requisitos, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(evaluaciones, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(itemsJustificacion, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(materiales, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(objetivos, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(perfiles, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(referencias, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(planesAbsorcion, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(matricesCambio, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(matricesCongruencia, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(perfilesIngreso, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(perfilesEgreso, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);
        MarcarInactivos(asignaturasCongruencia, entity => entity.EstadoRegistro, (entity, estado) => entity.EstadoRegistro = estado);

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return NoContent();
    }

    private async Task<BadRequestObjectResult?> ValidarCarreraAsync(
        int? idCarrera,
        CancellationToken cancellationToken)
    {
        if (idCarrera.HasValue
            && !await db.Carreras.AnyAsync(
                carrera => carrera.IdCarrera == idCarrera.Value
                    && carrera.EstadoRegistro == EstadoRegistro.Activo,
                cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "La carrera indicada no existe o está inactiva.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        return null;
    }

    private BadRequestObjectResult? ValidarEstado(string? estado)
    {
        if (estado is null or "borrador" or "en_revision" or "aprobado" or "saliente_historico")
        {
            return null;
        }

        return BadRequest(new ProblemDetails
        {
            Title = "El estado del plan no es válido. Use borrador, en_revision, aprobado o saliente_historico.",
            Status = StatusCodes.Status400BadRequest
        });
    }

    private async Task CargarCarreraAsync(
        PlanEstudio plan,
        CancellationToken cancellationToken)
    {
        if (plan.IdCarrera.HasValue)
        {
            await db.Entry(plan).Reference(entity => entity.Carrera).LoadAsync(cancellationToken);
        }
    }

    private static void AplicarCambios(PlanEstudio plan, PlanEstudioRequest request)
    {
        plan.IdCarrera = request.IdCarrera;
        plan.Modalidad = request.Modalidad switch
        {
            "presencial" => ModalidadPlanEstudio.Presencial,
            "semipresencial" => ModalidadPlanEstudio.Semipresencial,
            "virtual" => ModalidadPlanEstudio.Virtual,
            _ => throw new InvalidOperationException(
                $"Modalidad de plan no soportada: {request.Modalidad}.")
        };
        plan.CicloInicio = request.CicloInicio.Trim();
        plan.CicloFin = request.CicloFin.Trim();
        plan.FechaAprobacion = request.FechaAprobacion;
        if (request.EstadoPlan is not null)
        {
            plan.EstadoPlan = request.EstadoPlan switch
            {
                "borrador" => EstadoPlanEstudio.Borrador,
                "en_revision" => EstadoPlanEstudio.EnRevision,
                "aprobado" => EstadoPlanEstudio.Aprobado,
                "saliente_historico" => EstadoPlanEstudio.SalienteHistorico,
                _ => throw new InvalidOperationException(
                    $"Estado de plan no soportado: {request.EstadoPlan}.")
            };
        }

        plan.ImagenPensum = request.ImagenPensum;
        plan.Fundamentacion = request.Fundamentacion;
        plan.Justificacion = request.Justificacion;
        plan.Diagnostico = request.Diagnostico;
        plan.PoliticasImplementacion = request.PoliticasImplementacion;
        plan.TituloOtorgar = request.TituloOtorgar;
        plan.RequisitosIngreso = request.RequisitosIngreso;
        plan.RequisitosServicioSocial = request.RequisitosServicioSocial;
        plan.RequisitosPermanenciaGraduacionTexto = request.RequisitosPermanenciaGraduacion;
        plan.AsignaturasCicloExtraordinario = request.AsignaturasCicloExtraordinario;
        plan.IngresosEquivalenciasExtranjero = request.IngresosEquivalenciasExtranjero;
        plan.EquivalenciaCreditosUvs = request.EquivalenciaCreditosUvs;
        plan.PoliticasAbsorcion = request.PoliticasAbsorcion;
        plan.ServicioSocialPracticasProfesionales = request.ServicioSocialPracticasProfesionales;
        plan.OrientacionMetodologicaTexto = request.OrientacionMetodologica;
    }

    private static PlanEstudioResponse ConvertirRespuesta(PlanEstudio plan) =>
        new(
            plan.IdPlan,
            plan.IdCarrera,
            plan.Carrera?.NombreCarrera,
            plan.Modalidad switch
            {
                ModalidadPlanEstudio.Presencial => "presencial",
                ModalidadPlanEstudio.Semipresencial => "semipresencial",
                ModalidadPlanEstudio.Virtual => "virtual",
                _ => throw new InvalidOperationException(
                    $"Modalidad de plan no soportada: {plan.Modalidad}.")
            },
            plan.CicloInicio,
            plan.CicloFin,
            plan.FechaAprobacion,
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
            },
            plan.ImagenPensum,
            plan.Fundamentacion,
            plan.Justificacion,
            plan.Diagnostico,
            plan.PoliticasImplementacion,
            plan.TituloOtorgar,
            plan.RequisitosIngreso,
            plan.RequisitosServicioSocial,
            plan.RequisitosPermanenciaGraduacionTexto,
            plan.AsignaturasCicloExtraordinario,
            plan.IngresosEquivalenciasExtranjero,
            plan.EquivalenciaCreditosUvs,
            plan.PoliticasAbsorcion,
            plan.ServicioSocialPracticasProfesionales,
            plan.OrientacionMetodologicaTexto);

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

    private static IEnumerable<TEntity> Filtrar<TEntity>(
        IEnumerable<TEntity> entidades,
        bool incluirInactivos,
        Func<TEntity, EstadoRegistro> obtenerEstado)
    {
        if (incluirInactivos)
        {
            return entidades;
        }

        return entidades.Where(entidad => obtenerEstado(entidad) == EstadoRegistro.Activo);
    }

    private static string Estado(EstadoRegistro estado) =>
        estado == EstadoRegistro.Activo ? "activo" : "inactivo";
}
