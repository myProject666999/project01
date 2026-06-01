CREATE DATABASE IF NOT EXISTS yard_scheduling
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE yard_scheduling;

DROP TABLE IF EXISTS slot_lock;
DROP TABLE IF EXISTS appointment;
DROP TABLE IF EXISTS container;
DROP TABLE IF EXISTS yard_slot;
DROP TABLE IF EXISTS yard_zone;

CREATE TABLE yard_zone (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_code   VARCHAR(16)  NOT NULL UNIQUE,
    zone_name   VARCHAR(64)  NOT NULL,
    zone_type   VARCHAR(16)  NOT NULL DEFAULT 'normal' COMMENT 'normal | dangerous',
    imo_class   VARCHAR(16)  NULL     COMMENT 'IMO class: 1-9 when zone_type=dangerous',
    min_spacing INT          NOT NULL DEFAULT 0  COMMENT 'min slots distance to normal zone',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE yard_slot (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    zone_id     BIGINT        NOT NULL,
    bay         INT           NOT NULL COMMENT 'bay index (贝位)',
    row         INT           NOT NULL COMMENT 'row index (排)',
    tier        INT           NOT NULL COMMENT 'tier index (层), 1=bottom',
    status      VARCHAR(16)   NOT NULL DEFAULT 'empty' COMMENT 'empty | occupied | locked',
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_slot (zone_id, bay, row, tier),
    INDEX idx_zone_bay (zone_id, bay),
    CONSTRAINT fk_slot_zone FOREIGN KEY (zone_id) REFERENCES yard_zone(id)
) ENGINE=InnoDB;

CREATE TABLE container (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    container_no    VARCHAR(16)  NOT NULL UNIQUE COMMENT 'container number',
    owner_code      VARCHAR(8)   NOT NULL DEFAULT '' COMMENT 'shipping line owner code',
    size_type       VARCHAR(8)   NOT NULL DEFAULT '20GP' COMMENT '20GP / 40HQ / 40RF etc.',
    weight_kg       INT          NOT NULL DEFAULT 0,
    is_dangerous    TINYINT(1)   NOT NULL DEFAULT 0,
    imo_class       VARCHAR(16)  NULL     COMMENT 'IMO class when is_dangerous=1',
    arrival_time    DATETIME     NOT NULL COMMENT 'gate-in time',
    departure_time  DATETIME     NULL     COMMENT 'expected gate-out time',
    slot_id         BIGINT       NULL     COMMENT 'assigned yard_slot id',
    status          VARCHAR(16)  NOT NULL DEFAULT 'yard' COMMENT 'yard | out | transit',
    reshuffle_count INT          NOT NULL DEFAULT 0 COMMENT 'how many reshuffles caused',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slot (slot_id),
    INDEX idx_departure (departure_time),
    INDEX idx_status (status),
    CONSTRAINT fk_container_slot FOREIGN KEY (slot_id) REFERENCES yard_slot(id)
) ENGINE=InnoDB;

CREATE TABLE appointment (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    container_id    BIGINT       NOT NULL,
    truck_plate     VARCHAR(16)  NOT NULL DEFAULT '',
    driver_name     VARCHAR(32)  NOT NULL DEFAULT '',
    appoint_time    DATETIME     NOT NULL COMMENT 'scheduled pickup time window start',
    appoint_end     DATETIME     NOT NULL COMMENT 'scheduled pickup time window end',
    status          VARCHAR(16)  NOT NULL DEFAULT 'pending' COMMENT 'pending | processing | done | cancelled',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_container (container_id),
    INDEX idx_appoint_time (appoint_time),
    INDEX idx_status (status),
    CONSTRAINT fk_appointment_container FOREIGN KEY (container_id) REFERENCES container(id)
) ENGINE=InnoDB;

CREATE TABLE slot_lock (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    slot_id     BIGINT       NOT NULL UNIQUE,
    locker      VARCHAR(64)  NOT NULL COMMENT 'crane id or operator id',
    lock_type   VARCHAR(16)  NOT NULL DEFAULT 'stack' COMMENT 'stack | unstack | move',
    locked_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expire_at   DATETIME     NOT NULL COMMENT 'lock expiry time',
    CONSTRAINT fk_lock_slot FOREIGN KEY (slot_id) REFERENCES yard_slot(id)
) ENGINE=InnoDB;

INSERT INTO yard_zone (zone_code, zone_name, zone_type, imo_class, min_spacing) VALUES
('A', 'A区-普通箱区', 'normal', NULL, 0),
('B', 'B区-普通箱区', 'normal', NULL, 0),
('C', 'C区-普通箱区', 'normal', NULL, 0),
('D', 'D区-危险品箱区', 'dangerous', '3', 2),
('E', 'E区-危险品箱区', 'dangerous', '5.1', 3);
