import React from "react";
import {
  Search,
  Bell,
  LogOut,
  ShieldCheck,
  UserCheck,
  ChevronDown,
} from "lucide-react";

export default function Header({
  activeView,
  currentUser,
  onToggleRole,
  onLogout,
  searchQuery,
  onSearchChange,
}) {
  const getBreadcrumb = () => {
    switch (activeView) {
      case "dashboard":
        return { main: "Panel de Control", sub: null };
      case "catalogo":
        return { main: "Panel de Control", sub: "Catálogo de Productos" };
      case "movimientos":
        return { main: "Panel de Control", sub: "Movimientos de Inventario" };
      case "proveedoresRpa":
      case "alertas":
        return {
          main: "Panel de Control",
          sub: "Proveedores Activos para Búsqueda RPA",
        };
      case "rpa":
        return { main: "Panel de Control", sub: "Supervisión de Órdenes RPA" };
      case "tendencias":
        return { main: "Panel de Control", sub: "Productos en Tendencia (IA)" };
      case "datosMaestros":
        return { main: "Panel de Control", sub: "Datos Maestros" };
      case "usuarios":
        return {
          main: "Panel de Control",
          sub: "Administración de Usuarios y Accesos",
        };
      case "configuracion":
        return { main: "Panel de Control", sub: "Configuración del Sistema" };
      case "ayuda":
        return { main: "Panel de Control", sub: "Centro de Ayuda" };
      default:
        return { main: "Panel de Control", sub: null };
    }
  };

  const breadcrumb = getBreadcrumb();
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <header
      className="h-[64px] bg-[var(--bg-header)] border-b border-solid border-[var(--border-color)] flex items-center justify-between py-0 px-[32px] sticky top-0 z-[90]"
      id="app-header"
    >
      {/* Título de la vista / Breadcrumb */}
      <div className="flex items-center gap-[16px]">
        <div className="text-[15px] leading-[1.5] font-[600] text-[var(--text-primary)] flex items-center gap-[8px]">
          <span>{breadcrumb.main}</span>
          {breadcrumb.sub && (
            <>
              <span className="text-[var(--text-muted)] font-[400]">›</span>
              <span className="text-[var(--text-secondary)] font-[500]">
                {breadcrumb.sub}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Selector de Rol interactivo, Notificaciones y Perfil */}
      <div className="flex items-center gap-[16px]">
        {/* Toggle de rol para testing fluido ADMIN vs OPERATOR */}
        <div className="flex items-center gap-[8px]">
          <button
            className={`inline-flex items-center gap-[6px] py-[4px] px-[10px] rounded-[var(--radius-sm)] text-[11px] leading-[1.5] font-[700] tracking-[0.05em] uppercase cursor-pointer border border-solid transition-all duration-150 ease-in-out m-0 outline-none ${
              isAdmin
                ? "bg-[#0b1c30] text-[#ffffff] border-transparent"
                : "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]"
            }`}
            onClick={onToggleRole}
            title="Haga clic para alternar entre rol ADMIN y OPERATOR"
            id="btn-toggle-role-header"
          >
            {isAdmin ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
            <span>{currentUser?.role || "ADMIN"}</span>
          </button>
        </div>

        {/* Cerrar Sesión */}
        <button
          className="bg-transparent border-none outline-none cursor-pointer text-[#64748b] p-[8px] rounded-[var(--radius-sm)] flex items-center justify-center relative transition-all duration-150 ease-in-out m-0 hover:bg-[#f1f5f9] hover:text-[var(--text-primary)]"
          onClick={onLogout}
          title="Cerrar Sesión"
          id="btn-header-logout"
        >
          <LogOut size={18} />
        </button>

        {/* Perfil de Usuario */}
        <div className="flex items-center gap-[10px] pl-[8px] border-l border-solid border-[var(--border-color)]">
          <div className="w-[32px] h-[32px] rounded-full bg-[#1e293b] text-[#ffffff] text-[12px] font-[600] flex items-center justify-center overflow-hidden shrink-0">
            {currentUser?.initials || "EP"}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-[600] text-[var(--text-primary)] leading-[1.2]">
              {currentUser?.name || "Elena Pérez"}
            </span>
            <span className="text-[11px] leading-[1.5] text-[var(--text-secondary)]">
              {currentUser?.role || "ADMIN"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
