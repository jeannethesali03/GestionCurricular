using System.ComponentModel.DataAnnotations;

namespace GestionCurricular.Api.Contracts;

/// <summary>Posición curricular de una asignatura dentro de un plan de estudio.</summary>
public sealed record ActualizarPlanAsignaturaRequest
{
    [Range(1, int.MaxValue)]
    public int NumeroCiclo { get; init; }

    [Range(1, int.MaxValue)]
    public int NumeroOrden { get; init; }
}

/// <summary>Asignatura vinculada a un plan con su ciclo y orden propios.</summary>
public sealed record PlanAsignaturaResponse(
    int IdAsignatura,
    string CodigoAsignatura,
    string NombreAsignatura,
    string AreaFormacion,
    int UnidadesValorativas,
    int NumeroCiclo,
    int NumeroOrden,
    int SeccionesCompletas,
    int SeccionesTotal);

/// <summary>Asignatura activa de la carrera que todavía puede vincularse a un plan.</summary>
public sealed record AsignaturaPlanOpcionResponse(
    int IdAsignatura,
    string CodigoAsignatura,
    string NombreAsignatura,
    string AreaFormacion,
    int UnidadesValorativas);

/// <summary>Plan y asignaturas relacionadas para la edición de su estructura curricular.</summary>
public sealed record AsignaturasDePlanResponse(
    int IdPlan,
    int IdCarrera,
    string NombreCarrera,
    string CicloInicio,
    string CicloFin,
    IReadOnlyList<AsignaturaPlanOpcionResponse> OpcionesAsignaturas,
    IReadOnlyList<PlanAsignaturaResponse> Asignaturas);
