import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Info, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';
import { asignaturasApi, type AsignaturaApi } from '../../services/asignaturasApi';
import { useAsignaturaDetalle } from '../../hooks/useAsignaturaDetalle';

export const GeneralidadesAsignatura: React.FC = () => {
  const { asignaturaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { detalle, cargando, error: errorCarga } = useAsignaturaDetalle();

  // Estados para los campos de generalidades
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [prerrequisito, setPrerrequisito] = useState('Ninguno');
  const [filtroPrerrequisito, setFiltroPrerrequisito] = useState('');
  const [prerrequisitoNoAsignatura, setPrerrequisitoNoAsignatura] = useState('');
  const [prerrequisitosDisponibles, setPrerrequisitosDisponibles] = useState<AsignaturaApi[]>([]);
  const [areaFormacion, setAreaFormacion] = useState('');
  const [modalidad, setModalidad] = useState<'presencial' | 'semipresencial' | 'nopresencial'>('presencial');
  const [horasCiclo, setHorasCiclo] = useState('');
  const [horasTeoricas, setHorasTeoricas] = useState('');
  const [horasPracticas, setHorasPracticas] = useState('');
  const [duracionSemanas, setDuracionSemanas] = useState('');
  const [duracionClase, setDuracionClase] = useState('');
  const [cantidadUv, setCantidadUv] = useState('');

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!detalle || !user) return;
    const asignatura = detalle.asignatura;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialize the edit form from the saved generalities.
    setNombre(asignatura.nombreAsignatura);
    setCodigo(asignatura.codigoAsignatura);
    setAreaFormacion(['Humanísticas', 'Básicas', 'Técnica'].includes(asignatura.areaFormacion)
      ? asignatura.areaFormacion
      : 'Básicas');
    setModalidad(asignatura.modalidad);
    setHorasCiclo(String(asignatura.horasCiclo));
    setHorasTeoricas(String(asignatura.horasSemana));
    setHorasPracticas(String(asignatura.horasPracticas));
    setDuracionSemanas(String(asignatura.duracionCicloSemana));
    setDuracionClase(String(asignatura.duracionHoraClase));
    setCantidadUv(String(asignatura.unidadesValorativas));
    setPrerrequisito(
      detalle.prerrequisitos[0]
        ? String(detalle.prerrequisitos[0].idPrerrequisito)
        : detalle.prerrequisitosNoAsignatura[0]
          ? detalle.prerrequisitosNoAsignatura[0].nombre === 'Bachillerato'
            ? 'Bachillerato'
            : 'Otro'
          : 'Ninguno',
    );
    setPrerrequisitoNoAsignatura(detalle.prerrequisitosNoAsignatura[0]?.nombre ?? '');
    asignaturasApi.listar()
      .then((items) => setPrerrequisitosDisponibles(
        items.filter((item) => item.idAsignatura !== asignatura.idAsignatura && item.estado === 'activo'),
      ))
      .catch((error: unknown) => setErrorGuardado(
        error instanceof Error ? error.message : 'No se pudieron cargar los prerrequisitos.',
      ));
  }, [detalle, user]);

  // Estados para el modal de confirmación de salida
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  if (!user) return null;
  if (cargando) return <p className="text-xs text-gray-500">Cargando generalidades...</p>;
  if (errorCarga || !detalle) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
        <p className="text-xs font-bold">{errorCarga || 'No se encontró la asignatura.'}</p>
      </div>
    );
  }
  if (detalle.estado === 'inactivo') {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <p className="text-sm font-bold text-gray-900">La asignatura está desactivada y no se puede editar.</p>
        <button type="button" onClick={() => navigate(`/asignaturas/${asignaturaId}`)} className="text-xs font-bold text-[#050758]">
          Volver al programa
        </button>
      </div>
    );
  }

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detalle || !user) return;
    setErrorGuardado('');
    setGuardando(true);
    try {
      await asignaturasApi.actualizarGeneralidades(Number(asignaturaId), {
        nombreAsignatura: nombre,
        codigoAsignatura: codigo,
        areaFormacion,
        horasCiclo: Number(horasCiclo),
        horasSemana: Number(horasTeoricas),
        horasPracticas: Number(horasPracticas),
        duracionCicloSemana: Number(duracionSemanas),
        duracionHoraClase: Number(duracionClase),
        unidadesValorativas: Number(cantidadUv),
        modalidad,
        idPrerrequisitoAsignatura: prerrequisito === 'Ninguno' ? null : Number(prerrequisito),
        prerrequisitoNoAsignatura: prerrequisito === 'Bachillerato'
          ? 'Bachillerato'
          : prerrequisito === 'Otro' ? prerrequisitoNoAsignatura || null : null,
      });
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 4000);
    } catch (error) {
      setErrorGuardado(error instanceof Error ? error.message : 'No se pudieron guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Encabezado y Botón Volver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Generalidades
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {detalle.asignatura.nombreAsignatura} · {detalle.asignatura.codigoAsignatura} · {detalle.asignatura.nombreCarrera || ''} · {detalle.asignatura.nombreFacultad || ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => intentarSalir(`/asignaturas/${asignaturaId || 'PRG101'}`)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al programa
        </button>
      </div>

      {/* Estado del Documento / Metadatos */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
        <span className="inline-flex items-center gap-1.5 text-gray-700">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          {detalle.estado === 'activo' ? 'Activa' : 'Desactivada'}
        </span>
        <span>·</span>
        <span>{detalle.planes[0] ? `${detalle.planes[0].cicloInicio} - ${detalle.planes[0].cicloFin}` : 'Sin plan vinculado'}</span>
        <span>·</span>
        <span>Edición de programa académico</span>
        <span>·</span>
        <span>{user.nombre} · Tu sesión</span>
      </div>

      {/* Alerta de Cambios Guardados con Éxito */}
      {guardadoExitoso && (
        <div className="bg-[#8CB83C]/20 border border-[#8CB83C] text-[#2D5A1E] rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all">
          <CheckCircle2 className="w-5 h-5 text-[#4C8C23] shrink-0" />
          <p className="text-xs font-bold">Cambios guardados con éxito</p>
        </div>
      )}
      {errorGuardado && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          <p className="text-xs font-bold">{errorGuardado}</p>
        </div>
      )}

      {/* Contenedor Principal de Generalidades */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Generalidades</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Información estructural, horas y valor académico de la asignatura.
          </p>
        </div>

        <form onSubmit={handleGuardar} className="space-y-5">
          {/* Fila 1: Nombre y Código */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Código *</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Área de formación *</label>
              <select required value={areaFormacion} onChange={(e) => setAreaFormacion(e.target.value)} className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none cursor-pointer">
                <option value="Humanísticas">Humanísticas</option>
                <option value="Básicas">Básicas</option>
                <option value="Técnica">Técnica</option>
              </select>
            </div>
          </div>

          {/* Fila 2: Prerrequisito */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Buscar prerrequisito</label>
              <input
                type="search"
                value={filtroPrerrequisito}
                onChange={(e) => setFiltroPrerrequisito(e.target.value)}
                placeholder="Por código, nombre o facultad"
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5 mt-2">Prerrequisito</label>
              <select
                value={prerrequisito}
                onChange={(e) => {
                  setPrerrequisito(e.target.value);
                  if (e.target.value !== 'Otro') {
                    setPrerrequisitoNoAsignatura(e.target.value === 'Bachillerato' ? 'Bachillerato' : '');
                  }
                }}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="Ninguno">Sin prerrequisito</option>
                <option value="Bachillerato">Bachillerato</option>
                {prerrequisitoNoAsignatura && prerrequisitoNoAsignatura !== 'Bachillerato' && (
                  <option value="Otro">Otro: {prerrequisitoNoAsignatura}</option>
                )}
                {prerrequisitosDisponibles.filter((item) => {
                  const texto = `${item.codigoAsignatura} ${item.nombreAsignatura} ${item.nombreFacultad ?? ''}`
                    .toLocaleLowerCase();
                  return texto.includes(filtroPrerrequisito.trim().toLocaleLowerCase());
                }).map((item) => (
                  <option key={item.idAsignatura} value={String(item.idAsignatura)}>
                    {item.codigoAsignatura} · {item.nombreAsignatura} ({item.nombreFacultad || 'Sin facultad'})
                  </option>
                ))}
              </select>
            </div>
            <div />
          </div>

          {/* Fila 3: Horas por ciclo y Horas teóricas por semana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Horas por ciclo *</label>
              <input
                type="number"
                min="0"
                required
                value={horasCiclo}
                onChange={(e) => setHorasCiclo(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Horas teóricas por semana *</label>
              <input
                type="number"
                min="0"
                required
                value={horasTeoricas}
                onChange={(e) => setHorasTeoricas(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Horas prácticas por semana *</label>
              <input type="number" min="0" required value={horasPracticas} onChange={(e) => setHorasPracticas(e.target.value)} className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none" />
            </div>
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Modalidad *</label>
              <select value={modalidad} onChange={(e) => setModalidad(e.target.value as typeof modalidad)} className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none cursor-pointer">
                <option value="presencial">Presencial</option>
                <option value="semipresencial">Semipresencial</option>
                <option value="nopresencial">No presencial</option>
              </select>
            </div>
          </div>

          {/* Fila 4: Duración del ciclo en semanas y Duración de la hora clase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Duración del ciclo en semanas *</label>
              <input
                type="number"
                min="0"
                required
                value={duracionSemanas}
                onChange={(e) => setDuracionSemanas(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Duración de la hora clase *</label>
              <input
                type="number"
                min="0"
                required
                value={duracionClase}
                onChange={(e) => setDuracionClase(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Fila 5: Cantidad de UV */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Cantidad de UV *</label>
              <input
                type="number"
                min="0"
                required
                value={cantidadUv}
                onChange={(e) => setCantidadUv(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Banner Informativo Inferior */}
          <div className="bg-[#F2F4FB] border border-[#050758]/10 rounded-xl px-4 py-3.5 flex items-center gap-3">
            <Info className="w-4 h-4 text-[#050758] shrink-0" />
            <p className="text-xs font-semibold text-[#050758]">
              Carga semanal: 3 horas teóricas y 1 hora práctica. Total: 80 horas por ciclo.
            </p>
          </div>

          {/* Pie de Formulario: Estado, Botón Salir y Botón Guardar */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {guardando ? 'Guardando...' : 'Cambios sin guardar · visibles en esta versión de trabajo'}
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => intentarSalir(`/asignaturas/${asignaturaId || 'PRG101'}`)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
              >
                Salir
              </button>

              <button
                type="submit"
                disabled={guardando}
                className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer justify-center"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Nota Inferior Institucional */}
      <div className="text-xs text-gray-400 px-1">
        <p>Los cambios de esta asignatura se reflejarán en los programas vinculados a los planes de estudio correspondientes.</p>
      </div>

      {/* Modal de Confirmación de Salida */}
      <ModalAlertaSalida
        isOpen={modalSalidaAbierto}
        mensaje="¿Ya guardaste los cambios antes de salir?"
        onConfirmar={() => {
          setModalSalidaAbierto(false);
          if (rutaDestinoPendiente) navigate(rutaDestinoPendiente);
        }}
        onCancelar={() => {
          setModalSalidaAbierto(false);
          setRutaDestinoPendiente(null);
        }}
      />
    </div>
  );
};