import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CrearUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Si es usuario normal (estándar), muestra una pantalla limpia de Página no encontrada (404)
  if (!user || (!esSuperUsuario && !esAdministrador)) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center space-y-4 bg-white rounded-2xl border border-gray-200 mt-16 shadow-sm">
        <p className="text-6xl font-extrabold text-[#050758]">404</p>
        <h2 className="text-2xl font-bold text-gray-900">Página no encontrada</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          La página que estás buscando no existe, ha sido movida o no tienes autorización para visualizarla.
        </p>
        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm"
          >
            Regresar al inicio
          </button>
        </div>
      </div>
    );
  }

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  
  // Superusuario puede elegir entre los tres roles; Admin crea fijo Usuario Estándar en su facultad
  const [rolAsignado, setRolAsignado] = useState<'Usuario Estándar' | 'Administrador' | 'Superusuario'>('Usuario Estándar');
  const [facultadSeleccionada, setFacultadSeleccionada] = useState(
    user.facultadNombre || 'Ingeniería y Tecnología'
  );

  const [password, setPassword] = useState('Temp2026*');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const [errorValidacion, setErrorValidacion] = useState('');
  const [exito, setExito] = useState(false);

  const facultadesDisponibles = [
    'Ingeniería y Tecnología',
    'Ciencias Económicas',
    'Jurisprudencia y Ciencias Sociales',
    'Ciencias de la Salud',
    'Humanidades',
  ];

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 4) {
      valor = valor.slice(0, 4) + '-' + valor.slice(4, 8);
    }
    setTelefono(valor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion('');

    const correoInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@catolica\.edu\.sv$/;
    if (!correoInstitucionalRegex.test(correo.trim().toLowerCase())) {
      setErrorValidacion('El correo debe pertenecer obligatoriamente al dominio institucional (@catolica.edu.sv).');
      return;
    }

    if (telefono.trim() !== '') {
      const telefonoRegex = /^\d{4}-\d{4}$/;
      if (!telefonoRegex.test(telefono)) {
        setErrorValidacion('El número de teléfono debe tener el formato salvadoreño válido: ####-#### (ej. 2224-0196).');
        return;
      }
    }

    if (password.length < 6) {
      setErrorValidacion('La contraseña temporal debe tener al menos 6 caracteres.');
      return;
    }

    setExito(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">Crear usuario</h2>
        <p className="text-xs text-gray-500 mt-1">
          {esSuperUsuario
            ? 'Superusuario · Creación y asignación global de roles y facultades.'
            : `Administrador de Facultad · Creación de usuarios estándar para ${user.facultadNombre || 'Ingeniería y Tecnología'}.`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/80 p-8 space-y-6 shadow-sm">
        
        {/* Nombres y Apellidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Nombres *</label>
            <input
              type="text"
              required
              value={nombres}
              onChange={e => setNombres(e.target.value)}
              placeholder="Ej. Mariana"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#050758]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Apellidos *</label>
            <input
              type="text"
              required
              value={apellidos}
              onChange={e => setApellidos(e.target.value)}
              placeholder="Ej. López"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#050758]"
            />
          </div>
        </div>

        {/* Correo institucional estricto @catolica.edu.sv */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Correo institucional *</label>
          <input
            type="email"
            required
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            placeholder="Ej. nombre@catolica.edu.sv"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#050758]"
          />
          <span className="text-[10px] text-gray-400">Debe utilizar obligatoriamente el dominio @catolica.edu.sv.</span>
        </div>

        {/* Teléfono opcional */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Teléfono (Opcional)</label>
          <input
            type="text"
            value={telefono}
            onChange={handleTelefonoChange}
            maxLength={9}
            placeholder="2224-0196"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#050758]"
          />
          <span className="text-[10px] text-gray-400">Formato opcional: ####-####.</span>
        </div>

        {/* ROL y FACULTAD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Rol de usuario *</label>
            {esSuperUsuario ? (
              <select
                value={rolAsignado}
                onChange={(e) => setRolAsignado(e.target.value as 'Usuario Estándar' | 'Administrador' | 'Superusuario')}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium bg-white focus:outline-none focus:border-[#050758] cursor-pointer"
              >
                <option value="Usuario Estándar">Usuario Estándar</option>
                <option value="Administrador">Administrador</option>
                <option value="Superusuario">Superusuario</option>
              </select>
            ) : (
              <input
                type="text"
                disabled
                value="Usuario Estándar"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 cursor-not-allowed font-medium"
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Facultad *</label>
            {esSuperUsuario ? (
              <select
                value={facultadSeleccionada}
                onChange={(e) => setFacultadSeleccionada(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium bg-white focus:outline-none focus:border-[#050758] cursor-pointer"
              >
                {facultadesDisponibles.map((fac) => (
                  <option key={fac} value={fac}>{fac}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                value={user.facultadNombre || 'Ingeniería y Tecnología'}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 cursor-not-allowed font-medium"
              />
            )}
          </div>
        </div>

        {/* Cuadro informativo exclusivo para Admin (para Superusuario se omite por completo) */}
        {esAdministrador && (
          <div className="bg-[#050758]/5 border border-[#050758]/15 rounded-xl p-4 flex items-center gap-3">
            <Info className="w-4 h-4 text-[#050758] shrink-0" />
            <p className="text-xs text-[#050758] font-medium">
              Creando usuario con rol Usuario Estándar limitado a la facultad de {user.facultadNombre || 'Ingeniería y Tecnología'}.
            </p>
          </div>
        )}

        {/* Contraseña temporal visible */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Contraseña temporal *</label>
          <div className="relative flex items-center">
            <input
              type={mostrarPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#050758] pr-10"
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mensaje requerido sobre el envío del token al correo */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
            Al crear el usuario será enviado un token de autenticación al correo ingresado para que pueda acceder al sistema y loguearse. El usuario deberá cambiar su contraseña temporal en su primer inicio de sesión.
          </p>
        </div>

        {/* Errores de validación */}
        {errorValidacion && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <p className="text-xs font-bold">{errorValidacion}</p>
          </div>
        )}

        {/* Éxito */}
        {exito && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-bold">¡Usuario creado con éxito! Se ha enviado el token de acceso a su correo institucional.</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold px-5 py-3 rounded-xl transition cursor-pointer"
          >
            {exito ? 'Salir' : 'Cancelar'}
          </button>
          <button
            type="submit"
            className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm"
          >
            Crear usuario
          </button>
        </div>
      </form>
    </div>
  );
};