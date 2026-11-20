import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ModalAlertaSalida } from '../modals/ModalAlertaSalida';
import { asignaturasApi } from '../../services/asignaturasApi';

export const LayoutEdicionPlan: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(true);
  const [bloqueoVerificando, setBloqueoVerificando] = useState(true);
  const [bloqueoError, setBloqueoError] = useState('');

  const salidaAutorizada = useRef(false);
  const bloqueoActivo = useRef<{ asignaturaId: number; vista: string } | null>(null);
  const generacionBloqueo = useRef(0);
  const solicitudBloqueo = useRef<{
    generacion: number;
    asignaturaId: number;
    vista: string;
  } | null>(null);

  const getDestinoDetalle = () => {
    const esAsignatura = location.pathname.includes('/asignaturas/');
    return esAsignatura 
      ? location.pathname.split('/').slice(0, 3).join('/') 
      : location.pathname.split('/').slice(0, 3).join('/');
  };

  useEffect(() => {
    const generacion = ++generacionBloqueo.current;
    solicitudBloqueo.current = null;
    const partes = location.pathname.split('/').filter(Boolean);
    if (partes[0] !== 'asignaturas' || !partes[1] || !partes[2]) {
      setBloqueoVerificando(false);
      setBloqueoError('');
      return;
    }

    const asignaturaId = Number(partes[1]);
    const vistas: Record<string, string> = {
      generalidades: 'generalidades',
      descripcion: 'descripcion',
      objetivos: 'objetivos',
      unidades: 'unidades',
      estrategia: 'estrategia',
      evaluacion: 'evaluacion',
      referencias: 'referencias',
    };
    const vista = vistas[partes[2]];
    if (!vista || !Number.isInteger(asignaturaId)) {
      setBloqueoVerificando(false);
      setBloqueoError('');
      return;
    }
    solicitudBloqueo.current = { generacion, asignaturaId, vista };

    let vigente = true;
    let intervalo: number | undefined;
    let ultimaActividad = Date.now();
    let ultimaRenovacion = Date.now();
    let bloqueoLiberado = false;
    setBloqueoVerificando(true);
    setBloqueoError('');

    const registrarActividad = () => {
      ultimaActividad = Date.now();
    };

    const liberarAlSalir = () => {
      if (bloqueoLiberado) return;
      bloqueoLiberado = true;
      if (bloqueoActivo.current?.asignaturaId === asignaturaId
        && bloqueoActivo.current.vista === vista) {
        void asignaturasApi.liberarBloqueo(asignaturaId, vista);
        bloqueoActivo.current = null;
      }
    };

    asignaturasApi.adquirirBloqueo(asignaturaId, vista)
      .then(() => {
        if (!vigente) {
          const solicitudActual = solicitudBloqueo.current;
          const reutilizadoPorEfectoActual = solicitudActual !== null
            && solicitudActual.generacion !== generacion
            && solicitudActual.asignaturaId === asignaturaId
            && solicitudActual.vista === vista;
          if (!reutilizadoPorEfectoActual)
            void asignaturasApi.liberarBloqueo(asignaturaId, vista);
          return;
        }
        bloqueoActivo.current = { asignaturaId, vista };
        ultimaActividad = Date.now();
        ultimaRenovacion = Date.now();
        setBloqueoVerificando(false);
        intervalo = window.setInterval(() => {
          if (Date.now() - ultimaActividad >= 5 * 60 * 1000) {
            liberarAlSalir();
            navigate(getDestinoDetalle(), { replace: true });
            return;
          }

          if (Date.now() - ultimaRenovacion >= 30000) {
            ultimaRenovacion = Date.now();
            void asignaturasApi.renovarBloqueo(asignaturaId, vista).catch((error: unknown) => {
              if (error instanceof Error
                && error.message.toLowerCase().includes('ya no está vigente')) {
                liberarAlSalir();
                navigate(getDestinoDetalle(), { replace: true });
              }
            });
          }
        }, 10000);
      })
      .catch((error: unknown) => {
        if (!vigente) return;
        if (error instanceof Error
          && error.message.toLowerCase().includes('esta vista está siendo editada por')) {
          navigate(getDestinoDetalle(), { replace: true });
          return;
        }
        setBloqueoVerificando(false);
        setBloqueoError(error instanceof Error
          ? error.message
          : 'Esta vista está siendo editada por otro usuario.');
      });

    const eventosActividad = ['pointerdown', 'pointermove', 'keydown', 'input', 'scroll', 'touchstart', 'wheel'];
    eventosActividad.forEach((evento) => window.addEventListener(evento, registrarActividad, { passive: true }));
    window.addEventListener('beforeunload', liberarAlSalir);

    return () => {
      vigente = false;
      if (intervalo) window.clearInterval(intervalo);
      eventosActividad.forEach((evento) => window.removeEventListener(evento, registrarActividad));
      window.removeEventListener('beforeunload', liberarAlSalir);
      liberarAlSalir();
    };
  }, [location.pathname, navigate]);

  useEffect(() => {
    setCambiosSinGuardar(true);
    salidaAutorizada.current = false;

    // Marcamos que estamos activamente dentro del layout de edición
    sessionStorage.setItem('en_modo_edicion_activo', 'true');
    window.history.pushState({ editMode: true }, '');

    const handlePopState = () => {
      if (cambiosSinGuardar && !salidaAutorizada.current) {
        window.history.pushState({ editMode: true }, '');
        const destino = getDestinoDetalle();
        setRutaDestinoPendiente(destino);
        setModalSalidaAbierto(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      sessionStorage.setItem('en_modo_edicion_activo', 'false');
    };
  }, [location.pathname]);

  // Prevenir cierre accidental
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (cambiosSinGuardar && !salidaAutorizada.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cambiosSinGuardar]);

  return (
    <div className="relative">
      {bloqueoVerificando ? (
        <p className="text-xs text-gray-500">Verificando disponibilidad de la vista...</p>
      ) : bloqueoError ? (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3">
          <p className="text-xs font-bold">{bloqueoError}</p>
          <button
            type="button"
            onClick={() => navigate(getDestinoDetalle(), { replace: true })}
            className="mt-3 text-xs font-bold text-[#050758]"
          >
            Volver al programa
          </button>
        </div>
      ) : (
        <Outlet />
      )}

      <ModalAlertaSalida
        isOpen={modalSalidaAbierto}
        mensaje="¿Ya guardaste los cambios antes de salir?"
        onConfirmar={() => {
          salidaAutorizada.current = true;
          setCambiosSinGuardar(false);
          setModalSalidaAbierto(false);

          const destino = rutaDestinoPendiente || getDestinoDetalle();

          // Marcamos en sessionStorage que ya salimos oficialmente de la edición
          sessionStorage.setItem('en_modo_edicion_activo', 'false');

          // Purgamos la historia para que el detalle quede totalmente blindado
          window.history.go(-2);
          setTimeout(() => {
            navigate(destino, { replace: true });
          }, 50);
        }}
        onCancelar={() => {
          setModalSalidaAbierto(false);
          setRutaDestinoPendiente(null);
        }}
      />
    </div>
  );
};