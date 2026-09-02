import { USE_MOCK, mockDelay, request } from "./api.js";
import { mockUsers } from "../mocks/mockData.js";

const AUTH_USER_KEY = "inventario_auth_user";
const AUTH_TOKEN_KEY = "auth_token";

export const authService = {
  async login(email, password) {
    if (USE_MOCK) {
      await mockDelay(null, 300);
      const normalizedEmail = email?.trim().toLowerCase();
      
      // Valida si coincide con algún usuario registrado o con credenciales de prueba estándar
      const matchedUser = mockUsers.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );

      // Si es admin@inventario.ia o cualquier usuario válido
      if (matchedUser && password && password.length >= 4) {
        const token = `mock_jwt_token_${matchedUser.id}_${Date.now()}`;
        const sessionData = {
          user: matchedUser,
          token
        };
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matchedUser));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return sessionData;
      } else if (normalizedEmail === "admin@inventario.ia" && password === "admin123") {
        const adminUser = mockUsers[0];
        const token = `mock_jwt_token_admin_${Date.now()}`;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(adminUser));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return { user: adminUser, token };
      } else if (normalizedEmail === "operator@inventario.ia" || normalizedEmail === "miguel.gomez@inventarioia.com") {
        const operatorUser = mockUsers[1];
        const token = `mock_jwt_token_operator_${Date.now()}`;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(operatorUser));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return { user: operatorUser, token };
      }

      throw new Error("Credenciales inválidas. Por favor, inténtelo de nuevo.");
    }

    // Backend real
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    }
    return data;
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error parsing current user", e);
    }
    
    return null;
  },

  setCurrentUserRole(role) {
    const current = this.getCurrentUser() || mockUsers[0];
    const updated = { ...current, role };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    return updated;
  },

  logout() {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return Promise.resolve(true);
  }
};
