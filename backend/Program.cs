using EjercicioFicheros;

var builder = WebApplication.CreateBuilder(args);

// Configuración de OpenAPI / Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Permitir peticiones desde el frontend de React (CORS)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Activar la interfaz de Swagger
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();

// ============================================================
// RUTAS DE LOS ARCHIVOS
// ============================================================
string archivoEntrada = ManejarArchivos.ResolverRuta(Path.Combine("Archivos", "reservas_airtortilla.csv"));
string carpetaSalida = ManejarArchivos.ResolverDirectorio(Path.Combine("Archivos", "SalidaAirTortilla"));

// ============================================================
// ENDPOINTS
// ============================================================

// 0. Health check para que el frontend valide conexión viva
app.MapGet("/api/health", () => Results.Ok(new { status = "online", timestamp = DateTime.UtcNow }))
   .WithName("HealthCheck")
   .WithTags("Health");

// 1. Obtener todas las reservas
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

// 2. Obtener pasajeros coincidentes (mismo Nombre, Origen y Destino)
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

        var coincidentes = grupos.Values
            .Where(g => g.Count >= 2)
            .Select((g, idx) => new
            {
                caso = idx + 1,
                totalPersonas = g.Count,
                pasajero = g[0].Pasajero.Nombre,
                origen = g[0].Origen,
                destino = $"{g[0].Destino} ({g[0].PaisDestino})",
                fecha = g[0].FechaReserva,
                localizadorComun = g[0].Localizador,
                reservas = g
            });

        return Results.Ok(new
        {
            mensaje = "Casos de pasajeros coincidentes obtenidos con éxito",
            casos = coincidentes
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR]: {ex.Message}");
        return Results.Problem($"Error al obtener casos coincidentes: {ex.Message}");
    }
})
.WithName("ObtenerCasosCoincidentes")
.WithTags("Pasajeros");

// 3. Generar ficheros en bloque (Modalidad TOTAL)
app.MapPost("/api/ficheros/generar-total", () =>
{
    Console.WriteLine("[LOG] Generando ficheros en modalidad TOTAL...");

    try
    {
        if (!File.Exists(archivoEntrada))
        {
            return Results.NotFound(new { error = "El archivo de reservas no existe en el servidor." });
        }

        List<Reserva> reservasTotal = ManejarCSV.LeerReservasTotal(archivoEntrada);
        ManejarCSV.GenerarTotal(reservasTotal, carpetaSalida);

        return Results.Ok(new
        {
            mensaje = "Ficheros generados con éxito en modalidad TOTAL",
            totalReservasProcesadas = reservasTotal.Count
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR]: {ex.Message}");
        return Results.Problem($"Error al generar ficheros en modalidad total: {ex.Message}");
    }
})
.WithName("GenerarTotal")
.WithTags("Ficheros");

// 4. Generar ficheros en flujo (Modalidad LÍNEA A LÍNEA)
app.MapPost("/api/ficheros/generar-linea", () =>
{
    Console.WriteLine("[LOG] Generando ficheros en modalidad LÍNEA A LÍNEA...");

    try
    {
        if (!File.Exists(archivoEntrada))
        {
            return Results.NotFound(new { error = "El archivo de reservas no existe en el servidor." });
        }

        ManejarCSV.GenerarLineaALinea(archivoEntrada, carpetaSalida);

        return Results.Ok(new
        {
            mensaje = "Ficheros generados con éxito en modalidad LÍNEA A LÍNEA"
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR]: {ex.Message}");
        return Results.Problem($"Error al generar ficheros línea a línea: {ex.Message}");
    }
})
.WithName("GenerarLineaALinea")
.WithTags("Ficheros");

// 5. Listar todos los ficheros generados en SalidaAirTortilla
app.MapGet("/api/ficheros", () =>
{
    Console.WriteLine("[LOG] Listando ficheros generados...");

    try
    {
        if (!Directory.Exists(carpetaSalida))
        {
            return Results.Ok(new List<string>());
        }

        var nombres = Directory.GetFiles(carpetaSalida, "AirTortilla_*.csv")
                               .Select(f => Path.GetFileName(f) ?? f)
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

// 6. Consultar el contenido de un fichero específico
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

// Encendemos el servidor web
app.Run();
