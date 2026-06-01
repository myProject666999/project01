CREATE DATABASE IF NOT EXISTS logistics_final_delivery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE logistics_final_delivery;

CREATE TABLE IF NOT EXISTS warehouses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '仓库名称',
    code VARCHAR(50) UNIQUE NOT NULL COMMENT '仓库编号',
    country VARCHAR(50) NOT NULL COMMENT '所在国家',
    city VARCHAR(100) NOT NULL COMMENT '所在城市',
    address TEXT NOT NULL COMMENT '详细地址',
    phone VARCHAR(30),
    status TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓库表';

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_no VARCHAR(50) UNIQUE NOT NULL COMMENT '客户编号',
    name VARCHAR(100) NOT NULL COMMENT '收件人姓名',
    phone VARCHAR(30) NOT NULL COMMENT '联系电话',
    email VARCHAR(100),
    country VARCHAR(50) NOT NULL COMMENT '国家',
    city VARCHAR(100) NOT NULL COMMENT '城市',
    state VARCHAR(100) COMMENT '州/省',
    zip_code VARCHAR(30) COMMENT '邮编',
    address TEXT NOT NULL COMMENT '详细地址',
    latitude DECIMAL(10, 7) COMMENT '纬度',
    longitude DECIMAL(10, 7) COMMENT '经度',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_no (customer_no),
    INDEX idx_phone (phone),
    INDEX idx_location (country, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

CREATE TABLE IF NOT EXISTS batches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    batch_no VARCHAR(50) UNIQUE NOT NULL COMMENT '批次号',
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    total_packages INT DEFAULT 0 COMMENT '包裹总数',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-已到仓, 2-分配中, 3-派送中, 4-已完成',
    arrived_at DATETIME COMMENT '到仓时间',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    INDEX idx_batch_no (batch_no),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批次表';

CREATE TABLE IF NOT EXISTS packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_no VARCHAR(50) UNIQUE NOT NULL COMMENT '包裹编号',
    batch_id BIGINT NOT NULL COMMENT '批次ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    weight DECIMAL(10, 2) COMMENT '重量(kg)',
    length DECIMAL(10, 2) COMMENT '长度(cm)',
    width DECIMAL(10, 2) COMMENT '宽度(cm)',
    height DECIMAL(10, 2) COMMENT '高度(cm)',
    goods_description TEXT COMMENT '货物描述',
    declared_value DECIMAL(12, 2) COMMENT '申报价值',
    currency VARCHAR(10) DEFAULT 'USD' COMMENT '货币',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-待分配, 2-已分配, 3-派送中, 4-已签收, 5-异常',
    language VARCHAR(10) DEFAULT 'en' COMMENT '面单语言: en, es, ar, fr, de',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    INDEX idx_package_no (package_no),
    INDEX idx_batch (batch_id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='包裹表';

CREATE TABLE IF NOT EXISTS labels (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    package_id BIGINT NOT NULL COMMENT '包裹ID',
    label_no VARCHAR(100) UNIQUE NOT NULL COMMENT '面单号',
    barcode VARCHAR(100) NOT NULL COMMENT '条码内容',
    barcode_type VARCHAR(20) DEFAULT 'CODE128' COMMENT '条码类型',
    language VARCHAR(10) DEFAULT 'en' COMMENT '语言',
    label_data JSON COMMENT '面单数据(JSON格式)',
    label_url VARCHAR(255) COMMENT '面单文件URL',
    printed TINYINT DEFAULT 0 COMMENT '是否已打印: 0-否, 1-是',
    printed_at DATETIME COMMENT '打印时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id),
    INDEX idx_label_no (label_no),
    INDEX idx_package (package_id),
    INDEX idx_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='面单表';

CREATE TABLE IF NOT EXISTS couriers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    courier_no VARCHAR(50) UNIQUE NOT NULL COMMENT '派送员编号',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    phone VARCHAR(30) UNIQUE NOT NULL COMMENT '手机号',
    email VARCHAR(100),
    avatar_url VARCHAR(255) COMMENT '头像URL',
    vehicle_type VARCHAR(50) COMMENT '车辆类型',
    vehicle_no VARCHAR(50) COMMENT '车牌号',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-离职, 1-在职, 2-休息, 3-派送中',
    current_area VARCHAR(100) COMMENT '当前负责区域',
    rating DECIMAL(3, 2) DEFAULT 5.00 COMMENT '评分',
    total_deliveries INT DEFAULT 0 COMMENT '总派送数',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_courier_no (courier_no),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='派送员表';

CREATE TABLE IF NOT EXISTS routes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    route_no VARCHAR(50) UNIQUE NOT NULL COMMENT '路线编号',
    courier_id BIGINT COMMENT '派送员ID',
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    name VARCHAR(100) COMMENT '路线名称',
    area VARCHAR(100) COMMENT '负责区域',
    total_tasks INT DEFAULT 0 COMMENT '总任务数',
    completed_tasks INT DEFAULT 0 COMMENT '已完成任务数',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-待分配, 2-已分配, 3-进行中, 4-已完成',
    estimated_start_time DATETIME COMMENT '预计开始时间',
    estimated_end_time DATETIME COMMENT '预计结束时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    optimized_path JSON COMMENT '优化后的路径数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (courier_id) REFERENCES couriers(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    INDEX idx_route_no (route_no),
    INDEX idx_courier (courier_id),
    INDEX idx_warehouse (warehouse_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='路线表';

CREATE TABLE IF NOT EXISTS delivery_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_no VARCHAR(50) UNIQUE NOT NULL COMMENT '任务编号',
    package_id BIGINT NOT NULL COMMENT '包裹ID',
    route_id BIGINT COMMENT '路线ID',
    courier_id BIGINT COMMENT '派送员ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    sequence INT COMMENT '派送顺序',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-待接单, 2-已接单, 3-派送中, 4-已签收, 5-异常',
    priority TINYINT DEFAULT 3 COMMENT '优先级: 1-高, 2-中, 3-低',
    estimated_delivery_time DATETIME COMMENT '预计送达时间',
    actual_delivery_time DATETIME COMMENT '实际送达时间',
    attempt_count INT DEFAULT 0 COMMENT '尝试派送次数',
    last_attempt_time DATETIME COMMENT '最后尝试时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (courier_id) REFERENCES couriers(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_task_no (task_no),
    INDEX idx_package (package_id),
    INDEX idx_route (route_id),
    INDEX idx_courier (courier_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配送任务表';

CREATE TABLE IF NOT EXISTS delivery_proofs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL COMMENT '任务ID',
    package_id BIGINT NOT NULL COMMENT '包裹ID',
    courier_id BIGINT NOT NULL COMMENT '派送员ID',
    photo_url VARCHAR(255) COMMENT '照片URL',
    signature_url VARCHAR(255) COMMENT '签名URL',
    signer_name VARCHAR(100) COMMENT '签收人姓名',
    signer_relation VARCHAR(50) COMMENT '签收关系: 本人, 家人, 邻居, 代收点',
    delivery_note TEXT COMMENT '派送备注',
    latitude DECIMAL(10, 7) COMMENT '签收纬度',
    longitude DECIMAL(10, 7) COMMENT '签收经度',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES delivery_tasks(id),
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (courier_id) REFERENCES couriers(id),
    INDEX idx_task (task_id),
    INDEX idx_package (package_id),
    INDEX idx_courier (courier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='签收证据表';

CREATE TABLE IF NOT EXISTS delivery_exceptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL COMMENT '任务ID',
    package_id BIGINT NOT NULL COMMENT '包裹ID',
    courier_id BIGINT NOT NULL COMMENT '派送员ID',
    exception_type VARCHAR(30) NOT NULL COMMENT '异常类型: reject-拒收, no_one-无人在家, wrong_address-地址错误, damaged-损坏, lost-丢失',
    exception_code VARCHAR(20) COMMENT '异常编码',
    description TEXT COMMENT '异常描述',
    photo_url VARCHAR(255) COMMENT '异常照片URL',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-待处理, 2-处理中, 3-已处理, 4-已关闭',
    handling_type VARCHAR(30) COMMENT '处理方式: return_warehouse-返仓, re_deliver-重投, contact_customer-联系客户, other-其他',
    handling_result TEXT COMMENT '处理结果',
    handled_by BIGINT COMMENT '处理人ID',
    handled_at DATETIME COMMENT '处理时间',
    next_attempt_time DATETIME COMMENT '下次尝试时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES delivery_tasks(id),
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (courier_id) REFERENCES couriers(id),
    INDEX idx_task (task_id),
    INDEX idx_package (package_id),
    INDEX idx_exception_type (exception_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='异常处理表';

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    email VARCHAR(100),
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL COMMENT '角色: admin-管理员, warehouse-仓库管理员, customer_service-客服',
    warehouse_id BIGINT COMMENT '所属仓库ID',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户表';

INSERT INTO warehouses (name, code, country, city, address, phone) VALUES
('洛杉矶海外仓', 'US-LAX-01', 'United States', 'Los Angeles', '123 Industrial Blvd, Los Angeles, CA 90001', '+1-213-555-0101'),
('马德里海外仓', 'ES-MAD-01', 'Spain', 'Madrid', '45 Logistics Ave, Madrid 28001', '+34-91-555-0101'),
('迪拜海外仓', 'AE-DXB-01', 'UAE', 'Dubai', '789 Free Zone St, Dubai', '+971-4-555-0101');

INSERT INTO users (username, password_hash, name, email, role, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'admin@logistics.com', 'admin', 1);

INSERT INTO couriers (courier_no, name, phone, vehicle_type, status, password_hash) VALUES
('C001', 'John Smith', '+1-213-555-1001', 'Van', 1, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('C002', 'Maria Garcia', '+34-91-555-1002', 'Motorcycle', 1, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
('C003', 'Ahmed Hassan', '+971-4-555-1003', 'Van', 1, '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');
