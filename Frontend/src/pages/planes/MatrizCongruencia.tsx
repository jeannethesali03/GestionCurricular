import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, Search, Plus, X, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

export interface ObjetivoCongruencia {
  id: string;
  numero: string;
  textoObjetivo: string;
  competencia: string;
  asignaturasSeleccionadas: string[];
}

export const MatrizCongruencia: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Lista simulada de objetivos específicos (provienen de la sección 04)
  const [objetivos, setObjetivos] = useState<ObjetivoCongruencia[]>([
    {
      id: '1',
      numero: 'Objetivo específico 1',
      textoObjetivo: 'Desarrollar soluciones de software seguras y escalables.',
      competencia: '',
      asignaturasSeleccionadas: ['PRG101', 'FDI101', 'IDS301'],
    },
    {
      id: '2',
      numero: 'Objetivo específico 2',
      textoObjetivo: 'Aplicar métodos de análisis de datos para la toma de decisiones.',
      competencia: '',
      asignaturasSeleccionadas: [],
    },
    {
      id: '3',
      numero: 'Objetivo específico 3',
      textoObjetivo: 'Gestionar proyectos tecnológicos con enfoque ético y responsabilidad social.',
      competencia: '',
      asignaturasSeleccionadas: [],
    },
  ]);

  // Lista general de asignaturas disponibles para vincular
  const asignaturasDisponibles = [
    { codigo: 'PRG101', nombre: 'Programación I' },
    { codigo: 'FDI101', nombre: 'Fundamentos de Informática' },
    { codigo: 'IDS301', nombre: 'Ingeniería de Software' },
    { codigo: 'MAT101', nombre: 'Matemática Discreta' },
    { codigo: 'BDD201', nombre: 'Bases de Datos I' },
  ];

  const [busquedaAsignatura, setBusquedaAsignatura] = useState<{ [key: string]: string }>({});
  const [asignaturaTemporal, setAsignaturaTemporal] = useState<{ [key: string]: string }>({});
  const [dropdownAbierto, setDropdownAbierto] = useState<{ [key: string]: boolean }>({});

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  const handleActualizarCompetencia = (id: string, valor: string) => {
    setObjetivos(
      objetivos.map((obj) => (obj.id === id ? { ...obj, competencia: valor } : obj))
    );
  };

  const handleAgregarAsignatura = (idObj: string) => {
    const codigoSeleccionado = asignaturaTemporal[idObj];
    if (!codigoSeleccionado) return;

    setObjetivos(
      objetivos.map((obj) => {
        if (obj.id === idObj) {
          if (obj.asignaturasSeleccionadas.includes(codigoSeleccionado)) return obj;
          return {
            ...obj,
            asignaturasSeleccionadas: [...obj.asignaturasSeleccionadas, codigoSeleccionado],
          };
        }
        return obj;
      })
    );

    setAsignaturaTemporal({ ...asignaturaTemporal, [idObj]: '' });
    setBusquedaAsignatura({ ...busquedaAsignatura, [idObj]: '' });
    setDropdownAbierto({ ...dropdownAbierto, [idObj]: false });
  };

  const handleEliminarAsignatura = (idObj: string, codigoAsignatura: string) => {
    setObjetivos(
      objetivos.map((obj) => {
        if (obj.id === idObj) {
          return {
            ...obj,
            asignaturasSeleccionadas: obj.asignaturasSeleccionadas.filter((c) => c !== codigoAsignatura),
          };
        }
        return obj;
      })
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
            Módulo Planes / Sección 17 de 17
          </p>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Matriz de congruencia
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

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-base font-bold text-gray-900">Matriz de congruencia</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Relación de objetivos específicos con asignaturas contribuyentes y competencias del diagnóstico.
          </p>
        </div>

        <div className="bg-blue-50/60 border border-blue-100 text-blue-900 rounded-xl p-4 flex items-start gap-3 mb-6">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">
            Los {objetivos.length} objetivos específicos provienen de la sección 04. Cada objetivo debe vincular al menos una asignatura.
          </p>
        </div>

        <form onSubmit={handleGuardar} className="space-y-8">
          <div className="space-y-6">
            {objetivos.map((obj) => {
              const textoBusqueda = (busquedaAsignatura[obj.id] || '').toLowerCase();
              
              const asignaturasFiltradas = asignaturasDisponibles.filter(
                (a) =>
                  !obj.asignaturasSeleccionadas.includes(a.codigo) &&
                  (a.codigo.toLowerCase().includes(textoBusqueda) ||
                   a.nombre.toLowerCase().includes(textoBusqueda))
              );

              const asignaturaSeleccionadaObj = asignaturasDisponibles.find(
                (a) => a.codigo === asignaturaTemporal[obj.id]
              );

              return (
                <div
                  key={obj.id}
                  className="border border-gray-200 rounded-2xl p-6 bg-gray-50/40 space-y-5 shadow-2xs relative"
                >
                  <div className="space-y-1.5 border-b border-gray-200 pb-4">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#050758] bg-[#050758]/10 px-2.5 py-1 rounded-md">
                      {obj.numero}
                    </span>
                    <p className="text-xs font-bold text-gray-900 leading-relaxed pt-1">
                      {obj.textoObjetivo}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Asignaturas que contribuyen al objetivo *
                    </label>

                    <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                      <div className="relative flex-1">
                        <div className="border border-gray-200 rounded-xl p-2.5 bg-white focus-within:border-[#050758] transition flex items-center gap-2">
                          <Search className="w-4 h-4 text-gray-400 shrink-0" />
                          <input
                            type="text"
                            placeholder="Buscar por nombre o código de asignatura..."
                            value={asignaturaSeleccionadaObj ? `${asignaturaSeleccionadaObj.codigo} · ${asignaturaSeleccionadaObj.nombre}` : (busquedaAsignatura[obj.id] || '')}
                            onChange={(e) => {
                              if (asignaturaTemporal[obj.id]) {
                                setAsignaturaTemporal({ ...asignaturaTemporal, [obj.id]: '' });
                              }
                              setBusquedaAsignatura({ ...busquedaAsignatura, [obj.id]: e.target.value });
                              setDropdownAbierto({ ...dropdownAbierto, [obj.id]: true });
                            }}
                            onFocus={() => setDropdownAbierto({ ...dropdownAbierto, [obj.id]: true })}
                            className="w-full text-xs text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400 font-normal"
                          />
                          {(busquedaAsignatura[obj.id] || asignaturaTemporal[obj.id]) && (
                            <button
                              type="button"
                              onClick={() => {
                                setAsignaturaTemporal({ ...asignaturaTemporal, [obj.id]: '' });
                                setBusquedaAsignatura({ ...busquedaAsignatura, [obj.id]: '' });
                                setDropdownAbierto({ ...dropdownAbierto, [obj.id]: false });
                              }}
                              className="text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
                              title="Limpiar búsqueda"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {dropdownAbierto[obj.id] && (
                          <>
                            {/* Backdrop invisible para cerrar el menú al hacer clic fuera */}
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setDropdownAbierto({ ...dropdownAbierto, [obj.id]: false })}
                            />
                            
                            <div className="absolute left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                              {asignaturasFiltradas.length > 0 ? (
                                asignaturasFiltradas.map((asig) => (
                                  <div
                                    key={asig.codigo}
                                    onClick={() => {
                                      setAsignaturaTemporal({ ...asignaturaTemporal, [obj.id]: asig.codigo });
                                      setBusquedaAsignatura({ ...busquedaAsignatura, [obj.id]: '' });
                                      setDropdownAbierto({ ...dropdownAbierto, [obj.id]: false });
                                    }}
                                    className="px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer transition font-normal"
                                  >
                                    {asig.codigo} · {asig.nombre}
                                  </div>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-xs text-gray-400 text-center">
                                  No hay asignaturas disponibles
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAgregarAsignatura(obj.id)}
                        disabled={!asignaturaTemporal[obj.id]}
                        className={`inline-flex items-center justify-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs ${
                          asignaturaTemporal[obj.id]
                            ? 'bg-[#050758] hover:bg-[#090c7a] text-white cursor-pointer'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        Agregar asignatura
                      </button>
                    </div>

                    {obj.asignaturasSeleccionadas.length > 0 && (
                      <div className="bg-[#050758]/5 border border-[#050758]/10 rounded-xl p-3.5 space-y-2 mt-3">
                        {obj.asignaturasSeleccionadas.map((codigo) => {
                          const asigObj = asignaturasDisponibles.find((a) => a.codigo === codigo);
                          return (
                            <div key={codigo} className="flex items-center justify-between text-xs text-[#050758] font-medium bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-2xs">
                              <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#050758]" />
                                {codigo} · {asigObj?.nombre || codigo}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleEliminarAsignatura(obj.id, codigo)}
                                className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                                title="Eliminar asignatura"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                        <div className="text-[10px] text-gray-500 pt-1 font-medium">
                          {obj.asignaturasSeleccionadas.length} asignaturas seleccionadas
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Competencias del diagnóstico *
                    </label>
                    <textarea
                      rows={3}
                      value={obj.competencia}
                      onChange={(e) => handleActualizarCompetencia(obj.id, e.target.value)}
                      placeholder="Escribe acá las competencias del diagnóstico..."
                      className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400 font-normal"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              {guardadoExitoso ? (
                <span className="inline-flex items-center gap-2 bg-[#8CB83C]/20 border border-[#8CB83C] text-[#2D5A1E] text-xs font-bold px-4 py-2 rounded-xl transition-all">
                  <CheckCircle2 className="w-4 h-4 text-[#4C8C23] shrink-0" />
                  ¡Matriz guardada con éxito!
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  Cambios sin guardar · visibles en esta versión de trabajo
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={() => intentarSalir(`/planes/${planId || 'ISI-2027'}`)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
              >
                Salir
              </button>

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

      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <p>Cada pestaña se guarda de forma independiente. Los cambios se incorporan al expediente curricular.</p>
        <span className="font-semibold text-gray-500">17 / 17</span>
      </div>

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