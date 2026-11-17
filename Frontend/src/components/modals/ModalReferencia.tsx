import React, { useState } from 'react';
import { CheckCircle2, Save, X, Trash2, Plus } from 'lucide-react';

export interface ReferenciaItem {
  id: string;
  fragmento: string;
  cita: string;
}

interface ModalReferenciaProps {
  isOpen: boolean;
  onClose: () => void;
  referencias?: ReferenciaItem[];
  onAgregar?: () => void;
  onEliminar?: (id: string) => void;
  onCambiar?: (id: string, campo: 'fragmento' | 'cita', valor: string) => void;
  onGuardar?: () => void;
}

export const ModalReferencia: React.FC<ModalReferenciaProps> = ({
  isOpen,
  onClose,
  referencias: referenciasProp,
  onAgregar,
  onEliminar,
  onCambiar,
  onGuardar,
}) => {
  // Estado interno por si la vista no le pasa propiedades externas
  const [referenciasInternas, setReferenciasInternas] = useState<ReferenciaItem[]>([
    {
      id: '1',
      fragmento: '',
      cita: '',
    },
  ]);

  const referencias = referenciasProp || referenciasInternas;

  const handleAgregarLocal = () => {
    if (onAgregar) {
      onAgregar();
    } else {
      setReferenciasInternas([
        ...referenciasInternas,
        { id: Date.now().toString(), fragmento: '', cita: '' },
      ]);
    }
  };

  const handleEliminarLocal = (id: string) => {
    if (onEliminar) {
      onEliminar(id);
    } else {
      setReferenciasInternas(referenciasInternas.filter((r) => r.id !== id));
    }
  };

  const handleCambiarLocal = (id: string, campo: 'fragmento' | 'cita', valor: string) => {
    if (onCambiar) {
      onCambiar(id, campo, valor);
    } else {
      setReferenciasInternas(
        referenciasInternas.map((r) => (r.id === id ? { ...r, [campo]: valor } : r))
      );
    }
  };

  const [modalGuardadoExitoso, setModalGuardadoExitoso] = useState(false);

  if (!isOpen) return null;

  const handleGuardarInterno = () => {
    setModalGuardadoExitoso(true);
    if (onGuardar) onGuardar();
    setTimeout(() => {
      setModalGuardadoExitoso(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-[#050758]">Referencias bibliográficas</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Agregue referencias a los textos que ha utilizado en esta sección
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-8 overflow-y-auto space-y-6 bg-gray-50/50 flex-1">
          {modalGuardadoExitoso && (
            <div className="bg-[#8CB83C]/20 border border-[#8CB83C] text-[#2D5A1E] rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
              <p className="text-xs font-bold">¡Referencias guardadas con éxito!</p>
            </div>
          )}

          {/* Lista de Referencias */}
          {referencias.map((ref, index) => (
            <div
              key={ref.id}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#050758]">
                  <span className="w-2 h-2 rounded-full bg-[#050758]" />
                  Referencia {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleEliminarLocal(ref.id)}
                  className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                  title="Eliminar referencia"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Fragmento del texto asociado */}
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Fragmento del texto asociado tal como ha sido escrito
                </label>
                <textarea
                  rows={2}
                  value={ref.fragmento}
                  onChange={(e) => handleCambiarLocal(ref.id, 'fragmento', e.target.value)}
                  placeholder="Escriba o pegue el fragmento..."
                  className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Ingresar Cita */}
              <div className="border border-gray-200 rounded-xl p-3 bg-white">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Ingresar Cita
                </label>
                <input
                  type="text"
                  value={ref.cita}
                  onChange={(e) => handleCambiarLocal(ref.id, 'cita', e.target.value)}
                  placeholder="Ej. Gaviria, T. (2021). El futuro del trabajo..."
                  className="w-full text-xs text-gray-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          ))}

          {/* Botón Agregar Referencia */}
          <div>
            <button
              type="button"
              onClick={handleAgregarLocal}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Agregar referencia
            </button>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="px-8 py-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            Cambios sin guardar · visibles en esta versión de trabajo
          </p>

          <button
            type="button"
            onClick={handleGuardarInterno}
            className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer w-full sm:w-auto justify-center"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
};