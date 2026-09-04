import React, { useState, useEffect } from "react";
import {
  Download,
  Plus,
  Minus,
  SlidersHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { stockService } from "../services/stockService.js";
import "./Movimientos.css";

export default function Movimientos({
  userRole,
  onOpenModalMovimiento,
  onOpenModalAjuste,
}) {
  const [movements, setMovements] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await stockService.getMovements({
        search,
        type: typeFilter,
      });
      setMovements(data);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [search, typeFilter]);

  const handleExportForIa = async () => {
    try {
      const res = await stockService.exportMovementsForIa();
      alert(
        `✓ Exportación generada con éxito:\n- Registros: ${res.exportedRecords}\n- Formato: ${res.format}\n- Timestamp: ${res.timestamp}\n\nLos datos históricos están listos para alimentar el algoritmo predictivo de IA.`,
      );
    } catch (e) {
      alert("Error en exportación: " + e.message);
    }
  };

  return (
    <div className="page-container" id="movimientos-view">
      {/* Cabecera de Página */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Movimientos de Inventario</h1>
          <p className="page-subtitle">
            Auditoría y registro en tiempo real de entradas, salidas y ajustes.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={handleExportForIa}
            id="btn-exportar-ia-movimientos"
          >
            <Download size={15} />
            <span>Exportar para IA</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => onOpenModalMovimiento("entrada")}
            id="btn-mov-registrar-entrada"
          >
            <Plus size={15} />
            <span>REGISTRAR ENTRADA</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => onOpenModalMovimiento("salida")}
            id="btn-mov-registrar-salida"
          >
            <Minus size={15} />
            <span>REGISTRAR SALIDA</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onOpenModalAjuste}
            id="btn-mov-ajuste-conteo"
          >
            <SlidersHorizontal size={15} />
            <span>AJUSTE / CONTEO</span>
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
            placeholder="Buscar por SKU, Lote, Producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-buscar-movimientos"
          />
        </div>

        <select
          className="select-input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          id="select-filtro-tipo-movimiento"
        >
          <option value="Todos">Tipo: Todos los tipos</option>
          <option value="Entrada">Entrada (+)</option>
          <option value="Salida">Salida (-)</option>
          <option value="Ajuste">Ajuste (Audit)</option>
        </select>

        <select className="select-input" defaultValue="30d">
          <option value="30d">Fecha: Últimos 30 días</option>
          <option value="7d">Últimos 7 días</option>
          <option value="today">Hoy</option>
        </select>
      </div>

      {/* Tabla de Movimientos */}
      <div className="card">
        <div className="table-container">
          <table className="data-table" id="tabla-movimientos-kardex">
            <thead>
              <tr>
                <th>FECHA/HORA</th>
                <th>TIPO</th>
                <th>PRODUCTO / SKU</th>
                <th className="text-right">CANTIDAD</th>
                <th>LOTE</th>
                <th>OPERADOR</th>
                <th>MOTIVO</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "32px" }}
                  >
                    Cargando movimientos...
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "32px",
                      color: "#64748b",
                    }}
                  >
                    No se encontraron movimientos registrados.
                  </td>
                </tr>
              ) : (
                movements.map((mov) => {
                  const isEntrada = mov.type.toLowerCase() === "entrada";
                  const isSalida = mov.type.toLowerCase() === "salida";
                  const isAjuste = mov.type.toLowerCase() === "ajuste";

                  return (
                    <tr key={mov.id} id={`row-mov-${mov.id}`}>
                      <td style={{ fontSize: "12px", color: "#64748b" }}>
                        {mov.dateTime}
                      </td>
                      <td>
                        <span
                          className={`mov-type-badge ${
                            isEntrada
                              ? "entrada"
                              : isSalida
                                ? "salida"
                                : "ajuste"
                          }`}
                        >
                          {isEntrada ? (
                            <ArrowDownLeft size={12} />
                          ) : isSalida ? (
                            <ArrowUpRight size={12} />
                          ) : (
                            <RefreshCw size={12} />
                          )}
                          <span>{mov.type}</span>
                        </span>
                      </td>
                      <td>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span style={{ fontWeight: 600 }}>
                            {mov.productName}
                          </span>
                          <span
                            className="mono"
                            style={{ fontSize: "11px", color: "#64748b" }}
                          >
                            {mov.sku}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`text-right mono ${
                          isEntrada
                            ? "qty-positive"
                            : isSalida
                              ? "qty-negative"
                              : "qty-neutral"
                        }`}
                      >
                        {mov.formattedQty}
                      </td>
                      <td className="mono" style={{ fontSize: "12px" }}>
                        {mov.batchNumber}
                      </td>
                      <td>
                        <span className="badge badge-gray">{mov.operator}</span>
                      </td>
                      <td style={{ color: "#475569", fontSize: "13px" }}>
                        {mov.reason}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer de Paginación */}
        <div className="table-footer">
          <span>
            Mostrando 1-
            {movements.length} de {movements.length} movimientos
          </span>
          <div className="pagination">
            <button className="page-btn" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
