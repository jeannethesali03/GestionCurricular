import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Info, ArrowUpRight, Plus, ShieldCheck, Power, RotateCcw, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { universidadApi } from '../../services/universidadApi';
import { asignaturasApi, type AsignaturaApi } from '../../services/asignaturasApi';

export interface AsignaturaPrograma {
  id: string;
  nombre: string;
  codigo: string;
  unidadesValorativas: number;
  responsable: string;
  facultad: string;
  sede: string;
  estado: 'activo' | 'inactivo';
  asignadaPorPlan: boolean;
  asignadaDirectamente: boolean;
  seccionesCompletas: number;
  seccionesTotal: number;
}

export const AsignaturasUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [asignaturas, setAsignaturas] = useState<AsignaturaPrograma[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [sedesActivas, setSedesActivas] = useState<{ id: number; nombre: string }[]>([]);
  const [facultadesDisponibles, setFacultadesDisponibles] = useState<string[]>([]);
  const [errorFacultades, setErrorFacultades] = useState('');
  const [errorAsignaturas, setErrorAsignaturas] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [facultadFiltro, setFacultadFiltro] = useState('Todas');
  const [sedeFiltro, setSedeFiltro] = useState('Todas');
  const [origenFiltro, setOrigenFiltro] = useState('Todas');
  const [incluirInactivas, setIncluirInactivas] = useState(false);
  const [recarga, setRecarga] = useState(0);
  const [asignaturaPendiente, setAsignaturaPendiente] = useState<AsignaturaPrograma | null>(null);
  const [codigoConfirmacion, setCodigoConfirmacion] = useState('');
  const [mensajeCodigo, setMensajeCodigo] = useState('');
  const [errorOperacion, setErrorOperacion] = useState('');
  const [procesandoOperacion, setProcesandoOperacion] = useState(false);

  const rolActual = (user?.rol as string) || '';

  useEffect(() => {
    if (!user) return;
    let vigente = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Mark the list pending before loading the current user scope.
    setCargando(true);
    setErrorAsignaturas('');
    asignaturasApi.listar(incluirInactivas && rolActual === 'SUPER_USUARIO')
      .then((datos) => {
        if (vigente) setAsignaturas(datos.map(convertirAsignatura));
      })
      .catch((error: unknown) => {
        if (vigente) {
          setAsignaturas([]);
          setErrorAsignaturas(error instanceof Error ? error.message : 'No se pudieron cargar las asignaturas.');
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => { vigente = false; };
  }, [user, rolActual, incluirInactivas, recarga]);

  useEffect(() => {
    let vigente = true;
    Promise.all([universidadApi.listarFacultades(), universidadApi.listarSedes()])
      .then(([facultades, sedes]) => {
        if (vigente) {
          setFacultadesDisponibles(facultades.map((facultad) => facultad.nombreFacultad));
          setSedesActivas(sedes.map((sede) => ({ id: sede.idSede, nombre: sede.nombreSede })));
        }
      })
      .catch((error: unknown) => {
        if (vigente) {
          setErrorFacultades(
            error instanceof Error ? error.message : 'No se pudieron cargar sedes y facultades.',
          );
        }
      });
    return () => { vigente = false; };
  }, []);

  const asignaturasFiltradas = useMemo(() => {
    return asignaturas.filter((item) => {
      const coincideTexto =
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.codigo.toLowerCase().includes(busqueda.toLowerCase());

      const coincideSede = rolActual !== 'SUPER_USUARIO'
        || sedeFiltro === 'Todas'
        || item.sede === sedeFiltro;
      const coincideFacultad = rolActual !== 'SUPER_USUARIO'
        || facultadFiltro === 'Todas'
        || item.facultad === facultadFiltro;
      const coincideOrigen = rolActual !== 'USUARIO' && rolActual !== 'USUARIO_ESTANDAR'
        || origenFiltro === 'Todas'
        || (origenFiltro === 'Planes asignados' && item.asignadaPorPlan)
        || (origenFiltro === 'Asignadas directamente' && item.asignadaDirectamente);

      return coincideTexto && coincideSede && coincideFacultad && coincideOrigen;
    });
  }, [asignaturas, busqueda, facultadFiltro, sedeFiltro, origenFiltro, rolActual]);

  const asignaturaPrincipal = asignaturasFiltradas[0];

  if (!user) return null;

  const obtenerEncabezado = () => {
    if (rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO') {
      return {
        titulo: 'Mis Asignaturas Asignadas',
        subtitulo: `${user.facultadNombre ?? ''} · Listado exclusivo de programas bajo tu responsabilidad con permisos de edición.`,
      };
    }
    if (rolActual === 'ADMINISTRADOR') {
      return {
        titulo: 'Asignaturas de Facultad',
        subtitulo: `${user.facultadNombre ?? ''} · Administración integral, consulta y edición de todos los programas de la facultad.`,
      };
    }
    return {
      titulo: 'Todas las Asignaturas del Sistema',
      subtitulo: 'Acceso global a catálogos, programas y edición de asignaturas de todas las facultades.',
    };
  };

  const encabezado = obtenerEncabezado();

  const solicitarDesactivacion = async (asignatura: AsignaturaPrograma) => {
    setAsignaturaPendiente(asignatura);
    setCodigoConfirmacion('');
    setErrorOperacion('');
    setMensajeCodigo('');
    setProcesandoOperacion(true);
    try {
      await asignaturasApi.solicitarCodigoDesactivacion(Number(asignatura.id));
      setMensajeCodigo('Se envió un código de 6 dígitos a tu correo. Vence en 10 minutos.');
    } catch (error) {
      setErrorOperacion(error instanceof Error ? error.message : 'No se pudo enviar el código.');
    } finally {
      setProcesandoOperacion(false);
    }
  };

  const confirmarDesactivacion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!asignaturaPendiente || codigoConfirmacion.length !== 6) return;
    setProcesandoOperacion(true);
    setErrorOperacion('');
    try {
      await asignaturasApi.desactivar(
        Number(asignaturaPendiente.id),
        codigoConfirmacion,
      );
      setAsignaturaPendiente(null);
      setRecarga((actual) => actual + 1);
    } catch (error) {
      setErrorOperacion(error instanceof Error ? error.message : 'No se pudo desactivar la asignatura.');
    } finally {
      setProcesandoOperacion(false);
    }
  };

  const reactivarAsignatura = async (asignatura: AsignaturaPrograma) => {
    setProcesandoOperacion(true);
    setErrorOperacion('');
    try {
      await asignaturasApi.activar(Number(asignatura.id));
      setRecarga((actual) => actual + 1);
    } catch (error) {
      setErrorOperacion(error instanceof Error ? error.message : 'No se pudo reactivar la asignatura.');
    } finally {
      setProcesandoOperacion(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de Página */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            {encabezado.titulo}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{encabezado.subtitulo}</p>
        </div>

        {rolActual !== 'USUARIO_ESTANDAR' && rolActual !== 'USUARIO' && (
          <button
            type="button"
            onClick={() => navigate('/asignaturas/nuevo')}
            className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Crear nueva asignatura
          </button>
        )}
      </div>

      {/* Banner Informativo Superior */}
      <div className="bg-[#F2F4FB] border border-[#050758]/10 rounded-xl px-4 py-3.5 flex items-center gap-3">
        <Info className="w-4 h-4 text-[#050758] shrink-0" />
        <p className="text-xs font-semibold text-[#050758]">
          {rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO'
            ? `Se muestran las ${asignaturasFiltradas.length} asignaturas de tus planes y las que te asignaron directamente.`
            : `Visualizando catálogo completo con permisos de edición habilitados.`}
        </p>
      </div>

      {/* 3 Tarjetas Indicadoras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {asignaturasFiltradas.length}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            {rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO' ? 'Asignaturas a tu cargo' : 'Asignaturas registradas'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {facultadFiltro === 'Todas' ? facultadesDisponibles.length : 1}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            {facultadFiltro === 'Todas' ? 'Facultades en sistema' : `Facultad de ${facultadFiltro}`}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO' ? 'Mis programas asignados' : 'Catálogo de asignaturas'}
              </h3>
              {rolActual === 'SUPER_USUARIO' && (
                <label className="inline-flex items-center gap-2 mt-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={incluirInactivas}
                    onChange={(event) => setIncluirInactivas(event.target.checked)}
                    className="accent-[#050758]"
                  />
                  Mostrar asignaturas desactivadas
                </label>
              )}
            </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Datos académicos, responsables y acceso directo a la edición de programas.
          </p>
          </div>
        </div>

        {/* Barra de Filtros con selector de facultad para Superusuario */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className={`border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center ${
            rolActual === 'SUPER_USUARIO' ? 'md:col-span-4' : 'md:col-span-6'
          }`}>
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

          {rolActual === 'SUPER_USUARIO' && (
            <>
              <div className="md:col-span-2 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
                <label className="text-[10px] font-medium text-gray-400">Sede</label>
                <select
                  value={sedeFiltro}
                  onChange={(e) => setSedeFiltro(e.target.value)}
                  className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
                >
                  <option value="Todas">Todas las sedes</option>
                  {sedesActivas.map((sede) => (
                    <option key={sede.id} value={sede.nombre}>{sede.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
                <label className="text-[10px] font-medium text-gray-400">Facultad</label>
                <select
                  value={facultadFiltro}
                  onChange={(e) => setFacultadFiltro(e.target.value)}
                  className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
                >
                  <option value="Todas">Todas las facultades</option>
                  {facultadesDisponibles.map((fac) => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {(rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO') && (
            <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
              <label className="text-[10px] font-medium text-gray-400">Origen de asignación</label>
              <select
                value={origenFiltro}
                onChange={(e) => setOrigenFiltro(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
              >
                <option value="Todas">Todos los orígenes</option>
                <option value="Planes asignados">Planes asignados</option>
                <option value="Asignadas directamente">Asignadas directamente</option>
              </select>
            </div>
          )}

        </div>
        {errorFacultades && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            <p className="text-xs font-bold">{errorFacultades}</p>
          </div>
        )}

        {/* Tabla de Asignaturas */}
        <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F8] text-gray-500 text-[11px] font-semibold border-b border-gray-200/80">
                <th className="py-3.5 px-5">Asignatura</th>
                <th className="py-3.5 px-4">Unidades</th>
                <th className="py-3.5 px-4">Responsable</th>
                <th className="py-3.5 px-4">Facultad</th>
                <th className="py-3.5 px-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Cargando asignaturas...
                  </td>
                </tr>
              ) : errorAsignaturas && asignaturas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <div role="alert" className="inline-block bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                      <p className="text-xs font-bold">{errorAsignaturas}</p>
                    </div>
                  </td>
                </tr>
              ) : asignaturasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No hay asignaturas disponibles para mostrar.
                  </td>
                </tr>
              ) : (
                asignaturasFiltradas.map((asig) => (
                  <tr key={asig.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-5">
                      <p className="font-bold text-gray-900">{asig.nombre}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{asig.codigo}</p>
                      {asig.estado === 'inactivo' && (
                        <span className="inline-flex mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          Desactivada
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {asig.unidadesValorativas} UV
                    </td>
                    <td className="py-4 px-4 text-gray-600">{asig.responsable}</td>
                    <td className="py-4 px-4 text-gray-600">{asig.facultad}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {asig.estado === 'activo' ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/asignaturas/${asig.id}`)}
                            className="inline-flex items-center gap-1 text-[#050758] hover:underline font-semibold cursor-pointer"
                          >
                            <span>Editar programa</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-gray-400">Edición bloqueada</span>
                        )}
                        {rolActual === 'SUPER_USUARIO' && asig.estado === 'activo' && (
                          <button
                            type="button"
                            onClick={() => void solicitarDesactivacion(asig)}
                            title="Desactivar asignatura"
                            className="text-gray-400 hover:text-red-600 transition cursor-pointer"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        {rolActual === 'SUPER_USUARIO' && asig.estado === 'inactivo' && (
                          <button
                            type="button"
                            onClick={() => void reactivarAsignatura(asig)}
                            title="Reactivar asignatura"
                            className="text-gray-400 hover:text-emerald-700 transition cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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

      {/* Nota Informativa Inferior */}
      {(rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO') && (
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
          <p>
            Tu espacio muestra únicamente las asignaturas que te han sido asignadas. La creación de nuevas asignaturas está reservada a Administración.
          </p>
        </div>
      )}

      {errorOperacion && !asignaturaPendiente && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          <p className="text-xs font-bold">{errorOperacion}</p>
        </div>
      )}

      {asignaturaPendiente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={confirmarDesactivacion}
            className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#050758]">Confirmar desactivación</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {asignaturaPendiente.nombre} ({asignaturaPendiente.codigo}) no se eliminará; sus datos se conservarán.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAsignaturaPendiente(null)}
                disabled={procesandoOperacion}
                aria-label="Cerrar"
                className="text-gray-400 hover:text-gray-700 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3">
              <p className="text-xs font-bold">
                {mensajeCodigo || 'Enviando el código de confirmación a tu correo...'}
              </p>
            </div>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-gray-700">Código de 6 dígitos</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={codigoConfirmacion}
                onChange={(event) => setCodigoConfirmacion(event.target.value.replace(/\D/g, ''))}
                className="w-full border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs tracking-[0.3em] focus:outline-none"
              />
            </label>
            {errorOperacion && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
                <p className="text-xs font-bold">{errorOperacion}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAsignaturaPendiente(null)}
                disabled={procesandoOperacion}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={procesandoOperacion || !mensajeCodigo || codigoConfirmacion.length !== 6}
                className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-3 rounded-xl disabled:opacity-50"
              >
                Confirmar desactivación
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

function convertirAsignatura(asignatura: AsignaturaApi): AsignaturaPrograma {
  return {
    id: String(asignatura.idAsignatura),
    nombre: asignatura.nombreAsignatura,
    codigo: asignatura.codigoAsignatura,
    unidadesValorativas: asignatura.unidadesValorativas,
    responsable: asignatura.responsable || 'Sin asignar',
    facultad: asignatura.nombreFacultad || 'Sin facultad',
    sede: asignatura.nombreSede || 'Sin sede',
    estado: asignatura.estado,
    asignadaPorPlan: asignatura.asignadaPorPlan,
    asignadaDirectamente: asignatura.asignadaDirectamente,
    seccionesCompletas: asignatura.seccionesCompletas,
    seccionesTotal: asignatura.seccionesTotal,
  };
}