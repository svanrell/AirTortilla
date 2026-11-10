namespace EjercicioFicheros.Database;

public static class ConfiguracionBD
{
    // Se inicializa con una conexión local por defecto, pero se sobrescribe al arrancar con appsettings.json
    public static string CadenaConexion { get; set; } = "Host=localhost;Port=5432;Database=mydb;Username=myuser;Password=mypassword";
    
    public static string ConnectionString => CadenaConexion;
}

// Clase para mantener compatibilidad con llamadas que usaban DbConfig.ConnectionString
public static class DbConfig
{
    public static string ConnectionString => ConfiguracionBD.CadenaConexion;
}
