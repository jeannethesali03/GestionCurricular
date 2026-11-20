import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, BookOpen, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';
import { planAsignaturasApi, type AsignaturasDePlanApi } from '../../services/planAsignaturasApi';

interface AsignaturaPrograma {
  id: string;
  codigo: string;
  nombre: string;
  numeroCiclo: number;
  numeroOrden: number;
  uv: number;
  seccionesCompletas: string;
  origen: string;
}

export const ProgramasAsignaturaPlan: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [numeroCiclo, setNumeroCiclo] = useState('1');
  const [numeroOrden, setNumeroOrden] = useState('1');
  const [posicionesEditadas, setPosicionesEditadas] = useState<
    Record<string, { numeroCiclo: string; numeroOrden: string }>
  >({});
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [version, setVersion] = useState(0);
  const [resultado, setResultado] = useState<{
    clave: string;
    plan: AsignaturasDePlanApi | null;
    error: string;
  } | null>(null);
  const [modalReferenciarAbierto, setModalReferenciarAbierto] = useState(false);

  // Estados para el modal de confirmación de salida
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  const idPlan = Number(planId);
  const clave = `${user?.id ?? ''}:${idPlan}`;
  const planValido = Boolean(user) && Number.isInteger(idPlan) && idPlan > 0;

  useEffect(() => {
    let vigente = true;
    if (!planValido) return () => { vigente = false; };

    planAsignaturasApi.obtener(idPlan)
      .then((plan) => {
        if (vigente) {
          setResultado({ clave, plan, error: '' });
          setPosicionesEditadas({});
        }
      })
      .catch((error: unknown) => {
        if (vigente) {
          setResultado({
            clave,
            plan: null,
            error: error instanceof Error ? error.message : 'No se pudo cargar el programa del plan.',
          });
        }
      });

    return () => { vigente = false; };
  }, [clave, idPlan, planValido, version]);

  const resultadoActual = resultado?.clave === clave ? resultado : null;
  const planActual = resultadoActual?.plan ?? null;
  const materiasVinculadas: AsignaturaPrograma[] = (planActual?.asignaturas ?? []).map((item) => ({
    id: String(item.idAsignatura),
    codigo: item.codigoAsignatura,
    nombre: item.nombreAsignatura,
    numeroCiclo: item.numeroCiclo,
    numeroOrden: item.numeroOrden,
    uv: item.unidadesValorativas,
    seccionesCompletas: `${item.seccionesCompletas}/${item.seccionesTotal} secciones completas`,
    origen: planActual?.nombreCarrera ?? '',
  }));
  const materiasDisponibles = useMemo(() => (planActual?.opcionesAsignaturas ?? [])
    .filter((materia) => {
      const texto = `${materia.codigoAsignatura} ${materia.nombreAsignatura}`.toLocaleLowerCase();
      return texto.includes(filtroTexto.trim().toLocaleLowerCase());
    }), [filtroTexto, planActual]);
  const cargando = planValido && !resultadoActual;
  const errorCarga = !planValido
    ? 'El plan indicado no es válido.'
    : resultadoActual?.error ?? '';

  if (!user) return null;

  const registrarExito = () => {
    setErrorOperacion('');
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 4000);
  };

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  const handleAgregarMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiaSeleccionada || !planActual) return;
    const ciclo = Number(numeroCiclo);
    const orden = Number(numeroOrden);
    if (!Number.isInteger(ciclo) || ciclo < 1 || !Number.isInteger(orden) || orden < 1) {
      setErrorOperacion('El ciclo y el número de orden deben ser números enteros mayores que cero.');
      return;
    }

    setGuardando(true);
    setErrorOperacion('');
    try {
      await planAsignaturasApi.guardar(idPlan, Number(materiaSeleccionada), ciclo, orden);
      setMateriaSeleccionada('');
      setFiltroTexto('');
      setNumeroOrden(String(materiasVinculadas.length + 2));
      setVersion((actual) => actual + 1);
      registrarExito();
    } catch (error) {
      setErrorOperacion(error instanceof Error ? error.message : 'No se pudo vincular la asignatura.');
    } finally {
      setGuardando(false);
    }
  };

  const guardarPosicion = async (materia: AsignaturaPrograma) => {
    const posicion = posicionesEditadas[materia.id] ?? {
      numeroCiclo: String(materia.numeroCiclo),
      numeroOrden: String(materia.numeroOrden),
    };
    const ciclo = Number(posicion.numeroCiclo);
    const orden = Number(posicion.numeroOrden);
    if (!Number.isInteger(ciclo) || ciclo < 1 || !Number.isInteger(orden) || orden < 1) {
      setErrorOperacion('El ciclo y el número de orden deben ser números enteros mayores que cero.');
      return;
    }

    setGuardando(true);
    setErrorOperacion('');
    try {
      await planAsignaturasApi.guardar(idPlan, Number(materia.id), ciclo, orden);
      setVersion((actual) => actual + 1);
      registrarExito();
    } catch (error) {
      setErrorOperacion(error instanceof Error ? error.message : 'No se pudo guardar el ciclo y orden.');
    } finally {
      setGuardando(false);
    }
  };

  const handleQuitarMateria = async (idAsignatura: string) => {
    setGuardando(true);
    setErrorOperacion('');
    try {
      await planAsignaturasApi.quitar(idPlan, Number(idAsignatura));
      setVersion((actual) => actual + 1);
      registrarExito();
    } catch (error) {
      setErrorOperacion(error instanceof Error ? error.message : 'No se pudo quitar la asignatura del plan.');
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setErrorOperacion('');
    try {
      for (const materia of materiasVinculadas) {
        const posicion = posicionesEditadas[materia.id] ?? {
          numeroCiclo: String(materia.numeroCiclo),
          numeroOrden: String(materia.numeroOrden),
        };
        const ciclo = Number(posicion.numeroCiclo);
        const orden = Number(posicion.numeroOrden);
        if (!Number.isInteger(ciclo) || ciclo < 1 || !Number.isInteger(orden) || orden < 1) {
          throw new Error(`Corrige el ciclo y el orden de ${materia.codigo}. Deben ser enteros mayores que cero.`);
        }
        await planAsignaturasApi.guardar(idPlan, Number(materia.id), ciclo, orden);
      }
      setVersion((actual) => actual + 1);
      registrarExito();
    } catch (error) {
      setErrorOperacion(error instanceof Error ? error.message : 'No se pudo guardar la estructura del plan.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Programas de cada asignatura
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {planActual
              ? `${planActual.nombreCarrera} · ${planActual.cicloInicio} - ${planActual.cicloFin}`
              : 'Cargando información del plan...'}
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

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
        <span className="inline-flex items-center gap-1.5 text-gray-700">
          <span className="w-2 h-2 rounded-full bg-gray-500" />
          {cargando ? 'Cargando' : 'Edición de plan'}
        </span>
        <span>·</span>
        <span>Ciclo y orden se asignan dentro de este plan</span>
        <span>·</span>
        <span>{user.nombre} · Tu sesión</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Programas de cada asignatura</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Selecciona las asignaturas de {planActual?.nombreCarrera || 'la carrera'} y asigna su ciclo y orden.
            </p>
          </div>
        </div>

        <form onSubmit={handleAgregarMateria} className="space-y-4">
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Seleccionar asignatura *
            </label>

            <input
              type="text"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="Escribe acá para buscar por nombre o código..."
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#050758] placeholder:text-gray-400"
            />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <select
                value={materiaSeleccionada}
                onChange={(e) => setMateriaSeleccionada(e.target.value)}
                disabled={cargando || !planActual}
                className="w-full sm:col-span-2 text-xs bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#050758] text-gray-800"
              >
                <option value="">Selecciona una asignatura de la lista...</option>
                {materiasDisponibles.map((mat) => {
                  return (
                    <option key={mat.idAsignatura} value={String(mat.idAsignatura)}>
                      {mat.codigoAsignatura} · {mat.nombreAsignatura}
                    </option>
                  );
                })}
              </select>

              <label className="block text-[10px] font-bold text-gray-500">
                Ciclo
                <input
                  type="number"
                  min="1"
                  required
                  value={numeroCiclo}
                  onChange={(e) => setNumeroCiclo(e.target.value)}
                  className="mt-1 w-full text-xs bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#050758] text-gray-800"
                />
              </label>

              <label className="block text-[10px] font-bold text-gray-500">
                Número de orden
                <input
                  type="number"
                  min="1"
                  required
                  value={numeroOrden}
                  onChange={(e) => setNumeroOrden(e.target.value)}
                  className="mt-1 w-full text-xs bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#050758] text-gray-800"
                />
              </label>

              <button
                type="submit"
                disabled={!materiaSeleccionada || guardando}
                className="sm:col-span-4 inline-flex items-center justify-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                {guardando ? 'Guardando...' : 'Agregar al plan'}
              </button>
            </div>
          </div>
        </form>

        {cargando && <p className="text-xs text-gray-500">Cargando las asignaturas del plan...</p>}
        {errorCarga && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            <p className="text-xs font-bold">{errorCarga}</p>
          </div>
        )}
        {errorOperacion && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
            <p className="text-xs font-bold">{errorOperacion}</p>
          </div>
        )}

        {/* Tabla de Asignaturas Vinculadas */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-3.5">Asignatura</th>
                <th className="p-3.5">Ciclo</th>
                <th className="p-3.5">Orden</th>
                <th className="p-3.5">UV</th>
                <th className="p-3.5">Programa</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
              {materiasVinculadas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    {cargando ? 'Cargando asignaturas...' : 'No hay asignaturas agregadas en este plan.'}
                  </td>
                </tr>
              ) : (
                materiasVinculadas.map((mat) => (
                  <tr key={mat.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-3.5 font-semibold text-[#050758]">{mat.codigo} · {mat.nombre}</td>
                    <td className="p-3.5 text-gray-600">
                      <input
                        type="number"
                        min="1"
                        value={posicionesEditadas[mat.id]?.numeroCiclo ?? String(mat.numeroCiclo)}
                        onChange={(e) => setPosicionesEditadas((actual) => ({
                          ...actual,
                          [mat.id]: {
                            numeroCiclo: e.target.value,
                            numeroOrden: actual[mat.id]?.numeroOrden ?? String(mat.numeroOrden),
                          },
                        }))}
                        className="w-16 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#050758]"
                        aria-label={`Ciclo de ${mat.nombre}`}
                      />
                    </td>
                    <td className="p-3.5 text-gray-600">
                      <input
                        type="number"
                        min="1"
                        value={posicionesEditadas[mat.id]?.numeroOrden ?? String(mat.numeroOrden)}
                        onChange={(e) => setPosicionesEditadas((actual) => ({
                          ...actual,
                          [mat.id]: {
                            numeroCiclo: actual[mat.id]?.numeroCiclo ?? String(mat.numeroCiclo),
                            numeroOrden: e.target.value,
                          },
                        }))}
                        className="w-16 text-xs bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#050758]"
                        aria-label={`Orden de ${mat.nombre}`}
                      />
                    </td>
                    <td className="p-3.5 text-gray-600">{mat.uv}</td>
                    <td className="p-3.5 text-gray-500">{mat.seccionesCompletas}</td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => void guardarPosicion(mat)}
                          disabled={guardando}
                          className="text-[#050758] hover:text-[#090c7a] transition p-1.5 rounded-lg cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                          title="Guardar ciclo y orden"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleQuitarMateria(mat.id)}
                          disabled={guardando}
                          className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-lg cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                          title="Quitar asignatura"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-400">
            {guardadoExitoso ? (
              <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all">
                <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                ¡Guardado con éxito!
              </span>
            ) : (
              guardando ? 'Guardando cambios...' : 'Asigna el ciclo y el orden de cada asignatura en este plan.'
            )}
          </div>

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
              onClick={handleGuardar}
              disabled={guardando || cargando || Boolean(errorCarga)}
              className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <p>Cada pestaña se guarda de forma independiente. Los cambios se incorporan al expediente curricular.</p>
        <span className="font-semibold text-gray-500">08 / 17</span>
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