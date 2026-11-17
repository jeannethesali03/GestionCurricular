USE Gestion_curricular;

SET @tabla_estado = 'Usuarios_participantes_plan';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Actividades';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Orientaciones_metodologicas';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Requisitos_permanencia_graduacion';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Evaluacion_aprendizaje';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Items_justificacion';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Materiales_didacticos';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Objetivos_carrera';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Perfiles_curriculares';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Perfil_ingreso';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Perfil_egreso';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Referencias_bibliograficas_plan';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Plan_absorcion';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Matriz_cambios';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Matriz_congruencia';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;

SET @tabla_estado = 'Matriz_congruencia_asignatura';
SET @columna_existe = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @tabla_estado AND COLUMN_NAME = 'estado_registro');
SET @sql_estado = IF(@columna_existe = 0, CONCAT('ALTER TABLE `', @tabla_estado, '` ADD COLUMN estado_registro ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo'''), 'SELECT 1');
PREPARE agregar_estado FROM @sql_estado;
EXECUTE agregar_estado;
DEALLOCATE PREPARE agregar_estado;
