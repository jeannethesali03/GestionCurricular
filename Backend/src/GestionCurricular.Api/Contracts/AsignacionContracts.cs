using System.ComponentModel.DataAnnotations;

namespace GestionCurricular.Api.Contracts;

/// <summary>Relaciones de planes y asignaturas que se otorgarán a usuarios estándar.</summary>
public sealed record CrearAsignacionesRequest
{
    [Required, MinLength(1)]
    public required IReadOnlyList<int> IdsUsuarios { get; init; }

    [Required]
    public required IReadOnlyList<int> IdsPlanes { get; init; }

    [Required]
    public required IReadOnlyList<int> IdsAsignaturas { get; init; }
}

/// <summary>Usuario estándar disponible para recibir asignaciones.</summary>
public sealed record UsuarioAsignacionOpcionResponse(
    int IdUsuario,
    string NombreCompleto,
    string Correo,
    int IdFacultad,
    string NombreFacultad);

/// <summary>Plan disponible para asignar a un usuario estándar.</summary>
public sealed record PlanAsignacionOpcionResponse(
    int IdPlan,
    string CicloInicio,
    string CicloFin,
    string NombreCarrera,
    int IdFacultad,
    string NombreFacultad);

/// <summary>Asignatura disponible para asignar directamente.</summary>
public sealed record AsignaturaAsignacionOpcionResponse(
    int IdAsignatura,
    string CodigoAsignatura,
    string NombreAsignatura,
    int IdFacultad,
    string NombreFacultad);

/// <summary>Facultad disponible como filtro para asignaciones institucionales.</summary>
public sealed record FacultadAsignacionOpcionResponse(int IdFacultad, string NombreFacultad);

/// <summary>Catálogos disponibles en la pantalla de asignaciones.</summary>
public sealed record AsignacionesOpcionesResponse(
    IReadOnlyList<FacultadAsignacionOpcionResponse> Facultades,
    IReadOnlyList<UsuarioAsignacionOpcionResponse> Usuarios,
    IReadOnlyList<PlanAsignacionOpcionResponse> Planes,
    IReadOnlyList<AsignaturaAsignacionOpcionResponse> Asignaturas);
