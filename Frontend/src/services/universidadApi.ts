import { API_BASE_URL, authHeaders } from '../config/api';

export type EstadoRegistro = 'activo' | 'inactivo';
export type TipoEntidadUniversitaria = 'sede' | 'facultad' | 'carrera';

export interface SedeApi {
  idSede: number;
  nombreSede: string;
  direccion: string | null;
  telefono: string | null;
  estado: EstadoRegistro;
  facultades: { idFacultad: number; nombreFacultad: string; descripcionFacultad: string | null; estado: string }[];
}

export interface FacultadApi {
  idFacultad: number;
  idSede: number;
  nombreSede: string | null;
  nombreFacultad: string;
  decano: string | null;
  descripcionFacultad: string | null;
  estado: EstadoRegistro;
  carreras: { idCarrera: number; nombreCarrera: string; estado: string }[];
  usuarios: { idUsuario: number; nombreCompleto: string; correo: string; estadoCuenta: string }[];
}

export interface CarreraApi {
  idCarrera: number;
  idFacultad: number;
  nombreFacultad: string | null;
  nombreCarrera: string;
  estado: EstadoRegistro;
  planesEstudio: { idPlan: number; cicloInicio: string; cicloFin: string; estadoPlan: string }[];
  asignaturas: {
    idAsignatura: number;
    codigoAsignatura: string;
    nombreAsignatura: string;
    estado: string;
    estadoRelacion: string;
  }[];
}

export interface PlanEstudioApi {
  idPlan: number;
  idCarrera: number;
  nombreCarrera: string | null;
  modalidad: 'presencial' | 'semipresencial' | 'virtual';
  cicloInicio: string;
  cicloFin: string;
  estadoPlan: string;
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
      // Some responses, such as 204, have no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204 || response.status === 202) return undefined as T;
  return response.json() as Promise<T>;
}

const collectionPath: Record<TipoEntidadUniversitaria, string> = {
  sede: '/api/sedes',
  facultad: '/api/facultades',
  carrera: '/api/carreras',
};

export const universidadApi = {
  listarSedes: (incluirInactivas = false) =>
    request<SedeApi[]>(`/api/sedes?incluirInactivas=${incluirInactivas}`),
  crearSede: (data: { nombreSede: string; direccion: string; telefono: string }) =>
    request<SedeApi>('/api/sedes', { method: 'POST', body: JSON.stringify(data) }),
  actualizarSede: (id: number, data: { nombreSede: string; direccion: string; telefono: string }) =>
    request<void>(`/api/sedes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  listarFacultades: (incluirInactivas = false) =>
    request<FacultadApi[]>(`/api/facultades?incluirInactivas=${incluirInactivas}`),
  crearFacultad: (data: {
    idSede: number;
    nombreFacultad: string;
    decano: string;
    descripcionFacultad: string;
  }) => request<FacultadApi>('/api/facultades', { method: 'POST', body: JSON.stringify(data) }),
  actualizarFacultad: (id: number, data: {
    idSede: number;
    nombreFacultad: string;
    decano: string;
    descripcionFacultad: string;
  }) => request<void>(`/api/facultades/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  listarCarreras: (incluirInactivas = false) =>
    request<CarreraApi[]>(`/api/carreras?incluirInactivas=${incluirInactivas}`),
  listarPlanes: (incluirDesactivados = false) =>
    request<PlanEstudioApi[]>(`/api/planes-estudio?incluirDesactivados=${incluirDesactivados}`),
  crearCarrera: (data: { idFacultad: number; nombreCarrera: string }) =>
    request<CarreraApi>('/api/carreras', { method: 'POST', body: JSON.stringify(data) }),
  actualizarCarrera: (id: number, data: { idFacultad: number; nombreCarrera: string }) =>
    request<void>(`/api/carreras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  solicitarCodigo: (tipo: TipoEntidadUniversitaria, id: number, idUsuario: number) =>
    request<void>(`${collectionPath[tipo]}/${id}/codigo-desactivacion`, {
      method: 'POST',
      body: JSON.stringify({ idUsuario }),
    }),
  desactivar: (
    tipo: TipoEntidadUniversitaria,
    id: number,
    idUsuario: number,
    codigo: string,
  ) =>
    request<void>(`${collectionPath[tipo]}/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ idUsuario, codigo }),
    }),
  activar: (tipo: TipoEntidadUniversitaria, id: number, idUsuario: number) =>
    request<void>(`${collectionPath[tipo]}/${id}/activar`, {
      method: 'PUT',
      body: JSON.stringify({ idUsuario }),
    }),
};
