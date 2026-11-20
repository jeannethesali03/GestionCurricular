import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, AlignLeft, Target, Layers, Compass, CheckSquare, BookOpen, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAsignaturaDetalle } from '../../hooks/useAsignaturaDetalle';
import { asignaturasApi } from '../../services/asignaturasApi';

export const DetalleAsignatura: React.FC = () => {
  const { asignaturaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { detalle, cargando, error } = useAsignaturaDetalle();
  const [bloqueos, setBloqueos] = useState<{
    asignaturaId: number;
    vistas: Record<string, string>;
  } | null>(null);
  const [errorBloqueos, setErrorBloqueos] = useState('');

  useEffect(() => {
    const id = Number(asignaturaId);
    if (!detalle || detalle.estado !== 'activo' || !Number.isInteger(id) || id <= 0) return;

    let vigente = true;
    const consultarBloqueos = () => {
      asignaturasApi.obtenerBloqueos(id)
        .then((resultado) => {
          if (vigente) {
            setBloqueos({ asignaturaId: id, vistas: resultado });
            setErrorBloqueos('');
          }
        })
        .catch((errorConsulta: unknown) => {
          if (vigente) {
            setErrorBloqueos(errorConsulta instanceof Error
              ? errorConsulta.message
              : 'No se pudo consultar la disponibilidad de las vistas.');
          }
        });
    };

    consultarBloqueos();
    const intervalo = window.setInterval(consultarBloqueos, 5000);
    return () => {
      vigente = false;
      window.clearInterval(intervalo);
    };
  }, [asignaturaId, detalle?.estado]);

  if (!user) return null;
  if (cargando) return <p className="text-xs text-gray-500">Cargando asignatura...</p>;
  if (error || !detalle) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
        <p className="text-xs font-bold">{error || 'No se encontró la asignatura.'}</p>
      </div>
    );
  }

  const asignatura = detalle.asignatura;
  const desactivada = asignatura.estado !== 'activo';
  const planPrincipal = detalle.planes[0];
  const generalidadesCompletas = Boolean(
    asignatura.nombreAsignatura.trim()
    && asignatura.codigoAsignatura.trim()
    && asignatura.areaFormacion.trim()
    && asignatura.horasCiclo
    && asignatura.horasSemana
    && asignatura.duracionCicloSemana
    && asignatura.duracionHoraClase
    && asignatura.unidadesValorativas
  );
  const objetivosCompletos = detalle.objetivos.some((item) => item.tipo === 'general')
    && detalle.objetivos.some((item) => item.tipo === 'especifico');
  const seccionesCompletas = [
    generalidadesCompletas,
    Boolean(asignatura.descripcionAsignatura?.trim()),
    objetivosCompletos,
    detalle.unidadesDidacticas.length > 0,
    Boolean(asignatura.estrategiaMetodologica?.trim()),
    Boolean(asignatura.evaluacion?.trim()),
    detalle.referenciasBibliograficas.length > 0 && detalle.fuentesElectronicas.length > 0,
  ].filter(Boolean).length;

  const seccionesAsignatura = [
    {
      id: '01',
      titulo: 'Generalidades',
      descripcion: 'Datos, horas, UV y prerrequisitos',
      estado: desactivada ? 'Desactivada' : generalidadesCompletas ? 'Completa' : 'Pendiente',
      icono: FileText,
      ruta: 'generalidades',
    },
    {
      id: '02',
      titulo: 'Descripción',
      descripcion: 'Enfoque y alcance de la asignatura',
      estado: asignatura.descripcionAsignatura?.trim() ? 'Completa' : 'Pendiente',
      icono: AlignLeft,
      ruta: 'descripcion',
    },
    {
      id: '03',
      titulo: 'Objetivos de la asignatura',
      descripcion: `${detalle.objetivos.filter((item) => item.tipo === 'especifico').length} objetivos específicos`,
      estado: objetivosCompletos ? 'Completa' : 'Pendiente',
      icono: Target,
      ruta: 'objetivos',
    },
    {
      id: '04',
      titulo: 'Unidades didácticas y contenido',
      descripcion: `${detalle.unidadesDidacticas.length} unidades de aprendizaje`,
      estado: detalle.unidadesDidacticas.length > 0 ? 'Completa' : 'Pendiente',
      icono: Layers,
      ruta: 'unidades',
    },
    {
      id: '05',
      titulo: 'Estrategia metodológica',
      descripcion: asignatura.estrategiaMetodologica?.trim() ? 'Contenido registrado' : 'Sin estrategia registrada',
      estado: asignatura.estrategiaMetodologica?.trim() ? 'Completa' : 'Pendiente',
      icono: Compass,
      ruta: 'estrategia',
    },
    {
      id: '06',
      titulo: 'Evaluación',
      descripcion: 'Criterios, instrumentos y ponderaciones',
      estado: asignatura.evaluacion?.trim() ? 'Completa' : 'Pendiente',
      icono: CheckSquare,
      ruta: 'evaluacion',
    },
    {
      id: '07',
      titulo: 'Referencias bibliográficas',
      descripcion: `${detalle.referenciasBibliograficas.length} referencias académicas`,
      estado: detalle.referenciasBibliograficas.length > 0 && detalle.fuentesElectronicas.length > 0 ? 'Completa' : 'Pendiente',
      icono: BookOpen,
      ruta: 'referencias',
    },
  ];

  const handleCardClick = (ruta: string) => {
    const estaBloqueada = Boolean(
      bloqueos
      && bloqueos.asignaturaId === Number(asignaturaId)
      && bloqueos.vistas[ruta],
    );
    if (desactivada || estaBloqueada) return;
    if (ruta === 'generalidades') {
      navigate(`/asignaturas/${asignaturaId}/generalidades`);
    } else if (ruta === 'descripcion') {
      navigate(`/asignaturas/${asignaturaId}/descripcion`);
    } else if (ruta === 'objetivos') {
      navigate(`/asignaturas/${asignaturaId}/objetivos`);
    } else if (ruta === 'unidades') {
      navigate(`/asignaturas/${asignaturaId}/unidades`);
    } else if (ruta === 'estrategia') {
      navigate(`/asignaturas/${asignaturaId}/estrategia`);
    } else if (ruta === 'evaluacion') {
      navigate(`/asignaturas/${asignaturaId}/evaluacion`);
    } else if (ruta === 'referencias') {
      navigate(`/asignaturas/${asignaturaId}/referencias`);
    } else {
      alert(`Vista de ${ruta} en desarrollo`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            {asignatura.nombreAsignatura}
          </h2>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
            desactivada ? 'text-gray-600 bg-gray-100' : 'text-emerald-700 bg-emerald-50'
          }`}>
            <span className={`w-2 h-2 rounded-full ${desactivada ? 'bg-gray-500' : 'bg-emerald-600'}`} />
            {desactivada ? 'Inactiva' : 'Activa'}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          {asignatura.codigoAsignatura} · {asignatura.unidadesValorativas} UV · {asignatura.nombreFacultad || 'Sin facultad'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            PLANES VINCULADOS
          </p>
          <h3 className="text-base font-bold text-gray-900">{planPrincipal?.nombreCarrera || asignatura.nombreCarrera || 'Sin plan vinculado'}</h3>
          <p className="text-xs text-gray-500">
            {planPrincipal
              ? `Ciclo ${planPrincipal.numeroCiclo} · Orden ${planPrincipal.numeroOrden}`
              : `Modalidad ${asignatura.modalidad}`}
          </p>
        </div>

        <div className="space-y-1 md:border-x md:border-gray-200 md:px-8">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            RESPONSABLE DEL PROGRAMA
          </p>
          <h3 className="text-xs font-bold text-gray-900">{asignatura.responsable || 'Sin responsable asignado'}</h3>
          <p className="text-[11px] text-gray-400">{asignatura.nombreSede || 'Sede no especificada'}</p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-3xl font-extrabold text-[#050758]">
            {Math.round((seccionesCompletas / 7) * 100)}%
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            {seccionesCompletas} de 7 completas
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Secciones del programa de asignatura
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Estructura curricular y contenidos evaluables del programa.
          </p>
          {errorBloqueos && (
            <p role="alert" className="text-xs text-red-700 mt-2">
              No se pudo consultar la disponibilidad: {errorBloqueos}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {seccionesAsignatura.map((sec) => {
            const IconoComponente = sec.icono;
            const vistasBloqueadas = bloqueos
              && bloqueos.asignaturaId === Number(asignaturaId)
              ? bloqueos.vistas
              : {};
            const bloqueadoPor = !desactivada ? vistasBloqueadas[sec.ruta] : undefined;
            const noDisponible = desactivada || Boolean(bloqueadoPor);
            return (
              <div
                key={sec.id}
                onClick={() => handleCardClick(sec.ruta)}
                aria-disabled={noDisponible}
                className={`bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4 transition group ${
                  noDisponible ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#050758] hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F4F8] text-[#050758] flex items-center justify-center group-hover:bg-[#050758] group-hover:text-white transition">
                    <IconoComponente className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-400">{sec.id}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#050758] transition">
                    {sec.titulo}
                  </h4>
                  <p className={`text-xs mt-1 ${bloqueadoPor ? 'text-amber-700 font-semibold' : 'text-gray-500'}`}>
                    {bloqueadoPor
                      ? `Vista bloqueada porque está siendo editada por "${bloqueadoPor}".`
                      : sec.descripcion}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    bloqueadoPor ? 'text-amber-700' : sec.estado === 'Completa' ? 'text-emerald-700' : 'text-gray-500'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      bloqueadoPor ? 'bg-amber-600' : sec.estado === 'Completa' ? 'bg-emerald-600' : 'bg-gray-400'
                    }`} />
                    {bloqueadoPor ? 'Bloqueada' : sec.estado}
                  </span>

                  {!noDisponible && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#050758] font-semibold">
                      <span>Editar</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};