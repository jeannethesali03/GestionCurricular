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
            .Include(entity => entity.ActividadesAreas)
                .ThenInclude(area => area.Actividades)
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
            participantes = plan.UsuariosParticipantes
                .Select(relacion => new
                {
                    relacion.IdUsuarioParticipantePlan,
                    relacion.IdUsuario,
                    relacion.Usuario.Correo,
                    relacion.Usuario.NombreCompleto,
                    estado = "activo"
                }),
            actividades = plan.ActividadesAreas
                .SelectMany(area => area.Actividades)
                .Select(item => new
                {
                    item.IdActividad,
                    item.IdArea,
                    item.NumeroActividad,
                    nombreArea = item.ActividadesArea.NombreArea,
                    item.NombreActividad,
                    item.FechaInicio,
                    item.FechaFin,
                    item.ResponsableImplementacion,
                    item.Observacion,
                    estado = "activo"
                }),
            orientacionesMetodologicas = plan.OrientacionesMetodologicas
                .Select(item => new
                {
                    item.IdOrientacionMetodologica,
                    item.Nombre,
                    item.Descripcion,
                    estado = "activo"
                }),
            requisitosPermanenciaGraduacion = plan.RequisitosPermanenciaGraduacion
                .Select(item => new
                {
                    item.IdRequisitoPermanenciaGraduacion,
                    item.Nombre,
                    item.Descripcion,
                    estado = "activo"
                }),
            evaluacionesAprendizaje = plan.EvaluacionesAprendizaje
                .Select(item => new
                {
                    item.IdEvaluacionAprendizaje,
                    item.Nombre,
                    item.Descripcion,
                    estado = "activo"
                }),
            itemsJustificacion = plan.ItemsJustificacion
                .Select(item => new
                {
                    item.IdItemJustificacion,
                    item.Nombre,
                    item.Descripcion,
                    estado = "activo"
                }),
            materialesDidacticos = plan.MaterialesDidacticos
                .Select(item => new
                {
                    item.IdMaterialDidactico,
                    item.Nombre,
                    item.Descripcion,
                    item.Imagen,
                    estado = "activo"
                }),
            objetivosCarrera = plan.ObjetivosCarrera
                .Select(item => new
                {
                    item.IdObjetivoCarrera,
                    tipo = item.TipoObjetivo == TipoObjetivo.General ? "general" : "especifico",
                    item.DescripcionObjetivo,
                    estado = "activo",
                    matricesCongruencia = item.MatricesCongruencia
                        .Select(matriz => new
                        {
                            matriz.IdMatrizCongruencia,
                            matriz.CompetenciaDiagnostico,
                            estado = "activo",
                            asignaturas = matriz.Asignaturas
                                .Select(relacion => new
                                {
                                    relacion.IdAsignatura,
                                    relacion.Asignatura.NombreAsignatura,
                                    estado = "activo"
                                })
                        })
                }),
            perfilesCurriculares = plan.PerfilesCurriculares
                .Select(perfil => new
                {
                    perfil.IdPerfilCurricular,
                    estado = "activo",
                    perfilesIngreso = perfil.PerfilesIngreso
                        .Select(item => new
                        {
                            item.IdPerfilIngreso,
                            item.Nombre,
                            item.Descripcion,
                            estado = "activo"
                        }),
                    perfilesEgreso = perfil.PerfilesEgreso
                        .Select(item => new
                        {
                            item.IdPerfilEgreso,
                            item.Nombre,
                            item.Descripcion,
                            estado = "activo"
                        })
                }),
            referenciasBibliograficas = plan.ReferenciasBibliograficas
                .Select(item => new
                {
                    item.IdReferenciaBibliograficaPlan,
                    item.Referencia,
                    item.FragmentoTextoAsociado,
                    estado = "activo"
                }),
            planesAbsorcion = plan.PlanesAbsorcion
                .Select(item => new
                {
                    item.IdPlanAbsorcion,
                    asignatura = new { item.IdAsignatura, item.Asignatura.NombreAsignatura },
                    equivalente = new { item.IdAsignaturaEquivalente, item.AsignaturaEquivalente.NombreAsignatura },
                    estado = "activo"
                }),
            matricesCambios = plan.MatricesCambios
                .Select(item => new
                {
                    item.IdMatrizCambios,
                    item.IdAsignatura,
                    nombreAsignatura = item.Asignatura == null ? null : item.Asignatura.NombreAsignatura,
                    item.Cambio,
                    item.PlanVigente,
                    item.PlanActualizado,
                    item.Justificacion,
                    estado = "activo"
                }),
            matricesCongruencia = plan.MatricesCongruencia
                .Select(matriz => new
                {
                    matriz.IdMatrizCongruencia,
                    matriz.IdObjetivoCarrera,
                    matriz.CompetenciaDiagnostico,
                    estado = "activo",
                    asignaturas = matriz.Asignaturas
                        .Select(relacion => new
                        {
                            relacion.IdAsignatura,
                            relacion.Asignatura.NombreAsignatura,
                            estado = "activo"
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
                (plan.EstadoPlan == null
                    || plan.EstadoPlan != EstadoPlanEstudio.Desactivado)
                && plan.Carrera.EstadoRegistro == EstadoRegistro.Activo
                && plan.Carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                && plan.Carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo);
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
        await db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private async Task<BadRequestObjectResult?> ValidarCarreraAsync(
        int idCarrera,
        CancellationToken cancellationToken)
    {
        if (!await db.Carreras.AnyAsync(
                carrera => carrera.IdCarrera == idCarrera
                    && carrera.EstadoRegistro == EstadoRegistro.Activo
                    && carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                    && carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo,
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
        await db.Entry(plan).Reference(entity => entity.Carrera).LoadAsync(cancellationToken);
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

}
