import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign,
  Download,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { batchService } from '../services/batchService.js';
import './Alertas.css';

export default function Alertas({ userRole, onOpenModalMovimiento }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(30);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await batchService.getExpiringBatches(daysFilter);
      setBatches(data);
    } catch (err) {
      console.error('Error cargando alertas de vencimiento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [daysFilter]);

  const handleDispatchFefo = (batch) => {
    onOpenModalMovimiento('salida', {
      sku: batch.sku,
      productName: batch.productName,
      batchNumber: batch.batchNumber,
      quantity: batch.quantity
    });
  };

  return (
    <div className="page-container" id="alertas-vencimiento-view">
      {/* Cabecera de Página */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Alertas de Vencimiento</h1>
          <p className="page-subtitle">
            Monitoreo predictivo de caducidades para minimizar mermas y priorizar despachos
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={() => alert('Descargando reporte de lotes críticos en formato CSV...')}
            id="btn-exportar-lotes-criticos"
          >
            <Download size={15} />
            <span>Exportar Lotes Críticos</span>
          </button>
        </div>
      </div>

      {/* Grid de KPIs de Caducidad */}
      <div className="alertas-kpi-grid">
        <div className="kpi-card" id="kpi-lotes-criticos">
          <div className="kpi-card-header">
            <span className="kpi-title">&lt; 30 Días (Crítico)</span>
            <AlertTriangle className="kpi-icon" size={18} color="#dc2626" />
          </div>
          <div className="kpi-value danger">12 Lotes</div>
          <div className="kpi-subtitle">Requieren despacho prioritario</div>
        </div>

        <div className="kpi-card" id="kpi-lotes-alerta">
          <div className="kpi-card-header">
            <span className="kpi-title">30 - 60 Días (Alerta)</span>
            <Clock className="kpi-icon" size={18} color="#d97706" />
          </div>
          <div className="kpi-value warning">28 Lotes</div>
          <div className="kpi-subtitle">En rotación estándar supervisada</div>
        </div>

        <div className="kpi-card" id="kpi-valor-riesgo">
          <div className="kpi-card-header">
            <span className="kpi-title">Valor Total en Riesgo</span>
            <DollarSign className="kpi-icon" size={18} color="#2563eb" />
          </div>
          <div className="kpi-value info">$18,450.00</div>
          <div className="kpi-subtitle">Costo de inventario perecedero activo</div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="filters-bar">
        <select
          className="select-input"
          value={daysFilter}
          onChange={(e) => setDaysFilter(Number(e.target.value))}
          id="select-filtro-dias-vencimiento"
        >
          <option value={15}>Mostrar lotes con menos de 15 días</option>
          <option value={30}>Mostrar lotes con menos de 30 días</option>
          <option value={60}>Mostrar lotes con menos de 60 días</option>
          <option value={90}>Mostrar lotes con menos de 90 días</option>
        </select>
      </div>

      {/* Tabla de Lotes FEFO */}
      <div className="card">
        <div className="table-container">
          <table className="data-table" id="tabla-lotes-fefo">
            <thead>
              <tr>
                <th>LOTE ID</th>
                <th>SKU / PRODUCTO</th>
                <th className="text-right">CANTIDAD</th>
                <th>FECHA DE VENCIMIENTO</th>
                <th>DÍAS RESTANTES</th>
                <th>ACCIÓN SUGERIDA</th>
                <th style={{ textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>
                    Calculando matrices de caducidad...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Excelente: no hay lotes próximos a vencer en el rango seleccionado.
                  </td>
                </tr>
              ) : (
                batches.map((b) => {
                  const isCritical = b.daysRemaining <= 15;
                  const isWarning = b.daysRemaining > 15 && b.daysRemaining <= 30;

                  return (
                    <tr key={b.id} id={`row-lote-${b.batchNumber}`}>
                      <td className="mono" style={{ fontWeight: 600 }}>
                        {b.batchNumber}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>{b.productName}</span>
                          <span className="mono" style={{ fontSize: '11px', color: '#64748b' }}>
                            {b.sku}
                          </span>
                        </div>
                      </td>
                      <td className="text-right mono" style={{ fontWeight: 600 }}>
                        {b.quantity.toLocaleString()} uds
                      </td>
                      <td className="mono">{b.expDate}</td>
                      <td>
                        <span
                          className={`alerta-days-pill ${
                            isCritical ? 'critical' : isWarning ? 'warning' : 'moderate'
                          }`}
                        >
                          <Clock size={12} />
                          <span>{b.daysRemaining} días restantes</span>
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: isCritical ? '#b91c1c' : '#475569' }}>
                        {isCritical ? 'Priorizar despacho inmediato' : 'Rotación FEFO prioritaria'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDispatchFefo(b)}
                          id={`btn-despachar-fefo-${b.batchNumber}`}
                        >
                          <ArrowUpRight size={13} />
                          <span>Despachar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="table-footer">
          <span>Mostrando {batches.length} lotes en riesgo</span>
          <div className="pagination">
            <button className="page-btn" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
