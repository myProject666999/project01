CREATE DATABASE IF NOT EXISTS ocpp_charging DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ocpp_charging;

DROP TABLE IF EXISTS meter_values;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS connectors;
DROP TABLE IF EXISTS charge_points;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL DEFAULT '',
    balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL DEFAULT '',
    latitude DECIMAL(10,7) NOT NULL DEFAULT 0,
    longitude DECIMAL(10,7) NOT NULL DEFAULT 0,
    available_count INT NOT NULL DEFAULT 0,
    total_count INT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE charge_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id BIGINT NOT NULL,
    cp_serial VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT 'Available',
    error_code VARCHAR(64) NOT NULL DEFAULT 'NoError',
    power_kw DECIMAL(6,2) NOT NULL DEFAULT 0,
    price_per_kwh DECIMAL(6,4) NOT NULL DEFAULT 1.0000,
    last_heartbeat_at DATETIME NULL,
    is_online TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_station_id (station_id),
    INDEX idx_cp_serial (cp_serial)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE connectors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    charge_point_id BIGINT NOT NULL,
    connector_id INT NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'Available',
    qr_code VARCHAR(128) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_cp_connector (charge_point_id, connector_id),
    INDEX idx_qr_code (qr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    connector_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    expired_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_connector_id (connector_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    connector_id BIGINT NOT NULL,
    charge_point_id BIGINT NOT NULL,
    id_tag VARCHAR(64) NOT NULL DEFAULT '',
    start_time DATETIME NULL,
    stop_time DATETIME NULL,
    start_meter DECIMAL(12,4) NOT NULL DEFAULT 0,
    stop_meter DECIMAL(12,4) NOT NULL DEFAULT 0,
    consumed_kwh DECIMAL(12,4) NOT NULL DEFAULT 0,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    price_per_kwh DECIMAL(6,4) NOT NULL DEFAULT 1.0000,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    stop_reason VARCHAR(64) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_connector_id (connector_id),
    INDEX idx_charge_point_id (charge_point_id),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE meter_values (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL,
    charge_point_id BIGINT NOT NULL,
    connector_id_val INT NOT NULL DEFAULT 1,
    value DECIMAL(12,4) NOT NULL DEFAULT 0,
    measurand VARCHAR(64) NOT NULL DEFAULT 'Energy.Active.Import.Register',
    unit VARCHAR(32) NOT NULL DEFAULT 'Wh',
    recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    transaction_id VARCHAR(64) NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    pay_method VARCHAR(32) NOT NULL DEFAULT 'balance',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (phone, password, nickname, balance) VALUES
('13800000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TestUser1', 500.00),
('13800000002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'TestUser2', 300.00);

INSERT INTO stations (name, address, latitude, longitude, available_count, total_count) VALUES
('Wangjing Station', 'Wangjing SOHO, Chaoyang District, Beijing', 39.9942000, 116.4743000, 0, 4),
('Zhongguancun Station', 'No.1 Zhongguancun Street, Haidian District', 39.9818000, 116.3114000, 0, 4),
('Lujiazui Station', 'Lujiazui Ring Road, Pudong, Shanghai', 31.2397000, 121.4998000, 0, 4);

INSERT INTO charge_points (station_id, cp_serial, name, status, power_kw, price_per_kwh) VALUES
(1, 'CP-WJ-001', 'Wangjing #1', 'Available', 60.00, 1.2000),
(1, 'CP-WJ-002', 'Wangjing #2', 'Available', 120.00, 1.5000),
(2, 'CP-ZGC-001', 'Zhongguancun #1', 'Available', 60.00, 1.2000),
(2, 'CP-ZGC-002', 'Zhongguancun #2', 'Available', 120.00, 1.5000),
(3, 'CP-LJZ-001', 'Lujiazui #1', 'Available', 60.00, 1.3000),
(3, 'CP-LJZ-002', 'Lujiazui #2', 'Available', 120.00, 1.6000);

INSERT INTO connectors (charge_point_id, connector_id, status, qr_code) VALUES
(1, 1, 'Available', 'QR-CP-WJ-001-1'),
(2, 1, 'Available', 'QR-CP-WJ-002-1'),
(3, 1, 'Available', 'QR-CP-ZGC-001-1'),
(4, 1, 'Available', 'QR-CP-ZGC-002-1'),
(5, 1, 'Available', 'QR-CP-LJZ-001-1'),
(6, 1, 'Available', 'QR-CP-LJZ-002-1');

UPDATE stations s SET available_count = (
    SELECT COUNT(*) FROM charge_points cp
    JOIN connectors c ON c.charge_point_id = cp.id
    WHERE cp.station_id = s.id AND cp.status = 'Available' AND c.status = 'Available'
);
