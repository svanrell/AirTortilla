using Npgsql;
using EjercicioFicheros.Database;
using BC = BCrypt.Net.BCrypt;

namespace EjercicioFicheros.Seguridad;

// Usamos records para los datos que viajan entre cliente y servidor porque son ligeros e inmutables
public record LoginRequest(string Usuario, string Contrasena);

public record LoginResponse(
    bool Exito, 
    string Mensaje, 
    int? UsuarioId = null, 
    string? Usuario = null, 
    string? Rol = null
);

public record CrearUsuarioRequest(
    string Usuario, 
    string Contrasena, 
    string Rol = "EMPLEADO", 
    int? AdminId = null
);

public record LogItemDto(
    long Id, 
    int? UsuarioId, 
    string? NombreUsuario, 
    string ModuloAfectado, 
    string TipoEvento, 
    DateTime CreadoEn
);

public class Login
{
    // Valida las credenciales comprobando el hash con BCrypt y devuelve el rol asignado
    public static async Task<LoginResponse> IniciarSesionAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Usuario) || string.IsNullOrWhiteSpace(request.Contrasena))
        {
            return new LoginResponse(false, "El usuario y la contraseña son obligatorios.");
        }

        await using var conn = new NpgsqlConnection(ConfiguracionBD.CadenaConexion);
        await conn.OpenAsync();

        // Buscamos el usuario y hacemos JOIN con roles para traernos el nombre de su rol
        const string query = @"
            SELECT u.id, u.usuario, u.contrasena, u.estado::text, r.nombre AS rol
            FROM usuarios u
            INNER JOIN roles r ON u.rol_id = r.id
            WHERE u.usuario = @usuario;";

        await using var cmd = new NpgsqlCommand(query, conn);
        cmd.Parameters.AddWithValue("usuario", request.Usuario.Trim());

        await using var reader = await cmd.ExecuteReaderAsync();

        // Si no devuelve filas, el usuario no existe en la base de datos
        if (!await reader.ReadAsync())
        {
            await reader.CloseAsync();
            // Registramos el intento fallido en auditoría con usuario_id en NULL
            await RegistrarLogAsync(conn, null, "SEGURIDAD", "ERROR_LOGIN");
            return new LoginResponse(false, "Credenciales inválidas.");
        }

        int usuarioId = reader.GetInt32(0);
        string usuarioNombre = reader.GetString(1);
        string hashAlmacenado = reader.GetString(2);
        string estado = reader.GetString(3);
        string rol = reader.GetString(4);

        await reader.CloseAsync();

        // Evitamos que usuarios dados de baja o suspendidos puedan entrar
        if (estado != "ACTIVO")
        {
            await RegistrarLogAsync(conn, usuarioId, "SEGURIDAD", "ERROR_LOGIN");
            return new LoginResponse(false, $"La cuenta del usuario '{usuarioNombre}' no está activa ({estado}).");
        }

        // BCrypt.Verify compara la contraseña en texto plano contra el hash y salt guardado
        bool passwordValida = false;
        try
        {
            passwordValida = BC.Verify(request.Contrasena, hashAlmacenado);
        }
        catch
        {
            passwordValida = false;
        }

        if (!passwordValida)
        {
            // Registramos el fallo para poder auditar posibles intentos de fuerza bruta
            await RegistrarLogAsync(conn, usuarioId, "SEGURIDAD", "ERROR_LOGIN");
            return new LoginResponse(false, "Credenciales inválidas.");
        }

        // Si las credenciales son correctas, registramos el login en logs_app y devolvemos éxito
        await RegistrarLogAsync(conn, usuarioId, "SEGURIDAD", "INICIAR_SESION");

        return new LoginResponse(true, "Inicio de sesión correcto.", usuarioId, usuarioNombre, rol);
    }

    // Da de alta un nuevo usuario encriptando la contraseña con BCrypt
    public static async Task<LoginResponse> DarDeAltaUsuarioAsync(CrearUsuarioRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Usuario) || request.Usuario.Trim().Length < 3)
        {
            return new LoginResponse(false, "El nombre de usuario debe tener al menos 3 caracteres.");
        }

        if (string.IsNullOrWhiteSpace(request.Contrasena) || request.Contrasena.Length < 4)
        {
            return new LoginResponse(false, "La contraseña debe tener al menos 4 caracteres.");
        }

        await using var conn = new NpgsqlConnection(ConfiguracionBD.CadenaConexion);
        await conn.OpenAsync();

        // Obtenemos el ID del rol ('EMPLEADO' o 'ADMINISTRADOR')
        const string queryRol = "SELECT id FROM roles WHERE UPPER(nombre) = UPPER(@rol);";
        int? rolId = null;

        await using (var cmdRol = new NpgsqlCommand(queryRol, conn))
        {
            cmdRol.Parameters.AddWithValue("rol", request.Rol.Trim());
            // ExecuteScalar devuelve el primer valor de la primera fila
            var res = await cmdRol.ExecuteScalarAsync();
            if (res != null)
            {
                rolId = Convert.ToInt32(res);
            }
        }

        if (rolId == null)
        {
            return new LoginResponse(false, $"El rol '{request.Rol}' no existe en la base de datos.");
        }

        // Ciframos la contraseña con BCrypt (genera automáticamente un salt aleatorio para este usuario)
        string passwordHash = BC.HashPassword(request.Contrasena);

        // 'RETURNING id' nos devuelve directamente el ID autoincremental que la BD acaba de generar
        const string insertSql = @"
            INSERT INTO usuarios (usuario, contrasena, rol_id)
            VALUES (@usuario, @contrasena, @rolId)
            RETURNING id;";

        int nuevoUsuarioId;
        try
        {
            await using var cmdInsert = new NpgsqlCommand(insertSql, conn);
            cmdInsert.Parameters.AddWithValue("usuario", request.Usuario.Trim());
            cmdInsert.Parameters.AddWithValue("contrasena", passwordHash);
            cmdInsert.Parameters.AddWithValue("rolId", rolId.Value);

            nuevoUsuarioId = Convert.ToInt32(await cmdInsert.ExecuteScalarAsync());
        }
        // El código de error 23505 en PostgreSQL indica violación de clave única (el usuario ya existe)
        catch (PostgresException ex) when (ex.SqlState == "23505")
        {
            return new LoginResponse(false, $"El nombre de usuario '{request.Usuario}' ya está en uso.");
        }

        // Registramos en auditoría quién creó al nuevo usuario
        await RegistrarLogAsync(conn, request.AdminId ?? nuevoUsuarioId, "USUARIOS", "CREAR");

        return new LoginResponse(true, "Usuario creado con éxito.", nuevoUsuarioId, request.Usuario.Trim(), request.Rol.ToUpper());
    }

    // Consulta los eventos registrados en la tabla de logs ordenados del más reciente al más antiguo
    public static async Task<List<LogItemDto>> ObtenerLogsAuditoriaAsync(int limite = 100)
    {
        var logs = new List<LogItemDto>();

        await using var conn = new NpgsqlConnection(ConfiguracionBD.CadenaConexion);
        await conn.OpenAsync();

        // Usamos LEFT JOIN por si el log no tiene usuario_id (como en intentos de login fallidos)
        const string query = @"
            SELECT l.id, l.usuario_id, u.usuario, l.modulo_afectado, l.tipo_evento::text, l.creado_en
            FROM logs_app l
            LEFT JOIN usuarios u ON l.usuario_id = u.id
            ORDER BY l.creado_en DESC
            LIMIT @limite;";

        await using var cmd = new NpgsqlCommand(query, conn);
        cmd.Parameters.AddWithValue("limite", limite);

        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            logs.Add(new LogItemDto(
                Id: reader.GetInt64(0),
                // Usamos IsDBNull para comprobar si el valor en la base de datos es NULL antes de leerlo
                UsuarioId: reader.IsDBNull(1) ? null : reader.GetInt32(1),
                NombreUsuario: reader.IsDBNull(2) ? "Anónimo / Sistema" : reader.GetString(2),
                ModuloAfectado: reader.GetString(3),
                TipoEvento: reader.GetString(4),
                CreadoEn: reader.GetDateTime(5)
            ));
        }

        return logs;
    }

    // Comprueba si no hay usuarios en la BD y crea el admin inicial por defecto
    public static async Task AsegurarAdminPorDefectoAsync()
    {
        await using var conn = new NpgsqlConnection(ConfiguracionBD.CadenaConexion);
        await conn.OpenAsync();

        const string countQuery = "SELECT COUNT(*) FROM usuarios;";
        await using var cmd = new NpgsqlCommand(countQuery, conn);
        long count = Convert.ToInt64(await cmd.ExecuteScalarAsync());

        if (count == 0)
        {
            Console.WriteLine("[SEGURIDAD] Base de datos limpia. Creando Administrador por defecto: 'admin'...");
            await DarDeAltaUsuarioAsync(new CrearUsuarioRequest(
                Usuario: "admin",
                Contrasena: "Admin123!",
                Rol: "ADMINISTRADOR"
            ));
            Console.WriteLine("[SEGURIDAD] Cuenta creada: usuario='admin' | pass='Admin123!' (Cifrada con BCrypt)");
        }
    }

    // Helper interno para insertar registros en logs_app
    private static async Task RegistrarLogAsync(NpgsqlConnection conn, int? usuarioId, string modulo, string tipoEvento)
    {
        try
        {
            const string sql = @"
                INSERT INTO logs_app (usuario_id, modulo_afectado, tipo_evento)
                VALUES (@usuarioId, @modulo, @tipoEvento::tipo_evento_log);";

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("usuarioId", (object?)usuarioId ?? DBNull.Value);
            cmd.Parameters.AddWithValue("modulo", modulo);
            cmd.Parameters.AddWithValue("tipoEvento", tipoEvento);

            await cmd.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AVISO TRAZABILIDAD]: No se pudo escribir log: {ex.Message}");
        }
    }
}
