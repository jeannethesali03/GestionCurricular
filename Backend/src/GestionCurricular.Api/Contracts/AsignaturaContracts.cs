using System.ComponentModel.DataAnnotations;

namespace GestionCurricular.Api.Contracts;

public sealed class AsignaturaRequest
{
    [Required, StringLength(100)]
    public string NombreAsignatura { get; set; } = null!;

    [Required, StringLength(30)]
    public string CodigoAsignatura { get; set; } = null!;

    [Required, StringLength(30)]
    public string AreaFormacion { get; set; } = null!;

    [Range(1, int.MaxValue)]
    public int? NumeroOrden { get; set; }

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

    [Required, StringLength(10)]
    public string CicloAcademico { get; set; } = null!;

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
    int? NumeroOrden,
    int HorasCiclo,
    int HorasSemana,
    int HorasPracticas,
    int DuracionCicloSemana,
    int DuracionHoraClase,
    int UnidadesValorativas,
    string CicloAcademico,
    string Modalidad,
    string Estado,
    string? DescripcionAsignatura,
    string? EstrategiaMetodologica,
    string? Evaluacion,
    string? FuentesElectronicas);
