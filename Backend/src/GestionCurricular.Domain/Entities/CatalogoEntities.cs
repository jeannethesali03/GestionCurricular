using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionCurricular.Domain.Entities;

[Table("Sede")]
public class Sede
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_sede")]
    public int IdSede { get; set; }

    [Required, MaxLength(200)]
    [Column("nombre_sede")]
    public string NombreSede { get; set; } = null!;

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public ICollection<Facultad> Facultades { get; set; } = [];
}

[Table("Facultad")]
public class Facultad
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_facultad")]
    public int IdFacultad { get; set; }

    [Column("id_sede")]
    public int IdSede { get; set; }

    [Required, MaxLength(200)]
    [Column("nombre_facultad")]
    public string NombreFacultad { get; set; } = null!;

    [MaxLength(200)]
    [Column("descripcion_facultad")]
    public string? DescripcionFacultad { get; set; }

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public Sede Sede { get; set; } = null!;
    public ICollection<Carrera> Carreras { get; set; } = [];
    public ICollection<Usuario> Usuarios { get; set; } = [];
}

[Table("Roles")]
public class Rol
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_rol")]
    public int IdRol { get; set; }

    [MaxLength(50)]
    [Column("nombre_rol")]
    public string? NombreRol { get; set; }

    [MaxLength(255)]
    [Column("descripcion")]
    public string? Descripcion { get; set; }

    public ICollection<Usuario> Usuarios { get; set; } = [];
}

[Table("Carreras")]
public class Carrera
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_carrera")]
    public int IdCarrera { get; set; }

    [Column("id_facultad")]
    public int IdFacultad { get; set; }

    [Required, MaxLength(200)]
    [Column("nombre_carrera")]
    public string NombreCarrera { get; set; } = null!;

    [Column("estado_registro", TypeName = "enum('activo','inactivo')")]
    public EstadoRegistro EstadoRegistro { get; set; }

    public Facultad Facultad { get; set; } = null!;
    public ICollection<PlanEstudio> PlanesEstudio { get; set; } = [];
    public ICollection<AsignaturaCarrera> AsignaturasCarrera { get; set; } = [];
}
