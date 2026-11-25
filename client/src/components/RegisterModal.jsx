import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Edit3, 
  User, 
  Tv, 
  Wrench, 
  Check, 
  AlertCircle, 
  Cpu,
  Layers,
  Save
} from 'lucide-react';
import SearchableSelect from './SearchableSelect';

export default function RegisterModal({
  isOpen,
  onClose,
  onSuccess,
  catalogos,
  equipoToEdit = null
}) {
  const isEditing = Boolean(equipoToEdit);

  // Form State
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_cedula: '',
    cliente_telefono: '',
    cliente_direccion: '',
    tipo_equipo: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    accesorios: '',
    dano_reportado: '',
    diagnostico_tecnico: '',
    estado: 'Pendiente',
    costo_estimado: '',
    costo_final: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    fecha_entrega: '',
    notas: '',
    tecnico_encargado: 'Arnulfo Barrios',
    condicion_ingreso: 'Normal',
    estado_main: 'Por revisar',
    estado_fuente: 'Por revisar',
    estado_tcon: 'No aplica',
    estado_pantalla: 'Por revisar',
    trabajo_realizado: '',
    repuestos_utilizados: ''
  });

  // State for "Otros" fields
  const [isOtherTipo, setIsOtherTipo] = useState(false);
  const [customTipo, setCustomTipo] = useState('');
  const [saveCustomTipo, setSaveCustomTipo] = useState(true);

  const [isOtherMarca, setIsOtherMarca] = useState(false);
  const [customMarca, setCustomMarca] = useState('');
  const [saveCustomMarca, setSaveCustomMarca] = useState(true);

  const [isOtherAccesorio, setIsOtherAccesorio] = useState(false);
  const [customAccesorio, setCustomAccesorio] = useState('');

  const [isOtherDano, setIsOtherDano] = useState(false);
  const [customDano, setCustomDano] = useState('');
  const [saveCustomDano, setSaveCustomDano] = useState(true);

  // Autocomplete feedback
  const [searchingClient, setSearchingClient] = useState(false);
  const [clientFoundBadge, setClientFoundBadge] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showTechDiagnostic, setShowTechDiagnostic] = useState(true);

  // Pre-fill when editing
  useEffect(() => {
    if (equipoToEdit) {
      setFormData({
        cliente_nombre: equipoToEdit.cliente_nombre || '',
        cliente_cedula: equipoToEdit.cliente_cedula || '',
        cliente_telefono: equipoToEdit.cliente_telefono || '',
        cliente_direccion: equipoToEdit.cliente_direccion || '',
        tipo_equipo: equipoToEdit.tipo_equipo || '',
        marca: equipoToEdit.marca || '',
        modelo: equipoToEdit.modelo || '',
        numero_serie: equipoToEdit.numero_serie || '',
        accesorios: equipoToEdit.accesorios || '',
        dano_reportado: equipoToEdit.dano_reportado || '',
        diagnostico_tecnico: equipoToEdit.diagnostico_tecnico || '',
        estado: equipoToEdit.estado || 'Pendiente',
        costo_estimado: equipoToEdit.costo_estimado || '',
        costo_final: equipoToEdit.costo_final || '',
        fecha_ingreso: equipoToEdit.fecha_ingreso || new Date().toISOString().split('T')[0],
        fecha_entrega: equipoToEdit.fecha_entrega || '',
        notas: equipoToEdit.notas || '',
        tecnico_encargado: equipoToEdit.tecnico_encargado || 'Arnulfo Barrios',
        condicion_ingreso: equipoToEdit.condicion_ingreso || 'Normal',
        estado_main: equipoToEdit.estado_main || 'Por revisar',
        estado_fuente: equipoToEdit.estado_fuente || 'Por revisar',
        estado_tcon: equipoToEdit.estado_tcon || 'No aplica',
        estado_pantalla: equipoToEdit.estado_pantalla || 'Por revisar',
        trabajo_realizado: equipoToEdit.trabajo_realizado || '',
        repuestos_utilizados: equipoToEdit.repuestos_utilizados || ''
      });

      if (equipoToEdit.tipo_equipo && !catalogos?.tipos?.includes(equipoToEdit.tipo_equipo)) {
        setIsOtherTipo(true);
        setCustomTipo(equipoToEdit.tipo_equipo);
      } else {
        setIsOtherTipo(false);
      }

      if (equipoToEdit.marca && !catalogos?.marcas?.includes(equipoToEdit.marca)) {
        setIsOtherMarca(true);
        setCustomMarca(equipoToEdit.marca);
      } else {
        setIsOtherMarca(false);
      }

      if (equipoToEdit.accesorios && !catalogos?.accesorios?.includes(equipoToEdit.accesorios)) {
        setIsOtherAccesorio(true);
        setCustomAccesorio(equipoToEdit.accesorios);
      } else {
        setIsOtherAccesorio(false);
      }

      if (equipoToEdit.dano_reportado && !catalogos?.danos?.includes(equipoToEdit.dano_reportado)) {
        setIsOtherDano(true);
        setCustomDano(equipoToEdit.dano_reportado);
      } else {
        setIsOtherDano(false);
      }
    } else {
      setFormData({
        cliente_nombre: '',
        cliente_cedula: '',
        cliente_telefono: '',
        cliente_direccion: '',
        tipo_equipo: catalogos?.tipos?.[0] || 'Televisor',
        marca: catalogos?.marcas?.[0] || 'Samsung',
        modelo: '',
        numero_serie: '',
        accesorios: catalogos?.accesorios?.[0] || 'Cable de poder',
        dano_reportado: catalogos?.danos?.[0] || 'No enciende',
        diagnostico_tecnico: '',
        estado: 'Pendiente',
        costo_estimado: '',
        costo_final: '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        fecha_entrega: '',
        notas: '',
        tecnico_encargado: 'Arnulfo Barrios',
        condicion_ingreso: 'Normal',
        estado_main: 'Por revisar',
        estado_fuente: 'Por revisar',
        estado_tcon: 'No aplica',
        estado_pantalla: 'Por revisar',
        trabajo_realizado: '',
        repuestos_utilizados: ''
      });
      setIsOtherTipo(false);
      setCustomTipo('');
      setIsOtherMarca(false);
      setCustomMarca('');
      setIsOtherAccesorio(false);
      setCustomAccesorio('');
      setIsOtherDano(false);
      setCustomDano('');
      setClientFoundBadge(false);
    }
    setErrorMsg('');
  }, [equipoToEdit, isOpen]);

  // Autocomplete client info when typing Cédula
  const handleCedulaChange = async (cedulaValue) => {
    setFormData(prev => ({ ...prev, cliente_cedula: cedulaValue }));
    if (cedulaValue.trim().length >= 6) {
      setSearchingClient(true);
      try {
        const res = await fetch(`/api/clientes/cedula/${encodeURIComponent(cedulaValue.trim())}`);
        const data = await res.json();
        if (data.success && data.data) {
          setFormData(prev => ({
            ...prev,
            cliente_nombre: data.data.nombre || prev.cliente_nombre,
            cliente_telefono: data.data.telefono || prev.cliente_telefono,
            cliente_direccion: data.data.direccion || prev.cliente_direccion
          }));
          setClientFoundBadge(true);
        } else {
          setClientFoundBadge(false);
        }
      } catch (err) {
        setClientFoundBadge(false);
      } finally {
        setSearchingClient(false);
      }
    } else {
      setClientFoundBadge(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const finalTipo = isOtherTipo ? customTipo.trim() : formData.tipo_equipo;
    const finalMarca = isOtherMarca ? customMarca.trim() : formData.marca;
    const finalAccesorios = isOtherAccesorio ? customAccesorio.trim() : formData.accesorios;
    const finalDano = isOtherDano ? customDano.trim() : formData.dano_reportado;

    if (!formData.cliente_nombre.trim() || !formData.cliente_cedula.trim()) {
      setErrorMsg('Nombre y Cédula del cliente son obligatorios.');
      return;
    }
    if (!finalTipo) {
      setErrorMsg('Debe especificar el Tipo de Aparato.');
      return;
    }
    if (!finalMarca) {
      setErrorMsg('Debe especificar la Marca del aparato.');
      return;
    }
    if (!finalDano) {
      setErrorMsg('Debe especificar el Daño que presenta.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        tipo_equipo: finalTipo,
        marca: finalMarca,
        accesorios: finalAccesorios || 'No aplica',
        dano_reportado: finalDano,
        guardar_en_catalogo: {
          tipo_equipo: isOtherTipo && saveCustomTipo,
          marca: isOtherMarca && saveCustomMarca,
          dano: isOtherDano && saveCustomDano
        }
      };

      const url = isEditing ? `/api/equipos/${equipoToEdit.id}` : '/api/equipos';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        onSuccess(isEditing ? 'Equipo actualizado con éxito' : 'Equipo registrado con éxito');
        onClose();
      } else {
        setErrorMsg(data.message || 'Error al procesar la solicitud');
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0b1426] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-8 max-h-[94vh] flex flex-col tech-glow-blue animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-[#1b2b4d] bg-gradient-to-r from-[#0d1a33] via-[#0e2142] to-[#0d1a33] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-bold text-white tracking-wide leading-tight truncate">
                {isEditing ? `Modificar Orden #${equipoToEdit.id}` : 'Registrar Orden de Servicio'}
              </h3>
              <p className="text-[11px] sm:text-xs text-cyan-400 font-medium truncate">
                ARBASONIC Reparación Electrónica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Datos del Cliente */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0f1d38]/70 border border-[#1b2f57]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-[#1b2f57] pb-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm">
                <User className="w-4 h-4 shrink-0" />
                <span>1. Datos del Cliente</span>
              </div>
              {clientFoundBadge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Check className="w-3 h-3" />
                  Cliente registrado
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Cédula / Documento de Identidad <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.cliente_cedula}
                    onChange={(e) => handleCedulaChange(e.target.value)}
                    placeholder="Ej. 11908332"
                    className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                  {searchingClient && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 animate-spin">
                      ⏳
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Nombre Completo del Cliente <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.cliente_nombre}
                  onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                  placeholder="Ej. Arnulfo Barrios Bustamante"
                  className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Teléfono / Celular (WhatsApp)
                </label>
                <input
                  type="tel"
                  value={formData.cliente_telefono}
                  onChange={(e) => setFormData({ ...formData, cliente_telefono: e.target.value })}
                  placeholder="Ej. 302 312 3654"
                  className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.cliente_direccion}
                  onChange={(e) => setFormData({ ...formData, cliente_direccion: e.target.value })}
                  placeholder="Ej. Calle 60A #15E 33"
                  className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Datos del Dispositivo */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0f1d38]/70 border border-[#1b2f57]">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm mb-3 border-b border-[#1b2f57] pb-2">
              <Tv className="w-4 h-4 shrink-0" />
              <span>2. Datos del Dispositivo y Recepción</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Tipo */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Tipo de Aparato <span className="text-cyan-400">*</span>
                </label>
                <SearchableSelect
                  options={catalogos?.tipos || []}
                  value={formData.tipo_equipo}
                  isOther={isOtherTipo}
                  otherLabel="Otro tipo de aparato (especificar...)"
                  searchPlaceholder="Buscar tipo de aparato..."
                  onSelectOption={(val) => {
                    setIsOtherTipo(false);
                    setFormData({ ...formData, tipo_equipo: val });
                  }}
                  onSelectOther={(prefill) => {
                    setIsOtherTipo(true);
                    if (prefill) setCustomTipo(prefill);
                  }}
                />

                {isOtherTipo && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#081224] border border-cyan-500/40">
                    <input
                      type="text"
                      required
                      placeholder="Escriba el tipo de aparato..."
                      value={customTipo}
                      onChange={(e) => setCustomTipo(e.target.value)}
                      className="w-full bg-[#111f38] border border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <label className="flex items-center gap-2 mt-1.5 text-[11px] text-cyan-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveCustomTipo}
                        onChange={(e) => setSaveCustomTipo(e.target.checked)}
                        className="rounded accent-cyan-400"
                      />
                      <span>Guardar en el catálogo permanente</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Marca */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Marca <span className="text-cyan-400">*</span>
                </label>
                <SearchableSelect
                  options={catalogos?.marcas || []}
                  value={formData.marca}
                  isOther={isOtherMarca}
                  otherLabel="Otra marca (especificar...)"
                  searchPlaceholder="Escribir marca (ej. Samsung, LG)..."
                  onSelectOption={(val) => {
                    setIsOtherMarca(false);
                    setFormData({ ...formData, marca: val });
                  }}
                  onSelectOther={(prefill) => {
                    setIsOtherMarca(true);
                    if (prefill) setCustomMarca(prefill);
                  }}
                />

                {isOtherMarca && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#081224] border border-cyan-500/40">
                    <input
                      type="text"
                      required
                      placeholder="Escriba la marca..."
                      value={customMarca}
                      onChange={(e) => setCustomMarca(e.target.value)}
                      className="w-full bg-[#111f38] border border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <label className="flex items-center gap-2 mt-1.5 text-[11px] text-cyan-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveCustomMarca}
                        onChange={(e) => setSaveCustomMarca(e.target.checked)}
                        className="rounded accent-cyan-400"
                      />
                      <span>Guardar en el catálogo permanente</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Modelo del Aparato
                </label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  placeholder="Ej. UN55AU7000, MHC-V73D"
                  className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              {/* Serie */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Número de Serie
                </label>
                <input
                  type="text"
                  value={formData.numero_serie}
                  onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                  placeholder="Ej. 23565"
                  className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-slate-100 font-mono"
                />
              </div>

              {/* Accesorios */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Accesorios Entregados
                </label>
                <SearchableSelect
                  options={catalogos?.accesorios || []}
                  value={formData.accesorios}
                  isOther={isOtherAccesorio}
                  otherLabel="Otro accesorio (especificar...)"
                  searchPlaceholder="Buscar accesorio..."
                  onSelectOption={(val) => {
                    setIsOtherAccesorio(false);
                    setFormData({ ...formData, accesorios: val });
                  }}
                  onSelectOther={(prefill) => {
                    setIsOtherAccesorio(true);
                    if (prefill) setCustomAccesorio(prefill);
                  }}
                />

                {isOtherAccesorio && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#081224] border border-cyan-500/40">
                    <input
                      type="text"
                      placeholder="Describa los accesorios..."
                      value={customAccesorio}
                      onChange={(e) => setCustomAccesorio(e.target.value)}
                      className="w-full bg-[#111f38] border border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* Daño */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Daño que Presenta <span className="text-cyan-400">*</span>
                </label>
                <SearchableSelect
                  options={catalogos?.danos || []}
                  value={formData.dano_reportado}
                  isOther={isOtherDano}
                  otherLabel="Otro daño / falla (especificar...)"
                  searchPlaceholder="Buscar falla (ej. no enciende, rayas)..."
                  onSelectOption={(val) => {
                    setIsOtherDano(false);
                    setFormData({ ...formData, dano_reportado: val });
                  }}
                  onSelectOther={(prefill) => {
                    setIsOtherDano(true);
                    if (prefill) setCustomDano(prefill);
                  }}
                />

                {isOtherDano && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#081224] border border-cyan-500/40">
                    <input
                      type="text"
                      required
                      placeholder="Describa el daño o problema..."
                      value={customDano}
                      onChange={(e) => setCustomDano(e.target.value)}
                      className="w-full bg-[#111f38] border border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <label className="flex items-center gap-2 mt-1.5 text-[11px] text-cyan-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveCustomDano}
                        onChange={(e) => setSaveCustomDano(e.target.checked)}
                        className="rounded accent-cyan-400"
                      />
                      <span>Guardar en el catálogo permanente</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Condición de Ingreso */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Condición Física al Ingresar
                </label>
                <input
                  type="text"
                  value={formData.condicion_ingreso}
                  onChange={(e) => setFormData({ ...formData, condicion_ingreso: e.target.value })}
                  placeholder="Ej. Normal, Rayado, Pantalla partida, etc."
                  className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-slate-100"
                />
              </div>

              {/* Técnico Encargado */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Técnico Encargado
                </label>
                <input
                  type="text"
                  value={formData.tecnico_encargado}
                  onChange={(e) => setFormData({ ...formData, tecnico_encargado: e.target.value })}
                  placeholder="Ej. Arnulfo Barrios"
                  className="w-full bg-[#132240] border border-[#233a66] focus:border-cyan-400 rounded-xl px-3.5 py-2 text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 3. Diagnóstico Técnico Especializado de Tarjetas Electrónicas */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0f1d38]/70 border border-cyan-500/30">
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3 border-b border-[#1b2f57] pb-2">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>3. Diagnóstico de Tarjetas Electrónicas</span>
              </div>
              <span className="text-[11px] text-slate-400">TV & Audio Profesional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Main */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Tarjeta Main</label>
                <select
                  value={formData.estado_main}
                  onChange={(e) => setFormData({ ...formData, estado_main: e.target.value })}
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Por revisar">Por revisar</option>
                  <option value="Buena">Buena</option>
                  <option value="Dañada / En corto">Dañada / En corto</option>
                  <option value="Reparada">Reparada</option>
                  <option value="Descontinuada">Descontinuada</option>
                  <option value="No aplica">No aplica</option>
                </select>
              </div>

              {/* Fuente */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Tarjeta Fuente</label>
                <select
                  value={formData.estado_fuente}
                  onChange={(e) => setFormData({ ...formData, estado_fuente: e.target.value })}
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Por revisar">Por revisar</option>
                  <option value="Buena">Buena</option>
                  <option value="Dañada / En corto">Dañada / En corto</option>
                  <option value="Reparada">Reparada</option>
                  <option value="No aplica">No aplica</option>
                </select>
              </div>

              {/* T-Con */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Tarjeta T-Con</label>
                <select
                  value={formData.estado_tcon}
                  onChange={(e) => setFormData({ ...formData, estado_tcon: e.target.value })}
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="No aplica">No aplica</option>
                  <option value="Por revisar">Por revisar</option>
                  <option value="Buena">Buena</option>
                  <option value="Dañada">Dañada</option>
                  <option value="Reparada">Reparada</option>
                </select>
              </div>

              {/* Pantalla */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Panel / Pantalla</label>
                <select
                  value={formData.estado_pantalla}
                  onChange={(e) => setFormData({ ...formData, estado_pantalla: e.target.value })}
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-slate-100"
                >
                  <option value="Por revisar">Por revisar</option>
                  <option value="Buena">Buena</option>
                  <option value="Partida / Daño físico">Partida / Daño físico</option>
                  <option value="Tiras LED dañadas">Tiras LED dañadas</option>
                  <option value="Líneas en pantalla">Líneas en pantalla</option>
                  <option value="No aplica">No aplica</option>
                </select>
              </div>
            </div>

            {/* Trabajo Realizado y Repuestos Usados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3.5 sm:mt-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Trabajo Realizado</label>
                <textarea
                  rows={2}
                  value={formData.trabajo_realizado}
                  onChange={(e) => setFormData({ ...formData, trabajo_realizado: e.target.value })}
                  placeholder="Detalle de componentes reparados, soldaduras, etc."
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3.5 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Repuestos Utilizados</label>
                <textarea
                  rows={2}
                  value={formData.repuestos_utilizados}
                  onChange={(e) => setFormData({ ...formData, repuestos_utilizados: e.target.value })}
                  placeholder="Código o descripción de repuestos utilizados (ej. REP-001, LEDs 32')"
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3.5 py-2 text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 4. Estado del Servicio y Costos */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0f1d38]/70 border border-[#1b2f57]">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm mb-3 border-b border-[#1b2f57] pb-2">
              <Wrench className="w-4 h-4 shrink-0" />
              <span>4. Estado del Servicio y Costos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Estado de la Orden</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-slate-100 cursor-pointer"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Reparación">En Reparación</option>
                  <option value="Reparado">Reparado</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Fecha de Ingreso</label>
                <input
                  type="date"
                  value={formData.fecha_ingreso}
                  onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Costo Estimado ($ COP)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.costo_estimado}
                  onChange={(e) => setFormData({ ...formData, costo_estimado: e.target.value })}
                  placeholder="Ej. 150000"
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Costo Final ($ COP)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.costo_final}
                  onChange={(e) => setFormData({ ...formData, costo_final: e.target.value })}
                  placeholder="Ej. 150000"
                  className="w-full bg-[#132240] border border-[#233a66] rounded-xl px-3 py-2 text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-[#1b2b4d] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-sky-500/25 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Guardando en Base de Datos...' : isEditing ? 'Guardar Cambios' : 'Registrar Orden'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
