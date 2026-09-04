import React, { useState, useEffect } from "react";
import { X, Package, Sparkles } from "lucide-react";
import { productService } from "../../services/productService.js";
import { categoryService } from "../../services/categoryService.js";
import { supplierService } from "../../services/supplierService.js";

export default function ModalProducto({
  isOpen,
  onClose,
  productToEdit,
  onSaved,
}) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [dynamicThreshold, setDynamicThreshold] = useState(100);
  const [optimalOrderQty, setOptimalOrderQty] = useState(200);
  const [leadTimeDays, setLeadTimeDays] = useState(5);
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("uds");

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Cargar listas de maestros
      categoryService.getCategories().then((cats) => {
        setCategories(cats);
        if (!category && cats.length > 0) setCategory(cats[0].name);
      });
      supplierService.getSuppliers().then((sups) => {
        setSuppliers(sups);
        if (!supplier && sups.length > 0) setSupplier(sups[0].name);
      });

      if (productToEdit) {
        setSku(productToEdit.sku || "");
        setName(productToEdit.name || "");
        setCategory(productToEdit.category || "");
        setSupplier(productToEdit.supplier || "");
        setCurrentStock(productToEdit.currentStock || 0);
        setDynamicThreshold(productToEdit.dynamicThreshold || 100);
        setOptimalOrderQty(productToEdit.optimalOrderQty || 200);
        setLeadTimeDays(productToEdit.leadTimeDays || 5);
        setDescription(productToEdit.description || "");
        setUnit(productToEdit.unit || "uds");
      } else {
        setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
        setName("");
        setCurrentStock(0);
        setDynamicThreshold(100);
        setOptimalOrderQty(250);
        setLeadTimeDays(5);
        setDescription("");
        setUnit("uds");
      }
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        sku,
        name,
        category,
        supplier,
        currentStock: Number(currentStock),
        dynamicThreshold: Number(dynamicThreshold),
        optimalOrderQty: Number(optimalOrderQty),
        leadTimeDays: Number(leadTimeDays),
        description,
        unit,
      };

      if (productToEdit) {
        await productService.updateProduct(productToEdit.id, payload);
      } else {
        await productService.createProduct(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      alert("Error guardando producto: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg" id="modal-producto">
        <div className="modal-header">
          <h2 className="modal-title">
            {productToEdit
              ? "Editar Parámetros de Producto"
              : "Nuevo Producto en Catálogo"}
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            id="btn-cerrar-modal-producto"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input
                  type="text"
                  className="form-input"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unidad de Medida</label>
                <select
                  className="form-select"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="uds">Unidades (uds)</option>
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="litros">Litros (L)</option>
                  <option value="cajas">Cajas</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Producto</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Microcontrolador ARM Cortex-M4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Proveedor Predeterminado</label>
                <select
                  className="form-select"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "16px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                margin: "16px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "12px",
                  color: "#0b1c30",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                <Sparkles size={14} />
                <span>
                  PARÁMETROS DINÁMICOS DEL MODELO IA & REABASTECIMIENTO
                </span>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Umbral Dinámico IA (Punto de Reorden)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={dynamicThreshold}
                    onChange={(e) => setDynamicThreshold(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Cantidad Óptima de Reorden (Lote Sugerido)
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={optimalOrderQty}
                    onChange={(e) => setOptimalOrderQty(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stock Actual</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  disabled={!!productToEdit}
                  title={
                    productToEdit
                      ? "Para modificar stock use Registrar Movimiento"
                      : ""
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lead Time Proveedor (Días)</label>
                <input
                  type="number"
                  className="form-input"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Descripción / Especificaciones
              </label>
              <textarea
                className="form-textarea"
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles técnicos o requisitos de almacenamiento..."
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Guardando..."
                : productToEdit
                  ? "Actualizar Producto"
                  : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
