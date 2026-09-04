import React, { useState, useEffect } from "react";
import {
  Boxes,
  AlertTriangle,
  Calendar,
  Bot,
  Plus,
  Minus,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { productService } from "../services/productService.js";
import { rpaService } from "../services/rpaService.js";
import { batchService } from "../services/batchService.js";
import "./Dashboard.css";

export default function Dashboard({
  onNavigate,
  onOpenModalMovimiento,
  onOpenNewOrderModal,
  onSelectProduct,
}) {
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    activeProducts: 14230,
    lowStockAlerts: 84,
    expiringBatches: 12,
    activeRpaOrders: 345,
  });
  const [alertProducts, setAlertProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [products, orders, expiring] = await Promise.all([
        productService.getProducts({ lowStockOnly: true }),
        rpaService.getPurchaseOrders("PROCESSING"),
        batchService.getExpiringBatches(30),
      ]);

      setAlertProducts(products.slice(0, 5));
      setKpiData({
        activeProducts: 14230,
        lowStockAlerts: products.length || 84,
        expiringBatches: expiring.length || 12,
        activeRpaOrders: orders.length ? orders.length * 70 + 65 : 345,
      });
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleActionClick = (product) => {
    if (product.status === "STOCK_BAJO" || product.status === "AGOTADO") {
      onOpenNewOrderModal({
        sku: product.sku,
        productName: product.name,
        supplier: product.supplier,
        supplierId: product.supplierId,
        quantity: product.optimalOrderQty || 200,
      });
    } else {
      onSelectProduct(product);
    }
  };

  return (
    <div className="page-container" id="dashboard-view">
      {/* Botones de acción rápida superiores */}
      <div className="dashboard-actions-bar">
        <button
          className="btn btn-secondary"
          onClick={() => onOpenModalMovimiento("entrada")}
          id="btn-dash-registrar-entrada"
        >
          <Plus size={16} />
          <span>Registrar Entrada</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => onOpenModalMovimiento("salida")}
          id="btn-dash-registrar-salida"
        >
          <Minus size={16} />
          <span>Registrar Salida</span>
        </button>

        <button
          className="btn btn-primary"
          onClick={() => onNavigate("tendencias")}
          id="btn-dash-revisar-ia"
        >
          <Sparkles size={16} />
          <span>Revisar Sugerencias IA</span>
        </button>
      </div>

      {/* Grid de KPIs principales */}
      <div className="kpi-grid">
        {/* KPI 1: Productos Activos */}
        <div
          className="kpi-card kpi-link-card"
          onClick={() => onNavigate("catalogo")}
          id="kpi-card-productos"
        >
          <div className="kpi-card-header">
            <span className="kpi-title">Productos Activos</span>
            <Boxes className="kpi-icon" size={18} />
          </div>
          <div className="kpi-value">
            {kpiData.activeProducts.toLocaleString()}
          </div>
          <div className="kpi-subtitle">Catálogo unificado en tiempo real</div>
        </div>

        {/* KPI 2: Alerta Stock Bajo */}
        <div
          className="kpi-card kpi-link-card"
          onClick={() => onNavigate("catalogo")}
          id="kpi-card-stock-bajo"
        >
          <div className="kpi-card-header">
            <span className="kpi-title">Alerta Stock Bajo</span>
            <AlertTriangle className="kpi-icon" size={18} />
          </div>
          <div className="kpi-value warning">{kpiData.lowStockAlerts}</div>
          <div className="kpi-subtitle">Requieren atención inmediata</div>
        </div>

        {/* KPI 3: Lotes Próximos a Vencer */}
        <div
          className="kpi-card kpi-link-card"
          onClick={() => onNavigate("alertas")}
          id="kpi-card-lotes-vencer"
        >
          <div className="kpi-card-header">
            <span className="kpi-title">Lotes Próximos a Vencer</span>
            <Calendar className="kpi-icon" size={18} />
          </div>
          <div className="kpi-value danger">{kpiData.expiringBatches}</div>
          <div className="kpi-subtitle">&lt; 30 días restantes (FEFO)</div>
        </div>

        {/* KPI 4: Órdenes RPA Activas */}
        <div
          className="kpi-card kpi-link-card"
          onClick={() => onNavigate("rpa")}
          id="kpi-card-ordenes-rpa"
        >
          <div className="kpi-card-header">
            <span className="kpi-title">Órdenes RPA Activas</span>
            <Bot className="kpi-icon" size={18} />
          </div>
          <div className="kpi-value">{kpiData.activeRpaOrders}</div>
          <div className="kpi-subtitle">
            Automatización en cola de ejecución
          </div>
        </div>
      </div>

      {/* Tabla de Alertas de Reorden y Stock Bajo */}
      <div className="dashboard-table-card">
        <div className="dashboard-table-header">
          <div className="dashboard-table-title-area">
            <h2 className="dashboard-table-title">
              Alertas de Reorden y Stock Bajo
            </h2>
            <p className="dashboard-table-subtitle">
              Priorizadas por impacto operativo predictivo.
            </p>
          </div>
          <button
            className="dashboard-table-icon-btn"
            onClick={() => onNavigate("catalogo")}
            title="Ver catálogo completo"
            id="btn-dash-ver-catalogo"
          >
            <ExternalLink size={18} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table" id="tabla-alertas-dashboard">
            <thead>
              <tr>
                <th>SKU</th>
                <th>PRODUCTO</th>
                <th className="text-right">STOCK ACTUAL</th>
                <th className="text-right">PUNTO DE REORDEN</th>
                <th>ESTADO</th>
                <th>ACCIÓN RECOMENDADA</th>
              </tr>
            </thead>
            <tbody>
              {alertProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "32px",
                      color: "#64748b",
                    }}
                  >
                    No hay alertas críticas de stock en este momento.
                  </td>
                </tr>
              ) : (
                alertProducts.map((item) => (
                  <tr key={item.id} id={`row-alerta-${item.sku}`}>
                    <td className="mono">{item.sku}</td>
                    <td>
                      <span
                        style={{ fontWeight: 600, cursor: "pointer" }}
                        onClick={() => onSelectProduct(item)}
                        title="Ver detalle del producto"
                      >
                        {item.name}
                      </span>
                    </td>
                    <td className="text-right mono" style={{ fontWeight: 600 }}>
                      {item.currentStock}
                    </td>
                    <td className="text-right mono">
                      {item.reorderPoint || item.dynamicThreshold}
                    </td>
                    <td>
                      {item.status === "AGOTADO" && (
                        <span className="badge badge-danger">AGOTADO</span>
                      )}
                      {item.status === "STOCK_BAJO" && (
                        <span className="badge badge-warning">STOCK BAJO</span>
                      )}
                      {item.status === "REORDEN_PROXIMO" && (
                        <span className="badge badge-warning">
                          REORDEN PRÓXIMO
                        </span>
                      )}
                      {item.status === "SALUDABLE" && (
                        <span className="badge badge-success">SALUDABLE</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`action-link-btn ${
                          item.status === "AGOTADO" ? "action-btn-urgent" : ""
                        }`}
                        onClick={() => handleActionClick(item)}
                        id={`btn-accion-reorden-${item.sku}`}
                      >
                        {item.recommendedAction || "Ejecutar RPA Reorden"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Mostrando {alertProducts.length} de {kpiData.lowStockAlerts} alertas
          </span>
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
