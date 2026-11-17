using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionCurricular.Domain.Entities;

public enum ModalidadAsignatura
{
    Presencial,
    Semipresencial,
    Nopresencial
}

public enum EstadoAsignatura
{
    Activo,
    Inactivo
}

[Table("Asignaturas")]
public class Asignatura
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_asignatura")]
    public int IdAsignatura { get; set; }

    [Required, MaxLength(100)]
    [Column("nombre_asignatura")]
    public string NombreAsignatura { get; set; } = null!;

    [Required, MaxLength(30)]
    [Column("codigo_asignatura")]
    public string CodigoAsignatura { get; set; } = null!;

    [Required, MaxLength(30)]
    [Column("area_formacion")]
    public string AreaFormacion { get; set; } = null!;

    [Column("numero_orden")]
    public int? NumeroOrden { get; set; }

    [Column("horas_ciclo")]
    public int HorasCiclo { get; set; }

    [Column("horas_semana")]
    public int HorasSemana { get; set; }

    [Column("horas_practicas")]
    public int HorasPracticas { get; set; }

    [Column("duracion_ciclo_semana")]
    public int DuracionCicloSemana { get; set; }

    [Column("duracion_hora_clase")]
    public int DuracionHoraClase { get; set; }

    [Column("unidades_valorativas")]
    public int UnidadesValorativas { get; set; }

    [Required, MaxLength(10)]
    [Column("ciclo_academico")]
    public string CicloAcademico { get; set; } = null!;

    [Column("modalidad", TypeName = "enum('presencial','semipresencial','nopresencial')")]
    public ModalidadAsignatura Modalidad { get; set; }

    [Column("estado_asignatura", TypeName = "enum('activo','inactivo')")]
    public EstadoAsignatura EstadoAsignatura { get; set; }

    [Column("descripcion_asignatura", TypeName = "mediumtext")]
    public string? DescripcionAsignatura { get; set; }

    [Column("estrategia_metodologica", TypeName = "mediumtext")]
    public string? EstrategiaMetodologica { get; set; }

    [Column("evaluacion", TypeName = "mediumtext")]
    public string? Evaluacion { get; set; }

    [Column("fuentes_electronicas", TypeName = "mediumtext")]
    public string? FuentesElectronicas { get; set; }

    public ICollection<AsignaturaCarrera> Carreras { get; set; } = [];
    public ICollection<UsuarioParticipanteAsignatura> UsuariosParticipantes { get; set; } = [];
    public ICollection<UnidadDidactica> UnidadesDidacticas { get; set; } = [];
    public ICollection<ObjetivoAsignatura> Objetivos { get; set; } = [];
    public ICollection<TematicaLey> TematicasLey { get; set; } = [];
    public ICollection<ReferenciaBibliograficaAsignatura> ReferenciasBibliograficas { get; set; } = [];
    public ICollection<PrerrequisitoAsignatura> ComoAsignatura { get; set; } = [];
    public ICollection<PrerrequisitoAsignatura> ComoPrerrequisito { get; set; } = [];
    public ICollection<PlanAbsorcion> PlanesAbsorcion { get; set; } = [];
    public ICollection<PlanAbsorcion> PlanesAbsorcionEquivalentes { get; set; } = [];
    public ICollection<MatrizCambio> MatricesCambios { get; set; } = [];
    public ICollection<MatrizCongruenciaAsignatura> MatricesCongruencia { get; set; } = [];
}

[Table("Asignatura_carrera")]
public class AsignaturaCarrera
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_asignatura_carrera")]
    public int IdAsignaturaCarrera { get; set; }

    [Column("id_carrera")]
    public int IdCarrera { get; set; }

    [Column("id_asignatura")]
    public int IdAsignatura { get; set; }

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public Carrera Carrera { get; set; } = null!;
    public Asignatura Asignatura { get; set; } = null!;
}

[Table("Usuarios_participantes_asignatura")]
public class UsuarioParticipanteAsignatura
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_usuario_participante_asignatura")]
    public int IdUsuarioParticipanteAsignatura { get; set; }

    [Column("id_asignatura")]
    public int IdAsignatura { get; set; }

    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public Asignatura Asignatura { get; set; } = null!;
    public Usuario Usuario { get; set; } = null!;
}

[Table("Unidades_didacticas")]
public class UnidadDidactica
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_unidades_didacticas")]
    public int IdUnidadDidactica { get; set; }

    [Column("id_asignatura")]
    public int IdAsignatura { get; set; }

    [Required, MaxLength(100)]
    [Column("nombre")]
    public string Nombre { get; set; } = null!;

    [Required, MaxLength(500)]
    [Column("objetivo")]
    public string Objetivo { get; set; } = null!;

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public Asignatura Asignatura { get; set; } = null!;
    public ICollection<Contenido> Contenidos { get; set; } = [];
}

[Table("Contenidos")]
public class Contenido
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_contenidos")]
    public int IdContenido { get; set; }

    [Column("id_unidades_didacticas")]
    public int IdUnidadDidactica { get; set; }

    [Required, MaxLength(100)]
    [Column("nombre")]
    public string Nombre { get; set; } = null!;

    [Column("descripcion", TypeName = "mediumtext")]
    public string? Descripcion { get; set; }

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public UnidadDidactica UnidadDidactica { get; set; } = null!;
}

[Table("Objetivos_asignatura")]
public class ObjetivoAsignatura
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_objetivo_asignatura")]
    public int IdObjetivoAsignatura { get; set; }

    [Column("id_asignatura")]
    public int IdAsignatura { get; set; }

    [Column("tipo_objetivo", TypeName = "enum('general','especifico')")]
    public TipoObjetivo TipoObjetivo { get; set; }

    [Required]
    [Column("descripcion_objetivo", TypeName = "mediumtext")]
    public string DescripcionObjetivo { get; set; } = null!;

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public Asignatura Asignatura { get; set; } = null!;
}

[Table("Tematica_ley")]
public class TematicaLey
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_tematica_ley")]
    public int IdTematicaLey { get; set; }

    [Column("id_asignatura")]
    public int? IdAsignatura { get; set; }

    [Column("nombre", TypeName = "mediumtext")]
    public string? Nombre { get; set; }

    [Column("legislacion", TypeName = "mediumtext")]
    public string? Legislacion { get; set; }

    [Column("otras_estrategias", TypeName = "mediumtext")]
    public string? OtrasEstrategias { get; set; }

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public Asignatura? Asignatura { get; set; }
}

[Table("Referencias_bibliograficas_asignatura")]
public class ReferenciaBibliograficaAsignatura
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_referencia_bibliografica_asignatura")]
    public int IdReferenciaBibliograficaAsignatura { get; set; }

    [Column("id_asignatura")]
    public int IdAsignatura { get; set; }

    [Required]
    [Column("referencia", TypeName = "mediumtext")]
    public string Referencia { get; set; } = null!;

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public Asignatura Asignatura { get; set; } = null!;
}

[Table("Prerrequisitos_asignatura")]
public class PrerrequisitoAsignatura
{
    [Column("id_prerrequisito_asignatura")]
    public int IdPrerrequisitoAsignatura { get; set; }

    [Column("id_asignatura")]
    public int IdAsignatura { get; set; }

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public Asignatura Asignatura { get; set; } = null!;
    public Asignatura Prerrequisito { get; set; } = null!;
}

[Table("Plan_absorcion")]
public class PlanAbsorcion
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_plan_absorcion")]
    public int IdPlanAbsorcion { get; set; }

    [Column("id_asignatura")]
    public int IdAsignatura { get; set; }

    [Column("id_asignatura_equivalente")]
    public int IdAsignaturaEquivalente { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public Asignatura Asignatura { get; set; } = null!;
    public Asignatura AsignaturaEquivalente { get; set; } = null!;
    public PlanEstudio PlanEstudio { get; set; } = null!;
}
