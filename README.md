<div align="center">

# AIRTORTILLA - FLIGHT OPERATIONS & DATABASE

**Sistema de Procesamiento de Reservas, Detección de Pasajeros Coincidentes, Base de Datos Relacional y Seguridad**

[![.NET 8.0](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)

</div>

---

## ¿De qué trata el proyecto?

AirTortilla es una aplicación desarrollada en **C# (.NET 8)** y **Next.js** para gestionar reservas aéreas. En esta entrega se han resuelto dos grandes objetivos:

1. **Gestión de Ficheros CSV:** Lectura, partición automatizada de vuelos por país/fecha (modalidades en memoria y en streaming) y agrupación de pasajeros con reservas repetidas.
2. **Migración a Base de Datos Relacional y Seguridad:** Sustitución de los datos planos por **PostgreSQL 16 en Docker**, control de identidades con contraseñas encriptadas (**BCrypt**), permisos por roles y registro de auditoría.

---

## Base de Datos (PostgreSQL en Docker)

Para cumplir los requisitos de la entrega, la base de datos corre sobre un contenedor Docker y se autoconfigura al encenderse:

### 1. Despliegue con Docker Compose
* Se levanta con el archivo [compose.yml](file:///Users/shumi747/RiderProjects/EntregaFicheros/compose.yml).
* **Persistencia:** Usa el volumen `postgres_data` para que los datos no se borren aunque apagues o reinicies el contenedor.
* **Autoinicialización:** Al arrancar por primera vez, Docker lee automáticamente el archivo [backend/Database/init.sql](file:///Users/shumi747/RiderProjects/EntregaFicheros/backend/Database/init.sql) y crea todas las tablas, índices y roles por defecto.

### 2. Estructura de Tablas
* **`roles`:** Guarda los permisos del sistema (`ADMINISTRADOR` y `EMPLEADO`).
* **`usuarios`:** Guarda los usuarios del sistema. Las contraseñas se almacenan fuertemente encriptadas con **BCrypt** (nunca en texto plano).
* **`logs_app`:** Tabla de auditoría y trazabilidad. Registra automáticamente cada acción relevante (logins correctos, intentos fallidos, altas de usuarios y migraciones).
* **`reservas`:** Almacena todos los vuelos migrados desde el archivo CSV con índices para búsquedas rápidas por localizador, código y fecha.

### 3. Migración de Datos (CSV a PostgreSQL)
* Desde la clase [backend/Database/MigradorCSV.cs](file:///Users/shumi747/RiderProjects/EntregaFicheros/backend/Database/MigradorCSV.cs) se leen las reservas del fichero maestro y se insertan en PostgreSQL usando una transacción atómica (*todo o nada*).
* Al finalizar, el sistema registra automáticamente el evento `MIGRACION_CSV` en la tabla de logs.

---

## Mejoras Implementadas (Seguridad y Funcionalidades)

### 1. Bloqueo de Acceso Inicial y Login Obligatorio (US1)
* La aplicación no muestra ningún dato de reservas ni operativa hasta que el usuario se haya autenticado.
* Si no has iniciado sesión, verás una **pantalla de acceso corporativo** pidiendo usuario y contraseña.

### 2. Encriptación Criptográfica con BCrypt
* Usamos la librería `BCrypt.Net-Next`.
* Al crear un usuario, su contraseña se combina con un Salt aleatorio y se genera un hash seguro (`$2a$11$...`). Al hacer login se comprueba en tiempo constante sin exponer la clave.
* Todas las consultas SQL están protegidas con parámetros contra inyecciones SQL (*SQL Injection*).

### 3. Permisos según el Rol (RBAC) (US2)
* **Empleado:** Puede ver el panel de vuelos, reservas, casos coincidentes y el visor de CSV.
* **Administrador:** Además de lo anterior, se le desbloquean dos secciones exclusivas:
  * **Usuarios:** Formulario para dar de alta empleados o nuevos administradores y botón para forzar la sincronización de la base de datos.
  * **Trazabilidad:** Visor en tiempo real con todos los registros de auditoría y filtros por tipo de evento.

### 4. Trazabilidad de Modificaciones y Seguridad (US3)
* Cada acción queda registrada de forma permanente en la base de datos:
  * `INICIAR_SESION`: Acceso con éxito.
  * `ERROR_LOGIN`: Intentos fallidos (útil para detectar ataques de fuerza bruta).
  * `CREAR`: Creación de un nuevo usuario.
  * `MIGRACION_CSV`: Ejecución de la carga de reservas.

---

## Estructura del Backend (Organizado por Módulos)

El código de C# está organizado de forma natural en carpetas temáticas según su función:

```text
backend/
├── appsettings.json               # Configuración oficial con la cadena de conexión
├── Program.cs                     # Inicio del servidor y mapeo modular de rutas
├── EjercicioFicheros.csproj
│
├── Database/                      # Todo lo relativo a PostgreSQL
│   ├── init.sql                   # Script de creación de tablas montado en Docker
│   ├── ConfiguracionBD.cs         # Lee la conexión de appsettings.json
│   └── MigradorCSV.cs             # Lógica de migración del CSV a la base de datos
│
├── Ficheros/                      # Manejo y partición de archivos CSV
│   ├── ManejarArchivos.cs         # Rutas dinámicas del sistema
│   ├── ManejarCSV.cs              # Modalidades TOTAL (RAM) y LÍNEA A LÍNEA (Stream)
│   ├── FormatearCSV.cs            # Serialización y parseo de líneas CSV
│   └── RutasFicheros.cs           # Endpoints de generación y consulta de ficheros
│
├── Reservas/                      # Dominio de reservas y pasajeros
│   ├── Reserva.cs                 # Objeto de reserva
│   ├── Persona.cs                 # Objeto de pasajero
│   └── RutasReservas.cs           # Endpoints de reservas y casos coincidentes
│
├── Seguridad/                     # Control de acceso y auditoría
│   ├── Login.cs                   # Lógica de login, alta con BCrypt y logs
│   └── RutasSeguridad.cs          # Endpoints de autenticación y trazabilidad
│
└── Archivos/                      # Directorio local de CSVs
    ├── reservas_airtortilla.csv
    └── SalidaAirTortilla/         # Archivos particionados resultantes
```

---

## Endpoints de la API

La documentación interactiva con Swagger está disponible en: `http://localhost:5000/swagger`

| Método | Endpoint | Módulo | Descripción |
| :---: | :--- | :---: | :--- |
| `POST` | `/api/auth/login` | Seguridad | Valida credenciales con BCrypt y devuelve el rol (US1) |
| `POST` | `/api/admin/usuarios` | Seguridad | Da de alta usuarios asignando rol y encriptando clave (US2) |
| `GET` | `/api/admin/logs` | Seguridad | Lista los registros de auditoría y accesos (US3) |
| `POST` | `/api/migracion/csv-a-bd` | Ficheros | Ejecuta la migración del archivo CSV a PostgreSQL |
| `GET` | `/api/reservas` | Reservas | Devuelve las reservas cargadas |
| `GET` | `/api/pasajeros/coincidentes`| Reservas | Agrupa pasajeros con mismo trayecto y fechas |
| `POST` | `/api/ficheros/generar-total` | Ficheros | Partición en bloque usando memoria RAM (WriteAllLines) |
| `POST` | `/api/ficheros/generar-linea` | Ficheros | Partición en flujo continuo (StreamWriter append) |
| `GET` | `/api/ficheros` | Ficheros | Lista los ficheros .csv creados en disco |
| `GET` | `/api/ficheros/{nombre}` | Ficheros | Consulta el contenido de un CSV generado |
| `GET` | `/api/health` | Sistema | Comprueba que la API está encendida |

---

## Cómo Ponerlo en Marcha

### 1. Iniciar la Base de Datos
En la raíz del proyecto:
```bash
docker compose up -d
```
*(PostgreSQL estará corriendo en `localhost:5432` con la base de datos `mydb` inicializada).*

### 2. Iniciar el Backend (.NET 8)
En una terminal:
```bash
dotnet run --project backend
```
*(La API estará disponible en `http://localhost:5000` y Swagger en `/swagger`).*

### 3. Iniciar el Frontend (Next.js)
En otra terminal:
```bash
cd frontend
npm run dev
```
*(Abre `http://localhost:3000` en tu navegador).*

---

### Cuentas para Probar la Aplicación:
* **Administrador:** Usuario `admin` | Contraseña `Admin123!` *(Desbloquea Usuarios y Trazabilidad)*
* **Empleado:** Usuario `empleado1` | Contraseña `Vuelo2024!` *(Acceso a la operativa de vuelos)*
