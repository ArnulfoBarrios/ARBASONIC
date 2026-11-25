import React from 'react';
import {
  Home,
  Package,
  PlusCircle,
  Cpu,
  Wrench,
  BarChart2,
  Database,
  Headphones,
  ChevronRight,
  ArrowRight,
  X
} from 'lucide-react';
import logoEmblem from '../assets/logo-emblem.png';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenRegister,
  mobileOpen = false,
  onCloseMobile
}) {
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'inventario', label: 'Órdenes de Servicio', icon: Package },
    { id: 'repuestos', label: 'Repuestos & Stock', icon: Cpu },
    { id: 'herramientas', label: 'Herramientas', icon: Wrench },
    { id: 'registrar', label: 'Registrar Orden', icon: PlusCircle, action: onOpenRegister },
    { id: 'catalogos', label: 'Catálogos', icon: Database },
    { id: 'reportes', label: 'Reportes', icon: BarChart2 },
  ];

  const handleSelect = (item) => {
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Backdrop oscuro en móvil y tablet cuando el drawer está abierto */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] lg:w-64 lg:sticky lg:top-0 lg:z-30 h-screen bg-[#071738] border-r border-[#132854] flex flex-col justify-between shrink-0 select-none overflow-hidden shadow-2xl transition-transform duration-250 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* CIRCUITO TECNOLÓGICO DE FONDO */}
        <svg
          className="absolute bottom-0 left-0 w-full h-80 pointer-events-none opacity-40 z-0 overflow-visible"
          viewBox="0 0 256 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="#00d2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
            <path d="M-10 260 L 40 260 L 80 220 L 130 220 L 160 190 L 160 140 L 190 110 L 270 110" />
            <path d="M-10 290 L 60 290 L 110 240 L 170 240 L 210 200 L 270 200" />
            <path d="M20 320 L 20 280 L 50 250 L 50 200 L 90 160 L 90 120 L 120 90 L 180 90" />
            <path d="M100 320 L 140 280 L 140 250 L 180 210 L 230 210 L 250 190" />
            <path d="M-10 180 L 30 180 L 60 150 L 60 110 L 80 90 L 140 90" />
          </g>
          <g fill="#00d2ff" filter="drop-shadow(0 0 4px #00d2ff)">
            <circle cx="80" cy="220" r="3" />
            <circle cx="130" cy="220" r="3" />
            <circle cx="160" cy="190" r="3" />
            <circle cx="190" cy="110" r="3.5" />
            <circle cx="60" cy="290" r="3" />
            <circle cx="110" cy="240" r="3" />
            <circle cx="210" cy="200" r="3.5" />
            <circle cx="50" cy="250" r="3" />
            <circle cx="90" cy="160" r="3" />
            <circle cx="120" cy="90" r="3.5" />
            <circle cx="140" cy="250" r="3" />
            <circle cx="180" cy="210" r="3" />
            <circle cx="60" cy="150" r="3" />
          </g>
        </svg>

        {/* Top Branding Section */}
        <div className="relative z-10 px-5 pt-5 pb-4 flex flex-col items-center text-center border-b border-[#142959]/80 shrink-0">
          {/* Botón cerrar en móvil / tablet */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Cerrar menú"
            className="lg:hidden absolute top-3.5 right-3.5 p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="h-12 sm:h-14 flex items-center justify-center mb-2">
            <img
              src={logoEmblem}
              alt="ARBASONIC"
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,210,255,0.45)]"
            />
          </div>
          <h1 className="font-black text-lg tracking-wider text-white uppercase leading-tight">
            ARBASONIC
          </h1>
          <p className="text-[11px] font-semibold text-cyan-400 tracking-wider mt-0.5">
            Reparación Electrónica
          </p>
        </div>

        {/* Scrollable Navigation Menu (nunca se corta en pantallas bajas) */}
        <nav className="relative z-10 flex-1 overflow-y-auto p-3.5 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white shadow-lg shadow-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#102452]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                  }`} />
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                </div>
                {item.hasChevron && (
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Help Card */}
        <div className="p-3.5 relative z-10 shrink-0">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e214d]/90 to-[#091738]/90 border border-cyan-500/40 p-3.5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner shrink-0">
                <Headphones className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">¿Necesitas ayuda?</p>
                <p className="text-[11px] text-slate-300 truncate">Contáctanos</p>
              </div>
            </div>
            <a
              href="https://wa.me/573007039741?text=Hola%20ARBASONIC,%20necesito%20soporte"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:brightness-110 transition-all shadow-md shadow-cyan-900/40"
            >
              <span>Soporte en línea</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
