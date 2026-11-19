using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Api.Services;

public static class InicializadorRoles
{
    private static readonly (string Nombre, string Descripcion)[] RolesPredeterminados =
    [
        ("USUARIO", "Usuario estándar del sistema."),
        ("ADMINISTRADOR", "Administrador de una facultad."),
        ("SUPER_USUARIO", "Administrador global del sistema.")
    ];

    public static async Task InicializarAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<GestionCurricularDbContext>();
        var nombresExistentes = await db.Roles
            .Select(rol => rol.NombreRol)
            .ToListAsync(cancellationToken);

        foreach (var (nombre, descripcion) in RolesPredeterminados)
        {
            if (!nombresExistentes.Contains(nombre, StringComparer.OrdinalIgnoreCase))
            {
                db.Roles.Add(new Rol
                {
                    NombreRol = nombre,
                    Descripcion = descripcion
                });
            }
        }

        if (db.ChangeTracker.HasChanges())
        {
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
