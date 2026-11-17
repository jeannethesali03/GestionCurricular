import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Info, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface CatalogoAsignaturaItem {
  id: string;
  nombre: string;
  codigo: string;
  ciclo: string;
  unidadesValorativas: number;
  responsable: string;
  permiso: 'Asignada' | 'Solo lectura';
}

export const CatalogoAsignaturasUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [asignaturas, setAsignaturas] = useState<CatalogoAsignaturaItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState('');
  const [cicloFiltro, setCicloFiltro] = useState('Todos');
  const [permisoFiltro, setPermisoFiltro] = useState('Todos');

  useEffect(() => {
    if (!user) return;

    const obtenerCatalogo = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch(
          `http://localhost:5000/api/catalogo/facultad/${user.facultadId ?? 'fac-ing'}`
        );
        if (respuesta.ok) {
          const datos: CatalogoAsignaturaItem[] = await respuesta.json();
          setAsignaturas(datos);
        }
      } catch (error) {
        console.error('Error al cargar el catálogo de la facultad:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerCatalogo();
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

  const totalAsignadas = asignaturas.filter((a) => a.permiso === 'Asignada').length;
  const asignaturaPrincipal = asignaturas[0];

  const ciclosDisponibles = useMemo(() => {
    return Array.from(new Set(asignaturas.map((a) => a.ciclo)));
  }, [asignaturas]);

  return (
    <div className="space-y-6">
      {/* Encabezado de Página (Sin migas de pan) */}
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
          Catálogo de Facultad (Lectura)
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {user.facultadNombre ?? 'Ingeniería y Tecnología'} · Catálogo completo de consulta; solo puedes editar tus asignaturas asignadas.
        </p>
      </div>

      {/* Banner Informativo Superior */}
      <div className="bg-[#F2F4FB] border border-[#050758]/10 rounded-xl px-4 py-3.5 flex items-center gap-3">
        <Info className="w-4 h-4 text-[#050758] shrink-0" />
        <p className="text-xs font-semibold text-[#050758]">
          Acceso de solo lectura. Programación I y Fundamentos de Informática tienen permiso de edición por asignación.
        </p>
      </div>

      {/* 3 Tarjetas Indicadoras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {asignaturas.length}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            Asignaturas en catálogo
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {user.facultadNombre ? 1 : 0}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            Facultad de {user.facultadNombre ?? 'Ingeniería y Tecnología'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {asignaturas.length}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            Programas vinculados a ISI-2027
          </p>
        </div>
      </div>

      {/* Tarjeta Principal de Tabla y Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Asignaturas de la facultad</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Datos académicos, responsables y permisos de acceso por asignatura.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
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

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Permiso</label>
            <select
              value={permisoFiltro}
              onChange={(e) => setPermisoFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos los permisos</option>
              <option value="Asignada">Asignada</option>
              <option value="Solo lectura">Solo lectura</option>
            </select>
          </div>
        </div>

        {/* Tabla de Asignaturas del Catálogo */}
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
                    Cargando catálogo de facultad...
                  </td>
                </tr>
              ) : asignaturasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No hay asignaturas en el catálogo para mostrar.
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
                          {asig.permiso === 'Asignada' ? 'Editar programa' : 'Consultar'}
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