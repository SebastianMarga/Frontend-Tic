import { USE_MOCK, mockDelay, request } from "./api.js";
import { mockUsers } from "../mocks/mockData.js";
import { userService } from "./userService.js";

const AUTH_USER_KEY = "inventario_auth_user";
const AUTH_TOKEN_KEY = "auth_token";

export const authService = {
  async login(email, password) {
    // PROVISIONAL SOLO PARA MOCK
    if (USE_MOCK) {
      await mockDelay(null, 300);
      const normalizedEmail = email?.trim().toLowerCase();

      // Valida si coincide con algún usuario registrado o con credenciales de prueba estándar
      const matchedUser = mockUsers.find(
        (u) => u.email.toLowerCase() === normalizedEmail,
      );

      // Si es admin@inventario.ia o cualquier usuario válido
      if (matchedUser && password && password.length >= 4) {
        const token = `mock_jwt_token_${matchedUser.id}_${Date.now()}`;
        const sessionData = {
          user: matchedUser,
          token,
        };
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matchedUser));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return sessionData;
      } else if (
        normalizedEmail === "admin@inventario.ia" &&
        password === "admin123"
      ) {
        const adminUser = mockUsers[0];
        const token = `mock_jwt_token_admin_${Date.now()}`;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(adminUser));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return { user: adminUser, token };
      } else if (
        normalizedEmail === "operator@inventario.ia" ||
        normalizedEmail === "miguel.gomez@inventarioia.com"
      ) {
        const operatorUser = mockUsers[1];
        const token = `mock_jwt_token_operator_${Date.now()}`;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(operatorUser));
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return { user: operatorUser, token };
      }

      throw new Error("Credenciales inválidas. Por favor, inténtelo de nuevo.");
    }

    // BACKEND REAL
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

  async register({ name, email, password }) {
    const assignedRole = "OPERATOR";

    if (USE_MOCK) {
      await mockDelay(null, 400);
      const normalizedEmail = email?.trim().toLowerCase();

      if (!name || name.trim().length < 2) {
        throw new Error("El nombre completo es requerido.");
      }

      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        throw new Error("Ingrese un correo electrónico válido.");
      }

      if (!password || password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
      }

      // Validar si ya existe el correo
      const allUsers = (await userService.getUsers()) || mockUsers;
      const exists = allUsers.some(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );
      if (exists) {
        throw new Error("Ya existe una cuenta registrada con este correo electrónico.");
      }

      // Crear usuario en base de datos local con rol OPERATOR
      const newUser = await userService.createUser({
        name: name.trim(),
        email: normalizedEmail,
        role: assignedRole,
        status: "Activo"
      });

      const token = `mock_jwt_token_${newUser.id}_${Date.now()}`;
      const sessionData = {
        user: newUser,
        token
      };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return sessionData;
    }

    // BACKEND REAL
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role: assignedRole }),
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
  },
};
