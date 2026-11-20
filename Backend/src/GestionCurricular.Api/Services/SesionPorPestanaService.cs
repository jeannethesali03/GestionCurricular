using System.Collections.Concurrent;
using System.Security.Claims;
using System.Security.Cryptography;

namespace GestionCurricular.Api.Services;

public sealed class SesionPorPestanaService
{
    private static readonly TimeSpan DuracionSesion = TimeSpan.FromHours(8);
    private readonly ConcurrentDictionary<string, Sesion> _sesiones = new();

    public string Crear(string id, string nombre, string email, string rol)
    {
        var ahora = DateTimeOffset.UtcNow;
        foreach (var item in _sesiones)
        {
            if (item.Value.Expira <= ahora)
                _sesiones.TryRemove(item.Key, out _);
        }

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, id),
            new Claim(ClaimTypes.Sid, token),
            new Claim(ClaimTypes.Name, nombre),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, rol)
        };
        _sesiones[token] = new Sesion(
            new ClaimsPrincipal(new ClaimsIdentity(claims, "TabSession")),
            ahora.Add(DuracionSesion));
        return token;
    }

    public bool TryObtener(string token, out ClaimsPrincipal? principal)
    {
        principal = null;
        if (!_sesiones.TryGetValue(token, out var sesion))
            return false;

        if (sesion.Expira <= DateTimeOffset.UtcNow)
        {
            _sesiones.TryRemove(token, out _);
            return false;
        }

        principal = sesion.Principal;
        return true;
    }

    public void Revocar(string token) => _sesiones.TryRemove(token, out _);

    private sealed record Sesion(ClaimsPrincipal Principal, DateTimeOffset Expira);
}
