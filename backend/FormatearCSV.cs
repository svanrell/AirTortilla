namespace EjercicioFicheros;

public class FormatearCsv
{
    // Método para convertir los datos del CSV a un objeto Reserva
    public static Reserva FormatearLista(List<string> lista)
    {
        // Orden en el CSV: Id (0), Destino (1), PaisDestino (2), Origen (3), Nombre (4), Correo (5), NumeroVuelo (6), Fecha (7), Localizador (8)
        Persona persona = new Persona(lista[4], lista[5], lista[6]);
        Reserva reserva = new Reserva(lista[0], lista[1], lista[2], lista[3], persona, lista[7], lista[8]);

        return reserva;
    }

    // Método para convertir un objeto Reserva a una línea de texto CSV
    public static string FormatearArchivoCsv(Reserva reserva)
    {
        return $"{reserva.Id},{reserva.Destino},{reserva.PaisDestino},{reserva.Origen}," +
               $"{reserva.Pasajero.Nombre},{reserva.Pasajero.Correo},{reserva.Pasajero.NumeroVuelo}," +
               $"{reserva.FechaReserva},{reserva.Localizador}";
    }
}