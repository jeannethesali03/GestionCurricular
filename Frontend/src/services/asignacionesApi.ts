import { API_BASE_URL, authHeaders } from '../config/api';

export interface AsignacionesOpcionesApi {
  facultades: { idFacultad: number; nombreFacultad: string }[];
  usuarios: {
    idUsuario: number;
    nombreCompleto: string;
    correo: string;
    idFacultad: number;
    nombreFacultad: string;
  }[];
  planes: {
    idPlan: number;
    cicloInicio: string;
    cicloFin: string;
    nombreCarrera: string;
    idFacultad: number;
    nombreFacultad: string;
  }[];
  asignaturas: {
    idAsignatura: number;
    codigoAsignatura: string;
    nombreAsignatura: string;
    idFacultad: number;
    nombreFacultad: string;
  }[];
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

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const asignacionesApi = {
  obtenerOpciones: () => request<AsignacionesOpcionesApi>('/api/asignaciones/opciones'),
  crear: (datos: { idsUsuarios: number[]; idsPlanes: number[]; idsAsignaturas: number[] }) =>
    request<void>('/api/asignaciones', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),
};
