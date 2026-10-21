
-- ============================================================
-- BASE DE DATOS: Gestion_curricular
-- Motor: MySQL 8.0+
-- Codificacion: utf8mb4
-- Motor de almacenamiento: InnoDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS Gestion_curricular
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE Gestion_curricular;

-- ============================================================
-- 1. TABLAS BASE: SEDE, FACULTAD, ROLES Y CARRERAS
-- ============================================================

CREATE TABLE Sede (
    id_sede INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sede VARCHAR(200) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE Facultad (
    id_facultad INT AUTO_INCREMENT PRIMARY KEY,
    id_sede INT NOT NULL,
    nombre_facultad VARCHAR(200) NOT NULL,
    descripcion_facultad VARCHAR(200),

    CONSTRAINT fk_facultad_sede
        FOREIGN KEY (id_sede)
        REFERENCES Sede(id_sede)
) ENGINE=InnoDB;

CREATE TABLE Roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE,
    descripcion VARCHAR(255)
) ENGINE=InnoDB;

CREATE TABLE Carreras (
    id_carrera INT AUTO_INCREMENT PRIMARY KEY,
    id_facultad INT NOT NULL,
    nombre_carrera VARCHAR(200) NOT NULL,

    CONSTRAINT fk_carreras_facultad
        FOREIGN KEY (id_facultad)
        REFERENCES Facultad(id_facultad)
) ENGINE=InnoDB;

-- ============================================================
-- 2. USUARIOS Y AUTENTICACION
-- ============================================================

CREATE TABLE Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    id_facultad INT NULL,
    usuario VARCHAR(50) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    grado_academico VARCHAR(150) NOT NULL,
    experiencia_educacion_superior INT NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    estado_cuenta ENUM('activo', 'inactivo') NOT NULL,
    fecha_registro DATETIME,
    ultimo_acceso DATETIME,

    CONSTRAINT fk_usuarios_roles
        FOREIGN KEY (id_rol)
        REFERENCES Roles(id_rol),

    CONSTRAINT fk_usuarios_facultad
        FOREIGN KEY (id_facultad)
        REFERENCES Facultad(id_facultad)
) ENGINE=InnoDB;

CREATE TABLE Tokens_autenticacion (
    id_token INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    tipo_token ENUM(
        'activacion',
        'invitacion',
        'reset_password'
    ) NOT NULL,
    expiracion DATETIME NOT NULL,
    consumido BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_tokens_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE Registro_cambios (
    id_registro_cambio INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo_cambio VARCHAR(200) NOT NULL,
    detalle_cambio MEDIUMTEXT,
    tipo_cambio MEDIUMTEXT,
    fecha_hora DATETIME NOT NULL,

    CONSTRAINT fk_registro_cambios_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;

-- ============================================================
-- 3. PLANES DE ESTUDIO
-- ============================================================

CREATE TABLE Planes_estudio (
    id_plan INT AUTO_INCREMENT PRIMARY KEY,
    id_carrera INT NULL,
    modalidad ENUM(
        'presencial',
        'semipresencial',
        'virtual'
    ) NOT NULL,
    ciclo_inicio VARCHAR(20) NOT NULL,
    ciclo_fin VARCHAR(20) NOT NULL,
    fecha_aprobacion DATETIME,
    estado_plan ENUM(
        'borrador',
        'en_revision',
        'aprobado',
        'saliente_historico',
        'desactivado'
    ) DEFAULT 'borrador',
    imagen_pensum MEDIUMTEXT,
    fundamentacion MEDIUMTEXT,
    justificacion MEDIUMTEXT,
    diagnostico MEDIUMTEXT,
    politicas_implementacion MEDIUMTEXT,
    titulo_otorgar MEDIUMTEXT,
    requisitos_ingreso MEDIUMTEXT,
    requisitos_servicio_social MEDIUMTEXT,
    requisitos_permanencia_graduacion MEDIUMTEXT,
    asignaturas_ciclo_extraordinario MEDIUMTEXT,
    ingresos_equivalencias_extranjero MEDIUMTEXT,
    equivalencia_creditos_uvs MEDIUMTEXT,
    politicas_absorcion MEDIUMTEXT,
    servicio_social_practicas_profesionales MEDIUMTEXT,
    orientacion_metodologica MEDIUMTEXT,

    CONSTRAINT fk_planes_carrera
        FOREIGN KEY (id_carrera)
        REFERENCES Carreras(id_carrera)
) ENGINE=InnoDB;

CREATE TABLE Usuarios_participantes_plan (
    id_usuario_participante_plan INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    id_usuario INT NOT NULL,

    CONSTRAINT fk_participantes_plan_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan),

    CONSTRAINT fk_participantes_plan_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE Actividades (
    id_actividades INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    nombre_actividad MEDIUMTEXT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    responsable_implementacion MEDIUMTEXT NOT NULL,
    observacion MEDIUMTEXT,

    CONSTRAINT fk_actividades_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan)
) ENGINE=InnoDB;

CREATE TABLE Orientaciones_metodologicas (
    id_orientaciones_metodologicas INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    nombre MEDIUMTEXT,
    descripcion MEDIUMTEXT,

    CONSTRAINT fk_orientaciones_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan)
) ENGINE=InnoDB;

CREATE TABLE Requisitos_permanencia_graduacion (
    id_requisitos_permanencia_graduacion INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    nombre MEDIUMTEXT,
    descripcion MEDIUMTEXT,

    CONSTRAINT fk_requisitos_permanencia_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan)
) ENGINE=InnoDB;

CREATE TABLE Evaluacion_aprendizaje (
    id_evaluacion_aprendizaje INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    nombre MEDIUMTEXT,
    descripcion MEDIUMTEXT,

    CONSTRAINT fk_evaluacion_aprendizaje_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan)
) ENGINE=InnoDB;

CREATE TABLE Items_justificacion (
    id_items_justificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    nombre MEDIUMTEXT,
    descripcion MEDIUMTEXT,

    CONSTRAINT fk_items_justificacion_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan)
) ENGINE=InnoDB;

CREATE TABLE Materiales_didacticos (
    id_materiales_didacticos INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    nombre VARCHAR(150),
    descripcion MEDIUMTEXT,
    imagen MEDIUMTEXT,

    CONSTRAINT fk_materiales_didacticos_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan)
) ENGINE=InnoDB;

CREATE TABLE Objetivos_carrera (
    id_objetivo_carrera INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    tipo_objetivo ENUM('general', 'especifico') NOT NULL,
    descripcion_objetivo MEDIUMTEXT NOT NULL,

    CONSTRAINT fk_objetivos_carrera_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan)
) ENGINE=InnoDB;

CREATE TABLE Perfiles_curriculares (
    id_perfil_curricular INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,

    CONSTRAINT fk_perfiles_curriculares_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan)
) ENGINE=InnoDB;

CREATE TABLE Perfil_ingreso (
    id_perfil_ingreso INT AUTO_INCREMENT PRIMARY KEY,
    id_perfil_curricular INT NOT NULL,
    nombre VARCHAR(150),
    descripcion MEDIUMTEXT NOT NULL,

    CONSTRAINT fk_perfil_ingreso_curricular
        FOREIGN KEY (id_perfil_curricular)
        REFERENCES Perfiles_curriculares(id_perfil_curricular)
) ENGINE=InnoDB;

CREATE TABLE Perfil_egreso (
    id_perfil_egreso INT AUTO_INCREMENT PRIMARY KEY,
    id_perfil_curricular INT NOT NULL,
    nombre VARCHAR(150),
    descripcion MEDIUMTEXT NOT NULL,

    CONSTRAINT fk_perfil_egreso_curricular
        FOREIGN KEY (id_perfil_curricular)
        REFERENCES Perfiles_curriculares(id_perfil_curricular)
) ENGINE=InnoDB;

CREATE TABLE Referencias_bibliograficas_plan (
    id_referencia_bibliografica_plan INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    referencia MEDIUMTEXT NOT NULL,
    fragmento_texto_asociado MEDIUMTEXT NOT NULL,

    CONSTRAINT fk_referencias_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan)
) ENGINE=InnoDB;

-- ============================================================
-- 4. ASIGNATURAS Y SU RELACION CON LAS CARRERAS
-- ============================================================

CREATE TABLE Asignaturas (
    id_asignatura INT AUTO_INCREMENT PRIMARY KEY,
    nombre_asignatura VARCHAR(100) NOT NULL,
    codigo_asignatura VARCHAR(30) NOT NULL,
    area_formacion VARCHAR(30) NOT NULL,
    numero_orden INT UNIQUE,
    horas_ciclo INT NOT NULL,
    horas_semana INT NOT NULL,
    horas_practicas INT NOT NULL,
    duracion_ciclo_semana INT NOT NULL,
    duracion_hora_clase INT NOT NULL,
    unidades_valorativas INT NOT NULL,
    ciclo_academico VARCHAR(10) NOT NULL,
    modalidad ENUM(
        'presencial',
        'semipresencial',
        'nopresencial'
    ) NOT NULL,
    descripcion_asignatura MEDIUMTEXT,
    estrategia_metodologica MEDIUMTEXT,
    evaluacion MEDIUMTEXT,
    fuentes_electronicas MEDIUMTEXT
) ENGINE=InnoDB;

CREATE TABLE Asignatura_carrera (
    id_asignatura_carrera INT AUTO_INCREMENT PRIMARY KEY,
    id_carrera INT NOT NULL,
    id_asignatura INT NOT NULL,

    CONSTRAINT fk_asignatura_carrera_carrera
        FOREIGN KEY (id_carrera)
        REFERENCES Carreras(id_carrera),

    CONSTRAINT fk_asignatura_carrera_asignatura
        FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura)
) ENGINE=InnoDB;

CREATE TABLE Usuarios_participantes_asignatura (
    id_usuario_participante_asignatura INT AUTO_INCREMENT PRIMARY KEY,
    id_asignatura INT NOT NULL,
    id_usuario INT NOT NULL,

    CONSTRAINT fk_participantes_asignatura_asignatura
        FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura),

    CONSTRAINT fk_participantes_asignatura_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES Usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE Unidades_didacticas (
    id_unidades_didacticas INT AUTO_INCREMENT PRIMARY KEY,
    id_asignatura INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    objetivo VARCHAR(500) NOT NULL,

    CONSTRAINT fk_unidades_didacticas_asignatura
        FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura)
) ENGINE=InnoDB;

CREATE TABLE Contenidos (
    id_contenidos INT AUTO_INCREMENT PRIMARY KEY,
    id_unidades_didacticas INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion MEDIUMTEXT NULL,

    CONSTRAINT fk_contenidos_unidad
        FOREIGN KEY (id_unidades_didacticas)
        REFERENCES Unidades_didacticas(id_unidades_didacticas)
) ENGINE=InnoDB;

CREATE TABLE Objetivos_asignatura (
    id_objetivo_asignatura INT AUTO_INCREMENT PRIMARY KEY,
    id_asignatura INT NOT NULL,
    tipo_objetivo ENUM('general', 'especifico') NOT NULL,
    descripcion_objetivo MEDIUMTEXT NOT NULL,

    CONSTRAINT fk_objetivos_asignatura
        FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura)
) ENGINE=InnoDB;

CREATE TABLE Tematica_ley (
    id_tematica_ley INT AUTO_INCREMENT PRIMARY KEY,
    id_asignatura INT NULL,
    nombre MEDIUMTEXT,
    legislacion MEDIUMTEXT,
    otras_estrategias MEDIUMTEXT,

    CONSTRAINT fk_tematica_ley_asignatura
        FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura)
) ENGINE=InnoDB;

CREATE TABLE Referencias_bibliograficas_asignatura (
    id_referencia_bibliografica_asignatura INT AUTO_INCREMENT PRIMARY KEY,
    id_asignatura INT NOT NULL,
    referencia MEDIUMTEXT NOT NULL,

    CONSTRAINT fk_referencias_asignatura
        FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura)
) ENGINE=InnoDB;

-- ============================================================
-- 5. PRERREQUISITOS Y PLAN DE ABSORCION
-- ============================================================

CREATE TABLE Prerrequisitos_asignatura (
    id_prerrequisito_asignatura INT NOT NULL,
    id_asignatura INT NOT NULL,

    PRIMARY KEY (
        id_prerrequisito_asignatura,
        id_asignatura
    ),

    CONSTRAINT fk_prerrequisito_asignatura_requisito
        FOREIGN KEY (id_prerrequisito_asignatura)
        REFERENCES Asignaturas(id_asignatura),

    CONSTRAINT fk_prerrequisito_asignatura_asignatura
        FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura)
) ENGINE=InnoDB;

CREATE TABLE Plan_absorcion (
    id_plan_absorcion INT AUTO_INCREMENT PRIMARY KEY,
    id_asignatura INT NOT NULL,
    id_asignatura_equivalente INT NOT NULL,
    id_plan INT NOT NULL,

    CONSTRAINT fk_plan_absorcion_asignatura
        FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura),

    CONSTRAINT fk_plan_absorcion_equivalente
        FOREIGN KEY (id_asignatura_equivalente)
        REFERENCES Asignaturas(id_asignatura),

    CONSTRAINT fk_plan_absorcion_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan)
) ENGINE=InnoDB;

-- ============================================================
-- 6. MATRICES DE CAMBIOS Y CONGRUENCIA
-- ============================================================

CREATE TABLE Matriz_cambios (
    id_matriz_cambios INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    id_asignatura INT NULL,
    cambio MEDIUMTEXT,
    plan_vigente MEDIUMTEXT,
    plan_actualizado MEDIUMTEXT,
    justificacion MEDIUMTEXT,

    CONSTRAINT fk_matriz_cambios_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan),

    CONSTRAINT fk_matriz_cambios_asignatura
        FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura)
) ENGINE=InnoDB;

CREATE TABLE Matriz_congruencia (
    id_matriz_congruencia INT AUTO_INCREMENT PRIMARY KEY,
    id_plan INT NOT NULL,
    id_objetivo_carrera INT NOT NULL,
    competencia_diagnostico MEDIUMTEXT NOT NULL,

    CONSTRAINT fk_matriz_congruencia_plan
        FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan),

    CONSTRAINT fk_matriz_congruencia_objetivo
        FOREIGN KEY (id_objetivo_carrera)
        REFERENCES Objetivos_carrera(id_objetivo_carrera)
) ENGINE=InnoDB;

CREATE TABLE Matriz_congruencia_asignatura (
    id_matriz_congruencia_asignatura INT AUTO_INCREMENT PRIMARY KEY,
    id_matriz_congruencia INT NOT NULL,
    id_asignatura INT NOT NULL,

    CONSTRAINT fk_matriz_congruencia_asignatura_matriz
        FOREIGN KEY (id_matriz_congruencia)
        REFERENCES Matriz_congruencia(id_matriz_congruencia),

    CONSTRAINT fk_matriz_congruencia_asignatura_asignatura
        FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura)
) ENGINE=InnoDB;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================


