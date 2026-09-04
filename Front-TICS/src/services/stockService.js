import { USE_MOCK, mockDelay, request } from "./api.js";
import { mockMovements, mockProducts } from "../mocks/mockData.js";

const MOVEMENTS_STORAGE_KEY = "inventario_movements_data";
const PRODUCTS_STORAGE_KEY = "inventario_products_data";

function getLocalMovements() {
  const stored = localStorage.getItem(MOVEMENTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return [...mockMovements];
}

function saveLocalMovements(data) {
  localStorage.setItem(MOVEMENTS_STORAGE_KEY, JSON.stringify(data));
}

function getLocalProducts() {
  const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
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
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(data));
}

export const stockService = {
  async getMovements(filters = {}) {
    if (USE_MOCK) {
      let data = getLocalMovements();

      if (
        filters.type &&
        filters.type !== "Todos los tipos" &&
        filters.type !== "Todos"
      ) {
        data = data.filter(
          (m) => m.type.toLowerCase() === filters.type.toLowerCase(),
        );
      }

      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        data = data.filter(
          (m) =>
            m.productName.toLowerCase().includes(q) ||
            m.sku.toLowerCase().includes(q) ||
            m.batchNumber.toLowerCase().includes(q) ||
            m.operator.toLowerCase().includes(q),
        );
      }

      return mockDelay([...data]);
    }

    const query = new URLSearchParams(filters).toString();
    return request(`/stock/movements${query ? `?${query}` : ""}`);
  },

  async registerStockIn({
    productId,
    quantity,
    batchNumber,
    expDate,
    note = "Entrada manual de stock",
  }) {
    if (USE_MOCK) {
      const products = getLocalProducts();
      const productIndex = products.findIndex(
        (p) => p.id === productId || p.sku === productId,
      );
      const qtyNum = Math.abs(Number(quantity)) || 0;

      let productObj = null;
      if (productIndex !== -1) {
        products[productIndex].currentStock += qtyNum;
        if (!products[productIndex].batches)
          products[productIndex].batches = [];

        const newBatch = {
          id: `LT-${Date.now().toString().slice(-4)}`,
          batchNumber:
            batchNumber ||
            `L-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          quantity: qtyNum,
          expDate: expDate || "2026-12-31",
          daysRemaining: 90,
        };
        products[productIndex].batches.push(newBatch);

        // Update status
        if (
          products[productIndex].currentStock >
          products[productIndex].dynamicThreshold
        ) {
          products[productIndex].status = "SALUDABLE";
          products[productIndex].statusLabel = "SALUDABLE";
          products[productIndex].statusType = "success";
        }
        productObj = products[productIndex];
        saveLocalProducts(products);
      }

      const newMovement = {
        id: `MOV-${Date.now()}`,
        dateTime:
          new Date().toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
          }) +
          " " +
          new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        type: "Entrada",
        productName: productObj ? productObj.name : "Producto Desconocido",
        sku: productObj ? productObj.sku : "SKU-GEN",
        quantity: qtyNum,
        formattedQty: `+${qtyNum.toLocaleString()}`,
        batchNumber: batchNumber || "L-GEN-01",
        operator: "OPERATOR",
        reason: note,
      };

      const movements = [newMovement, ...getLocalMovements()];
      saveLocalMovements(movements);

      return mockDelay({ movement: newMovement, product: productObj });
    }

    return request("/stock/in", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, batchNumber, expDate, note }),
    });
  },

  async registerStockOut({ productId, quantity, reason = "Despacho manual" }) {
    if (USE_MOCK) {
      const products = getLocalProducts();
      const productIndex = products.findIndex(
        (p) => p.id === productId || p.sku === productId,
      );
      const qtyNum = Math.abs(Number(quantity)) || 0;

      let productObj = null;
      if (productIndex !== -1) {
        products[productIndex].currentStock = Math.max(
          0,
          products[productIndex].currentStock - qtyNum,
        );

        // Update status
        if (products[productIndex].currentStock === 0) {
          products[productIndex].status = "AGOTADO";
          products[productIndex].statusLabel = "AGOTADO";
          products[productIndex].statusType = "danger";
        } else if (
          products[productIndex].currentStock <=
          products[productIndex].dynamicThreshold
        ) {
          products[productIndex].status = "STOCK_BAJO";
          products[productIndex].statusLabel = "STOCK BAJO";
          products[productIndex].statusType = "warning";
        }
        productObj = products[productIndex];
        saveLocalProducts(products);
      }

      const newMovement = {
        id: `MOV-${Date.now()}`,
        dateTime:
          new Date().toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
          }) +
          " " +
          new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        type: "Salida",
        productName: productObj ? productObj.name : "Producto Desconocido",
        sku: productObj ? productObj.sku : "SKU-GEN",
        quantity: -qtyNum,
        formattedQty: `-${qtyNum.toLocaleString()}`,
        batchNumber: productObj?.batches?.[0]?.batchNumber || "FEFO-Auto",
        operator: "OPERATOR",
        reason,
      };

      const movements = [newMovement, ...getLocalMovements()];
      saveLocalMovements(movements);

      return mockDelay({ movement: newMovement, product: productObj });
    }

    return request("/stock/out", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, reason }),
    });
  },

  async registerAdjustment({ productId, newPhysicalStock, reason }) {
    if (USE_MOCK) {
      const products = getLocalProducts();
      const productIndex = products.findIndex(
        (p) => p.id === productId || p.sku === productId,
      );
      const newStock = Number(newPhysicalStock);

      let diff = 0;
      let productObj = null;

      if (productIndex !== -1) {
        const oldStock = products[productIndex].currentStock;
        diff = newStock - oldStock;
        products[productIndex].currentStock = newStock;

        if (newStock === 0) {
          products[productIndex].status = "AGOTADO";
          products[productIndex].statusLabel = "AGOTADO";
          products[productIndex].statusType = "danger";
        } else if (newStock <= products[productIndex].dynamicThreshold) {
          products[productIndex].status = "STOCK_BAJO";
          products[productIndex].statusLabel = "STOCK BAJO";
          products[productIndex].statusType = "warning";
        } else {
          products[productIndex].status = "SALUDABLE";
          products[productIndex].statusLabel = "SALUDABLE";
          products[productIndex].statusType = "success";
        }

        productObj = products[productIndex];
        saveLocalProducts(products);
      }

      const newMovement = {
        id: `MOV-${Date.now()}`,
        dateTime:
          new Date().toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
          }) +
          " " +
          new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        type: "Ajuste",
        productName: productObj ? productObj.name : "Producto Desconocido",
        sku: productObj ? productObj.sku : "SKU-GEN",
        quantity: diff,
        formattedQty: diff > 0 ? `+${diff}` : `${diff}`,
        batchNumber: productObj?.batches?.[0]?.batchNumber || "Ajuste-Audit",
        operator: "ADMIN",
        reason: reason || "Ajuste físico de inventario tras conteo",
      };

      const movements = [newMovement, ...getLocalMovements()];
      saveLocalMovements(movements);

      return mockDelay({ movement: newMovement, product: productObj });
    }

    return request("/stock/adjustment", {
      method: "POST",
      body: JSON.stringify({ productId, newPhysicalStock, reason }),
    });
  },

  async exportMovementsForIa() {
    if (USE_MOCK) {
      const movements = getLocalMovements();
      return mockDelay({
        exportedRecords: movements.length,
        timestamp: new Date().toISOString(),
        downloadUrl: "#mock-export-csv",
        format: "CSV / JSON (IA-Ready Dataset)",
      });
    }

    return request("/stock/movements/export");
  },
};
