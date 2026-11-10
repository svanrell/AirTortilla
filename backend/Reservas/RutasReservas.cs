using EjercicioFicheros.Ficheros;

namespace EjercicioFicheros.Reservas;

public static class RutasReservas
{
    public static void ConfigurarRutasReservas(this WebApplication app, string archivoEntrada)
    {
        // Devuelve la lista completa de reservas leídas desde el archivo maestro
        app.MapGet("/api/reservas", () =>
        {
            Console.WriteLine("[LOG] Petición recibida en /api/reservas");

            try
            {
                if (!File.Exists(archivoEntrada))
                {
                    return Results.NotFound(new { error = "El archivo de reservas no existe en el servidor." });
                }

                List<Reserva> reservas = ManejarCSV.LeerReservasTotal(archivoEntrada);

                return Results.Ok(new
                {
                    mensaje = "Reservas obtenidas con éxito",
                    total = reservas.Count,
                    datos = reservas
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR]: {ex.Message}");
                return Results.Problem($"Error al leer las reservas: {ex.Message}");
            }
        })
        .WithName("ObtenerReservas")
        .WithTags("Reservas");

        // Agrupa reservas por Nombre, Origen y Destino para detectar casos coincidentes
        app.MapGet("/api/pasajeros/coincidentes", () =>
        {
            Console.WriteLine("[LOG] Petición recibida en /api/pasajeros/coincidentes");

            try
            {
                if (!File.Exists(archivoEntrada))
                {
                    return Results.NotFound(new { error = "El archivo de reservas no existe en el servidor." });
                }

                List<Reserva> reservas = ManejarCSV.LeerReservasTotal(archivoEntrada);

                // Agrupamos en un diccionario usando como clave la combinación de nombre, origen y destino
                Dictionary<string, List<Reserva>> grupos = new Dictionary<string, List<Reserva>>();
                foreach (Reserva r in reservas)
                {
                    string clave = $"{r.Pasajero.Nombre}|{r.Origen}|{r.Destino}";
                    if (!grupos.ContainsKey(clave))
                    {
                        grupos[clave] = new List<Reserva>();
                    }
                    grupos[clave].Add(r);
                }

                // Filtramos con LINQ los grupos que tengan 2 o más reservas y los numeramos con el índice
                var coincidentes = grupos.Values
                    .Where(g => g.Count >= 2)
                    .Select((g, idx) => new
                    {
                        caso = idx + 1,
                        totalPersonas = g.Count,
                        pasajero = g[0].Pasajero.Nombre,
                        origen = g[0].Origen,
                        destino = g[0].Destino,
                        fecha = g[0].FechaReserva,
                        localizadorComun = g[0].Localizador,
                        reservas = g
                    })
                    .ToList();

                return Results.Ok(new
                {
                    mensaje = "Casos de pasajeros coincidentes detectados con éxito",
                    totalCasos = coincidentes.Count,
                    casos = coincidentes
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR]: {ex.Message}");
                return Results.Problem($"Error al detectar pasajeros coincidentes: {ex.Message}");
            }
        })
        .WithName("ObtenerPasajerosCoincidentes")
        .WithTags("Pasajeros");
    }
}
