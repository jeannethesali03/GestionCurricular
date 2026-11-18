import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, UserCheck, User } from 'lucide-react';
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

  // Función de acceso rápido para pruebas adaptada a los tipos del sistema
  const handleAccesoRapido = (rolSeleccionado: 'SUPER_USUARIO' | 'ADMINISTRADOR' | 'USUARIO_ESTANDAR') => {
    let mockUser: any = {
      id: 'test-id-123',
      nombre: '',
      email: '',
      rol: rolSeleccionado,
      facultadNombre: 'Ingeniería y Tecnología',
    };

    if (rolSeleccionado === 'SUPER_USUARIO') {
      mockUser.nombre = 'Eyleen Salinas (Super Usuario)';
      mockUser.email = 'super@unicaes.edu.sv';
    } else if (rolSeleccionado === 'ADMINISTRADOR') {
      mockUser.nombre = 'Carlos Ruiz (Administrador)';
      mockUser.email = 'admin@unicaes.edu.sv';
    } else {
      mockUser.nombre = 'Lucía Méndez (Usuario Estándar)';
      mockUser.email = 'docente@unicaes.edu.sv';
    }

    // Guardamos la sesión simulada en el localStorage
    localStorage.setItem('unicaes_curricular_user', JSON.stringify(mockUser));
    
    // Recargamos y redirigimos para que el contexto cargue el rol al instante
    window.location.href = '/usuarios';
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col font-sans">
      {/* Encabezado Institucional UNICAES */}
      <header className="w-full bg-[#8B1124] text-white py-5 px-6 shadow-sm flex items-center justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 max-w-4xl">
          <div className="flex flex-col items-center">
            <img
              src={logoUnicaes}
              alt="Escudo Universidad Católica de El Salvador"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
            />
          </div>

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
        <div className="w-full max-w-[400px] flex flex-col items-center">
          <h2 className="text-[#050758] text-xl sm:text-[22px] font-extrabold text-center uppercase leading-snug tracking-tight mb-3">
            SISTEMA WEB DE GESTIÓN
            <br />
            CURRICULAR EN EDUCACIÓN
            <br />
            SUPERIOR
          </h2>

          <p className="text-gray-500 text-sm text-center leading-tight mb-7">
            Inicia sesión para empezar a
            <br />
            trabajar
          </p>

          {error && (
            <div className="w-full mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-4">
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
                  className="absolute right-3.5 text-gray-500 hover:text-[#050758] focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

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

          {/* Panel de botones rápidos para cambiar de rol y evaluar interfaces */}
          <div className="mt-8 w-full pt-6 border-t border-gray-200 space-y-2.5">
            <p className="text-xs font-bold text-gray-700 text-center uppercase tracking-wide">
              ⚡ Acceso rápido para pruebas de roles:
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleAccesoRapido('SUPER_USUARIO')}
                className="w-full flex items-center justify-center gap-2 bg-[#8B1124] hover:bg-[#720e1d] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-sm cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Entrar como Super Usuario
              </button>

              <button
                type="button"
                onClick={() => handleAccesoRapido('ADMINISTRADOR')}
                className="w-full flex items-center justify-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-sm cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                Entrar como Administrador
              </button>

              <button
                type="button"
                onClick={() => handleAccesoRapido('USUARIO_ESTANDAR')}
                className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-sm cursor-pointer"
              >
                <User className="w-4 h-4" />
                Entrar como Usuario Estándar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};