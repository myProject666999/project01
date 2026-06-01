CREATE DATABASE IF NOT EXISTS coffee_baking DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE coffee_baking;

CREATE TABLE green_beans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    origin VARCHAR(255) NOT NULL,
    processing_method VARCHAR(50) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    moisture_rate DECIMAL(5,2) DEFAULT NULL,
    screen_size VARCHAR(50) DEFAULT NULL,
    density DECIMAL(7,2) DEFAULT NULL,
    weight DECIMAL(10,2) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roasting_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    green_bean_id BIGINT NOT NULL,
    roasting_date DATETIME NOT NULL,
    bean_temp_start DECIMAL(5,1) DEFAULT NULL,
    bean_temp_end DECIMAL(5,1) DEFAULT NULL,
    air_temp_start DECIMAL(5,1) DEFAULT NULL,
    air_temp_end DECIMAL(5,1) DEFAULT NULL,
    turning_yellow_time DECIMAL(7,1) DEFAULT NULL COMMENT 'seconds from start',
    first_crack_start_time DECIMAL(7,1) DEFAULT NULL COMMENT 'seconds from start',
    first_crack_end_time DECIMAL(7,1) DEFAULT NULL COMMENT 'seconds from start',
    drop_time DECIMAL(7,1) DEFAULT NULL COMMENT 'seconds from start',
    development_time DECIMAL(7,1) DEFAULT NULL COMMENT 'seconds from first crack start to drop',
    total_time DECIMAL(7,1) DEFAULT NULL COMMENT 'seconds from start to drop',
    roast_level VARCHAR(20) DEFAULT NULL,
    charge_weight DECIMAL(10,2) DEFAULT NULL,
    drop_weight DECIMAL(10,2) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (green_bean_id) REFERENCES green_beans(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE curve_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roasting_record_id BIGINT NOT NULL,
    curve_type VARCHAR(20) NOT NULL COMMENT 'bean_temp or air_temp',
    elapsed_seconds DECIMAL(7,1) NOT NULL,
    temperature DECIMAL(5,1) NOT NULL,
    FOREIGN KEY (roasting_record_id) REFERENCES roasting_records(id) ON DELETE CASCADE,
    INDEX idx_curve_record_type (roasting_record_id, curve_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cupping_scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roasting_record_id BIGINT NOT NULL,
    cupping_date DATETIME NOT NULL,
    rest_hours INT DEFAULT NULL COMMENT 'hours between roast and cupping',
    dry_aroma DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '干香',
    wet_aroma DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '湿香',
    flavor DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '风味',
    aftertaste DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '余韵',
    acidity DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '酸质',
    body DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '醇厚度',
    uniformity DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '一致性',
    balance DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '平衡度',
    cleanness DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '干净度',
    sweetness DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '甜度',
    overall DECIMAL(3,1) NOT NULL DEFAULT 0 COMMENT '整体评价',
    total_score DECIMAL(4,1) NOT NULL DEFAULT 0,
    notes TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (roasting_record_id) REFERENCES roasting_records(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
