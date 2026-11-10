"use client";

import React, { useState } from "react";
import { crearUsuarioApi, ejecutarMigracionBD } from "@/lib/api";
import { UsuarioAuth } from "@/types";
import {
  UserPlus,
  Shield,
  Key,
  User,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface ViewUsuariosProps {
  currentUser: UsuarioAuth | null;
  onRefreshData?: () => void;
}

export default function ViewUsuarios({ currentUser, onRefreshData }: ViewUsuariosProps) {
  const [nuevoUsuario, setNuevoUsuario] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState<"EMPLEADO" | "ADMINISTRADOR">("EMPLEADO");

  const [loadingAlta, setLoadingAlta] = useState(false);
  const [errorAlta, setErrorAlta] = useState<string | null>(null);
  const [successAlta, setSuccessAlta] = useState<string | null>(null);

  const [loadingMigracion, setLoadingMigracion] = useState(false);
  const [mensajeMigracion, setMensajeMigracion] = useState<string | null>(null);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoUsuario.trim() || !nuevaContrasena) {
      setErrorAlta("Debes rellenar todos los campos.");
      return;
    }

    setLoadingAlta(true);
    setErrorAlta(null);
    setSuccessAlta(null);

    try {
      const res = await crearUsuarioApi(
        nuevoUsuario.trim(),
        nuevaContrasena,
        rolSeleccionado,
        currentUser?.usuarioId
      );

      if (res.exito) {
        setSuccessAlta(`¡Usuario '${res.usuario}' dado de alta con rol ${res.rol}!`);
        setNuevoUsuario("");
        setNuevaContrasena("");
      } else {
        setErrorAlta(res.mensaje || "Error al crear usuario.");
      }
    } catch (err) {
      setErrorAlta(`Fallo en el servidor: ${(err as Error).message}`);
    } finally {
      setLoadingAlta(false);
    }
  };

  const handleMigrar = async () => {
    setLoadingMigracion(true);
    setMensajeMigracion(null);
    try {
      const res = await ejecutarMigracionBD();
      if (res.exito) {
        setMensajeMigracion(`Migración completada: ${res.totalRegistros} reservas sincronizadas en PostgreSQL.`);
        if (onRefreshData) onRefreshData();
      } else {
        setMensajeMigracion(`Error: ${res.mensaje}`);
      }
    } catch (err) {
      setMensajeMigracion(`Error: ${(err as Error).message}`);
    } finally {
      setLoadingMigracion(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Título de la sección */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-cyan-400" />
            ADMINISTRACIÓN DE SISTEMAS Y PERMISOS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestión interna de identidades con cifrado BCrypt (US2) y control de migraciones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarjeta: Dar de alta nuevo usuario */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Alta de Nuevo Usuario (US2)</h3>
              <p className="text-xs text-slate-400">Crea credenciales con encriptación segura y rol</p>
            </div>
          </div>

          {errorAlta && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorAlta}</span>
            </div>
          )}

          {successAlta && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successAlta}</span>
            </div>
          )}

          <form onSubmit={handleCrearUsuario} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nombre de Usuario (Único)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={nuevoUsuario}
                  onChange={(e) => setNuevoUsuario(e.target.value)}
                  placeholder="ej. empleado2"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Contraseña Temporal
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Asignación de Rol
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRolSeleccionado("EMPLEADO")}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    rolSeleccionado === "EMPLEADO"
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>EMPLEADO</span>
                  <span className="text-[10px] font-normal text-slate-500">Acceso a vuelos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRolSeleccionado("ADMINISTRADOR")}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    rolSeleccionado === "ADMINISTRADOR"
                      ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-md shadow-indigo-500/10"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>ADMINISTRADOR</span>
                  <span className="text-[10px] font-normal text-slate-500">Acceso total</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAlta}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingAlta ? "Guardando en PostgreSQL..." : "Dar de Alta Usuario"}
            </button>
          </form>
        </div>

        {/* Tarjeta: Migración y Control de Infraestructura */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Migración a Base de Datos Relacional</h3>
                <p className="text-xs text-slate-400">Requisito legislativo AirTortilla</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Vuelca los datos del fichero maestro <code className="text-cyan-300">reservas_airtortilla.csv</code> directamente a las tablas relacionales de PostgreSQL con transacción atómica y registro de auditoría.
            </p>

            {mensajeMigracion && (
              <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>{mensajeMigracion}</span>
              </div>
            )}

            <button
              onClick={handleMigrar}
              disabled={loadingMigracion}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${loadingMigracion ? "animate-spin" : ""}`} />
              <span>{loadingMigracion ? "Sincronizando..." : "Re-ejecutar Migración CSV ➔ PostgreSQL"}</span>
            </button>
          </div>

          {/* Tarjeta informativa de Seguridad */}
          <div className="rounded-2xl bg-slate-950/70 border border-slate-800/80 p-5 text-xs text-slate-400 space-y-2">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Garantías de Seguridad Activas:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Hashing de contraseñas con algoritmo <strong className="text-slate-300">BCrypt (Work Factor 11)</strong>.</li>
              <li>Protección estricta frente a <strong className="text-slate-300">SQL Injection</strong> mediante parámetros tipados.</li>
              <li>Trazabilidad inmutable de altas y modificaciones registrada en <strong className="text-slate-300">logs_app</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

