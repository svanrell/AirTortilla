namespace EjercicioFicheros;

public class Reserva
{
    public string Id { get; set; }
    public string Destino { get; set; }
    public string PaisDestino { get; set; } // Código ISO de 2 letras (ES, FR, DE...)
    public string Origen { get; set; }
    public Persona Pasajero { get; set; }
    public string FechaReserva { get; set; } // Formato YYYY-MM-DD
    public string Localizador { get; set; }

    public Reserva(string id, string destino, string paisDestino, string origen, Persona pasajero, string fechaReserva, string localizador)
    {
        Id = id;
        Destino = destino;
        PaisDestino = paisDestino;
        Origen = origen;
        Pasajero = pasajero;
        FechaReserva = fechaReserva;
        Localizador = localizador;
    }

    // Devuelve el formato pedido: AirTortilla_XX_YYYY_MM_DD.csv
    public string ObtenerNombreFichero()
    {
        string fechaConBarrasBajas = FechaReserva.Replace("-", "_");
        return $"AirTortilla_{PaisDestino}_{fechaConBarrasBajas}.csv";
    }

    public override string ToString()
    {
        return $"[ID: {Id} | Loc: {Localizador}] {Pasajero.Nombre} | De: {Origen} a: {Destino} ({PaisDestino}) | Fecha: {FechaReserva}";
    }
}