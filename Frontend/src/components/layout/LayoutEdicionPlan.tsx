import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ModalAlertaSalida } from '../modals/ModalAlertaSalida';

export const LayoutEdicionPlan: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(true);

  const salidaAutorizada = useRef(false);

  const getDestinoDetalle = () => {
    const esAsignatura = location.pathname.includes('/asignaturas/');
    return esAsignatura 
      ? location.pathname.split('/').slice(0, 3).join('/') 
      : location.pathname.split('/').slice(0, 3).join('/');
  };

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
      <Outlet />

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