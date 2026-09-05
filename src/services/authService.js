import apiFetch from "../interceptors/api.js";

const AUTH_USER_KEY = "inventario_auth_user";

export const authService = {
  async login(email, password) {
    const data = await apiFetch.post("auth/login", { email, password });

    if (data.user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },

  async logout() {
    try {
      await apiFetch.post("auth/logout");
    } catch (error) {
      console.error("Error al cerrar sesión en el servidor", error);
    } finally {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    return true;
  },
};