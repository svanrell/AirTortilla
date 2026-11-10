import { Reserva, CasoCoincidente, FicheroContenido, LoginResponse, LogItem } from "@/types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface FetchResult<T> {
  data: T;
  isLive: boolean;
  isStale: boolean;
  lastUpdated: string | null;
  error?: string | null;
}

// ============================================================
// CACHÉ DE MEMORIA PARA RETENER ÚLTIMOS DATOS VÁLIDOS (STALE)
// ============================================================
interface MemoryCache {
  reservas: Reserva[];
  casos: CasoCoincidente[];
  ficheros: string[];
  lastSuccessTime: string | null;
}

const cache: MemoryCache = {
  reservas: [],
  casos: [],
  ficheros: [],
  lastSuccessTime: null,
};

// Health check usando el nuevo endpoint GET /api/health (sin HEAD ni 405)
export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 1. Obtener Reservas (GET /api/reservas)
export async function getReservas(): Promise<FetchResult<Reserva[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/reservas`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const json = await res.json();
      const realData: Reserva[] = json.datos || json;
      const now = new Date().toLocaleTimeString();

      cache.reservas = realData;
      cache.lastSuccessTime = now;

      return {
        data: realData,
        isLive: true,
        isStale: false,
        lastUpdated: now,
        error: null,
      };
    }
  } catch (err) {
    console.warn("Fallo al conectar con /api/reservas:", err);
  }

  // Si falló pero teníamos datos en memoria
  if (cache.reservas.length > 0) {
    return {
      data: cache.reservas,
      isLive: false,
      isStale: true,
      lastUpdated: cache.lastSuccessTime,
      error: "Servidor desconectado. Mostrando últimos datos reales conocidos.",
    };
  }

  // Fallo sin datos previos: NADA inventado
  return {
    data: [],
    isLive: false,
    isStale: false,
    lastUpdated: null,
    error: "No se pudieron obtener datos del servidor backend.",
  };
}

// 2. Obtener Pasajeros Coincidentes (GET /api/pasajeros/coincidentes)
export async function getCasosCoincidentes(): Promise<FetchResult<CasoCoincidente[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/pasajeros/coincidentes`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const json = await res.json();
      const realCasos: CasoCoincidente[] = json.casos || json;
      const now = new Date().toLocaleTimeString();

      cache.casos = realCasos;
      cache.lastSuccessTime = now;

      return {
        data: realCasos,
        isLive: true,
        isStale: false,
        lastUpdated: now,
        error: null,
      };
    }
  } catch (err) {
    console.warn("Fallo al conectar con /api/pasajeros/coincidentes:", err);
  }

  if (cache.casos.length > 0) {
    return {
      data: cache.casos,
      isLive: false,
      isStale: true,
      lastUpdated: cache.lastSuccessTime,
      error: "Servidor desconectado. Mostrando últimos casos coincidentes conocidos.",
    };
  }

  return {
    data: [],
    isLive: false,
    isStale: false,
    lastUpdated: null,
    error: "No se pudieron obtener casos coincidentes del servidor.",
  };
}

// 3. Listar Ficheros generados (GET /api/ficheros)
export async function getFicheros(): Promise<FetchResult<string[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/ficheros`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const json = await res.json();
      const realFicheros: string[] = json.ficheros || json;
      const now = new Date().toLocaleTimeString();

      cache.ficheros = realFicheros;
      cache.lastSuccessTime = now;

      return {
        data: realFicheros,
        isLive: true,
        isStale: false,
        lastUpdated: now,
        error: null,
      };
    }
  } catch (err) {
    console.warn("Fallo al conectar con /api/ficheros:", err);
  }

  if (cache.ficheros.length > 0) {
    return {
      data: cache.ficheros,
      isLive: false,
      isStale: true,
      lastUpdated: cache.lastSuccessTime,
      error: "Servidor desconectado. Mostrando última lista de ficheros conocida.",
    };
  }

  return {
    data: [],
    isLive: false,
    isStale: false,
    lastUpdated: null,
    error: "No se pudo obtener la lista de ficheros del servidor.",
  };
}

// 4. Modalidad TOTAL (POST /api/ficheros/generar-total)
export async function generarFicherosTotal(): Promise<{ success: boolean; mensaje: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/ficheros/generar-total`, { method: "POST" });
    const data = await res.json();
    return {
      success: res.ok,
      mensaje: data.mensaje || "Ficheros generados con éxito en modalidad TOTAL",
    };
  } catch (err) {
    return {
      success: false,
      mensaje: `Fallo al contactar el servidor: ${(err as Error).message}`,
    };
  }
}

// 5. Modalidad LÍNEA A LÍNEA (POST /api/ficheros/generar-linea)
export async function generarFicherosLinea(): Promise<{ success: boolean; mensaje: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/ficheros/generar-linea`, { method: "POST" });
    const data = await res.json();
    return {
      success: res.ok,
      mensaje: data.mensaje || "Ficheros generados con éxito en modalidad LÍNEA A LÍNEA",
    };
  } catch (err) {
    return {
      success: false,
      mensaje: `Fallo al contactar el servidor: ${(err as Error).message}`,
    };
  }
}

// 6. Consultar contenido de fichero (GET /api/ficheros/{nombre})
export async function getContenidoFichero(nombreFichero: string): Promise<FicheroContenido | null> {
  if (!nombreFichero) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/ficheros/${encodeURIComponent(nombreFichero)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Error leyendo fichero ${nombreFichero}:`, err);
  }
  return null;
}

// ============================================================
// 7. AUTENTICACIÓN Y SEGURIDAD (US1, US2, US3)
// ============================================================

// US1: Iniciar Sesión (POST /api/auth/login)
export async function loginApi(usuario: string, contrasena: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contrasena }),
    });
    return await res.json();
  } catch (err) {
    return {
      exito: false,
      mensaje: `Fallo de conexión con el backend: ${(err as Error).message}`,
    };
  }
}

// US2: Alta de Usuarios (POST /api/admin/usuarios)
export async function crearUsuarioApi(
  usuario: string,
  contrasena: string,
  rol: string,
  adminId?: number
): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contrasena, rol, adminId }),
    });
    return await res.json();
  } catch (err) {
    return {
      exito: false,
      mensaje: `Fallo al registrar usuario: ${(err as Error).message}`,
    };
  }
}

// US3: Consulta de Trazabilidad / Auditoría (GET /api/admin/logs)
export async function getLogsAuditoria(limite: number = 50): Promise<LogItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/logs?limite=${limite}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return data.logs || [];
    }
  } catch (err) {
    console.warn("Error consultando logs de auditoría:", err);
  }
  return [];
}

// Migración de datos (POST /api/migracion/csv-a-bd)
export async function ejecutarMigracionBD(): Promise<{
  exito: boolean;
  mensaje: string;
  totalRegistros?: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/migracion/csv-a-bd`, {
      method: "POST",
    });
    const data = await res.json();
    return {
      exito: res.ok,
      mensaje: data.mensaje || "Migración finalizada con éxito",
      totalRegistros: data.totalRegistros,
    };
  } catch (err) {
    return {
      exito: false,
      mensaje: `Fallo ejecutando la migración: ${(err as Error).message}`,
    };
  }
}
