-- Tipos enumerados para restringir los valores permitidos en cada columna
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
    'MIGRACION_CSV',
    'FALLO_SISTEMA'
);

-- Tabla de roles para control de acceso (RBAC)
CREATE TABLE roles (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    estado estado_rol NOT NULL DEFAULT 'ACTIVO',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios del sistema con contraseñas cifradas en BCrypt
CREATE TABLE usuarios (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    estado estado_usuario NOT NULL DEFAULT 'ACTIVO',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de trazabilidad y auditoría de seguridad
CREATE TABLE logs_app (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id INT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
    modulo_afectado VARCHAR(100) NOT NULL,
    tipo_evento tipo_evento_log NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reservas aéreas migradas desde el CSV
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

-- Índices para optimizar las consultas por clave foránea y fechas de auditoría
CREATE INDEX idx_usuarios_rol_id ON usuarios(rol_id);
CREATE INDEX idx_logs_app_usuario_id ON logs_app(usuario_id);
CREATE INDEX idx_logs_app_creado_en ON logs_app(creado_en DESC);

-- Índices para agilizar la detección de localizadores coincidentes y filtros
CREATE INDEX idx_reservas_localizador ON reservas(localizador);
CREATE INDEX idx_reservas_codigo ON reservas(codigo_reserva);
CREATE INDEX idx_reservas_fecha_vuelo ON reservas(fecha_vuelo);
CREATE INDEX idx_reservas_pais_destino ON reservas(pais_destino);

-- Roles iniciales requeridos por la aplicación
INSERT INTO roles (nombre) VALUES 
    ('ADMINISTRADOR'),
    ('EMPLEADO')
ON CONFLICT (nombre) DO NOTHING;
