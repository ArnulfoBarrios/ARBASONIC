import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  DollarSign,
  TrendingUp,
  Cpu,
  Wrench,
  Download,
  Printer,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Tag,
  Tv,
  ClipboardList
} from 'lucide-react';

export default function ReportesView({ isDarkMode }) {
  const [preset, setPreset] = useState('todo');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async (desde = fechaDesde, hasta = fechaHasta) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.append('fecha_desde', desde);
      if (hasta) params.append('fecha_hasta', hasta);
      const res = await fetch(`/api/reportes?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.data);
      }
    } catch (err) {
      console.error('Error cargando reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [fechaDesde, fechaHasta]);

  const applyPreset = (key) => {
    setPreset(key);
    const hoy = new Date();
    const toIso = (d) => d.toISOString().split('T')[0];

    if (key === 'todo') {
      setFechaDesde('');
      setFechaHasta('');
    } else if (key === 'mes') {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      setFechaDesde(toIso(inicioMes));
      setFechaHasta(toIso(hoy));
    } else if (key === '30d') {
      const hace30 = new Date(hoy.getTime() - 30 * 86400000);
      setFechaDesde(toIso(hace30));
      setFechaHasta(toIso(hoy));
    } else if (key === '6m') {
      const hace6m = new Date(hoy.getFullYear(), hoy.getMonth() - 6, hoy.getDate());
      setFechaDesde(toIso(hace6m));
      setFechaHasta(toIso(hoy));
    }
  };

  const handleExportCsv = (tipo) => {
    const params = new URLSearchParams();
    if (tipo === 'ordenes') {
      if (fechaDesde) params.append('fecha_desde', fechaDesde);
      if (fechaHasta) params.append('fecha_hasta', fechaHasta);
    }
    const qs = params.toString();
    window.location.href = `/api/reportes/export/${tipo}${qs ? `?${qs}` : ''}`;
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/reportes/backup';
  };

  const cardBg = isDarkMode
    ? 'bg-[#0c162b] border-[#1b2b4d] text-white'
    : 'bg-white border-slate-200/90 shadow-sm text-slate-800';
  const inputBg = isDarkMode
    ? 'bg-[#111f38] border-[#21355b] text-slate-100'
    : 'bg-[#f8fafc] border-slate-200 text-slate-900';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const divider = isDarkMode ? 'border-[#182744]' : 'border-slate-100';

  const ordenes = report?.resumenOrdenes || {};
  const inv = report?.inventario || {};
  const rankings = report?.rankings || { porMarca: [], porTipo: [], porDano: [], porEstado: [] };
  const alertas = report?.alertas || { stockBajo: [], prestamosVencidos: [] };

  const formatMoney = (v) => `$${Number(v || 0).toLocaleString('es-CO')}`;

  const RankingCard = ({ title, icon: Icon, items, barColor }) => {
    const maxVal = items.length > 0 ? Math.max(...items.map((i) => i.cantidad)) : 1;
    const totalVal = items.reduce((acc, i) => acc + i.cantidad, 0) || 1;
    return (
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className={`flex items-center gap-2 pb-3 mb-4 border-b ${divider}`}>
          <Icon className="w-4 h-4 text-cyan-500" />
          <h3 className="text-sm font-bold">{title}</h3>
        </div>
        {items.length === 0 ? (
          <p className={`text-xs py-6 text-center ${subText}`}>Sin datos para el período seleccionado.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => {
              const widthPct = Math.max(8, Math.round((item.cantidad / maxVal) * 100));
              const sharePct = Math.round((item.cantidad / totalVal) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-semibold truncate" title={item.nombre}>{item.nombre}</span>
                    <span className={`font-mono text-[11px] whitespace-nowrap ${subText}`}>
                      <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{item.cantidad}</strong> ({sharePct}%)
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#132240]' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="printable-report" className="space-y-6">
      {/* Header & Period Controls */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-cyan-500" />
            <span>Reportes y Estadísticas del Taller</span>
          </h2>
          <p className={`text-xs mt-1 ${subText}`}>
            Control financiero, análisis de marcas y fallas más frecuentes, alertas y exportación a Excel.
          </p>
        </div>

        {/* Period Filter & Print */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <div className={`inline-flex rounded-xl p-1 border ${
            isDarkMode ? 'bg-[#102245] border-[#1d3568]' : 'bg-slate-200/80 border-slate-300'
          }`}>
            {[
              { id: 'todo', label: 'Todo' },
              { id: 'mes', label: 'Este mes' },
              { id: '30d', label: '30 días' },
              { id: '6m', label: '6 meses' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  preset === p.id
                    ? 'bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white shadow-sm'
                    : isDarkMode ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs border ${inputBg}`}>
            <Calendar className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setPreset('custom');
                setFechaDesde(e.target.value);
              }}
              className="bg-transparent text-[11px] focus:outline-none cursor-pointer"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setPreset('custom');
                setFechaHasta(e.target.value);
              }}
              className="bg-transparent text-[11px] focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-sky-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* Export Bar (Excel / CSV + Backup SQLite) */}
      <div className={`rounded-2xl border p-4 print:hidden ${cardBg}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-bold">Exportar datos para Excel y Copias de Seguridad:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExportCsv('ordenes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-[#112244] border-[#213b6e] text-cyan-300 hover:bg-[#172e59]'
                  : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Órdenes (.csv)</span>
            </button>

            <button
              onClick={() => handleExportCsv('repuestos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-[#112244] border-[#213b6e] text-cyan-300 hover:bg-[#172e59]'
                  : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Repuestos (.csv)</span>
            </button>

            <button
              onClick={() => handleExportCsv('herramientas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-[#112244] border-[#213b6e] text-cyan-300 hover:bg-[#172e59]'
                  : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Herramientas (.csv)</span>
            </button>

            <button
              onClick={() => handleExportCsv('prestamos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-[#112244] border-[#213b6e] text-cyan-300 hover:bg-[#172e59]'
                  : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Préstamos (.csv)</span>
            </button>

            <button
              onClick={handleDownloadBackup}
              title="Descarga el archivo completo arbasonic.db para guardarlo en USB o Google Drive"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                isDarkMode
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Respaldo BD</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Financial & Operational Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0d2a20] border-[#144735]' : 'bg-[#e8fbf3] border-emerald-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>Facturado Final</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className={`text-2xl font-black mt-1.5 font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {formatMoney(ordenes.ingresosCobrados)}
          </h3>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-emerald-200/70' : 'text-emerald-700/80'}`}>
            Estimado período: {formatMoney(ordenes.totalEstimadoPeriodo)}
          </p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#0b1c3d] border-cyan-500/30' : 'bg-[#e5f4fe] border-cyan-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>En Taller (Estimado)</span>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <h3 className="text-2xl font-black mt-1.5 font-mono">
            {formatMoney(ordenes.ingresosEstimadosActivos)}
          </h3>
          <p className={`text-[11px] mt-1 ${subText}`}>
            {ordenes.total || 0} órdenes · {ordenes.clientesUnicos || 0} clientes
          </p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#26180c] border-[#4d2f16]' : 'bg-[#fff5e9] border-amber-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>Inventario Repuestos</span>
            <Cpu className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-black mt-1.5 font-mono text-amber-500">
            {formatMoney(inv.valorCostoRepuestos)}
          </h3>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-amber-200/70' : 'text-amber-800/80'}`}>
            Venta pot.: {formatMoney(inv.valorVentaRepuestos)} ({inv.unidadesStock || 0} uds.)
          </p>
        </div>

        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-[#22173d] border-purple-500/30' : 'bg-[#f3effe] border-purple-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>Capital en Herramientas</span>
            <Wrench className="w-4 h-4 text-purple-500" />
          </div>
          <h3 className={`text-2xl font-black mt-1.5 font-mono ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
            {formatMoney(inv.valorHerramientas)}
          </h3>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-purple-200/70' : 'text-purple-800/80'}`}>
            {inv.herramientasDisponibles || 0} disp. · {inv.herramientasEnUso || 0} en uso
          </p>
        </div>
      </div>

      {/* 3 Rankings Grid */}
      {loading && !report ? (
        <div className={`rounded-2xl border p-10 text-center text-xs ${cardBg}`}>
          Cargando estadísticas del taller...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <RankingCard
            title="Top Marcas Más Atendidas"
            icon={Tag}
            items={rankings.porMarca}
            barColor="bg-gradient-to-r from-[#00c6ff] to-[#0072ff]"
          />
          <RankingCard
            title="Tipos de Aparatos Reparados"
            icon={Tv}
            items={rankings.porTipo}
            barColor="bg-gradient-to-r from-emerald-400 to-teal-500"
          />
          <RankingCard
            title="Fallas / Daños Más Frecuentes"
            icon={ClipboardList}
            items={rankings.porDano}
            barColor="bg-gradient-to-r from-amber-400 to-orange-500"
          />
        </div>
      )}

      {/* Operational Alerts: Low Stock & Overdue Loans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Stock Bajo */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className={`flex items-center justify-between pb-3 mb-3 border-b ${divider}`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold">Repuestos por Reabastecer</h3>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              alertas.stockBajo.length > 0
                ? isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
                : isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {alertas.stockBajo.length}
            </span>
          </div>

          {alertas.stockBajo.length === 0 ? (
            <div className="flex items-center gap-2 py-5 text-xs text-emerald-500 font-semibold justify-center">
              <CheckCircle2 className="w-4 h-4" />
              <span>Todo el inventario de repuestos está por encima del stock mínimo.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {alertas.stockBajo.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                    isDarkMode ? 'bg-[#101e3b] border-[#1c325e]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-mono font-bold text-cyan-500 mr-2">{r.codigo}</span>
                    <span className="font-semibold">{r.descripcion}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                    isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                  }`}>
                    {r.stock_actual} / mín. {r.stock_minimo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Préstamos Retrasados */}
        <div className={`rounded-2xl border p-5 ${cardBg}`}>
          <div className={`flex items-center justify-between pb-3 mb-3 border-b ${divider}`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold">Préstamos de Herramientas Retrasados</h3>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              alertas.prestamosVencidos.length > 0
                ? isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                : isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {alertas.prestamosVencidos.length}
            </span>
          </div>

          {alertas.prestamosVencidos.length === 0 ? (
            <div className="flex items-center gap-2 py-5 text-xs text-emerald-500 font-semibold justify-center">
              <CheckCircle2 className="w-4 h-4" />
              <span>No hay herramientas con devolución vencida.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {alertas.prestamosVencidos.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs border ${
                    isDarkMode ? 'bg-[#101e3b] border-[#1c325e]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <span className="font-mono font-bold text-cyan-500 mr-2">{p.herramienta_codigo}</span>
                    <span className="font-semibold">{p.herramienta_nombre}</span>
                    <p className={`text-[11px] ${subText}`}>
                      {p.persona_recibe} ({p.departamento}) · Previsto: {p.devolucion_prevista}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                    isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                  }`}>
                    {p.dias_retraso} días
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
