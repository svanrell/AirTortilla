using EjercicioFicheros.Reservas;
using EjercicioFicheros.Database;

namespace EjercicioFicheros.Ficheros;

public static class RutasFicheros
{
    public static void ConfigurarRutasFicheros(this WebApplication app, string archivoEntrada, string carpetaSalida)
    {
        // Genera los ficheros agrupando todo en memoria con File.WriteAllLines
        app.MapPost("/api/ficheros/generar-total", () =>
        {
            Console.WriteLine("[LOG] Iniciando generación de ficheros en modalidad TOTAL");

            try
            {
                if (!File.Exists(archivoEntrada))
                {
                    return Results.NotFound(new { error = "El archivo de reservas no existe en el servidor." });
                }

                List<Reserva> reservas = ManejarCSV.LeerReservasTotal(archivoEntrada);
                ManejarCSV.GenerarTotal(reservas, carpetaSalida);

                string[] ficherosGenerados = Directory.GetFiles(carpetaSalida, "AirTortilla_*.csv")
                                                     .Select(Path.GetFileName)
                                                     .ToArray()!;

                return Results.Ok(new
                {
                    mensaje = "Ficheros generados con éxito usando la modalidad TOTAL (File.WriteAllLines)",
                    modalidad = "TOTAL",
                    totalFicheros = ficherosGenerados.Length,
                    ficheros = ficherosGenerados
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR]: {ex.Message}");
                return Results.Problem($"Error al generar los ficheros: {ex.Message}");
            }
        })
        .WithName("GenerarFicherosTotal")
        .WithTags("Ficheros");

        // Genera los ficheros en flujo continuo línea por línea con StreamWriter (append: true)
        app.MapPost("/api/ficheros/generar-linea", () =>
        {
            Console.WriteLine("[LOG] Iniciando generación de ficheros en modalidad LÍNEA A LÍNEA");

            try
            {
                if (!File.Exists(archivoEntrada))
                {
                    return Results.NotFound(new { error = "El archivo de reservas no existe en el servidor." });
                }

                ManejarCSV.GenerarLineaALinea(archivoEntrada, carpetaSalida);

                string[] ficherosGenerados = Directory.GetFiles(carpetaSalida, "AirTortilla_*.csv")
                                                     .Select(Path.GetFileName)
                                                     .ToArray()!;

                return Results.Ok(new
                {
                    mensaje = "Ficheros generados con éxito usando la modalidad LÍNEA A LÍNEA (StreamWriter append: true)",
                    modalidad = "LINEA_A_LINEA",
                    totalFicheros = ficherosGenerados.Length,
                    ficheros = ficherosGenerados
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR]: {ex.Message}");
                return Results.Problem($"Error al generar los ficheros línea a línea: {ex.Message}");
            }
        })
        .WithName("GenerarFicherosLinea")
        .WithTags("Ficheros");

        // Lista los nombres de los archivos .csv presentes en la carpeta de salida
        app.MapGet("/api/ficheros", () =>
        {
            Console.WriteLine("[LOG] Listando ficheros en la carpeta de salida");

            try
            {
                ManejarArchivos.CrearDirectorioSiNoExiste(carpetaSalida);

                var nombres = Directory.GetFiles(carpetaSalida, "AirTortilla_*.csv")
                                       .Select(Path.GetFileName)
                                       .ToArray();

                return Results.Ok(new
                {
                    total = nombres.Length,
                    ficheros = nombres
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR]: {ex.Message}");
                return Results.Problem($"Error al listar los ficheros: {ex.Message}");
            }
        })
        .WithName("ListarFicheros")
        .WithTags("Ficheros");

        // Lee y devuelve todas las líneas de un fichero específico pedido en la URL
        app.MapGet("/api/ficheros/{nombreFichero}", (string nombreFichero) =>
        {
            Console.WriteLine($"[LOG] Consultando contenido del fichero: {nombreFichero}");

            try
            {
                string ruta = Path.Combine(carpetaSalida, nombreFichero);

                if (!File.Exists(ruta))
                {
                    return Results.NotFound(new { error = $"El fichero '{nombreFichero}' no existe." });
                }

                string[] lineas = File.ReadAllLines(ruta);

                return Results.Ok(new
                {
                    fichero = nombreFichero,
                    totalLineas = lineas.Length,
                    lineas = lineas
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR]: {ex.Message}");
                return Results.Problem($"Error al leer el fichero: {ex.Message}");
            }
        })
        .WithName("ConsultarFichero")
        .WithTags("Ficheros");

        // Ejecuta la migración del CSV maestro hacia la tabla 'reservas' en PostgreSQL
        app.MapPost("/api/migracion/csv-a-bd", async () =>
        {
            Console.WriteLine("[LOG] Iniciando migración de CSV a PostgreSQL...");

            try
            {
                int total = await MigradorCSV.MigrarReservasAsync(archivoEntrada);

                return Results.Ok(new
                {
                    mensaje = "Migración completada con éxito",
                    totalRegistros = total,
                    tablaDestino = "reservas",
                    eventoRegistrado = "MIGRACION_CSV"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR MIGRACION]: {ex.Message}");
                return Results.Problem($"Error durante la migración: {ex.Message}");
            }
        })
        .WithName("MigrarCsvABaseDatos")
        .WithTags("Migracion");
    }
}
