import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, Plus, Trash2, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

export interface RequisitoItem {
  id: string;
  titulo: string;
  descripcion: string;
}

export const CondicionesPermanencia: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pestanaActiva, setPestanaActiva] = useState<'descripcion' | 'requisitos'>('descripcion');
  const [descripcionGeneral, setDescripcionGeneral] = useState('');
  
  const [requisitos, setRequisitos] = useState<RequisitoItem[]>([
    {
      id: '1',
      titulo: '',
      descripcion: '',
    },
  ]);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [modalReferenciarAbierto, setModalReferenciarAbierto] = useState(false);

  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  const handleAgregarRequisito = () => {
    setRequisitos([
      ...requisitos,
      {
        id: Date.now().toString(),
        titulo: '',
        descripcion: '',
      },
    ]);
  };

  const handleEliminarRequisito = (id: string) => {
    setRequisitos(requisitos.filter((item) => item.id !== id));
  };

  const handleActualizarRequisito = (id: string, campo: 'titulo' | 'descripcion', valor: string) => {
    setRequisitos(
      requisitos.map((item) => (item.id === id ? { ...item, [campo]: valor } : item))
    );
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Módulo Planes / Sección 13 de 17
          </p>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Condiciones y requisitos de permanencia y graduación de estudiantes
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Ingeniería en Sistemas · ISI-2027 · Ingeniería y Tecnología
          </p>
        </div>

        <button
          type="button"
          onClick={() => intentarSalir(`/planes/${planId || 'ISI-2027'}`)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Volver al menú del plan
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
        <span className="inline-flex items-center gap-1.5 text-gray-700">
          <span className="w-2 h-2 rounded-full bg-gray-500" />
          Borrador
        </span>
        <span>·</span>
        <span>Versión 2027-2031</span>
        <span>·</span>
        <span className="text-[#050758] font-bold">Edición por asignación</span>
        <span>·</span>
        <span>{user.nombre} · Tu sesión</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="flex border-b border-gray-200 px-6 pt-3 gap-8">
          <button
            type="button"
            onClick={() => setPestanaActiva('descripcion')}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              pestanaActiva === 'descripcion'
                ? 'border-[#050758] text-[#050758]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Descripción
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('requisitos')}
            className={`pb-3 text-xs font-bold transition border-b-2 cursor-pointer ${
              pestanaActiva === 'requisitos'
                ? 'border-[#050758] text-[#050758]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Requisitos
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleGuardar} className="space-y-6">
            {pestanaActiva === 'descripcion' ? (
              <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Descripción *
                </label>
                <textarea
                  rows={10}
                  value={descripcionGeneral}
                  onChange={(e) => setDescripcionGeneral(e.target.value)}
                  placeholder="Escribe acá..."
                  className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed placeholder:text-gray-400 font-normal"
                />
                <div className="text-right text-[10px] text-gray-400 mt-2 font-medium">
                  {descripcionGeneral.length} caracteres
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-6">
                  {requisitos.map((item, index) => {
                    const numeroFormateado = String(index + 1).padStart(2, '0');
                    return (
                      <div
                        key={item.id}
                        className="border border-gray-200 rounded-2xl p-6 bg-gray-50/40 space-y-4 relative shadow-2xs group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            ÍTEM {numeroFormateado} - TÍTULO
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEliminarRequisito(item.id)}
                            className="text-gray-300 hover:text-red-600 transition p-1 cursor-pointer"
                            title="Eliminar requisito"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition">
                          <input
                            type="text"
                            value={item.titulo}
                            onChange={(e) => handleActualizarRequisito(item.id, 'titulo', e.target.value)}
                            placeholder="Escribe acá el título del ítem..."
                            className="w-full text-xs text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400 font-normal"
                          />
                        </div>

                        <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            DESCRIPCIÓN
                          </label>
                          <textarea
                            rows={3}
                            value={item.descripcion}
                            onChange={(e) => handleActualizarRequisito(item.id, 'descripcion', e.target.value)}
                            placeholder="Escribe acá la descripción..."
                            className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400 font-normal"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleAgregarRequisito}
                    className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar ítem
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400">
                {guardadoExitoso ? (
                  <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all">
                    <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                    ¡Condiciones guardadas con éxito!
                  </span>
                ) : (
                  'Cambios sin guardar · visibles en esta versión de trabajo'
                )}
              </p>

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
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <p>Cada pestaña se guarda de forma independiente. Los cambios se incorporan al expediente curricular.</p>
        <span className="font-semibold text-gray-500">13 / 17</span>
      </div>

      <ModalReferencia
        isOpen={modalReferenciarAbierto}
        onClose={() => setModalReferenciarAbierto(false)}
      />

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