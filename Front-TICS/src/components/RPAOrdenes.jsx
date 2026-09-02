import React, { useState, useEffect } from 'react';
import {
  Search,
  Bot,
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  XCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { rpaService } from '../services/rpaService.js';
import './RPAOrdenes.css';

export default function RPAOrdenes({
  userRole,
  onOpenNewOrderModal,
  onOpenIncidentModal,
  onOpenOrderDetails
}) {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await rpaService.getPurchaseOrders(statusFilter);
      setOrders(data);
    } catch (err) {
      console.error('Error cargando órdenes RPA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase().trim();
    return (
      o.orderId.toLowerCase().includes(q) ||
      o.supplier.toLowerCase().includes(q)
    );
  });

  const handleCancelOrder = async (orderId) => {
    if (window.confirm(`¿Está seguro de cancelar la orden RPA ${orderId}?`)) {
      try {
        await rpaService.updateOrderStatus(orderId, 'CANCELLED', 'Cancelada por el operador');
        loadOrders();
      } catch (e) {
        alert('Error al cancelar: ' + e.message);
      }
    }
  };

  return (
    <div className="page-container" id="rpa-ordenes-view">
      {/* Cabecera de Página */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Supervisión de Órdenes RPA</h1>
          <p className="page-subtitle">
            Gestión de excepciones y ejecución automatizada de compras
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-primary"
            onClick={onOpenNewOrderModal}
            id="btn-nueva-orden-rpa"
          >
            <Plus size={16} />
            <span>Nueva Orden RPA</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por Orden, Proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-buscar-rpa"
          />
        </div>

        <select
          className="select-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          id="select-filtro-estado-rpa"
        >
          <option value="ALL">Estado: Todas</option>
          <option value="SENT">SENT (Enviada)</option>
          <option value="PROCESSING">PROCESSING (En Ejecución)</option>
          <option value="FAILED">FAILED (Fallida / Excepción)</option>
          <option value="COMPLETED">COMPLETED (Completada)</option>
        </select>

        <select className="select-input" defaultValue="30d">
          <option value="30d">Rango de Fechas: Últimos 30 días</option>
          <option value="7d">Últimos 7 días</option>
          <option value="today">Hoy</option>
        </select>
      </div>

      {/* Tabla de Órdenes RPA */}
      <div className="card">
        <div className="table-container">
          <table className="data-table" id="tabla-supervision-rpa">
            <thead>
              <tr>
                <th>ID ORDEN</th>
                <th>PROVEEDOR</th>
                <th>FECHA / HORA</th>
                <th className="text-right">CANTIDAD</th>
                <th className="text-right">VALOR TOTAL</th>
                <th>ESTADO</th>
                <th style={{ textAlign: 'right' }}>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                    Cargando órdenes del bot RPA...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No se encontraron órdenes con los criterios especificados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} id={`row-rpa-${order.orderId}`}>
                    <td className="mono" style={{ fontWeight: 600 }}>
                      {order.orderId}
                    </td>
                    <td style={{ fontWeight: 500 }}>{order.supplier}</td>
                    <td style={{ color: '#64748b', fontSize: '12px' }}>{order.dateTime}</td>
                    <td className="text-right mono">{order.quantity?.toLocaleString()} uds</td>
                    <td className="text-right mono" style={{ fontWeight: 600 }}>
                      {order.formattedTotal || `$${order.totalValue?.toLocaleString()}`}
                    </td>
                    <td>
                      {order.status === 'SENT' && (
                        <span className="rpa-status-badge sent">SENT</span>
                      )}
                      {order.status === 'PROCESSING' && (
                        <span className="rpa-status-badge processing">PROCESSING</span>
                      )}
                      {order.status === 'FAILED' && (
                        <span className="rpa-status-badge failed">FAILED</span>
                      )}
                      {order.status === 'COMPLETED' && (
                        <span className="rpa-status-badge completed">COMPLETED</span>
                      )}
                      {order.status === 'CANCELLED' && (
                        <span className="badge badge-gray">CANCELLED</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {order.status === 'FAILED' ? (
                        <button
                          className="action-btn-review-error"
                          onClick={() => onOpenIncidentModal(order)}
                          id={`btn-revisar-error-${order.orderId}`}
                        >
                          <AlertTriangle size={14} />
                          <span>Revisar Error</span>
                        </button>
                      ) : order.status === 'PROCESSING' ? (
                        <button
                          className="action-link-btn action-btn-urgent"
                          onClick={() => handleCancelOrder(order.id)}
                          id={`btn-cancelar-orden-${order.orderId}`}
                        >
                          Cancelar
                        </button>
                      ) : (
                        <button
                          className="action-link-btn"
                          onClick={() => {
                            alert(
                              `Detalle Orden ${order.orderId}\nProveedor: ${order.supplier}\nTotal: ${order.formattedTotal}\nItems: ${order.items?.length || 1} producto(s)`
                            );
                          }}
                          id={`btn-detalles-orden-${order.orderId}`}
                        >
                          Detalles
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de Paginación */}
        <div className="table-footer">
          <span>
            Mostrando 1 a {filteredOrders.length} de {orders.length} órdenes
          </span>
          <div className="pagination">
            <button className="page-btn" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
