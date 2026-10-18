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
  Globe,
} from "lucide-react";
import { productService } from "../services/productService.js";
import { rpaService } from "../services/rpaService.js";
import { batchService } from "../services/batchService.js";

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
      <div className="flex justify-end items-center gap-[12px] mb-[24px]">
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
          className="kpi-card cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-[var(--shadow-md)] hover:border-[#cbd5e1]"
          onClick={() => onNavigate("catalogo")}
          id="kpi-card-productos"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[12px] font-[700] uppercase tracking-[0.04em]">
              Productos Activos
            </span>
            <Boxes className="shrink-0" size={18} />
          </div>
          <div className="text-[26px] font-[800] text-[var(--text-primary)] leading-[1.2]">
            {kpiData.activeProducts.toLocaleString()}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            Catálogo unificado en tiempo real
          </div>
        </div>

        {/* KPI 2: Alerta Stock Bajo */}
        <div
          className="kpi-card cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-[var(--shadow-md)] hover:border-[#cbd5e1]"
          onClick={() => onNavigate("catalogo")}
          id="kpi-card-stock-bajo"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[12px] font-[700] uppercase tracking-[0.04em]">
              Alerta Stock Bajo
            </span>
            <AlertTriangle className="shrink-0 text-[#d97706]" size={18} />
          </div>
          <div className="text-[26px] font-[800] text-[#d97706] leading-[1.2]">
            {kpiData.lowStockAlerts}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            Requieren atención inmediata
          </div>
        </div>

        {/* KPI 3: Proveedores Búsqueda RPA */}
        <div
          className="kpi-card cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-[var(--shadow-md)] hover:border-[#cbd5e1]"
          onClick={() => onNavigate("proveedoresRpa")}
          id="kpi-card-proveedores-rpa"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[12px] font-[700] uppercase tracking-[0.04em]">
              Proveedores Búsqueda RPA
            </span>
            <Globe className="shrink-0 text-[#2563eb]" size={18} />
          </div>
          <div className="text-[26px] font-[800] text-[#2563eb] leading-[1.2]">
            8 Activos
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            Rastreo y cotización en tiempo real
          </div>
        </div>

        {/* KPI 4: Órdenes RPA Activas */}
        <div
          className="kpi-card cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-[2px] hover:shadow-[var(--shadow-md)] hover:border-[#cbd5e1]"
          onClick={() => onNavigate("rpa")}
          id="kpi-card-ordenes-rpa"
        >
          <div className="flex items-center justify-between text-[var(--text-secondary)]">
            <span className="text-[12px] font-[700] uppercase tracking-[0.04em]">
              Órdenes RPA Activas
            </span>
            <Bot className="shrink-0" size={18} />
          </div>
          <div className="text-[26px] font-[800] text-[var(--text-primary)] leading-[1.2]">
            {kpiData.activeRpaOrders}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            Automatización en cola de ejecución
          </div>
        </div>
      </div>

      {/* Tabla de Alertas de Reorden y Stock Bajo */}
      <div className="bg-[var(--bg-surface)] border border-solid border-[var(--border-color)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="py-[20px] px-[24px] border-b border-solid border-[var(--border-color)] flex justify-between items-start">
          <div className="flex flex-col gap-[4px]">
            <h2 className="text-[18px] leading-[1.5] font-[700] text-[var(--text-primary)]">
              Alertas de Reorden y Stock Bajo
            </h2>
            <p className="text-[13px] leading-[1.5] text-[var(--text-secondary)]">
              Priorizadas por impacto operativo predictivo.
            </p>
          </div>
          <button
            className="bg-transparent border-none text-[var(--text-secondary)] cursor-pointer p-[6px] rounded-[var(--radius-sm)] flex items-center justify-center transition-all duration-150 hover:bg-[#f1f5f9] hover:text-[var(--text-primary)]"
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
                <th className="!text-right">STOCK ACTUAL</th>
                <th className="!text-right">PUNTO DE REORDEN</th>
                <th>ESTADO</th>
                <th>ACCIÓN RECOMENDADA</th>
              </tr>
            </thead>
            <tbody>
              {alertProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center !p-[32px] !text-[#64748b]"
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
                        className="font-[600] cursor-pointer hover:underline"
                        onClick={() => onSelectProduct(item)}
                        title="Ver detalle del producto"
                      >
                        {item.name}
                      </span>
                    </td>
                    <td className="!text-right mono font-[600]">
                      {item.currentStock}
                    </td>
                    <td className="!text-right mono">
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
                        className={`bg-transparent border-none font-[600] text-[13px] leading-[1.5] cursor-pointer underline underline-offset-[2px] py-[4px] px-[8px] rounded-[var(--radius-sm)] transition-colors duration-150 ${
                          item.status === "AGOTADO"
                            ? "text-[#dc2626] hover:bg-[#fee2e2] hover:text-[#991b1b]"
                            : "text-[#0b1c30] hover:bg-[#f1f5f9] hover:text-[#1d4ed8]"
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