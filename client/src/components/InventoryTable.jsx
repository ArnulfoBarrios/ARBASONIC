import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  RotateCcw,
  X,
  SlidersHorizontal
} from 'lucide-react';
import SearchableSelect from './SearchableSelect';

export default function InventoryTable({
  equipos,
  marcas = [],
  tipos = [],
  accesorios = [],
  danos = [],
  filterSearch,
  setFilterSearch,
  filterCliente = '',
  setFilterCliente,
  filterCedula = '',
  setFilterCedula,
  filterTipo = 'Todos los Tipos',
  setFilterTipo,
  filterMarca,
  setFilterMarca,
  filterModelo = '',
  setFilterModelo,
  filterAccesorios = 'Todos los Accesorios',
  setFilterAccesorios,
  filterDano = 'Todos los Daños',
  setFilterDano,
  filterEstado,
  setFilterEstado,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
  onResetFilters,
  onApplyFilters,
  onViewEquipo,
  onEditEquipo,
  onDeleteEquipo,
  defaultShowAdvanced = false,
  isDarkMode
}) {
  const [showAdvanced, setShowAdvanced] = useState(defaultShowAdvanced);

  useEffect(() => {
    setShowAdvanced(defaultShowAdvanced);
  }, [defaultShowAdvanced]);

  const getBadgeStyle = (estado) => {
    if (isDarkMode) {
      switch (estado) {
        case 'En Reparación':
          return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
        case 'Entregado':
          return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
        case 'Pendiente':
          return 'bg-purple-500/15 text-purple-300 border border-purple-500/30';
        case 'Reparado':
          return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30';
        default:
          return 'bg-slate-700/50 text-slate-300 border border-slate-600';
      }
    } else {
      switch (estado) {
        case 'En Reparación':
          return 'bg-amber-100 text-amber-800 border border-amber-200';
        case 'Entregado':
          return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
        case 'Pendiente':
          return 'bg-purple-100 text-purple-800 border border-purple-200';
        case 'Reparado':
          return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
        default:
          return 'bg-slate-100 text-slate-700 border border-slate-200';
      }
    }
  };

  const cardBg = isDarkMode
    ? 'bg-[#0c162b] border-[#1b2b4d] text-white'
    : 'bg-white border-slate-200/90 text-slate-800 shadow-sm';

  const inputBg = isDarkMode
    ? 'bg-[#111f38] border-[#21355b] text-slate-100 placeholder-slate-400 focus:border-cyan-400'
    : 'bg-[#f8fafc] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:bg-white';

  const headerBg = isDarkMode
    ? 'bg-[#0a1222]/80 text-slate-400 border-[#1b2b4d]'
    : 'bg-[#f8fafc] text-slate-600 border-slate-200';

  const rowHover = isDarkMode ? 'hover:bg-[#111f3a]/60' : 'hover:bg-slate-50';
  const rowDivider = isDarkMode ? 'divide-[#16233f]' : 'divide-slate-100';

  const advancedActiveCount = [
    Boolean(filterCliente),
    Boolean(filterCedula),
    filterTipo && filterTipo !== 'Todos los Tipos',
    Boolean(filterModelo),
    filterAccesorios && filterAccesorios !== 'Todos los Accesorios',
    filterDano && filterDano !== 'Todos los Daños'
  ].filter(Boolean).length;

  const hasAnyFilter = Boolean(
    filterSearch ||
    filterMarca !== 'Todas las Marcas' ||
    filterEstado !== 'Todos los Estados' ||
    fechaDesde ||
    fechaHasta ||
    advancedActiveCount > 0
  );

  return (
    <div className={`rounded-2xl border shadow-sm transition-colors ${cardBg}`}>
      {/* Header & Primary Filter Bar */}
      <div className={`p-5 border-b flex flex-col gap-4 ${
        isDarkMode ? 'border-[#182744]' : 'border-slate-100'
      }`}>
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          {/* Title */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-500 border border-cyan-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-wide">Inventario de Equipos</h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {equipos.length} {equipos.length === 1 ? 'equipo encontrado' : 'equipos registrados'}
              </p>
            </div>
          </div>

          {/* Primary Filters Group */}
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
            {/* General Search */}
            <div className="relative min-w-[180px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Búsqueda rápida..."
                className={`w-full rounded-xl border pl-9 pr-7 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 ${inputBg}`}
              />
              {filterSearch && (
                <button
                  type="button"
                  onClick={() => setFilterSearch('')}
                  title="Limpiar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Marcas Dropdown */}
            <div className="min-w-[155px]">
              <SearchableSelect
                compact
                isDarkMode={isDarkMode}
                allowOther={false}
                searchable={true}
                allOptionLabel="Todas las Marcas"
                searchPlaceholder="Buscar marca..."
                options={marcas}
                value={filterMarca}
                onSelectOption={setFilterMarca}
              />
            </div>

            {/* Estados Dropdown */}
            <div className="min-w-[150px]">
              <SearchableSelect
                compact
                isDarkMode={isDarkMode}
                allowOther={false}
                searchable={false}
                allOptionLabel="Todos los Estados"
                options={['Pendiente', 'En Reparación', 'Reparado', 'Entregado']}
                value={filterEstado}
                onSelectOption={setFilterEstado}
              />
            </div>

            {/* Date range */}
            <div className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs border ${inputBg}`}>
              <Calendar className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                title="Fecha inicial"
                className="bg-transparent text-[11px] focus:outline-none cursor-pointer"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                title="Fecha final"
                className="bg-transparent text-[11px] focus:outline-none cursor-pointer"
              />
            </div>

            {/* Toggle Advanced Filters */}
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                showAdvanced || advancedActiveCount > 0
                  ? isDarkMode
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-sky-50 border-sky-300 text-sky-700'
                  : isDarkMode
                    ? 'bg-[#111f38] border-[#21355b] text-slate-300 hover:border-cyan-500/50'
                    : 'bg-[#f8fafc] border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Más filtros</span>
              {advancedActiveCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-cyan-500 text-white">
                  {advancedActiveCount}
                </span>
              )}
            </button>

            {/* Reset Filters */}
            {hasAnyFilter && (
              <button
                type="button"
                onClick={onResetFilters}
                title="Restablecer todos los filtros"
                className={`p-1.5 rounded-xl transition-colors ${
                  isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Filtrar Button */}
            <button
              type="button"
              onClick={() => onApplyFilters && onApplyFilters()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:brightness-110 text-white font-bold text-xs transition-all shadow-md shadow-sky-500/20"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>
          </div>
        </div>

        {/* Advanced Multi-Parameter Filter Panel (Cliente, Cédula, Equipo, Modelo, Accesorios, Daño) */}
        {showAdvanced && (
          <div className={`pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 ${
            isDarkMode ? 'border-[#182744]' : 'border-slate-100'
          }`}>
            {/* Cliente */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Cliente
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterCliente}
                  onChange={(e) => setFilterCliente && setFilterCliente(e.target.value)}
                  placeholder="Nombre del cliente..."
                  className={`w-full rounded-xl border px-3 py-1.5 pr-7 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 ${inputBg}`}
                />
                {filterCliente && (
                  <button
                    type="button"
                    onClick={() => setFilterCliente && setFilterCliente('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Cédula */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Cédula
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterCedula}
                  onChange={(e) => setFilterCedula && setFilterCedula(e.target.value)}
                  placeholder="Nº documento..."
                  className={`w-full rounded-xl border px-3 py-1.5 pr-7 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 ${inputBg}`}
                />
                {filterCedula && (
                  <button
                    type="button"
                    onClick={() => setFilterCedula && setFilterCedula('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Tipo de Equipo */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Equipo
              </label>
              <SearchableSelect
                compact
                isDarkMode={isDarkMode}
                allowOther={false}
                searchable={true}
                allOptionLabel="Todos los Tipos"
                searchPlaceholder="Buscar equipo..."
                options={tipos}
                value={filterTipo}
                onSelectOption={(val) => setFilterTipo && setFilterTipo(val)}
              />
            </div>

            {/* Modelo */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Modelo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filterModelo}
                  onChange={(e) => setFilterModelo && setFilterModelo(e.target.value)}
                  placeholder="Ej. UN55, MHC..."
                  className={`w-full rounded-xl border px-3 py-1.5 pr-7 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 ${inputBg}`}
                />
                {filterModelo && (
                  <button
                    type="button"
                    onClick={() => setFilterModelo && setFilterModelo('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Accesorios */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Accesorios
              </label>
              <SearchableSelect
                compact
                isDarkMode={isDarkMode}
                allowOther={false}
                searchable={true}
                allOptionLabel="Todos los Accesorios"
                searchPlaceholder="Buscar accesorio..."
                options={accesorios}
                value={filterAccesorios}
                onSelectOption={(val) => setFilterAccesorios && setFilterAccesorios(val)}
              />
            </div>

            {/* Daño */}
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Daño que Presenta
              </label>
              <SearchableSelect
                compact
                isDarkMode={isDarkMode}
                allowOther={false}
                searchable={true}
                allOptionLabel="Todos los Daños"
                searchPlaceholder="Buscar daño..."
                options={danos}
                value={filterDano}
                onSelectOption={(val) => setFilterDano && setFilterDano(val)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Table (Responsive) */}
      <div className="overflow-x-auto rounded-b-2xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className={`border-b font-semibold uppercase tracking-wider text-[11px] ${headerBg}`}>
              <th className="py-3.5 px-3">#</th>
              <th className="py-3.5 px-3">Cliente</th>
              <th className="py-3.5 px-3">Cédula</th>
              <th className="py-3.5 px-3">Equipo</th>
              <th className="py-3.5 px-3">Marca</th>
              <th className="py-3.5 px-3">Modelo</th>
              <th className="py-3.5 px-3">Accesorios</th>
              <th className="py-3.5 px-3">Daño</th>
              <th className="py-3.5 px-3">Ingreso</th>
              <th className="py-3.5 px-3">Estado</th>
              <th className="py-3.5 px-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${rowDivider}`}>
            {equipos.length === 0 ? (
              <tr>
                <td colSpan="11" className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="w-8 h-8 text-slate-400 stroke-1" />
                    <p className="text-sm font-medium">No se encontraron equipos con los filtros seleccionados.</p>
                  </div>
                </td>
              </tr>
            ) : (
              equipos.map((item, index) => (
                <tr
                  key={item.id}
                  className={`transition-colors group ${rowHover}`}
                >
                  <td className="py-3 px-3 font-bold text-slate-400">{index + 1}</td>
                  <td className={`py-3 px-3 font-bold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {item.cliente_nombre}
                  </td>
                  <td className={`py-3 px-3 font-mono text-[11px] whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.cliente_cedula}
                  </td>
                  <td className={`py-3 px-3 font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {item.tipo_equipo}
                  </td>
                  <td className={`py-3 px-3 font-bold whitespace-nowrap ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    {item.marca}
                  </td>
                  <td className={`py-3 px-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {item.modelo || '-'}
                  </td>
                  <td className={`py-3 px-3 max-w-[130px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} title={item.accesorios}>
                    {item.accesorios}
                  </td>
                  <td className={`py-3 px-3 max-w-[155px] truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`} title={item.dano_reportado}>
                    {item.dano_reportado}
                  </td>
                  <td className={`py-3 px-3 whitespace-nowrap font-mono text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.fecha_ingreso}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getBadgeStyle(item.estado)}`}>
                      {item.estado}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onViewEquipo(item)}
                        title="Ver Ficha / Imprimir Ticket"
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditEquipo(item)}
                        title="Modificar Equipo"
                        className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteEquipo(item.id)}
                        title="Eliminar Equipo"
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
