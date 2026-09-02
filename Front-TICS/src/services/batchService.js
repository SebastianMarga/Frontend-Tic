import { USE_MOCK, mockDelay, request } from "./api.js";
import { mockBatchesExpiring, mockProducts } from "../mocks/mockData.js";

const STORAGE_KEY = "inventario_expiring_batches";

function getLocalBatches() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [...mockBatchesExpiring];
}

export const batchService = {
  async getBatchesByProduct(productId) {
    if (USE_MOCK) {
      const storedProducts = localStorage.getItem("inventario_products_data");
      const products = storedProducts ? JSON.parse(storedProducts) : mockProducts;
      const product = products.find((p) => p.id === productId || p.sku === productId);
      return mockDelay(product?.batches ? [...product.batches] : []);
    }
    return request(`/products/${productId}/batches`);
  },

  async getExpiringBatches(days = 30) {
    if (USE_MOCK) {
      const data = getLocalBatches();
      if (days) {
        return mockDelay(data.filter((b) => b.daysRemaining <= days));
      }
      return mockDelay([...data]);
    }
    return request(`/batches/expiring?days=${days}`);
  }
};
