import apiFetch from '../interceptors/api.js';

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

    const data = await apiFetch.post('inventory/query', { prompt: textToSend });

    return {
      id: `bot-msg-${Date.now()}`,
      role: 'bot',
      text: data.respuesta_ia,
      productos: data.productos || null,
      timestamp: new Date().toISOString(),
    };
  }
};