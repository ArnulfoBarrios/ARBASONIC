import React from 'react';
import { 
  Home, 
  Package, 
  PlusCircle, 
  Cpu, 
  Wrench, 
  Clock, 
  BarChart2, 
  Database, 
  Settings, 
  HelpCircle, 
  Headphones, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import logoEmblem from '../assets/logo-emblem.png';

export default function Sidebar({ activeTab, setActiveTab, onOpenRegister }) {
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'inventario', label: 'Órdenes de Servicio', icon: Package },
    { id: 'repuestos', label: 'Repuestos & Stock', icon: Cpu },
    { id: 'herramientas', label: 'Herramientas', icon: Wrench },
    { id: 'registrar', label: 'Registrar Orden', icon: PlusCircle, action: onOpenRegister },
    { id: 'catalogos', label: 'Catálogos', icon: Database },
    { id: 'reportes', label: 'Reportes', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 bg-[#071738] border-r border-[#132854] flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30 select-none overflow-hidden relative shadow-2xl">
      
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
      <div className="relative z-10">
        <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center border-b border-[#142959]/80">
          <div className="h-14 flex items-center justify-center mb-2.5">
            <img
              src={logoEmblem}
              alt="ARBASONIC"
              className="h-14 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,210,255,0.45)]"
            />
          </div>
          <h1 className="font-black text-lg tracking-wider text-white uppercase leading-tight">
            ARBASONIC
          </h1>
          <p className="text-[11px] font-semibold text-cyan-400 tracking-wider mt-0.5">
            Reparación Electrónica
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3.5 space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
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
      </div>

      {/* Bottom Help Card */}
      <div className="p-4 relative z-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e214d]/90 to-[#091738]/90 border border-cyan-500/40 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <Headphones className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">¿Necesitas ayuda?</p>
              <p className="text-[11px] text-slate-300">Contáctanos</p>
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
  );
}
