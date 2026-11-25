import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Search, 
  Plus, 
  AlertTriangle, 
  PackageCheck, 
  DollarSign, 
  Tag, 
  X, 
  Edit3, 
  Trash2,
  CheckCircle,
  Layers
} from 'lucide-react';
import SearchableSelect from './SearchableSelect';

export default function RepuestosView({ isDarkMode }) {
  const [repuestos, setRepuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [soloBajoStock, setSoloBajoStock] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRepuesto, setEditingRepuesto] = useState(null);

  // Form state
  const [form, setForm] = useState({
    codigo: '',
    categoria: 'Tarjetas electrónicas',
    descripcion: '',
    marca: '',
    referencia: '',
    estado_main: 'No aplica',
    estado_fuente: 'No aplica',
    estado_tcon: 'No aplica',
    stock_minimo: 1,
    stock_actual: 1,
    precio_costo: '',
    precio_venta: '',
    ubicacion: '',
    proveedor: '',
    observaciones: ''
  });

  const categorias = [
    'Todas',
    'Pantallas',
    'Tarjetas electrónicas',
    'Fuentes de poder',
    'Condensadores',
    'Integrados',
    'Conectores',
    'Cables',
    'Controles',
    'Baterías',
    'Otros'
  ];

  const loadRepuestos = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoria && categoria !== 'Todas') params.append('categoria', categoria);
      if (soloBajoStock) params.append('stock_bajo', 'true');

      const res = await fetch(`/api/repuestos?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRepuestos(data.data);
      }
    } catch (err) {
      console.error('Error cargando repuestos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepuestos();
  }, [search, categoria, soloBajoStock]);

  const handleOpenAdd = () => {
    setEditingRepuesto(null);
    setForm({
      codigo: `REP-${String(repuestos.length + 1).padStart(3, '0')}`,
      categoria: 'Tarjetas electrónicas',
      descripcion: '',
      marca: '',
      referencia: '',
      estado_main: 'No aplica',
      estado_fuente: 'No aplica',
      estado_tcon: 'No aplica',
      stock_minimo: 1,
      stock_actual: 1,
      precio_costo: '',
      precio_venta: '',
      ubicacion: '',
      proveedor: '',
      observaciones: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingRepuesto(item);
    setForm({ ...item });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar este repuesto del inventario?')) return;
    try {
      await fetch(`/api/repuestos/${id}`, { method: 'DELETE' });
      loadRepuestos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingRepuesto ? `/api/repuestos/${editingRepuesto.id}` : '/api/repuestos';
      const method = editingRepuesto ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        loadRepuestos();
      } else {
        alert(data.message || 'Error al guardar repuesto');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const totalItems = repuestos.length;
  const itemsBajoStock = repuestos.filter(r => r.stock_actual <= r.stock_minimo).length;
  const valorTotalInventario = repuestos.reduce((acc, r) => acc + (r.stock_actual * (r.precio_costo || 0)), 0);

  const cardBg = isDarkMode ? 'bg-[#0c162b] border-[#1b2b4d] text-white' : 'bg-white border-slate-200/90 shadow-sm text-slate-800';
  const inputBg = isDarkMode ? 'bg-[#111f38] border-[#21355b] text-slate-100 placeholder-slate-400' : 'bg-[#f8fafc] border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white';

  const getCategoryBadgeStyle = (cat) => {
    if (isDarkMode) {
      switch (cat) {
        case 'Tarjetas electrónicas':
          return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
        case 'Fuentes de poder':
          return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
        case 'Pantallas':
          return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30';
        case 'Integrados':
          return 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30';
        case 'Condensadores':
          return 'bg-purple-500/15 text-purple-300 border border-purple-500/30';
        default:
          return 'bg-slate-700/60 text-slate-200 border border-slate-600/60';
      }
    }
    switch (cat) {
      case 'Tarjetas electrónicas':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Fuentes de poder':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Pantallas':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      case 'Integrados':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'Condensadores':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500 shrink-0" />
            <span>Inventario de Repuestos y Componentes</span>
          </h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Gestión de tarjetas electrónicas, pantallas, circuitos integrados y existencias del taller.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all w-full sm:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Repuesto</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className={`p-3.5 sm:p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0d1a33] border-[#1c305a]' : 'bg-[#e5f4fe] border-cyan-200'}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Repuestos Registrados</span>
            <Layers className="w-4 h-4 text-cyan-500 shrink-0" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black mt-1">{totalItems}</h3>
        </div>

        <div className={`p-3.5 sm:p-4 rounded-2xl border ${isDarkMode ? 'bg-[#26180c] border-[#4d2f16]' : 'bg-[#fff5e9] border-amber-200'}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`}>Por Reabastecer (Bajo Stock)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-amber-500 mt-1">{itemsBajoStock}</h3>
        </div>

        <div className={`p-3.5 sm:p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0d2a20] border-[#144735]' : 'bg-[#e8fbf3] border-emerald-200'}`}>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Valor Total en Stock</span>
            <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <h3 className={`text-xl sm:text-2xl font-black mt-1 truncate ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            ${valorTotalInventario.toLocaleString('es-CO')}
          </h3>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className={`rounded-2xl border p-3.5 sm:p-5 shadow-sm ${cardBg}`}>
        {/* Filter Controls */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center gap-2.5 sm:gap-3 pb-4 border-b mb-4 ${isDarkMode ? 'border-[#182744]' : 'border-slate-100'}`}>
          <div className="relative w-full lg:w-64 lg:flex-1 lg:max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, descripción o referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-3 py-2 sm:py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 ${inputBg}`}
            />
          </div>

          <div className="w-full lg:w-52">
            <SearchableSelect
              compact
              isDarkMode={isDarkMode}
              allowOther={false}
              searchable={true}
              allOptionLabel="Todas"
              searchPlaceholder="Buscar categoría..."
              options={categorias.filter((c) => c !== 'Todas')}
              value={categoria}
              onSelectOption={setCategoria}
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer py-1 sm:col-span-2 lg:col-span-1">
            <input
              type="checkbox"
              checked={soloBajoStock}
              onChange={(e) => setSoloBajoStock(e.target.checked)}
              className="accent-cyan-500 rounded w-4 h-4"
            />
            <span>Solo stock bajo / crítico</span>
          </label>
        </div>

        {/* Vista Móvil y Tablet en Tarjetas (< xl) */}
        <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3">
          {repuestos.length === 0 ? (
            <div className="md:col-span-2 py-10 text-center text-xs text-slate-400">
              No se encontraron repuestos registrados.
            </div>
          ) : (
            repuestos.map((r) => {
              const isLow = r.stock_actual <= r.stock_minimo;
              return (
                <div
                  key={r.id}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between gap-2.5 ${
                    isDarkMode ? 'bg-[#0f1c36] border-[#1c305a]' : 'bg-slate-50/70 border-slate-200/90'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        <span className={`font-mono font-bold text-xs ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                          {r.codigo}
                        </span>
                        <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded-full text-[10px] font-semibold ${getCategoryBadgeStyle(r.categoria)}`}>
                          {r.categoria}
                        </span>
                      </div>
                      <span className={`inline-block whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        isLow
                          ? isDarkMode
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-red-100 text-red-700 border border-red-200'
                          : isDarkMode
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        Stock: {r.stock_actual} / {r.stock_minimo}
                      </span>
                    </div>

                    <div>
                      <h4 className={`font-bold text-sm leading-snug ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {r.descripcion}
                      </h4>
                      {(r.marca || r.referencia) && (
                        <p className={`text-[11px] font-mono mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {r.marca} {r.referencia ? `(${r.referencia})` : ''}
                        </p>
                      )}
                    </div>

                    <div className={`grid grid-cols-2 gap-2 pt-2 border-t text-[11px] ${isDarkMode ? 'border-[#1b2e54]' : 'border-slate-200/80'}`}>
                      <div>
                        <span className={`block text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Precio Costo</span>
                        <span className={`font-mono font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                          ${Number(r.precio_costo || 0).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div>
                        <span className={`block text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Precio Venta</span>
                        <span className={`font-mono font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          ${Number(r.precio_venta || 0).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ubicación: </span>
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{r.ubicacion || 'Sin asignar'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 pt-2.5 border-t ${isDarkMode ? 'border-[#1b2e54]' : 'border-slate-200/80'}`}>
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs transition-colors ${
                        isDarkMode
                          ? 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25'
                          : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                        isDarkMode
                          ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                          : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Table (Desktop >= xl) */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode ? 'bg-[#0a1222] text-slate-400 border-[#1b2b4d]' : 'bg-[#f8fafc] text-slate-600 border-slate-200'
              }`}>
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Descripción</th>
                <th className="py-3 px-3">Marca / Ref.</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-right">Precio Costo</th>
                <th className="py-3 px-3 text-right">Precio Venta</th>
                <th className="py-3 px-3">Ubicación</th>
                <th className="py-3 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-[#16233f]' : 'divide-slate-100'}`}>
              {repuestos.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No se encontraron repuestos registrados.
                  </td>
                </tr>
              ) : (
                repuestos.map((r) => {
                  const isLow = r.stock_actual <= r.stock_minimo;
                  return (
                    <tr key={r.id} className={`transition-colors ${isDarkMode ? 'hover:bg-[#111f3a]' : 'hover:bg-slate-50'}`}>
                      <td className={`py-3 px-3 font-mono font-bold whitespace-nowrap ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                        {r.codigo}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getCategoryBadgeStyle(r.categoria)}`}>
                          {r.categoria}
                        </span>
                      </td>
                      <td className={`py-3 px-3 font-bold max-w-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {r.descripcion}
                      </td>
                      <td className={`py-3 px-3 font-mono text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {r.marca} {r.referencia ? `(${r.referencia})` : ''}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isLow
                            ? isDarkMode
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-red-100 text-red-700 border border-red-200'
                            : isDarkMode
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {r.stock_actual} / {r.stock_minimo}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-right font-mono whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        ${Number(r.precio_costo).toLocaleString('es-CO')}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ${Number(r.precio_venta).toLocaleString('es-CO')}
                      </td>
                      <td className={`py-3 px-3 text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {r.ubicacion || '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal Agregar / Editar Repuesto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0b1426] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white text-xs my-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700 shrink-0">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 min-w-0">
                <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
                <span className="truncate">{editingRepuesto ? 'Editar Repuesto' : 'Registrar Nuevo Repuesto'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Código Único *</label>
                  <input
                    type="text"
                    required
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Categoría *</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white"
                  >
                    {categorias.filter(c => c !== 'Todas').map((c, i) => (
                      <option key={i} value={c} className="bg-[#0b1426]">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Descripción del Repuesto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tarjeta Main Board Smart TV 43 pulgadas"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. LG, Samsung, Sony"
                    value={form.marca}
                    onChange={(e) => setForm({ ...form, marca: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Referencia / Número de Parte</label>
                  <input
                    type="text"
                    placeholder="Ej. EAX68253604"
                    value={form.referencia}
                    onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Stock Actual</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock_actual}
                    onChange={(e) => setForm({ ...form, stock_actual: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock_minimo}
                    onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Precio Costo ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.precio_costo}
                    onChange={(e) => setForm({ ...form, precio_costo: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.precio_venta}
                    onChange={(e) => setForm({ ...form, precio_venta: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ubicación en el Taller</label>
                  <input
                    type="text"
                    placeholder="Ej. Estante A1 - Cajón 3"
                    value={form.ubicacion}
                    onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Proveedor / Casa de Repuestos</label>
                  <input
                    type="text"
                    placeholder="Ej. Electrónica del Norte"
                    value={form.proveedor}
                    onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-white shadow-lg shadow-cyan-900/30"
                >
                  Guardar Repuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
