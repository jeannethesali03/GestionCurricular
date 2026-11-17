USE Gestion_curricular;

SET @existe_estado_asignatura = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Asignaturas'
      AND COLUMN_NAME = 'estado_asignatura'
);

SET @sql_agregar_estado_asignatura = IF(
    @existe_estado_asignatura = 0,
    'ALTER TABLE Asignaturas ADD COLUMN estado_asignatura ENUM(''activo'', ''inactivo'') NOT NULL DEFAULT ''activo''',
    'SELECT 1'
);

PREPARE agregar_estado_asignatura FROM @sql_agregar_estado_asignatura;
EXECUTE agregar_estado_asignatura;
DEALLOCATE PREPARE agregar_estado_asignatura;
