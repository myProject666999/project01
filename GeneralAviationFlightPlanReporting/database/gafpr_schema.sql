CREATE DATABASE IF NOT EXISTS gafpr DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gafpr;

DROP TABLE IF EXISTS weather_briefing;
DROP TABLE IF EXISTS approval_process;
DROP TABLE IF EXISTS approval_node_config;
DROP TABLE IF EXISTS flight_plan;
DROP TABLE IF EXISTS pilot_qualification;
DROP TABLE IF EXISTS pilot;
DROP TABLE IF EXISTS aircraft;
DROP TABLE IF EXISTS airspace;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    role VARCHAR(20) NOT NULL COMMENT 'PILOT/ADMIN/APPROVER',
    status TINYINT DEFAULT 1 COMMENT '1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pilot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_type VARCHAR(50) NOT NULL COMMENT 'PPL/CPL/ATPL',
    issue_date DATE,
    expiry_date DATE,
    total_flight_hours DECIMAL(10,2) DEFAULT 0,
    medical_certificate VARCHAR(50),
    medical_expiry_date DATE,
    status TINYINT DEFAULT 1 COMMENT '1-有效 0-无效',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    INDEX idx_license_number (license_number),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pilot_qualification (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pilot_id BIGINT NOT NULL,
    aircraft_type VARCHAR(50) NOT NULL COMMENT '可驾驶机型',
    rating VARCHAR(50),
    issue_date DATE,
    expiry_date DATE,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id) REFERENCES pilot(id),
    INDEX idx_pilot_id (pilot_id),
    INDEX idx_aircraft_type (aircraft_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE aircraft (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL UNIQUE COMMENT '注册号',
    aircraft_type VARCHAR(50) NOT NULL COMMENT '机型',
    aircraft_model VARCHAR(100) COMMENT '型号',
    manufacturer VARCHAR(100),
    max_altitude INT COMMENT '最大升限(米)',
    max_speed INT COMMENT '最大速度(km/h)',
    endurance INT COMMENT '续航时间(分钟)',
    owner VARCHAR(100),
    status TINYINT DEFAULT 1 COMMENT '1-可用 0-不可用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_registration_number (registration_number),
    INDEX idx_aircraft_type (aircraft_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE airspace (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE COMMENT '空域代码',
    name VARCHAR(100) NOT NULL COMMENT '空域名称',
    type VARCHAR(20) NOT NULL COMMENT 'A/B/C/D/G',
    lower_limit INT COMMENT '下限高度(米)',
    upper_limit INT COMMENT '上限高度(米)',
    center_lat DECIMAL(10,6),
    center_lng DECIMAL(10,6),
    radius INT COMMENT '半径(米)',
    polygon TEXT COMMENT '多边形坐标JSON',
    approval_level INT DEFAULT 1 COMMENT '审批层级',
    status TINYINT DEFAULT 1 COMMENT '1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE flight_plan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_number VARCHAR(50) UNIQUE COMMENT '计划编号',
    pilot_id BIGINT NOT NULL,
    aircraft_id BIGINT NOT NULL,
    flight_type VARCHAR(30) NOT NULL COMMENT '飞行类型：私人/农林作业/训练/其他',
    departure_airport VARCHAR(50) NOT NULL,
    arrival_airport VARCHAR(50) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    actual_departure_time DATETIME,
    actual_arrival_time DATETIME,
    route TEXT COMMENT '航线描述',
    waypoints TEXT COMMENT '航路点JSON',
    airspace_ids VARCHAR(200) COMMENT '涉及空域ID列表',
    altitude INT COMMENT '飞行高度(米)',
    speed INT COMMENT '飞行速度(km/h)',
    purpose TEXT COMMENT '飞行目的',
    passengers INT DEFAULT 0,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT 'DRAFT/SUBMITTED/APPROVING/APPROVED/REJECTED/CANCELLED/COMPLETED',
    submit_time DATETIME,
    approve_time DATETIME,
    cancel_time DATETIME,
    close_time DATETIME COMMENT '销号时间',
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id) REFERENCES pilot(id),
    FOREIGN KEY (aircraft_id) REFERENCES aircraft(id),
    INDEX idx_plan_number (plan_number),
    INDEX idx_pilot_id (pilot_id),
    INDEX idx_status (status),
    INDEX idx_departure_time (departure_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE approval_node_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    airspace_type VARCHAR(20) NOT NULL COMMENT '空域类型',
    level INT NOT NULL COMMENT '审批层级',
    node_name VARCHAR(50) NOT NULL COMMENT '节点名称',
    approver_role VARCHAR(50) NOT NULL COMMENT '审批角色',
    approver_user_id BIGINT COMMENT '指定审批人',
    sequence INT NOT NULL COMMENT '审批顺序',
    is_required TINYINT DEFAULT 1,
    description VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_airspace_type (airspace_type),
    INDEX idx_level (level),
    INDEX idx_sequence (sequence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE approval_process (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_plan_id BIGINT NOT NULL,
    node_config_id BIGINT NOT NULL,
    level INT NOT NULL,
    sequence INT NOT NULL,
    node_name VARCHAR(50) NOT NULL,
    approver_user_id BIGINT,
    approver_name VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING/APPROVED/REJECTED',
    comment TEXT,
    process_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_plan_id) REFERENCES flight_plan(id),
    FOREIGN KEY (node_config_id) REFERENCES approval_node_config(id),
    INDEX idx_flight_plan_id (flight_plan_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE weather_briefing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    flight_plan_id BIGINT NOT NULL,
    briefing_time DATETIME NOT NULL COMMENT '简报生成时间',
    valid_from DATETIME NOT NULL COMMENT '有效开始时间',
    valid_to DATETIME NOT NULL COMMENT '有效结束时间',
    departure_weather TEXT COMMENT '起飞机场天气',
    arrival_weather TEXT COMMENT '降落机场天气',
    enroute_weather TEXT COMMENT '航路天气',
    wind_speed INT COMMENT '风速(km/h)',
    wind_direction INT COMMENT '风向(度)',
    visibility INT COMMENT '能见度(米)',
    cloud_base INT COMMENT '云底高度(米)',
    temperature INT COMMENT '温度(C)',
    weather_condition VARCHAR(50) COMMENT '天气状况',
    briefing_content TEXT COMMENT '完整简报内容',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_plan_id) REFERENCES flight_plan(id),
    INDEX idx_flight_plan_id (flight_plan_id),
    INDEX idx_briefing_time (briefing_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO user (username, password, real_name, phone, email, role, status) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '系统管理员', '13800000001', 'admin@gafpr.com', 'ADMIN', 1),
('approver1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '审批员张三', '13800000002', 'approver1@gafpr.com', 'APPROVER', 1),
('approver2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '审批员李四', '13800000003', 'approver2@gafpr.com', 'APPROVER', 1),
('pilot1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', '飞行员王五', '13800000004', 'pilot1@gafpr.com', 'PILOT', 1);

INSERT INTO pilot (user_id, license_number, license_type, issue_date, expiry_date, total_flight_hours, medical_certificate, medical_expiry_date, status) VALUES
(4, 'PILOT-2023-0001', 'CPL', '2020-01-15', '2030-01-15', 520.5, 'MED-2023-0001', '2025-01-15', 1);

INSERT INTO pilot_qualification (pilot_id, aircraft_type, rating, issue_date, expiry_date) VALUES
(1, 'CESSNA-172', 'Single Engine', '2020-03-01', '2030-01-15'),
(1, 'BELL-407', 'Helicopter', '2021-06-01', '2030-01-15');

INSERT INTO aircraft (registration_number, aircraft_type, aircraft_model, manufacturer, max_altitude, max_speed, endurance, owner, status) VALUES
('B-1234', 'CESSNA-172', 'Skyhawk', 'Cessna', 4200, 226, 300, '通用航空有限公司', 1),
('B-5678', 'BELL-407', 'Bell 407', 'Bell Helicopter', 5700, 250, 240, '农林作业公司', 1),
('B-9012', 'DRONE-M1', 'Multi-Rotor Drone', 'DJI', 500, 60, 30, '测绘公司', 1);

INSERT INTO airspace (code, name, type, lower_limit, upper_limit, center_lat, center_lng, radius, approval_level, status) VALUES
('AS-A001', '北京管制区A类', 'A', 6000, 12000, 39.9042, 116.4074, 50000, 3, 1),
('AS-B001', '训练空域B1', 'B', 1000, 3000, 40.0, 116.5, 10000, 2, 1),
('AS-G001', '农林作业区G1', 'G', 0, 500, 39.5, 116.0, 20000, 1, 1);

INSERT INTO approval_node_config (airspace_type, level, node_name, approver_role, sequence, is_required, description) VALUES
('G', 1, '塔台审批', 'APPROVER', 1, 1, 'G类空域一级审批'),
('B', 1, '区域管制审批', 'APPROVER', 1, 1, 'B类空域一级审批'),
('B', 2, '进近管制审批', 'APPROVER', 2, 1, 'B类空域二级审批'),
('A', 1, '区域管制审批', 'APPROVER', 1, 1, 'A类空域一级审批'),
('A', 2, '进近管制审批', 'APPROVER', 2, 1, 'A类空域二级审批'),
('A', 3, '区调中心审批', 'APPROVER', 3, 1, 'A类空域三级审批');
