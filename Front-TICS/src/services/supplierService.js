import { USE_MOCK, mockDelay, request } from "./api.js";
import { mockSuppliers } from "../mocks/mockData.js";

const STORAGE_KEY = "inventario_suppliers_data";

function getLocalSuppliers() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [...mockSuppliers];
}

function saveLocalSuppliers(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const supplierService = {
  async getSuppliers() {
    if (USE_MOCK) {
      const data = getLocalSuppliers();
      return mockDelay([...data]);
    }
    return request("/suppliers");
  },

  async createSupplier(supplierData) {
    if (USE_MOCK) {
      const current = getLocalSuppliers();
      const newId = `PRV-${String(current.length + 1).padStart(3, "0")}`;
      const newSupplier = {
        id: newId,
        name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        associatedProducts: Number(supplierData.associatedProducts) || 0,
        hasRpaError: false,
      };
      const updated = [newSupplier, ...current];
      saveLocalSuppliers(updated);
      return mockDelay(newSupplier);
    }

    return request("/suppliers", {
      method: "POST",
      body: JSON.stringify(supplierData),
    });
  },

  async updateSupplier(id, supplierData) {
    if (USE_MOCK) {
      const current = getLocalSuppliers();
      const index = current.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Proveedor no encontrado");

      current[index] = {
        ...current[index],
        ...supplierData,
      };
      saveLocalSuppliers(current);
      return mockDelay(current[index]);
    }

    return request(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(supplierData),
    });
  },

  async deleteSupplier(id) {
    if (USE_MOCK) {
      const current = getLocalSuppliers();
      const target = current.find((s) => s.id === id);
      if (target && target.associatedProducts > 0) {
        throw new Error("No se puede eliminar un proveedor con productos asociados");
      }
      const updated = current.filter((s) => s.id !== id);
      saveLocalSuppliers(updated);
      return mockDelay({ success: true, id });
    }

    return request(`/suppliers/${id}`, {
      method: "DELETE",
    });
  }
};
