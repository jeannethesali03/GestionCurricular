
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    'No se ha configurado la variable de entorno VITE_API_URL.'
  );
}

export const API_BASE_URL = API_URL.replace(/\/+$/, '');

export async function comprobarConexionAPI() {
  const response = await fetch(`${API_BASE_URL}/health/database`);

  if (!response.ok) {
    throw new Error(
      `Error al comunicarse con la API: HTTP ${response.status}`
    );
  }

  return response.json();
}
