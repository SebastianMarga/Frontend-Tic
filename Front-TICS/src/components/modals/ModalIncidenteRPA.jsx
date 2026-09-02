import React, { useState } from 'react';
import { X, AlertTriangle, RefreshCw, XCircle, Terminal, Bot } from 'lucide-react';
import { rpaService } from '../../services/rpaService.js';

export default function ModalIncidenteRPA({ isOpen, onClose, order, onResolved }) {
  const [correctiveAction, setCorrectiveAction] = useState('Reintentar conexión con bypass SSL y revalidación de credenciales');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !order) return null;

  const handleRetry = async () => {
    setLoading(true);
    try {
      await rpaService.retryOrder(order.id, correctiveAction);
      alert(`✓ Bot RPA reactivado para la orden ${order.orderId}. El proceso continuará en segundo plano.`);
      onResolved();
      onClose();
    } catch (e) {
      alert('Error reintentando orden: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm(`¿Desea cancelar definitivamente la orden ${order.orderId}?`)) {
      setLoading(true);
      try {
        await rpaService.updateOrderStatus(order.id, 'CANCELLED', 'Cancelada tras fallo de bot');
        onResolved();
        onClose();
      } catch (e) {
        alert('Error cancelando orden: ' + e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg" id="modal-incidente-rpa">
        <div className="modal-header" style={{ borderBottomColor: '#fecaca', backgroundColor: '#fef2f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '6px', borderRadius: '4px' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="modal-title" style={{ color: '#991b1b' }}>
                Detalle del Incidente RPA - {order.orderId}
              </h2>
              <span style={{ fontSize: '12px', color: '#b91c1c' }}>
                Excepción capturada en la ejecución del bot de compras
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="btn-cerrar-modal-incidente">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Metadata de la orden */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}
          >
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PROVEEDOR</span>
              <div style={{ fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>{order.supplier}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>MONTO TOTAL</span>
              <div className="mono" style={{ fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>
                {order.formattedTotal}
              </div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>CÓDIGO DE ERROR</span>
              <div className="mono" style={{ color: '#dc2626', fontWeight: 700, fontSize: '13px', marginTop: '2px' }}>
                {order.errorCode || 'ERR-502-B2B-TIMEOUT'}
              </div>
            </div>
          </div>

          {/* Consola de Logs del Bot */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
              <Terminal size={14} />
              <span>LOG DE EJECUCIÓN DEL BOT RPA</span>
            </div>
            <div
              style={{
                backgroundColor: '#0b1c30',
                color: '#e2e8f0',
                padding: '14px 16px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: 1.6,
                maxHeight: '160px',
                overflowY: 'auto'
              }}
            >
              <div style={{ color: '#94a3b8' }}>[09:14:02] Iniciando tarea RPA para orden {order.orderId}...</div>
              <div style={{ color: '#94a3b8' }}>[09:14:05] Conexión establecida con endpoint del proveedor {order.supplier}.</div>
              <div style={{ color: '#94a3b8' }}>[09:14:18] Generando payload de compra: {order.quantity} unidades.</div>
              <div style={{ color: '#f87171' }}>[09:14:45] ERROR 502: Portal B2B no respondió tras 30.000ms.</div>
              <div style={{ color: '#fca5a5' }}>[09:14:46] Transacción abortada para prevenir duplicidad de cargo.</div>
              <div style={{ color: '#38bdf8' }}>[09:14:46] Estado cambiado a FAILED. Esperando intervención de operador.</div>
            </div>
          </div>

          {/* Acción Correctiva */}
          <div className="form-group">
            <label className="form-label">Acción Correctiva del Operador</label>
            <input
              type="text"
              className="form-input"
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Describa la solución aplicada antes del reintento..."
              required
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-danger-outline"
            onClick={handleCancelOrder}
            disabled={loading}
          >
            <XCircle size={14} />
            <span>Cancelar Orden</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRetry}
            disabled={loading}
            id="btn-reintentar-rpa"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Reintentando bot...' : 'Reintentar Ejecución del Bot'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
