import React, { useState, useEffect } from 'react';
import { X, Bot, Sparkles, Send } from 'lucide-react';
import { supplierService } from '../../services/supplierService.js';
import { productService } from '../../services/productService.js';
import { rpaService } from '../../services/rpaService.js';

export default function ModalNuevaOrdenRPA({ isOpen, onClose, initialData, onCreated }) {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(250);
  const [priority, setPriority] = useState('NORMAL');
  const [channel, setChannel] = useState('B2B_BOT');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([supplierService.getSuppliers(), productService.getProducts()]).then(
        ([sups, prods]) => {
          setSuppliers(sups);
          setProducts(prods);

          if (initialData?.supplierId) {
            setSelectedSupplierId(initialData.supplierId);
          } else if (sups.length > 0) {
            setSelectedSupplierId(sups[0].id);
          }

          if (initialData?.sku) {
            const found = prods.find((p) => p.sku === initialData.sku);
            if (found) setSelectedProductId(found.id);
          } else if (prods.length > 0) {
            setSelectedProductId(prods[0].id);
          }

          if (initialData?.quantity) {
            setQuantity(initialData.quantity);
          }
        }
      );
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId);
  const currentSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  // Estimado $35 por unidad promedio si no hay precio
  const estimatedPrice = 36.5;
  const estimatedTotal = Number(quantity || 0) * estimatedPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await rpaService.createPurchaseOrder({
        supplier: currentSupplier ? currentSupplier.name : 'Global Logistics Corp',
        supplierId: selectedSupplierId,
        productName: currentProduct ? currentProduct.name : 'Insumo Electrónico',
        sku: currentProduct ? currentProduct.sku : 'SKU-GEN',
        quantity: Number(quantity),
        totalValue: estimatedTotal,
        priority,
        channel
      });

      onCreated();
      onClose();
    } catch (err) {
      alert('Error creando orden RPA: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg" id="modal-nueva-orden-rpa">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#0b1c30', color: '#ffffff', padding: '6px', borderRadius: '4px' }}>
              <Bot size={16} />
            </div>
            <h2 className="modal-title">Generar Orden de Compra RPA</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="btn-cerrar-nueva-orden">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Proveedor de Destino</label>
                <select
                  className="form-select"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  required
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Producto / Insumo</label>
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cantidad a Reordenar</label>
                <input
                  type="number"
                  min="1"
                  className="form-input mono"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Canal de Automatización</label>
                <select
                  className="form-select"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option value="B2B_BOT">Portal Web B2B (Bot Headless)</option>
                  <option value="API_DIRECT">Conexión Directa API / EDI</option>
                  <option value="EMAIL_RPA">Email Automatizado RPA</option>
                </select>
              </div>
            </div>

            {/* Cuadro de resumen económico */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                margin: '12px 0 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>VALOR ESTIMADO DE COMPRA</span>
                <div className="mono" style={{ fontSize: '22px', fontWeight: 800, color: '#0b1c30' }}>
                  ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-info">Zero-Touch Dispatch</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="btn-lanzar-bot-rpa">
              <Send size={14} />
              <span>{loading ? 'Iniciando bot...' : 'Lanzar Bot de Compra RPA'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
