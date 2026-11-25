import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  Users,
  RotateCcw,
  ShieldAlert,
  Edit3,
  Trash2,
  X,
  UserPlus,
  Save
} from 'lucide-react';
import SearchableSelect from './SearchableSelect';

const CATEGORIAS_HERRAMIENTA = [
  'Herramienta manual',
  'Herramienta eléctrica',
  'Herramienta de medición',
  'Herramienta neumática',
  'Herramienta hidráulica',
  'Equipo de protección',
  'Otro'
];

const ESTADOS_HERRAMIENTA = [
  'Disponible',
  'En uso',
  'En mantenimiento',
  'Dañada',
  'Extraviada',
  'Baja'
];

export default function HerramientasView({ isDarkMode }) {
  const [activeSubTab, setActiveSubTab] = useState('herramientas');
  const [herramientas, setHerramientas] = useState([]);
  const [prestamos, setPrestamos] = useState([]);

  // Filtros Inventario
  const [searchTools, setSearchTools] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('Todas');
  const [filterEstado, setFilterEstado] = useState('Todos');

  // Filtros Préstamos
  const [searchPrestamos, setSearchPrestamos] = useState('');
  const [filterEstadoPrestamo, setFilterEstadoPrestamo] = useState('Todos');

  // Feedback
  const [feedback, setFeedback] = useState('');

  // Modal Herramienta (Crear / Editar)
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [toolError, setToolError] = useState('');
  const [savingTool, setSavingTool] = useState(false);
  const [toolForm, setToolForm] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Herramienta manual',
    ubicacion: 'Mesa de Trabajo 1',
    responsable: 'Taller',
    estado: 'Disponible',
    costo_adquisicion: ''
  });

  // Modal Préstamo (Nuevo Préstamo)
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [loanError, setLoanError] = useState('');
  const [savingLoan, setSavingLoan] = useState(false);
  const [loanForm, setLoanForm] = useState({
    herramienta_id: '',
    persona_recibe: '',
    departamento: 'Taller',
    fecha_prestamo: new Date().toISOString().split('T')[0],
    devolucion_prevista: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    observaciones: ''
  });

  const notify = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  const loadHerramientas = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTools) params.append('search', searchTools);
      if (filterCategoria !== 'Todas') params.append('categoria', filterCategoria);
      if (filterEstado !== 'Todos') params.append('estado', filterEstado);

      const res = await fetch(`/api/herramientas?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setHerramientas(data.data);
      }
    } catch (err) {
      console.error('Error cargando herramientas:', err);
    }
  };

  const loadPrestamos = async () => {
    try {
      const params = new URLSearchParams();
      if (searchPrestamos) params.append('search', searchPrestamos);
      if (filterEstadoPrestamo !== 'Todos') params.append('estado', filterEstadoPrestamo);

      const res = await fetch(`/api/herramientas/prestamos?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPrestamos(data.data);
      }
    } catch (err) {
      console.error('Error cargando préstamos:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHerramientas();
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTools, filterCategoria, filterEstado]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPrestamos();
    }, 150);
    return () => clearTimeout(timer);
  }, [searchPrestamos, filterEstadoPrestamo]);

  // Calcular siguiente código HT-XXXX disponible
  const getNextToolCode = () => {
    const nums = herramientas
      .map((h) => {
        const m = String(h.codigo || '').match(/(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter((n) => !Number.isNaN(n));
    const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1;
    return `HT-${String(next).padStart(4, '0')}`;
  };

  const handleOpenAddTool = () => {
    setEditingTool(null);
    setToolError('');
    setToolForm({
      codigo: getNextToolCode(),
      nombre: '',
      categoria: 'Herramienta eléctrica',
      ubicacion: 'Mesa de Trabajo 1',
      responsable: 'Taller',
      estado: 'Disponible',
      costo_adquisicion: ''
    });
    setToolModalOpen(true);
  };

  const handleOpenEditTool = (tool) => {
    setEditingTool(tool);
    setToolError('');
    setToolForm({
      codigo: tool.codigo || '',
      nombre: tool.nombre || '',
      categoria: tool.categoria || 'Herramienta manual',
      ubicacion: tool.ubicacion || '',
      responsable: tool.responsable || 'Taller',
      estado: tool.estado || 'Disponible',
      costo_adquisicion: tool.costo_adquisicion ?? ''
    });
    setToolModalOpen(true);
  };

  const handleSaveTool = async (e) => {
    e.preventDefault();
    setToolError('');
    if (!toolForm.codigo.trim() || !toolForm.nombre.trim()) {
      setToolError('El código y el nombre de la herramienta son obligatorios.');
      return;
    }

    setSavingTool(true);
    try {
      const url = editingTool ? `/api/herramientas/${editingTool.id}` : '/api/herramientas';
      const method = editingTool ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolForm)
      });
      const data = await res.json();
      if (data.success) {
        setToolModalOpen(false);
        notify(editingTool ? 'Herramienta actualizada correctamente.' : 'Herramienta agregada al inventario.');
        loadHerramientas();
      } else {
        setToolError(data.message || 'No se pudo guardar la herramienta.');
      }
    } catch (err) {
      setToolError('Error de conexión con el servidor.');
    } finally {
      setSavingTool(false);
    }
  };

  const handleDeleteTool = async (tool) => {
    if (!window.confirm(`¿Eliminar la herramienta "${tool.nombre}" (${tool.codigo}) del inventario?`)) return;
    try {
      const res = await fetch(`/api/herramientas/${tool.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify('Herramienta eliminada del inventario.');
        loadHerramientas();
        loadPrestamos();
      } else {
        alert(data.message || 'No se pudo eliminar.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenNewLoan = (preselectedTool = null) => {
    setLoanError('');
    const disponibles = herramientas.filter((h) => h.estado === 'Disponible');
    const chosenId = preselectedTool?.id || disponibles[0]?.id || '';
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    setLoanForm({
      herramienta_id: chosenId,
      persona_recibe: '',
      departamento: 'Taller',
      fecha_prestamo: today,
      devolucion_prevista: nextWeek,
      observaciones: ''
    });
    setLoanModalOpen(true);
  };

  const handleSaveLoan = async (e) => {
    e.preventDefault();
    setLoanError('');
    if (!loanForm.herramienta_id || !loanForm.persona_recibe.trim()) {
      setLoanError('Selecciona una herramienta disponible y escribe quién la recibe.');
      return;
    }

    setSavingLoan(true);
    try {
      const res = await fetch('/api/herramientas/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanForm)
      });
      const data = await res.json();
      if (data.success) {
        setLoanModalOpen(false);
        setActiveSubTab('prestamos');
        notify('Préstamo registrado correctamente.');
        loadHerramientas();
        loadPrestamos();
      } else {
        setLoanError(data.message || 'No se pudo registrar el préstamo.');
      }
    } catch (err) {
      setLoanError('Error de conexión con el servidor.');
    } finally {
      setSavingLoan(false);
    }
  };

  const handleDevolver = async (prestamoId) => {
    if (!window.confirm('¿Confirmar la devolución de esta herramienta al taller?')) return;
    try {
      const res = await fetch(`/api/herramientas/prestamos/${prestamoId}/devolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devolucion_real: new Date().toISOString().split('T')[0] })
      });
      const data = await res.json();
      if (data.success) {
        notify('Herramienta recibida y marcada como Disponible.');
        loadHerramientas();
        loadPrestamos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cardBg = isDarkMode
    ? 'bg-[#0c162b] border-[#1b2b4d] text-white'
    : 'bg-white border-slate-200/90 shadow-sm text-slate-800';
  const inputBg = isDarkMode
    ? 'bg-[#111f38] border-[#21355b] text-slate-100 placeholder-slate-400 focus:border-cyan-400'
    : 'bg-[#f8fafc] border-slate-200 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:bg-white';
  const tableHeaderBg = isDarkMode
    ? 'bg-[#0a1222] text-slate-400 border-[#1b2b4d]'
    : 'bg-[#f8fafc] text-slate-600 border-slate-200';
  const rowDivider = isDarkMode ? 'divide-[#16233f]' : 'divide-slate-100';

  const getToolEstadoStyle = (estado) => {
    if (isDarkMode) {
      switch (estado) {
        case 'Disponible':
          return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
        case 'En uso':
          return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
        case 'En mantenimiento':
          return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
        case 'Dañada':
        case 'Extraviada':
          return 'bg-red-500/20 text-red-300 border border-red-500/30';
        default:
          return 'bg-slate-700/60 text-slate-300 border border-slate-600';
      }
    }
    switch (estado) {
      case 'Disponible':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'En uso':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'En mantenimiento':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Dañada':
      case 'Extraviada':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getToolCategoriaStyle = () =>
    isDarkMode
      ? 'bg-slate-800/80 text-sky-300 border border-slate-700'
      : 'bg-sky-50 text-sky-700 border border-sky-200';

  const retrasadosCount = prestamos.filter((p) => p.estado_prestamo === 'Retrasado').length;
  const enUsoCount = herramientas.filter((h) => h.estado === 'En uso').length;
  const disponiblesTools = herramientas.filter((h) => h.estado === 'Disponible');

  return (
    <div className="space-y-6">
      {/* Toast inline feedback */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#00c6ff] text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2">
          <span>✓</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-cyan-500" />
            <span>Control de Herramientas y Préstamos</span>
          </h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Registra instrumental del taller, edita su estado y gestiona entregas o devoluciones.
          </p>
        </div>

        {/* Action Buttons + Subtab Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab Switcher */}
          <div className={`inline-flex rounded-xl p-1 border ${
            isDarkMode ? 'bg-[#102245] border-[#1d3568]' : 'bg-slate-200/80 border-slate-300'
          }`}>
            <button
              onClick={() => setActiveSubTab('herramientas')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'herramientas'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : isDarkMode ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-700'
              }`}
            >
              Inventario ({herramientas.length})
            </button>
            <button
              onClick={() => setActiveSubTab('prestamos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'prestamos'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : isDarkMode ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-700'
              }`}
            >
              <span>Préstamos ({prestamos.length})</span>
              {retrasadosCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              )}
            </button>
          </div>

          <button
            onClick={() => handleOpenNewLoan()}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
              isDarkMode
                ? 'bg-[#112244] border-cyan-500/40 text-cyan-300 hover:bg-[#162d59]'
                : 'bg-white border-cyan-300 text-cyan-700 hover:bg-cyan-50 shadow-sm'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Préstamo</span>
          </button>

          <button
            onClick={handleOpenAddTool}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Herramienta</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0d2a20] border-[#144735]' : 'bg-[#e8fbf3] border-emerald-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>Herramientas Disponibles</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{disponiblesTools.length}</h3>
        </div>

        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#0b1c3d] border-cyan-500/30' : 'bg-[#e5f4fe] border-cyan-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>En Uso / Prestadas</span>
            <Users className="w-4 h-4 text-cyan-500" />
          </div>
          <h3 className="text-2xl font-black mt-1">{enUsoCount}</h3>
        </div>

        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#2b1212] border-[#592222]' : 'bg-[#fee2e2] border-red-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Préstamos con Retraso</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <h3 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{retrasadosCount}</h3>
        </div>
      </div>

      {/* View 1: Inventario de Herramientas */}
      {activeSubTab === 'herramientas' && (
        <div className={`rounded-2xl border p-5 shadow-sm ${cardBg}`}>
          {/* Filters */}
          <div className={`flex flex-wrap items-center gap-3 pb-4 border-b mb-4 ${isDarkMode ? 'border-[#182744]' : 'border-slate-100'}`}>
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código, nombre o responsable..."
                value={searchTools}
                onChange={(e) => setSearchTools(e.target.value)}
                className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 ${inputBg}`}
              />
            </div>

            <div className="min-w-[180px]">
              <SearchableSelect
                compact
                isDarkMode={isDarkMode}
                allowOther={false}
                searchable={true}
                allOptionLabel="Todas"
                placeholder="Todas las Categorías"
                searchPlaceholder="Buscar categoría..."
                options={CATEGORIAS_HERRAMIENTA}
                value={filterCategoria === 'Todas' ? 'Todas' : filterCategoria}
                onSelectOption={setFilterCategoria}
              />
            </div>

            <div className="min-w-[155px]">
              <SearchableSelect
                compact
                isDarkMode={isDarkMode}
                allowOther={false}
                searchable={false}
                allOptionLabel="Todos"
                placeholder="Todos los Estados"
                options={ESTADOS_HERRAMIENTA}
                value={filterEstado}
                onSelectOption={setFilterEstado}
              />
            </div>

            {(searchTools || filterCategoria !== 'Todas' || filterEstado !== 'Todos') && (
              <button
                onClick={() => {
                  setSearchTools('');
                  setFilterCategoria('Todas');
                  setFilterEstado('Todos');
                }}
                title="Restablecer filtros"
                className={`p-1.5 rounded-xl transition-colors ${
                  isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${tableHeaderBg}`}>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Nombre de la Herramienta</th>
                  <th className="py-3 px-3">Categoría</th>
                  <th className="py-3 px-3">Ubicación</th>
                  <th className="py-3 px-3">Responsable</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-3 text-right">Costo</th>
                  <th className="py-3 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${rowDivider}`}>
                {herramientas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-400">
                      No se encontraron herramientas con esos criterios.
                    </td>
                  </tr>
                ) : (
                  herramientas.map((h) => (
                    <tr key={h.id} className={isDarkMode ? 'hover:bg-[#111f3a]' : 'hover:bg-slate-50'}>
                      <td className={`py-3 px-3 font-mono font-bold whitespace-nowrap ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>
                        {h.codigo}
                      </td>
                      <td className={`py-3 px-3 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {h.nombre}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getToolCategoriaStyle()}`}>
                          {h.categoria}
                        </span>
                      </td>
                      <td className={`py-3 px-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {h.ubicacion || 'Taller'}
                      </td>
                      <td className={`py-3 px-3 font-medium whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {h.responsable || 'Taller'}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getToolEstadoStyle(h.estado)}`}>
                          {h.estado}
                        </span>
                      </td>
                      <td className={`py-3 px-3 text-right font-mono whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        ${Number(h.costo_adquisicion || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {h.estado === 'Disponible' && (
                            <button
                              onClick={() => handleOpenNewLoan(h)}
                              title="Prestar herramienta"
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDarkMode
                                  ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              }`}
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditTool(h)}
                            title="Editar herramienta"
                            className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTool(h)}
                            title="Eliminar herramienta"
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
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
      )}

      {/* View 2: Préstamos a Empleados */}
      {activeSubTab === 'prestamos' && (
        <div className={`rounded-2xl border p-5 shadow-sm ${cardBg}`}>
          {/* Filters */}
          <div className={`flex flex-wrap items-center gap-3 pb-4 border-b mb-4 ${isDarkMode ? 'border-[#182744]' : 'border-slate-100'}`}>
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por ID, herramienta o persona..."
                value={searchPrestamos}
                onChange={(e) => setSearchPrestamos(e.target.value)}
                className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 ${inputBg}`}
              />
            </div>

            <div className="min-w-[155px]">
              <SearchableSelect
                compact
                isDarkMode={isDarkMode}
                allowOther={false}
                searchable={false}
                allOptionLabel="Todos"
                options={['En curso', 'Retrasado', 'Devuelto']}
                value={filterEstadoPrestamo}
                onSelectOption={setFilterEstadoPrestamo}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${tableHeaderBg}`}>
                  <th className="py-3 px-3">ID Préstamo</th>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-3">Herramienta</th>
                  <th className="py-3 px-3">Persona que Recibe</th>
                  <th className="py-3 px-3">Departamento</th>
                  <th className="py-3 px-3">Fecha Préstamo</th>
                  <th className="py-3 px-3">Devolución Prevista</th>
                  <th className="py-3 px-3 text-center">Estado / Días Retraso</th>
                  <th className="py-3 px-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${rowDivider}`}>
                {prestamos.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-10 text-center text-slate-400">
                      No hay préstamos registrados con esos filtros.
                    </td>
                  </tr>
                ) : (
                  prestamos.map((p) => {
                    const isReturned = p.estado_prestamo === 'Devuelto';
                    const isLate = p.estado_prestamo === 'Retrasado';
                    return (
                      <tr key={p.id} className={isDarkMode ? 'hover:bg-[#111f3a]' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-3 font-mono font-bold text-slate-400 whitespace-nowrap">{p.codigo_prestamo}</td>
                        <td className={`py-3 px-3 font-mono font-bold whitespace-nowrap ${isDarkMode ? 'text-cyan-400' : 'text-cyan-700'}`}>{p.herramienta_codigo}</td>
                        <td className={`py-3 px-3 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{p.herramienta_nombre}</td>
                        <td className={`py-3 px-3 font-semibold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                          {p.persona_recibe}
                        </td>
                        <td className={`py-3 px-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.departamento}</td>
                        <td className={`py-3 px-3 font-mono text-[11px] whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.fecha_prestamo}</td>
                        <td className={`py-3 px-3 font-mono text-[11px] whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.devolucion_prevista}</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {isReturned ? (
                            <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isDarkMode
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              Devuelto
                            </span>
                          ) : isLate ? (
                            <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isDarkMode
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              Retrasado ({p.dias_retraso} días)
                            </span>
                          ) : (
                            <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isDarkMode
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              En curso
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          {!isReturned && (
                            <button
                              onClick={() => handleDevolver(p.id)}
                              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                                isDarkMode
                                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300'
                                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                              }`}
                            >
                              Recibir en Taller
                            </button>
                          )}
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

      {/* Modal: Registrar / Editar Herramienta */}
      {toolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0b1426] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-white text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <span>{editingTool ? `Editar Herramienta ${editingTool.codigo}` : 'Registrar Nueva Herramienta'}</span>
              </h3>
              <button onClick={() => setToolModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {toolError && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{toolError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTool} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Código Único *</label>
                  <input
                    type="text"
                    required
                    value={toolForm.codigo}
                    onChange={(e) => setToolForm({ ...toolForm, codigo: e.target.value })}
                    placeholder="Ej. HT-0011"
                    className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Categoría *</label>
                  <select
                    value={toolForm.categoria}
                    onChange={(e) => setToolForm({ ...toolForm, categoria: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {CATEGORIAS_HERRAMIENTA.map((c) => (
                      <option key={c} value={c} className="bg-[#0b1426]">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre de la Herramienta *</label>
                <input
                  type="text"
                  required
                  value={toolForm.nombre}
                  onChange={(e) => setToolForm({ ...toolForm, nombre: e.target.value })}
                  placeholder="Ej. Cautín de Estación Digital 60W"
                  className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ubicación en Taller</label>
                  <input
                    type="text"
                    value={toolForm.ubicacion}
                    onChange={(e) => setToolForm({ ...toolForm, ubicacion: e.target.value })}
                    placeholder="Ej. Banco Diagnóstico A"
                    className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Responsable Actual</label>
                  <input
                    type="text"
                    value={toolForm.responsable}
                    onChange={(e) => setToolForm({ ...toolForm, responsable: e.target.value })}
                    placeholder="Ej. Taller / Arnulfo Barrios"
                    className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estado</label>
                  <select
                    value={toolForm.estado}
                    onChange={(e) => setToolForm({ ...toolForm, estado: e.target.value })}
                    className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {ESTADOS_HERRAMIENTA.map((st) => (
                      <option key={st} value={st} className="bg-[#0b1426]">{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Costo de Adquisición ($ COP)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={toolForm.costo_adquisicion}
                    onChange={(e) => setToolForm({ ...toolForm, costo_adquisicion: e.target.value })}
                    placeholder="Ej. 180000"
                    className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setToolModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTool}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] font-bold text-white shadow-lg shadow-cyan-900/30 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingTool ? 'Guardando...' : editingTool ? 'Guardar Cambios' : 'Guardar Herramienta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Préstamo */}
      {loanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0b1426] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-white text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <span>Registrar Préstamo de Herramienta</span>
              </h3>
              <button onClick={() => setLoanModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loanError && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loanError}</span>
              </div>
            )}

            {disponiblesTools.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-center space-y-3">
                <p>No hay herramientas con estado <strong>Disponible</strong> en este momento.</p>
                <button
                  onClick={() => setLoanModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-700 text-white font-semibold"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveLoan} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Herramienta Disponible *</label>
                  <select
                    required
                    value={loanForm.herramienta_id}
                    onChange={(e) => setLoanForm({ ...loanForm, herramienta_id: Number(e.target.value) })}
                    className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {disponiblesTools.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0b1426]">
                        {t.codigo} — {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Persona que Recibe *</label>
                    <input
                      type="text"
                      required
                      value={loanForm.persona_recibe}
                      onChange={(e) => setLoanForm({ ...loanForm, persona_recibe: e.target.value })}
                      placeholder="Ej. Carlos Ruiz"
                      className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Departamento / Área</label>
                    <input
                      type="text"
                      value={loanForm.departamento}
                      onChange={(e) => setLoanForm({ ...loanForm, departamento: e.target.value })}
                      placeholder="Ej. Taller"
                      className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Fecha de Préstamo *</label>
                    <input
                      type="date"
                      required
                      value={loanForm.fecha_prestamo}
                      onChange={(e) => setLoanForm({ ...loanForm, fecha_prestamo: e.target.value })}
                      className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Devolución Prevista *</label>
                    <input
                      type="date"
                      required
                      value={loanForm.devolucion_prevista}
                      onChange={(e) => setLoanForm({ ...loanForm, devolucion_prevista: e.target.value })}
                      className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Observaciones</label>
                  <input
                    type="text"
                    value={loanForm.observaciones}
                    onChange={(e) => setLoanForm({ ...loanForm, observaciones: e.target.value })}
                    placeholder="Motivo del préstamo o servicio asignado"
                    className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-700 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setLoanModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingLoan}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] font-bold text-white shadow-lg shadow-cyan-900/30 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingLoan ? 'Registrando...' : 'Registrar Préstamo'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
