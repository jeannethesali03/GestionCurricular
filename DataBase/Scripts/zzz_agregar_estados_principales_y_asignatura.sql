USE Gestion_curricular;

SET @tabla_estado = 'Sede';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Facultad';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Carreras';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Asignatura_carrera';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Usuarios_participantes_asignatura';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Unidades_didacticas';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Contenidos';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Objetivos_asignatura';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Tematica_ley';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Referencias_bibliograficas_asignatura';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Prerrequisitos_asignatura';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;
