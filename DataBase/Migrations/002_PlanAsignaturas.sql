USE Gestion_curricular;

CREATE TABLE Plan_Asignaturas (
    id_plan_asignaturas INT AUTO_INCREMENT NOT NULL,
    id_plan INT NOT NULL,
    id_asignatura INT NOT NULL,
    numero_ciclo INT NOT NULL,
    numero_orden INT NOT NULL,
    CONSTRAINT pk_plan_asignaturas PRIMARY KEY (id_plan_asignaturas),
    CONSTRAINT uq_plan_asignatura UNIQUE (id_plan, id_asignatura),
    CONSTRAINT fk_plan_asignaturas_plan FOREIGN KEY (id_plan)
        REFERENCES Planes_estudio(id_plan),
    CONSTRAINT fk_plan_asignaturas_asignatura FOREIGN KEY (id_asignatura)
        REFERENCES Asignaturas(id_asignatura)
) ENGINE=InnoDB;

INSERT INTO Plan_Asignaturas (
    id_plan,
    id_asignatura,
    numero_ciclo,
    numero_orden
)
SELECT DISTINCT
    plan.id_plan,
    asignatura.id_asignatura,
    CASE UPPER(TRIM(asignatura.ciclo_academico))
        WHEN 'I' THEN 1
        WHEN 'II' THEN 2
        WHEN 'III' THEN 3
        WHEN 'IV' THEN 4
        WHEN 'V' THEN 5
        WHEN 'VI' THEN 6
        WHEN 'VII' THEN 7
        WHEN 'VIII' THEN 8
        ELSE 1
    END,
    COALESCE(asignatura.numero_orden, asignatura.id_asignatura)
FROM Asignaturas AS asignatura
INNER JOIN Asignatura_carrera AS asignatura_carrera
    ON asignatura_carrera.id_asignatura = asignatura.id_asignatura
INNER JOIN Planes_estudio AS plan
    ON plan.id_carrera = asignatura_carrera.id_carrera
ON DUPLICATE KEY UPDATE
    numero_ciclo = VALUES(numero_ciclo),
    numero_orden = VALUES(numero_orden);

UPDATE Asignaturas
SET area_formacion = 'Básicas'
WHERE LOWER(area_formacion) IN ('basica', 'básica', 'basicas', 'básicas');

UPDATE Asignaturas
SET area_formacion = 'Humanísticas'
WHERE LOWER(area_formacion) IN ('humanistica', 'humanística', 'humanisticas', 'humanísticas');

ALTER TABLE Asignaturas
    DROP INDEX numero_orden,
    DROP COLUMN numero_orden,
    DROP COLUMN ciclo_academico;
