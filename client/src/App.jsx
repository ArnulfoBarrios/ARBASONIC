import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import WelcomeBanner from './components/WelcomeBanner';
import KpiCards from './components/KpiCards';
import ChartsSection from './components/ChartsSection';
import InventoryTable from './components/InventoryTable';
import Footer from './components/Footer';
import RegisterModal from './components/RegisterModal';
import TicketModal from './components/TicketModal';
import RepuestosView from './components/RepuestosView';
import HerramientasView from './components/HerramientasView';
import CatalogosView from './components/CatalogosView';
import ReportesView from './components/ReportesView';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('arbasonic_theme');
    return saved ? saved === 'dark' : false;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('arbasonic_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const [activeTab, setActiveTab] = useState('inicio');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCliente, setFilterCliente] = useState('');
  const [filterCedula, setFilterCedula] = useState('');
  const [filterTipo, setFilterTipo] = useState('Todos los Tipos');
  const [filterMarca, setFilterMarca] = useState('Todas las Marcas');
  const [filterModelo, setFilterModelo] = useState('');
  const [filterAccesorios, setFilterAccesorios] = useState('Todos los Accesorios');
  const [filterDano, setFilterDano] = useState('Todos los Daños');
  const [filterEstado, setFilterEstado] = useState('Todos los Estados');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [equipos, setEquipos] = useState([]);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [catalogos, setCatalogos] = useState({ marcas: [], tipos: [], accesorios: [], danos: [] });
  const [loading, setLoading] = useState(true);

  // Modal & Drawer States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedEquipoForEdit, setSelectedEquipoForEdit] = useState(null);
  const [selectedEquipoForView, setSelectedEquipoForView] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fetch Catalogs
  const loadCatalogos = async () => {
    try {
      const res = await fetch('/api/catalogos');
      const data = await res.json();
      if (data.success) {
        setCatalogos(data.data);
      }
    } catch (err) {
      console.error('Error cargando catálogos:', err);
    }
  };

  // Fetch Stats
  const loadStats = async () => {
    try {
      const res = await fetch('/api/estadisticas');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  // Fetch Live Notifications
  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/estadisticas/notificaciones');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    }
  };

  // Fetch Equipos with filters
  const loadEquipos = async () => {
    try {
      const params = new URLSearchParams();
      if (filterSearch) params.append('search', filterSearch);
      if (filterCliente) params.append('cliente', filterCliente);
      if (filterCedula) params.append('cedula', filterCedula);
      if (filterTipo && filterTipo !== 'Todos los Tipos') params.append('tipo_equipo', filterTipo);
      if (filterMarca && filterMarca !== 'Todas las Marcas') params.append('marca', filterMarca);
      if (filterModelo) params.append('modelo', filterModelo);
      if (filterAccesorios && filterAccesorios !== 'Todos los Accesorios') params.append('accesorios', filterAccesorios);
      if (filterDano && filterDano !== 'Todos los Daños') params.append('dano', filterDano);
      if (filterEstado && filterEstado !== 'Todos los Estados') params.append('estado', filterEstado);
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);

      const res = await fetch(`/api/equipos?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEquipos(data.data);
      }
    } catch (err) {
      console.error('Error cargando equipos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogos();
    loadStats();
    loadNotifications();
    loadEquipos();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEquipos();
    }, 200);
    return () => clearTimeout(timer);
  }, [
    filterSearch,
    filterCliente,
    filterCedula,
    filterTipo,
    filterMarca,
    filterModelo,
    filterAccesorios,
    filterDano,
    filterEstado,
    fechaDesde,
    fechaHasta
  ]);

  const handleResetFilters = () => {
    setFilterSearch('');
    setFilterCliente('');
    setFilterCedula('');
    setFilterTipo('Todos los Tipos');
    setFilterMarca('Todas las Marcas');
    setFilterModelo('');
    setFilterAccesorios('Todos los Accesorios');
    setFilterDano('Todos los Daños');
    setFilterEstado('Todos los Estados');
    setFechaDesde('');
    setFechaHasta('');
  };

  const handleNotificationClick = async (item) => {
    if (item.equipoId) {
      try {
        const res = await fetch(`/api/equipos/${item.equipoId}`);
        const data = await res.json();
        if (data.success && data.data) {
          if (item.action === 'view') {
            setSelectedEquipoForView(data.data);
          } else {
            setSelectedEquipoForEdit(data.data);
            setRegisterModalOpen(true);
          }
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (item.targetTab) {
      setActiveTab(item.targetTab);
    }
  };

  const handleDeleteEquipo = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este registro de equipo de la base de datos?')) {
      return;
    }
    try {
      const res = await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Equipo eliminado exitosamente.');
        loadEquipos();
        loadStats();
        loadNotifications();
      } else {
        alert(data.message || 'Error al eliminar el equipo');
      }
    } catch (err) {
      console.error('Error eliminando equipo:', err);
    }
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-[#071124] text-slate-100' : 'bg-[#f0f4f9] text-slate-800'
    }`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 px-4 py-3 rounded-xl bg-[#00c6ff] text-slate-950 font-bold text-xs shadow-2xl backdrop-blur-md flex items-center justify-center sm:justify-start gap-2 animate-in slide-in-from-bottom-5">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Sidebar (Drawer en móvil/tablet, fijo en desktop) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenRegister={() => {
          setSelectedEquipoForEdit(null);
          setRegisterModalOpen(true);
        }}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 2. Top Navbar */}
        <Navbar
          activeTab={activeTab}
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onGoToReports={() => setActiveTab('reportes')}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />

        {/* 3. Main Views Container */}
        <main className="p-3.5 sm:p-6 md:p-8 flex-1 max-w-[1600px] w-full mx-auto">
          
          {/* TAB: INICIO (Dashboard Principal) */}
          {activeTab === 'inicio' && (
            <>
              <WelcomeBanner />
              <KpiCards stats={stats?.kpis} isDarkMode={isDarkMode} />
              <ChartsSection
                stats={stats}
                onOpenRegister={() => {
                  setSelectedEquipoForEdit(null);
                  setRegisterModalOpen(true);
                }}
                onFocusSearch={() => {
                  const el = document.querySelector('input[placeholder="Búsqueda rápida..."]');
                  if (el) el.focus();
                }}
                onOpenCatalogs={() => setActiveTab('catalogos')}
                onOpenReports={() => setActiveTab('reportes')}
                isDarkMode={isDarkMode}
              />
              <InventoryTable
                equipos={equipos}
                marcas={catalogos.marcas}
                tipos={catalogos.tipos}
                accesorios={catalogos.accesorios}
                danos={catalogos.danos}
                filterSearch={filterSearch}
                setFilterSearch={setFilterSearch}
                filterCliente={filterCliente}
                setFilterCliente={setFilterCliente}
                filterCedula={filterCedula}
                setFilterCedula={setFilterCedula}
                filterTipo={filterTipo}
                setFilterTipo={setFilterTipo}
                filterMarca={filterMarca}
                setFilterMarca={setFilterMarca}
                filterModelo={filterModelo}
                setFilterModelo={setFilterModelo}
                filterAccesorios={filterAccesorios}
                setFilterAccesorios={setFilterAccesorios}
                filterDano={filterDano}
                setFilterDano={setFilterDano}
                filterEstado={filterEstado}
                setFilterEstado={setFilterEstado}
                fechaDesde={fechaDesde}
                setFechaDesde={setFechaDesde}
                fechaHasta={fechaHasta}
                setFechaHasta={setFechaHasta}
                onResetFilters={handleResetFilters}
                onApplyFilters={loadEquipos}
                onViewEquipo={(item) => setSelectedEquipoForView(item)}
                onEditEquipo={(item) => {
                  setSelectedEquipoForEdit(item);
                  setRegisterModalOpen(true);
                }}
                onDeleteEquipo={handleDeleteEquipo}
                defaultShowAdvanced={false}
                isDarkMode={isDarkMode}
              />
            </>
          )}

          {/* TAB: INVENTARIO / ÓRDENES DE SERVICIO */}
          {activeTab === 'inventario' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">Órdenes de Servicio y Recepción</h2>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Control detallado y filtrado por todos los parámetros de los aparatos ingresados al taller.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedEquipoForEdit(null);
                    setRegisterModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white font-bold text-xs shadow-md"
                >
                  + Nueva Orden de Servicio
                </button>
              </div>

              <InventoryTable
                equipos={equipos}
                marcas={catalogos.marcas}
                tipos={catalogos.tipos}
                accesorios={catalogos.accesorios}
                danos={catalogos.danos}
                filterSearch={filterSearch}
                setFilterSearch={setFilterSearch}
                filterCliente={filterCliente}
                setFilterCliente={setFilterCliente}
                filterCedula={filterCedula}
                setFilterCedula={setFilterCedula}
                filterTipo={filterTipo}
                setFilterTipo={setFilterTipo}
                filterMarca={filterMarca}
                setFilterMarca={setFilterMarca}
                filterModelo={filterModelo}
                setFilterModelo={setFilterModelo}
                filterAccesorios={filterAccesorios}
                setFilterAccesorios={setFilterAccesorios}
                filterDano={filterDano}
                setFilterDano={setFilterDano}
                filterEstado={filterEstado}
                setFilterEstado={setFilterEstado}
                fechaDesde={fechaDesde}
                setFechaDesde={setFechaDesde}
                fechaHasta={fechaHasta}
                setFechaHasta={setFechaHasta}
                onResetFilters={handleResetFilters}
                onApplyFilters={loadEquipos}
                onViewEquipo={(item) => setSelectedEquipoForView(item)}
                onEditEquipo={(item) => {
                  setSelectedEquipoForEdit(item);
                  setRegisterModalOpen(true);
                }}
                onDeleteEquipo={handleDeleteEquipo}
                defaultShowAdvanced={true}
                isDarkMode={isDarkMode}
              />
            </div>
          )}

          {/* TAB: REPUESTOS */}
          {activeTab === 'repuestos' && (
            <RepuestosView isDarkMode={isDarkMode} />
          )}

          {/* TAB: HERRAMIENTAS & PRÉSTAMOS */}
          {activeTab === 'herramientas' && (
            <HerramientasView isDarkMode={isDarkMode} />
          )}

          {/* TAB: CATÁLOGOS */}
          {activeTab === 'catalogos' && (
            <CatalogosView
              isDarkMode={isDarkMode}
              onCatalogsChanged={() => {
                loadCatalogos();
                loadEquipos();
              }}
            />
          )}

          {/* TAB: REPORTES */}
          {activeTab === 'reportes' && (
            <ReportesView isDarkMode={isDarkMode} />
          )}

          {/* Footer */}
          <Footer isDarkMode={isDarkMode} />
        </main>
      </div>

      {/* Register / Edit Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => {
          setRegisterModalOpen(false);
          setSelectedEquipoForEdit(null);
        }}
        onSuccess={(msg) => {
          showToast(msg);
          loadEquipos();
          loadStats();
          loadNotifications();
          loadCatalogos();
        }}
        catalogos={catalogos}
        equipoToEdit={selectedEquipoForEdit}
      />

      {/* Technical Sheet & Printable Ticket Modal */}
      <TicketModal
        isOpen={Boolean(selectedEquipoForView)}
        onClose={() => setSelectedEquipoForView(null)}
        equipo={selectedEquipoForView}
        onEdit={(eq) => {
          setSelectedEquipoForEdit(eq);
          setRegisterModalOpen(true);
        }}
      />
    </div>
  );
}
