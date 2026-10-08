namespace EjercicioFicheros;

public class Persona
{
    public string Nombre { get; set; }
    public string Correo { get; set; }
    public string NumeroVuelo { get; set; }

    public Persona(string nombre, string correo, string numeroVuelo)
    {
        Nombre = nombre;
        Correo = correo;
        NumeroVuelo = numeroVuelo;
    }

    public override string ToString()
    {
        return $"Nombre: {Nombre}, Correo: {Correo}, Vuelo: {NumeroVuelo}";
    }
}