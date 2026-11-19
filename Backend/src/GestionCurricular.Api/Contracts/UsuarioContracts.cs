using System.ComponentModel.DataAnnotations;

namespace GestionCurricular.Api.Contracts;

/// <summary>Datos necesarios para registrar una cuenta de usuario.</summary>
public sealed record CrearUsuarioRequest
{
    [Range(1, int.MaxValue)]
    public int IdRol { get; init; }

    [Range(1, int.MaxValue)]
    public int? IdFacultad { get; init; }

    [Required, StringLength(150)]
    public required string NombreCompleto { get; init; }

    [Required, StringLength(150)]
    public required string GradoAcademico { get; init; }

    [Range(0, int.MaxValue)]
    public int ExperienciaEducacionSuperior { get; init; }

    [Required, EmailAddress, StringLength(100)]
    public required string Correo { get; init; }

    [Required, MinLength(8), MaxLength(128)]
    public required string Password { get; init; }
}

/// <summary>Datos modificables por un administrador para una cuenta.</summary>
public sealed record ActualizarUsuarioRequest
{
    [Range(1, int.MaxValue)]
    public int IdRol { get; init; }

    [Range(1, int.MaxValue)]
    public int? IdFacultad { get; init; }

    [Required, StringLength(150)]
    public required string NombreCompleto { get; init; }

    [Required, StringLength(150)]
    public required string GradoAcademico { get; init; }

    [Range(0, int.MaxValue)]
    public int ExperienciaEducacionSuperior { get; init; }

    [Required, EmailAddress, StringLength(100)]
    public required string Correo { get; init; }

    [MinLength(8), MaxLength(128)]
    public string? Password { get; init; }
}

/// <summary>Información pública de una cuenta, sin credenciales.</summary>
public sealed record UsuarioResponse(
    int IdUsuario,
    int IdRol,
    string? NombreRol,
    int? IdFacultad,
    string? NombreFacultad,
    string NombreCompleto,
    string GradoAcademico,
    int ExperienciaEducacionSuperior,
    string Correo,
    string EstadoCuenta,
    DateTimeOffset? FechaRegistro,
    DateTimeOffset? UltimoAcceso);

/// <summary>Rol que puede asignarse a una cuenta.</summary>
public sealed record RolUsuarioResponse(int IdRol, string NombreRol, string? Descripcion);

/// <summary>Facultad que puede asignarse a una cuenta.</summary>
public sealed record FacultadUsuarioResponse(int IdFacultad, string NombreFacultad);

/// <summary>Opciones vigentes para los formularios del módulo de usuarios.</summary>
public sealed record CatalogosUsuarioResponse(
    IReadOnlyList<RolUsuarioResponse> Roles,
    IReadOnlyList<FacultadUsuarioResponse> Facultades);

/// <summary>Plan de estudio relacionado con un usuario.</summary>
public sealed record PlanUsuarioResponse(
    int IdPlan,
    string NombreCarrera,
    string CicloInicio,
    string CicloFin,
    string EstadoPlan);

/// <summary>Asignatura relacionada con un usuario.</summary>
public sealed record AsignaturaUsuarioResponse(
    int IdAsignatura,
    string CodigoAsignatura,
    string NombreAsignatura,
    string CicloAcademico);

/// <summary>Registro de actividad realizado por un usuario.</summary>
public sealed record CambioUsuarioResponse(
    int IdRegistroCambio,
    string TituloCambio,
    string? DetalleCambio,
    string? TipoCambio,
    DateTimeOffset FechaHora);

/// <summary>Cuenta y datos relacionados para la vista de detalle.</summary>
public sealed record DetalleUsuarioResponse(
    UsuarioResponse Usuario,
    IReadOnlyList<PlanUsuarioResponse> PlanesAsignados,
    IReadOnlyList<AsignaturaUsuarioResponse> AsignaturasAsignadas,
    IReadOnlyList<CambioUsuarioResponse> HistorialCambios);

/// <summary>Datos personales y académicos editables por el titular.</summary>
public sealed record ActualizarPerfilUsuarioRequest
{
    [Required, StringLength(150)]
    public required string NombreCompleto { get; init; }

    [Required, StringLength(150)]
    public required string GradoAcademico { get; init; }

    [Range(0, int.MaxValue)]
    public int ExperienciaEducacionSuperior { get; init; }
}

/// <summary>Contraseña actual y nueva para cambiar las credenciales.</summary>
public sealed record CambiarContrasenaUsuarioRequest
{
    [Required, MaxLength(128)]
    public required string ContrasenaActual { get; init; }

    [Required, MinLength(8), MaxLength(128)]
    public required string NuevaContrasena { get; init; }
}

/// <summary>Credenciales para iniciar sesión.</summary>
public sealed record IniciarSesionRequest
{
    [Required, EmailAddress, StringLength(100)]
    public required string Correo { get; init; }

    [Required, MaxLength(128)]
    public required string Password { get; init; }
}

/// <summary>Usuario autenticado para inicializar la sesión del cliente.</summary>
public sealed record SesionUsuarioResponse(
    string Id,
    string Nombre,
    string Email,
    string Rol,
    int? FacultadId,
    string? FacultadNombre,
    string GradoAcademico,
    int ExperienciaEducacionSuperior);
