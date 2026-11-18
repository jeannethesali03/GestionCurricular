import React, { useState } from 'react';
import { X, CheckCircle2, Download, FileText } from 'lucide-react';

interface ModalDescargarReporteWordProps {
  isOpen: boolean;
  onClose: () => void;
  planNombre?: string;
  planCodigo?: string;
}

export const ModalDescargarReporteWord: React.FC<ModalDescargarReporteWordProps> = ({
  isOpen,
  onClose,
  planNombre = 'Ingeniería en Sistemas',
  planCodigo = 'ISI-2027',
}) => {
  const [tipografia, setTipografia] = useState<'Arial' | 'Times New Roman'>('Arial');
  const [descargando, setDescargando] = useState(false);

  if (!isOpen) return null;

  const handleDescargar = () => {
    setDescargando(true);
    setTimeout(() => {
      setDescargando(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              Descargar Reporte Word
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Ingeniería en Sistemas · {planCodigo} · Plan completo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-xl hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-6 overflow-y-auto bg-gray-50/50 flex-1">
          
          {/* Selector de Tipografía */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Tipografía del documento
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTipografia('Arial')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  tipografia === 'Arial'
                    ? 'border-[#050758] text-[#050758] bg-[#050758]/5'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Arial
              </button>
              <button
                type="button"
                onClick={() => setTipografia('Times New Roman')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  tipografia === 'Times New Roman'
                    ? 'border-[#050758] text-[#050758] bg-[#050758]/5'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Times New Roman
              </button>
            </div>
          </div>

          {/* Área de Vista Previa (Simulación Página A4) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6 max-w-2xl mx-auto w-full relative">
            <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3">
              <span>Vista previa · Página 1 de 28</span>
              <span>A4 · {tipografia} 11 pt</span>
            </div>

            {/* Contenido Simulado del Documento */}
            <div
              className="space-y-6 text-gray-800"
              style={{ fontFamily: tipografia === 'Arial' ? 'Arial, sans-serif' : '"Times New Roman", serif' }}
            >
              <div className="text-center space-y-2 pt-4">
                <h4 className="text-xs font-bold text-[#050758] uppercase tracking-wider">
                  Universidad del Pacífico
                </h4>
                <p className="text-[11px] text-gray-600 font-medium">
                  Facultad de Ingeniería y Tecnología
                </p>
                <h1 className="text-xl font-bold text-[#050758] pt-2">
                  Plan de estudio<br />{planNombre}
                </h1>
                <p className="text-[11px] text-gray-500 pt-1">
                  {planCodigo} · Vigencia 2027–2031 · Modalidad presencial
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <h5 className="text-xs font-bold text-gray-900 mb-1">
                    1. Generalidades de la carrera
                  </h5>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Título a otorgar: Ingeniero/a en Sistemas. El plan se desarrolla en 10 ciclos académicos de 20 semanas cada uno. Requisitos de ingreso: título de bachiller y aprobación del proceso de admisión institucional.
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-900 mb-1">
                    4. Objetivos específicos de la carrera
                  </h5>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    1. Desarrollar soluciones de software seguras y escalables.<br />
                    2. Aplicar métodos de análisis de datos para la toma de decisiones.<br />
                    3. Gestionar proyectos tecnológicos con enfoque ético y responsabilidad social.
                  </p>
                </div>
              </div>

              <div className="text-center pt-8 text-[10px] text-gray-400 border-t border-gray-100">
                Secretaría Académica · Documento institucional · 1
              </div>
            </div>
          </div>

          {/* Alerta de Completitud */}
          <div className="bg-[#8CB83C]/20 border border-[#8CB83C]/60 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#4C8C23] shrink-0" />
            <p className="text-xs font-bold text-[#2D5A1E]">
              17 de 17 secciones completas. El documento incluye todos los programas vinculados.
            </p>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
          <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gray-400" />
            Plan_{planCodigo}.docx · Documento Word
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleDescargar}
              disabled={descargando}
              className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {descargando ? 'Generando...' : 'Descargar .docx'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};