import React from 'react';
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
  MessageCircle
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({
  activeView,
  setActiveView,
  onOpenNewOrderModal,
  userRole,
  expiringCount = 12
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalogo', label: 'Catálogo', icon: Package },
    { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
    {
      id: 'alertas',
      label: 'Alertas de Vencimiento',
      icon: Clock,
      badge: expiringCount > 0 ? expiringCount : null
    },
    { id: 'rpa', label: 'Órdenes RPA', icon: Bot },
    { id: 'tendencias', label: 'Sugerencias IA', icon: Sparkles },
    { id: 'chatbot', label: 'Asistente Virtual', icon: MessageCircle },
    { id: 'datosMaestros', label: 'Datos Maestros', icon: Database },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: Users,
      adminOnly: true
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        {/* Logo de la plataforma */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <Boxes size={22} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-title">Inventario IA</span>
            <span className="sidebar-subtitle">Gestión Zero-Touch</span>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const isRestricted = item.adminOnly && userRole === 'OPERATOR';

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveView(item.id)}
                title={isRestricted ? 'Acceso limitado a administradores' : item.label}
              >
                <div className="sidebar-nav-item-left">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="sidebar-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}