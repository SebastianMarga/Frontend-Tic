import { USE_MOCK, mockDelay, request } from "./api.js";
import { mockUsers } from "../mocks/mockData.js";

const STORAGE_KEY = "inventario_users_data";

function getLocalUsers() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [...mockUsers];
}

function saveLocalUsers(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const userService = {
  async getUsers(filters = {}) {
    if (USE_MOCK) {
      let data = getLocalUsers();

      if (filters.role && filters.role !== "Todos los roles" && filters.role !== "Todos") {
        data = data.filter((u) => u.role.toLowerCase() === filters.role.toLowerCase());
      }
      if (filters.status && filters.status !== "Cualquier estado" && filters.status !== "Todos") {
        data = data.filter((u) => u.status.toLowerCase() === filters.status.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        data = data.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }

      return mockDelay([...data]);
    }

    const query = new URLSearchParams(filters).toString();
    return request(`/users${query ? `?${query}` : ""}`);
  },

  async createUser(userData) {
    if (USE_MOCK) {
      const current = getLocalUsers();
      const initials = userData.name
        ? userData.name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "US";

      const newUser = {
        id: `USR-${String(current.length + 1).padStart(3, "0")}`,
        name: userData.name,
        initials,
        email: userData.email,
        role: userData.role || "OPERATOR",
        status: "Activo",
        createdAt: new Date().toISOString().split("T")[0]
      };

      const updated = [newUser, ...current];
      saveLocalUsers(updated);
      return mockDelay(newUser);
    }

    return request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  async updateUserRole(id, userData) {
    if (USE_MOCK) {
      const current = getLocalUsers();
      const index = current.findIndex((u) => u.id === id);
      if (index === -1) throw new Error("Usuario no encontrado");

      current[index] = {
        ...current[index],
        ...userData,
        role: userData.role || current[index].role
      };
      saveLocalUsers(current);
      return mockDelay(current[index]);
    }

    return request(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  }
};
