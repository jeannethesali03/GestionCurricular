import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { asignaturasApi, type AsignaturaDetalleApi } from '../services/asignaturasApi';

export function useAsignaturaDetalle() {
  const { asignaturaId } = useParams();
  const { user } = useAuth();
  const id = Number(asignaturaId);
  const idUsuario = user ? Number(user.id) : null;
  const clave = `${idUsuario ?? ''}:${id}`;
  const idValido = idUsuario !== null && Number.isInteger(id) && id > 0;
  const [resultado, setResultado] = useState<{
    clave: string;
    detalle: AsignaturaDetalleApi | null;
    error: string;
  } | null>(null);

  useEffect(() => {
    let vigente = true;
    if (!idValido) return () => { vigente = false; };

    asignaturasApi.obtenerDetalles(id)
      .then((resultado) => {
        if (vigente) setResultado({ clave, detalle: resultado, error: '' });
      })
      .catch((error: unknown) => {
        if (vigente) {
          setResultado({
            clave,
            detalle: null,
            error: error instanceof Error ? error.message : 'No se pudo cargar la asignatura.',
          });
        }
      });

    return () => { vigente = false; };
  }, [clave, id, idValido]);

  const resultadoActual = resultado?.clave === clave ? resultado : null;

  return {
    detalle: resultadoActual?.detalle ?? null,
    cargando: Boolean(user) && idValido && !resultadoActual,
    error: !user
      ? ''
      : !idValido
        ? 'La asignatura indicada no es válida.'
        : resultadoActual?.error ?? '',
  };
}
