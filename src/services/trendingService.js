import apiFetch from "../interceptors/api.js";

export const trendingService = {
  // 1. Obtener productos nuevos sugeridos por el Chatbot (Tabla TrendingProduct)
  async getTrendProducts() {
    const response = await apiFetch.get("/trends/trend-products");
    return response;
  },

  // 2. Obtener productos actuales por reabastecer (PurchaseOrder con DRAFT + RESTOCK_ALERT)
  async getRestockSuggestions() {
    const response = await apiFetch.get("/inventory/restocks");
    // Si el backend responde { tipo: "RESTOCK_ALERT", data: [...] }, extraemos data de forma segura
    return response.data || response;
  },

  // 2.1 El admin aprueba una alerta de reestock: fija cantidad + cotización y el RPA compra
  async approveRestock(orderId, items) {
    return apiFetch.post(`/purchase-orders/${orderId}/approve-restock`, { items });
  },

  // 2.2 El admin rechaza la alerta: se elimina la orden borrador
  async rejectRestock(orderId) {
    await apiFetch.delete(`/purchase-orders/${orderId}`);
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