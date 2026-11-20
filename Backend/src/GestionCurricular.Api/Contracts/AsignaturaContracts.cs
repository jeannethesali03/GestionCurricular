using System.ComponentModel.DataAnnotations;

namespace GestionCurricular.Api.Contracts;

public sealed class AsignaturaRequest
{
    [Range(1, int.MaxValue)]
    public int? IdCarrera { get; set; }

    public int? IdPrerrequisitoAsignatura { get; set; }

    [StringLength(100)]
    public string? PrerrequisitoNoAsignatura { get; set; }

    [Required, StringLength(100)]
    public string NombreAsignatura { get; set; } = null!;

    [Required, StringLength(30)]
    public string CodigoAsignatura { get; set; } = null!;

    [Required, StringLength(30)]
    public string AreaFormacion { get; set; } = null!;

    [Range(0, int.MaxValue)]
    public int HorasCiclo { get; set; }

    [Range(0, int.MaxValue)]
    public int HorasSemana { get; set; }

    [Range(0, int.MaxValue)]
    public int HorasPracticas { get; set; }

    [Range(0, int.MaxValue)]
    public int DuracionCicloSemana { get; set; }

    [Range(0, int.MaxValue)]
    public int DuracionHoraClase { get; set; }

    [Range(0, int.MaxValue)]
    public int UnidadesValorativas { get; set; }

    [Required, RegularExpression("^(presencial|semipresencial|nopresencial)$")]
    public string Modalidad { get; set; } = null!;

    public string? DescripcionAsignatura { get; set; }
    public string? EstrategiaMetodologica { get; set; }
    public string? Evaluacion { get; set; }
    public string? FuentesElectronicas { get; set; }
}

public sealed record AsignaturaResponse(
    int IdAsignatura,
    string NombreAsignatura,
    string CodigoAsignatura,
    string AreaFormacion,
    int HorasCiclo,
    int HorasSemana,
    int HorasPracticas,
    int DuracionCicloSemana,
    int DuracionHoraClase,
    int UnidadesValorativas,
    string Modalidad,
    string Estado,
    string? DescripcionAsignatura,
    string? EstrategiaMetodologica,
    string? Evaluacion,
    string? FuentesElectronicas,
    int? IdCarrera,
    string? NombreCarrera,
    int? IdFacultad,
    string? NombreFacultad,
    int? IdSede,
    string? NombreSede,
    string? Responsable,
    int SeccionesCompletas,
    int SeccionesTotal,
    bool AsignadaPorPlan,
    bool AsignadaDirectamente);

public sealed record ActualizarGeneralidadesAsignaturaRequest
{
    [Required, StringLength(100)]
    public required string NombreAsignatura { get; init; }

    [Required, StringLength(30)]
    public required string CodigoAsignatura { get; init; }

    [Required, StringLength(30)]
    public required string AreaFormacion { get; init; }

    [Range(0, int.MaxValue)]
    public int HorasCiclo { get; init; }

    [Range(0, int.MaxValue)]
    public int HorasSemana { get; init; }

    [Range(0, int.MaxValue)]
    public int HorasPracticas { get; init; }

    [Range(0, int.MaxValue)]
    public int DuracionCicloSemana { get; init; }

    [Range(0, int.MaxValue)]
    public int DuracionHoraClase { get; init; }

    [Range(0, int.MaxValue)]
    public int UnidadesValorativas { get; init; }

    [Required, RegularExpression("^(presencial|semipresencial|nopresencial)$")]
    public required string Modalidad { get; init; }

    public int? IdPrerrequisitoAsignatura { get; init; }
    [StringLength(100)]
    public string? PrerrequisitoNoAsignatura { get; init; }
}

public sealed record ActualizarDescripcionAsignaturaRequest
{
    public string? DescripcionAsignatura { get; init; }
}

public sealed record ActualizarTextoAsignaturaRequest
{
    public string? Texto { get; init; }
}

public sealed record ObjetivosAsignaturaRequest
{
    [Required]
    public required string ObjetivoGeneral { get; init; }
    [Required, MinLength(1)]
    public required IReadOnlyList<string> ObjetivosEspecificos { get; init; }
}

public sealed record ContenidoUnidadAsignaturaRequest
{
    [Required]
    public required string Nombre { get; init; }
    public string? Descripcion { get; init; }
}

public sealed record UnidadAsignaturaRequest
{
    [Required, StringLength(100)]
    public required string Nombre { get; init; }
    [Required, StringLength(500)]
    public required string Objetivo { get; init; }
    [Required, MinLength(1)]
    public required IReadOnlyList<ContenidoUnidadAsignaturaRequest> Contenidos { get; init; }
}

public sealed record UnidadesAsignaturaRequest
{
    [Required, MinLength(1)]
    public required IReadOnlyList<UnidadAsignaturaRequest> Unidades { get; init; }
}

public sealed record ReferenciasAsignaturaRequest
{
    [Required, MinLength(1)]
    public required IReadOnlyList<string> ReferenciasBibliograficas { get; init; }
    [Required, MinLength(1)]
    public required IReadOnlyList<string> FuentesElectronicas { get; init; }
}

public sealed record ConfirmarDesactivacionAsignaturaRequest
{
    [Required, RegularExpression("^[0-9]{6}$")]
    public required string Codigo { get; init; }
}
