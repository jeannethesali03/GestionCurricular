import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Edit3, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface UsuarioItem {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  facultad: string;
  rol: 'Usuario Estándar';
  estado: 'Activo' | 'Inactivo';
}

export const GestionUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Si es un usuario estándar, muestra la pantalla limpia de Página no encontrada (404)
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

  // Lista simulada de usuarios
  const [usuarios] = useState<UsuarioItem[]>([
    {
      id: '1',
      nombres: 'Lucía',
      apellidos: 'Méndez',
      email: 'lucia.mendez@catolica.edu.sv',
      facultad: 'Ingeniería y Tecnología',
      rol: 'Usuario Estándar',
      estado: 'Activo',
    },
    {
      id: '2',
      nombres: 'Diego',
      apellidos: 'Torres',
      email: 'diego.torres@catolica.edu.sv',
      facultad: 'Ingeniería y Tecnología',
      rol: 'Usuario Estándar',
      estado: 'Activo',
    },
    {
      id: '3',
      nombres: 'Ana',
      apellidos: 'Beltrán',
      email: 'ana.beltran@catolica.edu.sv',
      facultad: 'Ciencias Económicas',
      rol: 'Usuario Estándar',
      estado: 'Inactivo',
    },
  ]);

  const [busqueda, setBusqueda] = useState('');
  const [facultadFiltro, setFacultadFiltro] = useState(
    esSuperUsuario ? 'Todas' : (user?.facultadNombre || 'Ingeniería y Tecnología')
  );
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');

  // Filtrado y ordenamiento automático: Activos primero, Inactivos al final
  const usuariosFiltrados = useMemo(() => {
    const filtrados = usuarios.filter((item) => {
      if (esAdministrador && user?.facultadNombre && item.facultad !== user.facultadNombre) {
        return false;
      }

      const texto = busqueda.toLowerCase().trim();
      const coincideTexto =
        !texto ||
        item.nombres.toLowerCase().includes(texto) ||
        item.apellidos.toLowerCase().includes(texto) ||
        item.email.toLowerCase().includes(texto);

      const coincideFacultad =
        facultadFiltro === 'Todas' || item.facultad === facultadFiltro;

      const coincideEstado =
        estadoFiltro === 'Todos' ||
        (estadoFiltro === 'Activos' && item.estado === 'Activo') ||
        (estadoFiltro === 'Inactivos' && item.estado === 'Inactivo');

      return coincideTexto && coincideFacultad && coincideEstado;
    });

    return filtrados.sort((a, b) => {
      if (a.estado === 'Activo' && b.estado === 'Inactivo') return -1;
      if (a.estado === 'Inactivo' && b.estado === 'Activo') return 1;
      return 0;
    });
  }, [usuarios, busqueda, facultadFiltro, estadoFiltro, user, esAdministrador]);

  const totalActivos = usuarios.filter((u) => u.estado === 'Activo').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Encabezado Superior */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            {esSuperUsuario ? 'Gestión Global de Usuarios' : 'Usuarios de Facultad'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {esSuperUsuario
              ? 'Administra los Usuarios Estándar de todas las facultades del sistema.'
              : `Crea y administra únicamente Usuarios Estándar de ${user.facultadNombre || 'Ingeniería y Tecnología'}.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/usuarios/nuevo')}
          className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          + Crear usuario
        </button>
      </div>

      {/* 3 Tarjetas Indicadoras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{totalActivos}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Usuarios activos</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{usuarios.length}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Total en directorio</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {esSuperUsuario ? 'Global' : '1'}
          </p>
          <p className="text-sm font-bold text-gray-800 mt-2">Alcance de facultad</p>
        </div>
      </div>

      {/* Tarjeta Principal de Directorio */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Directorio de usuarios</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Los usuarios desactivados se muestran automáticamente al final del listado.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Buscar</label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, segundo nombre, apellido o correo"
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Facultad</label>
            {esSuperUsuario ? (
              <select
                value={facultadFiltro}
                onChange={(e) => setFacultadFiltro(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
              >
                <option value="Todas">Todas las facultades</option>
                <option value="Ingeniería y Tecnología">Ingeniería y Tecnología</option>
                <option value="Ciencias Económicas">Ciencias Económicas</option>
              </select>
            ) : (
              <span className="text-xs font-medium text-gray-800 mt-0.5 truncate">
                {user.facultadNombre || 'Ingeniería y Tecnología'}
              </span>
            )}
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Estado</label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activos">Activos</option>
              <option value="Inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F8] text-gray-500 text-[11px] font-semibold border-b border-gray-200/80">
                <th className="py-3.5 px-5">Usuario</th>
                <th className="py-3.5 px-4">Facultad</th>
                <th className="py-3.5 px-4">Rol</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-5">
                      <p className="font-bold text-gray-900">{item.nombres} {item.apellidos}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.email}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{item.facultad}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{item.rol}</td>
                    <td className="py-4 px-4">
                      {item.estado === 'Activo' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-gray-300" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/usuarios/detalle/${item.id}`)}
                          title="Ver detalles"
                          className="text-[#050758] hover:text-[#090c7a] transition cursor-pointer p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/usuarios/editar/${item.id}`)}
                          title="Editar usuario"
                          className="text-amber-600 hover:text-amber-800 transition cursor-pointer p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/usuarios/desactivar/${item.id}`)}
                          title="Desactivar usuario"
                          className="text-red-500 hover:text-red-700 transition cursor-pointer p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};