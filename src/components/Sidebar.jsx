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
    <aside className="w-[260px] h-[100vh] fixed top-0 left-0 bg-[var(--bg-sidebar)] border-r border-solid border-[var(--border-color)] flex flex-col justify-between pt-[24px] px-[16px] pb-[20px] z-[100] overflow-y-auto">
      <div className="flex flex-col gap-[20px]">
        {/* Logo de la plataforma */}
        <div className="flex items-center gap-[12px] py-0 px-[4px]">
          <div className="w-[38px] h-[38px] bg-[#0b1c30] rounded-[8px] flex items-center justify-center text-[#ffffff] shrink-0">
            <Boxes size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-[700] text-[var(--text-primary)] leading-[1.2]">
              Inventario IA
            </span>
            <span className="text-[11px] leading-[1.5] text-[var(--text-secondary)] font-[400]">
              Gestión Zero-Touch
            </span>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="flex flex-col gap-[4px] mt-[8px]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isRestricted = item.adminOnly && userRole === "OPERATOR";

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                className={`flex items-center justify-between py-[10px] px-[12px] rounded-[var(--radius-sm)] text-[13px] leading-[1.5] no-underline cursor-pointer transition-all duration-150 ease-in-out border border-solid border-transparent w-full text-left outline-none m-0 ${
                  isActive
                    ? "bg-[#eff6ff] text-[#1d4ed8] font-[600] relative after:content-[''] after:absolute after:right-[-16px] after:top-[15%] after:bottom-[15%] after:w-[3px] after:bg-[#1d4ed8] after:rounded-[4px_0_0_4px]"
                    : "bg-transparent text-[#475569] font-[500] hover:bg-[#f8fafc] hover:text-[var(--text-primary)]"
                }`}
                onClick={() => setActiveView(item.id)}
                title={
                  isRestricted
                    ? "Acceso limitado a administradores"
                    : item.label
                }
              >
                <div className="flex items-center gap-[12px]">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="inline-flex items-center justify-center bg-[#fee2e2] text-[#b91c1c] text-[10px] font-[700] py-[2px] px-[6px] rounded-[var(--radius-pill)] leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}