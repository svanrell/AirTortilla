namespace EjercicioFicheros;

public class ManejarCSV
{
    // 1. Leer todo el archivo de golpe con File.ReadAllLines
    public static List<Reserva> LeerReservasTotal(string nombreArchivo)
    {
        string ruta = ManejarArchivos.ResolverRuta(nombreArchivo);
        List<Reserva> listaReservas = new List<Reserva>();

        if (!File.Exists(ruta))
        {
            Console.WriteLine($"El archivo {nombreArchivo} no existe.");
            return listaReservas;
        }

        string[] lineas = File.ReadAllLines(ruta);

        // Empezamos en 1 para saltarnos la cabecera
        for (int i = 1; i < lineas.Length; i++)
        {
            string linea = lineas[i];

            if (string.IsNullOrWhiteSpace(linea))
            {
                continue;
            }

            string[] datos = linea.Split(',');

            if (datos.Length >= 9)
            {
                Reserva reserva = FormatearCsv.FormatearLista(datos.ToList());
                listaReservas.Add(reserva);
            }
        }

        return listaReservas;
    }

    // 2. Generar todos los ficheros en bloque usando File.WriteAllLines
    public static void GenerarTotal(List<Reserva> listaReservas, string carpetaSalida)
    {
        ManejarArchivos.CrearDirectorioSiNoExiste(carpetaSalida);

        // Borramos ficheros anteriores para no acumular ficheros obsoletos
        string[] anteriores = Directory.GetFiles(carpetaSalida, "AirTortilla_*.csv");
        foreach (string f in anteriores)
        {
            File.Delete(f);
        }

        // Agrupamos en un diccionario: nombre del archivo -> lista de líneas
        Dictionary<string, List<string>> ficheros = new Dictionary<string, List<string>>();

        foreach (Reserva r in listaReservas)
        {
            string nombreFichero = r.ObtenerNombreFichero();

            // Si es la primera vez que vemos este fichero, le añadimos la cabecera
            if (!ficheros.ContainsKey(nombreFichero))
            {
                ficheros[nombreFichero] = new List<string>();
                ficheros[nombreFichero].Add("Id,Destino,PaisDestino,Origen,NombrePasajero,Correo,NumeroVuelo,FechaReserva,Localizador");
            }

            ficheros[nombreFichero].Add(FormatearCsv.FormatearArchivoCsv(r));
        }

        // Escribimos cada archivo de golpe con su contenido agrupado
        foreach (KeyValuePair<string, List<string>> par in ficheros)
        {
            string ruta = Path.Combine(carpetaSalida, par.Key);
            
            File.WriteAllLines(ruta, par.Value);

            // Mostramos un resumen (restamos 1 porque la primera línea es el encabezado)
            Console.WriteLine($"Fichero creado: {par.Key} ({par.Value.Count - 1} reservas)");
        }   
    }

    // 3. Consultar un fichero completo leyendo todas las líneas
    public static void ConsultarTotal(string rutaFichero)
    {
        if (!File.Exists(rutaFichero))
        {
            Console.WriteLine("El archivo no existe.");
            return;
        }

        string[] lineas = File.ReadAllLines(rutaFichero);
        Console.WriteLine($"\n--- Contenido de {Path.GetFileName(rutaFichero)} ({lineas.Length} líneas) ---");

        for (int i = 0; i < lineas.Length; i++)
        {
            Console.WriteLine(lineas[i]);
        }
    }
    
    // 4. Generar ficheros línea a línea usando StreamReader y StreamWriter
    public static void GenerarLineaALinea(string nombreArchivoOrigen, string carpetaSalida)
    {
        string ruta = ManejarArchivos.ResolverRuta(nombreArchivoOrigen);

        if (!File.Exists(ruta))
        {
            Console.WriteLine($"El archivo {nombreArchivoOrigen} no existe.");
            return;
        }

        ManejarArchivos.CrearDirectorioSiNoExiste(carpetaSalida);

        // Borramos ficheros anteriores para no acumular líneas duplicadas
        string[] anteriores = Directory.GetFiles(carpetaSalida, "AirTortilla_*.csv");
        foreach (string f in anteriores)
        {
            File.Delete(f);
        }

        using (StreamReader reader = new StreamReader(ruta))
        {
            string? cabecera = reader.ReadLine(); // Saltamos la cabecera
            string? linea;
            int contador = 0;

            while ((linea = reader.ReadLine()) != null)
            {
                if (string.IsNullOrWhiteSpace(linea))
                {
                    continue;
                }

                string[] datos = linea.Split(',');

                if (datos.Length >= 9)
                {
                    Reserva r = FormatearCsv.FormatearLista(datos.ToList());
                    string nombreFichero = r.ObtenerNombreFichero();
                    string rutaDestino = Path.Combine(carpetaSalida, nombreFichero);

                    // Si el archivo no existe, creamos la cabecera
                    if (!File.Exists(rutaDestino))
                    {
                        using (StreamWriter writerCabecera = new StreamWriter(rutaDestino, false))
                        {
                            writerCabecera.WriteLine("Id,Destino,PaisDestino,Origen,NombrePasajero,Correo,NumeroVuelo,FechaReserva,Localizador");
                        }
                    }

                    // Escribimos la línea usando StreamWriter en modo append (true)
                    using (StreamWriter writer = new StreamWriter(rutaDestino, true))
                    {
                        writer.WriteLine(FormatearCsv.FormatearArchivoCsv(r));
                    }

                    contador++;
                    Console.WriteLine($"[{contador}] Procesado {r.Pasajero.Nombre} -> Destino: {r.Destino} ({r.PaisDestino}) en {nombreFichero}");
                }
            }
        }
    }

    // 5. Consultar un fichero línea por línea usando StreamReader
    public static void ConsultarLineaALinea(string rutaFichero)
    {
        if (!File.Exists(rutaFichero))
        {
            Console.WriteLine("El archivo no existe.");
            return;
        }

        Console.WriteLine($"\nConsultando {Path.GetFileName(rutaFichero)} línea a línea");
        Console.WriteLine("Pulsa ENTER para ver la siguiente línea (o escribe 'q' para salir):\n");

        using (StreamReader reader = new StreamReader(rutaFichero))
        {
            string? linea;
            int numLinea = 1;

            while ((linea = reader.ReadLine()) != null)
            {
                Console.WriteLine($"[Línea {numLinea}] {linea}");
                numLinea++;

                Console.Write("Pulsa ENTER para continuar (q para salir): ");
                string? respuesta = Console.ReadLine();

                if (respuesta != null && respuesta.Trim().ToLower() == "q")
                {
                    return;
                }
            }

            Console.WriteLine("\n--- Fin del fichero ---");
        }
    }

    // 6. Mostrar casos de pasajeros coincidentes (mismo Nombre, Origen y Destino)
    public static void MostrarCasosCoincidentes(List<Reserva> reservas)
    {
        Console.WriteLine("\nCasos de pasajeros coincidentes (mismo Nombre, Origen y Destino)");

        // Agrupamos por la clave: "Nombre|Origen|Destino"
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

        int caso = 1;
        foreach (List<Reserva> grupo in grupos.Values)
        {
            // Solo mostramos los casos donde haya 2 o más pasajeros coincidentes
            if (grupo.Count >= 2)
            {
                Reserva primerPasajero = grupo[0];
                Console.WriteLine($"\nCaso {caso} ({grupo.Count} personas coincidentes):");
                Console.WriteLine($"  Pasajero: {primerPasajero.Pasajero.Nombre}");
                Console.WriteLine($"  Origen:   {primerPasajero.Origen}");
                Console.WriteLine($"  Destino:  {primerPasajero.Destino} ({primerPasajero.PaisDestino})");
                Console.WriteLine($"  Fecha:    {primerPasajero.FechaReserva}");
                Console.WriteLine($"  Localizador común asignado: {primerPasajero.Localizador}");
                Console.WriteLine("  Identificación unívoca (ID de cada reserva):");

                foreach (Reserva r in grupo)
                {
                    Console.WriteLine($"    - ID: {r.Id} | Vuelo: {r.Pasajero.NumeroVuelo} | Correo: {r.Pasajero.Correo}");
                }

                caso++;
            }
        }
    }
}