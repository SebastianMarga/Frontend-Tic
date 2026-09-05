import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

let isRefreshing = false;
let failedQueue = [];

const clearUiSession = () => {
  localStorage.removeItem("inventario_auth_user");
};

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export const apiFetch = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;

  const requestHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const defaultOptions = {
    ...options,
    credentials: 'include',
    headers: requestHeaders,
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  let response = await fetch(`${API_URL}${cleanEndpoint}`, defaultOptions);

  if (response.status === 401 && !endpoint.includes('/auth/')) {
    if (options._retry) {
      return response;
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiFetch(endpoint, { ...options, _retry: true }))
        .catch((err) => {
          throw err;
        });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_URL}auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!refreshRes.ok) {
        processQueue(new Error('Refresh auth failed'));
        throw new Error('No se pudo refrescar credenciales');
      }
      processQueue(null);

      return await apiFetch(endpoint, { ...options, _retry: true });
    } catch {
      clearUiSession();
      toast.error('Tu sesión ha expirado', { id: 'session-expired' });
      //globalThis.location.href = '/login';
      return response;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok && !endpoint.includes('/auth/refresh')) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error en la petición');
  }

  return response.ok ? await response.json() : response;
};

apiFetch.get = (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'GET' });

apiFetch.post = (endpoint, body, options = {}) =>
  apiFetch(endpoint, {
    ...options,
    method: 'POST',
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

apiFetch.put = (endpoint, body, options = {}) =>
  apiFetch(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

apiFetch.delete = (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'DELETE' });

apiFetch.patch = (endpoint, body, options = {}) =>
  apiFetch(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

export default apiFetch;