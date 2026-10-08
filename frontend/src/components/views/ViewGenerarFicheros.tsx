"use client";

import React, { useState } from "react";
import { generarFicherosTotal, generarFicherosLinea } from "@/lib/api";
import { 
  Terminal, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Play, 
  FolderCheck,
  RefreshCw,
  Cpu,
  Zap,
  Sparkles,
  FileSpreadsheet,
  Trash2
} from "lucide-react";

interface ViewGenerarFicherosProps {
  ficheros: string[];
  onRefreshFicheros: () => void;
  onOpenVisor: (nombreFichero: string) => void;
}

interface LogEntry {
  time: string;
  text: string;
  type: "info" | "success" | "error";
}

export default function ViewGenerarFicheros({
  ficheros,
  onRefreshFicheros,
  onOpenVisor,
}: ViewGenerarFicherosProps) {
  const [loadingMode, setLoadingMode] = useState<"total" | "linea" | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      time: new Date().toLocaleTimeString(),
      text: "Motor de partición C# listo. Selecciona una modalidad de generación.",
      type: "info",
    },
  ]);

  const addLog = (text: string, type: "info" | "success" | "error") => {
    setLogs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        text,
        type,
      },
    ]);
  };

  const handleGenerarTotal = async () => {
    setLoadingMode("total");
    addLog("Iniciando generación en modalidad TOTAL (File.WriteAllLines)...", "info");

    try {
      const res = await generarFicherosTotal();
      if (res.success) {
        addLog(`ÉXITO: ${res.mensaje}`, "success");
        onRefreshFicheros();
      } else {
        addLog(`ERROR: ${res.mensaje}`, "error");
      }
    } catch (err) {
      addLog(`FALLO CRÍTICO: ${(err as Error).message}`, "error");
    } finally {
      setLoadingMode(null);
    }
  };

  const handleGenerarLinea = async () => {
    setLoadingMode("linea");
    addLog("Iniciando generación en modalidad LÍNEA A LÍNEA (StreamWriter continuo)...", "info");

    try {
      const res = await generarFicherosLinea();
      if (res.success) {
        addLog(`ÉXITO: ${res.mensaje}`, "success");
        onRefreshFicheros();
      } else {
        addLog(`ERROR: ${res.mensaje}`, "error");
      }
    } catch (err) {
      addLog(`FALLO CRÍTICO: ${(err as Error).message}`, "error");
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Arquitectura de Generación */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/25 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono font-bold text-indigo-300 mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>C# ARCHITECTURE COMPARISON ENGINE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Motor de Partición y Escritura en Disco
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              El ejercicio requiere comparar dos estrategias de persistencia sobre el sistema de archivos: escritura en memoria agrupada (<code className="text-cyan-300 bg-slate-900/80 px-1 py-0.5 rounded">File.WriteAllLines</code>) frente a procesamiento streaming concurrente (<code className="text-sky-300 bg-slate-900/80 px-1 py-0.5 rounded">StreamWriter append</code>).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshFicheros}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sincronizar Disco</span>
            </button>
          </div>
        </div>
      </div>

      {/* Las 2 Modalidades de Generación (Comparativa Visual) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Modalidad 1: TOTAL */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 border border-cyan-500/30 shadow-2xl hover:border-cyan-400/60 transition-all duration-300 flex flex-col justify-between group">
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 absolute top-0 left-0 right-0" />

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                MODALIDAD TOTAL &bull; EN BLOQUE
              </span>
              <span className="text-xs text-slate-400 font-mono font-semibold">File.WriteAllLines</span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Generación Total (En Bloque)</h3>
                <span className="text-xs text-cyan-400 font-mono">Agrupación en Dictionary RAM</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Carga todas las reservas en memoria, las agrupa en un diccionario clave <code className="text-cyan-300 font-mono">Pais_Fecha</code> y escribe cada archivo completo en una sola operación de E/S.
            </p>

            {/* Benchmarks / Atributos técnicos */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Consumo RAM</div>
                <div className="font-bold text-slate-200 mt-0.5">Temporal O(N)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Velocidad E/S</div>
                <div className="font-bold text-cyan-300 mt-0.5">Ultra Rápida</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerarTotal}
            disabled={loadingMode !== null}
            className="mt-6 w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            {loadingMode === "total" ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Ejecutando en bloque...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Ejecutar Modalidad TOTAL</span>
              </>
            )}
          </button>
        </div>

        {/* Modalidad 2: LÍNEA A LÍNEA */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 border border-indigo-500/30 shadow-2xl hover:border-indigo-400/60 transition-all duration-300 flex flex-col justify-between group">
          <div className="h-1.5 w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 absolute top-0 left-0 right-0" />

          <div>
            <div className="flex items-center justify-between mb-3.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                MODALIDAD STREAMING &bull; FLUJO
              </span>
              <span className="text-xs text-slate-400 font-mono font-semibold">StreamWriter Append</span>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Generación Línea a Línea</h3>
                <span className="text-xs text-indigo-400 font-mono">StreamReader / StreamWriter</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              Lee línea a línea y añade cada registro directamente al fichero correspondiente con <code className="text-indigo-300 font-mono">append: true</code>. Ideal para archivos de gran escala sin sobrecargar memoria.
            </p>

            {/* Benchmarks / Atributos técnicos */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Consumo RAM</div>
                <div className="font-bold text-emerald-400 mt-0.5">Constante O(1)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase">Escalabilidad</div>
                <div className="font-bold text-indigo-300 mt-0.5">Para Big Data</div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerarLinea}
            disabled={loadingMode !== null}
            className="mt-6 w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            {loadingMode === "linea" ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Procesando streaming...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Ejecutar Modalidad LÍNEA A LÍNEA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Logs & Lista de Salidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Consola de Ejecución Estilo Hacker / macOS */}
        <div className="lg:col-span-2 rounded-2xl bg-[#060911] border border-slate-800 overflow-hidden shadow-2xl flex flex-col h-[320px]">
          {/* Header de la consola con los 3 botones macOS */}
          <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                TERMINAL DE PROCESAMIENTO C#
              </span>
            </div>

            <button 
              onClick={() => setLogs([])}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Cuerpo de la consola */}
          <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-2 no-scrollbar bg-slate-950/60">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-slate-600 text-[11px] select-none font-semibold">[{log.time}]</span>
                <span className="select-none font-bold">
                  {log.type === "success" ? (
                    <span className="text-emerald-400">[SUCCESS]</span>
                  ) : log.type === "error" ? (
                    <span className="text-rose-400">[ERROR]</span>
                  ) : (
                    <span className="text-cyan-400">[INFO]</span>
                  )}
                </span>
                <span className={
                  log.type === "success" 
                    ? "text-emerald-300" 
                    : log.type === "error" 
                    ? "text-rose-300" 
                    : "text-slate-300"
                }>
                  {log.text}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-cyan-400/80 pt-1">
              <span>&gt;</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>

        {/* Lista de Ficheros Generados */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800 p-5 shadow-2xl flex flex-col justify-between h-[320px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Ficheros en Disco
                </h4>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold">
                {ficheros.length} listados
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-2.5">
              Archivos en <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded font-mono text-[10px]">SalidaAirTortilla/</code>:
            </p>

            <div className="space-y-1.5 max-h-[175px] overflow-y-auto no-scrollbar pr-1">
              {ficheros.length === 0 ? (
                <div className="text-xs text-slate-500 py-8 text-center flex flex-col items-center gap-2">
                  <FileSpreadsheet className="w-8 h-8 text-slate-600" />
                  <span>Pulsa ejecutar para generar los archivos.</span>
                </div>
              ) : (
                ficheros.map((f) => (
                  <div
                    key={f}
                    onClick={() => onOpenVisor(f)}
                    className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-cyan-500/10 border border-slate-800/80 hover:border-cyan-500/40 flex items-center justify-between text-xs cursor-pointer group transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="font-mono text-slate-300 group-hover:text-cyan-200 text-[11px] truncate">
                        {f}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span>Directorio verificado</span>
            <span className="text-slate-400 font-semibold">SalidaAirTortilla</span>
          </div>
        </div>
      </div>
    </div>
  );
}
