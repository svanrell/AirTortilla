"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import ViewReservas from "@/components/views/ViewReservas";
import ViewCoincidentes from "@/components/views/ViewCoincidentes";
import ViewGenerarFicheros from "@/components/views/ViewGenerarFicheros";
import ViewVisorCSV from "@/components/views/ViewVisorCSV";
import {
  getReservas,
  getCasosCoincidentes,
  getFicheros,
  getContenidoFichero,
  checkApiHealth,
} from "@/lib/api";
import { Reserva, CasoCoincidente, FicheroContenido } from "@/types";
import {
  AlertTriangle,
  FileCode2,
  Database,
  PlaneTakeoff,
  Server,
  Terminal,
  RefreshCw,
  WifiOff,
  Clock,
} from "lucide-react";

export type ViewType = "reservas" | "coincidentes" | "generador" | "visor";

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>("reservas");
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados de datos crudos
  const [rawReservas, setRawReservas] = useState<Reserva[]>([]);
  const [rawCasos, setRawCasos] = useState<CasoCoincidente[]>([]);
  const [rawFicheros, setRawFicheros] = useState<string[]>([]);

  // Estado del visor CSV
  const [selectedFichero, setSelectedFichero] = useState<string>("");
  const [contenidoFichero, setContenidoFichero] = useState<FicheroContenido | null>(null);
  const [loadingVisor, setLoadingVisor] = useState<boolean>(false);

  // Memorización con useMemo para retener los datos y evitar recálculos innecesarios
  const reservas = useMemo(() => rawReservas, [rawReservas]);
  const casos = useMemo(() => rawCasos, [rawCasos]);
  const ficheros = useMemo(() => rawFicheros, [rawFicheros]);

  // Carga de contenido de un fichero específico
  const loadContenido = useCallback(async (nombre: string) => {
    if (!nombre) return;
    setLoadingVisor(true);
    try {
      const cont = await getContenidoFichero(nombre);
      setContenidoFichero(cont);
    } catch (err) {
      console.error("Error leyendo contenido:", err);
    } finally {
      setLoadingVisor(false);
    }
  }, []);

  // Carga inicial y refresco de datos (sin inventar datos)
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [resReservas, resCasos, resFicheros] = await Promise.all([
        getReservas(),
        getCasosCoincidentes(),
        getFicheros(),
      ]);

      const live = resReservas.isLive;
      const stale = resReservas.isStale;
      const syncTime = resReservas.lastUpdated || resReservas.lastUpdated;

      setIsBackendLive(live);
      setIsStale(stale);
      if (syncTime) setLastSyncTime(syncTime);

      setRawReservas(resReservas.data);
      setRawCasos(resCasos.data);
      setRawFicheros(resFicheros.data);

      // Si no hay fichero seleccionado y hay ficheros disponibles, preseleccionamos el primero
      if (resFicheros.data.length > 0 && !selectedFichero) {
        const primero = resFicheros.data[0];
        setSelectedFichero(primero);
        loadContenido(primero);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
      setIsBackendLive(false);
    } finally {
      setLoading(false);
    }
  }, [selectedFichero, loadContenido]);

  const handleSelectFichero = (nombre: string) => {
    setSelectedFichero(nombre);
    loadContenido(nombre);
  };

  // Callback cuando se generan nuevos ficheros desde ViewGenerarFicheros
  const handleFicherosGenerados = async () => {
    const res = await getFicheros();
    setRawFicheros(res.data);
    if (res.data.length > 0) {
      const target = res.data[0];
      setSelectedFichero(target);
      loadContenido(target);
    }
  };

  useEffect(() => {
    loadAllData();

    // Heartbeat cada 10 segundos para comprobar si el backend sigue vivo
    const interval = setInterval(async () => {
      const live = await checkApiHealth();
      setIsBackendLive(live);

      // Si deja de responder y teníamos datos, activamos aviso de desactualizado (stale)
      if (!live && rawReservas.length > 0) {
        setIsStale(true);
      } else if (live) {
        setIsStale(false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [loadAllData, rawReservas.length]);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Fondo ambiental futurista */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-sky-600/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 left-1/3 w-[450px] h-[350px] bg-amber-500/5 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Header estilo LoadoutAI */}
      <div className="relative z-20">
        <Header
          currentView={currentView}
          onSelectView={setCurrentView}
          isBackendLive={isBackendLive}
          isStale={isStale}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* BANNER 1: ALERTA DE DATOS DESACTUALIZADOS (STALE CACHE) */}
        {isStale && (
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-slate-900/90 to-amber-500/10 p-4 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mt-0.5">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-black text-amber-200 tracking-wide flex items-center gap-2">
                  <span>CONEXIÓN PERDIDA CON EL BACKEND</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    DATOS NO ACTUALIZADOS
                  </span>
                </div>
                <div className="text-xs text-amber-300/80 mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Mostrando los últimos datos reales recibidos a las{" "}
                  <strong className="text-white font-mono">{lastSyncTime || "recientemente"}</strong>. Los cambios no se reflejarán hasta reconectar.
                </div>
              </div>
            </div>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Reintentar Conexión</span>
            </button>
          </div>
        )}

        {/* BANNER 2: BACKEND CAÍDO Y SIN NINGÚN DATO PREVIO */}
        {!isBackendLive && !isStale && reservas.length === 0 && !loading && (
          <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500/15 via-slate-900/90 to-rose-500/10 p-4 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 mt-0.5">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-rose-200 tracking-wide">
                  BACKEND NO DISPONIBLE (http://localhost:5000/api)
                </div>
                <div className="text-xs text-rose-300/80 mt-0.5">
                  No se pudo conectar con el servidor C#. <strong>No se muestran datos inventados ni simulados</strong>. Inicia la API y pulsa reconectar.
                </div>
              </div>
            </div>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-all shadow-md shadow-rose-500/20 cursor-pointer whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Comprobar Servidor</span>
            </button>
          </div>
        )}

        {/* Banner Superior de Estado de Sistema */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800/80 p-5 shadow-2xl backdrop-blur-xl">
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
            <PlaneTakeoff className="w-64 h-64 text-sky-400" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isBackendLive ? "bg-emerald-400" : isStale ? "bg-amber-400" : "bg-rose-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isBackendLive ? "bg-emerald-500" : isStale ? "bg-amber-500" : "bg-rose-500"
                    }`}
                  />
                </span>
                <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-400">
                  SISTEMA DE GESTIÓN Y PARTICIÓN DE VUELOS
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                AIRTORTILLA
                <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/20 border border-sky-500/40 font-mono text-sky-300 font-normal">
                  CONTROL PANEL
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Plataforma de procesamiento de reservas aéreas, detección de casos con localizador compartido y partición de ficheros por país y fecha.
              </p>
            </div>

            {/* Métricas rápidas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
                  <Database className="w-3 h-3 text-sky-400" />
                  <span>Reservas</span>
                </div>
                <div className="text-lg font-black font-mono text-slate-100 mt-0.5">
                  {reservas.length}
                </div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>Casos Loc</span>
                </div>
                <div className="text-lg font-black font-mono text-amber-300 mt-0.5">
                  {casos.length}
                </div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
                  <FileCode2 className="w-3 h-3 text-emerald-400" />
                  <span>Ficheros</span>
                </div>
                <div className="text-lg font-black font-mono text-emerald-300 mt-0.5">
                  {ficheros.length}
                </div>
              </div>

              <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase">
                  <Server className="w-3 h-3 text-indigo-400" />
                  <span>Estado API</span>
                </div>
                <div
                  className={`text-xs font-bold font-mono mt-1 ${
                    isBackendLive
                      ? "text-emerald-400"
                      : isStale
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {isBackendLive ? "CONECTADO" : isStale ? "EN CACHÉ" : "OFFLINE"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Renderizado de Vistas según pestaña activa */}
        <div className="transition-opacity duration-200">
          {currentView === "reservas" && (
            <ViewReservas
              reservas={reservas}
              isLive={isBackendLive}
              onSelectCoincidentes={() => setCurrentView("coincidentes")}
            />
          )}

          {currentView === "coincidentes" && (
            <ViewCoincidentes
              casos={casos}
              isLive={isBackendLive}
            />
          )}

          {currentView === "generador" && (
            <ViewGenerarFicheros
              ficheros={ficheros}
              onRefreshFicheros={handleFicherosGenerados}
              onOpenVisor={(nombreFichero: string) => {
                handleSelectFichero(nombreFichero);
                setCurrentView("visor");
              }}
            />
          )}

          {currentView === "visor" && (
            <ViewVisorCSV
              ficheros={ficheros}
              selectedFichero={selectedFichero}
              onSelectFichero={handleSelectFichero}
              contenido={contenidoFichero}
              isLoading={loadingVisor}
              onRefresh={loadAllData}
            />
          )}
        </div>
      </main>

      {/* Footer estilo táctico LoadoutAI */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/90 py-6 px-4 sm:px-8 mt-12 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              AirTortilla Flight Matrix
            </span>
            <span>•</span>
            <span>ASP.NET Core 8 Web API + Next.js</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="http://localhost:5000/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 hover:underline"
            >
              <span>Swagger API Docs</span>
            </a>
            <span>•</span>
            <span className="text-slate-600">
              Puerto API: <code>:5000</code> | Puerto Frontend: <code>:3000</code>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
