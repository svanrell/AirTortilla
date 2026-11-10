"use client";

import React, { useState } from "react";
import { loginApi } from "@/lib/api";
import { UsuarioAuth } from "@/types";
import { Lock, User, KeyRound, AlertCircle, CheckCircle2, X, ShieldCheck } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UsuarioAuth) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

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
        setSuccess(`¡Bienvenido, ${res.usuario}!`);
        setTimeout(() => {
          onLoginSuccess({
            usuarioId: res.usuarioId!,
            usuario: res.usuario!,
            rol: res.rol!,
          });
          onClose();
        }, 600);
      } else {
        setError(res.mensaje || "Credenciales incorrectas.");
      }
    } catch (err) {
      setError(`Error de comunicación con el servidor: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-500/20 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400/20 to-indigo-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md shadow-cyan-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-wide text-white">
              CONTROL DE ACCESO
            </h3>
            <p className="text-xs text-slate-400">
              Autenticación interna AirTortilla (US1)
            </p>
          </div>
        </div>

        {/* Mensajes de feedback */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
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
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ej. admin o empleado1"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-cyan-500/25 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Verificando credenciales..." : "Iniciar Sesión"}
          </button>
        </form>

        {/* Credenciales de demostración */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Cuentas creadas para pruebas:</span>
            <div className="mt-1 flex flex-col gap-0.5 font-mono text-[10px] text-slate-400">
              <span>Admin: <span className="text-cyan-300">admin</span> / <span className="text-slate-300">Admin123!</span></span>
              <span>Empleado: <span className="text-cyan-300">empleado1</span> / <span className="text-slate-300">Vuelo2024!</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

