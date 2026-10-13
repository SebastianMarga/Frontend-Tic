import React, { useState, useEffect } from "react";
import { X, UserPlus, Shield } from "lucide-react";
import { userService } from "../../services/userService.js";
import toast from "react-hot-toast";

export default function ModalUsuario({ isOpen, onClose, userToEdit, onSaved }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("OPERATOR");
  const [status, setStatus] = useState("Activo");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setName(userToEdit.name || "");
        setEmail(userToEdit.email || "");
        setPassword("");
        setRole(userToEdit.role || "OPERATOR");
        setStatus(userToEdit.isActive ? "Activo" : "Inactivo");
      } else {
        setName("");
        setEmail("");
        setPassword("");
        setRole("OPERATOR");
        setStatus("Activo");
      }
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userToEdit) {
        const updatePayload = {
          name,
          email,
          role,
          isActive: status === "Activo",
        };

        if (password.trim() !== "") {
          updatePayload.password = password;
        }

        await userService.updateUser(updatePayload, userToEdit.id);
        toast.success("Usuario actualizado exitosamente.");
      } else {
        await userService.createUser({
          name,
          email,
          password,
          role,
          isActive: status === "Activo",
        });
        toast.success("Usuario creado exitosamente.");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error("Error guardando usuario: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center z-[200] p-[16px]">
      <div
        className="bg-white border border-solid border-[var(--border-color)] rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] w-full max-w-[520px] overflow-hidden flex flex-col max-h-[90vh]"
        id="modal-usuario"
      >
        {/* Cabecera del Modal */}
        <div className="py-[18px] px-[24px] border-b border-solid border-[var(--border-color)] flex items-center justify-between">
          <div className="flex items-center gap-[8px] text-[var(--text-primary)]">
            <Shield size={18} />
            <h2 className="text-[16px] font-[700] text-[var(--text-primary)] m-0 leading-[1.4]">
              {userToEdit ? "Editar Usuario y Permisos" : "Crear Nuevo Usuario"}
            </h2>
          </div>
          <button
            type="button"
            className="bg-transparent border-none text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100 p-[6px] rounded-[var(--radius-sm)] cursor-pointer flex items-center justify-center transition-colors duration-150"
            onClick={onClose}
            id="btn-cerrar-modal-usuario"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-[24px] overflow-y-auto">
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
                placeholder="Ej. Fabrizio Go Loza"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-email-input">
                Correo Electrónico
              </label>
              <input
                id="user-email-input"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="go.loza@gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-password-input">
                Contraseña
              </label>
              <input
                id="user-password-input"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  userToEdit ? "••••••••" : "Ingresa una contraseña"
                }
                required={!userToEdit}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
              <div className="form-group !mb-0">
                <label className="form-label" htmlFor="user-role-select">
                  Rol
                </label>
                <select
                  id="user-role-select"
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="OPERATOR">OPERATOR</option>
                </select>
              </div>

              <div className="form-group !mb-0">
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

          {/* Footer del Modal */}
          <div className="py-[16px] px-[24px] border-t border-solid border-[var(--border-color)] bg-[#f8fafc] flex items-center justify-end gap-[10px]">
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
              id="btn-submit-usuario"
            >
              {loading
                ? "Guardando..."
                : userToEdit
                  ? "Actualizar Usuario"
                  : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}