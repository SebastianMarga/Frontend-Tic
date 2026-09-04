import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { categoryService } from "../../services/categoryService.js";

export default function ModalCategoria({
  isOpen,
  onClose,
  categoryToEdit,
  onSaved,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name || "");
        setDescription(categoryToEdit.description || "");
      } else {
        setName("");
        setDescription("");
      }
    }
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (categoryToEdit) {
        await categoryService.updateCategory(categoryToEdit.id, {
          name,
          description,
        });
      } else {
        await categoryService.createCategory({ name, description });
      }
      onSaved();
      onClose();
    } catch (err) {
      alert("Error guardando categoría: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" id="modal-categoria">
        <div className="modal-header">
          <h2 className="modal-title">
            {categoryToEdit ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            id="btn-cerrar-modal-categoria"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="cat-name">
                Nombre de la Categoría
              </label>
              <input
                id="cat-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sensores IoT"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cat-desc">
                Descripción
              </label>
              <textarea
                id="cat-desc"
                className="form-textarea"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción del alcance de esta categoría de inventario..."
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
              id="btn-submit-categoria"
            >
              {loading
                ? "Guardando..."
                : categoryToEdit
                  ? "Actualizar"
                  : "Guardar Categoría"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
