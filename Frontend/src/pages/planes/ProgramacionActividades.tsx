import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

export interface ActividadItem {
  id: string;
  actividad: string;
  fechaInicio: string; // Formato Mes y Año (YYYY-MM)
  fechaFin: string;   // Formato Mes y Año (YYYY-MM)
  responsable: string;
  observaciones: string;
}

export interface AreaActividades {
  id: string;
  nombreArea: string;
  actividades: ActividadItem[];
}

export const ProgramacionActividades: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [areas, setAreas] = useState<AreaActividades[]>([
    {
      id: '1',
      nombreArea: '',
      actividades: [
        {
          id: '1-1',
          actividad: '',
          fechaInicio: '',
          fechaFin: '',
          responsable: '',
          observaciones: '',
        },
      ],
    },
  ]);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [errorFechas, setErrorFechas] = useState<string | null>(null);
  const [modalReferenciarAbierto, setModalReferenciarAbierto] = useState(false);

  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  const handleAgregarArea = () => {
    setAreas([
      ...areas,
      {
        id: Date.now().toString(),
        nombreArea: '',
        actividades: [
          {
            id: `${Date.now()}-1`,
            actividad: '',
            fechaInicio: '',
            fechaFin: '',
            responsable: '',
            observaciones: '',
          },
        ],
      },
    ]);
  };

  const handleEliminarArea = (areaId: string) => {
    setAreas(areas.filter((area) => area.id !== areaId));
  };

  const handleActualizarNombreArea = (areaId: string, nombre: string) => {
    setAreas(
      areas.map((area) => (area.id === areaId ? { ...area, nombreArea: nombre } : area))
    );
  };

  const handleAgregarActividad = (areaId: string) => {
    setAreas(
      areas.map((area) => {
        if (area.id === areaId) {
          return {
            ...area,
            actividades: [
              ...area.actividades,
              {
                id: Date.now().toString(),
                actividad: '',
                fechaInicio: '',
                fechaFin: '',
                responsable: '',
                observaciones: '',
              },
            ],
          };
        }
        return area;
      })
    );
  };

  const handleEliminarActividad = (areaId: string, actividadId: string) => {
    setAreas(
      areas.map((area) => {
        if (area.id === areaId) {
          return {
            ...area,
            actividades: area.actividades.filter((act) => act.id !== actividadId),
          };
        }
        return area;
      })
    );
  };

  const handleActualizarActividad = (
    areaId: string,
    actividadId: string,
    campo: keyof ActividadItem,
    valor: string
  ) => {
    setAreas(
      areas.map((area) => {
        if (area.id === areaId) {
          return {
            ...area,
            actividades: area.actividades.map((act) =>
              act.id === actividadId ? { ...act, [campo]: valor } : act
            ),
          };
        }
        return area;
      })
    );
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFechas(null);

    // Validación: La fecha de fin debe ser mayor o igual que la fecha de inicio en cada actividad
    for (const area of areas) {
      for (const act of area.actividades) {
        if (act.fechaInicio && act.fechaFin && act.fechaFin < act.fechaInicio) {
          setErrorFechas(`En el área "${area.nombreArea || 'Sin nombre'}", la actividad "${act.actividad || 'Sin nombre'}" tiene una fecha fin menor que la de inicio.`);
          return;
        }
      }
    }

    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Módulo Planes / Sección 16 de 17
          </p>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Programación de actividades
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

      {errorFechas && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-xs font-bold">{errorFechas}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-base font-bold text-gray-900">Programación de actividades</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Organiza actividades por área y define responsables, meses y observaciones de seguimiento.
          </p>
        </div>

        <form onSubmit={handleGuardar} className="space-y-8">
          <div className="space-y-6">
            {areas.map((area, indexArea) => {
              const numArea = String(indexArea + 1).padStart(2, '0');
              return (
                <div
                  key={area.id}
                  className="border border-gray-200 rounded-2xl p-6 bg-gray-50/40 space-y-6 relative shadow-2xs group"
                >
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      ÁREA {numArea}
                    </span>
                    {areas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleEliminarArea(area.id)}
                        className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer flex items-center gap-1 text-xs font-bold"
                        title="Eliminar área completa"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar área
                      </button>
                    )}
                  </div>

                  {/* Campo de Nombre del Área */}
                  <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Área *
                    </label>
                    <input
                      type="text"
                      value={area.nombreArea}
                      onChange={(e) => handleActualizarNombreArea(area.id, e.target.value)}
                      placeholder="Escribe acá el nombre del área..."
                      className="w-full text-xs text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400 font-normal"
                    />
                  </div>

                  {/* Listado de Actividades de esta Área */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                        Actividades del área
                      </span>
                    </div>

                    {area.actividades.map((act, indexAct) => {
                      const numAct = String(indexAct + 1).padStart(2, '0');
                      return (
                        <div
                          key={act.id}
                          className="border border-gray-200 rounded-xl p-4 bg-white space-y-4 shadow-2xs"
                        >
                          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Actividad {numAct}
                            </span>
                            {area.actividades.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleEliminarActividad(area.id, act.id)}
                                className="text-gray-300 hover:text-red-600 transition p-1 cursor-pointer"
                                title="Eliminar actividad"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition sm:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Actividad *
                              </label>
                              <input
                                type="text"
                                value={act.actividad}
                                onChange={(e) =>
                                  handleActualizarActividad(area.id, act.id, 'actividad', e.target.value)
                                }
                                placeholder="Escribe acá la actividad..."
                                className="w-full text-xs text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400 font-normal"
                              />
                            </div>

                            <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Mes inicio *
                              </label>
                              <input
                                type="month"
                                value={act.fechaInicio}
                                onChange={(e) =>
                                  handleActualizarActividad(area.id, act.id, 'fechaInicio', e.target.value)
                                }
                                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none font-normal"
                              />
                            </div>

                            <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Mes fin *
                              </label>
                              <input
                                type="month"
                                value={act.fechaFin}
                                min={act.fechaInicio}
                                onChange={(e) =>
                                  handleActualizarActividad(area.id, act.id, 'fechaFin', e.target.value)
                                }
                                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none font-normal"
                              />
                            </div>

                            <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition sm:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Responsable *
                              </label>
                              <input
                                type="text"
                                value={act.responsable}
                                onChange={(e) =>
                                  handleActualizarActividad(area.id, act.id, 'responsable', e.target.value)
                                }
                                placeholder="Escribe acá el responsable..."
                                className="w-full text-xs text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400 font-normal"
                              />
                            </div>

                            <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition sm:col-span-2">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                                Observaciones
                              </label>
                              <textarea
                                rows={2}
                                value={act.observaciones}
                                onChange={(e) =>
                                  handleActualizarActividad(area.id, act.id, 'observaciones', e.target.value)
                                }
                                placeholder="Escribe acá las observaciones..."
                                className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400 font-normal"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div>
                      <button
                        type="button"
                        onClick={() => handleAgregarActividad(area.id)}
                        className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar actividad
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <button
              type="button"
              onClick={handleAgregarArea}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Agregar área
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              {guardadoExitoso ? (
                <span className="inline-flex items-center gap-2 bg-[#8CB83C]/20 border border-[#8CB83C] text-[#2D5A1E] text-xs font-bold px-4 py-2 rounded-xl transition-all">
                  <CheckCircle2 className="w-4 h-4 text-[#4C8C23] shrink-0" />
                  ¡Programación guardada con éxito!
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  Cambios sin guardar · visibles en esta versión de trabajo
                </span>
              )}
            </div>

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

      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <p>Cada pestaña se guarda de forma independiente. Los cambios se incorporan al expediente curricular.</p>
        <span className="font-semibold text-gray-500">16 / 17</span>
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