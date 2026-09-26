import React, { useState, useEffect, useMemo } from "react";
import {
  Filter,
  Check,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { trendingService } from "../services/trendingService.js";
import "./TendenciaIA.css";
import toast from "react-hot-toast";

// Normaliza el estado por si el backend lo envía en inglés o español
const normalizeStatus = (status) => {
  const s = (status || "PENDING").toUpperCase();
  if (["APPROVED", "APROBADO", "APROBADA"].includes(s)) return "APPROVED";
  if (["REJECTED", "RECHAZADO", "RECHAZADA", "DESAPROBADO"].includes(s)) return "REJECTED";
  return "PENDING";
};

export default function TendenciaIA({ userRole, onNavigate }) {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); // 'PENDING' | 'APPROVED' | 'REJECTED'
  const [actionMessage, setActionMessage] = useState(null);

  const loadTrends = async () => {
    try {
      setLoading(true);
      const data = await trendingService.getTrendProducts();
      setTrends(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error al cargar las sugerencias IA.");
      console.error("Error cargando sugerencias IA:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, []);

  // Contadores para cada pestaña
  const counts = useMemo(() => {
    return trends.reduce(
      (acc, item) => {
        const st = normalizeStatus(item.status);
        acc[st] = (acc[st] || 0) + 1;
        return acc;
      },
      { PENDING: 0, APPROVED: 0, REJECTED: 0 }
    );
  }, [trends]);

  // Lista filtrada según la pestaña activa
  const filteredTrends = useMemo(() => {
    return trends.filter((item) => normalizeStatus(item.status) === activeTab);
  }, [trends, activeTab]);

  const handleApprove = async (item) => {
    try {
      await trendingService.approveTrendProduct(item.id);
      toast.success("Sugerencia aprobada correctamente.");
      // Actualizamos el estado local para mover la tarjeta a "Aprobados" sin recargar toda la vista
      setTrends((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, status: "APPROVED" } : t))
      );
    } catch (e) {
      toast.error("Error al aprobar sugerencia.");
      console.error("Error al aprobar: " + e.message);
    }
  };

  const handleReject = async (item) => {
    try {
      await trendingService.rejectTrendProducto(item.id);
      toast.success("Sugerencia desaprobada correctamente.");
      // Actualizamos el estado local para mover la tarjeta a "Desaprobados"
      setTrends((prev) =>
        prev.map((t) => (t.id === item.id ? { ...t, status: "REJECTED" } : t))
      );
    } catch (e) {
      toast.error("Error al rechazar sugerencia.");
      console.error("Error al rechazar: " + e.message);
    }
  };

  return (
    <div className="page-container" id="tendencias-ia-view">
      {/* Cabecera */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Panel de Control</h1>
          <p className="page-subtitle">
            Sugerencias de Productos en Tendencia por IA.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={() =>
              alert("Filtro por nivel de confianza y fuentes externas")
            }
            id="btn-filtros-ia"
          >
            <Filter size={15} />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Pestañas de Filtrado por Estado */}
      <div className="trends-tabs-bar">
        <button
          type="button"
          className={`trend-tab-btn ${activeTab === "PENDING" ? "active" : ""}`}
          onClick={() => setActiveTab("PENDING")}
        >
          <Clock size={15} />
          <span>Pendientes</span>
          <span className="trend-tab-badge">{counts.PENDING}</span>
        </button>

        <button
          type="button"
          className={`trend-tab-btn ${activeTab === "APPROVED" ? "active" : ""}`}
          onClick={() => setActiveTab("APPROVED")}
        >
          <CheckCircle2 size={15} />
          <span>Aprobados</span>
          <span className="trend-tab-badge badge-green">{counts.APPROVED}</span>
        </button>

        <button
          type="button"
          className={`trend-tab-btn ${activeTab === "REJECTED" ? "active" : ""}`}
          onClick={() => setActiveTab("REJECTED")}
        >
          <XCircle size={15} />
          <span>Desaprobados</span>
          <span className="trend-tab-badge badge-red">{counts.REJECTED}</span>
        </button>
      </div>

      {/* Banner de Feedback si se aprueba/rechaza */}
      {actionMessage && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor:
              actionMessage.type === "success" ? "#ecfdf5" : "#f1f5f9",
            border: `1px solid ${actionMessage.type === "success" ? "#a7f3d0" : "#cbd5e1"}`,
            borderRadius: "6px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: actionMessage.type === "success" ? "#065f46" : "#1e293b",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Grid de Sugerencias de IA */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
          Consultando modelo de predicción de demanda...
        </div>
      ) : filteredTrends.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center", marginTop: "16px" }}>
          <Sparkles
            size={36}
            color="#059669"
            style={{ margin: "0 auto 16px" }}
          />
          <h3
            style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}
          >
            {activeTab === "PENDING"
              ? "Todas las tendencias pendientes han sido procesadas"
              : activeTab === "APPROVED"
                ? "Aún no hay sugerencias aprobadas"
                : "No hay sugerencias desaprobadas"}
          </h3>
          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
              maxWidth: "480px",
              margin: "0 auto 20px",
            }}
          >
            {activeTab === "PENDING"
              ? "El bot y el modelo de IA continúan escaneando señales de mercado global, reportes de escasez y fluctuaciones de demanda."
              : "Las sugerencias que proceses desde la pestaña de pendientes aparecerán en este historial."}
          </p>
          <button className="btn btn-secondary" onClick={loadTrends}>
            Actualizar Bandeja
          </button>
        </div>
      ) : (
        <div className="tendencias-grid">
          {filteredTrends.map((item) => {
            const itemStatus = normalizeStatus(item.status);

            return (
              <div
                className="trend-card"
                key={item.id}
                id={`card-trend-${item.id}`}
              >
                <div>
                  <div className="trend-card-top">
                    <a
                      href={item.urlProduct || "https://www.infotec.com.pe/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="trend-badge-pill badge-blue"
                    >
                      Ver producto
                    </a>
                    <div className="trend-score-box">
                      <span className="trend-score-value">
                        {item.trendScore ? item.trendScore : "S/N"}
                      </span>
                      <span className="trend-score-label">
                        {item.trendScore ? "TENDENCIA" : ""}
                      </span>
                    </div>
                  </div>

                  <h3 className="trend-title">{item.suggestedName}</h3>

                  <div className="trend-details-grid">
                    <div className="trend-detail-item">
                      <span className="trend-detail-label">FUENTE DE DATOS</span>
                      <span className="trend-detail-value">
                        {item.source ? item.source : "S/F"}
                      </span>
                    </div>
                    <div className="trend-detail-item">
                      <span className="trend-detail-label">CANT. SUGERIDA</span>
                      <span className="trend-detail-value mono">
                        {item.suggestedAmount ? item.suggestedAmount : "S/N"}
                      </span>
                    </div>
                    <div className="trend-detail-item">
                      <span className="trend-detail-label">PRECIO SUGERIDO</span>
                      <span className="trend-detail-value mono">
                        {item.suggestedPrice
                          ? `S/ ${item.suggestedPrice}`
                          : "S/N"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones solo para PENDIENTES; etiqueta fija para el resto */}
                {itemStatus === "PENDING" ? (
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
                ) : itemStatus === "APPROVED" ? (
                  <div className="trend-status-footer status-approved">
                    <CheckCircle2 size={16} />
                    <span>Sugerencia Aprobada</span>
                  </div>
                ) : (
                  <div className="trend-status-footer status-rejected">
                    <XCircle size={16} />
                    <span>Sugerencia Desaprobada</span>
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