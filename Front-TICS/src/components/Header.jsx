import React from 'react';
import { Search, Bell, LogOut, ShieldCheck, UserCheck, ChevronDown } from 'lucide-react';
import './Header.css';

export default function Header({
  activeView,
  currentUser,
  onToggleRole,
  onLogout,
  searchQuery,
  onSearchChange
}) {
  const getBreadcrumb = () => {
    switch (activeView) {
      case 'dashboard':
        return { main: 'Panel de Control', sub: null };
      case 'catalogo':
        return { main: 'Panel de Control', sub: 'Catálogo de Productos' };
      case 'movimientos':
        return { main: 'Panel de Control', sub: 'Movimientos de Inventario' };
      case 'alertas':
        return { main: 'Panel de Control', sub: 'Alertas de Vencimiento' };
      case 'rpa':
        return { main: 'Panel de Control', sub: 'Supervisión de Órdenes RPA' };
      case 'tendencias':
        return { main: 'Panel de Control', sub: 'Productos en Tendencia (IA)' };
      case 'datosMaestros':
        return { main: 'Panel de Control', sub: 'Datos Maestros' };
      case 'usuarios':
        return { main: 'Panel de Control', sub: 'Administración de Usuarios y Accesos' };
      case 'configuracion':
        return { main: 'Panel de Control', sub: 'Configuración del Sistema' };
      case 'ayuda':
        return { main: 'Panel de Control', sub: 'Centro de Ayuda' };
      default:
        return { main: 'Panel de Control', sub: null };
    }
  };

  const breadcrumb = getBreadcrumb();
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="header" id="app-header">
      {/* Título de la vista / Breadcrumb */}
      <div className="header-left">
        <div className="header-breadcrumb">
          <span>{breadcrumb.main}</span>
          {breadcrumb.sub && (
            <>
              <span className="header-breadcrumb-separator">›</span>
              <span className="header-breadcrumb-sub">{breadcrumb.sub}</span>
            </>
          )}
        </div>
      </div>

      {/* Selector de Rol interactivo, Notificaciones y Perfil */}
      <div className="header-right">
        {/* Toggle de rol para testing fluido ADMIN vs OPERATOR */}
        <div className="role-switcher-container">
          <button
            className={`role-badge-btn ${isAdmin ? 'role-admin' : 'role-operator'}`}
            onClick={onToggleRole}
            title="Haga clic para alternar entre rol ADMIN y OPERATOR"
            id="btn-toggle-role-header"
          >
            {isAdmin ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
            <span>{currentUser?.role || 'ADMIN'}</span>
          </button>
        </div>

        {/* Cerrar Sesión */}
        <button
          className="header-icon-btn"
          onClick={onLogout}
          title="Cerrar Sesión"
          id="btn-header-logout"
        >
          <LogOut size={18} />
        </button>

        {/* Perfil de Usuario */}
        <div className="header-user-profile">
          <div className="header-user-avatar">
            {currentUser?.initials || 'EP'}
          </div>
          <div className="header-user-info">
            <span className="header-user-name">{currentUser?.name || 'Elena Pérez'}</span>
            <span className="header-user-role">{currentUser?.role || 'ADMIN'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
