"use client";

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  FileText,
  Table as TableIcon,
  RefreshCw,
  Download,
  Copy,
  Check,
  Search,
  FileCheck,
  AlertCircle,
  Hash,
  X
} from "lucide-react";
import { FicheroContenido } from "@/types";

interface Props {
  ficheros: string[];
  selectedFichero: string;
  onSelectFichero: (nombre: string) => void;
  contenido: FicheroContenido | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ViewVisorCSV({
  ficheros,
  selectedFichero,
  onSelectFichero,
  contenido,
  isLoading,
  onRefresh,
}: Props) {
  const [viewMode, setViewMode] = useState<"table" | "raw">("table");
  const [copied, setCopied] = useState(false);
  const [tableFilter, setTableFilter] = useState("");

  const handleCopy = () => {
    if (!contenido?.lineas) return;
    navigator.clipboard.writeText(contenido.lineas.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!contenido?.lineas) return;
    const blob = new Blob([contenido.lineas.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", selectedFichero || "airtortilla.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parsear las líneas del fichero CSV con delimitador ';'
  const parsedData = useMemo(() => {
    if (!contenido?.lineas || contenido.lineas.length === 0) return { headers: [], rows: [] };

    const rawLines = contenido.lineas.filter((l) => l.trim().length > 0);
    if (rawLines.length === 0) return { headers: [], rows: [] };

    // Si la primera fila parece ser cabecera
    const firstLineCells = rawLines[0].split(";").map((c) => c.trim());
    const isFirstLineHeader =
      firstLineCells.some((c) => /^(id|destino|pais|origen|pasajero|nombre|email|vuelo|fecha|localizador)$/i.test(c));

    let headers: string[] = [];
    let dataLines: string[] = [];

    if (isFirstLineHeader) {
      headers = firstLineCells;
      dataLines = rawLines.slice(1);
    } else {
      headers = ["ID", "Destino", "País", "Origen", "Pasajero", "Email", "Vuelo", "Fecha", "Localizador"];
      dataLines = rawLines;
    }

    const rows = dataLines.map((line, idx) => {
      const cells = line.split(";").map((c) => c.trim());
      return {
        idx: idx + 1,
        cells,
        raw: line,
      };
    });

    return { headers, rows };
  }, [contenido]);

  // Filas filtradas por buscador interno
  const filteredRows = useMemo(() => {
    if (!tableFilter.trim()) return parsedData.rows;
    const q = tableFilter.toLowerCase();
    return parsedData.rows.filter((r) =>
      r.raw.toLowerCase().includes(q)
    );
  }, [parsedData.rows, tableFilter]);

  return (
    <div className="space-y-6">
      {/* Header Sección */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/25 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>INSPECTOR & PARSER CSV</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Visor y Análisis de Archivos Generados
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Explora los archivos particionados guardados en <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded font-mono">SalidaAirTortilla/</code>. Puedes visualizarlos como tabla estructurada o en texto plano sin alterar el formato.
            </p>
          </div>

          {/* Acciones principales */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
              title="Recargar ficheros del backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? "animate-spin" : ""}`} />
              <span>Actualizar</span>
            </button>

            {contenido && (
              <>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow-md"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar CSV</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Selector de Fichero + Switcher Modo de Visualización */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Selector de fichero */}
        <div className="lg:col-span-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            Fichero activo:
          </label>
          <div className="relative flex-1">
            <select
              value={selectedFichero}
              onChange={(e) => onSelectFichero(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-500/60 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 focus:outline-none text-xs font-mono text-cyan-200 transition-all cursor-pointer shadow-inner"
            >
              {ficheros.length === 0 ? (
                <option value="">(No hay ficheros generados aún)</option>
              ) : (
                ficheros.map((f) => (
                  <option key={f} value={f} className="bg-slate-900 text-slate-200">
                    📁 {f}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Switcher Modo de Vista (Tabla vs Raw) */}
        <div className="lg:col-span-4 flex items-center justify-end gap-2">
          <div className="inline-flex p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "raw"
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Texto Raw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor Principal de Visualización */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs font-mono text-cyan-300">Descargando e indexando contenido del archivo desde el backend...</p>
          </div>
        ) : !contenido ? (
          <div className="py-24 flex flex-col items-center justify-center text-center px-4">
            <AlertCircle className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-300">Ningún archivo cargado</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Selecciona un archivo generado en el selector superior o crea nuevos archivos desde la pestaña de Generador.
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* MODO TABLA ESTRUCTURADA */
          <div>
            {/* Barra interna de herramientas */}
            <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  {contenido.fichero}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono font-bold text-cyan-300">
                  {filteredRows.length} de {parsedData.rows.length} registros
                </span>
              </div>

              {/* Filtro en tiempo real dentro del fichero */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar filas de este archivo..."
                  value={tableFilter}
                  onChange={(e) => setTableFilter(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs text-slate-200 placeholder-slate-500 transition-all font-mono"
                />
                {tableFilter && (
                  <button
                    onClick={() => setTableFilter("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Tabla con scroll horizontal y vertical */}
            <div className="overflow-x-auto max-h-[580px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950/95 border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 backdrop-blur z-10">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center text-slate-500">#</th>
                    {parsedData.headers.map((h, i) => (
                      <th key={i} className="py-3 px-4 font-bold text-slate-300">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={parsedData.headers.length + 1} className="py-14 text-center text-slate-500">
                        No se encontraron filas que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr
                        key={row.idx}
                        className="hover:bg-cyan-500/[0.04] transition-colors group"
                      >
                        <td className="py-3 px-4 text-center text-[10px] text-slate-600 font-semibold select-none">
                          {row.idx}
                        </td>
                        {row.cells.map((cell, cIdx) => {
                          const isLoc = /^(LOC-|AT-)/.test(cell);
                          const isEmail = cell.includes("@");
                          return (
                            <td key={cIdx} className="py-3 px-4 whitespace-nowrap">
                              {isLoc ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-300 font-bold">
                                  <Hash className="w-2.5 h-2.5 text-amber-400" />
                                  {cell}
                                </span>
                              ) : isEmail ? (
                                <span className="text-slate-400 text-[11px]">
                                  {cell}
                                </span>
                              ) : (
                                <span className="text-slate-200 font-medium">
                                  {cell}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* MODO TEXTO RAW */
          <div>
            <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-emerald-400 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                VISTA EN BRUTO (CONTENIDO CSV DEL SERVIDOR)
              </span>
              <span>{contenido.lineas.length} líneas totales</span>
            </div>
            <div className="p-4 overflow-x-auto max-h-[580px] font-mono text-xs bg-slate-950/90">
              <pre className="text-slate-300 space-y-1">
                {contenido.lineas.map((line, idx) => (
                  <div key={idx} className="flex hover:bg-slate-900/80 px-2 py-0.5 rounded transition-colors group">
                    <span className="w-10 select-none text-slate-600 group-hover:text-cyan-400 text-right pr-4 font-semibold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sky-200/90 group-hover:text-white">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}

        {/* Footer con metadata del fichero */}
        {contenido && (
          <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-950/95 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span>Archivo: <strong className="text-cyan-300 font-bold">{contenido.fichero}</strong></span>
              <span>•</span>
              <span>Total líneas: <strong className="text-emerald-300 font-bold">{contenido.totalLineas}</strong></span>
            </div>
            <div className="text-[11px] text-slate-500">
              Delimitador estándar CSV: punto y coma (<code className="text-cyan-300 bg-slate-900 px-1 py-0.2 rounded font-bold">;</code>)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
