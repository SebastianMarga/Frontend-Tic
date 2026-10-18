import React, { useState, useMemo } from "react";
import {
  Bot,
  Search,
  Globe,
  RefreshCw,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  DollarSign,
  Clock,
  ArrowRight,
  Database,
  Eye,
  Filter,
  Check,
  Sparkles,
  ChevronRight,
  TrendingUp,
  X,
  Server,
  Activity,
  Radio,
  FileSpreadsheet,
} from "lucide-react";
import toast from "react-hot-toast";

// Datos estáticos de prueba de alta fidelidad para proveedores con búsqueda RPA
const INITIAL_RPA_SUPPLIERS = [
  {
    id: "PRV-RPA-001",
    name: "Logística Global B2B",
    country: "España",
    countryFlag: "🇪🇸",
    category: "Electrónica & Microcontroladores",
    categoryCode: "electronica",
    status: "ONLINE",
    statusLabel: "Bot Operativo / Óptimo",
    integrationType: "Portal B2B (Headless Puppeteer)",
    targetUrl: "https://portal.logglobal.com/b2b-catalog",
    skusMonitored: 1420,
    lastSync: "Hace 4 minutos",
    frequency: "Cada 15 min",
    avgResponseTime: "1.2s",
    reliability: 99.4,
    autoOrderEnabled: true,
    priceDiscountsDetected: 28,
    currency: "EUR / USD",
    searchQueryHistory: ["Cortex-M4", "ESP32-WROOM", "Sensor HC-SR04"],
    activeCredentials: "Token OAuth 2.0 (Válido)",
    botVersion: "v3.4 - AutoLogin Enabled",
    lastPriceFound: "€ 14.20 (-8% vs mercado)",
  },
  {
    id: "PRV-RPA-002",
    name: "TechCorp Inbound Supply",
    country: "Estados Unidos",
    countryFlag: "🇺🇸",
    category: "Sensores IoT & Robótica",
    categoryCode: "sensores",
    status: "ONLINE",
    statusLabel: "Bot Operativo / Óptimo",
    integrationType: "API REST B2B + Web Hook",
    targetUrl: "https://techcorp.io/api/v2/catalog",
    skusMonitored: 680,
    lastSync: "Hace 12 minutos",
    frequency: "Cada 30 min",
    avgResponseTime: "0.8s",
    reliability: 99.8,
    autoOrderEnabled: true,
    priceDiscountsDetected: 14,
    currency: "USD",
    searchQueryHistory: ["Sensor Ultrasónico", "BMP280", "DHT22 Pro"],
    activeCredentials: "API Key Header (Válido)",
    botVersion: "v4.1 - Direct API",
    lastPriceFound: "$ 6.45 (Mejor oferta actual)",
  },
  {
    id: "PRV-RPA-003",
    name: "Nexus Parts Industrial",
    country: "Reino Unido",
    countryFlag: "🇬🇧",
    category: "Electrónica de Potencia & Conectores",
    categoryCode: "electronica",
    status: "SCANNING",
    statusLabel: "Búsqueda RPA en Curso...",
    integrationType: "Scraper Web Headless",
    targetUrl: "https://nexusparts.co.uk/store/b2b",
    skusMonitored: 890,
    lastSync: "Escaneando en vivo",
    frequency: "Cada 20 min",
    avgResponseTime: "2.1s",
    reliability: 97.9,
    autoOrderEnabled: false,
    priceDiscountsDetected: 9,
    currency: "GBP / USD",
    searchQueryHistory: ["Relé de Potencia 12V", "Bornera 8 pines", "MOSFET IRFZ44N"],
    activeCredentials: "Bypass MFA Simulado",
    botVersion: "v2.8 - Stealth Browser",
    lastPriceFound: "£ 3.80 (Revisión requerida)",
  },
  {
    id: "PRV-RPA-004",
    name: "Componentes Delta Iberia",
    country: "España",
    countryFlag: "🇪🇸",
    category: "Mecánica & Rodamientos",
    categoryCode: "mecanica",
    status: "ONLINE",
    statusLabel: "Bot Operativo / Óptimo",
    integrationType: "EDI Automatizado + Scraper",
    targetUrl: "https://b2b.deltaiberia.es/pedidos",
    skusMonitored: 2150,
    lastSync: "Hace 18 minutos",
    frequency: "Cada 1 hora",
    avgResponseTime: "1.6s",
    reliability: 99.1,
    autoOrderEnabled: true,
    priceDiscountsDetected: 35,
    currency: "EUR",
    searchQueryHistory: ["Rodamiento 608-2RS", "Eje Lineal 8mm", "Polea GT2"],
    activeCredentials: "Certificado EDI X.400",
    botVersion: "v3.0 - High Throughput",
    lastPriceFound: "€ 1.95 (-12% mayoreo)",
  },
  {
    id: "PRV-RPA-005",
    name: "BioGen Solutions Lab",
    country: "Suiza",
    countryFlag: "🇨🇭",
    category: "Reactivos & Biotecnología",
    categoryCode: "reactivos",
    status: "ONLINE",
    statusLabel: "Bot Operativo / Óptimo",
    integrationType: "RPA Portal con 2FA Automatizado",
    targetUrl: "https://biogensolutions.ch/supply-portal",
    skusMonitored: 540,
    lastSync: "Hace 25 minutos",
    frequency: "Cada 45 min",
    avgResponseTime: "2.4s",
    reliability: 99.0,
    autoOrderEnabled: true,
    priceDiscountsDetected: 6,
    currency: "CHF / EUR",
    searchQueryHistory: ["Buffer Fosfato 1L", "Agar MacConkey", "Kit Extracción"],
    activeCredentials: "TOTP Bot Helper Activo",
    botVersion: "v3.2 - Biotec Secure",
    lastPriceFound: "€ 42.50 (Estable)",
  },
  {
    id: "PRV-RPA-006",
    name: "Suministros ElectroMundo",
    country: "México",
    countryFlag: "🇲🇽",
    category: "Automatización & Contactores",
    categoryCode: "automatizacion",
    status: "AUTH_REQUIRED",
    statusLabel: "Alerta Captcha / Sesión Expirada",
    integrationType: "Scraper HTML Dinámico",
    targetUrl: "https://electromundo.mx/catalogo",
    skusMonitored: 320,
    lastSync: "Hace 2 horas (Fallo)",
    frequency: "Cada 30 min",
    avgResponseTime: "5.8s",
    reliability: 84.5,
    autoOrderEnabled: false,
    priceDiscountsDetected: 2,
    currency: "MXN / USD",
    searchQueryHistory: ["Contactor 24V 9A", "Guardamotor 4-6.3A"],
    activeCredentials: "Re-login Manual Requerido",
    botVersion: "v1.9 - Legacy Scraper",
    lastPriceFound: "$ 320 MXN (Desactualizado)",
  },
  {
    id: "PRV-RPA-007",
    name: "Global Robotics Network",
    country: "Alemania",
    countryFlag: "🇩🇪",
    category: "Automatización & Robótica",
    categoryCode: "automatizacion",
    status: "ONLINE",
    statusLabel: "Bot Operativo / Óptimo",
    integrationType: "RPA Bot Multi-Región",
    targetUrl: "https://globalrobotics.de/enterprise",
    skusMonitored: 1120,
    lastSync: "Hace 8 minutos",
    frequency: "Cada 15 min",
    avgResponseTime: "1.1s",
    reliability: 99.3,
    autoOrderEnabled: true,
    priceDiscountsDetected: 19,
    currency: "EUR / USD",
    searchQueryHistory: ["Servomotor MG996R", "Driver Stepper A4988"],
    activeCredentials: "OAuth 2.0 Enterprise",
    botVersion: "v4.0 - MultiThreaded",
    lastPriceFound: "€ 8.90 (-15% volumen)",
  },
  {
    id: "PRV-RPA-008",
    name: "EcoBox Industrial Packaging",
    country: "España",
    countryFlag: "🇪🇸",
    category: "Embalajes & Logística",
    categoryCode: "embalaje",
    status: "ONLINE",
    statusLabel: "Bot Operativo / Óptimo",
    integrationType: "Extractor Catálogo CSV/Portal",
    targetUrl: "https://ecobox.es/b2b-tarifas",
    skusMonitored: 210,
    lastSync: "Hace 40 minutos",
    frequency: "Cada 2 horas",
    avgResponseTime: "0.9s",
    reliability: 100.0,
    autoOrderEnabled: true,
    priceDiscountsDetected: 4,
    currency: "EUR",
    searchQueryHistory: ["Caja Kraft Reforzada", "Film Estirable", "Cinta Seguridad"],
    activeCredentials: "Credenciales Básicas B2B",
    botVersion: "v2.5 - CSV Parser",
    lastPriceFound: "€ 0.48 / unidad",
  },
];

export default function ProveedoresRPA({ userRole }) {
  const [suppliers, setSuppliers] = useState(INITIAL_RPA_SUPPLIERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [globalScanning, setGlobalScanning] = useState(false);

  // Estados para modales de prueba y configuración
  const [selectedSupplierForConfig, setSelectedSupplierForConfig] = useState(null);
  const [testSearchModalOpen, setTestSearchModalOpen] = useState(false);
  const [testProductQuery, setTestProductQuery] = useState("Microcontrolador ARM Cortex-M4");
  const [testSearching, setTestSearching] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Ejecución individual de búsqueda RPA simulada en un proveedor
  const handleRunSingleRpa = (supplierId) => {
    const target = suppliers.find((s) => s.id === supplierId);
    if (!target) return;

    toast.loading(`Iniciando Bot RPA en ${target.name}...`, { id: `rpa-${supplierId}` });

    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplierId ? { ...s, status: "SCANNING", statusLabel: "Rastreando ahora..." } : s))
    );

    setTimeout(() => {
      const discountsFound = Math.floor(Math.random() * 5) + 1;
      const updatedTime = "Justo ahora";

      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === supplierId
            ? {
                ...s,
                status: "ONLINE",
                statusLabel: "Bot Operativo / Óptimo",
                lastSync: updatedTime,
                priceDiscountsDetected: s.priceDiscountsDetected + discountsFound,
              }
            : s
        )
      );

      toast.success(
        `¡Rastreo RPA completado para ${target.name}!\nSe verificaron sus ${target.skusMonitored} SKUs (${discountsFound} nuevos mejores precios encontrados).`,
        { id: `rpa-${supplierId}`, duration: 4000 }
      );
    }, 1800);
  };

  // Toggle de activación del bot RPA para un proveedor
  const handleToggleBot = (supplierId) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const nextActive = !s.autoOrderEnabled;
          toast(
            nextActive
              ? `Búsqueda RPA automática ACTIVADA para ${s.name}`
              : `Búsqueda RPA automática EN PAUSA para ${s.name}`,
            { icon: nextActive ? "🤖" : "⏸️" }
          );
          return {
            ...s,
            autoOrderEnabled: nextActive,
            status: nextActive ? "ONLINE" : "PAUSED",
            statusLabel: nextActive ? "Bot Operativo / Óptimo" : "Rastreo Pausado",
          };
        }
        return s;
      })
    );
  };

  // Ejecución de barrido global RPA en todos los proveedores activos
  const handleRunGlobalRpaScan = () => {
    setGlobalScanning(true);
    const toastId = toast.loading("Ejecutando barrido global con 8 Bots RPA en paralelo...");

    setSuppliers((prev) =>
      prev.map((s) => (s.status === "ONLINE" ? { ...s, status: "SCANNING", statusLabel: "Escaneando en paralelo..." } : s))
    );

    setTimeout(() => {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.status === "SCANNING"
            ? {
                ...s,
                status: "ONLINE",
                statusLabel: "Bot Operativo / Óptimo",
                lastSync: "Justo ahora",
                priceDiscountsDetected: s.priceDiscountsDetected + Math.floor(Math.random() * 4) + 1,
              }
            : s
        )
      );
      setGlobalScanning(false);
      toast.success("¡Barrido global RPA finalizado con éxito! 7,330 productos actualizados con precios en vivo.", {
        id: toastId,
        duration: 4500,
      });
    }, 2500);
  };

  // Simulación de prueba de cotización RPA en vivo
  const handleSimulateTestSearch = (e) => {
    e?.preventDefault();
    if (!testProductQuery.trim()) return;

    setTestSearching(true);
    setTestResults(null);

    setTimeout(() => {
      setTestResults([
        {
          supplier: "Logística Global B2B",
          price: "€ 13.90",
          deliveryTime: "24-48 hrs",
          stockAvailable: 240,
          isBestPrice: true,
          matchConfidence: "99.8%",
          url: "https://portal.logglobal.com/b2b-catalog",
        },
        {
          supplier: "TechCorp Inbound Supply",
          price: "$ 15.20 (€ 14.15)",
          deliveryTime: "3-5 días",
          stockAvailable: 500,
          isBestPrice: false,
          matchConfidence: "98.5%",
          url: "https://techcorp.io/api/v2/catalog",
        },
        {
          supplier: "Global Robotics Network",
          price: "€ 14.80",
          deliveryTime: "48 hrs",
          stockAvailable: 150,
          isBestPrice: false,
          matchConfidence: "97.2%",
          url: "https://globalrobotics.de/enterprise",
        },
      ]);
      setTestSearching(false);
      toast.success("Consulta RPA finalizada. Se encontraron 3 proveedores con stock inmediato.");
    }, 1500);
  };

  // Filtrado de proveedores
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.integrationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.country.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ONLINE" && item.status === "ONLINE") ||
        (statusFilter === "SCANNING" && item.status === "SCANNING") ||
        (statusFilter === "AUTH_REQUIRED" && item.status === "AUTH_REQUIRED") ||
        (statusFilter === "PAUSED" && item.status === "PAUSED");

      const matchCategory =
        categoryFilter === "ALL" || item.categoryCode === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [suppliers, searchTerm, statusFilter, categoryFilter]);

  // Métricas agregadas para los KPIs superiores
  const stats = useMemo(() => {
    const total = suppliers.length;
    const online = suppliers.filter((s) => s.status === "ONLINE" || s.status === "SCANNING").length;
    const totalSkus = suppliers.reduce((acc, s) => acc + s.skusMonitored, 0);
    const avgReliability = (
      suppliers.reduce((acc, s) => acc + s.reliability, 0) / total
    ).toFixed(1);
    const totalDiscounts = suppliers.reduce((acc, s) => acc + s.priceDiscountsDetected, 0);

    return { total, online, totalSkus, avgReliability, totalDiscounts };
  }, [suppliers]);

  return (
    <div className="page-container" id="proveedores-rpa-view">
      {/* Cabecera de Página */}
      <div className="page-header">
        <div className="page-header-titles">
          <div className="flex items-center gap-[10px]">
            <h1 className="page-title">Proveedores Activos para Búsqueda RPA</h1>
            <span className="inline-flex items-center gap-[5px] bg-[#dbeafe] text-[#1d4ed8] text-[11px] font-[700] py-[3px] px-[8px] rounded-[var(--radius-pill)]">
              <Bot size={13} />
              Zero-Touch RPA
            </span>
          </div>
          <p className="page-subtitle">
            Plataformas y portales B2B sincronizados con bots automatizados para cotización continua, detección de mejores precios y reabastecimiento inteligente.
          </p>
        </div>

        <div className="page-actions flex items-center gap-[10px]">
          <button
            className="btn btn-secondary flex items-center gap-[6px]"
            onClick={() => {
              setTestResults(null);
              setTestSearchModalOpen(true);
            }}
            id="btn-probar-consulta-rpa"
          >
            <Sparkles size={15} className="text-[#2563eb]" />
            <span>Probar Consulta RPA</span>
          </button>

          <button
            className="btn btn-primary flex items-center gap-[8px]"
            onClick={handleRunGlobalRpaScan}
            disabled={globalScanning}
            id="btn-barrido-global-rpa"
          >
            <RefreshCw size={15} className={globalScanning ? "animate-spin" : ""} />
            <span>{globalScanning ? "Rastreando Todo..." : "Barrido Global RPA"}</span>
          </button>
        </div>
      </div>

      {/* Grid de KPIs de Proveedores RPA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[24px]">
        {/* KPI 1 */}
        <div className="kpi-card" id="kpi-proveedores-conectados">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[var(--text-secondary)]">
              Proveedores Conectados
            </span>
            <Globe className="shrink-0 text-[#2563eb]" size={18} />
          </div>
          <div className="flex items-baseline gap-[8px]">
            <span className="text-[26px] font-[800] leading-[1.2] text-[var(--text-primary)]">
              {stats.online} / {stats.total}
            </span>
            <span className="text-[12px] font-[600] text-[#10b981]">
              ● En Línea
            </span>
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            Integrados a motores de scraping y API
          </div>
        </div>

        {/* KPI 2 */}
        <div className="kpi-card" id="kpi-skus-monitoreados">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[var(--text-secondary)]">
              SKUs Monitoreados RPA
            </span>
            <Cpu className="shrink-0 text-[#0284c7]" size={18} />
          </div>
          <div className="text-[26px] font-[800] leading-[1.2] text-[#0284c7]">
            {stats.totalSkus.toLocaleString()}
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            Catálogo indexado en tiempo real
          </div>
        </div>

        {/* KPI 3 */}
        <div className="kpi-card" id="kpi-fiabilidad-rpa">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[var(--text-secondary)]">
              Fiabilidad de Scraping
            </span>
            <ShieldCheck className="shrink-0 text-[#10b981]" size={18} />
          </div>
          <div className="text-[26px] font-[800] leading-[1.2] text-[#10b981]">
            {stats.avgReliability}%
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            Tasa de éxito en bypass y extracción
          </div>
        </div>

        {/* KPI 4 */}
        <div className="kpi-card" id="kpi-oportunidades-precio">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[var(--text-secondary)]">
              Mejores Precios Detectados
            </span>
            <Zap className="shrink-0 text-[#f59e0b]" size={18} />
          </div>
          <div className="text-[26px] font-[800] leading-[1.2] text-[#f59e0b]">
            {stats.totalDiscounts} Ofertas
          </div>
          <div className="text-[12px] text-[var(--text-secondary)]">
            Ahorro potencial promedio de ~12.4%
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="filters-bar flex flex-wrap items-center justify-between gap-[12px] mb-[20px] bg-[var(--bg-surface)] p-[14px] rounded-[var(--radius-lg)] border border-solid border-[var(--border-color)]">
        <div className="flex flex-wrap items-center gap-[12px] flex-1">
          {/* Input de Búsqueda */}
          <div className="relative min-w-[260px] flex-1">
            <Search
              size={16}
              className="absolute left-[12px] top-[50%] -translate-y-1/2 text-[var(--text-secondary)]"
            />
            <input
              type="text"
              className="input pl-[36px] w-full"
              placeholder="Buscar por proveedor, país o tecnología RPA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="input-buscar-proveedores-rpa"
            />
            {searchTerm && (
              <button
                className="absolute right-[10px] top-[50%] -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                onClick={() => setSearchTerm("")}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtro por Categoría */}
          <select
            className="select-input min-w-[170px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            id="select-categoria-rpa"
          >
            <option value="ALL">Todas las Categorías</option>
            <option value="electronica">Electrónica & Chips</option>
            <option value="sensores">Sensores IoT</option>
            <option value="mecanica">Mecánica & Rodamientos</option>
            <option value="reactivos">Reactivos Biológicos</option>
            <option value="automatizacion">Automatización</option>
            <option value="embalaje">Embalajes & Logística</option>
          </select>

          {/* Filtro por Estado de Bot */}
          <select
            className="select-input min-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            id="select-estado-bot-rpa"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ONLINE">● Solo Operativos</option>
            <option value="SCANNING">⚡ En Escaneo</option>
            <option value="AUTH_REQUIRED">⚠️ Requiere Atención</option>
            <option value="PAUSED">⏸️ Pausados</option>
          </select>
        </div>

        {/* Selector de Modo de Vista */}
        <div className="flex items-center gap-[6px] border border-solid border-[var(--border-color)] p-[3px] rounded-[var(--radius-sm)] bg-[#f8fafc]">
          <button
            className={`py-[5px] px-[10px] rounded-[var(--radius-sm)] text-[12px] font-[600] flex items-center gap-[5px] transition-all ${
              viewMode === "grid"
                ? "bg-[#ffffff] text-[#0b1c30] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            onClick={() => setViewMode("grid")}
            title="Vista en Tarjetas"
            id="btn-vista-grid"
          >
            <Layers size={14} />
            <span>Tarjetas</span>
          </button>
          <button
            className={`py-[5px] px-[10px] rounded-[var(--radius-sm)] text-[12px] font-[600] flex items-center gap-[5px] transition-all ${
              viewMode === "table"
                ? "bg-[#ffffff] text-[#0b1c30] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
            onClick={() => setViewMode("table")}
            title="Vista en Tabla"
            id="btn-vista-table"
          >
            <FileSpreadsheet size={14} />
            <span>Tabla</span>
          </button>
        </div>
      </div>

      {/* Resultados: Vista Cuadrícula (Grid) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[18px]">
          {filteredSuppliers.map((provider) => {
            const isOnline = provider.status === "ONLINE";
            const isScanning = provider.status === "SCANNING";
            const isAuthReq = provider.status === "AUTH_REQUIRED";
            const isPaused = provider.status === "PAUSED";

            return (
              <div
                key={provider.id}
                className={`card p-[20px] flex flex-col justify-between transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[var(--shadow-md)] ${
                  isScanning ? "border-[#93c5fd] bg-[#f8fbff]" : ""
                } ${isAuthReq ? "border-[#fed7aa] bg-[#fffaf5]" : ""}`}
                id={`card-proveedor-rpa-${provider.id}`}
              >
                <div>
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-start justify-between gap-[10px] mb-[12px]">
                    <div className="flex items-center gap-[10px]">
                      <div className="w-[40px] h-[40px] rounded-[var(--radius-md)] bg-[#f1f5f9] border border-solid border-[var(--border-color)] flex items-center justify-center text-[18px] shrink-0">
                        {provider.countryFlag}
                      </div>
                      <div>
                        <h3 className="text-[15px] font-[700] text-[var(--text-primary)] leading-[1.3] flex items-center gap-[6px]">
                          {provider.name}
                        </h3>
                        <span className="text-[12px] text-[var(--text-secondary)] font-[500]">
                          {provider.category}
                        </span>
                      </div>
                    </div>

                    {/* Badge de Estado RPA */}
                    <span
                      className={`inline-flex items-center gap-[5px] text-[11px] font-[700] py-[3px] px-[8px] rounded-[var(--radius-pill)] shrink-0 ${
                        isOnline
                          ? "bg-[#dcfce7] text-[#15803d]"
                          : isScanning
                          ? "bg-[#dbeafe] text-[#1d4ed8] animate-pulse"
                          : isAuthReq
                          ? "bg-[#ffedd5] text-[#c2410c]"
                          : "bg-[#f1f5f9] text-[#64748b]"
                      }`}
                    >
                      <span
                        className={`w-[6px] h-[6px] rounded-full ${
                          isOnline
                            ? "bg-[#16a34a]"
                            : isScanning
                            ? "bg-[#2563eb]"
                            : isAuthReq
                            ? "bg-[#ea580c]"
                            : "bg-[#94a3b8]"
                        }`}
                      />
                      {isScanning ? "Rastreando..." : provider.statusLabel}
                    </span>
                  </div>

                  {/* Detalles Técnicos de Integración */}
                  <div className="bg-[#f8fafc] border border-solid border-[var(--border-color)] rounded-[var(--radius-md)] p-[12px] mb-[14px] flex flex-col gap-[8px]">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[var(--text-secondary)] flex items-center gap-[5px]">
                        <Bot size={13} className="text-[#3b82f6]" />
                        Tipo de Bot:
                      </span>
                      <span className="font-[600] text-[var(--text-primary)] truncate max-w-[180px]">
                        {provider.integrationType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[var(--text-secondary)] flex items-center gap-[5px]">
                        <Clock size={13} className="text-[#64748b]" />
                        Última Búsqueda:
                      </span>
                      <span className="font-[600] text-[var(--text-primary)]">
                        {provider.lastSync}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[var(--text-secondary)] flex items-center gap-[5px]">
                        <Zap size={13} className="text-[#f59e0b]" />
                        Último Hallazgo:
                      </span>
                      <span className="font-[700] text-[#059669]">
                        {provider.lastPriceFound}
                      </span>
                    </div>
                  </div>

                  {/* Métricas Numéricas */}
                  <div className="grid grid-cols-3 gap-[8px] py-[10px] border-t border-b border-solid border-[var(--border-color)] mb-[16px] text-center">
                    <div>
                      <div className="text-[16px] font-[800] text-[var(--text-primary)]">
                        {provider.skusMonitored}
                      </div>
                      <div className="text-[10.5px] uppercase font-[600] text-[var(--text-secondary)]">
                        SKUs
                      </div>
                    </div>
                    <div>
                      <div className="text-[16px] font-[800] text-[#10b981]">
                        {provider.reliability}%
                      </div>
                      <div className="text-[10.5px] uppercase font-[600] text-[var(--text-secondary)]">
                        Fiabilidad
                      </div>
                    </div>
                    <div>
                      <div className="text-[16px] font-[800] text-[#2563eb]">
                        {provider.avgResponseTime}
                      </div>
                      <div className="text-[10.5px] uppercase font-[600] text-[var(--text-secondary)]">
                        Latencia
                      </div>
                    </div>
                  </div>

                  {/* Etiquetas de búsquedas recientes del bot */}
                  <div className="mb-[16px]">
                    <div className="text-[11px] font-[600] text-[var(--text-secondary)] mb-[6px] uppercase tracking-[0.03em]">
                      Consultas RPA Frecuentes:
                    </div>
                    <div className="flex flex-wrap gap-[5px]">
                      {provider.searchQueryHistory.map((query, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-[#eff6ff] text-[#1d4ed8] font-[500] py-[2px] px-[8px] rounded-[var(--radius-sm)] border border-[#dbeafe]"
                        >
                          {query}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones de la Tarjeta */}
                <div className="flex items-center justify-between gap-[8px] pt-[8px] border-t border-solid border-[var(--border-color)]">
                  <div className="flex items-center gap-[6px]">
                    <button
                      className="p-[8px] rounded-[var(--radius-sm)] border border-solid border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#f1f5f9] transition-all"
                      title="Ver configuración del Bot RPA"
                      onClick={() => setSelectedSupplierForConfig(provider)}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      className={`p-[8px] rounded-[var(--radius-sm)] border border-solid transition-all ${
                        provider.autoOrderEnabled
                          ? "border-[#bbf7d0] text-[#16a34a] hover:bg-[#f0fdf4]"
                          : "border-[#fed7aa] text-[#ea580c] hover:bg-[#fff7ed]"
                      }`}
                      title={provider.autoOrderEnabled ? "Pausar Bot" : "Activar Bot"}
                      onClick={() => handleToggleBot(provider.id)}
                    >
                      {provider.autoOrderEnabled ? <Pause size={15} /> : <Play size={15} />}
                    </button>
                  </div>

                  <button
                    className="btn btn-secondary !py-[6px] !px-[12px] !text-[12px] flex items-center gap-[6px]"
                    onClick={() => handleRunSingleRpa(provider.id)}
                    disabled={isScanning}
                  >
                    <RefreshCw size={13} className={isScanning ? "animate-spin" : ""} />
                    <span>{isScanning ? "Rastreando..." : "Rastrear Ahora"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Resultados: Vista Tabla */
        <div className="card">
          <div className="table-container">
            <table className="data-table" id="tabla-proveedores-rpa">
              <thead>
                <tr>
                  <th>PROVEEDOR & PAÍS</th>
                  <th>CATEGORÍA</th>
                  <th>TECNOLOGÍA RPA</th>
                  <th>SKUS MONITOREADOS</th>
                  <th>FIABILIDAD</th>
                  <th>ÚLTIMA CONSULTA</th>
                  <th>ESTADO BOT</th>
                  <th className="!text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center !p-[32px] !text-[#64748b]">
                      No se encontraron proveedores activos que coincidan con los filtros de búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map((provider) => {
                    const isOnline = provider.status === "ONLINE";
                    const isScanning = provider.status === "SCANNING";
                    const isAuthReq = provider.status === "AUTH_REQUIRED";

                    return (
                      <tr key={provider.id}>
                        <td>
                          <div className="flex items-center gap-[10px]">
                            <span className="text-[20px]">{provider.countryFlag}</span>
                            <div>
                              <div className="font-[700] text-[var(--text-primary)]">
                                {provider.name}
                              </div>
                              <div className="text-[11px] text-[var(--text-secondary)]">
                                {provider.id} • {provider.country}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-[12px] font-[500]">
                            {provider.category}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-[6px]">
                            <Bot size={14} className="text-[#2563eb]" />
                            <span className="text-[12px] font-[600] text-[var(--text-primary)]">
                              {provider.integrationType}
                            </span>
                          </div>
                          <span className="text-[10px] text-[var(--text-secondary)]">
                            {provider.botVersion}
                          </span>
                        </td>
                        <td className="font-[700] text-[var(--text-primary)]">
                          {provider.skusMonitored.toLocaleString()} SKUs
                        </td>
                        <td>
                          <div className="flex items-center gap-[6px]">
                            <span className="font-[700] text-[#10b981]">
                              {provider.reliability}%
                            </span>
                            <span className="text-[11px] text-[var(--text-secondary)]">
                              ({provider.avgResponseTime})
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="text-[12px] font-[500] text-[var(--text-secondary)]">
                            {provider.lastSync}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`inline-flex items-center gap-[5px] text-[11px] font-[700] py-[3px] px-[8px] rounded-[var(--radius-pill)] ${
                              isOnline
                                ? "bg-[#dcfce7] text-[#15803d]"
                                : isScanning
                                ? "bg-[#dbeafe] text-[#1d4ed8]"
                                : isAuthReq
                                ? "bg-[#ffedd5] text-[#c2410c]"
                                : "bg-[#f1f5f9] text-[#64748b]"
                            }`}
                          >
                            <span
                              className={`w-[6px] h-[6px] rounded-full ${
                                isOnline
                                  ? "bg-[#16a34a]"
                                  : isScanning
                                  ? "bg-[#2563eb] animate-pulse"
                                  : isAuthReq
                                  ? "bg-[#ea580c]"
                                  : "bg-[#94a3b8]"
                              }`}
                            />
                            {provider.statusLabel}
                          </span>
                        </td>
                        <td className="!text-right">
                          <div className="inline-flex items-center gap-[6px]">
                            <button
                              className="btn btn-secondary !py-[5px] !px-[10px] !text-[11px]"
                              onClick={() => setSelectedSupplierForConfig(provider)}
                              title="Configuración"
                            >
                              <Eye size={13} />
                              <span>Detalle</span>
                            </button>
                            <button
                              className="btn btn-primary !py-[5px] !px-[10px] !text-[11px]"
                              onClick={() => handleRunSingleRpa(provider.id)}
                              disabled={isScanning}
                              title="Ejecutar Bot RPA"
                            >
                              <RefreshCw size={13} className={isScanning ? "animate-spin" : ""} />
                              <span>Rastrear</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Test de Consulta / Cotización RPA en Vivo */}
      {testSearchModalOpen && (
        <div className="modal-overlay flex items-center justify-center p-[16px] z-[200]">
          <div className="modal-container w-full max-w-[620px] bg-[var(--bg-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-solid border-[var(--border-color)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="modal-header p-[20px] border-b border-solid border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <div className="w-[36px] h-[36px] rounded-[var(--radius-md)] bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-[17px] font-[800] text-[var(--text-primary)]">
                    Simulador de Cotización RPA
                  </h2>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    Prueba en tiempo real cómo los bots consultan precios en los proveedores activos
                  </p>
                </div>
              </div>
              <button
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-[4px]"
                onClick={() => setTestSearchModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-[20px]">
              <form onSubmit={handleSimulateTestSearch} className="flex gap-[10px] mb-[20px]">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-[12px] top-[50%] -translate-y-1/2 text-[var(--text-secondary)]"
                  />
                  <input
                    type="text"
                    className="input pl-[36px] w-full"
                    placeholder="Escriba un producto o SKU (ej. Microcontrolador, Sensor, Relé)..."
                    value={testProductQuery}
                    onChange={(e) => setTestProductQuery(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={testSearching}
                >
                  <RefreshCw size={14} className={testSearching ? "animate-spin" : ""} />
                  <span>{testSearching ? "Consultando..." : "Cotizar con Bots RPA"}</span>
                </button>
              </form>

              {testSearching && (
                <div className="text-center py-[28px] border border-dashed border-[var(--border-color)] rounded-[var(--radius-md)] bg-[#f8fafc]">
                  <RefreshCw size={28} className="animate-spin text-[#2563eb] mx-auto mb-[10px]" />
                  <p className="text-[13px] font-[600] text-[var(--text-primary)]">
                    Enviando agentes RPA a las plataformas de proveedores...
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-[4px]">
                    Extrayendo tablas de precios, stock actual y tiempos de despacho
                  </p>
                </div>
              )}

              {testResults && (
                <div className="flex flex-col gap-[12px]">
                  <div className="text-[12px] font-[700] uppercase tracking-[0.04em] text-[var(--text-secondary)]">
                    Resultados Obtenidos por los Bots RPA ({testResults.length} Ofertas)
                  </div>

                  <div className="flex flex-col gap-[8px]">
                    {testResults.map((res, i) => (
                      <div
                        key={i}
                        className={`p-[14px] rounded-[var(--radius-md)] border border-solid flex items-center justify-between gap-[12px] ${
                          res.isBestPrice
                            ? "bg-[#f0fdf4] border-[#86efac]"
                            : "bg-[#ffffff] border-[var(--border-color)]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-[6px]">
                            <span className="text-[14px] font-[700] text-[var(--text-primary)]">
                              {res.supplier}
                            </span>
                            {res.isBestPrice && (
                              <span className="text-[10px] font-[800] bg-[#16a34a] text-[#ffffff] py-[1px] px-[6px] rounded-[var(--radius-pill)]">
                                MEJOR PRECIO
                              </span>
                            )}
                          </div>
                          <div className="text-[12px] text-[var(--text-secondary)] mt-[2px]">
                            Disponibilidad: <b>{res.stockAvailable} uds</b> • Despacho: {res.deliveryTime} • Match: {res.matchConfidence}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[18px] font-[800] text-[#0f172a]">
                            {res.price}
                          </div>
                          <button
                            className="text-[11px] font-[700] text-[#2563eb] hover:underline flex items-center gap-[3px] ml-auto mt-[2px]"
                            onClick={() => {
                              toast.success(`Pre-orden generada con ${res.supplier} a ${res.price}.`);
                              setTestSearchModalOpen(false);
                            }}
                          >
                            <span>Elegir Proveedor</span>
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer p-[14px] bg-[#f8fafc] border-t border-solid border-[var(--border-color)] flex justify-end">
              <button
                className="btn btn-secondary"
                onClick={() => setTestSearchModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Parámetros Técnicos y Configuración del Bot RPA */}
      {selectedSupplierForConfig && (
        <div className="modal-overlay flex items-center justify-center p-[16px] z-[200]">
          <div className="modal-container w-full max-w-[580px] bg-[var(--bg-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-solid border-[var(--border-color)] overflow-hidden">
            <div className="modal-header p-[20px] border-b border-solid border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <div className="w-[36px] h-[36px] rounded-[var(--radius-md)] bg-[#f1f5f9] flex items-center justify-center text-[20px]">
                  {selectedSupplierForConfig.countryFlag}
                </div>
                <div>
                  <h2 className="text-[16px] font-[800] text-[var(--text-primary)]">
                    Parámetros RPA: {selectedSupplierForConfig.name}
                  </h2>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    Configuración de extracción y telemetría del Bot
                  </p>
                </div>
              </div>
              <button
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-[4px]"
                onClick={() => setSelectedSupplierForConfig(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-[20px] flex flex-col gap-[16px]">
              <div>
                <label className="text-[12px] font-[600] text-[var(--text-secondary)] uppercase">
                  URL Endpoint / Portal de Destino
                </label>
                <div className="flex items-center gap-[8px] mt-[4px]">
                  <input
                    type="text"
                    readOnly
                    value={selectedSupplierForConfig.targetUrl}
                    className="input w-full bg-[#f8fafc] text-[12.5px] font-mono text-[var(--text-secondary)]"
                  />
                  <a
                    href={selectedSupplierForConfig.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary !p-[9px]"
                    title="Visitar sitio"
                  >
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                <div>
                  <label className="text-[12px] font-[600] text-[var(--text-secondary)] uppercase">
                    Versión del Bot
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedSupplierForConfig.botVersion}
                    className="input w-full bg-[#f8fafc] mt-[4px]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-[600] text-[var(--text-secondary)] uppercase">
                    Frecuencia de Barrido
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={selectedSupplierForConfig.frequency}
                    className="input w-full bg-[#f8fafc] mt-[4px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-[600] text-[var(--text-secondary)] uppercase">
                  Estado de Autenticación / Credenciales
                </label>
                <div className="p-[10px] rounded-[var(--radius-md)] bg-[#f8fafc] border border-solid border-[var(--border-color)] mt-[4px] flex items-center justify-between">
                  <span className="text-[13px] font-[600] text-[var(--text-primary)] flex items-center gap-[6px]">
                    <ShieldCheck size={16} className="text-[#10b981]" />
                    {selectedSupplierForConfig.activeCredentials}
                  </span>
                  <span className="text-[11px] font-[700] text-[#15803d] bg-[#dcfce7] py-[2px] px-[8px] rounded-[var(--radius-pill)]">
                    Válido
                  </span>
                </div>
              </div>

              <div className="p-[14px] rounded-[var(--radius-md)] bg-[#eff6ff] border border-solid border-[#bfdbfe] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-[700] text-[#1e40af]">
                    Reorden Automático Zero-Touch
                  </div>
                  <div className="text-[11.5px] text-[#3b82f6]">
                    Permitir que el motor RPA emita órdenes cuando el stock sea crítico.
                  </div>
                </div>
                <button
                  className={`btn !py-[6px] !px-[12px] !text-[12px] ${
                    selectedSupplierForConfig.autoOrderEnabled ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() => {
                    handleToggleBot(selectedSupplierForConfig.id);
                    setSelectedSupplierForConfig((prev) => ({
                      ...prev,
                      autoOrderEnabled: !prev.autoOrderEnabled,
                    }));
                  }}
                >
                  {selectedSupplierForConfig.autoOrderEnabled ? "Activado" : "Desactivado"}
                </button>
              </div>
            </div>

            <div className="modal-footer p-[14px] bg-[#f8fafc] border-t border-solid border-[var(--border-color)] flex justify-between items-center">
              <button
                className="btn btn-secondary text-[#dc2626] hover:bg-[#fee2e2]"
                onClick={() => {
                  toast.success(`Caché y cookies de ${selectedSupplierForConfig.name} depuradas.`);
                  setSelectedSupplierForConfig(null);
                }}
              >
                Limpiar Cookies RPA
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setSelectedSupplierForConfig(null)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
