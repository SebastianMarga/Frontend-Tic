/**
 * Configuración de API y cliente base REST
 * Bandera USE_MOCK = true permite operar con mockData o con backend real si se pone en false.
 */

export const USE_MOCK = true;
export const API_BASE_URL = "/api";

/**
 * Utilidad para simular latencia de red en modo Mock y resolver promesas.
 */
export const mockDelay = (data, ms = 180) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, ms);
  });
};

/**
 * Cliente HTTP genérico para llamadas reales al backend cuando USE_MOCK = false
 */
export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("auth_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `HTTP Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
