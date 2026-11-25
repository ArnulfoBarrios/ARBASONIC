import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus, X } from 'lucide-react';

/**
 * Selector desplegable compacto con buscador opcional, modo claro/oscuro
 * y soporte opcional de "+ Otro". Limita la altura a ~5-6 opciones visibles.
 */
export default function SearchableSelect({
  options = [],
  value,
  isOther = false,
  allowOther = true,
  searchable = true,
  compact = false,
  isDarkMode = true,
  allOptionLabel = null,
  otherLabel = 'Otro (especificar...)',
  placeholder = 'Seleccionar...',
  searchPlaceholder = 'Buscar...',
  onSelectOption,
  onSelectOther
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 20);
      }
    }
  }, [open, searchable]);

  const normalize = (s) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const trimmedQuery = query.trim();
  const normQuery = normalize(trimmedQuery);

  const filtered = options.filter((opt) =>
    !normQuery || normalize(opt).includes(normQuery)
  );

  const exactMatch = options.some(
    (opt) => normalize(opt) === normQuery
  );

  const displayLabel = isOther ? `+ ${otherLabel}` : (value || allOptionLabel || placeholder);

  // Estilos adaptables Modo Claro / Modo Oscuro
  const triggerClass = isDarkMode
    ? open
      ? 'bg-[#132240] border-cyan-400 ring-1 ring-cyan-500/40 text-slate-100'
      : 'bg-[#132240] border-[#233a66] hover:border-cyan-500/60 text-slate-100'
    : open
      ? 'bg-white border-cyan-500 ring-1 ring-cyan-500/30 text-slate-900'
      : 'bg-[#f8fafc] border-slate-200 hover:border-cyan-400 text-slate-800';

  const panelClass = isDarkMode
    ? 'bg-[#0b152a] border-cyan-500/40 shadow-2xl'
    : 'bg-white border-slate-200 shadow-xl';

  const searchBarClass = isDarkMode
    ? 'border-[#1b2f57] bg-[#0e1b36]'
    : 'border-slate-100 bg-slate-50';

  const searchInputClass = isDarkMode
    ? 'bg-[#132240] border-[#233a66] focus:border-cyan-400 text-white placeholder-slate-400'
    : 'bg-white border-slate-200 focus:border-cyan-500 text-slate-900 placeholder-slate-400';

  const dividerClass = isDarkMode ? 'divide-[#152445]/40' : 'divide-slate-100';

  const getOptionClass = (selected) => {
    if (selected) {
      return isDarkMode
        ? 'bg-cyan-500/15 text-cyan-300 font-semibold'
        : 'bg-sky-50 text-sky-700 font-semibold';
    }
    return isDarkMode
      ? 'text-slate-200 hover:bg-[#162952] hover:text-white'
      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900';
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between text-left border rounded-xl text-xs transition-colors cursor-pointer focus:outline-none ${
          compact ? 'px-3 py-1.5' : 'px-3.5 py-2'
        } ${triggerClass}`}
      >
        <span className={`truncate ${isOther ? 'text-cyan-400 font-semibold' : ''}`}>
          {displayLabel}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 ml-2 transition-transform duration-150 ${
            open ? 'rotate-180 text-cyan-500' : 'text-slate-400'
          }`}
        />
      </button>

      {/* Panel desplegable compacto */}
      {open && (
        <div className={`absolute left-0 right-0 min-w-[190px] mt-1.5 z-50 border rounded-xl overflow-hidden ${panelClass}`}>
          {/* Buscador fijo arriba */}
          {searchable && (
            <div className={`p-2 border-b ${searchBarClass}`}>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`w-full border rounded-lg pl-8 pr-7 py-1.5 text-xs focus:outline-none ${searchInputClass}`}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Lista compacta con scroll suave (~5-6 elementos visibles) */}
          <div className={`max-h-52 overflow-y-auto py-1 divide-y ${dividerClass}`}>
            {/* Opción "Todas / Todos" si se configuró */}
            {allOptionLabel && !trimmedQuery && (
              <button
                type="button"
                onClick={() => {
                  onSelectOption(allOptionLabel);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${getOptionClass(
                  !isOther && value === allOptionLabel
                )}`}
              >
                <span className="truncate">{allOptionLabel}</span>
                {!isOther && value === allOptionLabel && (
                  <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0 ml-2" />
                )}
              </button>
            )}

            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-center text-[11px] text-slate-400">
                No hay coincidencias para "{trimmedQuery}"
              </div>
            ) : (
              filtered.map((opt, idx) => {
                const selected = !isOther && value === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSelectOption(opt);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${getOptionClass(selected)}`}
                  >
                    <span className="truncate">{opt}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-cyan-500 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}

            {/* Atajo inteligente si escribió algo nuevo que no existe (solo si allowOther) */}
            {allowOther && trimmedQuery && !exactMatch && onSelectOther && (
              <button
                type="button"
                onClick={() => {
                  onSelectOther(trimmedQuery);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Usar "{trimmedQuery}"</span>
              </button>
            )}
          </div>

          {/* Pie fijo siempre visible: "+ Otro" */}
          {allowOther && onSelectOther && (
            <button
              type="button"
              onClick={() => {
                onSelectOther('');
                setOpen(false);
              }}
              className={`w-full flex items-center gap-1.5 px-3 py-2 text-left text-xs font-bold border-t transition-colors ${
                isDarkMode
                  ? 'text-cyan-400 bg-[#081123] hover:bg-[#112142] border-[#1b2f57]'
                  : 'text-sky-600 bg-slate-50 hover:bg-sky-50 border-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>{otherLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
