import apiFetch from "../interceptors/api.js";

export const trendingService = {
  // 1. Obtener productos nuevos sugeridos por el Chatbot (Tabla TrendingProduct)
  async getTrendProducts() {
    const data = await apiFetch.get("/trends/trend-products");
    return data;
  },

  // 2. NUEVO: Obtener productos actuales por reabastecer (Tabla PurchaseOrder en DRAFT)
  async getRestockSuggestions() {
    const data = await apiFetch.get("/inventory/restocks");
    return data;
  },

  // 3. Aprobar sugerencias de tendencias
  async approveTrendProduct(ids) {
    await apiFetch.patch(`/trends/approve`, ids);
  },

  // 4. Rechazar sugerencias de tendencias
  async rejectTrendProduct(ids) {
    await apiFetch.patch(`/trends/reject`, ids);
  },
};