import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { usuariosApi } from '../../services/usuariosApi';

type ModoContrasena = 'activacion' | 'restablecimiento';

export const ActivarCuenta: React.FC<{ modo?: ModoContrasena }> = ({
  modo = 'activacion',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(location.hash.slice(1)).get('token') ?? '';
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [mostrarNuevaContrasena, setMostrarNuevaContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [completada, setCompletada] = useState(false);
  const esRestablecimiento = modo === 'restablecimiento';
  const titulo = completada
    ? esRestablecimiento ? 'Contraseña actualizada' : 'Cuenta activada'
    : esRestablecimiento ? 'Cambia tu contraseña' : 'Activa tu cuenta';
  const descripcion = completada
    ? esRestablecimiento
      ? 'Tu contraseña fue actualizada. Ya puedes iniciar sesión con la nueva contraseña.'
      : 'Tu contraseña fue configurada y ya puedes iniciar sesión.'
    : esRestablecimiento
      ? 'Crea una contraseña nueva. El enlace solo puede utilizarse una vez y vence en 24 horas.'
      : 'Para activar tu cuenta, crea una contraseña personal. El enlace solo puede utilizarse una vez y vence en 24 horas.';
  const textoAccion = guardando
    ? esRestablecimiento ? 'Guardando contraseña...' : 'Activando cuenta...'
    : esRestablecimiento ? 'Guardar nueva contraseña' : 'Guardar contraseña y activar';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!token) {
      setError(modo === 'restablecimiento'
        ? 'El enlace para cambiar la contraseña no contiene un token válido.'
        : 'El enlace de activación no contiene un token válido.');
      return;
    }
    if (nuevaContrasena !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setGuardando(true);
    try {
      if (modo === 'restablecimiento') {
        await usuariosApi.restablecerContrasena(token, nuevaContrasena);
      } else {
        await usuariosApi.activarCuenta(token, nuevaContrasena);
      }
      setCompletada(true);
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : modo === 'restablecimiento'
          ? 'No se pudo cambiar la contraseña.'
          : 'No se pudo activar la cuenta.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-200/80 bg-white p-8 shadow-sm">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-[#050758]/5">
          <Lock className="h-5 w-5 text-[#050758]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#050758]">
          {titulo}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {descripcion}
        </p>

        {completada ? (
          <div className="mt-6 space-y-5">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              {esRestablecimiento
                ? 'Contraseña actualizada correctamente.'
                : 'Cuenta activada correctamente.'}
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full rounded-xl bg-[#050758] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#090c7a]"
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label htmlFor="nueva-contrasena" className="text-xs font-bold text-gray-700">
                Nueva contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  id="nueva-contrasena"
                  type={mostrarNuevaContrasena ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={nuevaContrasena}
                  onChange={(event) => setNuevaContrasena(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm text-gray-800 focus:border-[#050758] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setMostrarNuevaContrasena(!mostrarNuevaContrasena)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  title={mostrarNuevaContrasena ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {mostrarNuevaContrasena ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="confirmar-contrasena" className="text-xs font-bold text-gray-700">
                Confirmar contraseña
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmar-contrasena"
                  type={mostrarConfirmacion ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={confirmacion}
                  onChange={(event) => setConfirmacion(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm text-gray-800 focus:border-[#050758] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacion(!mostrarConfirmacion)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  title={mostrarConfirmacion ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {mostrarConfirmacion ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={guardando}
              className="w-full rounded-xl bg-[#050758] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#090c7a] disabled:opacity-50"
            >
              {textoAccion}
            </button>
          </form>
        )}
      </section>
    </main>
  );
};