using System.Security.Cryptography;
using System.Text;
using GestionCurricular.Api.Contracts;
using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Api.Services;

public sealed class UsuariosService(
    GestionCurricularDbContext db,
    IPasswordHasher<Usuario> passwordHasher) : IUsuariosService
{
    public async Task<IReadOnlyList<UsuarioResponse>> ObtenerTodosAsync(
        bool incluirInactivos,
        CancellationToken cancellationToken)
    {
        var query = db.Usuarios
            .AsNoTracking()
            .Include(usuario => usuario.Rol)
            .Include(usuario => usuario.Facultad)
            .AsQueryable();

        if (!incluirInactivos)
        {
            query = query.Where(usuario => usuario.EstadoCuenta == EstadoCuenta.Activo);
        }

        var usuarios = await query
            .OrderBy(usuario => usuario.IdUsuario)
            .ToListAsync(cancellationToken);

        return usuarios.Select(ConvertirRespuesta).ToArray();
    }

    public async Task<UsuarioResponse?> ObtenerPorIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var usuario = await db.Usuarios
            .AsNoTracking()
            .Include(entity => entity.Rol)
            .Include(entity => entity.Facultad)
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);

        return usuario is null ? null : ConvertirRespuesta(usuario);
    }

    public async Task<DetalleUsuarioResponse?> ObtenerDetallesAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var usuario = await db.Usuarios
            .AsNoTracking()
            .AsSplitQuery()
            .Include(entity => entity.Rol)
            .Include(entity => entity.Facultad)
            .Include(entity => entity.RegistrosCambios)
            .Include(entity => entity.PlanesParticipados)
                .ThenInclude(relacion => relacion.PlanEstudio)
                .ThenInclude(plan => plan.Carrera)
            .Include(entity => entity.AsignaturasParticipadas)
                .ThenInclude(relacion => relacion.Asignatura)
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);

        if (usuario is null)
        {
            return null;
        }

        var planes = usuario.PlanesParticipados
            .Select(relacion => new PlanUsuarioResponse(
                relacion.PlanEstudio.IdPlan,
                relacion.PlanEstudio.Carrera.NombreCarrera,
                relacion.PlanEstudio.CicloInicio,
                relacion.PlanEstudio.CicloFin,
                EstadoPlan(relacion.PlanEstudio.EstadoPlan)))
            .ToArray();
        var asignaturas = usuario.AsignaturasParticipadas
            .Select(relacion => new AsignaturaUsuarioResponse(
                relacion.Asignatura.IdAsignatura,
                relacion.Asignatura.CodigoAsignatura,
                relacion.Asignatura.NombreAsignatura,
                relacion.Asignatura.CicloAcademico))
            .ToArray();
        var cambios = usuario.RegistrosCambios
            .OrderByDescending(registro => registro.FechaHora)
            .Select(registro => new CambioUsuarioResponse(
                registro.IdRegistroCambio,
                registro.TituloCambio,
                registro.DetalleCambio,
                registro.TipoCambio,
                FechaUtc(registro.FechaHora)))
            .ToArray();

        return new DetalleUsuarioResponse(
            ConvertirRespuesta(usuario),
            planes,
            asignaturas,
            cambios);
    }

    public async Task<CatalogosUsuarioResponse> ObtenerCatalogosAsync(
        CancellationToken cancellationToken)
    {
        var roles = await db.Roles
            .AsNoTracking()
            .OrderBy(rol => rol.IdRol)
            .Select(rol => new RolUsuarioResponse(
                rol.IdRol,
                rol.NombreRol ?? string.Empty,
                rol.Descripcion))
            .ToArrayAsync(cancellationToken);
        var facultades = await db.Facultades
            .AsNoTracking()
            .Where(facultad => facultad.EstadoRegistro == EstadoRegistro.Activo)
            .OrderBy(facultad => facultad.NombreFacultad)
            .Select(facultad => new FacultadUsuarioResponse(
                facultad.IdFacultad,
                facultad.NombreFacultad))
            .ToArrayAsync(cancellationToken);

        return new CatalogosUsuarioResponse(roles, facultades);
    }

    public async Task<UsuarioResponse> CrearAsync(
        CrearUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        await ValidarRelacionesAsync(request.IdRol, request.IdFacultad, cancellationToken);

        var correo = request.Correo.Trim();
        await ValidarUnicidadAsync(correo, null, cancellationToken);

        var usuario = new Usuario
        {
            IdRol = request.IdRol,
            IdFacultad = request.IdFacultad,
            NombreCompleto = request.NombreCompleto.Trim(),
            GradoAcademico = request.GradoAcademico.Trim(),
            ExperienciaEducacionSuperior = request.ExperienciaEducacionSuperior,
            Correo = correo,
            EstadoCuenta = EstadoCuenta.Activo,
            FechaRegistro = DateTime.UtcNow
        };
        usuario.Password = passwordHasher.HashPassword(usuario, request.Password);

        db.Usuarios.Add(usuario);
        await db.SaveChangesAsync(cancellationToken);
        await CargarRelacionesAsync(usuario, cancellationToken);

        return ConvertirRespuesta(usuario);
    }

    public async Task<UsuarioResponse?> ActualizarAsync(
        int id,
        ActualizarUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await db.Usuarios
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);
        if (usuario is null)
        {
            return null;
        }

        await ValidarRelacionesAsync(request.IdRol, request.IdFacultad, cancellationToken);
        var correo = request.Correo.Trim();
        await ValidarUnicidadAsync(correo, id, cancellationToken);

        usuario.IdRol = request.IdRol;
        usuario.IdFacultad = request.IdFacultad;
        usuario.NombreCompleto = request.NombreCompleto.Trim();
        usuario.GradoAcademico = request.GradoAcademico.Trim();
        usuario.ExperienciaEducacionSuperior = request.ExperienciaEducacionSuperior;
        usuario.Correo = correo;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            usuario.Password = passwordHasher.HashPassword(usuario, request.Password);
        }

        await db.SaveChangesAsync(cancellationToken);
        await CargarRelacionesAsync(usuario, cancellationToken);

        return ConvertirRespuesta(usuario);
    }

    public async Task<bool> CambiarEstadoAsync(
        int id,
        bool activo,
        CancellationToken cancellationToken)
    {
        var usuario = await db.Usuarios
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);
        if (usuario is null)
        {
            return false;
        }

        usuario.EstadoCuenta = activo ? EstadoCuenta.Activo : EstadoCuenta.Inactivo;
        if (!activo)
        {
            var tokens = await db.TokensAutenticacion
                .Where(token => token.IdUsuario == id)
                .ToListAsync(cancellationToken);
            foreach (var token in tokens)
            {
                token.Consumido = true;
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<UsuarioResponse?> ActualizarPerfilAsync(
        int id,
        ActualizarPerfilUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await db.Usuarios
            .Include(entity => entity.Rol)
            .Include(entity => entity.Facultad)
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);
        if (usuario is null)
        {
            return null;
        }

        usuario.NombreCompleto = request.NombreCompleto.Trim();
        usuario.GradoAcademico = request.GradoAcademico.Trim();
        usuario.ExperienciaEducacionSuperior = request.ExperienciaEducacionSuperior;
        await db.SaveChangesAsync(cancellationToken);

        return ConvertirRespuesta(usuario);
    }

    public async Task<bool> CambiarContrasenaAsync(
        int id,
        CambiarContrasenaUsuarioRequest request,
        CancellationToken cancellationToken)
    {
        var usuario = await db.Usuarios
            .FirstOrDefaultAsync(entity => entity.IdUsuario == id, cancellationToken);
        if (usuario is null)
        {
            return false;
        }

        var validacion = passwordHasher.VerifyHashedPassword(
            usuario,
            usuario.Password,
            request.ContrasenaActual);
        if (validacion == PasswordVerificationResult.Failed)
        {
            throw new UsuarioServiceException(
                StatusCodes.Status400BadRequest,
                "La contraseña actual no es correcta.");
        }

        usuario.Password = passwordHasher.HashPassword(usuario, request.NuevaContrasena);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<SesionUsuarioResponse?> IniciarSesionAsync(
        IniciarSesionRequest request,
        CancellationToken cancellationToken)
    {
        var correo = request.Correo.Trim();
        var usuario = await db.Usuarios
            .Include(entity => entity.Rol)
            .Include(entity => entity.Facultad)
            .FirstOrDefaultAsync(entity => entity.Correo == correo, cancellationToken);

        if (usuario is null || usuario.EstadoCuenta != EstadoCuenta.Activo)
        {
            return null;
        }

        var resultado = VerificarContrasena(usuario, request.Password);
        if (resultado == PasswordVerificationResult.Failed)
        {
            return null;
        }

        if (resultado == PasswordVerificationResult.SuccessRehashNeeded)
        {
            usuario.Password = passwordHasher.HashPassword(usuario, request.Password);
        }

        usuario.UltimoAcceso = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return new SesionUsuarioResponse(
            usuario.IdUsuario.ToString(),
            usuario.NombreCompleto,
            usuario.Correo,
            NormalizarRol(usuario.Rol.NombreRol),
            usuario.IdFacultad,
            usuario.Facultad?.NombreFacultad,
            usuario.GradoAcademico,
            usuario.ExperienciaEducacionSuperior);
    }

    private PasswordVerificationResult VerificarContrasena(Usuario usuario, string contrasena)
    {
        try
        {
            return passwordHasher.VerifyHashedPassword(
                usuario,
                usuario.Password,
                contrasena);
        }
        catch (FormatException)
        {
            var guardada = Encoding.UTF8.GetBytes(usuario.Password);
            var proporcionada = Encoding.UTF8.GetBytes(contrasena);

            return CryptographicOperations.FixedTimeEquals(guardada, proporcionada)
                ? PasswordVerificationResult.SuccessRehashNeeded
                : PasswordVerificationResult.Failed;
        }
    }

    private async Task ValidarRelacionesAsync(
        int idRol,
        int? idFacultad,
        CancellationToken cancellationToken)
    {
        if (!await db.Roles.AnyAsync(rol => rol.IdRol == idRol, cancellationToken))
        {
            throw new UsuarioServiceException(
                StatusCodes.Status400BadRequest,
                "El rol indicado no existe.");
        }

        if (idFacultad.HasValue
            && !await db.Facultades.AnyAsync(
                facultad => facultad.IdFacultad == idFacultad.Value
                    && facultad.EstadoRegistro == EstadoRegistro.Activo,
                cancellationToken))
        {
            throw new UsuarioServiceException(
                StatusCodes.Status400BadRequest,
                "La facultad indicada no existe o está inactiva.");
        }
    }

    private async Task ValidarUnicidadAsync(
        string correo,
        int? idExcluir,
        CancellationToken cancellationToken)
    {
        var correoDuplicado = await db.Usuarios.AnyAsync(
            entity => entity.Correo == correo
                && (!idExcluir.HasValue || entity.IdUsuario != idExcluir.Value),
            cancellationToken);
        if (correoDuplicado)
        {
            throw new UsuarioServiceException(
                StatusCodes.Status409Conflict,
                "El correo ya está registrado.");
        }
    }

    private async Task CargarRelacionesAsync(
        Usuario usuario,
        CancellationToken cancellationToken)
    {
        await db.Entry(usuario).Reference(entity => entity.Rol).LoadAsync(cancellationToken);
        if (usuario.IdFacultad.HasValue)
        {
            await db.Entry(usuario).Reference(entity => entity.Facultad).LoadAsync(cancellationToken);
        }
    }

    private static UsuarioResponse ConvertirRespuesta(Usuario usuario) =>
        new(
            usuario.IdUsuario,
            usuario.IdRol,
            usuario.Rol?.NombreRol,
            usuario.IdFacultad,
            usuario.Facultad?.NombreFacultad,
            usuario.NombreCompleto,
            usuario.GradoAcademico,
            usuario.ExperienciaEducacionSuperior,
            usuario.Correo,
            usuario.EstadoCuenta == EstadoCuenta.Activo ? "activo" : "inactivo",
            usuario.FechaRegistro.HasValue ? FechaUtc(usuario.FechaRegistro.Value) : null,
            usuario.UltimoAcceso.HasValue ? FechaUtc(usuario.UltimoAcceso.Value) : null);

    private static DateTimeOffset FechaUtc(DateTime fecha) =>
        new(DateTime.SpecifyKind(fecha, DateTimeKind.Utc));

    private static string EstadoPlan(EstadoPlanEstudio? estado) => estado switch
    {
        EstadoPlanEstudio.Borrador => "borrador",
        EstadoPlanEstudio.EnRevision => "en_revision",
        EstadoPlanEstudio.Aprobado => "aprobado",
        EstadoPlanEstudio.SalienteHistorico => "saliente_historico",
        EstadoPlanEstudio.Desactivado => "desactivado",
        _ => "borrador"
    };

    private static string NormalizarRol(string? nombreRol) =>
        nombreRol?.Trim().ToUpperInvariant() switch
        {
            "SUPER_USUARIO" or "SUPERUSUARIO" => "SUPER_USUARIO",
            "ADMINISTRADOR" => "ADMINISTRADOR",
            "USUARIO" or "USUARIO_ESTANDAR" or "USUARIO ESTANDAR" => "USUARIO",
            _ => throw new InvalidOperationException(
                $"El rol almacenado no es compatible con la aplicación: {nombreRol}.")
        };
}
