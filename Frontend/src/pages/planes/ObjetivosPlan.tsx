import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, BookOpen, Plus, Info, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

export const ObjetivosPlan: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pestaña activa: 'general' o 'especificos'
  const [pestanaActiva, setPestanaActiva] = useState<'general' | 'especificos'>('general');

  // Estados
  const [objetivoGeneral, setObjetivoGeneral] = useState('');
  const [objetivosEspecificos, setObjetivosEspecificos] = useState<string[]>(['']);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [modalReferenciarAbierto, setModalReferenciarAbierto] = useState(false);

  // Estados para el modal de confirmación de salida
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 4000);
  };

  const handleAgregarEspecifico = () => {
    setObjetivosEspecificos([...objetivosEspecificos, '']);
  };

  const handleEliminarEspecifico = (index: number) => {
    setObjetivosEspecificos(objetivosEspecificos.filter((_, i) => i !== index));
  };

  const handleCambiarEspecifico = (index: number, valor: string) => {
    const nuevos = [...objetivosEspecificos];
    nuevos[index] = valor;
    setObjetivosEspecificos(nuevos);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      {/* Encabezado y Botón Volver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Objetivos de la carrera
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Ingeniería en Sistemas · ISI-2027 · Ingeniería y Tecnología
          </p>
        </div>

        <button
          type="button"
          onClick={() => intentarSalir(`/planes/${planId || 'ISI-2027'}`)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al menú del plan
        </button>
      </div>

      {/* Metadatos */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
        <span className="inline-flex items-center gap-1.5 text-gray-700">
          <span className="w-2 h-2 rounded-full bg-gray-500" />
          Borrador
        </span>
        <span>·</span>
        <span>Versión 2027–2031</span>
        <span>·</span>
        <span>Edición por asignación</span>
        <span>·</span>
        <span>{user.nombre} · Tu sesión</span>
      </div>

      {/* Contenedor Principal con Pestañas */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        
        {/* Sistema de Pestañas */}
        <div className="flex border-b border-gray-200 gap-8">
          <button
            type="button"
            onClick={() => setPestanaActiva('general')}
            className={`pb-3 text-xs font-bold transition cursor-pointer relative ${
              pestanaActiva === 'general'
                ? 'text-[#050758] border-b-2 border-[#050758]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('especificos')}
            className={`pb-3 text-xs font-bold transition cursor-pointer relative ${
              pestanaActiva === 'especificos'
                ? 'text-[#050758] border-b-2 border-[#050758]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Específicos
          </button>
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          {pestanaActiva === 'general' ? (
            /* ================= PESTAÑA GENERAL ================= */
            <div className="space-y-6 animate-fadeIn">
              <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Objetivo general *
                </label>
                <textarea
                  rows={8}
                  value={objetivoGeneral}
                  onChange={(e) => setObjetivoGeneral(e.target.value)}
                  placeholder="Escribe acá..."
                  className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed placeholder:text-gray-400"
                />
                <div className="flex justify-end pt-1">
                  <span className="text-[11px] text-gray-400 font-medium">
                    {objetivoGeneral.length} caracteres
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-400">
                  {guardadoExitoso ? (
                    <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all">
                      <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                      ¡Objetivo guardado con éxito!
                    </span>
                  ) : (
                    'Cambios sin guardar · visibles en esta versión de trabajo'
                  )}
                </p>

                {/* Grupo inferior izquierdo simétrico y botón Guardar a la derecha */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => intentarSalir(`/planes/${planId || 'ISI-2027'}`)}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
                    >
                      Salir
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalReferenciarAbierto(true)}
                      className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      Referenciar
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= PESTAÑA ESPECÍFICOS ================= */
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#F3F4F8] border border-gray-200/60 rounded-xl p-4 flex items-center gap-3 text-gray-700">
                <Info className="w-5 h-5 text-[#050758] shrink-0" />
                <p className="text-xs font-medium">
                  Estos objetivos se vinculan con las competencias en la sección 17: Matriz de congruencia.
                </p>
              </div>

              {objetivosEspecificos.map((obj, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Objetivo específico {index + 1} *
                    </label>
                    {objetivosEspecificos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleEliminarEspecifico(index)}
                        className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                        title="Eliminar objetivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    value={obj}
                    onChange={(e) => handleCambiarEspecifico(index, e.target.value)}
                    placeholder="Escribe acá..."
                    className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed placeholder:text-gray-400"
                  />
                </div>
              ))}

              <div>
                <button
                  type="button"
                  onClick={handleAgregarEspecifico}
                  className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agregar más
                </button>
              </div>

              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-400">
                  {guardadoExitoso ? (
                    <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all">
                      <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                      ¡Objetivos guardados con éxito!
                    </span>
                  ) : (
                    'Cambios sin guardar · visibles en esta versión de trabajo'
                  )}
                </p>

                {/* Grupo inferior izquierdo simétrico y botón Guardar a la derecha */}
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => intentarSalir(`/planes/${planId || 'ISI-2027'}`)}
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
                    >
                      Salir
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalReferenciarAbierto(true)}
                      className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      Referenciar
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <p>Cada pestaña se guarda de forma independiente. Los cambios se incorporan al expediente curricular.</p>
        <span className="font-semibold text-gray-500">04 / 17</span>
      </div>

      <ModalReferencia
        isOpen={modalReferenciarAbierto}
        onClose={() => setModalReferenciarAbierto(false)}
      />

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