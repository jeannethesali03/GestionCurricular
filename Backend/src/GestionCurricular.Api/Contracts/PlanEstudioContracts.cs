using System.ComponentModel.DataAnnotations;

namespace GestionCurricular.Api.Contracts;

public sealed class PlanEstudioRequest
{
    [Required, Range(1, int.MaxValue)]
    public int IdCarrera { get; set; }

    [Required, RegularExpression("^(presencial|semipresencial|virtual)$")]
    public string Modalidad { get; set; } = null!;

    [Required, StringLength(20)]
    public string CicloInicio { get; set; } = null!;

    [Required, StringLength(20)]
    public string CicloFin { get; set; } = null!;

    public DateTime? FechaAprobacion { get; set; }

    [RegularExpression("^(borrador|en_revision|aprobado|saliente_historico)$")]
    public string? EstadoPlan { get; set; }

    public string? ImagenPensum { get; set; }
    public string? Fundamentacion { get; set; }
    public string? Justificacion { get; set; }
    public string? Diagnostico { get; set; }
    public string? PoliticasImplementacion { get; set; }
    public string? TituloOtorgar { get; set; }
    public string? RequisitosIngreso { get; set; }
    public string? RequisitosServicioSocial { get; set; }
    public string? RequisitosPermanenciaGraduacion { get; set; }
    public string? AsignaturasCicloExtraordinario { get; set; }
    public string? IngresosEquivalenciasExtranjero { get; set; }
    public string? EquivalenciaCreditosUvs { get; set; }
    public string? PoliticasAbsorcion { get; set; }
    public string? ServicioSocialPracticasProfesionales { get; set; }
    public string? OrientacionMetodologica { get; set; }
}

public sealed record PlanEstudioResponse(
    int IdPlan,
    int IdCarrera,
    string? NombreCarrera,
    string Modalidad,
    string CicloInicio,
    string CicloFin,
    DateTime? FechaAprobacion,
    string EstadoPlan,
    string? ImagenPensum,
    string? Fundamentacion,
    string? Justificacion,
    string? Diagnostico,
    string? PoliticasImplementacion,
    string? TituloOtorgar,
    string? RequisitosIngreso,
    string? RequisitosServicioSocial,
    string? RequisitosPermanenciaGraduacion,
    string? AsignaturasCicloExtraordinario,
    string? IngresosEquivalenciasExtranjero,
    string? EquivalenciaCreditosUvs,
    string? PoliticasAbsorcion,
    string? ServicioSocialPracticasProfesionales,
    string? OrientacionMetodologica);
