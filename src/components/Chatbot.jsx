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
        {/* Cabecera del Chatbot */}
        <div className="flex items-center gap-[12px] py-[16px] px-[20px] border-b border-solid border-[var(--border-color)] bg-[#fafbfc]">
          <div className="w-[36px] h-[36px] rounded-[var(--radius-pill)] bg-[var(--btn-primary-bg)] text-white flex items-center justify-center shrink-0">
            <Bot size={18} />
          </div>
          <div className="flex flex-col gap-[2px]">
            <span className="text-[14px] leading-[1.5] font-[700] text-[var(--text-primary)]">
              Asistente Inventario IA
            </span>
            <span className="flex items-center gap-[6px] text-[12px] leading-[1.5] text-[var(--text-secondary)]">
              <span className="w-[7px] h-[7px] rounded-full bg-[var(--color-success)] inline-block" />
              En línea (modo demostración)
            </span>
          </div>
        </div>

        {/* Contenedor de Mensajes */}
        <div
          className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[16px] bg-[var(--bg-app)]"
          ref={scrollRef}
        >
          {loadingHistory ? (
            <div className="text-center text-[var(--text-secondary)] text-[13px] leading-[1.5] py-[40px] px-0">
              Cargando conversación...
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-[8px] max-w-[90%] md:max-w-[78%] ${
                      isUser ? "self-end flex-row-reverse" : "self-start"
                    }`}
                  >
                    <div
                      className={`w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 ${
                        isUser
                          ? "bg-[var(--btn-primary-bg)] text-white"
                          : "bg-[#e0f2fe] text-[#0369a1]"
                      }`}
                    >
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </div>

                    <div
                      className={`flex flex-col gap-[4px] ${
                        isUser ? "items-end" : ""
                      }`}
                    >
                      <div
                        className={`py-[10px] px-[14px] rounded-[var(--radius-lg)] text-[13.5px] leading-[1.5] whitespace-pre-wrap [word-break:break-word] ${
                          isUser
                            ? "bg-[var(--btn-primary-bg)] text-white rounded-br-[2px]"
                            : "bg-white border border-solid border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-[2px]"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {msg.productos && msg.productos.length > 0 && (
                        <div className="flex gap-[12px] overflow-x-auto mt-[12px] pb-[8px]">
                          {msg.productos.map((prod, index) => (
                            <div
                              key={index}
                              className="w-[240px] min-w-[240px] shrink-0 bg-white rounded-[8px] p-[12px] border border-solid border-[#eee] text-[13px] flex flex-col"
                            >
                              {prod.urlImage && (
                                <img
                                  src={prod.urlImage}
                                  alt={prod.suggestedName}
                                  className="w-full h-[160px] object-contain rounded-[4px] mb-[10px]"
                                />
                              )}

                              <div
                                className="font-bold text-[#333] line-clamp-3 leading-[1.4] mb-auto"
                                title={prod.suggestedName}
                              >
                                {prod.suggestedName}
                              </div>

                              <div className="text-[#007bff] font-bold text-[15px] my-[8px]">
                                S/ {prod.suggestedPrice}
                              </div>

                              {prod.urlProduct && (
                                <a
                                  href={prod.urlProduct}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-center bg-[#f0f0f0] p-[8px] rounded-[4px] no-underline text-[#333] font-[500] hover:bg-[#e5e5e5] transition-colors"
                                >
                                  Ver producto
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <span className="text-[10.5px] leading-[1.5] text-[var(--text-muted)] py-0 px-[4px]">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-end gap-[8px] max-w-[90%] md:max-w-[78%] self-start">
                  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 bg-[#e0f2fe] text-[#0369a1]">
                    <Bot size={14} />
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <div className="py-[12px] px-[14px] rounded-[var(--radius-lg)] bg-white border border-solid border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-[2px] flex items-center gap-[4px]">
                      <span className="w-[6px] h-[6px] rounded-full bg-[var(--text-muted)] animate-bounce" />
                      <span className="w-[6px] h-[6px] rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:0.15s]" />
                      <span className="w-[6px] h-[6px] rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sugerencias Rápidas */}
        {!loadingHistory && messages.length <= 1 && (
          <div className="flex flex-wrap gap-[8px] pt-0 pb-[14px] px-[20px] bg-[var(--bg-app)]">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="inline-flex items-center gap-[6px] py-[7px] px-[12px] rounded-[var(--radius-pill)] border border-solid border-[var(--border-color)] bg-white text-[var(--text-primary)] text-[12px] leading-[1.5] cursor-pointer transition-all duration-150 ease-in-out hover:border-[var(--btn-primary-bg)] hover:bg-[#f1f5f9]"
                onClick={() => handleSend(s)}
              >
                <Sparkles size={12} />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}

        {/* Banner de Error */}
        {error && (
          <div className="mx-[20px] mb-[12px] mt-0 py-[10px] px-[14px] bg-[var(--bg-danger-light)] border border-solid border-[var(--border-danger)] text-[var(--color-danger)] rounded-[var(--radius-sm)] text-[12.5px] leading-[1.5]">
            {error}
          </div>
        )}

        {/* Barra de Entrada */}
        <div className="flex items-end gap-[10px] py-[14px] px-[20px] border-t border-solid border-[var(--border-color)] bg-white">
          <textarea
            ref={inputRef}
            className="flex-1 resize-none max-h-[120px] py-[10px] px-[14px] border border-solid border-[var(--border-color)] rounded-[var(--radius-md)] text-[13.5px] leading-[1.5] [font-family:var(--font-main)] text-[var(--text-primary)] outline-none transition-colors duration-150 ease-in-out focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_rgba(15,23,42,0.08)]"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            id="chatbot-input"
          />
          <button
            className="btn btn-primary !w-[40px] !h-[40px] !p-0 !rounded-[var(--radius-md)] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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