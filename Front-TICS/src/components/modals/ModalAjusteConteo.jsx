import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, AlertCircle } from "lucide-react";
import { productService } from "../../services/productService.js";
import { stockService } from "../../services/stockService.js";

export default function ModalAjusteConteo({ isOpen, onClose, onSaved }) {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [physicalCount, setPhysicalCount] = useState(0);
  const [reason, setReason] = useState("Ajuste por conteo físico trimestral");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      productService.getProducts().then((list) => {
        setProducts(list);
        if (list.length > 0) {
          setSelectedProductId(list[0].id);
          setPhysicalCount(list[0].currentStock);
        }
      });
    }
  }, [isOpen]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  useEffect(() => {
    if (selectedProduct) {
      setPhysicalCount(selectedProduct.currentStock);
    }
  }, [selectedProductId]);

  if (!isOpen) return null;

  const currentSystemStock = selectedProduct ? selectedProduct.currentStock : 0;
  const difference = Number(physicalCount || 0) - currentSystemStock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await stockService.registerAdjustment({
        productId: selectedProductId,
        newPhysicalStock: Number(physicalCount),
        reason,
      });
      onSaved();
      onClose();
    } catch (err) {
      alert("Error en ajuste de inventario: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" id="modal-ajuste-conteo">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <SlidersHorizontal size={18} />
            <h2 className="modal-title">
              Ajuste / Conteo Físico de Inventario
            </h2>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            id="btn-cerrar-modal-ajuste"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Producto a Auditar</label>
              <select
                className="form-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stock en Sistema (Teórico)</label>
                <input
                  type="text"
                  className="form-input mono"
                  value={`${currentSystemStock} uds`}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Conteo Físico Real (Auditado)
                </label>
                <input
                  type="number"
                  min="0"
                  className="form-input mono"
                  value={physicalCount}
                  onChange={(e) => setPhysicalCount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Discrepancia calculada */}
            <div
              style={{
                backgroundColor:
                  difference === 0
                    ? "#f8fafc"
                    : difference > 0
                      ? "#ecfdf5"
                      : "#fef2f2",
                border: `1px solid ${difference === 0 ? "#e2e8f0" : difference > 0 ? "#a7f3d0" : "#fecaca"}`,
                padding: "12px 16px",
                borderRadius: "6px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600 }}>
                Diferencia de Inventario:
              </span>
              <span
                className="mono"
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color:
                    difference === 0
                      ? "#64748b"
                      : difference > 0
                        ? "#059669"
                        : "#dc2626",
                }}
              >
                {difference > 0 ? `+${difference}` : difference} uds
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Justificación del Ajuste</label>
              <textarea
                className="form-textarea"
                rows="2"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Motivo de la merma, rotura o sobrante..."
                required
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="btn-submit-ajuste"
            >
              {loading ? "Aplicando ajuste..." : "Confirmar Ajuste Físico"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
