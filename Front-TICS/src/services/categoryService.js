import { USE_MOCK, mockDelay, request } from "./api.js";
import { mockCategories } from "../mocks/mockData.js";

const STORAGE_KEY = "inventario_categories_data";

function getLocalCategories() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [...mockCategories];
}

function saveLocalCategories(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const categoryService = {
  async getCategories() {
    if (USE_MOCK) {
      const data = getLocalCategories();
      return mockDelay([...data]);
    }
    return request("/categories");
  },

  async createCategory(categoryData) {
    if (USE_MOCK) {
      const current = getLocalCategories();
      const newId = `CAT-${String(current.length + 1).padStart(2, "0")}`;
      const newCat = {
        id: newId,
        name: categoryData.name,
        description: categoryData.description || "",
        totalProducts: Number(categoryData.totalProducts) || 0,
        status: categoryData.status || "Activo"
      };
      const updated = [newCat, ...current];
      saveLocalCategories(updated);
      return mockDelay(newCat);
    }

    return request("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },

  async updateCategory(id, categoryData) {
    if (USE_MOCK) {
      const current = getLocalCategories();
      const index = current.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Categoría no encontrada");

      current[index] = {
        ...current[index],
        ...categoryData,
      };
      saveLocalCategories(current);
      return mockDelay(current[index]);
    }

    return request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  }
};
