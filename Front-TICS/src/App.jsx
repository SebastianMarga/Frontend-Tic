import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Catalogo from "./components/Catalogo.jsx";
import DatosMaestros from "./components/DatosMaestros.jsx";
import TendenciaIA from "./components/TendenciaIA.jsx";
import RPAOrdenes from "./components/RPAOrdenes.jsx";
import Movimientos from "./components/Movimientos.jsx";
import Alertas from "./components/Alertas.jsx";
import Usuarios from "./components/Usuarios.jsx";
import Chatbot from "./components/Chatbot.jsx";
import Login from "./components/Login.jsx";

// Modales Reutilizables
import ModalProducto from "./components/modals/ModalProducto.jsx";
import ModalDetalleProducto from "./components/modals/ModalDetalleProducto.jsx";
import ModalProveedor from "./components/modals/ModalProveedor.jsx";
import ModalCategoria from "./components/modals/ModalCategoria.jsx";
import ModalMovimiento from "./components/modals/ModalMovimiento.jsx";
import ModalAjusteConteo from "./components/modals/ModalAjusteConteo.jsx";
import ModalIncidenteRPA from "./components/modals/ModalIncidenteRPA.jsx";
import ModalNuevaOrdenRPA from "./components/modals/ModalNuevaOrdenRPA.jsx";
import ModalUsuario from "./components/modals/ModalUsuario.jsx";

import { authService } from "./services/authService.js";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() =>
    authService.getCurrentUser(),
  );
  const [activeView, setActiveView] = useState("dashboard");
  const [globalSearch, setGlobalSearch] = useState("");

  // Modales
  const [modalProductoOpen, setModalProductoOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [productDetail, setProductDetail] = useState(null);

  const [modalProveedorOpen, setModalProveedorOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);

  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const [modalMovimientoOpen, setModalMovimientoOpen] = useState(false);
  const [movimientoType, setMovimientoType] = useState("entrada");
  const [movimientoProduct, setMovimientoProduct] = useState(null);

  const [modalAjusteOpen, setModalAjusteOpen] = useState(false);

  const [modalIncidenteOpen, setModalIncidenteOpen] = useState(false);
  const [selectedIncidentOrder, setSelectedIncidentOrder] = useState(null);

  const [modalNuevaOrdenOpen, setModalNuevaOrdenOpen] = useState(false);
  const [nuevaOrdenInitialData, setNuevaOrdenInitialData] = useState(null);

  const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Trigger para refrescar vistas hijas tras mutaciones
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleToggleRole = () => {
    const newRole = currentUser?.role === "ADMIN" ? "OPERATOR" : "ADMIN";
    const updated = authService.setCurrentUserRole(newRole);
    setCurrentUser(updated);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Si no está logueado, mostrar pantalla de Login
  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-container">
      {/* Barra lateral de navegación */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenNewOrderModal={() => {
          setNuevaOrdenInitialData(null);
          setModalNuevaOrdenOpen(true);
        }}
        userRole={currentUser.role}
        expiringCount={12}
      />

      {/* Área de contenido principal */}
      <div className="main-content">
        <Header
          activeView={activeView}
          currentUser={currentUser}
          onToggleRole={handleToggleRole}
          onLogout={handleLogout}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        <main key={refreshKey}>
          {activeView === "dashboard" && (
            <Dashboard
              onNavigate={setActiveView}
              onOpenModalMovimiento={(type, prod) => {
                setMovimientoType(type);
                setMovimientoProduct(prod || null);
                setModalMovimientoOpen(true);
              }}
              onOpenNewOrderModal={(initData) => {
                setNuevaOrdenInitialData(initData);
                setModalNuevaOrdenOpen(true);
              }}
              onSelectProduct={(prod) => {
                setProductDetail(prod);
                setModalDetalleOpen(true);
              }}
            />
          )}

          {activeView === "catalogo" && (
            <Catalogo
              userRole={currentUser.role}
              onOpenCreateProduct={() => {
                setProductToEdit(null);
                setModalProductoOpen(true);
              }}
              onOpenEditProduct={(prod) => {
                setProductToEdit(prod);
                setModalProductoOpen(true);
              }}
              onOpenProductDetail={(prod) => {
                setProductDetail(prod);
                setModalDetalleOpen(true);
              }}
            />
          )}

          {activeView === "movimientos" && (
            <Movimientos
              userRole={currentUser.role}
              onOpenModalMovimiento={(type, prod) => {
                setMovimientoType(type);
                setMovimientoProduct(prod || null);
                setModalMovimientoOpen(true);
              }}
              onOpenModalAjuste={() => setModalAjusteOpen(true)}
            />
          )}

          {activeView === "alertas" && (
            <Alertas
              userRole={currentUser.role}
              onOpenModalMovimiento={(type, prod) => {
                setMovimientoType(type);
                setMovimientoProduct(prod || null);
                setModalMovimientoOpen(true);
              }}
            />
          )}

          {activeView === "rpa" && (
            <RPAOrdenes
              userRole={currentUser.role}
              onOpenNewOrderModal={() => {
                setNuevaOrdenInitialData(null);
                setModalNuevaOrdenOpen(true);
              }}
              onOpenIncidentModal={(order) => {
                setSelectedIncidentOrder(order);
                setModalIncidenteOpen(true);
              }}
            />
          )}

          {activeView === "tendencias" && (
            <TendenciaIA
              userRole={currentUser.role}
              onNavigate={setActiveView}
            />
          )}

          {activeView === "datosMaestros" && (
            <DatosMaestros
              userRole={currentUser.role}
              onOpenCreateSupplier={() => {
                setSupplierToEdit(null);
                setModalProveedorOpen(true);
              }}
              onOpenEditSupplier={(sup) => {
                setSupplierToEdit(sup);
                setModalProveedorOpen(true);
              }}
              onOpenCreateCategory={() => {
                setCategoryToEdit(null);
                setModalCategoriaOpen(true);
              }}
              onOpenEditCategory={(cat) => {
                setCategoryToEdit(cat);
                setModalCategoriaOpen(true);
              }}
            />
          )}

          {activeView === "usuarios" && (
            <Usuarios
              userRole={currentUser.role}
              onOpenCreateUser={() => {
                setUserToEdit(null);
                setModalUsuarioOpen(true);
              }}
              onOpenEditUser={(u) => {
                setUserToEdit(u);
                setModalUsuarioOpen(true);
              }}
            />
          )}

          {activeView === "chatbot" && <Chatbot currentUser={currentUser} />}
        </main>
      </div>

      {/* Modales Reactivos */}
      <ModalProducto
        isOpen={modalProductoOpen}
        onClose={() => setModalProductoOpen(false)}
        productToEdit={productToEdit}
        onSaved={triggerRefresh}
      />

      <ModalDetalleProducto
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        product={productDetail}
        onOpenOrderModal={(initData) => {
          setNuevaOrdenInitialData(initData);
          setModalNuevaOrdenOpen(true);
        }}
        onOpenMovementModal={(type, prod) => {
          setMovimientoType(type);
          setMovimientoProduct(prod);
          setModalMovimientoOpen(true);
        }}
      />

      <ModalProveedor
        isOpen={modalProveedorOpen}
        onClose={() => setModalProveedorOpen(false)}
        supplierToEdit={supplierToEdit}
        onSaved={triggerRefresh}
      />

      <ModalCategoria
        isOpen={modalCategoriaOpen}
        onClose={() => setModalCategoriaOpen(false)}
        categoryToEdit={categoryToEdit}
        onSaved={triggerRefresh}
      />

      <ModalMovimiento
        isOpen={modalMovimientoOpen}
        onClose={() => setModalMovimientoOpen(false)}
        type={movimientoType}
        preselectedProduct={movimientoProduct}
        onSaved={triggerRefresh}
      />

      <ModalAjusteConteo
        isOpen={modalAjusteOpen}
        onClose={() => setModalAjusteOpen(false)}
        onSaved={triggerRefresh}
      />

      <ModalIncidenteRPA
        isOpen={modalIncidenteOpen}
        onClose={() => setModalIncidenteOpen(false)}
        order={selectedIncidentOrder}
        onResolved={triggerRefresh}
      />

      <ModalNuevaOrdenRPA
        isOpen={modalNuevaOrdenOpen}
        onClose={() => setModalNuevaOrdenOpen(false)}
        initialData={nuevaOrdenInitialData}
        onCreated={triggerRefresh}
      />

      <ModalUsuario
        isOpen={modalUsuarioOpen}
        onClose={() => setModalUsuarioOpen(false)}
        userToEdit={userToEdit}
        onSaved={triggerRefresh}
      />
    </div>
  );
}
