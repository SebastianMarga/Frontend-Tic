import { USE_MOCK, mockDelay, request } from "./api.js";

const STORAGE_KEY = "inventario_chatbot_history";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  text:
    "¡Hola! 👋 Soy el asistente virtual de Inventario IA. Puedo ayudarte a consultar stock, " +
    "alertas de vencimiento, movimientos y sugerencias de reposición. ¿En qué puedo ayudarte hoy?",
  timestamp: new Date().toISOString(),
};

function getLocalHistory() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  return [WELCOME_MESSAGE];
}

function saveLocalHistory(messages) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function buildMockReply(userText) {
  const text = userText.toLowerCase();

  if (text.includes("stock") || text.includes("inventario")) {
    return "Según el catálogo actual, puedo ayudarte a revisar niveles de stock. " +
      "Ve a la sección 'Catálogo' para ver el detalle por producto, o dime el nombre del producto y te oriento.";
  }
  if (text.includes("vencimiento") || text.includes("alerta")) {
    return "Tienes alertas activas de próximos vencimientos en la sección 'Alertas de Vencimiento'. " +
      "¿Quieres que te resuma los productos más críticos?";
  }
  if (text.includes("proveedor")) {
    return "La información de proveedores está en 'Datos Maestros'. Puedo ayudarte a ubicar uno si me das el nombre.";
  }
  if (text.includes("orden") || text.includes("rpa")) {
    return "Las órdenes automatizadas por RPA se gestionan en 'Órdenes RPA'. ¿Buscas el estado de alguna orden en particular?";
  }
  if (text.includes("hola") || text.includes("buenas")) {
    return "¡Hola! ¿En qué puedo ayudarte con el sistema de inventario?";
  }
  if (text.includes("gracias")) {
    return "¡Con gusto! Aquí estaré si necesitas algo más.";
  }

  return "Todavía estoy en modo demostración (sin conexión al modelo de IA final), " +
    "pero ya puedo mostrar cómo se verá la conversación. Pronto responderé con información real del sistema.";
}

export const chatbotService = {
  async getHistory() {
    if (USE_MOCK) {
      return mockDelay(getLocalHistory(), 150);
    }
    return request("/chatbot/history");
  },

  async sendMessage(text, history = []) {
    if (USE_MOCK) {
      const botMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        text: buildMockReply(text),
        timestamp: new Date().toISOString(),
      };
      return mockDelay(botMessage, 700 + Math.random() * 600);
    }

    return request("/chatbot/message", {
      method: "POST",
      body: JSON.stringify({ message: text, history }),
    });
  },

  saveHistory(messages) {
    saveLocalHistory(messages);
  },

  clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
    return [WELCOME_MESSAGE];
  },
};