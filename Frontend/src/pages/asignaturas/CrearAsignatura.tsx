import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { universidadApi } from '../../services/universidadApi';
import type { CarreraApi, FacultadApi, SedeApi } from '../../services/universidadApi';
import { asignaturasApi, type AsignaturaApi } from '../../services/asignaturasApi';

export const CrearAsignatura: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Estados del formulario para la nueva asignatura
  const [nombreAsignatura, setNombreAsignatura] = useState('');
  const [codigoAsignatura, setCodigoAsignatura] = useState('');
  const [prerrequisito, setPrerrequisito] = useState('Ninguno');
  const [filtroPrerrequisito, setFiltroPrerrequisito] = useState('');
  const [horasCiclo, setHorasCiclo] = useState('80');
  const [horasTeoricas, setHorasTeoricas] = useState('3');
  const [horasPracticas, setHorasPracticas] = useState('0');
  const [duracionSemanas, setDuracionSemanas] = useState('20');
  const [duracionClase, setDuracionClase] = useState('50 minutos');
  const [cantidadUV, setCantidadUV] = useState('4');
  const [carreraSeleccionada, setCarreraSeleccionada] = useState('');
  const [areaFormacion, setAreaFormacion] = useState('Básicas');
  const [modalidad, setModalidad] = useState<'presencial' | 'semipresencial' | 'nopresencial'>('presencial');

  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [facultadSeleccionada, setFacultadSeleccionada] = useState('');
  const [sedesDisponibles, setSedesDisponibles] = useState<SedeApi[]>([]);
  const [facultadesDisponibles, setFacultadesDisponibles] = useState<FacultadApi[]>([]);
  const [carrerasDisponibles, setCarrerasDisponibles] = useState<CarreraApi[]>([]);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState<AsignaturaApi[]>([]);
  const [errorFacultades, setErrorFacultades] = useState('');
  const [errorPrerrequisitos, setErrorPrerrequisitos] = useState('');
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');
  const [asignaturaCreadaId, setAsignaturaCreadaId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!user || (!esSuperUsuario && !esAdministrador)) return;

    let vigente = true;

    Promise.allSettled([
      universidadApi.listarSedes(),
      universidadApi.listarFacultades(),
      universidadApi.listarCarreras(),
    ])
      .then(([resultadoSedes, resultadoFacultades, resultadoCarreras]) => {
        if (!vigente) return;
        setErrorFacultades('');
        const errores: string[] = [];
        let facultadesActivas: FacultadApi[] = [];

        if (resultadoSedes.status === 'fulfilled') {
          setSedesDisponibles(resultadoSedes.value.filter((sede) => sede.estado === 'activo'));
        } else {
          setSedesDisponibles([]);
          errores.push(
            resultadoSedes.reason instanceof Error
              ? resultadoSedes.reason.message
              : 'No se pudieron cargar las sedes.',
          );
        }

        if (resultadoFacultades.status === 'fulfilled') {
          facultadesActivas = resultadoFacultades.value
            .filter((facultad) => facultad.estado === 'activo');
          setFacultadesDisponibles(facultadesActivas);
        } else {
          setFacultadesDisponibles([]);
          errores.push(
            resultadoFacultades.reason instanceof Error
              ? resultadoFacultades.reason.message
              : 'No se pudieron cargar las facultades.',
          );
        }

        if (resultadoCarreras.status === 'fulfilled') {
          setCarrerasDisponibles(resultadoCarreras.value
            .filter((carrera) => carrera.estado === 'activo'));
        } else {
          setCarrerasDisponibles([]);
          errores.push(
            resultadoCarreras.reason instanceof Error
              ? resultadoCarreras.reason.message
              : 'No se pudieron cargar las carreras.',
          );
        }

        if (esAdministrador) {
          const facultadAdmin = facultadesActivas.find((facultad) =>
            (user.facultadId !== undefined && facultad.idFacultad === user.facultadId)
            || facultad.nombreFacultad === user.facultadNombre);
          setFacultadSeleccionada(facultadAdmin ? String(facultadAdmin.idFacultad) : '');
          setSedeSeleccionada(facultadAdmin ? String(facultadAdmin.idSede) : '');
        } else {
          setFacultadSeleccionada('');
          setSedeSeleccionada('');
        }
        if (errores.length > 0) setErrorFacultades(errores.join(' '));
      })
      .finally(() => {
        if (vigente) setCargandoCatalogos(false);
      });

    asignaturasApi.listar()
      .then((asignaturas) => {
        if (vigente) {
          setAsignaturasDisponibles(asignaturas);
          setErrorPrerrequisitos('');
        }
      })
      .catch((error: unknown) => {
        if (vigente) {
          setErrorPrerrequisitos(
            error instanceof Error ? error.message : 'No se pudieron cargar las asignaturas prerrequisito.',
          );
        }
      });

    return () => { vigente = false; };
  }, [user, esSuperUsuario, esAdministrador]);

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

  const facultadAdmin = facultadesDisponibles.find((facultad) =>
    (user.facultadId !== undefined && facultad.idFacultad === user.facultadId)
    || facultad.nombreFacultad === user.facultadNombre);
  const sedeIdActual = Number(sedeSeleccionada);
  const facultadIdActual = Number(facultadSeleccionada);
  const facultadesFiltradas = esSuperUsuario
    ? facultadesDisponibles.filter((facultad) => facultad.idSede === sedeIdActual)
    : facultadAdmin ? [facultadAdmin] : [];
  const facultadActual = facultadesDisponibles.find(
    (facultad) => facultad.idFacultad === facultadIdActual,
  );
  const carrerasFiltradas = carrerasDisponibles.filter((carrera) =>
    carrera.idFacultad === facultadIdActual);
  const prerrequisitosFiltrados = asignaturasDisponibles.filter((asignatura) => {
    if (asignatura.estado !== 'activo' || !facultadActual) return false;
    if (asignatura.idFacultad !== facultadActual.idFacultad) return false;
    if (esSuperUsuario && asignatura.idSede !== sedeIdActual) return false;
    const texto = `${asignatura.codigoAsignatura} ${asignatura.nombreAsignatura} ${asignatura.nombreFacultad ?? ''} ${asignatura.nombreSede ?? ''}`
      .toLocaleLowerCase();
    return texto.includes(filtroPrerrequisito.trim().toLocaleLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGuardado('');
    const carrera = carrerasFiltradas.find((item) => String(item.idCarrera) === carreraSeleccionada);
    if (!carrera) {
      setErrorGuardado('Selecciona una carrera activa para registrar la asignatura.');
      return;
    }

    setGuardando(true);
    try {
      const creado = await asignaturasApi.crear({
        idCarrera: carrera.idCarrera,
        idPrerrequisitoAsignatura: prerrequisito === 'Ninguno' || prerrequisito === 'Bachillerato'
          ? null
          : Number(prerrequisito),
        prerrequisitoNoAsignatura: prerrequisito === 'Bachillerato' ? 'Bachillerato' : null,
        nombreAsignatura: nombreAsignatura.trim(),
        codigoAsignatura: codigoAsignatura.trim(),
        areaFormacion: areaFormacion.trim(),
        horasCiclo: Number(horasCiclo),
        horasSemana: Number(horasTeoricas),
        horasPracticas: Number(horasPracticas),
        duracionCicloSemana: Number(duracionSemanas),
        duracionHoraClase: Number.parseInt(duracionClase.replace(/\D/g, ''), 10) || 0,
        unidadesValorativas: Number(cantidadUV),
        modalidad,
        descripcionAsignatura: null,
        estrategiaMetodologica: null,
        evaluacion: null,
        fuentesElectronicas: null,
      });
      setAsignaturaCreadaId(creado.idAsignatura);
      setGuardadoExitoso(true);
    } catch (error) {
      setErrorGuardado(error instanceof Error ? error.message : 'No se pudo guardar la asignatura.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Encabezado Superior */}
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight mt-0.5">
          Crear Nueva Asignatura
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          {esSuperUsuario
            ? 'Superusuario · Creación y asignación global de asignaturas.'
            : `${user.facultadNombre || 'Ingeniería y Tecnología'} · Completa los datos para incorporar un nuevo recurso académico.`}
        </p>
      </div>

      {/* Alerta Informativa Superior */}
      <div className="bg-[#050758]/5 border border-[#050758]/15 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#050758] shrink-0 mt-0.5" />
        <p className="text-xs text-[#050758] font-medium leading-relaxed">
          La asignatura se incorporará al catálogo de la facultad con 7 secciones de programa.
        </p>
      </div>

      {/* Estructura Principal de Dos Columnas */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda: Formulario (8 columnas) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Identificación de la asignatura</h3>
            <p className="text-xs text-gray-500 mt-0.5">Los campos marcados con * son obligatorios.</p>
          </div>

          <div className="space-y-5">
            {/* Nombre de la asignatura */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Nombre de la asignatura <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Introducción a la Inteligencia Artificial"
                value={nombreAsignatura}
                onChange={(e) => setNombreAsignatura(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
              />
            </div>

            {/* El superusuario selecciona sede y facultad; el administrador usa su facultad asignada */}
            <div className={`grid grid-cols-1 ${esSuperUsuario ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Código de la asignatura <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. IAI302"
                  value={codigoAsignatura}
                  onChange={(e) => setCodigoAsignatura(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
                />
              </div>

              {esSuperUsuario && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Sede <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={cargandoCatalogos || sedesDisponibles.length === 0}
                    value={sedeSeleccionada}
                    onChange={(e) => {
                      setSedeSeleccionada(e.target.value);
                      setFacultadSeleccionada('');
                      setCarreraSeleccionada('');
                      setPrerrequisito('Ninguno');
                    }}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                  >
                    <option value="" disabled>
                      {cargandoCatalogos ? 'Cargando sedes...' : 'Selecciona una sede'}
                    </option>
                    {sedesDisponibles.map((sede) => (
                      <option key={sede.idSede} value={String(sede.idSede)}>{sede.nombreSede}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Facultad <span className="text-red-500">*</span>
                </label>
                {esSuperUsuario ? (
                  <select
                    required
                    disabled={!sedeSeleccionada || facultadesFiltradas.length === 0}
                    value={facultadSeleccionada}
                    onChange={(e) => {
                      setFacultadSeleccionada(e.target.value);
                      setCarreraSeleccionada('');
                      setPrerrequisito('Ninguno');
                    }}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                  >
                    <option value="" disabled>
                      {!sedeSeleccionada
                        ? 'Primero selecciona una sede'
                        : facultadesFiltradas.length === 0
                          ? 'No hay facultades activas en esta sede'
                          : 'Selecciona una facultad'}
                    </option>
                    {facultadesFiltradas.map((facultad) => (
                        <option key={facultad.idFacultad} value={String(facultad.idFacultad)}>
                          {facultad.nombreFacultad}
                        </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={facultadAdmin?.nombreFacultad ?? 'No hay una facultad asignada a esta cuenta'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 font-medium cursor-not-allowed"
                  />
                )}
                {errorFacultades && (
                  <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2">
                    <p className="text-xs font-bold">{errorFacultades}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Área de formación <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={areaFormacion}
                  onChange={(e) => setAreaFormacion(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                >
                  <option value="Humanísticas">Humanísticas</option>
                  <option value="Básicas">Básicas</option>
                  <option value="Técnica">Técnica</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Modalidad <span className="text-red-500">*</span>
                </label>
                <select
                  value={modalidad}
                  onChange={(e) => setModalidad(e.target.value as typeof modalidad)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                >
                  <option value="presencial">Presencial</option>
                  <option value="semipresencial">Semipresencial</option>
                  <option value="nopresencial">No presencial</option>
                </select>
              </div>
            </div>

            {/* Prerrequisito y carrera */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Prerrequisito
                </label>
                <input
                  type="search"
                  value={filtroPrerrequisito}
                  onChange={(e) => setFiltroPrerrequisito(e.target.value)}
                  placeholder="Buscar por código, nombre o facultad"
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
                />
                <select
                  value={prerrequisito}
                  disabled={!facultadActual || Boolean(errorPrerrequisitos)}
                  onChange={(e) => setPrerrequisito(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                >
                  <option value="Ninguno">Ninguno</option>
                  <option value="Bachillerato">Bachillerato</option>
                  {prerrequisitosFiltrados.map((asignatura) => (
                      <option key={asignatura.idAsignatura} value={String(asignatura.idAsignatura)}>
                        {asignatura.codigoAsignatura} · {asignatura.nombreAsignatura} ({asignatura.nombreFacultad || 'Sin facultad'})
                      </option>
                    ))}
                  {facultadActual && prerrequisitosFiltrados.length === 0 && (
                    <option value="" disabled>
                      {filtroPrerrequisito
                        ? 'No hay coincidencias en esta sede y facultad'
                        : 'No hay asignaturas prerrequisito en esta sede y facultad'}
                    </option>
                  )}
                </select>
                {errorPrerrequisitos && (
                  <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-3 py-2">
                    <p className="text-xs font-bold">{errorPrerrequisitos}</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Carrera responsable <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={carreraSeleccionada}
                  onChange={(e) => setCarreraSeleccionada(e.target.value)}
                  disabled={!facultadActual || carrerasFiltradas.length === 0}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                >
                  <option value="">
                    {!facultadActual
                      ? 'Selecciona una facultad primero'
                      : carrerasFiltradas.length === 0
                        ? 'No hay carreras activas en esta facultad'
                        : 'Selecciona una carrera'}
                  </option>
                  {carrerasFiltradas.map((carrera) => (
                    <option key={carrera.idCarrera} value={String(carrera.idCarrera)}>
                      {carrera.nombreCarrera}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Horas por ciclo y Horas teóricas por semana */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Horas por ciclo <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={horasCiclo}
                  onChange={(e) => setHorasCiclo(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Horas teóricas por semana <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={horasTeoricas}
                  onChange={(e) => setHorasTeoricas(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Horas prácticas por semana <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={horasPracticas}
                  onChange={(e) => setHorasPracticas(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Duración del ciclo en semanas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={duracionSemanas}
                  onChange={(e) => setDuracionSemanas(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>
            </div>

            {/* Duración del ciclo en semanas y Duración de la hora clase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Duración de la hora clase <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={duracionClase}
                  onChange={(e) => setDuracionClase(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>
            </div>

            {/* Cantidad de UV */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Cantidad de UV <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={cantidadUV}
                  onChange={(e) => setCantidadUV(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>

            </div>
          </div>

          {/* Mensaje de éxito */}
          {guardadoExitoso && (
            <div className="bg-[#8CB83C]/20 border border-[#8CB83C]/60 text-[#2D5A1E] rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
              <p className="text-xs font-bold">¡Asignatura creada con éxito! Puedes seguir editando o salir cuando desees.</p>
            </div>
          )}
          {errorGuardado && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <p className="text-xs font-bold">{errorGuardado}</p>
            </div>
          )}

          {/* Botones inferiores de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/asignaturas')}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
            >
              {guardadoExitoso ? 'Salir' : 'Cancelar'}
            </button>

            {asignaturaCreadaId ? (
              <button
                type="button"
                onClick={() => navigate(`/asignaturas/${asignaturaCreadaId}`)}
                className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer"
              >
                Completar detalles
              </button>
            ) : (
              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-60"
              >
                {guardando ? 'Guardando...' : 'Crear asignatura'}
              </button>
            )}
          </div>
        </div>

        {/* Columna Derecha: Tarjetas Informativas Laterales (4 columnas) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <h4 className="text-sm font-bold text-gray-900">Antes de continuar</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Verifica el nombre y el código institucional. El código debe ser único dentro de la facultad.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Podrás completar los contenidos y asignar colaboradores después de la creación.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Alcance del recurso</h4>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Facultad responsable</span>
              <p className="text-xs font-bold text-gray-900">
                {facultadActual?.nombreFacultad ?? 'Selecciona una sede y facultad'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Estado</span>
              <p className="text-xs font-bold text-gray-700">Disponible en el catálogo de facultad</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};