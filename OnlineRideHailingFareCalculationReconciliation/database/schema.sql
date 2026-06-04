CREATE DATABASE IF NOT EXISTS taxi_reconciliation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taxi_reconciliation;

CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    license_no VARCHAR(50) UNIQUE NOT NULL,
    status TINYINT DEFAULT 1 COMMENT '1:在职 0:离职',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate_no VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    gps_device_id VARCHAR(50) UNIQUE NOT NULL,
    driver_id INT,
    status TINYINT DEFAULT 1 COMMENT '1:运营中 0:停运',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pricing_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    base_fare DECIMAL(10,2) NOT NULL DEFAULT 14.00 COMMENT '起步价',
    base_km DECIMAL(10,2) NOT NULL DEFAULT 3.00 COMMENT '起步里程',
    per_km_fare DECIMAL(10,2) NOT NULL DEFAULT 2.50 COMMENT '每公里单价',
    free_wait_minutes INT NOT NULL DEFAULT 5 COMMENT '免费等候时间',
    per_minute_wait_fare DECIMAL(10,2) NOT NULL DEFAULT 0.50 COMMENT '每分钟等候费',
    night_surcharge_rate DECIMAL(5,2) NOT NULL DEFAULT 0.30 COMMENT '夜间加价比例',
    night_start_hour INT NOT NULL DEFAULT 23 COMMENT '夜间开始时间',
    night_end_hour INT NOT NULL DEFAULT 5 COMMENT '夜间结束时间',
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gps_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gps_device_id VARCHAR(50) NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    speed DECIMAL(10,2) DEFAULT 0 COMMENT '速度 km/h',
    gps_time TIMESTAMP NOT NULL,
    INDEX idx_gps_device (gps_device_id),
    INDEX idx_gps_time (gps_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS trips (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_no VARCHAR(50) UNIQUE NOT NULL COMMENT '本地行程号',
    vehicle_id INT NOT NULL,
    driver_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    start_latitude DECIMAL(10,7),
    start_longitude DECIMAL(10,7),
    end_latitude DECIMAL(10,7),
    end_longitude DECIMAL(10,7),
    total_distance DECIMAL(10,2) DEFAULT 0 COMMENT '总里程 km',
    total_duration INT DEFAULT 0 COMMENT '总时长 秒',
    wait_duration INT DEFAULT 0 COMMENT '等候时长 秒',
    calculated_fare DECIMAL(10,2) DEFAULT 0 COMMENT '计算出的金额',
    status TINYINT DEFAULT 0 COMMENT '0:进行中 1:已完成 2:已对账',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    INDEX idx_driver_date (driver_id, start_time),
    INDEX idx_trip_date (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS platform_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '平台订单号',
    platform_name VARCHAR(50) NOT NULL COMMENT '平台名称',
    driver_id INT,
    driver_name VARCHAR(100),
    vehicle_plate VARCHAR(20),
    start_time DATETIME,
    end_time DATETIME,
    start_address VARCHAR(200),
    end_address VARCHAR(200),
    distance DECIMAL(10,2) DEFAULT 0 COMMENT '平台里程 km',
    duration INT DEFAULT 0 COMMENT '平台时长 秒',
    total_amount DECIMAL(10,2) DEFAULT 0 COMMENT '平台总金额',
    driver_amount DECIMAL(10,2) DEFAULT 0 COMMENT '司机应得',
    status TINYINT DEFAULT 0 COMMENT '0:未匹配 1:已匹配 2:有差异',
    matched_trip_id BIGINT,
    import_batch VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (matched_trip_id) REFERENCES trips(id),
    INDEX idx_order_date (start_time),
    INDEX idx_driver_order (driver_id, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reconciliations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reconciliation_no VARCHAR(50) UNIQUE NOT NULL,
    driver_id INT NOT NULL,
    reconciliation_date DATE NOT NULL,
    total_orders INT DEFAULT 0,
    matched_orders INT DEFAULT 0,
    diff_orders INT DEFAULT 0,
    platform_total_amount DECIMAL(10,2) DEFAULT 0,
    local_total_amount DECIMAL(10,2) DEFAULT 0,
    total_amount_diff DECIMAL(10,2) DEFAULT 0,
    status TINYINT DEFAULT 0 COMMENT '0:待确认 1:已确认 2:有申诉',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    UNIQUE KEY uk_driver_date (driver_id, reconciliation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reconciliation_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reconciliation_id BIGINT NOT NULL,
    platform_order_id BIGINT NOT NULL,
    trip_id BIGINT,
    order_no VARCHAR(50),
    platform_amount DECIMAL(10,2),
    local_amount DECIMAL(10,2),
    amount_diff DECIMAL(10,2),
    platform_distance DECIMAL(10,2),
    local_distance DECIMAL(10,2),
    distance_diff DECIMAL(10,2),
    is_diff TINYINT DEFAULT 0 COMMENT '0:无差异 1:有差异',
    diff_type VARCHAR(50),
    FOREIGN KEY (reconciliation_id) REFERENCES reconciliations(id),
    FOREIGN KEY (platform_order_id) REFERENCES platform_orders(id),
    FOREIGN KEY (trip_id) REFERENCES trips(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS appeals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appeal_no VARCHAR(50) UNIQUE NOT NULL,
    driver_id INT NOT NULL,
    reconciliation_id BIGINT,
    reconciliation_detail_id BIGINT,
    order_no VARCHAR(50),
    appeal_type VARCHAR(50) COMMENT '金额差异/里程差异/其他',
    appeal_reason TEXT,
    appeal_proof TEXT COMMENT '申诉证明材料',
    status TINYINT DEFAULT 0 COMMENT '0:待处理 1:处理中 2:已通过 3:已驳回',
    handler VARCHAR(100),
    handle_remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    handled_at DATETIME,
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (reconciliation_id) REFERENCES reconciliations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO pricing_rules (rule_name, base_fare, base_km, per_km_fare, free_wait_minutes, per_minute_wait_fare, night_surcharge_rate, night_start_hour, night_end_hour) VALUES 
('标准计价规则', 14.00, 3.00, 2.50, 5, 0.50, 0.30, 23, 5);

INSERT INTO drivers (driver_name, phone, license_no) VALUES 
('张三', '13800138001', 'DL12345678901'),
('李四', '13800138002', 'DL12345678902'),
('王五', '13800138003', 'DL12345678903');

INSERT INTO vehicles (plate_no, vehicle_type, gps_device_id, driver_id) VALUES 
('京B12345', '现代索纳塔', 'GPS001', 1),
('京B12346', '大众帕萨特', 'GPS002', 2),
('京B12347', '丰田凯美瑞', 'GPS003', 3);
