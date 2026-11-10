-- ==========================================
-- 1. TIPOS ENUM
-- ==========================================
CREATE TYPE estado_rol AS ENUM ('ACTIVO', 'INACTIVO', 'DEPRECADO');
CREATE TYPE estado_usuario AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'PENDIENTE');
CREATE TYPE tipo_evento_log AS ENUM (
    'CREAR',
    'ACTUALIZAR',
    'BORRAR',
    'INICIAR_SESION',
    'CERRAR_SESION',
    'ERROR_LOGIN',
    'EXPORTAR',
    'MIGRACION_CSV', -- Añadido útil para registrar cuándo importas el CSV
    'FALLO_SISTEMA'
);

-- ==========================================
-- 2. TABLA A: ROLES
-- ==========================================
CREATE TABLE roles (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    estado estado_rol NOT NULL DEFAULT 'ACTIVO',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. TABLA B: USUARIOS
-- ==========================================
CREATE TABLE usuarios (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    estado estado_usuario NOT NULL DEFAULT 'ACTIVO',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. TABLA C: LOGS DE LA APLICACIÓN
-- ==========================================
CREATE TABLE logs_app (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    modulo_afectado VARCHAR(100) NOT NULL,
    tipo_evento tipo_evento_log NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. TABLA D: RESERVAS (Migración desde CSV)
-- ==========================================
CREATE TABLE reservas (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_reserva VARCHAR(50) NOT NULL,
    nombre_pasajero VARCHAR(150) NOT NULL,
    correo VARCHAR(150),
    origen VARCHAR(50) NOT NULL,
    destino VARCHAR(50) NOT NULL,
    pais_destino VARCHAR(10),
    numero_vuelo VARCHAR(50),
    fecha_vuelo DATE NOT NULL,
    localizador VARCHAR(50) NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. ÍNDICES DE RENDIMIENTO
-- ==========================================
CREATE INDEX idx_usuarios_rol_id ON usuarios(rol_id);
CREATE INDEX idx_logs_app_usuario_id ON logs_app(usuario_id);
CREATE INDEX idx_logs_app_creado_en ON logs_app(creado_en DESC);

-- Índices para búsquedas rápidas de reservas y vuelos
CREATE INDEX idx_reservas_localizador ON reservas(localizador);
CREATE INDEX idx_reservas_codigo ON reservas(codigo_reserva);
CREATE INDEX idx_reservas_fecha_vuelo ON reservas(fecha_vuelo);
CREATE INDEX idx_reservas_pais_destino ON reservas(pais_destino);

-- ==========================================
-- 7. DATOS SEMILLA (Roles iniciales)
-- ==========================================
INSERT INTO roles (nombre) VALUES 
    ('ADMINISTRADOR'),
    ('EMPLEADO')
ON CONFLICT (nombre) DO NOTHING;

