import React from "react";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Clock,
  Bot,
  Sparkles,
  Database,
  Users,
  Settings,
  HelpCircle,
  Plus,
  Boxes,
  MessageCircle,
} from "lucide-react";

export default function Sidebar({
  activeView,
  setActiveView,
  onOpenNewOrderModal,
  userRole,
  expiringCount = 12,
}) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "catalogo", label: "Catálogo", icon: Package },
    { id: "movimientos", label: "Movimientos", icon: ArrowLeftRight },
    {
      id: "alertas",
      label: "Alertas de Vencimiento",
      icon: Clock,
      badge: expiringCount > 0 ? expiringCount : null,
    },
    { id: "rpa", label: "Órdenes RPA", icon: Bot },
    { id: "tendencias", label: "Sugerencias IA", icon: Sparkles },
    { id: "chatbot", label: "Asistente Virtual", icon: MessageCircle },
    { id: "datosMaestros", label: "Datos Maestros", icon: Database },
    {
      id: "usuarios",
      label: "Usuarios",
      icon: Users,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-[260px] h-screen fixed top-0 left-0 bg-sidebar border-r border-border flex flex-col justify-between py-6 px-4 pb-5 z-[100] overflow-y-auto">
      <div className="flex flex-col gap-5">
        {/* Logo de la plataforma */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-[38px] h-[38px] bg-[#0b1c30] rounded-lg flex items-center justify-center text-white">
            <Boxes size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-text-primary leading-tight">
              Inventario IA
            </span>
            <span className="text-[11px] text-text-secondary font-normal">
              Gestión Zero-Touch
            </span>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex flex-col gap-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isRestricted = item.adminOnly && userRole === "OPERATOR";

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                className={`relative flex items-center justify-between py-2.5 px-3 rounded-sm text-[13px] font-medium cursor-pointer transition-all border border-transparent w-full text-left ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 bg-transparent hover:bg-slate-50 hover:text-text-primary"
                }`}
                onClick={() => setActiveView(item.id)}
                title={
                  isRestricted
                    ? "Acceso limitado a administradores"
                    : item.label
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold py-0.5 px-1.5 rounded-pill">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute -right-4 top-[15%] bottom-[15%] w-[3px] bg-blue-700 rounded-l-md" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}