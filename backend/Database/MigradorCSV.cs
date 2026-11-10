using Npgsql;
using EjercicioFicheros.Ficheros;
using EjercicioFicheros.Reservas;

namespace EjercicioFicheros.Database;

public class MigradorCSV
{
    // Lee el CSV de reservas y vuelca los datos a la tabla 'reservas' de PostgreSQL
    public static async Task<int> MigrarReservasAsync(string rutaCsv)
    {
        string ruta = ManejarArchivos.ResolverRuta(rutaCsv);
        if (!File.Exists(ruta))
        {
            throw new FileNotFoundException($"El archivo CSV no existe en la ruta: {ruta}");
        }

        // Leemos las reservas del CSV usando la clase que ya teníamos
        List<Reserva> reservas = ManejarCSV.LeerReservasTotal(ruta);
        if (reservas.Count == 0)
        {
            return 0;
        }

        // 'await using' asegura que la conexión se cierre y libere automáticamente al salir del método
        await using var conn = new NpgsqlConnection(ConfiguracionBD.CadenaConexion);
        await conn.OpenAsync();

        // Usamos una transacción para asegurar que si falla una inserción, se deshagan todas (Rollback)
        await using var transaction = await conn.BeginTransactionAsync();

        try
        {
            // Vaciamos la tabla antes de importar para no duplicar datos si se ejecuta varias veces
            // RESTART IDENTITY reinicia el contador autoincremental de IDs
            await using (var cmdTruncate = new NpgsqlCommand("TRUNCATE TABLE reservas RESTART IDENTITY CASCADE;", conn, transaction))
            {
                await cmdTruncate.ExecuteNonQueryAsync();
            }

            // Usamos parámetros (@parametro) para evitar inyecciones SQL
            const string insertSql = @"
                INSERT INTO reservas (
                    codigo_reserva, 
                    nombre_pasajero, 
                    correo, 
                    origen, 
                    destino, 
                    pais_destino, 
                    numero_vuelo, 
                    fecha_vuelo, 
                    localizador
                ) VALUES (
                    @codigo, 
                    @nombre, 
                    @correo, 
                    @origen, 
                    @destino, 
                    @pais, 
                    @vuelo, 
                    @fecha, 
                    @localizador
                );";

            // Recorremos la lista e insertamos fila por fila
            foreach (var r in reservas)
            {
                await using var cmd = new NpgsqlCommand(insertSql, conn, transaction);
                cmd.Parameters.AddWithValue("codigo", r.Id);
                cmd.Parameters.AddWithValue("nombre", r.Pasajero.Nombre);
                
                // Si el valor es null en C#, usamos DBNull.Value para que en la BD se guarde como NULL
                cmd.Parameters.AddWithValue("correo", (object?)r.Pasajero.Correo ?? DBNull.Value);
                cmd.Parameters.AddWithValue("origen", r.Origen);
                cmd.Parameters.AddWithValue("destino", r.Destino);
                cmd.Parameters.AddWithValue("pais", (object?)r.PaisDestino ?? DBNull.Value);
                cmd.Parameters.AddWithValue("vuelo", (object?)r.Pasajero.NumeroVuelo ?? DBNull.Value);
                cmd.Parameters.AddWithValue("fecha", DateTime.Parse(r.FechaReserva));
                cmd.Parameters.AddWithValue("localizador", r.Localizador);

                await cmd.ExecuteNonQueryAsync();
            }

            // Registramos en logs_app que se completó la migración
            // '::tipo_evento_log' hace el casteo explícito al tipo ENUM de PostgreSQL
            const string logSql = @"
                INSERT INTO logs_app (modulo_afectado, tipo_evento) 
                VALUES ('RESERVAS', 'MIGRACION_CSV'::tipo_evento_log);";

            await using (var cmdLog = new NpgsqlCommand(logSql, conn, transaction))
            {
                await cmdLog.ExecuteNonQueryAsync();
            }

            // Si todo fue bien, confirmamos los cambios en la base de datos
            await transaction.CommitAsync();
            return reservas.Count;
        }
        catch
        {
            // Si algo falla, deshacemos todos los cambios para no dejar datos corruptos
            await transaction.RollbackAsync();
            throw;
        }
    }
}
