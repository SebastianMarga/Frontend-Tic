import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { productService } from "../services/productService.js";
import { categoryService } from "../services/categoryService.js";
import { supplierService } from "../services/supplierService.js";

export default function Catalogo({
  userRole,
  onOpenCreateProduct,
  onOpenEditProduct,
  onOpenProductDetail,
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedSupplier, setSelectedSupplier] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodList, catList, supList] = await Promise.all([
        productService.getProducts({
          search,
          category: selectedCategory,
          supplier: selectedSupplier,
        }),
        categoryService.getCategories(),
        supplierService.getSuppliers(),
      ]);
      setProducts(prodList);
      setCategories(catList);
      setSuppliers(supList);
    } catch (error) {
      console.error("Error cargando catálogo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, selectedSupplier]);

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="page-container" id="catalogo-view">
      {/* Cabecera de Página */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Catálogo de Productos</h1>
          <p className="page-subtitle">
            Gestión integral de inventario y parámetros de reabastecimiento
          </p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar SKU / Producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-buscar-catalogo"
          />
        </div>

        <select
          className="select-input"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          id="select-filtro-categoria"
        >
          <option value="Todas">Categoría (Todas)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="select-input"
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          id="select-filtro-proveedor"
        >
          <option value="Todos">Proveedor (Todos)</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        {isAdmin && (
          <button
            className="btn btn-primary ml-auto"
            onClick={onOpenCreateProduct}
            id="btn-nuevo-producto"
          >
            <Plus size={16} />
            <span>Nuevo Producto</span>
          </button>
        )}
      </div>

      {/* Tabla de Productos */}
      <div className="card">
        <div className="table-container">
          <table className="data-table" id="tabla-catalogo-productos">
            <thead>
              <tr>
                <th>SKU</th>
                <th>NOMBRE DEL PRODUCTO</th>
                <th>CATEGORÍA</th>
                <th>PROVEEDOR</th>
                <th className="text-right">STOCK ACTUAL</th>
                <th className="text-right">UMBRAL DINÁMICO IA</th>
                <th className="!text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center !p-[32px]">
                    Cargando catálogo...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center !p-[32px] !text-[#64748b]"
                  >
                    No se encontraron productos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                products.map((item) => {
                  const isLow = item.currentStock <= item.dynamicThreshold;
                  const isOut = item.currentStock === 0;

                  return (
                    <tr key={item.id} id={`row-producto-${item.sku}`}>
                      <td className="mono font-[600]">{item.sku}</td>
                      <td>
                        <span
                          className="font-[600] cursor-pointer text-[var(--text-primary)] hover:underline"
                          onClick={() => onOpenProductDetail(item)}
                          title="Haga clic para ver lotes FEFO e historial"
                        >
                          {item.name}
                        </span>
                      </td>
                      <td>{item.category}</td>
                      <td className="!text-[var(--text-secondary)]">
                        {item.supplier}
                      </td>
                      <td>
                        <div className="flex flex-col items-end gap-[2px]">
                          <div className="flex items-center gap-[6px] font-[700]">
                            <span className="mono">
                              {item.currentStock.toLocaleString()}{" "}
                              {item.unit || "uds"}
                            </span>
                            {isOut ? (
                              <AlertCircle size={14} color="#dc2626" />
                            ) : isLow ? (
                              <AlertTriangle size={14} color="#d97706" />
                            ) : (
                              <CheckCircle size={14} color="#059669" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] leading-[1.5] font-[700] tracking-[0.04em] px-[6px] py-[1px] rounded-[4px] uppercase ${
                              isOut
                                ? "text-[#b91c1c] bg-[#fee2e2]"
                                : isLow
                                  ? "text-[#b45309] bg-[#fef3c7]"
                                  : "text-[#047857] bg-[#d1fae5]"
                            }`}
                          >
                            {item.statusLabel ||
                              (isOut
                                ? "AGOTADO"
                                : isLow
                                  ? "STOCK BAJO"
                                  : "SALUDABLE")}
                          </span>
                        </div>
                      </td>
                      <td className="text-right mono font-[500]">
                        {item.dynamicThreshold?.toLocaleString() || 100}{" "}
                        {item.unit || "uds"}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-[6px]">
                          <button
                            className="bg-transparent border border-solid border-slate-200 px-[8px] py-[4px] rounded-[var(--radius-sm)] cursor-pointer text-slate-600 text-[12px] flex items-center gap-[4px] transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400"
                            onClick={() => onOpenProductDetail(item)}
                            title="Ver detalles e historial"
                            id={`btn-detalle-${item.sku}`}
                          >
                            <Eye size={14} />
                            <span>Detalle</span>
                          </button>
                          {isAdmin && (
                            <button
                              className="bg-transparent border border-solid border-slate-200 px-[8px] py-[4px] rounded-[var(--radius-sm)] cursor-pointer text-slate-600 text-[12px] flex items-center gap-[4px] transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400"
                              onClick={() => onOpenEditProduct(item)}
                              title="Editar producto y umbrales"
                              id={`btn-editar-${item.sku}`}
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                        </div>
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
            Mostrando 1 a {products.length} de {products.length} productos
          </span>
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              Ant.
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">Sig.</button>
          </div>
        </div>
      </div>
    </div>
  );
}