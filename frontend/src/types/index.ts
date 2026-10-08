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