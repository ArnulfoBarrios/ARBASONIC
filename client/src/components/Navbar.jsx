import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  User,
  Sun,
  Moon,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CheckCheck,
  Calendar,
  ArrowRight,
  Menu
} from 'lucide-react';

const TAB_TITLES = {
  inicio: { title: 'Panel Principal', subtitle: 'Resumen general de actividad del taller' },
  inventario: { title: 'Órdenes de Servicio', subtitle: 'Recepción, diagnóstico y seguimiento de equipos' },
  repuestos: { title: 'Repuestos & Stock', subtitle: 'Control de tarjetas electrónicas y componentes' },
  herramientas: { title: 'Herramientas y Préstamos', subtitle: 'Instrumental del taller y devoluciones' },
  catalogos: { title: 'Catálogos del Sistema', subtitle: 'Marcas, tipos de aparato, accesorios y fallas' },
  reportes: { title: 'Reportes y Estadísticas', subtitle: 'Indicadores financieros, exportación y respaldos' }
};

export default function Navbar({
  activeTab = 'inicio',
  notifications = [],
  onNotificationClick,
  onGoToReports,
  onOpenMobileMenu,
  isDarkMode,
  onToggleTheme
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('arbasonic_read_notifs') || '[]');
    } catch {
      return [];
    }
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const persistRead = (next) => {
    setReadIds(next);
    try {
      localStorage.setItem('arbasonic_read_notifs', JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const handleMarkAllRead = () => {
    persistRead(notifications.map((n) => n.id));
  };

  const handleItemClick = (item) => {
    if (!readIds.includes(item.id)) {
      persistRead([...readIds, item.id]);
    }
    setNotifOpen(false);
    if (onNotificationClick) onNotificationClick(item);
  };

  const getNotifIcon = (tipo) => {
    switch (tipo) {
      case 'prestamo_retrasado':
        return { Icon: ShieldAlert, cls: isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600' };
      case 'stock_bajo':
        return { Icon: AlertTriangle, cls: isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600' };
      case 'listo_entrega':
        return { Icon: CheckCircle2, cls: isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600' };
      default:
        return { Icon: Clock, cls: isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600' };
    }
  };

  const tabInfo = TAB_TITLES[activeTab] || TAB_TITLES.inicio;
  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className={`px-3.5 sm:px-6 md:px-8 py-3 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200 ${
      isDarkMode
        ? 'bg-[#071738]/95 backdrop-blur-md border-b border-[#142854] text-white'
        : 'bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-sm'
    }`}>
      {/* Left: Hamburger (Mobile/Tablet) + Section Title & Date */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menú de navegación"
          className={`lg:hidden p-2 rounded-xl transition-colors shrink-0 ${
            isDarkMode
              ? 'bg-[#102452] text-cyan-300 hover:bg-[#16306e]'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className={`text-sm sm:text-base font-extrabold tracking-tight truncate ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {tabInfo.title}
            </h2>
            <span className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize shrink-0 ${
              isDarkMode
                ? 'bg-[#102452] text-cyan-300 border border-[#1d3975]'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <Calendar className="w-3 h-3 text-cyan-500" />
              {formattedDate}
            </span>
          </div>
          <p className={`text-[11px] truncate hidden sm:block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {tabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls: Theme Switcher, Live Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3.5 ml-2 shrink-0">
        {/* Modo Claro / Oscuro Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          className={`p-2 rounded-xl transition-all flex items-center justify-center ${
            isDarkMode
              ? 'bg-[#102452] text-amber-300 hover:bg-[#16306e]'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-cyan-600'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Functional Notifications Center */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            title="Notificaciones y alertas del taller"
            className={`relative p-2 rounded-xl transition-colors ${
              notifOpen
                ? isDarkMode
                  ? 'bg-[#16306e] text-cyan-300'
                  : 'bg-sky-50 text-sky-600'
                : isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-[#102452]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-md">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel (Full-width centered on mobile, right-aligned dropdown on sm+) */}
          {notifOpen && (
            <div className={`fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 rounded-2xl border overflow-hidden z-50 ${
              isDarkMode
                ? 'bg-[#0b152a] border-cyan-500/40 shadow-2xl text-white'
                : 'bg-white border-slate-200 shadow-2xl text-slate-800'
            }`}>
              <div className={`px-4 py-3 border-b flex items-center justify-between ${
                isDarkMode ? 'border-[#1b2f57] bg-[#0e1b36]' : 'border-slate-100 bg-slate-50'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold">Alertas del Taller</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    unreadCount > 0
                      ? 'bg-red-500/20 text-red-500'
                      : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {unreadCount} nuevas
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-500 hover:text-cyan-400"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Marcar leídas</span>
                  </button>
                )}
              </div>

              <div className={`max-h-[65vh] sm:max-h-80 overflow-y-auto divide-y ${
                isDarkMode ? 'divide-[#152445]' : 'divide-slate-100'
              }`}>
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-bold">¡Todo al día!</p>
                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      No hay alertas ni pendientes críticos en este momento.
                    </p>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const { Icon, cls } = getNotifIcon(item.tipo);
                    const isUnread = !readIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                          isUnread
                            ? isDarkMode
                              ? 'bg-[#102042]/70 hover:bg-[#142954]'
                              : 'bg-sky-50/60 hover:bg-sky-50'
                            : isDarkMode
                              ? 'hover:bg-[#111f3c]'
                              : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 ${cls}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold truncate">{item.titulo}</p>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                            )}
                          </div>
                          <p className={`text-[11px] mt-0.5 line-clamp-2 ${
                            isDarkMode ? 'text-slate-300' : 'text-slate-600'
                          }`}>
                            {item.mensaje}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className={`px-4 py-2.5 border-t ${
                isDarkMode ? 'border-[#1b2f57] bg-[#091224]' : 'border-slate-100 bg-slate-50'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    if (onGoToReports) onGoToReports();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-cyan-500 hover:text-cyan-400"
                >
                  <span>Ver reporte completo de alertas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={`hidden sm:block h-7 w-[1px] ${isDarkMode ? 'bg-[#142854]' : 'bg-slate-200'}`} />

        {/* User Profile */}
        <div className="flex items-center gap-2.5 p-0.5 sm:p-1 rounded-xl">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#00c6ff] to-[#0072ff] flex items-center justify-center text-white font-bold shadow-md shadow-cyan-900/20">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-left hidden md:block">
            <p className={`text-xs font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Arnulfo Barrios
            </p>
            <p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Administrador
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
