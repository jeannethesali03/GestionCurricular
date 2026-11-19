using GestionCurricular.Api.Contracts;

namespace GestionCurricular.Api.Services;

public interface IUsuariosService
{
    Task<IReadOnlyList<UsuarioResponse>> ObtenerTodosAsync(
        bool incluirInactivos,
        CancellationToken cancellationToken);

    Task<UsuarioResponse?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken);

    Task<DetalleUsuarioResponse?> ObtenerDetallesAsync(int id, CancellationToken cancellationToken);

    Task<CatalogosUsuarioResponse> ObtenerCatalogosAsync(CancellationToken cancellationToken);

    Task<UsuarioResponse> CrearAsync(
        CrearUsuarioRequest request,
        CancellationToken cancellationToken);

    Task<UsuarioResponse?> ActualizarAsync(
        int id,
        ActualizarUsuarioRequest request,
        CancellationToken cancellationToken);

    Task<bool> CambiarEstadoAsync(
        int id,
        bool activo,
        CancellationToken cancellationToken);

    Task<UsuarioResponse?> ActualizarPerfilAsync(
        int id,
        ActualizarPerfilUsuarioRequest request,
        CancellationToken cancellationToken);

    Task<bool> CambiarContrasenaAsync(
        int id,
        CambiarContrasenaUsuarioRequest request,
        CancellationToken cancellationToken);

    Task<SesionUsuarioResponse?> IniciarSesionAsync(
        IniciarSesionRequest request,
        CancellationToken cancellationToken);
}
