import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Trash2, Sparkles } from "lucide-react";
import { chatbotService } from "../services/chatbotService.js";
import "./Chatbot.css";

const SUGGESTIONS = [
  "¿Qué productos están por vencer?",
  "¿Cuál es el stock de un producto?",
  "¿Cómo está el estado de las órdenes RPA?",
];

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function Chatbot({ currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const history = await chatbotService.getHistory();
        if (mounted) setMessages(history);
      } catch (err) {
        console.error("Error cargando historial del chatbot:", err);
        if (mounted) setError("No se pudo cargar la conversación anterior.");
      } finally {
        if (mounted) setLoadingHistory(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const persist = (updatedMessages) => {
    chatbotService.saveHistory(updatedMessages);
  };

  const handleSend = async (textOverride) => {
    const textToSend = (textOverride ?? input).trim();
    if (!textToSend || isTyping) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    persist(updated);
    setInput("");
    setError(null);
    setIsTyping(true);

    try {
      const botMessage = await chatbotService.sendMessage(textToSend, updated);
      const withReply = [...updated, botMessage];
      setMessages(withReply);
      persist(withReply);
    } catch (err) {
      console.error("Error al enviar mensaje al chatbot:", err);
      setError(
        "No se pudo obtener respuesta del asistente. Intenta nuevamente.",
      );
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    const fresh = chatbotService.clearHistory();
    setMessages(fresh);
    setError(null);
  };

  return (
    <div className="page-container" id="chatbot-view">
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Asistente Virtual</h1>
          <p className="page-subtitle">
            Chatea con el asistente IA para consultar información del
            inventario.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={handleClear}
            id="btn-clear-chat"
            title="Limpiar conversación"
          >
            <Trash2 size={15} />
            <span>Limpiar chat</span>
          </button>
        </div>
      </div>

      <div className="chatbot-card card">
        <div className="chatbot-header">
          <div className="chatbot-header-avatar">
            <Bot size={18} />
          </div>
          <div className="chatbot-header-info">
            <span className="chatbot-header-name">Asistente Inventario IA</span>
            <span className="chatbot-header-status">
              <span className="chatbot-status-dot" />
              En línea (modo demostración)
            </span>
          </div>
        </div>

        <div className="chatbot-messages" ref={scrollRef}>
          {loadingHistory ? (
            <div className="chatbot-loading-state">
              Cargando conversación...
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message-row ${msg.role === "user" ? "from-user" : "from-bot"}`}
                >
                  <div className="chat-message-avatar">
                    {msg.role === "user" ? (
                      <User size={14} />
                    ) : (
                      <Bot size={14} />
                    )}
                  </div>
                  <div className="chat-message-bubble-wrap">
                    <div className="chat-message-bubble">{msg.text}</div>
                    <span className="chat-message-time">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-message-row from-bot">
                  <div className="chat-message-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="chat-message-bubble-wrap">
                    <div className="chat-message-bubble typing-bubble">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!loadingHistory && messages.length <= 1 && (
          <div className="chatbot-suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="chatbot-suggestion-chip"
                onClick={() => handleSend(s)}
              >
                <Sparkles size={12} />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}

        {error && <div className="chatbot-error-banner">{error}</div>}

        <div className="chatbot-input-bar">
          <textarea
            ref={inputRef}
            className="chatbot-input"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            id="chatbot-input"
          />
          <button
            className="btn btn-primary chatbot-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            id="btn-send-chat"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
