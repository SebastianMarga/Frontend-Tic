import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { productService } from '../../services/productService.js';
import { stockService } from '../../services/stockService.js';

export default function ModalMovimiento({ isOpen, onClose, type = 'entrada', preselectedProduct, onSaved }) {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [batchNumber, setBatchNumber] = useState('');
  const [expDate, setExpDate] = useState('2026-11-30');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      productService.getProducts().then((list) => {
        setProducts(list);
        if (preselectedProduct) {
          setSelectedProductId(preselectedProduct.id || preselectedProduct.sku);
        } else if (list.length > 0) {
          setSelectedProductId(list[0].id);
        }
      });

      setBatchNumber(`L-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setQuantity(100);
      setReason(type === 'entrada' ? 'Recepción de mercancía estándar' : 'Despacho a línea de producción');
    }
  }, [isOpen, type, preselectedProduct]);

  if (!isOpen) return null;

  const isEntrada = type === 'entrada';
  const selectedProduct = products.find((p) => p.id === selectedProductId || p.sku === selectedProductId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEntrada) {
        await stockService.registerStockIn({
          productId: selectedProductId,
          quantity: Number(quantity),
          batchNumber,
          expDate,
          note: reason
        });
      } else {
        await stockService.registerStockOut({
          productId: selectedProductId,
          quantity: Number(quantity),
          reason
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      alert('Error registrando movimiento: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatedNewStock = selectedProduct
    ? isEntrada
      ? selectedProduct.currentStock + Number(quantity || 0)
      : Math.max(0, selectedProduct.currentStock - Number(quantity || 0))
    : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content" id="modal-movimiento">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isEntrada ? (
              <div style={{ background: '#d1fae5', color: '#065f46', padding: '6px', borderRadius: '4px' }}>
                <ArrowDownLeft size={16} />
              </div>
            ) : (
              <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '6px', borderRadius: '4px' }}>
                <ArrowUpRight size={16} />
              </div>
            )}
            <h2 className="modal-title">
              {isEntrada ? 'Registrar Entrada de Inventario' : 'Registrar Salida de Inventario'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="btn-cerrar-modal-movimiento">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Seleccionar Producto / SKU</label>
              <select
                className="form-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} - {p.name} (Stock: {p.currentStock} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cantidad {isEntrada ? 'a Ingresar' : 'a Despachar'}</label>
                <input
                  type="number"
                  min="1"
                  className="form-input mono"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              {isEntrada ? (
                <div className="form-group">
                  <label className="form-label">Número de Lote</label>
                  <input
                    type="text"
                    className="form-input mono"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="L-2026-XXX"
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Criterio de Despacho</label>
                  <input
                    type="text"
                    className="form-input"
                    value="FEFO Automático (Lote más próximo)"
                    disabled
                  />
                </div>
              )}
            </div>

            {isEntrada && (
              <div className="form-group">
                <label className="form-label">Fecha de Vencimiento del Lote (FEFO)</label>
                <input
                  type="date"
                  className="form-input"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Motivo u Observaciones</label>
              <input
                type="text"
                className="form-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej. Orden PO-901, Recepción de proveedor..."
                required
              />
            </div>

            {/* Vista previa de impacto en inventario */}
            {selectedProduct && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px'
                }}
              >
                <div>
                  <span style={{ color: '#64748b' }}>Stock Actual: </span>
                  <span className="mono" style={{ fontWeight: 600 }}>{selectedProduct.currentStock} uds</span>
                </div>
                <div style={{ fontSize: '16px', color: '#94a3b8' }}>➔</div>
                <div>
                  <span style={{ color: '#64748b' }}>Stock Resultante: </span>
                  <span className="mono" style={{ fontWeight: 800, color: '#0b1c30' }}>
                    {calculatedNewStock} uds
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={isEntrada ? 'btn btn-success' : 'btn btn-primary'}
              disabled={loading}
              id="btn-submit-movimiento"
            >
              {loading ? 'Procesando...' : isEntrada ? 'Confirmar Entrada' : 'Confirmar Salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
