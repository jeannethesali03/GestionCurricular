using System.Security.Claims;
using GestionCurricular.Api.Services;

namespace GestionCurricular.Tests;

public sealed class SesionPorPestanaServiceTests
{
    [Fact]
    public void SesionesDePestanasSonIndependientesYRevocables()
    {
        var sesiones = new SesionPorPestanaService();
        var tokenA = sesiones.Crear("1", "Usuario A", "a@example.com", "USUARIO");
        var tokenB = sesiones.Crear("2", "Usuario B", "b@example.com", "USUARIO");

        Assert.NotEqual(tokenA, tokenB);
        Assert.True(sesiones.TryObtener(tokenA, out var principalA));
        Assert.True(sesiones.TryObtener(tokenB, out var principalB));
        Assert.Equal("1", principalA!.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.Equal("2", principalB!.FindFirstValue(ClaimTypes.NameIdentifier));

        sesiones.Revocar(tokenA);

        Assert.False(sesiones.TryObtener(tokenA, out _));
        Assert.True(sesiones.TryObtener(tokenB, out _));
    }
}
