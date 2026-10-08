"use client";

import React, { useState } from "react";
import { CasoCoincidente } from "@/types";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Key, 
  ShieldCheck, 
  Award,
  AlertCircle,
  Copy,
  Check,
  Plane,
  Ticket,
  ChevronRight
} from "lucide-react";

interface ViewCoincidentesProps {
  casos: CasoCoincidente[];
  isLive: boolean;
}

const COUNTRY_FLAGS: Record<string, string> = {
  FR: "🇫🇷",
  IT: "🇮🇹",
  DE: "🇩🇪",
};

export default function ViewCoincidentes({ casos, isLive }: ViewCoincidentesProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
      {/* Information Header Táctico */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f172a] via-[#131f3d] to-[#0f172a] border border-cyan-500/25 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                LÓGICA DE DETECCIÓN AIRTORTILLA
              </span>
              {isLive && (
                <span className="text-[10px] font-mono font-semibold text-emerald-400 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Servidor Activo
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Pasajeros con Múltiples Reservas
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Detección de reservas con idéntico <strong className="text-white">Nombre</strong>, <strong className="text-white">Origen</strong> y <strong className="text-white">Destino</strong>. Se asigna un <strong className="text-amber-300 font-semibold">Localizador Común de Grupo</strong> preservando el <strong className="text-cyan-300 font-semibold">Ticket ID individual</strong> de cada pasajero.
            </p>
          </div>

          {/* Tarjetas de Resumen */}
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-center shadow-lg">
              <div className="text-2xl font-black font-mono text-white">{casos.length}</div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Casos Totales</div>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-center shadow-lg shadow-amber-500/10">
              <div className="text-2xl font-black font-mono text-amber-300">
                {casos.reduce((acc, c) => acc + c.totalPersonas, 0)}
              </div>
              <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">Billetes Agrupados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Casos Coincidentes */}
      {casos.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-slate-900/50 border border-slate-800 p-8 shadow-inner">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No hay casos coincidentes disponibles</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {isLive 
              ? "No se detectaron grupos con mismo nombre, origen y destino en el archivo actual."
              : "No se ha podido conectar con el backend (http://localhost:5000) para obtener los casos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {casos.map((caso) => {
            const isHighlight = caso.totalPersonas >= 5;
            const initials = getInitials(caso.pasajero);

            return (
              <div
                key={caso.caso}
                className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                  isHighlight
                    ? "bg-gradient-to-b from-[#131d36] via-[#0e162b] to-[#090e1c] border-amber-500/50 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/30"
                    : "bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/95 border-slate-800 hover:border-cyan-500/40 shadow-xl"
                }`}
              >
                {/* Acento superior de color */}
                <div className={`h-1.5 w-full ${isHighlight ? "bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" : "bg-gradient-to-r from-cyan-500 to-indigo-500"}`} />

                {/* Cabecera de la Tarjeta */}
                <div className="p-5 border-b border-slate-800/80">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-white shadow-sm">
                        #{caso.caso}
                      </span>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        GRUPO DETECTADO
                      </span>
                    </div>

                    {isHighlight ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm shadow-amber-500/15">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> &ge; 5 RESERVAS (REQUISITO)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {caso.totalPersonas} reservas
                      </span>
                    )}
                  </div>

                  {/* Pasajero con Monograma */}
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-black font-mono border shadow-md ${
                      isHighlight
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/15"
                        : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-cyan-500/10"
                    }`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white leading-tight">
                        {caso.pasajero}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Fecha: {caso.fecha}</span>
                      </div>
                    </div>
                  </div>

                  {/* Diagrama de Ruta Aérea */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="text-center">
                      <div className="font-mono text-[10px] font-bold uppercase text-slate-400">Origen</div>
                      <div className="font-bold text-white text-sm">{caso.origen}</div>
                    </div>

                    {/* Vuelo con línea animada */}
                    <div className="flex-1 mx-3 flex flex-col items-center">
                      <Plane className="w-4 h-4 text-cyan-400 transform -rotate-45" />
                      <div className="w-full h-0.5 bg-gradient-to-r from-slate-700 via-cyan-400 to-slate-700 my-1" />
                      <span className="font-mono text-[9px] text-slate-500 uppercase">Trayecto Común</span>
                    </div>

                    <div className="text-center">
                      <div className="font-mono text-[10px] font-bold uppercase text-slate-400">Destino</div>
                      <div className="font-bold text-white text-sm">{caso.destino}</div>
                    </div>
                  </div>

                  {/* Localizador Común de Grupo con Botón de Copiar */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>Localizador Común:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-amber-300 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                        {caso.localizadorComun}
                      </span>
                      <button
                        onClick={() => handleCopy(caso.localizadorComun)}
                        className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copiar localizador"
                      >
                        {copiedKey === caso.localizadorComun ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de Billetes Individuales */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-slate-950/40">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-3">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                        Tickets Individuales
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {caso.reservas.length} asignados
                      </span>
                    </div>

                    <div className="space-y-2">
                      {caso.reservas.map((r) => (
                        <div 
                          key={r.id}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs hover:border-cyan-500/40 transition-all duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/20">
                              {r.id}
                            </span>
                            <span className="text-slate-600">|</span>
                            <span className="font-mono text-[11px] text-slate-300 font-semibold">{r.pasajero.numeroVuelo}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                            {r.pasajero.correo}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="font-mono text-[10px]">AirTortilla Security Checked</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
