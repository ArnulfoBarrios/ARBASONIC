import React from 'react';
import { Package, Wrench, CheckCircle2, Flag, ArrowUpRight } from 'lucide-react';

export default function KpiCards({ stats, isDarkMode }) {
  const kpis = [
    {
      title: 'Equipos Recibidos',
      value: stats?.totalRecibidos ?? 245,
      change: '+12%',
      icon: Package,
      light: {
        bg: 'bg-[#e5f4fe] border-cyan-200/80',
        textTitle: 'text-slate-600',
        textValue: 'text-slate-900',
        iconBg: 'bg-[#0284c7] text-white shadow-md shadow-sky-500/30',
        badge: 'text-emerald-700 bg-emerald-100 border border-emerald-300/60',
        wave: '#0284c7'
      },
      dark: {
        bg: 'bg-gradient-to-b from-[#0b1c3d] to-[#0c244f] border-cyan-500/30',
        textTitle: 'text-slate-300',
        textValue: 'text-white',
        iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
        badge: 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/30',
        wave: '#00d2ff'
      }
    },
    {
      title: 'En Reparación',
      value: stats?.enReparacion ?? 78,
      change: '+5%',
      icon: Wrench,
      light: {
        bg: 'bg-[#fff5e9] border-amber-200/80',
        textTitle: 'text-slate-600',
        textValue: 'text-slate-900',
        iconBg: 'bg-[#f59e0b] text-white shadow-md shadow-amber-500/30',
        badge: 'text-emerald-700 bg-emerald-100 border border-emerald-300/60',
        wave: '#f59e0b'
      },
      dark: {
        bg: 'bg-gradient-to-b from-[#281c0f] to-[#382613] border-amber-500/30',
        textTitle: 'text-slate-300',
        textValue: 'text-white',
        iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        badge: 'text-amber-300 bg-amber-950/60 border border-amber-500/30',
        wave: '#f59e0b'
      }
    },
    {
      title: 'Reparados',
      value: stats?.reparados ?? 142,
      change: '+18%',
      icon: CheckCircle2,
      light: {
        bg: 'bg-[#e8fbf3] border-emerald-200/80',
        textTitle: 'text-slate-600',
        textValue: 'text-slate-900',
        iconBg: 'bg-[#10b981] text-white shadow-md shadow-emerald-500/30',
        badge: 'text-emerald-700 bg-emerald-100 border border-emerald-300/60',
        wave: '#10b981'
      },
      dark: {
        bg: 'bg-gradient-to-b from-[#0d2a20] to-[#12382c] border-emerald-500/30',
        textTitle: 'text-slate-300',
        textValue: 'text-white',
        iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        badge: 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/30',
        wave: '#10b981'
      }
    },
    {
      title: 'Entregados',
      value: stats?.entregados ?? 120,
      change: '+10%',
      icon: Flag,
      light: {
        bg: 'bg-[#f3effe] border-purple-200/80',
        textTitle: 'text-slate-600',
        textValue: 'text-slate-900',
        iconBg: 'bg-[#8b5cf6] text-white shadow-md shadow-purple-500/30',
        badge: 'text-emerald-700 bg-emerald-100 border border-emerald-300/60',
        wave: '#8b5cf6'
      },
      dark: {
        bg: 'bg-gradient-to-b from-[#22173d] to-[#2c1d4e] border-purple-500/30',
        textTitle: 'text-slate-300',
        textValue: 'text-white',
        iconBg: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        badge: 'text-purple-300 bg-purple-950/60 border border-purple-500/30',
        wave: '#a855f7'
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const theme = isDarkMode ? kpi.dark : kpi.light;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${theme.bg}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-semibold ${theme.textTitle}`}>{kpi.title}</p>
                <h3 className={`text-3xl font-black mt-1.5 tracking-tight ${theme.textValue}`}>
                  {kpi.value}
                </h3>
              </div>
              <div className={`p-2.5 rounded-xl ${theme.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Bottom Trend & Wave (Exact to Image 1) */}
            <div className="flex items-center justify-between mt-4">
              <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${theme.badge}`}>
                <ArrowUpRight className="w-3.5 h-3.5" />
                {kpi.change}
              </span>

              {/* Sparkline wave */}
              <svg className="w-24 h-7" viewBox="0 0 100 24" fill="none">
                <path
                  d="M0 18 Q 20 8, 40 14 T 70 6 T 100 12"
                  stroke={theme.wave}
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
