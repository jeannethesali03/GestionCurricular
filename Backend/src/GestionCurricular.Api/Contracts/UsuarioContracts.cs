using System.ComponentModel.DataAnnotations;

namespace GestionCurricular.Api.Contracts;

public class UsuarioDatosRequest
{
    [Range(1, int.MaxValue)]
    public int IdRol { get; set; }

    [Range(1, int.MaxValue)]
    public int? IdFacultad { get; set; }

    [Required, StringLength(50)]
    public string Usuario { get; set; } = null!;

    [Required, StringLength(150)]
    public string NombreCompleto { get; set; } = null!;

    [Required, StringLength(150)]
    public string GradoAcademico { get; set; } = null!;

    [Range(0, int.MaxValue)]
    public int ExperienciaEducacionSuperior { get; set; }

    [Required, EmailAddress, StringLength(100)]
    public string Correo { get; set; } = null!;
}

public sealed class CrearUsuarioRequest : UsuarioDatosRequest
{
    [Required, MinLength(8), MaxLength(128)]
    public string Password { get; set; } = null!;
}

public sealed class ActualizarUsuarioRequest : UsuarioDatosRequest
{
    [MinLength(8), MaxLength(128)]
    public string? Password { get; set; }
}

public sealed record UsuarioResponse(
    int IdUsuario,
    int IdRol,
    string? NombreRol,
    int? IdFacultad,
    string? NombreFacultad,
    string Usuario,
    string NombreCompleto,
    string GradoAcademico,
    int ExperienciaEducacionSuperior,
    string Correo,
    string EstadoCuenta,
    DateTime? FechaRegistro,
    DateTime? UltimoAcceso);
