import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { supplierService } from '../../services/supplierService.js';

export default function ModalProveedor({ isOpen, onClose, supplierToEdit, onSaved }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (supplierToEdit) {
        setName(supplierToEdit.name || '');
        setEmail(supplierToEdit.email || '');
        setPhone(supplierToEdit.phone || '');
      } else {
        setName('');
        setEmail('');
        setPhone('');
      }
    }
  }, [isOpen, supplierToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (supplierToEdit) {
        await supplierService.updateSupplier(supplierToEdit.id, { name, email, phone });
      } else {
        await supplierService.createSupplier({ name, email, phone });
      }
      onSaved();
      onClose();
    } catch (err) {
      alert('Error guardando proveedor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" id="modal-proveedor">
        <div className="modal-header">
          <h2 className="modal-title">
            {supplierToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} id="btn-cerrar-modal-proveedor">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="prov-name">
                Nombre del Proveedor
              </label>
              <input
                id="prov-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Nexus Parts Ltd."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prov-email">
                Email (RPA / Envío Automático)
              </label>
              <input
                id="prov-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="orders@proveedor.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prov-phone">
                Teléfono de Contacto
              </label>
              <input
                id="prov-phone"
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="btn-submit-proveedor">
              {loading ? 'Guardando...' : supplierToEdit ? 'Actualizar' : 'Guardar Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
