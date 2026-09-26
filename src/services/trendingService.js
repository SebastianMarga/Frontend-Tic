import apiFetch from "../interceptors/api.js"

export const trendingService = {

  async getTrendProducts() {
    const data = await apiFetch.get('/trends/trend-products');
    return data;
  },

  async approveTrendProduct(id) {
    await apiFetch.patch(`/trends/${id}/approve`);
  },

  async rejectTrendProducto(id) {
    await apiFetch.patch(`/trends/${id}/reject`);
  }
}