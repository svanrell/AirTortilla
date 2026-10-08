"use client";

import React from "react";
import { 
  Plane, 
  Users, 
  FileSpreadsheet, 
  Terminal, 
  ExternalLink, 
  Activity,
  AlertTriangle,
  WifiOff
} from "lucide-react";

export type ViewType = "reservas" | "coincidentes" | "generador" | "visor";

interface HeaderProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  isBackendLive: boolean;
  isStale?: boolean;
}

export default function Header({ currentView, onSelectView, isBackendLive, isStale }: HeaderProps) {
  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "reservas", label: "Reservas", icon: <Plane className="w-4 h-4" /> },
    { id: "coincidentes", label: "Coincidentes", icon: <Users className="w-4 h-4" />, badge: "3" },
    { id: "generador", label: "Generador", icon: <Terminal className="w-4 h-4" /> },
    { id: "visor", label: "Visor CSV", icon: <FileSpreadsheet className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sky-500/15 bg-[#070b16]/95 backdrop-blur-2xl shadow-2xl shadow-black/40">
      {/* Barra de acento superior luminosa */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Solo icono y nombre AIRTORTILLA */}
        <div 
          onClick={() => onSelectView("reservas")}
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 via-sky-500/15 to-indigo-600/25 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-500/20 group-hover:border-cyan-300 transition-all duration-300">
            <Plane className="w-4 h-4 transform -rotate-45 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-lg font-black tracking-wider text-white whitespace-nowrap">
            AIR<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300 ml-0.5">TORTILLA</span>
          </span>
        </div>

        {/* Center: Navigation Tabs Tácticos y Compactos */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner flex-shrink-0">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/25 via-sky-500/20 to-indigo-500/25 text-cyan-200 border border-cyan-400/40 shadow-md shadow-cyan-500/15"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent"
                }`}
              >
                <span className={isActive ? "text-cyan-300" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                    isActive 
                      ? "bg-amber-400/20 text-amber-300 border-amber-400/40" 
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-cyan-400 rounded-full shadow-sm shadow-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Backend Live Status & Swagger Link Compactos */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isBackendLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-sm shadow-emerald-500/10 whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-mono text-[11px] tracking-wide">API Online</span>
            </div>
          ) : isStale ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10 whitespace-nowrap">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-mono text-[11px] tracking-wide">Caché</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-rose-500/10 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-500/10 whitespace-nowrap">
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-mono text-[11px] tracking-wide">Offline</span>
            </div>
          )}

          <a
            href="http://localhost:5000/swagger"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir Swagger OpenAPI"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-cyan-500/50 transition-all duration-200 shadow-sm group cursor-pointer whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Swagger</span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-cyan-300 transition-colors" />
          </a>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 gap-2 border-t border-slate-800/80 bg-slate-950/90 no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-bold ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
