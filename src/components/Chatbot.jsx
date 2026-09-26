import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Trash2, Sparkles } from "lucide-react";
import { chatbotService } from "../services/chatbotService.js";

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

      <div className="card flex flex-col h-[calc(100vh-260px)] md:h-[calc(100vh-220px)] min-h-[480px] max-w-[860px] mx-auto">
        <div className="flex items-center gap-3 py-4 px-5 border-b border-border bg-[#fafbfc]">
          <div className="w-9 h-9 rounded-pill bg-btn-primary-bg text-btn-primary-text flex items-center justify-center flex-shrink-0">
            <Bot size={18} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-text-primary">
              Asistente Inventario IA
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="w-[7px] h-[7px] rounded-full bg-success inline-block" />
              En línea (modo demostración)
            </span>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-app"
          ref={scrollRef}
        >
          {loadingHistory ? (
            <div className="text-center text-text-secondary text-[13px] py-10">
              Cargando conversación...
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 max-w-[90%] md:max-w-[78%] ${
                      isUser ? "self-end flex-row-reverse" : "self-start"
                    }`}
                  >
                    <div
                      className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 ${
                        isUser
                          ? "bg-btn-primary-bg text-btn-primary-text"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div
                      className={`flex flex-col gap-1 ${isUser ? "items-end" : ""}`}
                    >
                      <div
                        className={`px-3.5 py-2.5 rounded-lg text-[13.5px] leading-relaxed whitespace-pre-wrap break-words ${
                          isUser
                            ? "bg-btn-primary-bg text-btn-primary-text rounded-br-[2px]"
                            : "bg-white border border-border text-text-primary rounded-bl-[2px]"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {msg.productos && msg.productos.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto mt-3 pb-2">
                          {msg.productos.map((prod, index) => (
                            <div
                              key={index}
                              className="w-[240px] min-w-[240px] flex-shrink-0 bg-white rounded-lg p-3 border border-[#eee] text-[13px] flex flex-col"
                            >
                              {prod.urlImage && (
                                <img
                                  src={prod.urlImage}
                                  alt={prod.suggestedName}
                                  className="w-full h-[160px] object-contain rounded mb-2.5"
                                />
                              )}

                              <div
                                className="font-bold text-[#333] line-clamp-3 leading-[1.4] mb-auto"
                                title={prod.suggestedName}
                              >
                                {prod.suggestedName}
                              </div>

                              <div className="text-[#007bff] font-bold text-[15px] my-2">
                                S/ {prod.suggestedPrice}
                              </div>

                              {prod.urlProduct && (
                                <a
                                  href={prod.urlProduct}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-center bg-[#f0f0f0] p-2 rounded no-underline text-[#333] font-medium"
                                >
                                  Ver producto
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <span className="text-[10.5px] text-text-muted px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-end gap-2 max-w-[90%] md:max-w-[78%] self-start">
                  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 bg-sky-100 text-sky-700">
                    <Bot size={14} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="bg-white border border-border rounded-lg rounded-bl-[2px] flex items-center gap-1 px-3.5 py-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-[chatbotTypingBounce_1.2s_infinite_ease-in-out]" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-text-muted animate-[chatbotTypingBounce_1.2s_infinite_ease-in-out]"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-text-muted animate-[chatbotTypingBounce_1.2s_infinite_ease-in-out]"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!loadingHistory && messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 px-5 pb-3.5 bg-app">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill border border-border bg-white text-text-primary text-xs cursor-pointer transition-all duration-150 hover:border-btn-primary-bg hover:bg-slate-100"
                onClick={() => handleSend(s)}
              >
                <Sparkles size={12} />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mx-5 mb-3 px-3.5 py-2.5 bg-danger-light border border-danger-border text-danger rounded-sm text-[12.5px]">
            {error}
          </div>
        )}

        <div className="flex items-end gap-2.5 px-5 py-3.5 border-t border-border bg-white">
          <textarea
            ref={inputRef}
            className="flex-1 resize-none max-h-[120px] px-3.5 py-2.5 border border-border rounded-md text-[13.5px] font-main text-text-primary outline-none transition-colors duration-150 focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            id="chatbot-input"
          />
          <button
            className="btn btn-primary w-10 h-10 p-0 rounded-md flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
