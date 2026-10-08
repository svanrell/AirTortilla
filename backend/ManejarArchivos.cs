namespace EjercicioFicheros;

public class ManejarArchivos
{
    // Resuelve la ruta de un archivo tanto si se ejecuta desde backend, desde la raíz de la solución o desde bin/Debug/net8.0
    public static string ResolverRuta(string ruta)
    {
        if (File.Exists(ruta))
        {
            return Path.GetFullPath(ruta);
        }

        string rutaBackend = Path.Combine("backend", ruta);
        if (File.Exists(rutaBackend))
        {
            return Path.GetFullPath(rutaBackend);
        }

        string rutaEnArchivos = Path.Combine("Archivos", ruta);
        if (File.Exists(rutaEnArchivos))
        {
            return Path.GetFullPath(rutaEnArchivos);
        }

        string rutaBackendArchivos = Path.Combine("backend", "Archivos", ruta);
        if (File.Exists(rutaBackendArchivos))
        {
            return Path.GetFullPath(rutaBackendArchivos);
        }

        string rutaProyecto = Path.Combine("..", "..", "..", ruta);
        if (File.Exists(rutaProyecto))
        {
            return Path.GetFullPath(rutaProyecto);
        }

        string rutaProyectoArchivos = Path.Combine("..", "..", "..", "Archivos", ruta);
        if (File.Exists(rutaProyectoArchivos))
        {
            return Path.GetFullPath(rutaProyectoArchivos);
        }

        return Path.GetFullPath(ruta);
    }

    // Resuelve la ruta de un directorio en los diferentes entornos
    public static string ResolverDirectorio(string ruta)
    {
        if (Directory.Exists(ruta))
        {
            return Path.GetFullPath(ruta);
        }

        string rutaBackend = Path.Combine("backend", ruta);
        if (Directory.Exists(rutaBackend))
        {
            return Path.GetFullPath(rutaBackend);
        }

        string rutaProyecto = Path.Combine("..", "..", "..", ruta);
        if (Directory.Exists(rutaProyecto))
        {
            return Path.GetFullPath(rutaProyecto);
        }

        if (Directory.Exists("backend"))
        {
            return Path.GetFullPath(Path.Combine("backend", ruta));
        }

        return Path.GetFullPath(ruta);
    }

    // Crea la carpeta si aún no existe
    public static void CrearDirectorioSiNoExiste(string rutaDirectorio)
    {
        if (!Directory.Exists(rutaDirectorio))
        {
            Directory.CreateDirectory(rutaDirectorio);
        }
    }
}
