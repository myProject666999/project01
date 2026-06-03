-- ========================================
-- 报废汽车拆解回收管理系统 - 数据库初始化脚本
-- ========================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS scrap_car_management 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE scrap_car_management;

-- ========================================
-- 用户表
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'operator', 'hazardous_admin') NOT NULL DEFAULT 'operator',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 车辆表
-- ========================================
CREATE TABLE IF NOT EXISTS vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plate_number VARCHAR(20) NOT NULL,
    vin VARCHAR(50) NOT NULL UNIQUE,
    owner VARCHAR(100) NOT NULL,
    owner_phone VARCHAR(20),
    scrap_reason TEXT,
    transfer_date DATE,
    status ENUM('registered', 'dismantling', 'completed') DEFAULT 'registered',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_plate (plate_number),
    INDEX idx_vin (vin),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 拆解任务表
-- ========================================
CREATE TABLE IF NOT EXISTS dismantling_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_id INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    operator_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 拆解零件表
-- ========================================
CREATE TABLE IF NOT EXISTS dismantling_parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    weight DECIMAL(10,2) NOT NULL,
    is_reusable BOOLEAN DEFAULT FALSE,
    is_hazardous BOOLEAN DEFAULT FALSE,
    is_major_assembly BOOLEAN DEFAULT FALSE COMMENT '是否五大总成',
    major_assembly_type ENUM('engine', 'transmission', 'frame', 'front_axle', 'rear_axle', 'steering', 'none') DEFAULT 'none',
    status ENUM('pending', 'dismantled', 'stocked', 'disposed') DEFAULT 'pending',
    dismantled_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES dismantling_tasks(id) ON DELETE CASCADE,
    INDEX idx_task (task_id),
    INDEX idx_status (status),
    INDEX idx_major (is_major_assembly)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 库存表
-- ========================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    part_id INT NOT NULL UNIQUE,
    part_name VARCHAR(200) NOT NULL,
    quantity INT DEFAULT 1,
    weight DECIMAL(10,2) NOT NULL,
    location VARCHAR(100),
    in_date DATE NOT NULL,
    out_date DATE,
    price DECIMAL(10,2),
    buyer VARCHAR(200),
    status ENUM('in_stock', 'sold') DEFAULT 'in_stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES dismantling_parts(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_part_name (part_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 危废表
-- ========================================
CREATE TABLE IF NOT EXISTS hazardous_wastes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    part_id INT,
    type ENUM('oil', 'antifreeze', 'battery', 'other') NOT NULL,
    name VARCHAR(200) NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    vehicle_id INT NOT NULL,
    waybill_id INT,
    status ENUM('pending', 'transferred', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES dismantling_parts(id) ON DELETE SET NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle (vehicle_id),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 联单表
-- ========================================
CREATE TABLE IF NOT EXISTS waybills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    waybill_no VARCHAR(100) NOT NULL UNIQUE,
    disposal_factory VARCHAR(200) NOT NULL,
    factory_qualification VARCHAR(200),
    transfer_date DATE NOT NULL,
    total_weight DECIMAL(10,2) NOT NULL,
    signed_back BOOLEAN DEFAULT FALSE,
    signed_back_at TIMESTAMP NULL,
    signed_back_by INT,
    notes TEXT,
    status ENUM('pending', 'transferred', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (signed_back_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_waybill_no (waybill_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 月度报表表
-- ========================================
CREATE TABLE IF NOT EXISTS monthly_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_month VARCHAR(7) NOT NULL UNIQUE COMMENT '格式: YYYY-MM',
    total_vehicles INT DEFAULT 0,
    total_weight DECIMAL(12,2) DEFAULT 0,
    reusable_weight DECIMAL(12,2) DEFAULT 0,
    hazardous_weight DECIMAL(12,2) DEFAULT 0,
    major_assemblies_count INT DEFAULT 0,
    generated_by INT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_report_month (report_month),
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 联单-危废关联表
-- ========================================
CREATE TABLE IF NOT EXISTS waybill_wastes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    waybill_id INT NOT NULL,
    hazardous_waste_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (waybill_id) REFERENCES waybills(id) ON DELETE CASCADE,
    FOREIGN KEY (hazardous_waste_id) REFERENCES hazardous_wastes(id) ON DELETE CASCADE,
    UNIQUE KEY uk_waybill_waste (waybill_id, hazardous_waste_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 初始化数据
-- ========================================

-- 初始化用户（密码均为 123456，使用 bcrypt 加密）
INSERT INTO users (username, password, name, role, phone) VALUES 
('admin', '$2b$10$rX7X7X7X7X7X7X7X7X7X7uX7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X', '系统管理员', 'admin', '13800000001'),
('operator', '$2b$10$rX7X7X7X7X7X7X7X7X7X7uX7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X', '操作员', 'operator', '13800000002'),
('hazardous_admin', '$2b$10$rX7X7X7X7X7X7X7X7X7X7uX7X7X7X7X7X7X7X7X7X7X7X7X7X7X7X', '危废管理员', 'hazardous_admin', '13800000003')
ON DUPLICATE KEY UPDATE username=username;

-- 插入示例车辆数据
INSERT INTO vehicles (plate_number, vin, owner, owner_phone, scrap_reason, transfer_date, status, created_by) VALUES
('京A12345', 'LFV3A23C8D3123456', '张三', '13900001111', '车辆达到报废年限', '2026-05-15', 'registered', 1),
('京B67890', 'LSVAM4187C2123456', '李四', '13900002222', '发动机严重损坏无法修复', '2026-05-20', 'dismantling', 1),
('京C11111', 'LGBF3DE08DY123456', '王五', '13900003333', '交通事故报废', '2026-05-25', 'completed', 1)
ON DUPLICATE KEY UPDATE vin=vin;

-- 插入示例拆解任务
INSERT INTO dismantling_tasks (vehicle_id, status, start_date, operator_id) VALUES
(2, 'in_progress', '2026-06-01', 2),
(3, 'completed', '2026-05-26', 2)
ON DUPLICATE KEY UPDATE id=id;

-- 插入示例拆解零件
INSERT INTO dismantling_parts (task_id, name, category, weight, is_reusable, is_hazardous, is_major_assembly, major_assembly_type, status) VALUES
(1, '发动机', '动力系统', 150.00, FALSE, FALSE, TRUE, 'engine', 'dismantled'),
(1, '变速箱', '传动系统', 85.50, FALSE, FALSE, TRUE, 'transmission', 'dismantled'),
(1, '车架', '车身系统', 280.00, FALSE, FALSE, TRUE, 'frame', 'pending'),
(1, '左前大灯', '照明系统', 3.20, TRUE, FALSE, FALSE, 'none', 'dismantled'),
(1, '发电机', '电器系统', 12.50, TRUE, FALSE, FALSE, 'none', 'dismantled'),
(2, '发动机', '动力系统', 145.00, FALSE, FALSE, TRUE, 'engine', 'disposed'),
(2, '变速箱', '传动系统', 80.00, FALSE, FALSE, TRUE, 'transmission', 'disposed'),
(2, '车架', '车身系统', 275.00, FALSE, FALSE, TRUE, 'frame', 'disposed'),
(2, '空调压缩机', '制冷系统', 8.50, TRUE, FALSE, FALSE, 'none', 'stocked')
ON DUPLICATE KEY UPDATE id=id;

-- 插入示例库存
INSERT INTO inventory_items (part_id, part_name, quantity, weight, location, in_date, price, status) VALUES
(4, '左前大灯', 1, 3.20, 'A区-01-001', '2026-06-02', 280.00, 'in_stock'),
(5, '发电机', 1, 12.50, 'B区-02-015', '2026-06-02', 350.00, 'in_stock'),
(9, '空调压缩机', 1, 8.50, 'C区-03-008', '2026-05-28', 420.00, 'in_stock')
ON DUPLICATE KEY UPDATE part_id=part_id;

-- 插入示例危废
INSERT INTO hazardous_wastes (part_id, type, name, weight, vehicle_id, status) VALUES
(NULL, 'oil', '发动机机油', 4.50, 2, 'pending'),
(NULL, 'antifreeze', '防冻液', 8.00, 2, 'pending'),
(NULL, 'battery', '铅酸蓄电池', 15.00, 2, 'pending'),
(NULL, 'oil', '变速箱油', 2.50, 3, 'completed'),
(NULL, 'antifreeze', '防冻液', 6.50, 3, 'completed')
ON DUPLICATE KEY UPDATE id=id;

-- 插入示例联单
INSERT INTO waybills (waybill_no, disposal_factory, factory_qualification, transfer_date, total_weight, signed_back, signed_back_at, status) VALUES
('WB202605001', '北京市危险废物处置中心', '危废证字第110100123号', '2026-05-30', 9.00, TRUE, '2026-06-01 10:30:00', 'completed')
ON DUPLICATE KEY UPDATE waybill_no=waybill_no;

-- 关联联单和危废
INSERT INTO waybill_wastes (waybill_id, hazardous_waste_id) VALUES
(1, 4),
(1, 5)
ON DUPLICATE KEY UPDATE id=id;

-- 插入示例月度报表
INSERT INTO monthly_reports (report_month, total_vehicles, total_weight, reusable_weight, hazardous_weight, major_assemblies_count, generated_by) VALUES
('2026-05', 3, 1061.20, 24.20, 36.50, 6, 1)
ON DUPLICATE KEY UPDATE report_month=report_month;
