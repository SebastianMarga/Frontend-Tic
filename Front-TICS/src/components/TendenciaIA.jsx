import React, { useState, useEffect } from 'react';
import { Filter, Check, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { aiService } from '../services/aiService.js';
import './TendenciaIA.css';

export default function TendenciaIA({ userRole, onNavigate }) {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const data = await aiService.getTrendingProducts('PENDING');
      setTrends(data);
    } catch (err) {
      console.error('Error cargando sugerencias IA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, []);

  const handleApprove = async (item) => {
    try {
      await aiService.approveTrendingProduct(item.id);
      setTrends((prev) => prev.filter((t) => t.id !== item.id));
      setActionMessage({
        type: 'success',
        text: `¡Sugerencia "${item.title}" APROBADA! Se ha creado e indexado automáticamente en el catálogo.`
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (e) {
      alert('Error al aprobar: ' + e.message);
    }
  };

  const handleReject = async (item) => {
    try {
      await aiService.rejectTrendingProduct(item.id);
      setTrends((prev) => prev.filter((t) => t.id !== item.id));
      setActionMessage({
        type: 'info',
        text: `Sugerencia "${item.title}" descartada.`
      });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (e) {
      alert('Error al rechazar: ' + e.message);
    }
  };

  return (
    <div className="page-container" id="tendencias-ia-view">
      {/* Cabecera */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Panel de Control</h1>
          <p className="page-subtitle">
            Sugerencias de Productos en Tendencia generadas por IA.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={() => alert('Filtro por nivel de confianza y fuentes externas')}
            id="btn-filtros-ia"
          >
            <Filter size={15} />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Banner de Feedback si se aprueba/rechaza */}
      {actionMessage && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: actionMessage.type === 'success' ? '#ecfdf5' : '#f1f5f9',
            border: `1px solid ${actionMessage.type === 'success' ? '#a7f3d0' : '#cbd5e1'}`,
            borderRadius: '6px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: actionMessage.type === 'success' ? '#065f46' : '#1e293b',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Grid de Sugerencias de IA */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Consultando modelo de predicción de demanda...
        </div>
      ) : trends.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <Sparkles size={36} color="#059669" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            Todas las tendencias han sido procesadas
          </h3>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '480px', margin: '0 auto 20px' }}>
            El bot y el modelo de IA continúan escaneando señales de mercado global, reportes de escasez y fluctuaciones de demanda.
          </p>
          <button className="btn btn-secondary" onClick={loadTrends}>
            Actualizar Bandeja
          </button>
        </div>
      ) : (
        <div className="tendencias-grid">
          {trends.map((item) => (
            <div className="trend-card" key={item.id} id={`card-trend-${item.id}`}>
              <div>
                <div className="trend-card-top">
                  <span className={`trend-badge-pill ${item.confidenceClass || 'badge-blue'}`}>
                    {item.confidenceBadge || '💡 ALTA CONFIANZA'}
                  </span>
                  <div className="trend-score-box">
                    <span className="trend-score-value">{item.score}</span>
                    <span className="trend-score-label">TENDENCIA</span>
                  </div>
                </div>

                <h3 className="trend-title">{item.title}</h3>

                <div className="trend-details-grid">
                  <div className="trend-detail-item">
                    <span className="trend-detail-label">FUENTE DE DATOS</span>
                    <span className="trend-detail-value">{item.dataSource}</span>
                  </div>
                  <div className="trend-detail-item">
                    <span className="trend-detail-label">CANT. SUGERIDA</span>
                    <span className="trend-detail-value mono">{item.formattedQty}</span>
                  </div>
                </div>
              </div>

              <div className="trend-actions-row">
                <button
                  className="btn btn-approve"
                  onClick={() => handleApprove(item)}
                  id={`btn-approve-${item.id}`}
                >
                  <Check size={16} />
                  <span>Aprobar</span>
                </button>
                <button
                  className="btn btn-reject"
                  onClick={() => handleReject(item)}
                  id={`btn-reject-${item.id}`}
                >
                  <X size={16} />
                  <span>Rechazar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
