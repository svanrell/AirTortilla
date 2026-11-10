"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getLogsAuditoria } from "@/lib/api";
import { LogItem } from "@/types";
import {
  FileText,
  RefreshCw,
  ShieldAlert,
  LogIn,
  UserPlus,
  Database,
  Clock,
  User,
  Filter,
} from "lucide-react";

export default function ViewAuditoria() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEvento, setFiltroEvento] = useState<string>("TODOS");

  const cargarLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLogsAuditoria(100);
      setLogs(data);
    } catch (err) {
      console.error("Error al cargar logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarLogs();
  }, [cargarLogs]);

  const logsFiltrados = logs.filter((log) => {
    if (filtroEvento === "TODOS") return true;
    return log.tipoEvento === filtroEvento;
  });

  const getBadgeEvento = (evento: string) => {
    switch (evento) {
      case "INICIAR_SESION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <LogIn className="w-3 h-3" />
            INICIAR_SESION
          </span>
        );
      case "ERROR_LOGIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <ShieldAlert className="w-3 h-3" />
            ERROR_LOGIN
          </span>
        );
      case "CREAR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
            <UserPlus className="w-3 h-3" />
            ALTA_USUARIO
          </span>
        );
      case "MIGRACION_CSV":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
            <Database className="w-3 h-3" />
            MIGRACION_CSV
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {evento}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            TRAZABILIDAD Y AUDITORÍA DE SEGURIDAD (US3)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registro cronológico inmutable de accesos, modificaciones y operaciones del sistema.
          </p>
        </div>

        {/* Acciones superiores */}
        <div className="flex items-center gap-3">
          <button
            onClick={cargarLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 mr-2 font-semibold">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          Filtrar por evento:
        </div>
        {["TODOS", "INICIAR_SESION", "ERROR_LOGIN", "CREAR", "MIGRACION_CSV"].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroEvento(tipo)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filtroEvento === tipo
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* Tabla de auditoría */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario Autor</th>
                <th className="py-3 px-4">Módulo Afectado</th>
                <th className="py-3 px-4">Tipo de Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Cargando registros de auditoría desde PostgreSQL...
                  </td>
                </tr>
              ) : logsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No hay registros de trazabilidad con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                logsFiltrados.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400">#{log.id}</td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-sans">
                        <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>{new Date(log.creadoEn).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{log.nombreUsuario}</span>
                        {log.usuarioId && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            (ID: {log.usuarioId})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                        {log.moduloAfectado}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getBadgeEvento(log.tipoEvento)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

