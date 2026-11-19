using System.ComponentModel.DataAnnotations;

namespace GestionCurricular.Api.Contracts;

public sealed class SedeRequest
{
    [Required, StringLength(200)]
    public string NombreSede { get; set; } = null!;

    [StringLength(255)]
    public string? Direccion { get; set; }

    [StringLength(30)]
    public string? Telefono { get; set; }
}

public sealed record SedeResponse(
    int IdSede,
    string NombreSede,
    string? Direccion,
    string? Telefono,
    string Estado,
    IReadOnlyList<FacultadResumenResponse> Facultades);

public sealed class FacultadRequest
{
    [Range(1, int.MaxValue)]
    public int IdSede { get; set; }

    [Required, StringLength(200)]
    public string NombreFacultad { get; set; } = null!;

    [StringLength(150)]
    public string? Decano { get; set; }

    [StringLength(200)]
    public string? DescripcionFacultad { get; set; }
}

public sealed record FacultadResumenResponse(
    int IdFacultad,
    string NombreFacultad,
    string? DescripcionFacultad,
    string Estado);

public sealed record FacultadResponse(
    int IdFacultad,
    int IdSede,
    string? NombreSede,
    string NombreFacultad,
    string? Decano,
    string? DescripcionFacultad,
    string Estado,
    IReadOnlyList<CarreraResumenResponse> Carreras,
    IReadOnlyList<UsuarioFacultadResponse> Usuarios);

public sealed class CarreraRequest
{
    [Range(1, int.MaxValue)]
    public int IdFacultad { get; set; }

    [Required, StringLength(200)]
    public string NombreCarrera { get; set; } = null!;

    public IReadOnlyList<int>? IdsAsignaturas { get; set; }
}

public sealed record CarreraResumenResponse(
    int IdCarrera,
    string NombreCarrera,
    string Estado);

public sealed record CarreraResponse(
    int IdCarrera,
    int IdFacultad,
    string? NombreFacultad,
    string NombreCarrera,
    string Estado,
    IReadOnlyList<PlanResumenResponse> PlanesEstudio,
    IReadOnlyList<AsignaturaCarreraResumenResponse> Asignaturas);

public sealed record PlanResumenResponse(
    int IdPlan,
    string CicloInicio,
    string CicloFin,
    string EstadoPlan);

public sealed record AsignaturaCarreraResumenResponse(
    int IdAsignatura,
    string CodigoAsignatura,
    string NombreAsignatura,
    string Estado,
    string EstadoRelacion);

public sealed record UsuarioFacultadResponse(
    int IdUsuario,
    string NombreCompleto,
    string Correo,
    string EstadoCuenta);
