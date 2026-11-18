import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Info, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const EditarUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Si es un usuario estándar (o no autenticado), muestra la pantalla limpia de Página no encontrada (404)
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

  // Datos simulados iniciales del usuario a editar
  const [nombres, setNombres] = useState('Lucía');
  const [apellidos, setApellidos] = useState('Méndez');
  const [correo, setCorreo] = useState('lucia.mendez@catolica.edu.sv');
  const [telefono, setTelefono] = useState('2224-0182');
  
  // Si es superusuario puede cambiar rol y facultad; admin lo mantiene fijo
  const [rolAsignado, setRolAsignado] = useState<'Usuario Estándar' | 'Administrador' | 'Superusuario'>('Usuario Estándar');
  const [facultadSeleccionada, setFacultadSeleccionada] = useState(
    user.facultadNombre || 'Ingeniería y Tecnología'
  );

  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [estado, setEstado] = useState('Activo');

  const [errorValidacion, setErrorValidacion] = useState('');
  const [exito, setExito] = useState(false);

  const facultadesDisponibles = [
    'Ingeniería y Tecnología',
    'Ciencias Económicas',
    'Jurisprudencia y Ciencias Sociales',
    'Ciencias de la Salud',
    'Humanidades',
  ];

  // Formateador automático de teléfono salvadoreño (opcional)
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

    // Validación estricta de correo institucional (@catolica.edu.sv)
    const correoInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@catolica\.edu\.sv$/;
    if (!correoInstitucionalRegex.test(correo.trim().toLowerCase())) {
      setErrorValidacion('El correo debe pertenecer obligatoriamente al dominio institucional (@catolica.edu.sv).');
      return;
    }

    // Validación de teléfono (opcional, pero si se llena debe ser formato ####-####)
    if (telefono.trim() !== '') {
      const telefonoRegex = /^\d{4}-\d{4}$/;
      if (!telefonoRegex.test(telefono)) {
        setErrorValidacion('El número de teléfono debe tener el formato salvadoreño válido: ####-#### (ej. 2224-0196).');
        return;
      }
    }

    // Validación de contraseña solo si deciden cambiarla
    if (password.trim() !== '' && password.length < 6) {
      setErrorValidacion('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setExito(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">Editar usuario</h2>
        <p className="text-xs text-gray-500 mt-1">
          {esSuperUsuario
            ? `Superusuario · Edición global de credenciales y permisos (ID: ${id || '1'})`
            : `Administrador de Facultad · Edición de usuario estándar (ID: ${id || '1'})`}
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
            placeholder="2224-0182"
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

        {/* Cuadro informativo exclusivo para Admin */}
        {esAdministrador && (
          <div className="bg-[#050758]/5 border border-[#050758]/15 rounded-xl p-4 flex items-center gap-3">
            <Info className="w-4 h-4 text-[#050758] shrink-0" />
            <p className="text-xs text-[#050758] font-medium">
              Rol asignado: Usuario Estándar. El alcance se limita a la facultad de {user.facultadNombre || 'Ingeniería y Tecnología'}.
            </p>
          </div>
        )}

        {/* Nueva contraseña opcional y Estado de la cuenta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Nueva contraseña (opcional)</label>
            <div className="relative flex items-center">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Dejar en blanco para mantener"
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Estado de la cuenta</label>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 bg-white focus:outline-none cursor-pointer"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <p className="text-[11px] text-gray-400">Deja la contraseña en blanco para conservar las credenciales actuales.</p>

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
            <p className="text-xs font-bold">¡Cambios guardados con éxito en el perfil del usuario!</p>
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
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};