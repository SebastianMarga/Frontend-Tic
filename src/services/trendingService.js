import apiFetch from "../interceptors/api.js"

export const trendingService = {

  async getTrendProducts() {
    const data = await apiFetch.get('/trends/trend-products');
    return data;
  },

  async approveTrendProduct(ids) {
    await apiFetch.patch(`/trends/approve`, ids);
  },

  async rejectTrendProduct(ids) {
    await apiFetch.patch(`/trends/reject`, ids);
  }
}