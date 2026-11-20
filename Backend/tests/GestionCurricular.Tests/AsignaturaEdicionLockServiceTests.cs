using GestionCurricular.Api.Services;

namespace GestionCurricular.Tests;

public sealed class AsignaturaEdicionLockServiceTests
{
    [Fact]
    public void BloqueaLaMismaVistaYAsignaturaPeroPermiteOtras()
    {
        var locks = new AsignaturaEdicionLockService();

        Assert.True(locks.Adquirir(10, "descripcion", "sesion-a", "Usuario A").Adquirido);

        var ocupado = locks.Adquirir(10, "descripcion", "sesion-b", "Usuario B");
        Assert.False(ocupado.Adquirido);
        Assert.Equal("Usuario A", ocupado.NombreUsuario);

        Assert.True(locks.Adquirir(10, "objetivos", "sesion-b", "Usuario B").Adquirido);
        Assert.True(locks.Adquirir(11, "descripcion", "sesion-b", "Usuario B").Adquirido);

        var bloqueos = locks.ObtenerBloqueosDeOtros(
            10,
            "sesion-b",
            ["descripcion", "objetivos"]);
        Assert.Equal("Usuario A", bloqueos["descripcion"]);
        Assert.DoesNotContain("objetivos", bloqueos.Keys);
    }

    [Fact]
    public void SoloElPropietarioPuedeRenovarOLiberarUnBloqueo()
    {
        var locks = new AsignaturaEdicionLockService();
        locks.Adquirir(10, "descripcion", "sesion-a", "Usuario A");

        Assert.False(locks.Renovar(10, "descripcion", "sesion-b"));
        locks.Liberar(10, "descripcion", "sesion-b");
        Assert.False(locks.Adquirir(10, "descripcion", "sesion-b", "Usuario B").Adquirido);

        locks.Liberar(10, "descripcion", "sesion-a");
        Assert.True(locks.Adquirir(10, "descripcion", "sesion-b", "Usuario B").Adquirido);
    }
}
