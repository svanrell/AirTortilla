# Práctica Ficheros: Sistema AirTortilla

## 1. Descripción
AirTortilla nos pide un sistema para gestionar reservas de vuelos y dividirlas en ficheros según su **país de destino** y la **fecha de la reserva**.

El formato exigido para los ficheros generados es:
`AirTortilla_XX_YYYY_MM_DD.csv`
donde:
- `XX`: Código ISO de 2 letras del país de destino (FR, DE, IT, ES, US, GB, JP...).
- `YYYY_MM_DD`: Año, mes y día de la reserva.

---

## 2. Clases del Proyecto

- **`Persona.cs`**: Representa al pasajero con su nombre, correo y número de vuelo.
- **`Reserva.cs`**: Representa la reserva. Contiene el `Id` unívoco, el destino, el país de destino (ISO-2), el origen, el pasajero, la fecha y el `Localizador`. Tiene el método `ObtenerNombreFichero()` para calcular el nombre del fichero que le corresponde.
- **`FormatearCsv.cs`**: 
  - `FormatearLista`: Convierte los datos leídos del CSV a un objeto `Reserva`.
  - `FormatearArchivoCsv`: Convierte un objeto `Reserva` a una línea de texto CSV.
- **`ManejarArchivos.cs`**: Resuelve las rutas relativas/absolutas y crea los directorios si no existen.
- **`ManejarCSV.cs`**: Contiene la lógica para leer y escribir tanto en modalidad total como línea a línea.
- **`Program.cs`**: Menú de consola interactivo para el usuario.

---

## 3. Modalidades: Total vs Línea a Línea

1. **Modalidad TOTAL**:
   - **Lectura**: Usamos `File.ReadAllLines` para cargar todas las líneas del CSV a memoria de golpe.
   - **Escritura**: Agrupamos las reservas con un diccionario (`Dictionary<string, List<string>>`) y escribimos cada archivo completo con `File.WriteAllLines`.
   - **Consulta**: Leemos todo el fichero seleccionado con `File.ReadAllLines` y lo mostramos por consola.

2. **Modalidad LÍNEA A LÍNEA (Flujos / Streaming)**:
   - **Lectura y Escritura**: Usamos `StreamReader` para leer línea por línea y `StreamWriter` (en modo append) para escribir cada línea en su respectivo archivo. Así no se satura la memoria si el archivo fuera enorme.
   - **Consulta**: Leemos con `StreamReader` línea a línea y vamos pidiendo confirmación al usuario (pulsar ENTER) para avanzar línea a línea.

---

## 4. Casos de Pasajeros Coincidentes

El enunciado pide incluir al menos 3 casos de pasajeros que coincidan en **Nombre, Origen y Destino**, donde uno de ellos tenga al menos 5 personas coincidentes. Se les asigna un localizador común de grupo para identificarlos juntos, además de su ID individual:

1. **Caso 1 (5 personas coincidentes)**:
   - Pasajero: Carlos Ruiz Gomez
   - Ruta: Madrid -> Paris (FR)
   - Fecha: 2024-10-15
   - Localizador: `LOC-FR-5X01`
   - IDs individuales: `AT-00101`, `AT-00102`, `AT-00103`, `AT-00104`, `AT-00105`

2. **Caso 2 (2 personas coincidentes)**:
   - Pasajera: Maria Elena Rodriguez
   - Ruta: Barcelona -> Roma (IT)
   - Fecha: 2024-10-15
   - Localizador: `LOC-IT-2X01`
   - IDs individuales: `AT-00201`, `AT-00202`

3. **Caso 3 (3 personas coincidentes)**:
   - Pasajero: Alejandro Gomez Martin
   - Ruta: Sevilla -> Berlin (DE)
   - Fecha: 2024-10-16
   - Localizador: `LOC-DE-3X01`
   - IDs individuales: `AT-00301`, `AT-00302`, `AT-00303`
