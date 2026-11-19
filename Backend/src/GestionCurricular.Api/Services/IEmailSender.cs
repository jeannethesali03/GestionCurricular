namespace GestionCurricular.Api.Services;

public interface IEmailSender
{
    Task EnviarInvitacionAsync(
        string correo,
        string nombre,
        string token,
        CancellationToken cancellationToken);

    Task EnviarRestablecimientoContrasenaAsync(
        string correo,
        string nombre,
        string token,
        CancellationToken cancellationToken);

    Task EnviarCodigoDesactivacionAsync(
        string correo,
        string nombre,
        string codigo,
        string tipoEntidad,
        string nombreEntidad,
        CancellationToken cancellationToken);
}
