import { API_BASE_URL, authHeaders } from '../config/api';

export interface AsignaturaApi {
  idAsignatura: number;
  nombreAsignatura: string;
  codigoAsignatura: string;
  areaFormacion: string;
  horasCiclo: number;
  horasSemana: number;
  horasPracticas: number;
  duracionCicloSemana: number;
  duracionHoraClase: number;
  unidadesValorativas: number;
  modalidad: 'presencial' | 'semipresencial' | 'nopresencial';
  estado: 'activo' | 'inactivo';
  descripcionAsignatura: string | null;
  estrategiaMetodologica: string | null;
  evaluacion: string | null;
  fuentesElectronicas: string | null;
  idCarrera: number | null;
  nombreCarrera: string | null;
  idFacultad: number | null;
  nombreFacultad: string | null;
  idSede: number | null;
  nombreSede: string | null;
  responsable: string | null;
  seccionesCompletas: number;
  seccionesTotal: number;
  asignadaPorPlan: boolean;
  asignadaDirectamente: boolean;
}

export interface AsignaturaDetalleApi {
  asignatura: AsignaturaApi;
  estado: 'activo' | 'inactivo';
  planes: {
    idPlan: number;
    nombreCarrera: string;
    cicloInicio: string;
    cicloFin: string;
    estadoPlan: string;
    numeroCiclo: number;
    numeroOrden: number;
  }[];
  carreras: { idCarrera: number; nombreCarrera: string }[];
  participantes: { idUsuario: number; nombreCompleto: string; correo: string }[];
  unidadesDidacticas: {
    idUnidadDidactica: number;
    nombre: string;
    objetivo: string;
    contenidos: { idContenido: number; nombre: string; descripcion: string | null }[];
  }[];
  objetivos: {
    idObjetivoAsignatura: number;
    tipo: 'general' | 'especifico';
    descripcionObjetivo: string;
  }[];
  prerrequisitos: { idPrerrequisito: number; nombreAsignatura: string }[];
  prerrequisitosNoAsignatura: { idPrerrequisitoNoAsignatura: number; nombre: string }[];
  referenciasBibliograficas: {
    idReferenciaBibliograficaAsignatura: number;
    referencia: string;
  }[];
  fuentesElectronicas: { idFuenteElectronicaAsignatura: number; referencia: string }[];
}

export interface AsignaturaInput {
  idCarrera: number;
  idPrerrequisitoAsignatura?: number | null;
  prerrequisitoNoAsignatura?: string | null;
  nombreAsignatura: string;
  codigoAsignatura: string;
  areaFormacion: string;
  horasCiclo: number;
  horasSemana: number;
  horasPracticas: number;
  duracionCicloSemana: number;
  duracionHoraClase: number;
  unidadesValorativas: number;
  modalidad: AsignaturaApi['modalidad'];
  descripcionAsignatura: string | null;
  estrategiaMetodologica: string | null;
  evaluacion: string | null;
  fuentesElectronicas: string | null;
}

export interface BloqueoAsignaturaResponse {
  usuarioId: string;
  nombreUsuario: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...authHeaders(),
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Error HTTP ${response.status}`;
    try {
      const problem = (await response.json()) as { title?: string; detail?: string };
      message = problem.detail || problem.title || message;
    } catch {
      // Some responses have no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204 || response.status === 202) return undefined as T;
  return response.json() as Promise<T>;
}

export const asignaturasApi = {
  obtenerBloqueos: (id: number) =>
    request<Record<string, string>>(`/api/asignaturas/${id}/bloqueos`),
  adquirirBloqueo: (id: number, vista: string) =>
    request<BloqueoAsignaturaResponse>(`/api/asignaturas/${id}/bloqueos/${vista}`, {
      method: 'POST',
    }),
  renovarBloqueo: (id: number, vista: string) =>
    request<void>(`/api/asignaturas/${id}/bloqueos/${vista}/renovar`, {
      method: 'PUT',
    }),
  liberarBloqueo: (id: number, vista: string) =>
    request<void>(`/api/asignaturas/${id}/bloqueos/${vista}`, {
      method: 'DELETE',
      keepalive: true,
    }),
  listar: (incluirInactivas = false) =>
    request<AsignaturaApi[]>(`/api/asignaturas?incluirInactivas=${incluirInactivas}`),
  obtener: (id: number) =>
    request<AsignaturaApi>(`/api/asignaturas/${id}`),
  obtenerDetalles: (id: number) =>
    request<AsignaturaDetalleApi>(`/api/asignaturas/${id}/detalles`),
  crear: (datos: AsignaturaInput) =>
    request<AsignaturaApi>('/api/asignaturas', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),
  actualizarGeneralidades: (
    id: number,
    datos: Omit<AsignaturaInput, 'idCarrera' | 'descripcionAsignatura' | 'estrategiaMetodologica' | 'evaluacion' | 'fuentesElectronicas'> & {
      idPrerrequisitoAsignatura: number | null;
      prerrequisitoNoAsignatura: string | null;
    },
  ) =>
    request<void>(`/api/asignaturas/${id}/generalidades`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    }),
  actualizarDescripcion: (id: number, descripcionAsignatura: string) =>
    request<void>(`/api/asignaturas/${id}/descripcion`, {
      method: 'PUT',
      body: JSON.stringify({ descripcionAsignatura }),
    }),
  actualizarObjetivos: (
    id: number,
    objetivoGeneral: string,
    objetivosEspecificos: string[],
  ) =>
    request<void>(`/api/asignaturas/${id}/objetivos`, {
      method: 'PUT',
      body: JSON.stringify({ objetivoGeneral, objetivosEspecificos }),
    }),
  actualizarUnidades: (
    id: number,
    unidades: { nombre: string; objetivo: string; contenidos: { nombre: string; descripcion: string }[] }[],
  ) =>
    request<void>(`/api/asignaturas/${id}/unidades`, {
      method: 'PUT',
      body: JSON.stringify({ unidades }),
    }),
  actualizarEstrategia: (id: number, texto: string) =>
    request<void>(`/api/asignaturas/${id}/estrategia`, {
      method: 'PUT',
      body: JSON.stringify({ texto }),
    }),
  actualizarEvaluacion: (id: number, texto: string) =>
    request<void>(`/api/asignaturas/${id}/evaluacion`, {
      method: 'PUT',
      body: JSON.stringify({ texto }),
    }),
  actualizarReferencias: (
    id: number,
    referenciasBibliograficas: string[],
    fuentesElectronicas: string[],
  ) =>
    request<void>(`/api/asignaturas/${id}/referencias`, {
      method: 'PUT',
      body: JSON.stringify({ referenciasBibliograficas, fuentesElectronicas }),
    }),
  solicitarCodigoDesactivacion: (id: number) =>
    request<void>(`/api/asignaturas/${id}/codigo-desactivacion`, {
      method: 'POST',
    }),
  desactivar: (id: number, codigo: string) =>
    request<void>(`/api/asignaturas/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ codigo }),
    }),
  activar: (id: number) =>
    request<void>(`/api/asignaturas/${id}/activar`, {
      method: 'PUT',
    }),
};
