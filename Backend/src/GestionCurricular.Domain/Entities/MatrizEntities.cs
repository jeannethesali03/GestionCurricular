using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionCurricular.Domain.Entities;

[Table("Matriz_cambios")]
public class MatrizCambio
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_matriz_cambios")]
    public int IdMatrizCambios { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("id_asignatura")]
    public int? IdAsignatura { get; set; }

    [Column("cambio", TypeName = "mediumtext")]
    public string? Cambio { get; set; }

    [Column("plan_vigente", TypeName = "mediumtext")]
    public string? PlanVigente { get; set; }

    [Column("plan_actualizado", TypeName = "mediumtext")]
    public string? PlanActualizado { get; set; }

    [Column("justificacion", TypeName = "mediumtext")]
    public string? Justificacion { get; set; }

    public PlanEstudio PlanEstudio { get; set; } = null!;
    public Asignatura? Asignatura { get; set; }
}

[Table("Matriz_congruencia")]
public class MatrizCongruencia
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_matriz_congruencia")]
    public int IdMatrizCongruencia { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("id_objetivo_carrera")]
    public int IdObjetivoCarrera { get; set; }

    [Required]
    [Column("competencia_diagnostico", TypeName = "mediumtext")]
    public string CompetenciaDiagnostico { get; set; } = null!;

    public PlanEstudio PlanEstudio { get; set; } = null!;
    public ObjetivoCarrera ObjetivoCarrera { get; set; } = null!;
    public ICollection<MatrizCongruenciaAsignatura> Asignaturas { get; set; } = [];
}

[Table("Matriz_congruencia_asignatura")]
public class MatrizCongruenciaAsignatura
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_matriz_congruencia_asignatura")]
    public int IdMatrizCongruenciaAsignatura { get; set; }

    [Column("id_matriz_congruencia")]
    public int IdMatrizCongruencia { get; set; }

    [Column("id_asignatura")]
    public int IdAsignatura { get; set; }

    public MatrizCongruencia MatrizCongruencia { get; set; } = null!;
    public Asignatura Asignatura { get; set; } = null!;
}
