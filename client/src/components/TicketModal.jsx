import React from 'react';
import { 
  X, 
  Printer, 
  Phone, 
  MapPin, 
  Tv, 
  User, 
  FileText, 
  MessageCircle,
  Cpu,
  Wrench
} from 'lucide-react';
import logo from '../assets/logo.jpg';

export default function TicketModal({ isOpen, onClose, equipo, onEdit }) {
  if (!isOpen || !equipo) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedId = String(equipo.id).padStart(5, '0');
  const whatsappUrl = equipo.cliente_telefono 
    ? `https://wa.me/57${equipo.cliente_telefono.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(equipo.cliente_nombre)},%20te%20escribimos%20de%20ARBASONIC%20sobre%20tu%20equipo%20${encodeURIComponent(equipo.tipo_equipo)}%20${encodeURIComponent(equipo.marca)}%20(Orden%20%23${formattedId}).`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      
      <div className="relative w-full max-w-3xl bg-[#0b1426] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black print:rounded-none">
        
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="p-4 border-b border-[#1b2b4d] bg-gradient-to-r from-[#0d1a33] via-[#0e2142] to-[#0d1a33] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Ficha Técnica & Orden de Servicio #{formattedId}
              </h3>
              <p className="text-xs text-cyan-400 font-mono">
                {equipo.tipo_equipo} {equipo.marca} {equipo.modelo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Contactar al cliente por WhatsApp"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#091120] font-bold text-xs transition-colors shadow-md shadow-cyan-900/30"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ticket</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE TICKET SHEET */}
        <div id="printable-ticket" className="p-6 md:p-8 overflow-y-auto text-slate-200 text-xs print:text-black print:p-6 print:overflow-visible">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-cyan-500/40 pb-5 mb-5 print:border-black">
            <div className="flex items-center gap-4">
              <img 
                src={logo} 
                alt="ARBASONIC" 
                className="w-16 h-16 object-contain rounded-lg border border-slate-700 p-1 bg-white print:border-black" 
              />
              <div>
                <h1 className="text-xl font-black text-white print:text-black tracking-wide">
                  ARBASONIC
                </h1>
                <p className="text-xs font-bold text-cyan-400 print:text-black uppercase tracking-wider">
                  Reparación Electrónica Especializada
                </p>
                <p className="text-[11px] text-slate-400 print:text-black mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400 print:text-black inline" />
                  Calle 60A #15E-33 Bella Murillo • Soledad, Atlántico
                </p>
                <p className="text-[11px] text-slate-400 print:text-black flex items-center gap-1">
                  <Phone className="w-3 h-3 text-cyan-400 print:text-black inline" />
                  WhatsApp: <strong>300 703 9741</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 print:border-black print:bg-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 print:text-black block">Orden de Servicio</span>
                <span className="text-lg font-black font-mono text-cyan-300 print:text-black">#{formattedId}</span>
              </div>
              <p className="text-[11px] text-slate-400 print:text-black mt-1 font-mono">
                Fecha: {equipo.fecha_ingreso}
              </p>
              <p className="text-[10px] font-semibold text-cyan-400 print:text-black mt-0.5">
                Técnico: {equipo.tecnico_encargado || 'Arnulfo Barrios'}
              </p>
            </div>
          </div>

          {/* Grid: Cliente & Dispositivo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Cliente */}
            <div className="p-3.5 rounded-xl bg-[#0e1b36] border border-[#1d3159] print:bg-white print:border-black">
              <h4 className="font-bold text-cyan-300 print:text-black text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-[#1d3159] pb-1 print:border-black">
                <User className="w-3.5 h-3.5" />
                Información del Cliente
              </h4>
              <div className="space-y-1 text-[11px]">
                <p><span className="text-slate-400 print:text-black font-medium">Nombre:</span> <strong className="text-white print:text-black">{equipo.cliente_nombre}</strong></p>
                <p><span className="text-slate-400 print:text-black font-medium">Cédula:</span> <strong className="font-mono text-white print:text-black">{equipo.cliente_cedula}</strong></p>
                <p><span className="text-slate-400 print:text-black font-medium">Teléfono:</span> <span className="font-mono text-white print:text-black">{equipo.cliente_telefono || 'No registrado'}</span></p>
                <p><span className="text-slate-400 print:text-black font-medium">Dirección:</span> <span className="text-white print:text-black">{equipo.cliente_direccion || 'No registrada'}</span></p>
              </div>
            </div>

            {/* Dispositivo */}
            <div className="p-3.5 rounded-xl bg-[#0e1b36] border border-[#1d3159] print:bg-white print:border-black">
              <h4 className="font-bold text-cyan-300 print:text-black text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-[#1d3159] pb-1 print:border-black">
                <Tv className="w-3.5 h-3.5" />
                Datos del Dispositivo
              </h4>
              <div className="space-y-1 text-[11px]">
                <p><span className="text-slate-400 print:text-black font-medium">Tipo:</span> <strong className="text-white print:text-black">{equipo.tipo_equipo}</strong></p>
                <p><span className="text-slate-400 print:text-black font-medium">Marca:</span> <strong className="text-cyan-300 print:text-black">{equipo.marca}</strong></p>
                <p><span className="text-slate-400 print:text-black font-medium">Modelo:</span> <span className="text-white print:text-black">{equipo.modelo || '-'}</span></p>
                <p><span className="text-slate-400 print:text-black font-medium">Nº Serie:</span> <span className="font-mono text-white print:text-black">{equipo.numero_serie || '-'}</span></p>
                <p><span className="text-slate-400 print:text-black font-medium">Condición de Ingreso:</span> <span className="text-white print:text-black">{equipo.condicion_ingreso || 'Normal'}</span></p>
              </div>
            </div>
          </div>

          {/* Tarjetas Electrónicas Diagnostic Sheet */}
          <div className="p-3.5 rounded-xl bg-[#0e1b36] border border-cyan-500/20 print:bg-slate-50 print:border-black mb-5">
            <h4 className="font-bold text-cyan-300 print:text-black text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5 border-b border-[#1d3159] pb-1 print:border-black">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Estado de Módulos Electrónicos (Diagnóstico de Taller)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-[#122245] print:bg-white border border-[#1b2f5c] print:border-slate-300">
                <span className="text-slate-400 print:text-black block text-[10px] font-semibold">Tarjeta Main</span>
                <strong className="text-white print:text-black">{equipo.estado_main || 'Por revisar'}</strong>
              </div>
              <div className="p-2 rounded-lg bg-[#122245] print:bg-white border border-[#1b2f5c] print:border-slate-300">
                <span className="text-slate-400 print:text-black block text-[10px] font-semibold">Tarjeta Fuente</span>
                <strong className="text-white print:text-black">{equipo.estado_fuente || 'Por revisar'}</strong>
              </div>
              <div className="p-2 rounded-lg bg-[#122245] print:bg-white border border-[#1b2f5c] print:border-slate-300">
                <span className="text-slate-400 print:text-black block text-[10px] font-semibold">Tarjeta T-Con</span>
                <strong className="text-white print:text-black">{equipo.estado_tcon || 'No aplica'}</strong>
              </div>
              <div className="p-2 rounded-lg bg-[#122245] print:bg-white border border-[#1b2f5c] print:border-slate-300">
                <span className="text-slate-400 print:text-black block text-[10px] font-semibold">Pantalla / Panel</span>
                <strong className="text-white print:text-black">{equipo.estado_pantalla || 'Por revisar'}</strong>
              </div>
            </div>
          </div>

          {/* Detalles del Ingreso */}
          <div className="p-4 rounded-xl bg-[#0e1b36] border border-[#1d3159] print:bg-white print:border-black mb-5 space-y-3">
            <div>
              <p className="text-[11px] font-bold text-slate-400 print:text-black uppercase">Accesorios Entregados:</p>
              <p className="text-xs font-semibold text-white print:text-black mt-0.5 bg-[#142347] print:bg-slate-50 p-2 rounded-lg border border-[#1e3461] print:border-slate-300">
                {equipo.accesorios || 'No aplica'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 print:text-black uppercase">Falla / Daño Manifestado:</p>
              <p className="text-xs font-bold text-amber-300 print:text-black mt-0.5 bg-[#142347] print:bg-slate-50 p-2 rounded-lg border border-[#1e3461] print:border-slate-300">
                ⚠️ {equipo.dano_reportado}
              </p>
            </div>

            {equipo.diagnostico_tecnico && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 print:text-black uppercase">Diagnóstico Preliminar:</p>
                <p className="text-xs text-slate-200 print:text-black mt-0.5 bg-[#142347] print:bg-slate-50 p-2 rounded-lg border border-[#1e3461] print:border-slate-300">
                  {equipo.diagnostico_tecnico}
                </p>
              </div>
            )}

            {equipo.trabajo_realizado && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 print:text-black uppercase">Trabajo Realizado:</p>
                <p className="text-xs text-slate-200 print:text-black mt-0.5 bg-[#142347] print:bg-slate-50 p-2 rounded-lg border border-[#1e3461] print:border-slate-300">
                  {equipo.trabajo_realizado}
                </p>
              </div>
            )}
          </div>

          {/* Costos Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-3.5 rounded-xl bg-[#112040] border border-cyan-500/20 print:bg-slate-100 print:border-black text-center">
            <div>
              <span className="text-[10px] text-slate-400 print:text-black uppercase font-bold block">Estado</span>
              <span className="font-bold text-cyan-300 print:text-black text-xs">{equipo.estado}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-black uppercase font-bold block">Ingreso</span>
              <span className="font-mono text-white print:text-black text-xs">{equipo.fecha_ingreso}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-black uppercase font-bold block">Costo Estimado</span>
              <span className="font-mono font-bold text-emerald-400 print:text-black text-xs">
                ${Number(equipo.costo_estimado || 0).toLocaleString('es-CO')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 print:text-black uppercase font-bold block">Costo Final</span>
              <span className="font-mono font-bold text-cyan-400 print:text-black text-xs">
                {equipo.costo_final ? `$${Number(equipo.costo_final).toLocaleString('es-CO')}` : 'Por definir'}
              </span>
            </div>
          </div>

          {/* Términos y Condiciones */}
          <div className="p-3 rounded-lg border border-slate-700/60 print:border-slate-400 text-[9px] text-slate-400 print:text-black space-y-1 mb-8">
            <p className="font-bold text-slate-300 print:text-black uppercase">Condiciones del Servicio Técnico ARBASONIC:</p>
            <p>1. Todo equipo debe ser retirado en un plazo máximo de 30 días posteriores a la notificación de reparación.</p>
            <p>2. Toda reparación cuenta con garantía sobre el trabajo realizado y componentes sustituidos.</p>
            <p>3. El taller no se hace responsable por accesorios no reportados en este comprobante al momento del ingreso.</p>
          </div>

          {/* Firmas */}
          <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-700 print:border-black">
            <div className="text-center">
              <div className="border-b border-slate-500 print:border-black mb-1.5 h-10"></div>
              <p className="font-bold text-[11px] text-white print:text-black">Firma del Cliente</p>
              <p className="text-[10px] text-slate-400 print:text-black font-mono">C.C. {equipo.cliente_cedula}</p>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-500 print:border-black mb-1.5 h-10"></div>
              <p className="font-bold text-[11px] text-white print:text-black">ARBASONIC Reparación Electrónica</p>
              <p className="text-[10px] text-slate-400 print:text-black">{equipo.tecnico_encargado || 'Arnulfo Barrios'}</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-[#1b2b4d] bg-[#0d1a33] flex items-center justify-between print:hidden">
          <button
            onClick={() => {
              onClose();
              if (onEdit) onEdit(equipo);
            }}
            className="px-4 py-2 rounded-xl bg-[#16274a] text-cyan-300 hover:bg-[#1e3461] font-semibold text-xs"
          >
            Editar Datos del Equipo
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
