import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Trash2,
} from "lucide-react";
import { userService } from "../services/userService.js";
import toast from "react-hot-toast";

export default function Usuarios({
  userRole,
  onOpenCreateUser,
  onOpenEditUser,
}) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (e) {
      console.error("Error cargando usuarios:", e);
      toast.error("Error al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, statusFilter]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este usuario?"))
      return;
    const authUser = JSON.parse(localStorage.getItem("inventario_auth_user"));
    if (id === authUser.id) {
      toast.error("No se puede eliminar el usuario autenticado.");
      return;
    }
    try {
      await userService.removeUser(id);
      toast.success("Usuario eliminado correctamente.");
      loadUsers();
    } catch (error) {
      toast.error("Error al eliminar el usuario.");
      console.error(error);
    }
  };

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="page-container" id="usuarios-view">
      {/* Cabecera de Página */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Administración de Usuarios y Accesos</h1>
          <p className="page-subtitle">
            Control de roles, permisos y credenciales del personal operativo y
            administrativo.
          </p>
        </div>

        {isAdmin && (
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={onOpenCreateUser}
              id="btn-crear-nuevo-usuario"
            >
              <Plus size={15} />
              <span>CREAR NUEVO USUARIO</span>
            </button>
          </div>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar usuario por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="input-buscar-usuarios"
          />
        </div>

        <select
          className="select-input"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          id="select-filtro-rol-usuario"
        >
          <option value="Todos">Rol: Todos los roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="OPERATOR">OPERATOR</option>
        </select>

        <select
          className="select-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          id="select-filtro-estado-usuario"
        >
          <option value="Todos">Estado: Cualquier estado</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      {/* Tabla de Usuarios */}
      <div className="card">
        <div className="table-container">
          <table className="data-table" id="tabla-usuarios-sistema">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>CORREO ELECTRÓNICO</th>
                <th>ROL ASIGNADO</th>
                <th>ESTADO</th>
                <th>FECHA DE CREACIÓN</th>
                <th className="!text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center !p-[32px]">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center !p-[32px] text-[#64748b]"
                  >
                    No se encontraron usuarios con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} id={`row-usuario-${user.id}`}>
                    <td>
                      <div className="flex items-center gap-[12px]">
                        {/* Círculo alrededor de la inicial con color bonito y anillo */}
                        <div
                          className={`w-[36px] h-[36px] rounded-full text-[13px] font-bold flex items-center justify-center shrink-0 ring-2 shadow-xs ${
                            user.role === "OPERATOR"
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80"
                              : "bg-indigo-50 text-indigo-700 ring-indigo-200/80"
                          }`}
                        >
                          {user.name.charAt(0).toUpperCase() || "US"}
                        </div>
                        <span className="font-semibold text-[var(--text-primary)] text-[13.5px]">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="mono !text-[#475569]">{user.email}</td>
                    <td>
                      <span
                        className={`inline-flex items-center gap-[5px] py-[3px] px-[8px] rounded-[var(--radius-sm)] text-[11px] font-bold tracking-[0.04em] uppercase ${
                          user.role === "ADMIN"
                            ? "bg-[#0b1c30] text-white"
                            : "bg-[#d1fae5] text-[#065f46]"
                        }`}
                      >
                        {user.role === "ADMIN" ? (
                          <Shield size={12} />
                        ) : (
                          <UserCheck size={12} />
                        )}
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-[6px] text-[13px] font-medium">
                        <span
                          className={`w-[8px] h-[8px] rounded-full ${
                            !user.isActive ? "bg-[#94a3b8]" : "bg-[#059669]"
                          }`}
                        ></span>
                        <span>{user.isActive ? "Activo" : "Inactivo"}</span>
                      </span>
                    </td>
                    <td className="mono !text-[#64748b] !text-[12px]">
                      {user.createdAt}
                    </td>
                    <td className="!text-right">
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="bg-transparent border border-solid border-slate-200 flex items-center justify-center p-2 rounded hover:bg-slate-100 hover:border-slate-300 transition-colors text-slate-500 hover:text-indigo-600 cursor-pointer"
                            onClick={() => onOpenEditUser(user)}
                            title="Editar usuario"
                            id={`btn-edit-user-${user.id}`}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className="bg-transparent border border-solid border-slate-200 flex items-center justify-center p-2 rounded hover:bg-rose-50 hover:border-rose-200 transition-colors text-slate-500 hover:text-rose-600 cursor-pointer"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Eliminar usuario"
                            id={`btn-delete-user-${user.id}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="table-footer">
          <span>
            Mostrando 1 a {users.length} de {users.length} usuarios
          </span>
          <div className="pagination">
            <button className="page-btn" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="page-btn active">1</button>
            <button className="page-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}