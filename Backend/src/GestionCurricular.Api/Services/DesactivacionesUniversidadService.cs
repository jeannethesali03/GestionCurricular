using System.Security.Cryptography;
using System.Text;
using GestionCurricular.Domain.Entities;
using GestionCurricular.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GestionCurricular.Api.Services;

public sealed class DesactivacionesUniversidadService(
    GestionCurricularDbContext db,
    IEmailSender emailSender) : IDesactivacionesUniversidadService
{
    private const int CodigoValidezMinutos = 10;
    private const int MaximoIntentos = 5;
    private const int IteracionesDerivacion = 100_000;

    public async Task SolicitarCodigoAsync(
        string tipoEntidad,
        int idEntidad,
        int idUsuario,
        CancellationToken cancellationToken)
    {
        ValidarTipo(tipoEntidad);
        var usuario = await ObtenerSolicitanteAutorizadoAsync(idUsuario, cancellationToken);
        await ValidarPadreActivoAsync(tipoEntidad, idEntidad, cancellationToken);
        var nombreEntidad = await ObtenerNombreActivoAsync(tipoEntidad, idEntidad, cancellationToken);
        if (nombreEntidad is null)
        {
            throw new UsuarioServiceException(
                StatusCodes.Status404NotFound,
                "La entidad no existe o ya está desactivada.");
        }

        var prefijo = $"{tipoEntidad}:{idEntidad}:";
        var ahora = DateTime.UtcNow;
        var codigoVigente = await db.TokensAutenticacion.AnyAsync(token =>
            token.IdUsuario == idUsuario
            && token.TipoToken == TipoTokenAutenticacion.CodigoDesactivacion
            && token.Token.StartsWith(prefijo)
            && token.Consumido != true
            && token.Intentos < MaximoIntentos
            && token.Expiracion > ahora,
            cancellationToken);
        if (codigoVigente)
        {
            throw new UsuarioServiceException(
                StatusCodes.Status429TooManyRequests,
                "Ya se envió un código para esta entidad. Espera a que venza antes de solicitar otro.");
        }

        var anteriores = await db.TokensAutenticacion
            .Where(token => token.IdUsuario == idUsuario
                && token.TipoToken == TipoTokenAutenticacion.CodigoDesactivacion
                && token.Token.StartsWith(prefijo)
                && token.Consumido != true)
            .ToListAsync(cancellationToken);
        foreach (var anterior in anteriores)
        {
            anterior.Consumido = true;
        }

        var codigo = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var sal = RandomNumberGenerator.GetBytes(16);
        var hash = DerivarCodigo(codigo, sal);
        var tokenDesactivacion = $"{prefijo}{Convert.ToHexString(sal)}:{Convert.ToHexString(hash)}";
        db.TokensAutenticacion.Add(new TokenAutenticacion
        {
            IdUsuario = idUsuario,
            Token = tokenDesactivacion,
            TipoToken = TipoTokenAutenticacion.CodigoDesactivacion,
            Expiracion = DateTime.UtcNow.AddMinutes(CodigoValidezMinutos),
            Consumido = false,
            Intentos = 0
        });
        await db.SaveChangesAsync(cancellationToken);

        try
        {
            await emailSender.EnviarCodigoDesactivacionAsync(
                usuario.Correo,
                usuario.NombreCompleto,
                codigo,
                EtiquetaEntidad(tipoEntidad),
                nombreEntidad,
                cancellationToken);
        }
        catch (UsuarioServiceException)
        {
            await db.TokensAutenticacion
                .Where(token => token.Token == tokenDesactivacion)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(token => token.Consumido, true),
                    cancellationToken);
            throw;
        }
    }

    public async Task DesactivarAsync(
        string tipoEntidad,
        int idEntidad,
        int idUsuario,
        string codigo,
        CancellationToken cancellationToken)
    {
        ValidarTipo(tipoEntidad);
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await ObtenerSolicitanteAutorizadoAsync(idUsuario, cancellationToken);
        await ValidarPadreActivoAsync(tipoEntidad, idEntidad, cancellationToken);

        var prefijo = $"{tipoEntidad}:{idEntidad}:";
        var ahora = DateTime.UtcNow;
        var token = await db.TokensAutenticacion.AsNoTracking()
            .Where(item => item.IdUsuario == idUsuario
                && item.TipoToken == TipoTokenAutenticacion.CodigoDesactivacion
                && item.Token.StartsWith(prefijo)
                && item.Consumido != true
                && item.Intentos < MaximoIntentos
                && item.Expiracion > ahora)
            .OrderByDescending(item => item.IdToken)
            .FirstOrDefaultAsync(cancellationToken);
        if (token is null)
        {
            throw new UsuarioServiceException(
                StatusCodes.Status400BadRequest,
                "El código no existe, venció o ya fue utilizado. Solicita uno nuevo.");
        }

        if (!CodigoValido(token.Token, codigo))
        {
            var intentosActualizados = await db.TokensAutenticacion
                .Where(item => item.IdToken == token.IdToken
                    && item.Consumido != true
                    && item.Intentos < MaximoIntentos)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(
                        item => item.Intentos,
                        item => item.Intentos + 1),
                    cancellationToken);
            if (intentosActualizados == 1 && token.Intentos + 1 >= MaximoIntentos)
            {
                await db.TokensAutenticacion
                    .Where(item => item.IdToken == token.IdToken)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(item => item.Consumido, true),
                        cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);
            throw new UsuarioServiceException(
                StatusCodes.Status400BadRequest,
                intentosActualizados == 1 && token.Intentos + 1 >= MaximoIntentos
                    ? "Se agotaron los intentos. Solicita un nuevo código."
                    : "El código ingresado no es válido.");
        }

        var consumido = await db.TokensAutenticacion
            .Where(item => item.IdToken == token.IdToken
                && item.Consumido != true
                && item.Intentos < MaximoIntentos
                && item.Expiracion > ahora)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(item => item.Consumido, true),
                cancellationToken);
        if (consumido != 1)
        {
            throw new UsuarioServiceException(
                StatusCodes.Status400BadRequest,
                "El código ya fue utilizado o venció. Solicita uno nuevo.");
        }

        await DesactivarJerarquiaAsync(tipoEntidad, idEntidad, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    public async Task ActivarAsync(
        string tipoEntidad,
        int idEntidad,
        int idUsuario,
        CancellationToken cancellationToken)
    {
        ValidarTipo(tipoEntidad);
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        await ObtenerSolicitanteAutorizadoAsync(idUsuario, cancellationToken);
        await ValidarPadreActivoAsync(tipoEntidad, idEntidad, cancellationToken);

        switch (tipoEntidad)
        {
            case "sede":
            {
                var sede = await db.Sedes.FindAsync([idEntidad], cancellationToken);
                if (sede is null) throw EntidadNoEncontrada(tipoEntidad);
                sede.EstadoRegistro = EstadoRegistro.Activo;
                break;
            }
            case "facultad":
            {
                var facultad = await db.Facultades.FindAsync([idEntidad], cancellationToken);
                if (facultad is null) throw EntidadNoEncontrada(tipoEntidad);
                facultad.EstadoRegistro = EstadoRegistro.Activo;
                break;
            }
            case "carrera":
            {
                var carrera = await db.Carreras.FindAsync([idEntidad], cancellationToken);
                if (carrera is null) throw EntidadNoEncontrada(tipoEntidad);
                carrera.EstadoRegistro = EstadoRegistro.Activo;
                break;
            }
            case "asignatura":
            {
                var asignatura = await db.Asignaturas.FindAsync([idEntidad], cancellationToken);
                if (asignatura is null) throw EntidadNoEncontrada(tipoEntidad);

                var tieneCarreras = await db.AsignaturasCarrera
                    .AnyAsync(relacion => relacion.IdAsignatura == idEntidad, cancellationToken);
                if (tieneCarreras
                    && !await db.AsignaturasCarrera.AnyAsync(
                        relacion => relacion.IdAsignatura == idEntidad
                            && relacion.Carrera.EstadoRegistro == EstadoRegistro.Activo
                            && relacion.Carrera.Facultad.EstadoRegistro == EstadoRegistro.Activo
                            && relacion.Carrera.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo,
                        cancellationToken))
                {
                    throw new UsuarioServiceException(
                        StatusCodes.Status409Conflict,
                        "No se puede activar una asignatura hasta que al menos una carrera relacionada esté activa.");
                }

                asignatura.EstadoAsignatura = EstadoAsignatura.Activo;
                break;
            }
        }

        var restauracionesAnteriores = await db.RestauracionesJerarquia
            .Where(item => item.TipoRaiz == tipoEntidad && item.IdRaiz == idEntidad)
            .ToListAsync(cancellationToken);
        db.RestauracionesJerarquia.RemoveRange(restauracionesAnteriores);
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    private async Task DesactivarJerarquiaAsync(
        string tipoEntidad,
        int idEntidad,
        CancellationToken cancellationToken)
    {
        var facultadIds = Array.Empty<int>();
        var carreraIds = Array.Empty<int>();
        switch (tipoEntidad)
        {
            case "sede":
            {
                var sede = await db.Sedes.FindAsync([idEntidad], cancellationToken);
                if (sede is null) throw EntidadNoEncontrada(tipoEntidad);
                if (sede.EstadoRegistro != EstadoRegistro.Activo) throw EntidadYaInactiva(tipoEntidad);

                facultadIds = await db.Facultades
                    .Where(item => item.IdSede == idEntidad)
                    .Select(item => item.IdFacultad)
                    .ToArrayAsync(cancellationToken);
                await db.Facultades
                    .Where(item => facultadIds.Contains(item.IdFacultad)
                        && item.EstadoRegistro == EstadoRegistro.Activo)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(
                            item => item.EstadoRegistro,
                            EstadoRegistro.Inactivo),
                        cancellationToken);

                carreraIds = await db.Carreras
                    .Where(item => facultadIds.Contains(item.IdFacultad))
                    .Select(item => item.IdCarrera)
                    .ToArrayAsync(cancellationToken);
                await DesactivarCarrerasAsync(carreraIds, cancellationToken);
                await DesactivarUsuariosAsync(facultadIds, cancellationToken);
                sede.EstadoRegistro = EstadoRegistro.Inactivo;
                break;
            }
            case "facultad":
            {
                var facultad = await db.Facultades.FindAsync([idEntidad], cancellationToken);
                if (facultad is null) throw EntidadNoEncontrada(tipoEntidad);
                if (facultad.EstadoRegistro != EstadoRegistro.Activo) throw EntidadYaInactiva(tipoEntidad);

                carreraIds = await db.Carreras
                    .Where(item => item.IdFacultad == idEntidad)
                    .Select(item => item.IdCarrera)
                    .ToArrayAsync(cancellationToken);
                await DesactivarCarrerasAsync(carreraIds, cancellationToken);
                await DesactivarUsuariosAsync([idEntidad], cancellationToken);
                facultad.EstadoRegistro = EstadoRegistro.Inactivo;
                break;
            }
            case "carrera":
            {
                var carrera = await db.Carreras.FindAsync([idEntidad], cancellationToken);
                if (carrera is null) throw EntidadNoEncontrada(tipoEntidad);
                if (carrera.EstadoRegistro != EstadoRegistro.Activo) throw EntidadYaInactiva(tipoEntidad);
                carreraIds = [idEntidad];
                await DesactivarCarrerasAsync(carreraIds, cancellationToken);
                carrera.EstadoRegistro = EstadoRegistro.Inactivo;
                break;
            }
            case "asignatura":
            {
                var asignatura = await db.Asignaturas.FindAsync([idEntidad], cancellationToken);
                if (asignatura is null) throw EntidadNoEncontrada(tipoEntidad);
                if (asignatura.EstadoAsignatura != EstadoAsignatura.Activo)
                    throw EntidadYaInactiva(tipoEntidad);
                asignatura.EstadoAsignatura = EstadoAsignatura.Inactivo;
                break;
            }
        }
    }

    private async Task DesactivarCarrerasAsync(
        int[] carreraIds,
        CancellationToken cancellationToken)
    {
        if (carreraIds.Length == 0) return;

        var carreras = await db.Carreras
            .Where(item => carreraIds.Contains(item.IdCarrera))
            .ToListAsync(cancellationToken);
        foreach (var carrera in carreras)
        {
            carrera.EstadoRegistro = EstadoRegistro.Inactivo;
        }

        var planes = await db.PlanesEstudio
            .Where(item => carreraIds.Contains(item.IdCarrera)
                && item.EstadoPlan != EstadoPlanEstudio.Desactivado)
            .ToListAsync(cancellationToken);
        foreach (var plan in planes)
        {
            plan.EstadoPlan = EstadoPlanEstudio.Desactivado;
        }

        var asignaturaIds = await db.AsignaturasCarrera
            .Where(relacion => carreraIds.Contains(relacion.IdCarrera))
            .Select(relacion => relacion.IdAsignatura)
            .Distinct()
            .ToArrayAsync(cancellationToken);
        if (asignaturaIds.Length == 0) return;

        var asignaturas = await db.Asignaturas
            .Where(item => asignaturaIds.Contains(item.IdAsignatura)
                && item.EstadoAsignatura == EstadoAsignatura.Activo)
            .ToListAsync(cancellationToken);
        foreach (var asignatura in asignaturas)
        {
            asignatura.EstadoAsignatura = EstadoAsignatura.Inactivo;
        }
    }

    private async Task DesactivarUsuariosAsync(
        int[] idFacultades,
        CancellationToken cancellationToken)
    {
        if (idFacultades.Length == 0) return;

        var idUsuarios = await db.Usuarios
            .Where(usuario => usuario.IdFacultad.HasValue
                && idFacultades.Contains(usuario.IdFacultad.Value))
            .Select(usuario => usuario.IdUsuario)
            .ToArrayAsync(cancellationToken);
        if (idUsuarios.Length == 0) return;

        await db.Usuarios
            .Where(usuario => idUsuarios.Contains(usuario.IdUsuario)
                && usuario.EstadoCuenta == EstadoCuenta.Activo)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(
                    usuario => usuario.EstadoCuenta,
                    EstadoCuenta.Inactivo),
                cancellationToken);
        await db.TokensAutenticacion
            .Where(token => idUsuarios.Contains(token.IdUsuario) && token.Consumido != true)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(token => token.Consumido, true),
                cancellationToken);
    }

    private async Task<Usuario> ObtenerSolicitanteAutorizadoAsync(
        int idUsuario,
        CancellationToken cancellationToken)
    {
        var usuario = await db.Usuarios.AsNoTracking()
            .Include(item => item.Rol)
            .FirstOrDefaultAsync(item => item.IdUsuario == idUsuario, cancellationToken);
        if (usuario is null
            || usuario.EstadoCuenta != EstadoCuenta.Activo
            || !string.Equals(usuario.Rol.NombreRol, "SUPER_USUARIO", StringComparison.OrdinalIgnoreCase))
        {
            throw new UsuarioServiceException(
                StatusCodes.Status403Forbidden,
                "Solo un superusuario activo puede confirmar esta operación.");
        }

        return usuario;
    }

    private async Task ValidarPadreActivoAsync(
        string tipoEntidad,
        int idEntidad,
        CancellationToken cancellationToken)
    {
        var padreActivo = tipoEntidad switch
        {
            "facultad" => await db.Facultades.AnyAsync(item =>
                item.IdFacultad == idEntidad
                && item.Sede.EstadoRegistro == EstadoRegistro.Activo,
                cancellationToken),
            "asignatura" => true,
            "carrera" => await db.Carreras.AnyAsync(item =>
                item.IdCarrera == idEntidad
                && item.Facultad.EstadoRegistro == EstadoRegistro.Activo
                && item.Facultad.Sede.EstadoRegistro == EstadoRegistro.Activo,
                cancellationToken),
            _ => true
        };

        if (!padreActivo)
        {
            throw new UsuarioServiceException(
                StatusCodes.Status409Conflict,
                $"No se puede modificar la {EtiquetaEntidad(tipoEntidad)} porque su entidad superior está inactiva.");
        }
    }

    private async Task<string?> ObtenerNombreActivoAsync(
        string tipoEntidad,
        int idEntidad,
        CancellationToken cancellationToken) =>
        tipoEntidad switch
        {
            "sede" => await db.Sedes.Where(item =>
                    item.IdSede == idEntidad && item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => item.NombreSede).FirstOrDefaultAsync(cancellationToken),
            "facultad" => await db.Facultades.Where(item =>
                    item.IdFacultad == idEntidad && item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => item.NombreFacultad).FirstOrDefaultAsync(cancellationToken),
            "carrera" => await db.Carreras.Where(item =>
                    item.IdCarrera == idEntidad && item.EstadoRegistro == EstadoRegistro.Activo)
                .Select(item => item.NombreCarrera).FirstOrDefaultAsync(cancellationToken),
            "asignatura" => await db.Asignaturas.Where(item =>
                    item.IdAsignatura == idEntidad && item.EstadoAsignatura == EstadoAsignatura.Activo)
                .Select(item => item.NombreAsignatura).FirstOrDefaultAsync(cancellationToken),
            _ => null
        };

    private static byte[] DerivarCodigo(string codigo, byte[] sal) =>
        Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(codigo),
            sal,
            IteracionesDerivacion,
            HashAlgorithmName.SHA256,
            32);

    private static bool CodigoValido(string token, string codigo)
    {
        var partes = token.Split(':');
        if (partes.Length != 4) return false;

        byte[] sal;
        byte[] hashEsperado;
        try
        {
            sal = Convert.FromHexString(partes[2]);
            hashEsperado = Convert.FromHexString(partes[3]);
        }
        catch (FormatException)
        {
            return false;
        }

        if (sal.Length != 16 || hashEsperado.Length != 32) return false;

        return CryptographicOperations.FixedTimeEquals(
            DerivarCodigo(codigo, sal),
            hashEsperado);
    }

    private static void ValidarTipo(string tipoEntidad)
    {
        if (tipoEntidad is not ("sede" or "facultad" or "carrera" or "asignatura"))
        {
            throw new UsuarioServiceException(
                StatusCodes.Status400BadRequest,
                "El tipo de entidad universitaria no es válido.");
        }
    }

    private static string EtiquetaEntidad(string tipoEntidad) => tipoEntidad switch
    {
        "sede" => "sede",
        "facultad" => "facultad",
        "carrera" => "carrera",
        "asignatura" => "asignatura",
        _ => "entidad"
    };

    private static UsuarioServiceException EntidadNoEncontrada(string tipoEntidad) =>
        new(StatusCodes.Status404NotFound, $"No se encontró la {EtiquetaEntidad(tipoEntidad)}.");

    private static UsuarioServiceException EntidadYaInactiva(string tipoEntidad) =>
        new(StatusCodes.Status409Conflict, $"La {EtiquetaEntidad(tipoEntidad)} ya está desactivada.");
}
