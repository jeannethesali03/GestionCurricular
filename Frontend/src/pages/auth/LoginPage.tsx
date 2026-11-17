import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoUnicaes from "../../assets/logoUNICAES.png";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      {/* Encabezado Institucional UNICAES */}
      <header className="w-full bg-[#8B1124] text-white py-5 px-6 shadow-sm flex items-center justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 max-w-4xl">
          {/* Logo e Inscripción inferior */}
          <div className="flex flex-col items-center">
            <img
              src={logoUnicaes}
              alt="Escudo Universidad Católica de El Salvador"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
            />
          </div>

          {/* Texto Institucional */}
          <div className="text-center sm:text-left leading-none">
            <p className="text-base sm:text-xl font-normal tracking-wide mb-1">
              Universidad Católica de El Salvador
            </p>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-wider">
              UNICAES
            </h1>
          </div>
        </div>
      </header>

      {/* Contenido Principal - Formulario de Login */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-[380px] flex flex-col items-center">
          {/* Título del Sistema */}
          <h2 className="text-[#050758] text-xl sm:text-[22px] font-extrabold text-center uppercase leading-snug tracking-tight mb-3">
            SISTEMA WEB DE GESTIÓN
            <br />
            CURRICULAR EN EDUCACIÓN
            <br />
            SUPERIOR
          </h2>

          {/* Subtítulo */}
          <p className="text-gray-500 text-sm text-center leading-tight mb-7">
            Inicia sesión para empezar a
            <br />
            trabajar
          </p>

          {/* Mensaje de error si falla validación */}
          {error && (
            <div className="w-full mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Campo Correo Electrónico */}
            <div>
              <label
                htmlFor="email"
                className="block text-[#050758] text-xs font-bold mb-1.5 ml-1"
              >
                Correo Electrónico
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-[#E2E2E2] text-gray-800 placeholder-gray-500 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#050758] transition"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-[#050758] text-xs font-bold mb-1.5 ml-1"
              >
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#E2E2E2] text-gray-800 placeholder-gray-500 text-sm rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-[#050758] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-500 hover:text-[#050758] focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Enlace Olvidaste tu contraseña */}
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => alert('Contacta al Superusuario o Soporte TI para restablecer tu contraseña.')}
                  className="text-[#2B70C9] hover:underline text-xs font-medium cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {/* Botón Iniciar Sesión */}
            <div className="pt-3 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full max-w-[300px] bg-[#050758] hover:bg-[#090c7a] disabled:opacity-60 text-white font-bold text-sm py-3 px-6 rounded-full shadow-md transition cursor-pointer"
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          {/* Guía rápida de prueba para los 3 roles (puedes quitarla en producción) */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-[11px] text-gray-400 text-center space-y-0.5">
            <p className="font-semibold text-gray-500">Prueba de roles (cualquier contraseña):</p>
            <p>Superusuario: <span className="text-gray-600">super@unicaes.edu.sv</span></p>
            <p>Administrador: <span className="text-gray-600">admin@unicaes.edu.sv</span></p>
            <p>Usuario: <span className="text-gray-600">docente@unicaes.edu.sv</span></p>
          </div>
        </div>
      </main>
    </div>
  );
};