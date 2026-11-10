using EjercicioFicheros.Database;
using EjercicioFicheros.Ficheros;
using EjercicioFicheros.Reservas;
using EjercicioFicheros.Seguridad;

// Creamos el builder para configurar los servicios de la API
var builder = WebApplication.CreateBuilder(args);

// Activamos Swagger para tener la interfaz de documentación y pruebas
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuramos CORS para que el frontend (React en puerto 3000) pueda consultar la API
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

// Leemos la cadena de conexión de appsettings.json para no tenerla fija en el código
ConfiguracionBD.CadenaConexion = builder.Configuration.GetConnectionString("PostgresConnection") 
    ?? ConfiguracionBD.CadenaConexion;

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();

// Si la base de datos está recién creada, inserta el usuario admin inicial
await Login.AsegurarAdminPorDefectoAsync();

// Rutas de entrada y salida para los archivos CSV
string archivoEntrada = ManejarArchivos.ResolverRuta(Path.Combine("Archivos", "reservas_airtortilla.csv"));
string carpetaSalida = ManejarArchivos.ResolverDirectorio(Path.Combine("Archivos", "SalidaAirTortilla"));

// Endpoint para que el frontend compruebe si el servidor sigue encendido
app.MapGet("/api/health", () => Results.Ok(new { status = "online", timestamp = DateTime.UtcNow }))
   .WithName("HealthCheck")
   .WithTags("Health");

// Métodos de extensión para registrar las rutas de cada módulo sin llenar este archivo de código
app.ConfigurarRutasReservas(archivoEntrada);
app.ConfigurarRutasFicheros(archivoEntrada, carpetaSalida);
app.ConfigurarRutasSeguridad();

app.Run();
