import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, CheckCircle2, Save, Info, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface DocenteItem {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  facultad: string;
}

export const EditarAsignacion: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // ID del registro que se está editando

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Si es un usuario estándar (o no autenticado), muestra la pantalla limpia de Página no encontrada (404)
  if (!user || (!esSuperUsuario && !esAdministrador)) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center space-y-4 bg-white rounded-2xl border border-gray-200 mt-16 shadow-sm">
        <p className="text-6xl font-extrabold text-[#050758]">404</p>
        <h2 className="text-2xl font-bold text-gray-900">Página no encontrada</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          La página que estás buscando no existe, ha sido movida o no tienes autorización para visualizarla.
        </p>
        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm"
          >
            Regresar al inicio
          </button>
        </div>
      </div>
    );
  }

  // Datos simulados del elemento fijo que se está editando (Plan o Asignatura bloqueada)
  const [elementoActual] = useState({
    id: id || '1',
    tipo: 'Plan de Estudio', // o 'Asignatura'
    codigo: 'ISI-2027',
    nombre: 'Ingeniería en Sistemas y Redes Informáticas',
    facultad: 'Ingeniería y Tecnología',
  });

  // Lista de docentes disponibles en el sistema
  const [docentesDisponibles] = useState<DocenteItem[]>([
    { id: '1', nombre: 'Lucía', apellido: 'Méndez', email: 'lucia.mendez@unicaes.edu.sv', facultad: 'Ingeniería y Tecnología' },
    { id: '2', nombre: 'Carlos', apellido: 'Ruiz', email: 'carlos.ruiz@unicaes.edu.sv', facultad: 'Ingeniería y Tecnología' },
    { id: '3', nombre: 'Ana', apellido: 'Gómez', email: 'ana.gomez@unicaes.edu.sv', facultad: 'Ciencias Económicas' },
    { id: '4', nombre: 'Mario', apellido: 'Hernández', email: 'mario.hernandez@unicaes.edu.sv', facultad: 'Jurisprudencia y Ciencias Sociales' },
  ]);

  // Docentes que ya venían asignados previamente a este elemento
  const [docentesSeleccionados, setDocentesSeleccionados] = useState<DocenteItem[]>([
    { id: '1', nombre: 'Lucía', apellido: 'Méndez', email: 'lucia.mendez@unicaes.edu.sv', facultad: 'Ingeniería y Tecnología' },
  ]);

  const [busquedaDocente, setBusquedaDocente] = useState('');
  const [docenteSeleccionTemporal, setDocenteSeleccionTemporal] = useState('');
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const facultadUsuario = user.facultadNombre || 'Ingeniería y Tecnología';

  // --- FILTRADOS DE DOCENTES DISPONIBLES ---
  const docentesFiltrados = docentesDisponibles
    .filter(d => {
      if (esSuperUsuario) return true;
      return d.facultad === facultadUsuario;
    })
    // Excluir a los docentes que ya están seleccionados en este elemento
    .filter(d => !docentesSeleccionados.some(sel => sel.id === d.id))
    .filter(d =>
      d.nombre.toLowerCase().includes(busquedaDocente.toLowerCase()) ||
      d.apellido.toLowerCase().includes(busquedaDocente.toLowerCase()) ||
      d.email.toLowerCase().includes(busquedaDocente.toLowerCase())
    );

  // --- MANEJADORES ---
  const handleSeleccionarDocente = () => {
    if (!docenteSeleccionTemporal) return;
    const doc = docentesDisponibles.find(d => d.id === docenteSeleccionTemporal);
    if (doc) {
      setDocentesSeleccionados([...docentesSeleccionados, doc]);
      setDocenteSeleccionTemporal('');
      setBusquedaDocente('');
    }
  };

  const handleEliminarDocente = (idDocente: string) => {
    setDocentesSeleccionados(docentesSeleccionados.filter(d => d.id !== idDocente));
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardadoExitoso(true);
    setTimeout(() => {
      setGuardadoExitoso(false);
      navigate('/app/operations/assign');
    }, 2000);
  };

  const botonDocenteHabilitado = docenteSeleccionTemporal !== '';

  const prevenirEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* ENCABEZADO DE LA VISTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Editar asignación de usuarios
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Modifica los docentes o usuarios asignados a este elemento institucional. El elemento principal no puede ser modificado.
          </p>
        </div>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">
        
        {/* SECCIÓN 1: ELEMENTO SELECCIONADO (BLOQUEADO / SOLO LECTURA) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Elemento académico (Fijo)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Este apartado define el plan o asignatura que se está administrando.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border border-gray-200/80 rounded-xl p-4">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Tipo de elemento</span>
              <span className="text-xs font-bold text-[#050758]">{elementoActual.tipo}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Código y Nombre</span>
              <span className="text-xs font-bold text-gray-800">{elementoActual.codigo} · {elementoActual.nombre}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Facultad de adscripción</span>
              <span className="text-xs font-medium text-gray-600">{elementoActual.facultad}</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: GESTIÓN DE USUARIOS DESTINATARIOS (DOCENTES) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Usuarios destinatarios vinculados</h3>
            <p className="text-xs text-gray-500 mt-0.5">Puedes quitar a los usuarios actuales o agregar nuevos desde el buscador.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                1. Buscar docente por nombre o apellido
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ej. Lucía, Méndez..."
                  value={busquedaDocente}
                  onChange={(e) => setBusquedaDocente(e.target.value)}
                  onKeyDown={prevenirEnter}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl pl-10 pr-4 py-3 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                2. Seleccionar de la lista <span className="text-red-500">*</span>
              </label>
              <select
                value={docenteSeleccionTemporal}
                onChange={(e) => setDocenteSeleccionTemporal(e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
              >
                <option value="">-- Selecciona un docente para agregar --</option>
                {docentesFiltrados.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.nombre} {doc.apellido} ({doc.facultad})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleSeleccionarDocente}
                disabled={!botonDocenteHabilitado}
                className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl shadow-sm transition ${
                  botonDocenteHabilitado
                    ? 'bg-[#050758] hover:bg-[#090c7a] text-white cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Docentes actualmente asignados ({docentesSeleccionados.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {docentesSeleccionados.map((doc) => (
                <div
                  key={doc.id}
                  className="inline-flex items-center gap-2 bg-[#050758]/5 border border-[#050758]/20 px-3 py-1.5 rounded-xl text-xs font-medium text-[#050758]"
                >
                  <span>{doc.nombre} {doc.apellido} ({doc.facultad})</span>
                  <button
                    type="button"
                    onClick={() => handleEliminarDocente(doc.id)}
                    className="text-gray-400 hover:text-red-600 transition cursor-pointer"
                    title="Remover docente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {docentesSeleccionados.length === 0 && (
                <p className="text-xs text-red-500 italic">Advertencia: Debes mantener al menos un docente asignado.</p>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: ACCIONES Y GUARDADO */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          <div className="bg-[#050758]/5 border border-[#050758]/15 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#050758] shrink-0 mt-0.5" />
            <p className="text-xs text-[#050758] font-medium leading-relaxed">
              Al guardar los cambios, se actualizarán los permisos de edición para los docentes seleccionados sobre este elemento.
            </p>
          </div>

          {guardadoExitoso && (
            <div className="bg-[#8CB83C]/20 border border-[#8CB83C]/60 text-[#2D5A1E] rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
              <p className="text-xs font-bold">¡Asignación actualizada con éxito! Redirigiendo al listado...</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/app/operations/assign')}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={docentesSeleccionados.length === 0}
              className={`inline-flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition ${
                docentesSeleccionados.length > 0
                  ? 'bg-[#050758] hover:bg-[#090c7a] text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Guardar cambios
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};