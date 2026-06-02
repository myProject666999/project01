CREATE DATABASE IF NOT EXISTS polar_supply DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE polar_supply;

CREATE TABLE warehouse (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    capacity INT DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES category(id) ON DELETE SET NULL
);

CREATE TABLE supply (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INT NOT NULL,
    unit VARCHAR(20) NOT NULL,
    calories DECIMAL(10,2) DEFAULT NULL COMMENT '热量(kcal/单位), 仅食品类',
    shelf_life_days INT DEFAULT NULL COMMENT '保质期(天), 仅食品/药品类',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE inventory_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supply_id INT NOT NULL,
    warehouse_id INT NOT NULL,
    quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
    reserved_quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
    expiry_date DATE DEFAULT NULL,
    batch_no VARCHAR(50) DEFAULT NULL,
    last_stock_in DATETIME DEFAULT NULL,
    last_stock_out DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supply_id) REFERENCES supply(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(id)
);

CREATE TABLE voyage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voyage_no VARCHAR(50) NOT NULL UNIQUE,
    ship_name VARCHAR(100),
    arrival_date DATE NOT NULL,
    status ENUM('planned','shipping','arrived','completed') DEFAULT 'planned',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE voyage_supply (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voyage_id INT NOT NULL,
    supply_id INT NOT NULL,
    target_warehouse_id INT NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    actual_quantity DECIMAL(12,2) DEFAULT NULL,
    status ENUM('pending','stocked_in') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (voyage_id) REFERENCES voyage(id),
    FOREIGN KEY (supply_id) REFERENCES supply(id),
    FOREIGN KEY (target_warehouse_id) REFERENCES warehouse(id)
);

CREATE TABLE project (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    leader VARCHAR(100),
    description TEXT,
    status ENUM('active','completed','suspended') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE member (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role ENUM('station_chief','logistics','researcher') DEFAULT 'researcher',
    team VARCHAR(100),
    phone VARCHAR(20),
    project_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL
);

CREATE TABLE requisition (
    id INT AUTO_INCREMENT PRIMARY KEY,
    req_no VARCHAR(50) NOT NULL UNIQUE,
    member_id INT NOT NULL,
    project_id INT DEFAULT NULL,
    purpose_type ENUM('personal','project') DEFAULT 'personal',
    status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
    remark TEXT,
    approved_by INT DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES member(id),
    FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES member(id) ON DELETE SET NULL
);

CREATE TABLE requisition_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requisition_id INT NOT NULL,
    supply_id INT NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    remark TEXT,
    FOREIGN KEY (requisition_id) REFERENCES requisition(id) ON DELETE CASCADE,
    FOREIGN KEY (supply_id) REFERENCES supply(id)
);

CREATE TABLE inventory_record (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_item_id INT NOT NULL,
    type ENUM('in','out') NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    source_type VARCHAR(50) COMMENT 'voyage/requisition/stocktaking/manual',
    source_id INT DEFAULT NULL,
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_item(id)
);

CREATE TABLE alert (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supply_id INT NOT NULL,
    daily_consumption DECIMAL(10,4) DEFAULT 0,
    days_remaining DECIMAL(10,2) DEFAULT NULL,
    level ENUM('critical','warning','notice') DEFAULT 'notice',
    resolved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supply_id) REFERENCES supply(id)
);

CREATE TABLE demand_list (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    voyage_id INT DEFAULT NULL,
    status ENUM('draft','confirmed','submitted') DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (voyage_id) REFERENCES voyage(id) ON DELETE SET NULL
);

CREATE TABLE demand_list_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    demand_list_id INT NOT NULL,
    supply_id INT NOT NULL,
    required_quantity DECIMAL(12,2) NOT NULL,
    suggested_quantity DECIMAL(12,2) NOT NULL,
    remark TEXT,
    FOREIGN KEY (demand_list_id) REFERENCES demand_list(id) ON DELETE CASCADE,
    FOREIGN KEY (supply_id) REFERENCES supply(id)
);

CREATE TABLE stocktaking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_no VARCHAR(50) NOT NULL UNIQUE,
    scope_type ENUM('warehouse','category','all') DEFAULT 'all',
    scope_id INT DEFAULT NULL,
    status ENUM('pending','in_progress','completed','approved') DEFAULT 'pending',
    created_by INT NOT NULL,
    approved_by INT DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES member(id),
    FOREIGN KEY (approved_by) REFERENCES member(id) ON DELETE SET NULL
);

CREATE TABLE stocktaking_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stocktaking_id INT NOT NULL,
    inventory_item_id INT NOT NULL,
    book_quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_quantity DECIMAL(12,2) DEFAULT NULL,
    difference DECIMAL(12,2) DEFAULT NULL,
    remark TEXT,
    FOREIGN KEY (stocktaking_id) REFERENCES stocktaking(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_item(id)
);

INSERT INTO warehouse (name, location, capacity, description) VALUES
('食品仓库', 'A栋1层', 5000, '存放各类食品物资'),
('燃料仓库', 'B栋1层', 3000, '存放燃油、燃气等燃料'),
('科研器材库', 'C栋1层', 4000, '存放科研仪器设备'),
('药品仓库', 'A栋2层', 2000, '存放医疗药品及器材'),
('日常用品库', 'D栋1层', 3000, '存放日常生活用品');

INSERT INTO category (name, parent_id, description, sort_order) VALUES
('食品', NULL, '食品类物资', 1),
('速食食品', 1, '速食类食品', 1),
('生鲜食品', 1, '生鲜类食品', 2),
('干货调料', 1, '干货及调味品', 3),
('饮料', 1, '各类饮品', 4),
('燃料', NULL, '燃料类物资', 2),
('燃油', 5, '柴油、汽油等', 1),
('燃气', 5, '液化气等', 2),
('科研器材', NULL, '科研仪器设备', 3),
('仪器设备', 9, '科研仪器', 1),
('耗材', 9, '科研耗材', 2),
('药品', NULL, '医疗药品及器材', 4),
('常用药品', 12, '日常用药', 1),
('急救药品', 12, '急救用药', 2),
('医疗器械', 12, '医疗设备器械', 3),
('日常用品', NULL, '日常生活用品', 5),
('清洁用品', 16, '清洁洗涤用品', 1),
('办公文具', 16, '办公用品文具', 2),
('个人用品', 16, '个人生活用品', 3);

INSERT INTO project (name, leader, description, status) VALUES
('南极冰芯钻探项目', '张伟', '深层冰芯钻探与古气候研究', 'active'),
('企鹅种群生态研究', '李娜', '南极企鹅种群数量与行为生态研究', 'active'),
('极光观测项目', '王强', '南极极光现象观测与数据分析', 'active');

INSERT INTO member (name, role, team, phone, project_id) VALUES
('赵站长', 'station_chief', '管理层', '13800000001', NULL),
('刘后勤', 'logistics', '后勤组', '13800000002', NULL),
('张伟', 'researcher', '冰芯组', '13800000003', 1),
('李娜', 'researcher', '企鹅组', '13800000004', 2),
('王强', 'researcher', '极光组', '13800000005', 3),
('陈明', 'researcher', '冰芯组', '13800000006', 1),
('孙丽', 'researcher', '企鹅组', '13800000007', 2);

INSERT INTO supply (name, category_id, unit, calories, shelf_life_days, description) VALUES
('压缩饼干', 2, '箱', 4500.00, 365, '高热量压缩饼干'),
('方便面', 2, '箱', 3200.00, 270, '速食方便面'),
('速冻水饺', 3, '袋', 2100.00, 90, '速冻猪肉水饺'),
('大米', 4, '袋', 3450.00, 365, '优质长粒大米'),
('食用油', 4, '桶', 8840.00, 540, '大豆食用油'),
('食盐', 4, '袋', NULL, 1095, '精制食盐'),
('矿泉水', 5, '箱', NULL, 365, '天然矿泉水'),
('果汁饮料', 5, '箱', NULL, 270, '混合果汁饮料'),
('柴油', 6, '桶', NULL, NULL, '0号柴油'),
('液化气', 7, '罐', NULL, NULL, '民用液化石油气'),
('温度记录仪', 10, '台', NULL, NULL, '高精度温度记录仪'),
('采样管', 11, '支', NULL, NULL, '冰芯采样专用管'),
('滤纸', 11, '盒', NULL, NULL, '实验室滤纸'),
('感冒药', 13, '盒', NULL, 730, '复方感冒药'),
('消炎药', 13, '盒', NULL, 730, '头孢类消炎药'),
('急救包', 14, '个', NULL, 1095, '综合急救包'),
('血压计', 15, '台', NULL, NULL, '电子血压计'),
('洗衣液', 17, '瓶', NULL, 730, '浓缩洗衣液'),
('卫生纸', 19, '提', NULL, 1095, '卷筒卫生纸'),
('笔记本', 18, '本', NULL, NULL, 'A5硬壳笔记本');
