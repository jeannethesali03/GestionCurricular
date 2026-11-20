using GestionCurricular.Api.Contracts;
using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using GestionCurricular.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GestionCurricular.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/asignaturas")]
public sealed partial class AsignaturasController(GestionCurricularDbContext db) : ControllerBase
{
    [HttpGet("{id:int}/detalles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObtenerDetalles(
        int id,
        [FromQuery] bool incluirInactivos = false,
        CancellationToken cancellationToken = default)
    {
        var usuario = await ObtenerUsuarioActualAsync(cancellationToken);
        if (usuario is null) return Unauthorized();
        if (!await PuedeVerAsync(usuario, id, cancellationToken)) return Forbid();

        var asignatura = await db.Asignaturas
            .AsNoTracking()
            .AsSplitQuery()
            .Include(entity => entity.Carreras).ThenInclude(relacion => relacion.Carrera)
                .ThenInclude(carrera => carrera.Facultad).ThenInclude(facultad => facultad.Sede)
            .Include(entity => entity.UsuariosParticipantes).ThenInclude(relacion => relacion.Usuario)
            .Include(entity => entity.UnidadesDidacticas).ThenInclude(unidad => unidad.Contenidos)
            .Include(entity => entity.Objetivos)
            .Include(entity => entity.TematicasLey)
            .Include(entity => entity.ReferenciasBibliograficas)
            .Include(entity => entity.FuentesElectronicas)
            .Include(entity => entity.PrerrequisitosNoAsignatura)
            .Include(entity => entity.ComoAsignatura).ThenInclude(relacion => relacion.Prerrequisito)
            .Include(entity => entity.ComoPrerrequisito).ThenInclude(relacion => relacion.Asignatura)
            .Include(entity => entity.PlanesAbsorcion).ThenInclude(relacion => relacion.PlanEstudio)
            .Include(entity => entity.PlanesAbsorcionEquivalentes).ThenInclude(relacion => relacion.PlanEstudio)
            .Include(entity => entity.MatricesCambios)
            .Include(entity => entity.MatricesCongruencia)
            .Include(entity => entity.Carreras).ThenInclude(relacion => relacion.Carrera)
                .ThenInclude(carrera => carrera.Facultad).ThenInclude(facultad => facultad.Sede)
            .FirstOrDefaultAsync(entity => entity.IdAsignatura == id, cancellationToken);

        if (asignatura is null)
        {
            return NotFound();
        }

        return Ok(new
        {
            asignatura = await ConvertirRespuestaAsync(asignatura, usuario.IdUsuario, cancellationToken),
            estado = asignatura.EstadoAsignatura == EstadoAsignatura.Activo ? "activo" : "inactivo",
            planes = await ObtenerPlanesAsync(id, cancellationToken),
            carreras = asignatura.Carreras
                .Select(relacion => new
                {
                    relacion.IdAsignaturaCarrera,
                    relacion.IdCarrera,
                    relacion.Carrera.NombreCarrera,
                    estado = "activo"
                }),
            participantes = asignatura.UsuariosParticipantes
                .Select(relacion => new
                {
                    relacion.IdUsuarioParticipanteAsignatura,
                    relacion.IdUsuario,
                    relacion.Usuario.Correo,
                    relacion.Usuario.NombreCompleto,
                    estado = "activo"
                }),
            unidadesDidacticas = asignatura.UnidadesDidacticas
                .OrderBy(unidad => unidad.IdUnidadDidactica)
                .Select(unidad => new
                {
                    unidad.IdUnidadDidactica,
                    unidad.Nombre,
                    unidad.Objetivo,
                    estado = "activo",
                    contenidos = unidad.Contenidos
                        .OrderBy(contenido => contenido.IdContenido)
                        .Select(contenido => new
                        {
                            contenido.IdContenido,
                            contenido.Nombre,
                            contenido.Descripcion,
                            estado = "activo"
                        })
                }),
            objetivos = asignatura.Objetivos
                .OrderBy(item => item.IdObjetivoAsignatura)
                .Select(item => new
                {
                    item.IdObjetivoAsignatura,
                    tipo = item.TipoObjetivo == TipoObjetivo.General ? "general" : "especifico",
                    item.DescripcionObjetivo,
                    estado = "activo"
                }),
            tematicasLey = asignatura.TematicasLey
                .Select(item => new
                {
                    item.IdTematicaLey,
                    item.Nombre,
                    item.Legislacion,
                    item.OtrasEstrategias,
                    estado = "activo"
                }),
            referenciasBibliograficas = asignatura.ReferenciasBibliograficas
                .OrderBy(item => item.IdReferenciaBibliograficaAsignatura)
                .Select(item => new
                {
                    item.IdReferenciaBibliograficaAsignatura,
                    item.Referencia,
                    estado = "activo"
                }),
            fuentesElectronicas = asignatura.FuentesElectronicas
                .OrderBy(item => item.IdFuenteElectronicaAsignatura)
                .Select(item => new
            {
                item.IdFuenteElectronicaAsignatura,
                item.Referencia
            }),
            prerrequisitosNoAsignatura = asignatura.PrerrequisitosNoAsignatura.Select(item => new
            {
                item.IdPrerrequisitoNoAsignatura,
                item.Nombre
                }),
            asignaturasQueRequierenComoPrerrequisito = asignatura.ComoPrerrequisito
                .Select(item => new
                {
                    item.IdAsignatura,
                    item.Asignatura.NombreAsignatura,
                    estado = "activo"
                }),
            prerrequisitos = asignatura.ComoAsignatura
                .Select(item => new
                {
                    item.IdPrerrequisitoAsignatura,
                    idPrerrequisito = item.IdPrerrequisitoAsignatura,
                    item.Prerrequisito.NombreAsignatura,
                    estado = "activo"
                }),
            planesAbsorcion = asignatura.PlanesAbsorcion
                .Select(item => new
                {
                    item.IdPlanAbsorcion,
                    item.IdAsignaturaEquivalente,
                    item.PlanEstudio.CicloInicio,
                    item.PlanEstudio.CicloFin,
                    estado = "activo"
                }),
            planesAbsorcionComoEquivalente = asignatura.PlanesAbsorcionEquivalentes
                .Select(item => new
                {
                    item.IdPlanAbsorcion,
                    item.IdAsignatura,
                    item.PlanEstudio.CicloInicio,
                    item.PlanEstudio.CicloFin,
                    estado = "activo"
                }),
            matricesCambios = asignatura.MatricesCambios
                .Select(item => new
                {
                    item.IdMatrizCambios,
                    item.IdPlan,
                    item.Cambio,
                    item.PlanVigente,
                    item.PlanActualizado,
                    item.Justificacion,
                    estado = "activo"
                }),
            matricesCongruencia = asignatura.MatricesCongruencia
                .Select(item => new
                {
                    item.IdMatrizCongruenciaAsignatura,
                    item.IdMatrizCongruencia,
                    estado = "activo"
                })
        });
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AsignaturaResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AsignaturaResponse>>> ObtenerTodas(
        [FromQuery] bool incluirInactivas = false,
        CancellationToken cancellationToken = default)
    {
        var usuario = await ObtenerUsuarioActualAsync(cancellationToken);
        if (usuario is null) return Unauthorized();

        var query = db.Asignaturas.AsNoTracking().AsQueryable();
        if (!incluirInactivas)
        {
            query = query.Where(asignatura =>
                asignatura.EstadoAsignatura == EstadoAsignatura.Activo
                && (!asignatura.Carreras.Any()
                    || asignatura.Carreras.Any(relacion =>
                        relacion.Carrera.EstadoRegistro == EstadoRegistro.Activo
                        && relacion.Carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                        && relacion.Carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo)));
        }

        query = AplicarAlcance(query, usuario);
        var asignaturas = await query
            .AsSplitQuery()
            .Include(asignatura => asignatura.FuentesElectronicas)
            .Include(asignatura => asignatura.Carreras).ThenInclude(relacion => relacion.Carrera)
                .ThenInclude(carrera => carrera.Facultad).ThenInclude(facultad => facultad.Sede)
            .Include(asignatura => asignatura.UsuariosParticipantes).ThenInclude(relacion => relacion.Usuario)
            .Include(asignatura => asignatura.Objetivos)
            .Include(asignatura => asignatura.UnidadesDidacticas)
            .Include(asignatura => asignatura.ReferenciasBibliograficas)
            .OrderBy(asignatura => asignatura.IdAsignatura)
            .ToListAsync(cancellationToken);

        var idsDirectos = new HashSet<int>();
        var idsPorPlan = new HashSet<int>();
        if (EsUsuarioEstandar(usuario))
        {
            idsDirectos = await db.UsuariosParticipantesAsignatura.AsNoTracking()
                .Where(relacion => relacion.IdUsuario == usuario.IdUsuario)
                .Select(relacion => relacion.IdAsignatura)
                .ToHashSetAsync(cancellationToken);
            idsPorPlan = await ObtenerIdsAsignadosPorPlanAsync(usuario.IdUsuario, cancellationToken);
        }

        return Ok(asignaturas.Select(asignatura =>
            ConvertirRespuesta(asignatura,
                idsPorPlan.Contains(asignatura.IdAsignatura),
                idsDirectos.Contains(asignatura.IdAsignatura))).ToList());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(AsignaturaResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AsignaturaResponse>> ObtenerPorId(
        int id,
        CancellationToken cancellationToken)
    {
        var usuario = await ObtenerUsuarioActualAsync(cancellationToken);
        if (usuario is null) return Unauthorized();
        if (!await PuedeVerAsync(usuario, id, cancellationToken)) return Forbid();

        var asignatura = await db.Asignaturas
            .AsNoTracking()
            .Include(entity => entity.FuentesElectronicas)
            .Include(entity => entity.Carreras).ThenInclude(relacion => relacion.Carrera)
                .ThenInclude(carrera => carrera.Facultad).ThenInclude(facultad => facultad.Sede)
            .Include(entity => entity.UsuariosParticipantes).ThenInclude(relacion => relacion.Usuario)
            .Include(entity => entity.Objetivos)
            .Include(entity => entity.UnidadesDidacticas)
            .Include(entity => entity.ReferenciasBibliograficas)
            .FirstOrDefaultAsync(entity => entity.IdAsignatura == id, cancellationToken);

        return asignatura is null
            ? NotFound()
            : Ok(await ConvertirRespuestaAsync(asignatura, usuario.IdUsuario, cancellationToken));
    }

    [HttpPost]
    [ProducesResponseType(typeof(AsignaturaResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AsignaturaResponse>> Crear(
        AsignaturaRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await ObtenerUsuarioActualAsync(cancellationToken);
        if (usuario is null) return Unauthorized();
        if (!EsSuperUsuario(usuario) && !EsAdministrador(usuario)) return Forbid();
        if (!request.IdCarrera.HasValue
            || !await CarreraPermitidaAsync(usuario, request.IdCarrera.Value, cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "La carrera indicada no existe, está inactiva o no pertenece a su facultad.",
                Status = StatusCodes.Status400BadRequest
            });
        }
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
        var esSuperUsuario = EsSuperUsuario(usuario);
        if (request.IdPrerrequisitoAsignatura.HasValue
            && !await db.Asignaturas.AnyAsync(item =>
                item.IdAsignatura == request.IdPrerrequisitoAsignatura
                && item.EstadoAsignatura == EstadoAsignatura.Activo
                && item.Carreras.Any(relacion =>
                    esSuperUsuario
                    || relacion.Carrera.IdFacultad == usuario.IdFacultad),
                cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "El prerrequisito seleccionado no existe o no está activo.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var validacion = ValidarModalidad(request.Modalidad);
        if (validacion is not null)
        {
            return validacion;
        }

        if (await db.Asignaturas.AnyAsync(
                item => item.CodigoAsignatura == request.CodigoAsignatura.Trim(),
                cancellationToken))
        {
            return Conflict(new ProblemDetails
            {
                Title = "El código ya está asignado a otra asignatura.",
                Status = StatusCodes.Status409Conflict
            });
        }

        var asignatura = new Asignatura
        {
            EstadoAsignatura = EstadoAsignatura.Activo
        };
        AplicarCambios(asignatura, request);
        ReemplazarFuentesElectronicas(asignatura, request.FuentesElectronicas);

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        db.Asignaturas.Add(asignatura);
        await db.SaveChangesAsync(cancellationToken);
        db.AsignaturasCarrera.Add(new AsignaturaCarrera
        {
            IdCarrera = request.IdCarrera.Value,
            IdAsignatura = asignatura.IdAsignatura
        });
        if (request.IdPrerrequisitoAsignatura.HasValue)
        {
            db.PrerrequisitosAsignatura.Add(new PrerrequisitoAsignatura
            {
                IdAsignatura = asignatura.IdAsignatura,
                IdPrerrequisitoAsignatura = request.IdPrerrequisitoAsignatura.Value
            });
        }
        if (!string.IsNullOrWhiteSpace(request.PrerrequisitoNoAsignatura))
        {
            db.PrerrequisitosNoAsignatura.Add(new PrerrequisitoNoAsignatura
            {
                IdAsignatura = asignatura.IdAsignatura,
                Nombre = request.PrerrequisitoNoAsignatura.Trim()
            });
        }
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return CreatedAtAction(
            nameof(ObtenerPorId),
            new { id = asignatura.IdAsignatura },
            await ObtenerRespuestaAsync(asignatura.IdAsignatura, usuario.IdUsuario, cancellationToken));
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
            .Include(entity => entity.FuentesElectronicas)
            .FirstOrDefaultAsync(entity => entity.IdAsignatura == id, cancellationToken);
        if (asignatura is null)
        {
            return NotFound();
        }

        var usuario = await ObtenerUsuarioActualAsync(cancellationToken);
        if (usuario is null) return Unauthorized();
        if (!await PuedeEditarAsync(usuario, id, cancellationToken)) return Forbid();

        if (asignatura.EstadoAsignatura == EstadoAsignatura.Inactivo)
        {
            return Conflict(new ProblemDetails
            {
                Title = "No se puede editar una asignatura desactivada. Actívela primero.",
                Status = StatusCodes.Status409Conflict
            });
        }
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
        var esSuperUsuario = EsSuperUsuario(usuario);
        if (request.IdPrerrequisitoAsignatura.HasValue
            && !await db.Asignaturas.AnyAsync(item =>
                item.IdAsignatura == request.IdPrerrequisitoAsignatura
                && item.IdAsignatura != id
                && item.EstadoAsignatura == EstadoAsignatura.Activo
                && item.Carreras.Any(relacion =>
                    esSuperUsuario
                    || relacion.Carrera.IdFacultad == usuario.IdFacultad),
                cancellationToken))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "El prerrequisito seleccionado no existe o no es válido para su facultad.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var validacion = ValidarModalidad(request.Modalidad);
        if (validacion is not null)
        {
            return validacion;
        }

        if (await db.Asignaturas.AnyAsync(
                item => item.IdAsignatura != id
                    && item.CodigoAsignatura == request.CodigoAsignatura.Trim(),
                cancellationToken))
        {
            return Conflict(new ProblemDetails
            {
                Title = "El código ya está asignado a otra asignatura.",
                Status = StatusCodes.Status409Conflict
            });
        }

        AplicarCambios(asignatura, request);
        ReemplazarFuentesElectronicas(asignatura, request.FuentesElectronicas);
        await db.SaveChangesAsync(cancellationToken);

        return Ok(await ObtenerRespuestaAsync(id, usuario.IdUsuario, cancellationToken));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Desactivar(
        int id,
        ConfirmarDesactivacionAsignaturaRequest request,
        [FromServices] IDesactivacionesUniversidadService desactivaciones,
        CancellationToken cancellationToken)
    {
        await desactivaciones.DesactivarAsync(
            "asignatura", id, ObtenerIdUsuarioActual(), request.Codigo, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:int}/codigo-desactivacion")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    public async Task<IActionResult> SolicitarCodigoDesactivacion(
        int id,
        [FromServices] IDesactivacionesUniversidadService desactivaciones,
        CancellationToken cancellationToken)
    {
        await desactivaciones.SolicitarCodigoAsync(
            "asignatura", id, ObtenerIdUsuarioActual(), cancellationToken);
        return Accepted();
    }

    [HttpPut("{id:int}/activar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Activar(
        int id,
        [FromServices] IDesactivacionesUniversidadService desactivaciones,
        CancellationToken cancellationToken)
    {
        await desactivaciones.ActivarAsync("asignatura", id, ObtenerIdUsuarioActual(), cancellationToken);
        return NoContent();
    }

    private int ObtenerIdUsuarioActual() =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var idUsuario)
            ? idUsuario
            : throw new UnauthorizedAccessException("La sesión autenticada no tiene un usuario válido.");

    private async Task<Usuario?> ObtenerUsuarioActualAsync(CancellationToken cancellationToken)
    {
        var idUsuario = ObtenerIdUsuarioActual();
        return await db.Usuarios.AsNoTracking()
            .Include(usuario => usuario.Rol)
            .FirstOrDefaultAsync(usuario =>
                usuario.IdUsuario == idUsuario
                && usuario.EstadoCuenta == EstadoCuenta.Activo,
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

    private static bool AreaFormacionValida(string areaFormacion) =>
        areaFormacion is "Humanísticas" or "Básicas" or "Técnica";

    private static void AplicarCambios(Asignatura asignatura, AsignaturaRequest request)
    {
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
            _ => throw new InvalidOperationException(
                $"Modalidad de asignatura no soportada: {request.Modalidad}.")
        };
        asignatura.DescripcionAsignatura = request.DescripcionAsignatura;
        asignatura.EstrategiaMetodologica = request.EstrategiaMetodologica;
        asignatura.Evaluacion = request.Evaluacion;
    }

    private static void ReemplazarFuentesElectronicas(
        Asignatura asignatura,
        string? fuenteElectronica)
    {
        asignatura.FuentesElectronicas.Clear();
        if (!string.IsNullOrWhiteSpace(fuenteElectronica))
        {
            asignatura.FuentesElectronicas.Add(new FuenteElectronicaAsignatura
            {
                Referencia = fuenteElectronica.Trim()
            });
        }
    }

    private static AsignaturaResponse ConvertirRespuesta(
        Asignatura asignatura,
        bool asignadaPorPlan = false,
        bool asignadaDirectamente = false)
    {
        var carrera = asignatura.Carreras.FirstOrDefault()?.Carrera;
        var seccionesCompletas = 1
            + (string.IsNullOrWhiteSpace(asignatura.DescripcionAsignatura) ? 0 : 1)
            + (asignatura.Objetivos.Any(item => item.TipoObjetivo == TipoObjetivo.General)
                && asignatura.Objetivos.Any(item => item.TipoObjetivo == TipoObjetivo.Especifico) ? 1 : 0)
            + (asignatura.UnidadesDidacticas.Count > 0 ? 1 : 0)
            + (string.IsNullOrWhiteSpace(asignatura.EstrategiaMetodologica) ? 0 : 1)
            + (string.IsNullOrWhiteSpace(asignatura.Evaluacion) ? 0 : 1)
            + (asignatura.ReferenciasBibliograficas.Count > 0
                && asignatura.FuentesElectronicas.Count > 0 ? 1 : 0);

        return new(
            asignatura.IdAsignatura,
            asignatura.NombreAsignatura,
            asignatura.CodigoAsignatura,
            asignatura.AreaFormacion,
            asignatura.HorasCiclo,
            asignatura.HorasSemana,
            asignatura.HorasPracticas,
            asignatura.DuracionCicloSemana,
            asignatura.DuracionHoraClase,
            asignatura.UnidadesValorativas,
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
            asignatura.FuentesElectronicas.FirstOrDefault()?.Referencia,
            carrera?.IdCarrera,
            carrera?.NombreCarrera,
            carrera?.Facultad.IdFacultad,
            carrera?.Facultad.NombreFacultad,
            carrera?.Facultad.Sede.IdSede,
            carrera?.Facultad.Sede.NombreSede,
            asignatura.UsuariosParticipantes.FirstOrDefault()?.Usuario.NombreCompleto,
            seccionesCompletas,
            7,
            asignadaPorPlan,
            asignadaDirectamente);
    }
}
