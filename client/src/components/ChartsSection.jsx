import React from 'react';
import { 
  PlusCircle, 
  Search, 
  FileText, 
  SlidersHorizontal, 
  ChevronDown, 
  Zap, 
  BarChart3 
} from 'lucide-react';

export default function ChartsSection({ 
  stats, 
  onOpenRegister, 
  onFocusSearch, 
  onOpenCatalogs, 
  onOpenReports,
  isDarkMode 
}) {
  const total = stats?.kpis?.totalRecibidos ?? 245;
  const entregadosPct = stats?.distribucion?.find(d => d.nombre === 'Entregados')?.porcentaje ?? 49;
  const reparacionPct = stats?.distribucion?.find(d => d.nombre === 'En Reparación')?.porcentaje ?? 32;
  const pendientesPct = stats?.distribucion?.find(d => d.nombre === 'Pendientes')?.porcentaje ?? 19;

  const points = [
    { mes: 'May', val: 50 },
    { mes: 'Jun', val: 80 },
    { mes: 'Jul', val: 92 },
    { mes: 'Ago', val: 135 },
    { mes: 'Sep', val: 110 },
    { mes: 'Oct', val: 125 }
  ];

  const cardBg = isDarkMode 
    ? 'bg-[#0c162b] border-[#1b2b4d] text-white' 
    : 'bg-white border-slate-200/90 text-slate-800 shadow-sm';

  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const borderDivider = isDarkMode ? 'border-[#182744]' : 'border-slate-100';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5 sm:mb-6">
      {/* Resumen General Card (Left 2 cols) */}
      <div className={`lg:col-span-2 rounded-2xl border p-4 sm:p-5 shadow-sm transition-colors ${cardBg}`}>
        {/* Card Header */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b ${borderDivider}`}>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-500 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold tracking-wide">Resumen General</h3>
          </div>
          <div className="relative">
            <button className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold border transition-colors ${
              isDarkMode 
                ? 'bg-[#132240] text-slate-300 border-[#21355b] hover:border-cyan-500' 
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}>
              <span>Últimos 6 meses</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content: Donut + Line Chart */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center pt-4 sm:pt-5">
          {/* Donut Chart (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="38" 
                  stroke={isDarkMode ? '#162544' : '#e2e8f0'} 
                  strokeWidth="12" 
                  fill="none" 
                />
                {/* Entregados (49%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#0284c7"
                  strokeWidth="12"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 * (1 - 0.49)}
                  strokeLinecap="round"
                  fill="none"
                />
                {/* En Reparación (32%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#00c6ff"
                  strokeWidth="12"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 * (1 - 0.32)}
                  strokeLinecap="round"
                  transform="rotate(176.4 50 50)"
                  fill="none"
                />
                {/* Pendientes (19%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#6366f1"
                  strokeWidth="12"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 * (1 - 0.19)}
                  strokeLinecap="round"
                  transform="rotate(291.6 50 50)"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{total}</span>
                <span className={`text-[10px] font-semibold tracking-wider mt-0.5 ${subTextColor}`}>Total Equipos</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex flex-col gap-1.5 mt-4 text-xs font-semibold w-full max-w-[200px]">
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                  Entregados
                </span>
                <span className="font-bold">{entregadosPct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00c6ff]" />
                  En Reparación
                </span>
                <span className="font-bold">{reparacionPct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
                  Pendientes
                </span>
                <span className="font-bold">{pendientesPct}%</span>
              </div>
            </div>
          </div>

          {/* Line/Area Chart (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-end h-52 relative pr-2">
            <div className={`absolute inset-0 flex flex-col justify-between text-[11px] pointer-events-none pb-6 ${subTextColor}`}>
              <div className={`flex items-center justify-between border-b pb-0.5 ${borderDivider}`}>
                <span>150</span>
              </div>
              <div className={`flex items-center justify-between border-b pb-0.5 ${borderDivider}`}>
                <span>100</span>
              </div>
              <div className={`flex items-center justify-between border-b pb-0.5 ${borderDivider}`}>
                <span>50</span>
              </div>
              <div className={`flex items-center justify-between border-b pb-0.5 ${borderDivider}`}>
                <span>0</span>
              </div>
            </div>

            <svg className="w-full h-36 relative z-10 overflow-visible" viewBox="0 0 320 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradientDynamic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00c6ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00c6ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 20 85 Q 70 65, 120 50 T 220 20 T 300 35 L 300 120 L 20 120 Z"
                fill="url(#areaGradientDynamic)"
              />
              <path
                d="M 20 85 Q 70 65, 120 50 T 220 20 T 300 35"
                fill="none"
                stroke="#0284c7"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {[
                { cx: 20, cy: 85 },
                { cx: 75, cy: 62 },
                { cx: 130, cy: 52 },
                { cx: 185, cy: 30 },
                { cx: 240, cy: 45 },
                { cx: 300, cy: 35 }
              ].map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="4.5"
                  fill="#00c6ff"
                  stroke={isDarkMode ? '#080d1a' : '#ffffff'}
                  strokeWidth="2.5"
                  className="hover:scale-125 transition-all cursor-pointer"
                />
              ))}
            </svg>

            <div className={`flex items-center justify-between text-xs font-semibold pt-2 pl-4 ${subTextColor}`}>
              {points.map((p, i) => (
                <span key={i}>{p.mes}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas (Right 1 col - EXACT SOLID BLUE TILES AS IN IMAGE 1) */}
      <div className={`rounded-2xl border p-4 sm:p-5 shadow-sm flex flex-col justify-between transition-colors ${cardBg}`}>
        <div className={`pb-3.5 sm:pb-4 border-b flex items-center gap-2 ${borderDivider}`}>
          <Zap className="w-5 h-5 text-cyan-500 shrink-0" />
          <h3 className="text-sm sm:text-base font-bold tracking-wide">Acciones Rápidas</h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 my-auto pt-3 sm:py-3">
          {/* Action 1: Registrar Equipo */}
          <button
            onClick={onOpenRegister}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#0091ff] to-[#0066cc] hover:from-[#00a2ff] hover:to-[#0077ee] text-white font-bold text-xs transition-all hover:scale-[1.03] shadow-md shadow-sky-500/25 group text-center"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <span>Registrar Equipo</span>
          </button>

          {/* Action 2: Buscar Equipo */}
          <button
            onClick={onFocusSearch}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#0080ff] to-[#0055bb] hover:from-[#0091ff] hover:to-[#0066cc] text-white font-bold text-xs transition-all hover:scale-[1.03] shadow-md shadow-sky-500/25 group text-center"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span>Buscar Equipo</span>
          </button>

          {/* Action 3: Ver Reportes */}
          <button
            onClick={onOpenReports}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#0070ea] to-[#004bb5] hover:from-[#0080ff] hover:to-[#0055bb] text-white font-bold text-xs transition-all hover:scale-[1.03] shadow-md shadow-sky-500/25 group text-center"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span>Ver Reportes</span>
          </button>

          {/* Action 4: Gestionar Catálogos */}
          <button
            onClick={onOpenCatalogs}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-[#0066d6] to-[#0040a0] hover:from-[#0070ea] hover:to-[#004bb5] text-white font-bold text-xs transition-all hover:scale-[1.03] shadow-md shadow-sky-500/25 group text-center"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center mb-1.5 sm:mb-2 group-hover:scale-110 transition-transform">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <span>Gestionar Catálogos</span>
          </button>
        </div>
      </div>
    </div>
  );
}
