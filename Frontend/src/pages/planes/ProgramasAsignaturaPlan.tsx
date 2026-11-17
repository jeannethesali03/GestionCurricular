import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, BookOpen, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

interface AsignaturaPrograma {
  id: string;
  codigo: string;
  nombre: string;
  ciclo: string;
  uv: number;
  seccionesCompletas: string;
  origen: string;
}

export const ProgramasAsignaturaPlan: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mostrarTodasFacultad, setMostrarTodasFacultad] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [modalReferenciarAbierto, setModalReferenciarAbierto] = useState(false);

  // Estados para el modal de confirmación de salida
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  // Listado de materias ya vinculadas al plan
  const [materiasVinculadas, setMateriasVinculadas] = useState<AsignaturaPrograma[]>([
    { id: '1', codigo: 'PRG101', nombre: 'Programación I', ciclo: 'I', uv: 4, seccionesCompletas: '7/7 secciones completas', origen: 'Plan ISI-2022' },
  ]);

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  // Catálogos base
  const materiasPlanAnteriorISI2022 = [
    { codigo: 'ALG101', nombre: 'Álgebra Lineal', ciclo: 'I', uv: 4, origen: 'Plan ISI-2022' },
    { codigo: 'FDI101', nombre: 'Fundamentos de Informática', ciclo: 'I', uv: 3, origen: 'Plan ISI-2022' },
    { codigo: 'EST201', nombre: 'Estadística', ciclo: 'III', uv: 4, origen: 'Plan ISI-2022' },
  ];

  const materiasFacultadGeneral = [
    ...materiasPlanAnteriorISI2022,
    { codigo: 'MAT101', nombre: 'Matemática Discreta', ciclo: 'II', uv: 4, origen: 'Facultad' },
    { codigo: 'QUI101', nombre: 'Química General', ciclo: 'II', uv: 4, origen: 'Facultad' },
    { codigo: 'CONT101', nombre: 'Contabilidad Básica', ciclo: 'V', uv: 3, origen: 'Facultad' },
  ];

  const catalogoBase = mostrarTodasFacultad ? materiasFacultadGeneral : materiasPlanAnteriorISI2022;

  // Excluir del combobox las materias que ya han sido vinculadas y filtrar según el texto ingresado
  const codigosVinculados = materiasVinculadas.map(m => m.codigo);
  const materiasDisponibles = catalogoBase.filter(
    m => !codigosVinculados.includes(m.codigo) &&
         (`${m.codigo} · ${m.nombre}`.toLowerCase().includes(filtroTexto.toLowerCase()))
  );

  const handleCambioFiltro = (e: React.ChangeEvent<HTMLInputElement>) => {
    const texto = e.target.value;
    setFiltroTexto(texto);

    // Si al filtrar queda exactamente una opción, se selecciona automáticamente en el combobox
    const filtradas = catalogoBase.filter(
      m => !codigosVinculados.includes(m.codigo) &&
           (`${m.codigo} · ${m.nombre}`.toLowerCase().includes(texto.toLowerCase()))
    );

    if (texto.trim() !== '' && filtradas.length === 1) {
      setMateriaSeleccionada(`${filtradas[0].codigo} · ${filtradas[0].nombre}`);
    } else if (texto.trim() === '') {
      setMateriaSeleccionada('');
    }
  };

  const handleAgregarMateria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiaSeleccionada) return;

    const encontrada = catalogoBase.find(m => `${m.codigo} · ${m.nombre}` === materiaSeleccionada);
    if (!encontrada) return;

    setMateriasVinculadas([
      ...materiasVinculadas,
      {
        id: Date.now().toString(),
        codigo: encontrada.codigo,
        nombre: encontrada.nombre,
        ciclo: encontrada.ciclo,
        uv: encontrada.uv,
        seccionesCompletas: '7/7 secciones completas',
        origen: encontrada.origen
      }
    ]);
    setMateriaSeleccionada('');
    setFiltroTexto('');
  };

  const handleQuitarMateria = (codigo: string) => {
    setMateriasVinculadas(materiasVinculadas.filter(m => m.codigo !== codigo));
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
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Programas de cada asignatura
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

      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Programas de cada asignatura</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Selecciona las asignaturas que formarán parte del plan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMostrarTodasFacultad(!mostrarTodasFacultad)}
            className="text-xs text-[#050758] font-bold hover:underline cursor-pointer"
          >
            {mostrarTodasFacultad ? 'Ver solo plan anterior' : '+ Ver toda la facultad'}
          </button>
        </div>

        <form onSubmit={handleAgregarMateria} className="space-y-4">
          <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Seleccionar asignatura *
            </label>

            <input
              type="text"
              value={filtroTexto}
              onChange={handleCambioFiltro}
              placeholder="Escribe acá para buscar por nombre o código..."
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#050758] placeholder:text-gray-400"
            />

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <select
                value={materiaSeleccionada}
                onChange={(e) => setMateriaSeleccionada(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-[#050758] text-gray-800"
              >
                <option value="">Selecciona una asignatura de la lista...</option>
                {materiasDisponibles.map((mat) => {
                  const valorOpcion = `${mat.codigo} · ${mat.nombre}`;
                  return (
                    <option key={mat.codigo} value={valorOpcion}>
                      {valorOpcion} ({mat.origen})
                    </option>
                  );
                })}
              </select>

              <button
                type="submit"
                disabled={!materiaSeleccionada}
                className="inline-flex items-center justify-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Agregar al plan
              </button>
            </div>
          </div>
        </form>

        {/* Tabla de Asignaturas Vinculadas */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-3.5">Asignatura</th>
                <th className="p-3.5">Ciclo</th>
                <th className="p-3.5">UV</th>
                <th className="p-3.5">Programa</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
              {materiasVinculadas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    No hay asignaturas agregadas en este plan.
                  </td>
                </tr>
              ) : (
                materiasVinculadas.map((mat) => (
                  <tr key={mat.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-3.5 font-semibold text-[#050758]">{mat.codigo} · {mat.nombre}</td>
                    <td className="p-3.5 text-gray-600">{mat.ciclo}</td>
                    <td className="p-3.5 text-gray-600">{mat.uv}</td>
                    <td className="p-3.5 text-gray-500">{mat.seccionesCompletas}</td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleQuitarMateria(mat.codigo)}
                        className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-lg cursor-pointer inline-flex items-center justify-center"
                        title="Quitar asignatura"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            {guardadoExitoso ? (
              <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all">
                <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                ¡Guardado con éxito!
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
              onClick={handleGuardar}
              className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar
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