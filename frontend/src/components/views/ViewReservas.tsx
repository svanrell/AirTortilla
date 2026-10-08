"use client";

import React, { useState, useMemo } from "react";
import { Reserva } from "@/types";
import { 
  Search, 
  Filter, 
  Plane, 
  MapPin, 
  Calendar, 
  Hash, 
  User, 
  Mail, 
  Sparkles, 
  Layers,
  ArrowRight,
  AlertCircle,
  TrendingUp,
  Globe,
  Radio,
  X
} from "lucide-react";

interface ViewReservasProps {
  reservas: Reserva[];
  isLive: boolean;
  onSelectCoincidentes: () => void;
}

// Mapa de banderas para darle toque de aeropuerto internacional
const COUNTRY_FLAGS: Record<string, string> = {
  FR: "🇫🇷",
  IT: "🇮🇹",
  DE: "🇩🇪",
  US: "🇺🇸",
  GB: "🇬🇧",
  ES: "🇪🇸",
  JP: "🇯🇵",
  PT: "🇵🇹",
};

export default function ViewReservas({ reservas, isLive, onSelectCoincidentes }: ViewReservasProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPais, setSelectedPais] = useState<string>("ALL");

  // Paises únicos presentes en las reservas
  const paises = useMemo(() => {
    const list = Array.from(new Set(reservas.map((r) => r.paisDestino))).filter(Boolean);
    return ["ALL", ...list.sort()];
  }, [reservas]);

  // Filtrado reactivo con useMemo
  const filteredReservas = useMemo(() => {
    return reservas.filter((r) => {
      const matchSearch =
        r.pasajero.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.localizador.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.origen.toLowerCase().includes(searchTerm.toLowerCase());

      const matchPais = selectedPais === "ALL" || r.paisDestino === selectedPais;
      return matchSearch && matchPais;
    });
  }, [reservas, searchTerm, selectedPais]);

  // Contadores analíticos
  const stats = useMemo(() => {
    const destinos = new Set(reservas.map((r) => r.destino)).size;
    const vuelos = new Set(reservas.map((r) => r.pasajero.numeroVuelo)).size;
    return {
      total: reservas.length,
      destinos,
      vuelos,
    };
  }, [reservas]);

  // Generador de iniciales para los avatares
  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Informativo de Requisitos de AirTortilla */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-indigo-950/40 border border-cyan-500/25 p-5 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-sky-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10 flex-shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-cyan-300">
                  CRITERIO DE PARTICIÓN
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  AirTortilla_XX_AAAA_MM_DD.csv
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                Segmentación Automática de Reservas de Vuelo
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                El sistema segmenta las 24 reservas generando ficheros particionados por país de destino y fecha, resolviendo los conflictos de pasajeros repetidos mediante localizadores de grupo.
              </p>
            </div>
          </div>

          <button
            onClick={onSelectCoincidentes}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/25 hover:from-amber-500/25 hover:to-amber-600/35 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer whitespace-nowrap group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Ver 3 Casos Coincidentes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Métricas Rápidas con Tarjetas de Cristal y Borde Superior Neón */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800 p-5 shadow-xl hover:border-cyan-500/40 transition-all duration-300 group">
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-sky-400 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Registros Cargados
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-2 tracking-tight">
            {stats.total}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span>{isLive ? "Sincronizado con API" : "Sin conexión activa"}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800 p-5 shadow-xl hover:border-indigo-500/40 transition-all duration-300 group">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-400 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Destinos Internacionales
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mt-2 tracking-tight">
            {stats.destinos}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">
            Ciudades y aeropuertos globales
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800 p-5 shadow-xl hover:border-emerald-500/40 transition-all duration-300 group">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Vuelos Programados
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-2 tracking-tight">
            {stats.vuelos}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-medium">
            Rutas aéreas asignadas
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda Futurista */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Input Buscador */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por pasajero, ID, localizador o ciudad destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 focus:outline-none text-xs text-slate-100 placeholder-slate-500 transition-all shadow-inner font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros por País con Banderas */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 pl-1 pr-2 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> País:
          </span>
          {paises.map((p) => {
            const flag = COUNTRY_FLAGS[p] || "";
            const isSelected = selectedPais === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPais(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 shadow-md shadow-cyan-500/25 border border-cyan-300"
                    : "bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {flag && <span>{flag}</span>}
                <span>{p === "ALL" ? "TODOS" : p}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla de Reservas con Estilo Táctico */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/95 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-950/90">
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Pasajero & Contacto</th>
                <th className="py-3.5 px-4">Trayecto Operativo</th>
                <th className="py-3.5 px-4">Vuelo</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4 text-right">Localizador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredReservas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-500">
                    {reservas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <AlertCircle className="w-9 h-9 text-slate-600" />
                        <span className="font-bold text-slate-300">
                          {isLive
                            ? "No hay reservas registradas en el archivo del servidor."
                            : "No se pudieron obtener datos del servidor backend (http://localhost:5000)."}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {isLive ? "Verifica reservas_airtortilla.csv" : "Comprueba que la API esté encendida."}
                        </span>
                      </div>
                    ) : (
                      "No se encontraron reservas con los filtros aplicados."
                    )}
                  </td>
                </tr>
              ) : (
                filteredReservas.map((r) => {
                  const isGrupoCarlos = r.localizador === "LOC-FR-5X01";
                  const isGrupoMaria = r.localizador === "LOC-IT-2X01";
                  const isGrupoAlejandro = r.localizador === "LOC-DE-3X01";
                  const isGrupoCoincidente = isGrupoCarlos || isGrupoMaria || isGrupoAlejandro;

                  const initials = getInitials(r.pasajero.nombre);
                  const flag = COUNTRY_FLAGS[r.paisDestino] || "🌐";

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-cyan-500/[0.04] transition-all group ${
                        isGrupoCoincidente ? "bg-amber-500/[0.03]" : ""
                      }`}
                    >
                      {/* Ticket ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-cyan-300 px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/25">
                          {r.id}
                        </span>
                      </td>

                      {/* Pasajero con Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black font-mono border ${
                            isGrupoCoincidente 
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40" 
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{r.pasajero.nombre}</span>
                              {isGrupoCoincidente && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                  {isGrupoCarlos ? "GRUPO 5x" : isGrupoAlejandro ? "GRUPO 3x" : "GRUPO 2x"}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-500" />
                              <span>{r.pasajero.correo}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Trayecto */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-medium">{r.origen}</span>
                          <span className="text-cyan-400 font-bold">&rarr;</span>
                          <span className="font-bold text-white">{r.destino}</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800/80 text-sky-200 border border-slate-700">
                            <span>{flag}</span>
                            <span>{r.paisDestino}</span>
                          </span>
                        </div>
                      </td>

                      {/* Vuelo */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs">
                          <Plane className="w-3 h-3 text-emerald-400 transform -rotate-45" />
                          <span className="font-semibold text-slate-200">{r.pasajero.numeroVuelo}</span>
                        </div>
                      </td>

                      {/* Fecha */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{r.fechaReserva}</span>
                        </div>
                      </td>

                      {/* Localizador tipo Boarding Pass */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-mono px-2.5 py-1 rounded-lg text-[11px] font-black tracking-wide border shadow-sm ${
                            isGrupoCoincidente
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10"
                              : "bg-slate-900 text-slate-300 border-slate-700/80"
                          }`}
                        >
                          <Hash className="w-3 h-3 text-slate-500" />
                          {r.localizador}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
