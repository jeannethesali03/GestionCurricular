
import { API_BASE_URL, comprobarConexionAPI } from '../src/config/api';

async function main() {
  console.log('URL configurada:', API_BASE_URL);

  try {
    const resultado = await comprobarConexionAPI();
    console.log('Conexión correcta:', resultado);
  } catch (error) {
    console.error('Error de conexión:', error);
    throw error;
  }
}

main();
