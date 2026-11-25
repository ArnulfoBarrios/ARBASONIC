import React, { useState, useEffect } from 'react';
import {
  Database,
  Tag,
  Tv,
  Plug,
  AlertTriangle,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Save,
  CheckCircle2,
  EyeOff,
  Eye,
  AlertCircle
} from 'lucide-react';

const TABS = [
  { id: 'marca', label: 'Marcas', singular: 'Marca', icon: Tag, placeholder: 'Ej. Panasonic, Kalley, Yamaha...' },
  { id: 'tipo_equipo', label: 'Tipos de Aparato', singular: 'Tipo de Aparato', icon: Tv, placeholder: 'Ej. Televisor, Barra de sonido...' },
  { id: 'accesorio', label: 'Accesorios', singular: 'Accesorio', icon: Plug, placeholder: 'Ej. Cable HDMI, Base de pared...' },
  { id: 'dano', label: 'Daños / Fallas', singular: 'Daño / Falla', icon: AlertTriangle, placeholder: 'Ej. Se apaga a los 5 minutos...' }
];

export default function CatalogosView({ isDarkMode, onCatalogsChanged }) {
  const [activeCatalog, setActiveCatalog] = useState('marca');
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [quickValue, setQuickValue] = useState('');
  const [addingQuick, setAddingQuick] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal Edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editValor, setEditValor] = useState('');
  const [updateOrders, setUpdateOrders] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const notify = (msg) => {
    setErrorMsg('');
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  const loadItems = async () => {
    try {
      const res = await fetch('/api/catalogos/detalle');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error('Error cargando detalle de catálogos:', err);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const currentTabMeta = TABS.find((t) => t.id === activeCatalog);
  const itemsForTab = items.filter((i) => i.tipo_catalogo === activeCatalog);
  const filteredItems = itemsForTab.filter((i) =>
    !search.trim() || i.valor.toLowerCase().includes(search.trim().toLowerCase())
  );

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!quickValue.trim()) return;

    setAddingQuick(true);
    try {
      const res = await fetch('/api/catalogos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_catalogo: activeCatalog,
          valor: quickValue.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuickValue('');
        notify(`"${data.valor}" agregado a ${currentTabMeta.label}.`);
        await loadItems();
        if (onCatalogsChanged) onCatalogsChanged();
      } else {
        setErrorMsg(data.message || 'No se pudo agregar el elemento.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor.');
    } finally {
      setAddingQuick(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditValor(item.valor);
    setUpdateOrders(true);
    setEditError('');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editValor.trim()) {
      setEditError('El nombre no puede quedar vacío.');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/catalogos/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: editValor.trim(),
          actualizar_equipos: updateOrders
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        notify('Opción actualizada correctamente.');
        await loadItems();
        if (onCatalogsChanged) onCatalogsChanged();
      } else {
        setEditError(data.message || 'Error al actualizar.');
      }
    } catch (err) {
      setEditError('Error de conexión con el servidor.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const res = await fetch(`/api/catalogos/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: item.activo === 1 ? 0 : 1 })
      });
      const data = await res.json();
      if (data.success) {
        notify(item.activo === 1 ? `"${item.valor}" ocultado de los selectores.` : `"${item.valor}" activado nuevamente.`);
        await loadItems();
        if (onCatalogsChanged) onCatalogsChanged();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (item) => {
    const msg = item.uso_count > 0
      ? `"${item.valor}" está usado en ${item.uso_count} orden(es). Al eliminarlo del catálogo dejará de aparecer como opción nueva, pero tus órdenes ya guardadas no se perderán. ¿Continuar?`
      : `¿Eliminar "${item.valor}" del catálogo de ${currentTabMeta.label}?`;

    if (!window.confirm(msg)) return;

    try {
      const res = await fetch(`/api/catalogos/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        notify(`"${item.valor}" eliminado del catálogo.`);
        await loadItems();
        if (onCatalogsChanged) onCatalogsChanged();
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

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#00c6ff] text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2">
          <span>✓</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-500" />
            <span>Catálogos del Sistema</span>
          </h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Administra las listas desplegables de marcas, aparatos, accesorios y fallas usadas al registrar órdenes.
          </p>
        </div>
      </div>

      {/* 4 Selector Cards (Marcas, Tipos, Accesorios, Daños) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count = items.filter((i) => i.tipo_catalogo === tab.id && i.activo === 1).length;
          const isActive = activeCatalog === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCatalog(tab.id);
                setSearch('');
                setErrorMsg('');
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-gradient-to-r from-[#00c6ff] to-[#0072ff] text-white border-transparent shadow-lg shadow-sky-500/25 scale-[1.01]'
                  : isDarkMode
                    ? 'bg-[#0c162b] border-[#1b2b4d] text-slate-200 hover:border-cyan-500/40'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-cyan-400 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : isDarkMode ? 'bg-[#132240] text-cyan-400' : 'bg-sky-50 text-sky-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">{tab.label}</p>
                  <p className={`text-[11px] ${isActive ? 'text-sky-100' : isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {count} opciones activas
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Catalog Card */}
      <div className={`rounded-2xl border p-5 shadow-sm overflow-hidden ${cardBg}`}>
        {/* Quick Add + Search Bar */}
        <div className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b mb-4 ${
          isDarkMode ? 'border-[#182744]' : 'border-slate-100'
        }`}>
          {/* Quick Add Form */}
          <form onSubmit={handleQuickAdd} className="flex items-center gap-2 flex-1 max-w-xl">
            <input
              type="text"
              value={quickValue}
              onChange={(e) => setQuickValue(e.target.value)}
              placeholder={`Agregar nuevo ${currentTabMeta.singular.toLowerCase()}... (${currentTabMeta.placeholder})`}
              className={`flex-1 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 ${inputBg}`}
            />
            <button
              type="submit"
              disabled={addingQuick || !quickValue.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-sky-500/20 disabled:opacity-50 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </form>

          {/* Search inside catalog */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar en ${currentTabMeta.label.toLowerCase()}...`}
              className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 ${inputBg}`}
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${tableHeaderBg}`}>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Nombre / Opción</th>
                <th className="py-3 px-4 text-center">Uso en Órdenes</th>
                <th className="py-3 px-4 text-center">Visibilidad</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${rowDivider}`}>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-400">
                    No se encontraron opciones en {currentTabMeta.label}.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className={isDarkMode ? 'hover:bg-[#111f3a]' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className={`py-3 px-4 font-bold ${
                      item.activo === 0
                        ? 'line-through text-slate-400'
                        : isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.valor}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {item.uso_count > 0 ? (
                        <span className={`inline-block whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isDarkMode
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {item.uso_count} {item.uso_count === 1 ? 'orden' : 'órdenes'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Sin registros</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(item)}
                        title={item.activo === 1 ? 'Clic para ocultar de los selectores' : 'Clic para reactivar'}
                        className={`inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors ${
                          item.activo === 1
                            ? isDarkMode
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : isDarkMode
                              ? 'bg-slate-700/60 text-slate-400 border border-slate-600'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {item.activo === 1 ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Oculto</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Editar / Corregir nombre"
                          className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Eliminar del catálogo"
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

      {/* Modal Editar Opción */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1426] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-white text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <span>Editar {currentTabMeta.singular}</span>
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Nombre / Texto de la opción *</label>
                <input
                  type="text"
                  required
                  value={editValor}
                  onChange={(e) => setEditValor(e.target.value)}
                  className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                />
              </div>

              {editingItem.uso_count > 0 && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0f1d38] border border-cyan-500/30 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={updateOrders}
                    onChange={(e) => setUpdateOrders(e.target.checked)}
                    className="mt-0.5 rounded accent-cyan-400"
                  />
                  <span>
                    Actualizar automáticamente las <strong>{editingItem.uso_count}</strong> orden(es) existentes que tienen este nombre.
                  </span>
                </label>
              )}

              <div className="pt-3 border-t border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] font-bold text-white shadow-lg shadow-cyan-900/30 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingEdit ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
