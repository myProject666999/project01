-- 食品厂生产批次溯源系统数据库
CREATE DATABASE IF NOT EXISTS traceability DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE traceability;

-- 供应商表
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '供应商名称',
    contact VARCHAR(50) COMMENT '联系人',
    phone VARCHAR(20) COMMENT '联系电话',
    address VARCHAR(255) COMMENT '地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='供应商表';

-- 原料表
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '原料名称',
    code VARCHAR(50) UNIQUE COMMENT '原料编码',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '计量单位',
    description TEXT COMMENT '描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料表';

-- 原料批次表
CREATE TABLE IF NOT EXISTS material_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_no VARCHAR(50) UNIQUE NOT NULL COMMENT '原料批次号',
    material_id INT NOT NULL COMMENT '原料ID',
    supplier_id INT NOT NULL COMMENT '供应商ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '入库数量',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '计量单位',
    production_date DATE COMMENT '生产日期',
    expiry_date DATE COMMENT '保质期',
    warehouse_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '入库时间',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    INDEX idx_batch_no (batch_no),
    INDEX idx_material_id (material_id),
    INDEX idx_supplier_id (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料批次表';

-- 产品表
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '产品名称',
    code VARCHAR(50) UNIQUE COMMENT '产品编码',
    unit VARCHAR(20) DEFAULT '箱' COMMENT '计量单位',
    price DECIMAL(10,2) COMMENT '单价',
    description TEXT COMMENT '描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表';

-- 生产工单表
CREATE TABLE IF NOT EXISTS work_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '工单号',
    product_id INT NOT NULL COMMENT '产品ID',
    plan_quantity INT NOT NULL COMMENT '计划生产数量',
    actual_quantity INT COMMENT '实际生产数量',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    status ENUM('pending', 'processing', 'completed') DEFAULT 'pending' COMMENT '状态',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order_no (order_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生产工单表';

-- 工单领料表（原料批次 -> 工单 关联）
CREATE TABLE IF NOT EXISTS work_order_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    work_order_id INT NOT NULL COMMENT '工单ID',
    material_batch_id INT NOT NULL COMMENT '原料批次ID',
    quantity DECIMAL(10,2) NOT NULL COMMENT '领料数量',
    unit VARCHAR(20) DEFAULT 'kg' COMMENT '计量单位',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_batch_id) REFERENCES material_batches(id) ON DELETE CASCADE,
    UNIQUE KEY uk_order_material (work_order_id, material_batch_id),
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_material_batch_id (material_batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单领料表';

-- 成品批次表
CREATE TABLE IF NOT EXISTS product_batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_no VARCHAR(50) UNIQUE NOT NULL COMMENT '成品批次号',
    product_id INT NOT NULL COMMENT '产品ID',
    work_order_id INT NOT NULL COMMENT '生产工单ID',
    quantity INT NOT NULL COMMENT '生产数量',
    unit VARCHAR(20) DEFAULT '箱' COMMENT '计量单位',
    production_date DATE NOT NULL COMMENT '生产日期',
    expiry_date DATE COMMENT '保质期',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    INDEX idx_batch_no (batch_no),
    INDEX idx_product_id (product_id),
    INDEX idx_work_order_id (work_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成品批次表';

-- 经销商表
CREATE TABLE IF NOT EXISTS distributors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '经销商名称',
    contact VARCHAR(50) COMMENT '联系人',
    phone VARCHAR(20) COMMENT '联系电话',
    address VARCHAR(255) COMMENT '地址',
    region VARCHAR(50) COMMENT '区域',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='经销商表';

-- 出库记录表（成品批次 -> 经销商 关联）
CREATE TABLE IF NOT EXISTS shipments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_no VARCHAR(50) UNIQUE NOT NULL COMMENT '出库单号',
    product_batch_id INT NOT NULL COMMENT '成品批次ID',
    distributor_id INT NOT NULL COMMENT '经销商ID',
    quantity INT NOT NULL COMMENT '出库数量',
    unit VARCHAR(20) DEFAULT '箱' COMMENT '计量单位',
    shipment_date DATE NOT NULL COMMENT '出库日期',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_batch_id) REFERENCES product_batches(id) ON DELETE CASCADE,
    FOREIGN KEY (distributor_id) REFERENCES distributors(id) ON DELETE CASCADE,
    INDEX idx_shipment_no (shipment_no),
    INDEX idx_product_batch_id (product_batch_id),
    INDEX idx_distributor_id (distributor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库记录表';

-- 插入测试数据

-- 供应商
INSERT INTO suppliers (name, contact, phone, address) VALUES
('山东农场一号', '王总', '13800138001', '山东省济南市XX区'),
('黑龙江大豆基地', '李总', '13800138002', '黑龙江省哈尔滨市XX区'),
('河南面粉厂', '张总', '13800138003', '河南省郑州市XX区'),
('广东糖业', '陈总', '13800138004', '广东省广州市XX区');

-- 原料
INSERT INTO materials (name, code, unit) VALUES
('小麦粉', 'MAT001', 'kg'),
('大豆油', 'MAT002', 'kg'),
('白砂糖', 'MAT003', 'kg'),
('鸡蛋', 'MAT004', 'kg'),
('酵母', 'MAT005', 'kg');

-- 原料批次
INSERT INTO material_batches (batch_no, material_id, supplier_id, quantity, production_date, expiry_date) VALUES
('RM20240101001', 1, 3, 5000, '2024-01-01', '2024-07-01'),
('RM20240101002', 1, 3, 3000, '2024-01-05', '2024-07-05'),
('RM20240102001', 2, 2, 2000, '2024-01-02', '2025-01-02'),
('RM20240103001', 3, 4, 1500, '2024-01-03', '2025-01-03'),
('RM20240104001', 4, 1, 1000, '2024-01-04', '2024-01-14'),
('RM20240105001', 5, 1, 100, '2024-01-05', '2024-03-05');

-- 产品
INSERT INTO products (name, code, unit, price) VALUES
('吐司面包', 'PRO001', '箱', 120.00),
('牛角包', 'PRO002', '箱', 180.00),
('蛋糕', 'PRO003', '箱', 300.00),
('饼干', 'PRO004', '箱', 150.00);

-- 生产工单
INSERT INTO work_orders (order_no, product_id, plan_quantity, actual_quantity, start_time, end_time, status) VALUES
('WO20240110001', 1, 500, 480, '2024-01-10 08:00:00', '2024-01-10 18:00:00', 'completed'),
('WO20240111001', 2, 300, 290, '2024-01-11 08:00:00', '2024-01-11 16:00:00', 'completed'),
('WO20240112001', 3, 200, 195, '2024-01-12 08:00:00', '2024-01-12 20:00:00', 'completed'),
('WO20240113001', 1, 400, 390, '2024-01-13 08:00:00', '2024-01-13 18:00:00', 'completed'),
('WO20240114001', 4, 600, 580, '2024-01-14 08:00:00', '2024-01-14 17:00:00', 'completed');

-- 工单领料（建立原料与工单的关联）
INSERT INTO work_order_materials (work_order_id, material_batch_id, quantity) VALUES
-- 工单1: 吐司面包 - 使用面粉批次1、油批次1、糖批次1
(1, 1, 1200),
(1, 3, 200),
(1, 4, 150),
-- 工单2: 牛角包 - 使用面粉批次1、油批次1、糖批次1、酵母批次1
(2, 1, 800),
(2, 3, 150),
(2, 4, 100),
(2, 6, 20),
-- 工单3: 蛋糕 - 使用面粉批次2、油批次1、糖批次1、鸡蛋批次1
(3, 2, 500),
(3, 3, 100),
(3, 4, 200),
(3, 5, 300),
-- 工单4: 吐司面包 - 使用面粉批次2、油批次1、糖批次1
(4, 2, 1000),
(4, 3, 180),
(4, 4, 120),
-- 工单5: 饼干 - 使用面粉批次1、油批次1、糖批次1
(5, 1, 1500),
(5, 3, 300),
(5, 4, 250);

-- 成品批次
INSERT INTO product_batches (batch_no, product_id, work_order_id, quantity, production_date, expiry_date) VALUES
('FG20240110001', 1, 1, 480, '2024-01-10', '2024-02-10'),
('FG20240111001', 2, 2, 290, '2024-01-11', '2024-02-11'),
('FG20240112001', 3, 3, 195, '2024-01-12', '2024-01-26'),
('FG20240113001', 1, 4, 390, '2024-01-13', '2024-02-13'),
('FG20240114001', 4, 5, 580, '2024-01-14', '2024-04-14');

-- 经销商
INSERT INTO distributors (name, contact, phone, address, region) VALUES
('北京商贸有限公司', '赵经理', '13900139001', '北京市朝阳区XX路', '华北'),
('上海食品贸易', '钱经理', '13900139002', '上海市浦东新区XX路', '华东'),
('广州批发商', '孙经理', '13900139003', '广州市天河区XX路', '华南'),
('成都食品配送', '周经理', '13900139004', '成都市武侯区XX路', '西南');

-- 出库记录
INSERT INTO shipments (shipment_no, product_batch_id, distributor_id, quantity, shipment_date) VALUES
('SH20240111001', 1, 1, 200, '2024-01-11'),
('SH20240111002', 1, 2, 280, '2024-01-11'),
('SH20240112001', 2, 3, 150, '2024-01-12'),
('SH20240112002', 2, 4, 140, '2024-01-12'),
('SH20240113001', 3, 1, 100, '2024-01-13'),
('SH20240113002', 3, 2, 95, '2024-01-13'),
('SH20240114001', 4, 3, 200, '2024-01-14'),
('SH20240114002', 4, 4, 190, '2024-01-14'),
('SH20240115001', 5, 1, 300, '2024-01-15'),
('SH20240115002', 5, 2, 280, '2024-01-15');
