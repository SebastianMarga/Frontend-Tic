import { USE_MOCK, mockDelay, request } from "./api.js";
import { mockProducts } from "../mocks/mockData.js";

const STORAGE_KEY = "inventario_products_data";

function getLocalProducts() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [...mockProducts];
}

function saveLocalProducts(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const productService = {
  async getProducts(filters = {}) {
    if (USE_MOCK) {
      let data = getLocalProducts();

      if (filters.category && filters.category !== "Todas las Categorías" && filters.category !== "Todas") {
        data = data.filter((p) => p.category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.supplier && filters.supplier !== "Todos los Proveedores" && filters.supplier !== "Todos") {
        data = data.filter((p) => p.supplier.toLowerCase() === filters.supplier.toLowerCase());
      }
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        data = data.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.sku.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
      }
      if (filters.lowStockOnly) {
        data = data.filter((p) => p.currentStock <= p.dynamicThreshold);
      }

      return mockDelay([...data]);
    }

    const queryParams = new URLSearchParams(filters).toString();
    return request(`/products${queryParams ? `?${queryParams}` : ""}`);
  },

  async getProductById(id) {
    if (USE_MOCK) {
      const data = getLocalProducts();
      const product = data.find((p) => p.id === id || p.sku === id);
      if (!product) throw new Error("Producto no encontrado");
      return mockDelay({ ...product });
    }
    return request(`/products/${id}`);
  },

  async createProduct(productData) {
    if (USE_MOCK) {
      const current = getLocalProducts();
      const newProduct = {
        id: `prod-${Date.now()}`,
        sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: productData.name,
        category: productData.category,
        supplier: productData.supplier,
        supplierId: productData.supplierId || "PRV-001",
        currentStock: Number(productData.currentStock) || 0,
        dynamicThreshold: Number(productData.dynamicThreshold) || 100,
        reorderPoint: Number(productData.dynamicThreshold) || 100,
        optimalOrderQty: Number(productData.optimalOrderQty) || 200,
        leadTimeDays: Number(productData.leadTimeDays) || 5,
        description: productData.description || "",
        unit: productData.unit || "uds",
        status: (Number(productData.currentStock) || 0) <= (Number(productData.dynamicThreshold) || 100) ? "STOCK_BAJO" : "SALUDABLE",
        statusLabel: (Number(productData.currentStock) || 0) <= (Number(productData.dynamicThreshold) || 100) ? "STOCK BAJO" : "SALUDABLE",
        statusType: (Number(productData.currentStock) || 0) <= (Number(productData.dynamicThreshold) || 100) ? "warning" : "success",
        recommendedAction: "Supervisión activa",
        batches: [],
        movements: [
          {
            id: `mov-${Date.now()}`,
            type: "Entrada",
            quantity: Number(productData.currentStock) || 0,
            date: "Hoy, Registro Inicial",
            note: "Alta inicial de catálogo",
            operator: "ADMIN"
          }
        ]
      };
      const updated = [newProduct, ...current];
      saveLocalProducts(updated);
      return mockDelay(newProduct);
    }

    return request("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id, productData) {
    if (USE_MOCK) {
      const current = getLocalProducts();
      const index = current.findIndex((p) => p.id === id || p.sku === id);
      if (index === -1) throw new Error("Producto no encontrado");

      const threshold = Number(productData.dynamicThreshold) !== undefined ? Number(productData.dynamicThreshold) : current[index].dynamicThreshold;
      const stock = Number(productData.currentStock) !== undefined ? Number(productData.currentStock) : current[index].currentStock;
      
      let status = "SALUDABLE";
      let statusLabel = "SALUDABLE";
      let statusType = "success";
      if (stock === 0) {
        status = "AGOTADO";
        statusLabel = "AGOTADO";
        statusType = "danger";
      } else if (stock <= threshold) {
        status = "STOCK_BAJO";
        statusLabel = "STOCK BAJO";
        statusType = "warning";
      }

      current[index] = {
        ...current[index],
        ...productData,
        dynamicThreshold: threshold,
        currentStock: stock,
        status,
        statusLabel,
        statusType
      };

      saveLocalProducts(current);
      return mockDelay(current[index]);
    }

    return request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  },

  async updateIaParams(id, params) {
    if (USE_MOCK) {
      const current = getLocalProducts();
      const index = current.findIndex((p) => p.id === id || p.sku === id);
      if (index === -1) throw new Error("Producto no encontrado");

      current[index] = {
        ...current[index],
        dynamicThreshold: params.dynamicThreshold ?? current[index].dynamicThreshold,
        optimalOrderQty: params.optimalOrderQty ?? current[index].optimalOrderQty,
        leadTimeDays: params.leadTimeDays ?? current[index].leadTimeDays,
      };
      saveLocalProducts(current);
      return mockDelay(current[index]);
    }

    return request(`/products/${id}/ia-params`, {
      method: "PATCH",
      body: JSON.stringify(params),
    });
  }
};
