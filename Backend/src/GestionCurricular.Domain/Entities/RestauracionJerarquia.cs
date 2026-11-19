using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionCurricular.Domain.Entities;

[Table("Restauraciones_jerarquia")]
public class RestauracionJerarquia
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Column("id_restauracion")]
    public int IdRestauracion { get; set; }

    [Required, MaxLength(20)]
    [Column("tipo_raiz")]
    public string TipoRaiz { get; set; } = null!;

    [Column("id_raiz")]
    public int IdRaiz { get; set; }

    [Required, MaxLength(20)]
    [Column("tipo_entidad")]
    public string TipoEntidad { get; set; } = null!;

    [Column("id_entidad")]
    public int IdEntidad { get; set; }

    [Required, MaxLength(32)]
    [Column("estado_previo")]
    public string EstadoPrevio { get; set; } = null!;
}
