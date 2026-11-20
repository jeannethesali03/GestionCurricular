namespace GestionCurricular.Api.Services;

public sealed class AsignaturaEdicionLockService
{
    private readonly Dictionary<string, LockEntry> _locks = new();
    private readonly object _sync = new();
    private static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(5);

    public (bool Adquirido, string? UsuarioId, string? NombreUsuario) Adquirir(
        int asignaturaId,
        string vista,
        string usuarioId,
        string nombreUsuario)
    {
        var key = CrearKey(asignaturaId, vista);
        var ahora = DateTimeOffset.UtcNow;

        lock (_sync)
        {
            LimpiarExpirados(ahora);
            if (_locks.TryGetValue(key, out var actual))
            {
                if (actual.UsuarioId != usuarioId)
                    return (false, actual.UsuarioId, actual.NombreUsuario);

                actual.LastSeen = ahora;
                return (true, usuarioId, nombreUsuario);
            }

            _locks.Add(key, new LockEntry(usuarioId, nombreUsuario, ahora));
            return (true, usuarioId, nombreUsuario);
        }
    }

    public bool Renovar(int asignaturaId, string vista, string usuarioId)
    {
        var key = CrearKey(asignaturaId, vista);
        lock (_sync)
        {
            if (!_locks.TryGetValue(key, out var entry) || entry.UsuarioId != usuarioId)
                return false;

            entry.LastSeen = DateTimeOffset.UtcNow;
            return true;
        }
    }

    public void Liberar(int asignaturaId, string vista, string usuarioId)
    {
        var key = CrearKey(asignaturaId, vista);
        lock (_sync)
        {
            if (_locks.TryGetValue(key, out var entry) && entry.UsuarioId == usuarioId)
                _locks.Remove(key);
        }
    }

    public bool PerteneceA(int asignaturaId, string vista, string usuarioId)
    {
        var key = CrearKey(asignaturaId, vista);
        lock (_sync)
        {
            var ahora = DateTimeOffset.UtcNow;
            LimpiarExpirados(ahora);
            if (!_locks.TryGetValue(key, out var entry) || entry.UsuarioId != usuarioId)
                return false;

            entry.LastSeen = ahora;
            return true;
        }
    }

    public IReadOnlyDictionary<string, string> ObtenerBloqueosDeOtros(
        int asignaturaId,
        string propietarioActual,
        IReadOnlyCollection<string> vistas)
    {
        lock (_sync)
        {
            LimpiarExpirados(DateTimeOffset.UtcNow);
            return vistas
                .Select(vista => (Vista: vista, Key: CrearKey(asignaturaId, vista)))
                .Where(item => _locks.TryGetValue(item.Key, out var entry)
                    && entry.UsuarioId != propietarioActual)
                .ToDictionary(
                    item => item.Vista,
                    item => _locks[item.Key].NombreUsuario);
        }
    }

    private void LimpiarExpirados(DateTimeOffset ahora)
    {
        foreach (var item in _locks.Where(item => ahora - item.Value.LastSeen > Lifetime).ToArray())
            _locks.Remove(item.Key);
    }

    private static string CrearKey(int asignaturaId, string vista) =>
        $"{asignaturaId}:{vista}";

    private sealed class LockEntry(string usuarioId, string nombreUsuario, DateTimeOffset lastSeen)
    {
        public string UsuarioId { get; } = usuarioId;
        public string NombreUsuario { get; } = nombreUsuario;
        public DateTimeOffset LastSeen { get; set; } = lastSeen;
    }
}
