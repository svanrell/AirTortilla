<div align="center">

# ✈️ AIRTORTILLA — FLIGHT OPS CONTROL

**Sistema Integral de Procesamiento de Reservas Aéreas, Detección de Pasajeros Coincidentes y Partición de Archivos CSV**

[![.NET 8.0](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:5000/swagger)

<p align="center">
  <a href="#-características-principales">Características</a> •
  <a href="#-arquitectura-del-sistema">Arquitectura</a> •
  <a href="#-endpoints-del-backend">API Endpoints</a> •
  <a href="#-instalación-y-despliegue">Instalación</a> •
  <a href="#-modalidades-de-partición">Modalidades C#</a> •
  <a href="#-estructura-del-proyecto">Estructura</a>
</p>

</div>

---

## 📖 Descripción General

**AirTortilla** es una plataforma integral desarrollada para resolver el procesamiento de grandes volúmenes de reservas de vuelo. Combina un motor de alto rendimiento en **C# (.NET 8 ASP.NET Core Minimal APIs)** con un panel de control interactivo en **Next.js y React** diseñado con una estética táctica oscura inspirada en interfaces de esports y centros de control aéreo.

El sistema resuelve la lectura, validación y partición automatizada de billetes internacionales, agrupando reservas por destino y fecha mientras aplica reglas de negocio complejas como la asignación de localizadores de grupo compartidos a pasajeros con billetes múltiples.

---

## ✨ Características Principales

### 🎯 1. Partición Inteligente por País y Fecha
- Divide automáticamente el fichero maestro de reservas en archivos individuales según el patrón:
  ```text
  AirTortilla_XX_AAAA_MM_DD.csv  (Ej: AirTortilla_FR_2024_10_15.csv)
  ```
- Generación de cabecera estándar y delimitación estricta por punto y coma (`;`).

### 👥 2. Detección de Pasajeros Coincidentes
- Agrupa automáticamente reservas con idéntico **Nombre**, **Origen** y **Destino**.
- Asigna un **Localizador Común de Grupo** (ej. `LOC-FR-5X01`) compartiendo el trayecto, manteniendo un **Ticket ID unívoco** por cada billete individual.
- Detección prioritaria de grupos de $\ge 5$ pasajeros.

### ⚡ 3. Doble Estrategia de Persistencia en Disco
- **Modalidad TOTAL:** Agrupación en memoria RAM mediante `Dictionary<string, List<string>>` y escritura atómica en bloque con `File.WriteAllLines`.
- **Modalidad LÍNEA A LÍNEA:** Lectura y escritura concurrente en flujo continuo (*streaming*) con `StreamWriter(..., append: true)` y memoria constante $O(1)$.

### 🖥️ 4. Panel de Control Táctico (Frontend)
- **Vista de Reservas:** Filtros instantáneos por país (con banderas 🇫🇷, 🇮🇹, 🇩🇪, 🇺🇸, 🇪🇸, etc.), buscador en tiempo real y métricas clave.
- **Vista de Casos Coincidentes:** Tarjetas de expediente con monogramas de pasajero, trazado de rutas aéreas y botón de copia rápida de localizadores.
- **Consola de Ejecución en Vivo:** Terminal interactiva estilo hacker que muestra los registros de ejecución del backend en tiempo real.
- **Visor e Inspector CSV:** Alterna entre tabla relacional formateada y texto en bruto con opción de copia y descarga directa del archivo.
- **Resiliencia & Cache Stale:** Heartbeat activo que retiene los últimos datos válidos en caso de corte de red, avisando visualmente de desactualizaciones sin inventar datos ficticios.

---

## 🏛️ Arquitectura del Sistema

```mermaid
graph TD
    A[reservas_airtortilla.csv] -->|Lectura CSV| B(Backend .NET 8 Web API)
    B -->|GET /api/reservas| C[Frontend Next.js]
    B -->|GET /api/pasajeros/coincidentes| C
    B -->|GET /api/health| C
    C -->|POST /api/ficheros/generar-total| B
    C -->|POST /api/ficheros/generar-linea| B
    B -->|Generación de Archivos| D[backend/Archivos/SalidaAirTortilla/]
    D -->|Lectura e Inspección| B
    B -->|GET /api/ficheros/{nombre}| C
```

---

## 🔌 Endpoints del Backend

El backend expone una API REST moderna documentada interactivamente con **Swagger UI**:

| Método | Endpoint | Etiqueta | Descripción |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/health` | `Health` | Heartbeat ultraligero de disponibilidad del servidor |
| `GET` | `/api/reservas` | `Reservas` | Devuelve el catálogo completo de las 24 reservas parseadas |
| `GET` | `/api/pasajeros/coincidentes` | `Pasajeros` | Agrupa y devuelve los 3 casos de reservas coincidentes |
| `POST` | `/api/ficheros/generar-total` | `Ficheros` | Ejecuta la generación en bloque en memoria (`File.WriteAllLines`) |
| `POST` | `/api/ficheros/generar-linea` | `Ficheros` | Ejecuta la generación en flujo continuo (`StreamWriter append`) |
| `GET` | `/api/ficheros` | `Ficheros` | Lista los archivos `.csv` generados en la carpeta de salida |
| `GET` | `/api/ficheros/{nombreFichero}` | `Ficheros` | Lee y devuelve las líneas de un archivo CSV específico |

> 📌 **Documentación interactiva disponible en:** `http://localhost:5000/swagger`

---

## ⚙️ Modalidades de Partición: Comparativa Técnica

| Característica | Modalidad TOTAL | Modalidad LÍNEA A LÍNEA |
| :--- | :--- | :--- |
| **API C# Utilizada** | `File.WriteAllLines()` | `StreamReader` / `StreamWriter(..., append: true)` |
| **Consumo de Memoria** | Temporal $O(N)$ (Carga en RAM) | Constante $O(1)$ (Independiente del tamaño) |
| **Escritura en Disco** | Atómica en bloque | Concurrente registro a registro |
| **Caso de Uso Óptimo** | Archivos pequeños y medianos | Archivos masivos / Big Data |
| **Velocidad de E/S** | Máxima para lotes acotados | Continua y sin saturación de memoria |

---

## 🚀 Instalación y Despliegue

### Requisitos Previos
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/) y npm

### 1. Clonar el repositorio
```bash
git clone https://github.com/svanrell/AirTortilla.git
cd AirTortilla
```

### 2. Iniciar el Backend (.NET 8 Web API)
```bash
# Desde la raíz del proyecto
dotnet run --project backend/EjercicioFicheros.csproj
```
El servidor arrancará en:
- **API URL:** `http://localhost:5000`
- **Swagger UI:** `http://localhost:5000/swagger`

### 3. Iniciar el Frontend (Next.js 16)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación web estará disponible de inmediato en:
- **Dashboard Web:** `http://localhost:3000`

---

## 📁 Estructura del Proyecto

```text
AirTortilla/
├── backend/                               # Proyecto ASP.NET Core 8 Web API
│   ├── EjercicioFicheros.csproj           # Configuración del proyecto y paquetes NuGet
│   ├── Program.cs                         # Endpoints Minimal API, CORS y Swagger
│   ├── ManejarCSV.cs                      # Lógica de partición TOTAL y LÍNEA A LÍNEA
│   ├── ManejarArchivos.cs                 # Resolución dinámica de rutas del sistema
│   ├── FormatearCSV.cs                    # Normalización y serialización CSV
│   ├── Reserva.cs                         # Modelo de datos de Reserva
│   ├── Persona.cs                         # Modelo de datos de Pasajero
│   └── Archivos/                          # Almacenamiento local (CSVs excluidos en Git)
│       └── SalidaAirTortilla/             # Directorio de salida de los CSVs generados
│
├── frontend/                              # Dashboard Next.js con Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                 # Layout principal con estética oscura
│   │   │   ├── page.tsx                   # Ensamblador de vistas y sincronización API
│   │   │   └── globals.css                # Tokens de diseño y scrollbars de cristal
│   │   ├── components/
│   │   │   ├── Header.tsx                 # Barra superior de navegación y estado API
│   │   │   └── views/
│   │   │       ├── ViewReservas.tsx        # Tabla de vuelos con buscador y banderas
│   │   │       ├── ViewCoincidentes.tsx    # Tarjetas de casos con localizador común
│   │   │       ├── ViewGenerarFicheros.tsx # Consola terminal y disparadores C#
│   │   │       └── ViewVisorCSV.tsx        # Inspector y parseador interactivo de CSV
│   │   ├── lib/
│   │   │   └── api.ts                     # Cliente HTTP con caché y resiliencia Stale
│   │   └── types/
│   │       └── index.ts                   # Interfaces TypeScript sincronizadas con C#
│   └── package.json
│
├── .gitignore                             # Exclusión estricta de CSVs y compilados
├── EntregaFicheros.sln                    # Solución .NET
└── README.md                              # Documentación del proyecto
```

---

## 🛡️ Exclusión de Datos Sensibles (.gitignore)
Por política del proyecto, **ningún archivo de datos `.csv` se sube al repositorio de control de versiones**, garantizando que el repositorio contenga exclusivamente código fuente:
```gitignore
*.csv
**/*.csv
backend/Archivos/*.csv
backend/Archivos/SalidaAirTortilla/
```

---

<div align="center">

Desarrollado con ❤️ para **AirTortilla Flight Operations**.

</div>
