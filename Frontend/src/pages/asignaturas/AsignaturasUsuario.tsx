import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Info, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AsignaturaPrograma {
  id: string;
  nombre: string;
  codigo: string;
  ciclo: string;
  unidadesValorativas: number;
  responsable: string;
  permiso: 'Asignada' | 'Solo lectura';
  seccionesCompletas: number;
  seccionesTotal: number;
}

export const AsignaturasUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [asignaturas, setAsignaturas] = useState<AsignaturaPrograma[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState('');
  const [cicloFiltro, setCicloFiltro] = useState('Todos');
  const [permisoFiltro, setPermisoFiltro] = useState('Asignada');

  useEffect(() => {
    if (!user) return;

    const obtenerAsignaturas = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch(
          `http://localhost:5000/api/asignaturas/usuario/${user.id}`
        );
        if (respuesta.ok) {
          const datos: AsignaturaPrograma[] = await respuesta.json();
          setAsignaturas(datos);
        }
      } catch (error) {
        console.error('Error al cargar las asignaturas asignadas:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerAsignaturas();
  }, [user]);

  const asignaturasFiltradas = useMemo(() => {
    return asignaturas.filter((item) => {
      const coincideTexto =
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.codigo.toLowerCase().includes(busqueda.toLowerCase());

      const coincideCiclo =
        cicloFiltro === 'Todos' || item.ciclo === cicloFiltro;

      const coincidePermiso =
        permisoFiltro === 'Todos' || item.permiso === permisoFiltro;

      return coincideTexto && coincideCiclo && coincidePermiso;
    });
  }, [asignaturas, busqueda, cicloFiltro, permisoFiltro]);

  if (!user) return null;

  const asignaturasConEdicion = asignaturas.filter((a) => a.permiso === 'Asignada');
  const asignaturaPrincipal = asignaturas[0];

  const ciclosDisponibles = useMemo(() => {
    const unicos = Array.from(new Set(asignaturas.map((a) => a.ciclo)));
    return unicos;
  }, [asignaturas]);

  return (
    <div className="space-y-6">
      {/* Encabezado de Página */}
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
          Mis Asignaturas
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Tus programas asignados, reunidos en un solo espacio de trabajo.
        </p>
      </div>

      {/* Banner Informativo Superior */}
      <div className="bg-[#F2F4FB] border border-[#050758]/10 rounded-xl px-4 py-3.5 flex items-center gap-3">
        <Info className="w-4 h-4 text-[#050758] shrink-0" />
        <p className="text-xs font-semibold text-[#050758]">
          Tienes {asignaturasConEdicion.length}{' '}
          {asignaturasConEdicion.length === 1
            ? 'asignatura asignada'
            : 'asignaturas asignadas'}{' '}
          con permiso de edición.
        </p>
      </div>

      {/* 3 Tarjetas Indicadoras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {asignaturasConEdicion.length}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            Asignaturas a tu cargo
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {user.facultadNombre ? 1 : 0}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            {user.facultadNombre ? `Facultad de ${user.facultadNombre}` : 'Sin facultad asignada'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {asignaturaPrincipal
              ? `${asignaturaPrincipal.seccionesCompletas}/${asignaturaPrincipal.seccionesTotal}`
              : '0/0'}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            {asignaturaPrincipal
              ? `Secciones de ${asignaturaPrincipal.nombre}`
              : 'Secciones de asignatura'}
          </p>
        </div>
      </div>

      {/* Tarjeta Principal de Tabla y Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Programas asignados</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Datos académicos, responsables y permisos de acceso por asignatura.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Buscar asignatura */}
          <div className="md:col-span-6 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">
              Buscar asignatura
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre o código de la asignatura"
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Ciclo */}
          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Ciclo</label>
            <select
              value={cicloFiltro}
              onChange={(e) => setCicloFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos los ciclos</option>
              {ciclosDisponibles.map((ciclo) => (
                <option key={ciclo} value={ciclo}>
                  {ciclo}
                </option>
              ))}
            </select>
          </div>

          {/* Permiso */}
          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Permiso</label>
            <select
              value={permisoFiltro}
              onChange={(e) => setPermisoFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Asignada">Asignada a mí</option>
              <option value="Todos">Todos los permisos</option>
              <option value="Solo lectura">Solo lectura</option>
            </select>
          </div>
        </div>

        {/* Tabla de Programas Asignados */}
        <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F8] text-gray-500 text-[11px] font-semibold border-b border-gray-200/80">
                <th className="py-3.5 px-5">Asignatura</th>
                <th className="py-3.5 px-4">Ciclo</th>
                <th className="py-3.5 px-4">Unidades</th>
                <th className="py-3.5 px-4">Responsable</th>
                <th className="py-3.5 px-4">Permiso</th>
                <th className="py-3.5 px-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Cargando asignaturas asignadas...
                  </td>
                </tr>
              ) : asignaturasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No hay asignaturas asignadas para mostrar.
                  </td>
                </tr>
              ) : (
                asignaturasFiltradas.map((asig) => (
                  <tr key={asig.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-5">
                      <p className="font-bold text-gray-900">{asig.nombre}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{asig.codigo}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{asig.ciclo}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {asig.unidadesValorativas} UV
                    </td>
                    <td className="py-4 px-4 text-gray-600">{asig.responsable}</td>
                    <td className="py-4 px-4">
                      {asig.permiso === 'Asignada' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          Asignada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <span className="w-2 h-2 rounded-full bg-gray-400" />
                          Solo lectura
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => navigate(`/asignaturas/${asig.id}`)}
                        className="inline-flex items-center gap-1 text-[#050758] hover:underline font-semibold cursor-pointer"
                      >
                        <span>
                          {asig.permiso === 'Asignada' ? 'Editar programa' : 'Ver programa'}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de Tabla / Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs text-gray-400">
            Mostrando {asignaturasFiltradas.length} de {asignaturas.length} registros
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="px-3.5 py-2 rounded-lg bg-gray-200/80 text-gray-400 text-xs font-medium cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-[#050758] text-white text-xs font-bold flex items-center justify-center"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="px-3.5 py-2 rounded-lg bg-gray-200/80 text-gray-400 text-xs font-medium cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};