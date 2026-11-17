import React from 'react';

interface ModalAlertaSalidaProps {
  isOpen: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  mensaje?: string;
}

export const ModalAlertaSalida: React.FC<ModalAlertaSalidaProps> = ({
  isOpen,
  onConfirmar,
  onCancelar,
  mensaje = '¿Ya guardaste los cambios antes de salir?'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-gray-100">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-base font-bold text-[#050758]">Confirmación de salida</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{mensaje}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {/* Botón SÍ (salir) en blanco */}
          <button
            type="button"
            onClick={onConfirmar}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
          >
            Sí, salir
          </button>
          {/* Botón NO (quedarse) en azul principal para evitar inercia */}
          <button
            type="button"
            onClick={onCancelar}
            className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            No, quedarme
          </button>
        </div>
      </div>
    </div>
  );
};