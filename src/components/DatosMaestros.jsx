import React, { useState, useEffect } from "react";
import {
  Download,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { supplierService } from "../services/supplierService.js";
import { categoryService } from "../services/categoryService.js";

export default function DatosMaestros({
  userRole,
  onOpenCreateSupplier,
  onOpenEditSupplier,
  onOpenCreateCategory,
  onOpenEditCategory,
}) {
  const [activeTab, setActiveTab] = useState("proveedores");
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [supList, catList] = await Promise.all([
        supplierService.getSuppliers(),
        categoryService.getCategories(),
      ]);
      setSuppliers(supList);
      setCategories(catList);
    } catch (err) {
      console.error("Error cargando datos maestros:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isAdmin = userRole === "ADMIN";

  // Filtrado de proveedores
  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase().trim();
    return (
      s.id.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  // Filtrado de categorías
  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase().trim();
    return (
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  const handleDeleteSupplier = async (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este proveedor?")) {
      try {
        await supplierService.deleteSupplier(id);
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
      } catch (e) {
        alert(e.message || "No se pudo eliminar el proveedor");
      }
    }
  };

  return (
    <div className="page-container" id="datos-maestros-view">
      {/* Cabecera de Página */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Datos Maestros</h1>
          <p className="page-subtitle">
            Gestión centralizada de entidades clave del sistema.
          </p>
        </div>

        <div className="page-actions">
          <button
            className="btn btn-secondary"
            onClick={() =>
              alert("Exportando datos maestros a formato CSV / Excel...")
            }
            id="btn-exportar-maestros"
          >
            <Download size={15} />
            <span>EXPORTAR</span>
          </button>

          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => {
                if (activeTab === "proveedores") onOpenCreateSupplier();
                else onOpenCreateCategory();
              }}
              id="btn-nuevo-maestro"
            >
              <Plus size={15} />
              <span>
                {activeTab === "proveedores"
                  ? "NUEVO PROVEEDOR"
                  : "NUEVA CATEGORÍA"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border mb-5">
        <button
          className={`bg-transparent border-none border-b-2 text-[15px] font-semibold py-3 px-1 cursor-pointer transition-colors ${
            activeTab === "proveedores"
              ? "text-text-primary border-[#0b1c30]"
              : "text-text-secondary border-transparent hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("proveedores")}
          id="tab-proveedores"
        >
          Gestión de Proveedores
        </button>
        <button
          className={`bg-transparent border-none border-b-2 text-[15px] font-semibold py-3 px-1 cursor-pointer transition-colors ${
            activeTab === "categorias"
              ? "text-text-primary border-[#0b1c30]"
              : "text-text-secondary border-transparent hover:text-text-primary"
          }`}
          onClick={() => setActiveTab("categorias")}
          id="tab-categorias"
        >
          Categorías
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder={
              activeTab === "proveedores"
                ? "Buscar ID, Nombre, Email..."
                : "Buscar Categoría..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-buscar-datos-maestros"
          />
        </div>
      </div>

      {/* Contenedor de Tabla */}
      <div className="card">
        <div className="table-container">
          {activeTab === "proveedores" ? (
            <table className="data-table" id="tabla-proveedores">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NOMBRE</th>
                  <th>EMAIL (RPA)</th>
                  <th>TELÉFONO</th>
                  <th className="text-right">PROD. ASOCIADOS</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} id={`row-proveedor-${s.id}`}>
                    <td className="mono">{s.id}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{s.name}</span>
                        {s.hasRpaError && (
                          <span className="inline-flex items-center bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                            ERROR RPA
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="mono text-slate-600">{s.email}</td>
                    <td className="mono">{s.phone}</td>
                    <td className="text-right mono font-semibold">
                      {s.associatedProducts.toLocaleString()}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && (
                          <>
                            <button
                              className="bg-transparent border-none text-text-secondary cursor-pointer p-1.5 rounded-sm flex items-center justify-center transition-all hover:bg-slate-100 hover:text-text-primary"
                              onClick={() => onOpenEditSupplier(s)}
                              title="Editar proveedor"
                              id={`btn-edit-sup-${s.id}`}
                            >
                              <Edit2 size={13} />
                            </button>
                            {s.associatedProducts === 0 && (
                              <button
                                className="bg-transparent border-none text-text-secondary cursor-pointer p-1.5 rounded-sm flex items-center justify-center transition-all hover:bg-red-100 hover:text-danger"
                                onClick={() => handleDeleteSupplier(s.id)}
                                title="Eliminar proveedor"
                                id={`btn-del-sup-${s.id}`}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="data-table" id="tabla-categorias">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NOMBRE DE LA CATEGORÍA</th>
                  <th>DESCRIPCIÓN</th>
                  <th className="text-right">TOTAL PRODUCTOS</th>
                  <th>ESTADO</th>
                  <th className="text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((c) => (
                  <tr key={c.id} id={`row-categoria-${c.id}`}>
                    <td className="mono">{c.id}</td>
                    <td className="font-semibold">{c.name}</td>
                    <td className="text-text-secondary">{c.description}</td>
                    <td className="text-right mono font-semibold">
                      {c.totalProducts}
                    </td>
                    <td>
                      <span className="badge badge-success">{c.status}</span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && (
                          <button
                            className="bg-transparent border-none text-text-secondary cursor-pointer p-1.5 rounded-sm flex items-center justify-center transition-all hover:bg-slate-100 hover:text-text-primary"
                            onClick={() => onOpenEditCategory(c)}
                            title="Editar categoría"
                            id={`btn-edit-cat-${c.id}`}
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer de Paginación */}
        <div className="table-footer">
          <span>
            Mostrando 1-
            {activeTab === "proveedores"
              ? filteredSuppliers.length
              : filteredCategories.length}{" "}
            de{" "}
            {activeTab === "proveedores" ? suppliers.length : categories.length}{" "}
            {activeTab === "proveedores" ? "proveedores" : "categorías"}
          </span>
          <div className="pagination">
            <button className="page-btn" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="page-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}