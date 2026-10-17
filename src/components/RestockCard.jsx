import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  Check,
  X,
  Loader2,
  ExternalLink,
  Truck,
  Bot,
} from "lucide-react";
import toast from "react-hot-toast";
import { trendingService } from "../services/trendingService.js";

const formatPrice = (value) =>
  value === null || value === undefined || value === ""
    ? "—"
    : `S/ ${Number(value).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

/**
 * Alerta de reestock pendiente de aprobación.
 * Muestra las cotizaciones que trajo el RPA; el admin elige una, ajusta la cantidad
 * y aprueba (el RPA compra) o rechaza (se descarta la alerta).
 */
export default function RestockCard({ item, onChanged }) {
  const quotes = useMemo(
    () => (Array.isArray(item.quotes) ? item.quotes : []),
    [item.quotes],
  );

  const [selectedUrl, setSelectedUrl] = useState(
    () =>
      item.selectedUrl ??
      (quotes.find((q) => q.hasStock) ?? quotes[0])?.urlProduct ??
      null,
  );
  const [quantity, setQuantity] = useState(
    item.quantity > 0 ? item.quantity : (item.optimalOrderQty ?? 1),
  );
  const [busy, setBusy] = useState(false);

  const waitingQuotes = quotes.length === 0;
  const canApprove = !busy && !waitingQuotes && !!selectedUrl && quantity >= 1;

  const handleApprove = async () => {
    setBusy(true);
    try {
      await trendingService.approveRestock(item.purchaseOrderId, [
        {
          itemId: item.orderItemId,
          quantity: Number(quantity),
          selectedUrl,
        },
      ]);
      toast.success("Reestock aprobado: el RPA está realizando la compra.");
      onChanged?.();
    } catch (e) {
      toast.error(e.message || "No se pudo aprobar el reestock.");
      setBusy(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      await trendingService.rejectRestock(item.purchaseOrderId);
      toast.success("Alerta de reestock rechazada.");
      onChanged?.();
    } catch (e) {
      toast.error(e.message || "No se pudo rechazar la alerta.");
      setBusy(false);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl p-6 border border-amber-200 hover:border-amber-300 hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Cabecera */}
      <div className="flex justify-between items-start mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold tracking-wider rounded-full uppercase">
          <AlertCircle size={13} />
          <span>RESTOCK ALERT</span>
        </span>
        <span className="text-xs font-mono font-bold text-slate-400">
          SKU: {item.sku || "S/N"}
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 leading-tight mb-4 line-clamp-2">
        {item.name}
      </h3>

      {/* Stock y proveedor */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-slate-100">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Stock Actual
          </span>
          <span className="text-sm font-black text-rose-600 font-mono">
            {item.currentStock} und.
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Umbral Mín.
          </span>
          <span className="text-sm font-bold text-slate-800 font-mono">
            {item.threshold} und.
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Proveedor
          </span>
          <span
            className="text-sm font-bold text-slate-800 truncate"
            title={item.supplierName}
          >
            {item.supplierName || "S/P"}
          </span>
        </div>
      </div>

      {/* Cotizaciones del RPA */}
      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
          <Bot size={13} />
          <span>Recomendaciones del RPA</span>
        </div>

        {waitingQuotes ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-3">
            <Loader2 size={15} className="animate-spin" />
            <span>El RPA está buscando cotizaciones…</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
            {quotes.map((q) => {
              const isSelected = selectedUrl === q.urlProduct;
              return (
                <label
                  key={q.urlProduct}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={`quote-${item.orderItemId}`}
                    className="mt-1"
                    checked={isSelected}
                    onChange={() => setSelectedUrl(q.urlProduct)}
                    disabled={busy}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13px] font-semibold text-slate-900 truncate"
                      title={q.suggestedName}
                    >
                      {q.suggestedName}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-mono font-bold text-slate-800">
                        {formatPrice(q.suggestedPrice)}
                      </span>
                      <span>·</span>
                      <span>{q.source || "proveedor"}</span>
                      <span>·</span>
                      <span
                        className={
                          q.hasStock ? "text-emerald-600" : "text-rose-600"
                        }
                      >
                        {q.hasStock ? "Con stock" : "Sin stock"}
                      </span>
                    </div>
                  </div>
                  <a
                    href={q.urlProduct}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-slate-700 mt-1"
                    title="Ver en la tienda"
                  >
                    <ExternalLink size={14} />
                  </a>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Pie: orden, cantidad y acciones */}
      <div className="mt-4 pt-3 border-t border-amber-100 flex flex-col gap-3">
        <div className="flex items-center justify-between text-amber-700 font-semibold text-xs bg-amber-50/70 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Truck size={15} />
            <span>Orden Borrador #{item.purchaseOrderId}</span>
          </div>
          <label className="flex items-center gap-2 font-mono">
            Cant.
            <input
              type="number"
              min={1}
              value={quantity}
              disabled={busy}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-[72px] rounded-md border border-amber-200 bg-white px-2 py-1 text-right text-slate-900"
            />
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReject}
            disabled={busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={15} />
            <span>Rechazar</span>
          </button>
          <button
            onClick={handleApprove}
            disabled={!canApprove}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            <span>Aprobar y comprar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
