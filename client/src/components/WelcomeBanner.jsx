import React from 'react';
import { Laptop, Smartphone, Headphones, Wrench, Cpu } from 'lucide-react';

export default function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#031538] via-[#082860] to-[#041b45] border border-cyan-500/40 p-6 md:p-8 shadow-xl tech-glow-blue mb-6">
      
      {/* Background Circuit PCB Graphic Traces (Exact to Image 1) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-45 overflow-visible"
        viewBox="0 0 1000 240" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <g stroke="#00d2ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 400 120 L 520 120 L 560 80 L 680 80 L 720 120 L 850 120 L 890 160 L 980 160" />
          <path d="M 450 160 L 550 160 L 590 200 L 710 200 L 750 150 L 920 150" />
          <path d="M 520 60 L 640 60 L 680 100 L 800 100 L 840 50 L 960 50" />
          <path d="M 600 220 L 700 220 L 740 180 L 860 180 L 900 220 L 1000 220" />
        </g>
        <g fill="#00d2ff" filter="drop-shadow(0 0 6px #00d2ff)">
          <circle cx="520" cy="120" r="3.5" />
          <circle cx="680" cy="80" r="3.5" />
          <circle cx="850" cy="120" r="3.5" />
          <circle cx="590" cy="200" r="3.5" />
          <circle cx="750" cy="150" r="3.5" />
          <circle cx="640" cy="60" r="3.5" />
          <circle cx="800" cy="100" r="3.5" />
          <circle cx="740" cy="180" r="3.5" />
          <circle cx="900" cy="220" r="3.5" />
        </g>
      </svg>

      {/* Decorative Glow */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 right-24 w-56 h-56 bg-blue-500/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d2ff] via-[#38bdf8] to-[#60a5fa]">ARBASONIC</span>
          </h2>
          <p className="text-slate-200 text-sm md:text-base mt-2 font-medium max-w-xl">
            Controla, gestiona y da seguimiento a tus equipos electrónicos
          </p>

          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-transparent rounded-full mt-4" />
        </div>

        {/* 3D Devices Tech Graphic Composition on Right (Exact to Image 1) */}
        <div className="hidden lg:flex items-center gap-4 relative pr-6">
          {/* Laptop with illuminated screen */}
          <div className="p-4 rounded-2xl bg-[#09224f]/90 border border-cyan-400/40 text-cyan-300 shadow-2xl backdrop-blur-md -rotate-6 hover:rotate-0 transition-transform duration-300">
            <Laptop className="w-9 h-9 text-cyan-300" />
          </div>

          {/* Smartphone */}
          <div className="p-3.5 rounded-2xl bg-[#0b2961]/95 border border-cyan-300/50 text-white shadow-2xl backdrop-blur-md scale-110 hover:scale-115 transition-transform duration-300 z-10">
            <Smartphone className="w-8 h-8 text-sky-200" />
          </div>

          {/* Headphones */}
          <div className="p-4 rounded-2xl bg-[#09224f]/90 border border-cyan-400/40 text-cyan-300 shadow-2xl backdrop-blur-md rotate-6 hover:rotate-0 transition-transform duration-300">
            <Headphones className="w-9 h-9 text-cyan-300" />
          </div>

          {/* Screwdriver (Wrench) */}
          <div className="absolute -bottom-2 -right-1 p-2.5 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/40 rotate-12 hover:rotate-45 transition-transform">
            <Wrench className="w-4 h-4 text-slate-950" />
          </div>
        </div>
      </div>
    </div>
  );
}
