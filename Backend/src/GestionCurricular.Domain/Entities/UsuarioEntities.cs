using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionCurricular.Domain.Entities;

public enum EstadoCuenta
{
    Activo,
    Inactivo
}

public enum TipoTokenAutenticacion
{
    Activacion,
    Invitacion,
    ResetPassword
}

[Table("Usuarios")]
public class Usuario
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Column("id_rol")]
    public int IdRol { get; set; }

    [Column("id_facultad")]
    public int? IdFacultad { get; set; }

    [Required, MaxLength(50)]
    [Column("usuario")]
    public string NombreUsuario { get; set; } = null!;

    [Required, MaxLength(150)]
    [Column("nombre_completo")]
    public string NombreCompleto { get; set; } = null!;

    [Required, MaxLength(150)]
    [Column("grado_academico")]
    public string GradoAcademico { get; set; } = null!;

    [Column("experiencia_educacion_superior")]
    public int ExperienciaEducacionSuperior { get; set; }

    [Required, MaxLength(100)]
    [Column("correo")]
    public string Correo { get; set; } = null!;

    [Required, MaxLength(255)]
    [Column("password")]
    public string Password { get; set; } = null!;

    [Column("estado_cuenta", TypeName = "enum('activo','inactivo')")]
    public EstadoCuenta EstadoCuenta { get; set; }

    [Column("fecha_registro")]
    public DateTime? FechaRegistro { get; set; }

    [Column("ultimo_acceso")]
    public DateTime? UltimoAcceso { get; set; }

    public Rol Rol { get; set; } = null!;
    public Facultad? Facultad { get; set; }
    public ICollection<TokenAutenticacion> TokensAutenticacion { get; set; } = [];
    public ICollection<RegistroCambio> RegistrosCambios { get; set; } = [];
    public ICollection<UsuarioParticipantePlan> PlanesParticipados { get; set; } = [];
    public ICollection<UsuarioParticipanteAsignatura> AsignaturasParticipadas { get; set; } = [];
}

[Table("Tokens_autenticacion")]
public class TokenAutenticacion
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_token")]
    public int IdToken { get; set; }

    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Required, MaxLength(255)]
    [Column("token")]
    public string Token { get; set; } = null!;

    [Column("tipo_token", TypeName = "enum('activacion','invitacion','reset_password')")]
    public TipoTokenAutenticacion TipoToken { get; set; }

    [Column("expiracion")]
    public DateTime Expiracion { get; set; }

    [Column("consumido")]
    public bool? Consumido { get; set; }

    public Usuario Usuario { get; set; } = null!;
}

[Table("Registro_cambios")]
public class RegistroCambio
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_registro_cambio")]
    public int IdRegistroCambio { get; set; }

    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Required, MaxLength(200)]
    [Column("titulo_cambio")]
    public string TituloCambio { get; set; } = null!;

    [Column("detalle_cambio", TypeName = "mediumtext")]
    public string? DetalleCambio { get; set; }

    [Column("tipo_cambio", TypeName = "mediumtext")]
    public string? TipoCambio { get; set; }

    [Column("fecha_hora")]
    public DateTime FechaHora { get; set; }

    public Usuario Usuario { get; set; } = null!;
}
