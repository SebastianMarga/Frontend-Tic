import React, { useState, useEffect } from 'react';
import { X, UserPlus, Shield } from 'lucide-react';
import { userService } from '../../services/userService.js';

export default function ModalUsuario({ isOpen, onClose, userToEdit, onSaved }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('OPERATOR');
  const [status, setStatus] = useState('Activo');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setName(userToEdit.name || '');
        setEmail(userToEdit.email || '');
        setRole(userToEdit.role || 'OPERATOR');
        setStatus(userToEdit.status || 'Activo');
      } else {
        setName('');
        setEmail('');
        setRole('OPERATOR');
        setStatus('Activo');
      }
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userToEdit) {
        await userService.updateUserRole(userToEdit.id, { name, email, role, status });
      } else {
        await userService.createUser({ name, email, role, status });
      }
      onSaved();
      onClose();
    } catch (err) {
      alert('Error guardando usuario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" id="modal-usuario">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} />
            <h2 className="modal-title">
              {userToEdit ? 'Editar Usuario y Permisos' : 'Crear Nuevo Usuario'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="btn-cerrar-modal-usuario">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="user-name-input">
                Nombre Completo
              </label>
              <input
                id="user-name-input"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sofía Morales"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-email-input">
                Correo Electrónico Corporativo
              </label>
              <input
                id="user-email-input"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sofia.morales@inventarioia.com"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="user-role-select">
                  Rol en el Sistema
                </label>
                <select
                  id="user-role-select"
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="ADMIN">ADMIN (Acceso Total & Gestión)</option>
                  <option value="OPERATOR">OPERATOR (Registro & Supervisión)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="user-status-select">
                  Estado de la Cuenta
                </label>
                <select
                  id="user-status-select"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="btn-submit-usuario">
              {loading ? 'Guardando...' : userToEdit ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
