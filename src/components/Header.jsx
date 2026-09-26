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
      case "alertas":
        return { main: "Panel de Control", sub: "Alertas de Vencimiento" };
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
      className="h-16 bg-header border-b border-border flex items-center justify-between px-8 sticky top-0 z-[90]"
      id="app-header"
    >
      {/* Título de la vista / Breadcrumb */}
      <div className="flex items-center gap-4">
        <div className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
          <span>{breadcrumb.main}</span>
          {breadcrumb.sub && (
            <>
              <span className="text-text-muted font-normal">›</span>
              <span className="text-text-secondary font-medium">
                {breadcrumb.sub}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Selector de Rol interactivo, Notificaciones y Perfil */}
      <div className="flex items-center gap-4">
        {/* Toggle de rol para testing fluido ADMIN vs OPERATOR */}
        <div className="flex items-center gap-2">
          <button
            className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-sm text-[11px] font-bold tracking-wide uppercase cursor-pointer border transition-all ${
              isAdmin
                ? "bg-[#0b1c30] text-white border-transparent"
                : "bg-emerald-100 text-emerald-800 border-emerald-200"
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
          className="bg-transparent border-none cursor-pointer text-slate-600 p-2 rounded-sm flex items-center justify-center relative transition-all hover:bg-slate-100 hover:text-text-primary"
          onClick={onLogout}
          title="Cerrar Sesión"
          id="btn-header-logout"
        >
          <LogOut size={18} />
        </button>

        {/* Perfil de Usuario */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center justify-center overflow-hidden">
            {currentUser?.initials || "EP"}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-text-primary leading-tight">
              {currentUser?.name || "Elena Pérez"}
            </span>
            <span className="text-[11px] text-text-secondary">
              {currentUser?.role || "ADMIN"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}