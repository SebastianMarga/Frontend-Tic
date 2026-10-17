import React, { useState, useEffect, useMemo } from "react";
import {
  Filter,
  Check,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  XCircle,
  ExternalLink,
  TrendingUp,
  PackagePlus,
  Truck,
} from "lucide-react";
import { trendingService } from "../services/trendingService.js";
import { socket } from "../services/socketService.js";
import RestockCard from "./RestockCard.jsx";
import toast from "react-hot-toast";

const normalizeStatus = (status) => {
  const s = (status || "PENDING").toUpperCase();
  if (["APPROVED", "APROBADO", "APROBADA"].includes(s)) return "APPROVED";
  if (["REJECTED", "RECHAZADO", "RECHAZADA", "DESAPROBADO"].includes(s))
    return "REJECTED";
  return "PENDING";
};

export default function TendenciaIA({ userRole, onNavigate }) {
  const [trends, setTrends] = useState([]);
  const [restocks, setRestocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");

  const [selectedIds, setSelectedIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [trendsData, restocksData] = await Promise.all([
        trendingService.getTrendProducts().catch(() => []),
        trendingService.getRestockSuggestions
          ? trendingService.getRestockSuggestions().catch(() => [])
          : Promise.resolve([]),
      ]);

      setTrends(Array.isArray(trendsData) ? trendsData : []);
      setRestocks(Array.isArray(restocksData) ? restocksData : []);
      setSelectedIds([]);
    } catch (err) {
      toast.error("Error al cargar las sugerencias.");
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Alertas del sensor en tiempo real: llega una nueva sugerencia y se refresca la bandeja
  useEffect(() => {
    socket.connect();

    const onAlert = () => {
      toast("Nueva alerta de reabastecimiento", { icon: "📦" });
      loadAllData();
    };
    socket.on("alerta-stock", onAlert);

    return () => {
      socket.off("alerta-stock", onAlert);
      socket.disconnect();
    };
  }, []);

  const counts = useMemo(() => {
    const trendCounts = trends.reduce(
      (acc, item) => {
        const st = normalizeStatus(item.status);
        acc[st] = (acc[st] || 0) + 1;
        return acc;
      },
      { PENDING: 0, APPROVED: 0, REJECTED: 0 },
    );

    return {
      ...trendCounts,
      RESTOCK: restocks.length,
    };
  }, [trends, restocks]);

  const filteredTrends = useMemo(() => {
    if (activeTab === "RESTOCK") return [];
    return trends.filter((item) => normalizeStatus(item.status) === activeTab);
  }, [trends, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedIds([]);
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTrends.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTrends.map((t) => t.id));
    }
  };

  const handleApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await trendingService.approveTrendProduct({ ids: selectedIds });
      toast.success(
        selectedIds.length === 1
          ? "1 Sugerencia Aprobada."
          : `${selectedIds.length} Sugerencias Aprobadas.`,
      );
      setTrends((prev) =>
        prev.map((t) =>
          selectedIds.includes(t.id) ? { ...t, status: "APPROVED" } : t,
        ),
      );
      setSelectedIds([]);
    } catch (e) {
      toast.error("Error al aprobar sugerencias.");
      console.error(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    try {
      await trendingService.rejectTrendProduct({ ids: selectedIds });
      toast.success(
        selectedIds.length === 1
          ? "1 Sugerencia Rechazada."
          : `${selectedIds.length} Sugerencias Rechazadas.`,
      );
      setTrends((prev) =>
        prev.map((t) =>
          selectedIds.includes(t.id) ? { ...t, status: "REJECTED" } : t,
        ),
      );
      setSelectedIds([]);
    } catch (e) {
      toast.error("Error al rechazar sugerencias.");
      console.error(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Panel de Control IA
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisión de tendencias detectadas por el chatbot y alertas de
            reabastecimiento.
          </p>
        </div>

        <button
          onClick={loadAllData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <Filter size={16} />
          <span>Actualizar Todo</span>
        </button>
      </div>

      {/* Pestañas de Filtrado */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
        <button
          onClick={() => handleTabChange("PENDING")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "PENDING"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock size={16} />
          <span>Tendencias Pendientes</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === "PENDING"
                ? "bg-white/20 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {counts.PENDING}
          </span>
        </button>

        {/* PESTAÑA: Por Reabastecer (RESTOCK_ALERT) */}
        <button
          onClick={() => handleTabChange("RESTOCK")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "RESTOCK"
              ? "bg-amber-600 text-white shadow-md"
              : "text-slate-600 hover:bg-amber-50 hover:text-amber-700"
          }`}
        >
          <PackagePlus size={16} />
          <span>Por Reabastecer</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === "RESTOCK"
                ? "bg-white/20 text-white"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {counts.RESTOCK}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("APPROVED")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "APPROVED"
              ? "bg-emerald-600 text-white shadow-md"
              : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          <CheckCircle2 size={16} />
          <span>Aprobados</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === "APPROVED"
                ? "bg-white/20 text-white"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {counts.APPROVED}
          </span>
        </button>

        <button
          onClick={() => handleTabChange("REJECTED")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "REJECTED"
              ? "bg-rose-600 text-white shadow-md"
              : "text-slate-600 hover:bg-rose-50 hover:text-rose-700"
          }`}
        >
          <XCircle size={16} />
          <span>Desaprobados</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === "REJECTED"
                ? "bg-white/20 text-white"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {counts.REJECTED}
          </span>
        </button>
      </div>

      {/* Barra de Acciones en Bloque (Solo para Tendencias PENDING) */}
      {activeTab === "PENDING" && filteredTrends.length > 0 && (
        <div className="bg-white border border-indigo-100 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all ring-1 ring-indigo-50">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={
                  selectedIds.length === filteredTrends.length &&
                  filteredTrends.length > 0
                }
                onChange={toggleSelectAll}
              />
              <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors"></div>
              <Check
                size={14}
                strokeWidth={3}
                className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
              />
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 select-none transition-colors">
              {selectedIds.length > 0
                ? `${selectedIds.length} elementos seleccionados`
                : "Seleccionar todos en esta vista"}
            </span>
          </label>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-700 text-sm font-bold rounded-lg hover:bg-rose-50 hover:border-rose-300 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <X size={16} />
                )}
                <span>{isProcessing ? "Procesando..." : "Rechazar"}</span>
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                <span>
                  {isProcessing ? "Procesando..." : "Aprobar Selección"}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contenido Principal */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <TrendingUp
            size={48}
            className="animate-pulse text-indigo-300 mb-4"
          />
          <p className="font-medium">
            Consultando sugerencias y estado del inventario...
          </p>
        </div>
      ) : activeTab === "RESTOCK" ? (
        /* =========================================================
           VISTA EXCLUSIVA DE REABASTECIMIENTO (RESTOCK_ALERT)
           ========================================================= */
        restocks.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <CheckCircle2
              size={48}
              className="text-amber-500 mb-4 opacity-80"
            />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Sin alertas de reabastecimiento
            </h3>
            <p className="text-slate-500 max-w-md mb-6">
              Todos los productos del catálogo se encuentran por encima de su
              umbral mínimo de stock.
            </p>
            <button
              onClick={loadAllData}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Actualizar Bandeja
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {restocks.map((item) => (
              <RestockCard
                key={item.orderItemId}
                item={item}
                onChanged={loadAllData}
              />
            ))}
          </div>
        )
      ) : /* =========================================================
           VISTA DE TENDENCIAS IA (Chatbot - TrendingProduct)
           ========================================================= */
      filteredTrends.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <Sparkles size={48} className="text-emerald-500 mb-4 opacity-80" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {activeTab === "PENDING"
              ? "Bandeja limpia"
              : activeTab === "APPROVED"
                ? "Aún no hay sugerencias aprobadas"
                : "No hay sugerencias desaprobadas"}
          </h3>
          <p className="text-slate-500 max-w-md mb-6">
            {activeTab === "PENDING"
              ? "Todas las tendencias han sido procesadas. El modelo continúa escaneando el mercado."
              : "Las sugerencias que proceses desde la pestaña de pendientes aparecerán aquí."}
          </p>
          <button
            onClick={loadAllData}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Actualizar Bandeja
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTrends.map((item) => {
            const itemStatus = normalizeStatus(item.status);
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (itemStatus === "PENDING") {
                    toggleSelection(item.id);
                  }
                }}
                className={`relative bg-white rounded-2xl p-6 transition-all duration-200 flex flex-col group
                    ${itemStatus === "PENDING" ? "cursor-pointer" : ""}
                    ${
                      isSelected
                        ? "border-indigo-500 ring-2 ring-indigo-500 shadow-md bg-indigo-50/30"
                        : "border border-slate-200 hover:border-slate-300 hover:shadow-lg"
                    }
                  `}
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {itemStatus === "PENDING" && (
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={isSelected}
                          readOnly
                        />
                        <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors group-hover:border-indigo-400"></div>
                        <Check
                          size={14}
                          strokeWidth={3}
                          className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                        />
                      </div>
                    )}

                    {/* Etiqueta de Tendencia IA */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[11px] font-extrabold tracking-wider rounded-full uppercase">
                      <Sparkles size={11} />
                      <span>TENDENCIA IA</span>
                    </span>

                    <a
                      href={item.urlProduct || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold tracking-wider rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <span>Ver producto</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-emerald-600 leading-none">
                      {item.trendScore ? item.trendScore : "S/N"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                      Score
                    </span>
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-lg font-bold text-slate-900 leading-tight mb-6 line-clamp-2">
                  {item.suggestedName}
                </h3>

                {/* Detalles */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-slate-100 mt-auto">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Fuente
                    </span>
                    <span
                      className="text-sm font-bold text-slate-800 truncate"
                      title={item.source}
                    >
                      {item.source || "S/F"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Cant.
                    </span>
                    <span className="text-sm font-bold text-slate-800 font-mono">
                      {item.suggestedAmount || "S/N"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Precio
                    </span>
                    <span className="text-sm font-bold text-emerald-600 font-mono">
                      {item.suggestedPrice
                        ? `S/ ${item.suggestedPrice}`
                        : "S/N"}
                    </span>
                  </div>
                </div>

                {/* Estados de Aprobación */}
                {itemStatus === "APPROVED" && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 rounded-lg py-2">
                    <CheckCircle2 size={16} />
                    <span>Aprobado</span>
                  </div>
                )}

                {itemStatus === "REJECTED" && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-rose-600 font-bold text-sm bg-rose-50 rounded-lg py-2">
                    <XCircle size={16} />
                    <span>Rechazado</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}