export interface Persona {
  nombre: string;
  correo: string;
  numeroVuelo: string;
}

export interface Reserva {
  id: string;
  destino: string;
  paisDestino: string;
  origen: string;
  pasajero: Persona;
  fechaReserva: string;
  localizador: string;
}

export interface CasoCoincidente {
  caso: number;
  totalPersonas: number;
  pasajero: string;
  origen: string;
  destino: string;
  fecha: string;
  localizadorComun: string;
  reservas: Reserva[];
}

export interface FicheroContenido {
  fichero: string;
  totalLineas: number;
  lineas: string[];
}

export interface UsuarioAuth {
  usuarioId: number;
  usuario: string;
  rol: "ADMINISTRADOR" | "EMPLEADO" | string;
}

export interface LoginResponse {
  exito: boolean;
  mensaje: string;
  usuarioId?: number | null;
  usuario?: string | null;
  rol?: string | null;
}

export interface LogItem {
  id: number;
  usuarioId: number | null;
  nombreUsuario: string;
  moduloAfectado: string;
  tipoEvento: string;
  creadoEn: string;
}