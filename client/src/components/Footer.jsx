import React from 'react';

export default function Footer({ isDarkMode }) {
  return (
    <footer className={`mt-6 sm:mt-8 pt-4 pb-6 flex flex-col sm:flex-row items-center justify-between text-center sm:text-left text-xs gap-2 border-t transition-colors ${
      isDarkMode 
        ? 'border-[#142854] text-slate-400' 
        : 'border-slate-200 text-slate-500'
    }`}>
      <p>
        © 2025 <strong className={isDarkMode ? 'text-white' : 'text-slate-800'}>ARBASONIC</strong> - Reparación Electrónica. Todos los derechos reservados.
      </p>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-emerald-500 font-bold">Sistema en línea</span>
      </div>
    </footer>
  );
}
