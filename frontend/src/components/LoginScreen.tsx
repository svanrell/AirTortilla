"use client";

import React, { useState } from "react";
import { loginApi } from "@/lib/api";
import { UsuarioAuth } from "@/types";
import {
  Lock,
  User,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Plane,
  Sparkles,
  ArrowRight,
  Shield
} from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (user: UsuarioAuth) => void;
  isBackendLive: boolean;
}

export default function LoginScreen({ onLoginSuccess, isBackendLive }: LoginScreenProps) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !contrasena) {
      setError("Por favor, introduce usuario y contraseña.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await loginApi(usuario.trim(), contrasena);
      if (res.exito && res.usuarioId && res.usuario && res.rol) {
        setSuccess(`¡Credenciales verificadas! Accediendo como ${res.rol}...`);
        setTimeout(() => {
          onLoginSuccess({
            usuarioId: res.usuarioId!,
            usuario: res.usuario!,
            rol: res.rol!,
          });
        }, 500);
      } else {
        setError(res.mensaje || "Credenciales inválidas.");
      }
    } catch (err) {
      setError(`Error de comunicación con el servidor: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsuario(user);
    setContrasena(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Luces y ambiente de fondo */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
        
        {/* Cabecera / Marca AirTortilla */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 via-sky-500/20 to-indigo-600/30 border border-cyan-400/50 text-cyan-300 shadow-xl shadow-cyan-500/20 mb-4">
            <Plane className="w-8 h-8 transform -rotate-45" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white">
            AIR<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">TORTILLA</span>
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mt-1">
            Portal de Acceso Corporativo
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-slate-900 border-slate-800 text-slate-400">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>Acceso Restringido • US1</span>
          </div>
        </div>

        {/* Tarjeta de Autenticación */}
        <div className="rounded-3xl bg-slate-950/80 border border-slate-800/80 p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-base font-bold text-white">Iniciar Sesión</h2>
              <p className="text-xs text-slate-400">Introduce tus credenciales para acceder</p>
            </div>
            {isBackendLive ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                API Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                API Offline
              </span>
            )}
          </div>

          {/* Mensajes de error o éxito */}
          {error && (
            <div className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Nombre de Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="admin o empleado1"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Verificando con BCrypt..." : "Entrar a la Plataforma"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Accesos rápidos de prueba para el profesor/corrector */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cuentas de prueba (Clic para rellenar):</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill("admin", "Admin123!")}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-indigo-300 flex items-center justify-between">
                  <span>ADMINISTRADOR</span>
                  <span className="text-[10px] text-slate-500 font-mono">Rol 1</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  admin / Admin123!
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("empleado1", "Vuelo2024!")}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-cyan-300 flex items-center justify-between">
                  <span>EMPLEADO</span>
                  <span className="text-[10px] text-slate-500 font-mono">Rol 2</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  empleado1 / Vuelo2024!
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Pie de pantalla */}
        <div className="text-center mt-6 text-xs text-slate-500 font-mono">
          AirTortilla Flight OPS • Seguridad Criptográfica BCrypt • PostgreSQL 16
        </div>
      </div>
    </div>
  );
}

