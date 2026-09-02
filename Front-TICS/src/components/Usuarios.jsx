import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Shield, User, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { userService } from '../services/userService.js';
import './Usuarios.css';

export default function Usuarios({ userRole, onOpenCreateUser, onOpenEditUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers({
        search,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(data);
    } catch (e) {
      console.error('Error cargando usuarios:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, statusFilter]);

  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="page-container" id="usuarios-view">
      {/* Cabecera de Página */}
      <div className="page-header">
        <div className="page-header-titles">
          <h1 className="page-title">Administración de Usuarios y Accesos</h1>
          <p className="page-subtitle">
            Control de roles, permisos y credenciales del personal operativo y administrativo.
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
                <th style={{ textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No se encontraron usuarios con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} id={`row-usuario-${user.id}`}>
                    <td>
                      <div className="user-cell">
                        <div
                          className={`user-avatar-circle ${
                            user.role === 'OPERATOR' ? 'operator-avatar' : ''
                          }`}
                        >
                          {user.initials || 'US'}
                        </div>
                        <span className="user-name-text">{user.name}</span>
                      </div>
                    </td>
                    <td className="mono" style={{ color: '#475569' }}>
                      {user.email}
                    </td>
                    <td>
                      <span
                        className={`role-pill ${
                          user.role === 'ADMIN' ? 'admin' : 'operator'
                        }`}
                      >
                        {user.role === 'ADMIN' ? (
                          <Shield size={12} />
                        ) : (
                          <UserCheck size={12} />
                        )}
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td>
                      <span className="status-dot-cell">
                        <span
                          className={`status-dot ${
                            user.status !== 'Activo' ? 'inactive' : ''
                          }`}
                        ></span>
                        <span>{user.status}</span>
                      </span>
                    </td>
                    <td className="mono" style={{ color: '#64748b', fontSize: '12px' }}>
                      {user.createdAt}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isAdmin && (
                        <div className="table-actions-row">
                          <button
                            className="row-action-icon-btn"
                            onClick={() => onOpenEditUser(user)}
                            title="Editar usuario o rol"
                            id={`btn-edit-user-${user.id}`}
                          >
                            <Edit2 size={13} />
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
          <span>Mostrando 1 a {users.length} de {users.length} usuarios</span>
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
