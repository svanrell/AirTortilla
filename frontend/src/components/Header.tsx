"use client";

import React from "react";
import { UsuarioAuth } from "@/types";
import { 
  Plane, 
  Users, 
  FileSpreadsheet, 
  Terminal, 
  ExternalLink, 
  Activity,
  AlertTriangle,
  WifiOff,
  Lock,
  LogOut,
  Shield,
  FileText,
  UserCheck
} from "lucide-react";

export type ViewType = "reservas" | "coincidentes" | "generador" | "visor" | "usuarios" | "auditoria";

interface HeaderProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  isBackendLive: boolean;
  isStale?: boolean;
  currentUser: UsuarioAuth | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export default function Header({ 
  currentView, 
  onSelectView, 
  isBackendLive, 
  isStale,
  currentUser,
  onOpenLogin,
  onLogout
}: HeaderProps) {
  
  // Navegación base para todos los usuarios
  const navItems: { id: ViewType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "reservas", label: "Reservas", icon: <Plane className="w-3.5 h-3.5" /> },
    { id: "coincidentes", label: "Coincidentes", icon: <Users className="w-3.5 h-3.5" />, badge: "3" },
    { id: "generador", label: "Generador", icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: "visor", label: "Visor CSV", icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
  ];

  // Si es Administrador, agregamos las vistas de administración y auditoría (US2 y US3)
  const isAdmin = currentUser?.rol?.toUpperCase() === "ADMINISTRADOR";
  if (isAdmin) {
    navItems.push(
      { id: "usuarios", label: "Usuarios", icon: <Shield className="w-3.5 h-3.5" /> },
      { id: "auditoria", label: "Trazabilidad", icon: <FileText className="w-3.5 h-3.5" /> }
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sky-500/15 bg-[#070b16]/95 backdrop-blur-2xl shadow-xl shadow-black/40">
      {/* Barra de acento superior luminosa */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500 opacity-80" />

      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 h-15 flex items-center justify-between gap-2">
        
        {/* Left: Logo AIRTORTILLA */}
        <div 
          onClick={() => onSelectView("reservas")}
          className="flex items-center gap-2 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400/20 via-sky-500/15 to-indigo-600/25 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-500/20 group-hover:border-cyan-300 transition-all duration-300">
            <Plane className="w-3.5 h-3.5 transform -rotate-45 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-base font-black tracking-wider text-white whitespace-nowrap">
            AIR<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300 ml-0.5">TORTILLA</span>
          </span>
        </div>

        {/* Center: Navigation Tabs Tácticos y Compactos */}
        <nav className="hidden lg:flex items-center gap-0.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-inner flex-shrink">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/25 via-sky-500/20 to-indigo-500/25 text-cyan-200 border border-cyan-400/40 shadow-sm shadow-cyan-500/15"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent"
                }`}
              >
                <span className={isActive ? "text-cyan-300" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1 py-0.2 rounded-full border ${
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

        {/* Right: Estado Backend, Swagger y Login / Perfil (Totalmente ajustado y anti-overflow) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          
          {/* Status badge compacto */}
          {isBackendLive ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 whitespace-nowrap">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-mono">Online</span>
            </div>
          ) : isStale ? (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border bg-amber-500/10 border-amber-500/40 text-amber-300 whitespace-nowrap">
              <AlertTriangle className="w-3 h-3 text-amber-400 animate-pulse" />
              <span className="font-mono">Caché</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border bg-rose-500/10 border-rose-500/40 text-rose-300 whitespace-nowrap">
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span className="font-mono">Offline</span>
            </div>
          )}

          {/* Swagger Link Compacto */}
          <a
            href="http://localhost:5000/swagger"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir Swagger OpenAPI"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline">Swagger</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>

          {/* User Auth Section (Imposible que se corte) */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="text-xs font-bold text-white max-w-[80px] sm:max-w-[120px] truncate">
                  {currentUser.usuario}
                </span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded border uppercase whitespace-nowrap ${
                  isAdmin
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
                    : "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                }`}>
                  {isAdmin ? "Admin" : "Empleado"}
                </span>
              </div>

              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500/20 to-indigo-600/20 hover:from-cyan-500/30 hover:to-indigo-600/30 text-cyan-300 border border-cyan-400/40 transition-all cursor-pointer shadow-sm shadow-cyan-500/10 whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Nav Bar */}
      <div className="lg:hidden flex overflow-x-auto px-3 py-1.5 gap-1.5 border-t border-slate-800/80 bg-slate-950/90 no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap font-bold ${
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
