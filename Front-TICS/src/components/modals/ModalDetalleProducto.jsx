import React, { useState } from 'react';
import { X, Clock, ArrowDownLeft, ArrowUpRight, Sparkles, Bot, Calendar, Layers } from 'lucide-react';

export default function ModalDetalleProducto({
  isOpen,
  onClose,
  product,
  onOpenOrderModal,
  onOpenMovementModal
}) {
  const [activeTab, setActiveTab] = useState('lotes');

  if (!isOpen || !product) return null;

  const isLow = product.currentStock <= product.dynamicThreshold;
  const isOut = product.currentStock === 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg" id="modal-detalle-producto">
        <div className="modal-header">
          <div>
            <span className="mono" style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {product.sku}
            </span>
            <h2 className="modal-title" style={{ marginTop: '2px' }}>
              {product.name}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="btn-cerrar-detalle-producto">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Tarjetas de Resumen Rápido */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Stock Actual
              </span>
              <div className="mono" style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>
                {product.currentStock.toLocaleString()} {product.unit || 'uds'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Umbral IA
              </span>
              <div className="mono" style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px', color: '#0369a1' }}>
                {product.dynamicThreshold?.toLocaleString()} {product.unit || 'uds'}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Categoría
              </span>
              <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                {product.category}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Proveedor
              </span>
              <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                {product.supplier}
              </div>
            </div>
          </div>

          {/* Selector de Pestañas Internas */}
          <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'lotes' ? 'active' : ''}`}
              onClick={() => setActiveTab('lotes')}
            >
              Lotes Activos (FEFO)
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'movimientos' ? 'active' : ''}`}
              onClick={() => setActiveTab('movimientos')}
            >
              Historial de Movimientos
            </button>
          </div>

          {activeTab === 'lotes' ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>LOTE ID</th>
                    <th className="text-right">CANTIDAD</th>
                    <th>FECHA CADUCIDAD</th>
                    <th>DÍAS RESTANTES</th>
                    <th>ROTACIÓN FEFO</th>
                  </tr>
                </thead>
                <tbody>
                  {(!product.batches || product.batches.length === 0) ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No hay lotes con fecha de caducidad registrados para este SKU.
                      </td>
                    </tr>
                  ) : (
                    product.batches.map((b, i) => (
                      <tr key={b.id || i}>
                        <td className="mono" style={{ fontWeight: 600 }}>{b.batchNumber}</td>
                        <td className="text-right mono">{b.quantity?.toLocaleString()} uds</td>
                        <td className="mono">{b.expDate}</td>
                        <td>
                          <span className={`badge ${b.daysRemaining <= 15 ? 'badge-danger' : b.daysRemaining <= 30 ? 'badge-warning' : 'badge-info'}`}>
                            {b.daysRemaining} días
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: i === 0 ? '#059669' : '#64748b' }}>
                          {i === 0 ? '✓ Primer lote a despachar' : `Prioridad #${i + 1}`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>FECHA</th>
                    <th>TIPO</th>
                    <th className="text-right">CANTIDAD</th>
                    <th>OPERADOR</th>
                    <th>MOTIVO / NOTA</th>
                  </tr>
                </thead>
                <tbody>
                  {(!product.movements || product.movements.length === 0) ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        Sin movimientos recientes registrados.
                      </td>
                    </tr>
                  ) : (
                    product.movements.map((m, i) => (
                      <tr key={m.id || i}>
                        <td style={{ fontSize: '12px' }}>{m.date || m.dateTime}</td>
                        <td>
                          <span className={`badge ${m.type === 'Entrada' ? 'badge-success' : 'badge-info'}`}>
                            {m.type}
                          </span>
                        </td>
                        <td className="text-right mono" style={{ fontWeight: 600 }}>
                          {m.type === 'Salida' ? `-${m.quantity}` : `+${m.quantity}`}
                        </td>
                        <td><span className="badge badge-gray">{m.operator || 'ADMIN'}</span></td>
                        <td style={{ fontSize: '12px', color: '#475569' }}>{m.note || m.reason || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              onClose();
              onOpenMovementModal('entrada', product);
            }}
          >
            <ArrowDownLeft size={14} />
            <span>Ingresar Stock</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              onClose();
              onOpenOrderModal({
                sku: product.sku,
                productName: product.name,
                supplier: product.supplier,
                supplierId: product.supplierId,
                quantity: product.optimalOrderQty || 250
              });
            }}
          >
            <Bot size={14} />
            <span>Generar Orden RPA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
