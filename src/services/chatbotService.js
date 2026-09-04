// Asegúrate de apuntar al puerto donde corre tu backend de Express
const API_URL = import.meta.env.VITE_API_URL;

export const chatbotService = {
  async getHistory() {
    try {
      const stored = localStorage.getItem('chatbot_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveHistory(messages) {
    localStorage.setItem('chatbot_history', JSON.stringify(messages));
  },

  clearHistory() {
    localStorage.removeItem('chatbot_history');
    return [];
  },

  async sendMessage(textToSend) {

    const response = await fetch(`${API_URL}inventory/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: textToSend })
    });

    if (!response.ok) {
      throw new Error('Error de conexión con el backend');
    }

    const data = await response.json();

    return {
      id: `bot-msg-${Date.now()}`,
      role: 'bot',
      text: data.respuesta_ia,
      productos: data.productos || null,
      timestamp: new Date().toISOString(),
    };
  }
};