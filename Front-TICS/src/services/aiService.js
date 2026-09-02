import { USE_MOCK, mockDelay, request } from "./api.js";
import { mockTrendingProducts, mockProducts } from "../mocks/mockData.js";

const STORAGE_KEY = "inventario_trending_products";

function getLocalTrending() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [...mockTrendingProducts];
}

function saveLocalTrending(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const aiService = {
  async getTrendingProducts(status = "PENDING") {
    if (USE_MOCK) {
      const data = getLocalTrending();
      if (status && status !== "ALL") {
        return mockDelay(data.filter((item) => item.status === status));
      }
      return mockDelay([...data]);
    }

    return request(`/trending-products?status=${status}`);
  },

  async approveTrendingProduct(id) {
    if (USE_MOCK) {
      const trends = getLocalTrending();
      const index = trends.findIndex((t) => t.id === id);
      if (index === -1) throw new Error("Sugerencia no encontrada");

      trends[index].status = "APPROVED";
      saveLocalTrending(trends);

      // Add to products catalog if not exists
      const storedProducts = localStorage.getItem("inventario_products_data");
      const products = storedProducts ? JSON.parse(storedProducts) : mockProducts;
      
      const newSku = `SKU-TR-${Math.floor(1000 + Math.random() * 9000)}`;
      const newProd = {
        id: `prod-ia-${Date.now()}`,
        sku: newSku,
        name: trends[index].title,
        category: trends[index].category || "Automatización",
        supplier: "Global Parts Network",
        supplierId: "PRV-401",
        currentStock: 0,
        dynamicThreshold: trends[index].suggestedQty ? Math.round(trends[index].suggestedQty * 0.2) : 200,
        reorderPoint: trends[index].suggestedQty ? Math.round(trends[index].suggestedQty * 0.2) : 200,
        optimalOrderQty: trends[index].suggestedQty || 1000,
        leadTimeDays: 7,
        description: `Producto incorporado vía sugerencia de IA (${trends[index].badgeType}). Fuente: ${trends[index].dataSource}`,
        unit: "uds",
        status: "AGOTADO",
        statusLabel: "AGOTADO",
        statusType: "danger",
        recommendedAction: "Generar PO inicial RPA",
        batches: [],
        movements: []
      };

      products.unshift(newProd);
      localStorage.setItem("inventario_products_data", JSON.stringify(products));

      return mockDelay({ suggestion: trends[index], createdProduct: newProd });
    }

    return request(`/trending-products/${id}/approve`, {
      method: "PATCH",
    });
  },

  async rejectTrendingProduct(id) {
    if (USE_MOCK) {
      const trends = getLocalTrending();
      const index = trends.findIndex((t) => t.id === id);
      if (index === -1) throw new Error("Sugerencia no encontrada");

      trends[index].status = "REJECTED";
      saveLocalTrending(trends);
      return mockDelay(trends[index]);
    }

    return request(`/trending-products/${id}/reject`, {
      method: "PATCH",
    });
  },

  async createTrendingProduct(trendData) {
    if (USE_MOCK) {
      const trends = getLocalTrending();
      const newTrend = {
        id: `TREND-${Date.now()}`,
        title: trendData.title,
        category: trendData.category || "General",
        score: trendData.score || 85,
        badgeType: trendData.badgeType || "DEMANDA EMERGENTE",
        confidenceBadge: trendData.badgeType === "ALTA CONFIANZA" ? "💡 ALTA CONFIANZA" : "📈 DEMANDA EMERGENTE",
        confidenceClass: trendData.badgeType === "ALTA CONFIANZA" ? "badge-blue" : "badge-teal",
        dataSource: trendData.dataSource || "Algoritmo Predictivo IA",
        suggestedQty: Number(trendData.suggestedQty) || 1000,
        formattedQty: `${Number(trendData.suggestedQty || 1000).toLocaleString()} uds`,
        status: "PENDING"
      };
      const updated = [newTrend, ...trends];
      saveLocalTrending(updated);
      return mockDelay(newTrend);
    }

    return request("/trending-products", {
      method: "POST",
      body: JSON.stringify(trendData),
    });
  }
};
