using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionCurricular.Domain.Entities;

public enum ModalidadPlanEstudio
{
    Presencial,
    Semipresencial,
    Virtual
}

public enum EstadoPlanEstudio
{
    Borrador,
    EnRevision,
    Aprobado,
    SalienteHistorico,
    Desactivado
}

public enum EstadoRegistro
{
    Activo,
    Inactivo
}

public enum TipoObjetivo
{
    General,
    Especifico
}

[Table("Planes_estudio")]
public class PlanEstudio
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("id_carrera")]
    public int IdCarrera { get; set; }

    [Column("modalidad", TypeName = "enum('presencial','semipresencial','virtual')")]
    public ModalidadPlanEstudio Modalidad { get; set; }

    [Required, MaxLength(20)]
    [Column("ciclo_inicio")]
    public string CicloInicio { get; set; } = null!;

    [Required, MaxLength(20)]
    [Column("ciclo_fin")]
    public string CicloFin { get; set; } = null!;

    [Column("fecha_aprobacion")]
    public DateTime? FechaAprobacion { get; set; }

    [Column("estado_plan", TypeName = "enum('borrador','en_revision','aprobado','saliente_historico','desactivado')")]
    public EstadoPlanEstudio? EstadoPlan { get; set; }

    [Column("imagen_pensum", TypeName = "mediumtext")]
    public string? ImagenPensum { get; set; }

    [Column("fundamentacion", TypeName = "mediumtext")]
    public string? Fundamentacion { get; set; }

    [Column("justificacion", TypeName = "mediumtext")]
    public string? Justificacion { get; set; }

    [Column("diagnostico", TypeName = "mediumtext")]
    public string? Diagnostico { get; set; }

    [Column("politicas_implementacion", TypeName = "mediumtext")]
    public string? PoliticasImplementacion { get; set; }

    [Column("titulo_otorgar", TypeName = "mediumtext")]
    public string? TituloOtorgar { get; set; }

    [Column("requisitos_ingreso", TypeName = "mediumtext")]
    public string? RequisitosIngreso { get; set; }

    [Column("requisitos_servicio_social", TypeName = "mediumtext")]
    public string? RequisitosServicioSocial { get; set; }

    [Column("requisitos_permanencia_graduacion", TypeName = "mediumtext")]
    public string? RequisitosPermanenciaGraduacionTexto { get; set; }

    [Column("asignaturas_ciclo_extraordinario", TypeName = "mediumtext")]
    public string? AsignaturasCicloExtraordinario { get; set; }

    [Column("ingresos_equivalencias_extranjero", TypeName = "mediumtext")]
    public string? IngresosEquivalenciasExtranjero { get; set; }

    [Column("equivalencia_creditos_uvs", TypeName = "mediumtext")]
    public string? EquivalenciaCreditosUvs { get; set; }

    [Column("politicas_absorcion", TypeName = "mediumtext")]
    public string? PoliticasAbsorcion { get; set; }

    [Column("servicio_social_practicas_profesionales", TypeName = "mediumtext")]
    public string? ServicioSocialPracticasProfesionales { get; set; }

    [Column("orientacion_metodologica", TypeName = "mediumtext")]
    public string? OrientacionMetodologicaTexto { get; set; }

    public Carrera Carrera { get; set; } = null!;
    public ICollection<UsuarioParticipantePlan> UsuariosParticipantes { get; set; } = [];
    public ICollection<ActividadesArea> ActividadesAreas { get; set; } = [];
    public ICollection<OrientacionMetodologica> OrientacionesMetodologicas { get; set; } = [];
    public ICollection<RequisitoPermanenciaGraduacion> RequisitosPermanenciaGraduacion { get; set; } = [];
    public ICollection<EvaluacionAprendizaje> EvaluacionesAprendizaje { get; set; } = [];
    public ICollection<ItemJustificacion> ItemsJustificacion { get; set; } = [];
    public ICollection<MaterialDidactico> MaterialesDidacticos { get; set; } = [];
    public ICollection<ObjetivoCarrera> ObjetivosCarrera { get; set; } = [];
    public ICollection<PerfilCurricular> PerfilesCurriculares { get; set; } = [];
    public ICollection<ReferenciaBibliograficaPlan> ReferenciasBibliograficas { get; set; } = [];
    public ICollection<PlanAbsorcion> PlanesAbsorcion { get; set; } = [];
    public ICollection<MatrizCambio> MatricesCambios { get; set; } = [];
    public ICollection<MatrizCongruencia> MatricesCongruencia { get; set; } = [];
}

[Table("Usuarios_participantes_plan")]
public class UsuarioParticipantePlan
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_usuario_participante_plan")]
    public int IdUsuarioParticipantePlan { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    public PlanEstudio PlanEstudio { get; set; } = null!;
    public Usuario Usuario { get; set; } = null!;
}

[Table("Actividades_areas")]
public class ActividadesArea
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_area")]
    public int IdArea { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("nombre_area", TypeName = "mediumtext")]
    public string? NombreArea { get; set; }

    public PlanEstudio PlanEstudio { get; set; } = null!;
    public ICollection<Actividad> Actividades { get; set; } = [];
}

[Table("Actividades")]
public class Actividad
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_actividades")]
    public int IdActividad { get; set; }

    [Column("id_area")]
    public int IdArea { get; set; }

    [Column("nombre_actividad", TypeName = "mediumtext")]
    public string? NombreActividad { get; set; }

    [MaxLength(20)]
    [Column("numero_actividad")]
    public string? NumeroActividad { get; set; }

    [Column("fecha_inicio")]
    public DateTime FechaInicio { get; set; }

    [Column("fecha_fin")]
    public DateTime FechaFin { get; set; }

    [Required]
    [Column("responsable_implementacion", TypeName = "mediumtext")]
    public string ResponsableImplementacion { get; set; } = null!;

    [Column("observacion", TypeName = "mediumtext")]
    public string? Observacion { get; set; }

    public ActividadesArea ActividadesArea { get; set; } = null!;
}

[Table("Orientaciones_metodologicas")]
public class OrientacionMetodologica
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_orientaciones_metodologicas")]
    public int IdOrientacionMetodologica { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("nombre", TypeName = "mediumtext")]
    public string? Nombre { get; set; }

    [Column("descripcion", TypeName = "mediumtext")]
    public string? Descripcion { get; set; }

    public PlanEstudio PlanEstudio { get; set; } = null!;
}

[Table("Requisitos_permanencia_graduacion")]
public class RequisitoPermanenciaGraduacion
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_requisitos_permanencia_graduacion")]
    public int IdRequisitoPermanenciaGraduacion { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("nombre", TypeName = "mediumtext")]
    public string? Nombre { get; set; }

    [Column("descripcion", TypeName = "mediumtext")]
    public string? Descripcion { get; set; }

    public PlanEstudio PlanEstudio { get; set; } = null!;
}

[Table("Evaluacion_aprendizaje")]
public class EvaluacionAprendizaje
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_evaluacion_aprendizaje")]
    public int IdEvaluacionAprendizaje { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("nombre", TypeName = "mediumtext")]
    public string? Nombre { get; set; }

    [Column("descripcion", TypeName = "mediumtext")]
    public string? Descripcion { get; set; }

    public PlanEstudio PlanEstudio { get; set; } = null!;
}

[Table("Items_justificacion")]
public class ItemJustificacion
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_items_justificacion")]
    public int IdItemJustificacion { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("nombre", TypeName = "mediumtext")]
    public string? Nombre { get; set; }

    [Column("descripcion", TypeName = "mediumtext")]
    public string? Descripcion { get; set; }

    public PlanEstudio PlanEstudio { get; set; } = null!;
}

[Table("Materiales_didacticos")]
public class MaterialDidactico
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_materiales_didacticos")]
    public int IdMaterialDidactico { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [MaxLength(150)]
    [Column("nombre")]
    public string? Nombre { get; set; }

    [Column("descripcion", TypeName = "mediumtext")]
    public string? Descripcion { get; set; }

    [Column("imagen", TypeName = "mediumtext")]
    public string? Imagen { get; set; }

    public PlanEstudio PlanEstudio { get; set; } = null!;
}

[Table("Objetivos_carrera")]
public class ObjetivoCarrera
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_objetivo_carrera")]
    public int IdObjetivoCarrera { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Column("tipo_objetivo", TypeName = "enum('general','especifico')")]
    public TipoObjetivo TipoObjetivo { get; set; }

    [Required]
    [Column("descripcion_objetivo", TypeName = "mediumtext")]
    public string DescripcionObjetivo { get; set; } = null!;

    public PlanEstudio PlanEstudio { get; set; } = null!;
    public ICollection<MatrizCongruencia> MatricesCongruencia { get; set; } = [];
}

[Table("Perfiles_curriculares")]
public class PerfilCurricular
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_perfil_curricular")]
    public int IdPerfilCurricular { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    public PlanEstudio PlanEstudio { get; set; } = null!;
    public ICollection<PerfilIngreso> PerfilesIngreso { get; set; } = [];
    public ICollection<PerfilEgreso> PerfilesEgreso { get; set; } = [];
}

[Table("Perfil_ingreso")]
public class PerfilIngreso
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_perfil_ingreso")]
    public int IdPerfilIngreso { get; set; }

    [Column("id_perfil_curricular")]
    public int IdPerfilCurricular { get; set; }

    [MaxLength(150)]
    [Column("nombre")]
    public string? Nombre { get; set; }

    [Required]
    [Column("descripcion", TypeName = "mediumtext")]
    public string Descripcion { get; set; } = null!;

    public PerfilCurricular PerfilCurricular { get; set; } = null!;
}

[Table("Perfil_egreso")]
public class PerfilEgreso
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_perfil_egreso")]
    public int IdPerfilEgreso { get; set; }

    [Column("id_perfil_curricular")]
    public int IdPerfilCurricular { get; set; }

    [MaxLength(150)]
    [Column("nombre")]
    public string? Nombre { get; set; }

    [Required]
    [Column("descripcion", TypeName = "mediumtext")]
    public string Descripcion { get; set; } = null!;

    public PerfilCurricular PerfilCurricular { get; set; } = null!;
}

[Table("Referencias_bibliograficas_plan")]
public class ReferenciaBibliograficaPlan
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_referencia_bibliografica_plan")]
    public int IdReferenciaBibliograficaPlan { get; set; }

    [Column("id_plan")]
    public int IdPlan { get; set; }

    [Required]
    [Column("referencia", TypeName = "mediumtext")]
    public string Referencia { get; set; } = null!;

    [Required]
    [Column("fragmento_texto_asociado", TypeName = "mediumtext")]
    public string FragmentoTextoAsociado { get; set; } = null!;

    public PlanEstudio PlanEstudio { get; set; } = null!;
}
