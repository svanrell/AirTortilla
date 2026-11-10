namespace EjercicioFicheros.Seguridad;

public static class RutasSeguridad
{
    // Método de extensión para registrar los endpoints de seguridad directamente sobre WebApplication
    public static void ConfigurarRutasSeguridad(this WebApplication app)
    {
        // Valida el login de usuarios y devuelve su rol
        app.MapPost("/api/auth/login", async (LoginRequest request) =>
        {
            Console.WriteLine($"[AUTH] Petición de login recibida para: {request.Usuario}");
            var res = await Login.IniciarSesionAsync(request);

            // Si falla devolvemos HTTP 401 Unauthorized
            if (!res.Exito)
            {
                return Results.Json(res, statusCode: StatusCodes.Status401Unauthorized);
            }

            return Results.Ok(res);
        })
        .WithName("IniciarSesion")
        .WithTags("Autenticacion");

        // Permite a un administrador dar de alta un nuevo usuario con rol
        app.MapPost("/api/admin/usuarios", async (CrearUsuarioRequest request) =>
        {
            Console.WriteLine($"[ADMIN] Petición de alta de usuario: {request.Usuario} | Rol: {request.Rol}");
            var res = await Login.DarDeAltaUsuarioAsync(request);

            if (!res.Exito)
            {
                return Results.BadRequest(res);
            }

            // Devolvemos HTTP 201 Created indicando la ruta del recurso creado
            return Results.Created($"/api/admin/usuarios/{res.UsuarioId}", res);
        })
        .WithName("DarDeAltaUsuario")
        .WithTags("Administracion");

        // Devuelve el listado de eventos de auditoría registrados en la base de datos
        app.MapGet("/api/admin/logs", async (int? limite) =>
        {
            Console.WriteLine("[ADMIN] Consultando registros de auditoría y trazabilidad");
            
            // Si no se especifica el parámetro límite en la URL, toma 50 por defecto
            var logs = await Login.ObtenerLogsAuditoriaAsync(limite ?? 50);

            return Results.Ok(new
            {
                total = logs.Count,
                logs = logs
            });
        })
        .WithName("ObtenerLogsAuditoria")
        .WithTags("Administracion");
    }
}
