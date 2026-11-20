import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Info, Plus, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';
import { asignaturasApi } from '../../services/asignaturasApi';
import { useAsignaturaDetalle } from '../../hooks/useAsignaturaDetalle';

export const ObjetivosAsignatura: React.FC = () => {
  const { asignaturaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { detalle, cargando, error: errorCarga } = useAsignaturaDetalle();

  const [pestanaActiva, setPestanaActiva] = useState<'general' | 'especificos'>('especificos');
  const [objetivoGeneral, setObjetivoGeneral] = useState('');
  const [especificos, setEspecificos] = useState<string[]>(['']);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!detalle) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialize the objective editor from saved rows.
    setObjetivoGeneral(detalle.objetivos.find((item) => item.tipo === 'general')?.descripcionObjetivo ?? '');
    const objetivos = detalle.objetivos
      .filter((item) => item.tipo === 'especifico')
      .map((item) => item.descripcionObjetivo);
    setEspecificos(objetivos.length > 0 ? objetivos : ['']);
  }, [detalle]);

  // Estados para el modal de confirmación de salida
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  const handleAgregarEspecifico = () => {
    setEspecificos([...especificos, '']);
  };

  const handleEliminarEspecifico = (indexParaEliminar: number) => {
    if (especificos.length <= 1) return;
    const actualizados = especificos.filter((_, index) => index !== indexParaEliminar);
    setEspecificos(actualizados);
  };

  const handleCambiarEspecifico = (index: number, valor: string) => {
    const nuevos = [...especificos];
    nuevos[index] = valor;
    setEspecificos(nuevos);
  };

  const handleGuardar = async () => {
    if (!detalle || !user) return;
    const objetivosLimpios = especificos.map((item) => item.trim()).filter(Boolean);
    if (!objetivoGeneral.trim() || objetivosLimpios.length === 0) {
      setErrorGuardado('Registra el objetivo general y al menos un objetivo específico.');
      return;
    }

    setErrorGuardado('');
    setGuardando(true);
    try {
      await asignaturasApi.actualizarObjetivos(
        Number(asignaturaId), objetivoGeneral, objetivosLimpios,
      );
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 4000);
    } catch (error) {
      setErrorGuardado(error instanceof Error ? error.message : 'No se pudieron guardar los objetivos.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <p className="text-xs text-gray-500">Cargando objetivos...</p>;
  if (errorCarga || !detalle) return (
    <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
      <p className="text-xs font-bold">{errorCarga || 'No se encontró la asignatura.'}</p>
    </div>
  );
  if (detalle.estado === 'inactivo') return <p className="text-xs font-semibold text-gray-600">La asignatura está desactivada y no se puede editar.</p>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      {/* Encabezado y Botón Volver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Objetivos de la asignatura
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {detalle.asignatura.nombreAsignatura} · {detalle.asignatura.codigoAsignatura} · {detalle.asignatura.nombreFacultad || ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => intentarSalir(`/asignaturas/${asignaturaId || 'PRG101'}`)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al menú del programa
        </button>
      </div>

      {/* Estado del Documento / Metadatos */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
        <span className="inline-flex items-center gap-1.5 text-gray-700">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          {detalle.estado === 'activo' ? 'Activa' : 'Desactivada'}
        </span>
        <span>·</span>
        <span>{detalle.planes[0] ? `${detalle.planes[0].cicloInicio} - ${detalle.planes[0].cicloFin}` : 'Sin plan vinculado'}</span>
        <span>·</span>
        <span className="text-[#050758] font-bold">Edición por asignación</span>
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

      {/* Contenedor Principal con Pestañas */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Pestañas Superiores */}
        <div className="flex border-b border-gray-200 px-6 pt-3 gap-8">
          <button
            type="button"
            onClick={() => setPestanaActiva('general')}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              pestanaActiva === 'general'
                ? 'border-[#050758] text-[#050758]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('especificos')}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              pestanaActiva === 'especificos'
                ? 'border-[#050758] text-[#050758]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Específicos
          </button>
        </div>

        {/* Contenido de la Pestaña */}
        <div className="p-6 space-y-6">
          {pestanaActiva === 'general' ? (
            <div className="space-y-5">
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 focus-within:border-[#050758]">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Objetivo general *
                </label>
                <textarea
                  rows={4}
                  value={objetivoGeneral}
                  onChange={(e) => setObjetivoGeneral(e.target.value)}
                  placeholder="Escribe acá el objetivo general..."
                  className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400"
                />
                <div className="text-right text-[10px] text-gray-400 mt-1">
                  {objetivoGeneral.length} caracteres
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Nota informativa */}
              <div className="bg-[#F2F4FB] border border-[#050758]/10 rounded-xl px-4 py-3.5 flex items-center gap-3">
                <Info className="w-4 h-4 text-[#050758] shrink-0" />
                <p className="text-xs font-semibold text-[#050758]">
                  Estos objetivos se vinculan con las actividades de evaluación y contenidos de la asignatura.
                </p>
              </div>

              {/* Lista de Objetivos Específicos con Renumeración Automática */}
              <div className="space-y-4">
                {especificos.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">
                    No hay objetivos específicos registrados. Haz clic en "Agregar más" para añadir uno.
                  </p>
                ) : (
                  especificos.map((obj, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition relative group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Objetivo específico {index + 1} *
                        </label>
                        <button
                          type="button"
                          onClick={() => handleEliminarEspecifico(index)}
                          disabled={especificos.length <= 1}
                          title="Eliminar objetivo"
                          className="text-gray-300 hover:text-red-600 transition p-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={obj}
                        onChange={(e) => handleCambiarEspecifico(index, e.target.value)}
                        placeholder="Escribe acá el objetivo específico..."
                        className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400"
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Botón Agregar Más */}
              <div>
                <button
                  type="button"
                  onClick={handleAgregarEspecifico}
                  className="inline-flex items-center gap-2 border border-dashed border-gray-300 hover:border-[#050758] hover:bg-gray-50 text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agregar más
                </button>
              </div>
            </div>
          )}

          {errorGuardado && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
              <p className="text-xs font-bold">{errorGuardado}</p>
            </div>
          )}

          {/* Pie del Formulario: Estado, Botón Salir y Botón Guardar */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {guardando ? 'Guardando...' : guardadoExitoso ? 'Cambios guardados con éxito' : 'Cambios sin guardar · visibles en esta versión de trabajo'}
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
                type="button"
                onClick={handleGuardar}
                disabled={guardando}
                className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer justify-center"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nota Inferior Institucional */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <p>Cada pestaña se guarda de forma independiente. Los cambios se incorporan al programa académico.</p>
        <p className="font-semibold">03 / 07</p>
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