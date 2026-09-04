import { USE_MOCK, mockDelay, request } from "./api.js";
import { mockPurchaseOrders } from "../mocks/mockData.js";

const STORAGE_KEY = "inventario_rpa_orders";

function getLocalOrders() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [...mockPurchaseOrders];
}

function saveLocalOrders(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const rpaService = {
  async getPurchaseOrders(status = null) {
    if (USE_MOCK) {
      const data = getLocalOrders();
      if (status && status !== "ALL") {
        return mockDelay(data.filter((o) => o.status === status));
      }
      return mockDelay([...data]);
    }

    const query = status ? `?status=${status}` : "";
    return request(`/purchase-orders${query}`);
  },

  async getPurchaseOrderById(id) {
    if (USE_MOCK) {
      const data = getLocalOrders();
      const order = data.find((o) => o.id === id || o.orderId === id);
      if (!order) throw new Error("Orden de compra no encontrada");
      return mockDelay({ ...order });
    }

    return request(`/purchase-orders/${id}`);
  },

  async createPurchaseOrder(orderData) {
    if (USE_MOCK) {
      const current = getLocalOrders();
      const newId = `RPA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder = {
        id: newId,
        orderId: newId,
        supplier: orderData.supplier || "Global Logistics Corp",
        supplierId: orderData.supplierId || "PRV-001",
        dateTime:
          new Date().toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) +
          ", " +
          new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        quantity: Number(orderData.quantity) || 200,
        totalValue: Number(orderData.totalValue) || 7200,
        formattedTotal: `$${(Number(orderData.totalValue) || 7200).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        status: "PROCESSING",
        statusLabel: "PROCESSING",
        items: orderData.items || [
          {
            sku: orderData.sku || "SKU-AUTO",
            product: orderData.productName || "Insumo Reorden",
            qty: Number(orderData.quantity) || 200,
            unitPrice: 36.0,
          },
        ],
      };
      const updated = [newOrder, ...current];
      saveLocalOrders(updated);
      return mockDelay(newOrder);
    }

    return request("/purchase-orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  async updateOrderStatus(id, status, notes = "") {
    if (USE_MOCK) {
      const current = getLocalOrders();
      const index = current.findIndex((o) => o.id === id || o.orderId === id);
      if (index === -1) throw new Error("Orden no encontrada");

      current[index].status = status;
      current[index].statusLabel = status;
      if (notes) current[index].notes = notes;
      saveLocalOrders(current);
      return mockDelay(current[index]);
    }

    return request(`/purchase-orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  },

  async retryOrder(id, correctiveAction = "") {
    if (USE_MOCK) {
      const current = getLocalOrders();
      const index = current.findIndex((o) => o.id === id || o.orderId === id);
      if (index === -1) throw new Error("Orden no encontrada");

      current[index].status = "PROCESSING";
      current[index].statusLabel = "PROCESSING";
      current[index].correctiveAction = correctiveAction;
      current[index].lastRetry = new Date().toISOString();
      delete current[index].errorCode;

      // Simulate bot completion after short period
      setTimeout(() => {
        const live = getLocalOrders();
        const liveIndex = live.findIndex((o) => o.id === id);
        if (liveIndex !== -1 && live[liveIndex].status === "PROCESSING") {
          live[liveIndex].status = "SENT";
          live[liveIndex].statusLabel = "SENT";
          saveLocalOrders(live);
        }
      }, 3000);

      saveLocalOrders(current);
      return mockDelay(current[index]);
    }

    return request(`/purchase-orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "PROCESSING", correctiveAction }),
    });
  },
};
