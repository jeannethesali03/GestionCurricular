namespace GestionCurricular.Api.Services;

public interface IDesactivacionesUniversidadService
{
    Task SolicitarCodigoAsync(
        string tipoEntidad,
        int idEntidad,
        int idUsuario,
        CancellationToken cancellationToken);

    Task DesactivarAsync(
        string tipoEntidad,
        int idEntidad,
        int idUsuario,
        string codigo,
        CancellationToken cancellationToken);

    Task ActivarAsync(
        string tipoEntidad,
        int idEntidad,
        int idUsuario,
        CancellationToken cancellationToken);
}
