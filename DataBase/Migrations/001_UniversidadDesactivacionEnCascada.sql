USE Gestion_curricular;

ALTER TABLE Sede
    ADD COLUMN direccion VARCHAR(255) NULL AFTER nombre_sede,
    ADD COLUMN telefono VARCHAR(30) NULL AFTER direccion;

ALTER TABLE Facultad
    ADD COLUMN decano VARCHAR(150) NULL AFTER nombre_facultad;

ALTER TABLE Tokens_autenticacion
    MODIFY COLUMN tipo_token ENUM(
        'activacion',
        'invitacion',
        'reset_password',
        'codigo_desactivacion'
    ) NOT NULL,
    ADD COLUMN intentos INT NOT NULL DEFAULT 0 AFTER consumido;

CREATE TABLE Restauraciones_jerarquia (
    id_restauracion INT AUTO_INCREMENT NOT NULL,
    tipo_raiz VARCHAR(20) NOT NULL,
    id_raiz INT NOT NULL,
    tipo_entidad VARCHAR(20) NOT NULL,
    id_entidad INT NOT NULL,
    estado_previo VARCHAR(32) NOT NULL,
    PRIMARY KEY (id_restauracion),
    INDEX idx_restauraciones_jerarquia_raiz (tipo_raiz, id_raiz)
) ENGINE=InnoDB;
