CREATE DATABASE IF NOT EXISTS border_port_clearance DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE border_port_clearance;

CREATE TABLE bpc_port (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '口岸名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '口岸编码',
    latitude DECIMAL(10,7) NOT NULL COMMENT '纬度',
    longitude DECIMAL(10,7) NOT NULL COMMENT '经度',
    radius INT NOT NULL DEFAULT 1000 COMMENT '校验半径(米)',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' COMMENT '状态:OPEN/CLOSED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='口岸档案表';

CREATE TABLE bpc_lane (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    port_id BIGINT NOT NULL COMMENT '口岸ID',
    lane_type VARCHAR(20) NOT NULL COMMENT '车道类型:CARGO/PASSENGER',
    lane_name VARCHAR(50) NOT NULL COMMENT '车道名称',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' COMMENT '状态:OPEN/CLOSED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) COMMENT='车道表';

CREATE TABLE bpc_quota (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    port_id BIGINT NOT NULL COMMENT '口岸ID',
    lane_id BIGINT NOT NULL COMMENT '车道ID',
    vehicle_type VARCHAR(20) NOT NULL COMMENT '车型:CARGO/PASSENGER',
    quota_date DATE NOT NULL COMMENT '配额日期',
    time_slot VARCHAR(20) NOT NULL COMMENT '时段:如08:00-09:00',
    base_quota INT NOT NULL DEFAULT 0 COMMENT '基础配额',
    adjusted_quota INT NOT NULL DEFAULT 0 COMMENT '调整后配额',
    used_count INT NOT NULL DEFAULT 0 COMMENT '已使用数量',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_quota (port_id, vehicle_type, quota_date, time_slot)
) COMMENT='配额表';

CREATE TABLE bpc_appointment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_no VARCHAR(32) NOT NULL UNIQUE COMMENT '预约编号',
    port_id BIGINT NOT NULL COMMENT '口岸ID',
    quota_id BIGINT NOT NULL COMMENT '配额ID',
    vehicle_type VARCHAR(20) NOT NULL COMMENT '车型',
    plate_number VARCHAR(20) NOT NULL COMMENT '车牌号',
    driver_name VARCHAR(50) NOT NULL COMMENT '司机姓名',
    driver_phone VARCHAR(20) NOT NULL COMMENT '司机手机号',
    appointment_date DATE NOT NULL COMMENT '预约日期',
    time_slot VARCHAR(20) NOT NULL COMMENT '预约时段',
    qr_code VARCHAR(255) COMMENT '二维码内容',
    status VARCHAR(20) NOT NULL DEFAULT 'BOOKED' COMMENT '状态:BOOKED/CHECKED_IN/CANCELLED/EXPIRED',
    checkin_latitude DECIMAL(10,7) COMMENT '签到纬度',
    checkin_longitude DECIMAL(10,7) COMMENT '签到经度',
    checkin_time DATETIME COMMENT '签到时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_port_date (port_id, appointment_date),
    KEY idx_phone (driver_phone)
) COMMENT='预约表';

CREATE TABLE bpc_queue_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    port_id BIGINT NOT NULL COMMENT '口岸ID',
    appointment_id BIGINT NOT NULL COMMENT '预约ID',
    lane_name VARCHAR(50) NOT NULL COMMENT '车道名称',
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING' COMMENT '状态:WAITING/PROCESSING/CLEARED',
    queue_position INT NOT NULL DEFAULT 0 COMMENT '排队位置',
    entered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '入场时间',
    cleared_at DATETIME COMMENT '通关时间'
) COMMENT='排队记录表';

INSERT INTO bpc_port (name, code, latitude, longitude, radius, status) VALUES
('友谊关口岸', 'YYG', 22.0558000, 106.7862000, 1000, 'OPEN'),
('东兴口岸', 'DX', 21.5361000, 107.9718000, 1000, 'OPEN'),
('绥芬河口岸', 'SFH', 44.4123000, 131.1523000, 1000, 'OPEN'),
('满洲里口岸', 'MZL', 49.5983000, 117.3787000, 1000, 'OPEN'),
('河口口岸', 'HK', 22.5046000, 103.9838000, 1000, 'OPEN');

INSERT INTO bpc_lane (port_id, lane_type, lane_name, status) VALUES
(1, 'CARGO', '货车1道', 'OPEN'),
(1, 'CARGO', '货车2道', 'OPEN'),
(1, 'CARGO', '货车3道', 'OPEN'),
(1, 'PASSENGER', '客车1道', 'OPEN'),
(1, 'PASSENGER', '客车2道', 'OPEN'),
(2, 'CARGO', '货车1道', 'OPEN'),
(2, 'CARGO', '货车2道', 'OPEN'),
(2, 'PASSENGER', '客车1道', 'OPEN'),
(3, 'CARGO', '货车1道', 'OPEN'),
(3, 'CARGO', '货车2道', 'OPEN'),
(3, 'PASSENGER', '客车1道', 'OPEN'),
(4, 'CARGO', '货车1道', 'OPEN'),
(4, 'CARGO', '货车2道', 'OPEN'),
(4, 'CARGO', '货车3道', 'OPEN'),
(4, 'PASSENGER', '客车1道', 'OPEN'),
(5, 'CARGO', '货车1道', 'OPEN'),
(5, 'PASSENGER', '客车1道', 'OPEN');
