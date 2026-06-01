-- 茶叶仓储与品鉴管理系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS tea_storage_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tea_storage_system;

-- 1. 茶品档案表
CREATE TABLE IF NOT EXISTS tea_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL COMMENT '茶品名称',
    origin VARCHAR(200) NOT NULL COMMENT '产区/厂家（如勐海茶厂7542）',
    production_year INT NOT NULL COMMENT '生产年份',
    material_type ENUM('pure', 'blend') NOT NULL DEFAULT 'pure' COMMENT '原料属性：pure纯料，blend拼配',
    pressing_date DATE COMMENT '压制日期',
    shape ENUM('cake', 'brick', 'tuo', 'loose') NOT NULL DEFAULT 'cake' COMMENT '形态：cake饼茶，brick砖茶，tuo沱茶，loose散茶',
    specification DECIMAL(10,2) NOT NULL DEFAULT 357.00 COMMENT '规格（克）',
    mountain VARCHAR(100) COMMENT '山头',
    fragrance_type VARCHAR(100) COMMENT '香型',
    description TEXT COMMENT '备注描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_production_year (production_year),
    INDEX idx_origin (origin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='茶品档案表';

-- 2. 仓位表
CREATE TABLE IF NOT EXISTS storage_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    warehouse_no VARCHAR(50) NOT NULL COMMENT '仓号',
    cabinet_no VARCHAR(50) NOT NULL COMMENT '柜号',
    shelf_no VARCHAR(50) NOT NULL COMMENT '层号',
    location_code VARCHAR(150) NOT NULL UNIQUE COMMENT '仓位坐标：仓号-柜号-层号',
    mountain VARCHAR(100) COMMENT '适合存放的山头',
    fragrance_type VARCHAR(100) COMMENT '适合存放的香型',
    max_capacity INT NOT NULL DEFAULT 100 COMMENT '最大容量（片/份）',
    current_quantity INT NOT NULL DEFAULT 0 COMMENT '当前存量',
    status ENUM('active', 'maintenance', 'disabled') NOT NULL DEFAULT 'active' COMMENT '状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_location (warehouse_no, cabinet_no, shelf_no),
    INDEX idx_location_code (location_code),
    INDEX idx_mountain (mountain),
    INDEX idx_fragrance (fragrance_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓位表';

-- 3. 库存表（茶品与仓位关联）
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tea_product_id INT NOT NULL COMMENT '茶品ID',
    location_id INT NOT NULL COMMENT '仓位ID',
    quantity INT NOT NULL DEFAULT 1 COMMENT '存放数量',
    storage_date DATE NOT NULL COMMENT '入仓日期',
    batch_no VARCHAR(100) COMMENT '批次号',
    notes TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tea_product_id) REFERENCES tea_products(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES storage_locations(id) ON DELETE CASCADE,
    INDEX idx_tea_product (tea_product_id),
    INDEX idx_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存表';

-- 4. 环境监控表
CREATE TABLE IF NOT EXISTS environment_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL COMMENT '仓位ID',
    temperature DECIMAL(5,2) NOT NULL COMMENT '温度（摄氏度）',
    humidity DECIMAL(5,2) NOT NULL COMMENT '湿度（%）',
    record_date DATE NOT NULL COMMENT '记录日期',
    record_time TIME NOT NULL COMMENT '记录时间',
    is_alert TINYINT(1) DEFAULT 0 COMMENT '是否触发警报：0否，1是',
    alert_type VARCHAR(50) COMMENT '警报类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES storage_locations(id) ON DELETE CASCADE,
    INDEX idx_location_date (location_id, record_date),
    INDEX idx_record_date (record_date),
    INDEX idx_is_alert (is_alert)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='环境监控记录表';

-- 5. 品鉴笔记主表
CREATE TABLE IF NOT EXISTS tasting_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tea_product_id INT NOT NULL COMMENT '茶品ID',
    tasting_date DATE NOT NULL COMMENT '品鉴日期',
    tea_weight DECIMAL(5,2) NOT NULL COMMENT '撬茶克重',
    water_type ENUM('pure', 'mineral') NOT NULL DEFAULT 'pure' COMMENT '用水类型：pure纯净水，mineral矿泉水',
    brew_count INT NOT NULL DEFAULT 1 COMMENT '冲泡次数',
    overall_score DECIMAL(4,2) COMMENT '总体评分',
    notes TEXT COMMENT '总体评价',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tea_product_id) REFERENCES tea_products(id) ON DELETE CASCADE,
    INDEX idx_tea_product (tea_product_id),
    INDEX idx_tasting_date (tasting_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='品鉴笔记主表';

-- 6. 品鉴详情表（每一泡的记录）
CREATE TABLE IF NOT EXISTS tasting_infusions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tasting_note_id INT NOT NULL COMMENT '品鉴笔记ID',
    infusion_number INT NOT NULL COMMENT '第几泡',
    soup_color VARCHAR(100) COMMENT '汤色',
    aroma VARCHAR(500) COMMENT '香气',
    taste VARCHAR(500) COMMENT '滋味',
    score DECIMAL(4,2) NOT NULL COMMENT '评分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tasting_note_id) REFERENCES tasting_notes(id) ON DELETE CASCADE,
    INDEX idx_tasting_note (tasting_note_id),
    INDEX idx_infusion_number (infusion_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='品鉴详情表';

-- 7. 预警表
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL COMMENT '仓位ID',
    alert_type VARCHAR(50) NOT NULL COMMENT '警报类型：humidity_high湿度过高',
    alert_level ENUM('warning', 'danger') NOT NULL DEFAULT 'warning' COMMENT '警报级别',
    message VARCHAR(500) NOT NULL COMMENT '警报内容',
    value DECIMAL(8,2) COMMENT '触发值',
    threshold DECIMAL(8,2) COMMENT '阈值',
    resolved TINYINT(1) DEFAULT 0 COMMENT '是否已处理：0否，1是',
    resolved_at TIMESTAMP NULL COMMENT '处理时间',
    resolved_note TEXT COMMENT '处理备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES storage_locations(id) ON DELETE CASCADE,
    INDEX idx_location (location_id),
    INDEX idx_resolved (resolved),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预警表';

-- 插入一些测试数据

-- 插入测试仓位
INSERT INTO storage_locations (warehouse_no, cabinet_no, shelf_no, location_code, mountain, fragrance_type, max_capacity) VALUES
('A', '01', '01', 'A-01-01', '布朗山', '蜜香', 100),
('A', '01', '02', 'A-01-02', '布朗山', '蜜香', 100),
('A', '02', '01', 'A-02-01', '易武山', '果香', 100),
('A', '02', '02', 'A-02-02', '易武山', '果香', 100),
('B', '01', '01', 'B-01-01', '班章山', '花香', 100),
('B', '01', '02', 'B-01-02', '班章山', '花香', 100);

-- 插入测试茶品
INSERT INTO tea_products (product_name, origin, production_year, material_type, pressing_date, shape, specification, mountain, fragrance_type, description) VALUES
('7542青饼', '勐海茶厂', 2015, 'blend', '2015-03-15', 'cake', 357.00, '布朗山', '蜜香', '勐海茶厂经典7542配方，拼配茶'),
('易武古树', '易武茶区', 2018, 'pure', '2018-04-20', 'cake', 357.00, '易武山', '果香', '易武古树纯料，蜜韵回甘'),
('班章王', '班章茶区', 2020, 'pure', '2020-05-10', 'cake', 357.00, '班章山', '花香', '老班章古树，霸气回甘'),
('景迈山砖', '景迈茶区', 2016, 'pure', '2016-06-01', 'brick', 250.00, '景迈山', '兰香', '景迈山古树砖茶，兰香明显'),
('下关沱茶', '下关茶厂', 2019, 'blend', '2019-08-15', 'tuo', 100.00, '无量山', '烟香', '下关经典甲级沱茶');

-- 插入测试库存
INSERT INTO inventory (tea_product_id, location_id, quantity, storage_date, batch_no) VALUES
(1, 1, 50, '2015-04-01', 'B20150401'),
(2, 3, 30, '2018-05-01', 'B20180501'),
(3, 5, 20, '2020-06-01', 'B20200601'),
(4, 4, 40, '2016-07-01', 'B20160701'),
(5, 2, 100, '2019-09-01', 'B20190901');

-- 插入测试环境数据（最近30天）
INSERT INTO environment_records (location_id, temperature, humidity, record_date, record_time, is_alert, alert_type) VALUES
(1, 23.5, 65.2, CURDATE() - INTERVAL 29 DAY, '12:00:00', 0, NULL),
(1, 24.0, 68.5, CURDATE() - INTERVAL 28 DAY, '12:00:00', 0, NULL),
(1, 23.8, 70.2, CURDATE() - INTERVAL 27 DAY, '12:00:00', 0, NULL),
(1, 24.2, 72.1, CURDATE() - INTERVAL 26 DAY, '12:00:00', 0, NULL),
(1, 23.9, 76.0, CURDATE() - INTERVAL 25 DAY, '12:00:00', 1, 'humidity_high'),
(1, 24.1, 74.5, CURDATE() - INTERVAL 24 DAY, '12:00:00', 0, NULL),
(1, 23.7, 69.8, CURDATE() - INTERVAL 23 DAY, '12:00:00', 0, NULL),
(1, 24.3, 67.3, CURDATE() - INTERVAL 22 DAY, '12:00:00', 0, NULL),
(1, 23.6, 64.8, CURDATE() - INTERVAL 21 DAY, '12:00:00', 0, NULL),
(1, 24.0, 66.5, CURDATE() - INTERVAL 20 DAY, '12:00:00', 0, NULL),
(2, 22.8, 63.5, CURDATE() - INTERVAL 29 DAY, '12:00:00', 0, NULL),
(2, 23.2, 65.8, CURDATE() - INTERVAL 28 DAY, '12:00:00', 0, NULL),
(2, 23.0, 67.2, CURDATE() - INTERVAL 27 DAY, '12:00:00', 0, NULL),
(3, 24.1, 64.3, CURDATE() - INTERVAL 29 DAY, '12:00:00', 0, NULL),
(3, 24.5, 66.7, CURDATE() - INTERVAL 28 DAY, '12:00:00', 0, NULL),
(5, 25.0, 78.0, CURDATE() - INTERVAL 10 DAY, '12:00:00', 1, 'humidity_high'),
(5, 24.8, 76.5, CURDATE() - INTERVAL 9 DAY, '12:00:00', 1, 'humidity_high'),
(5, 24.5, 74.2, CURDATE() - INTERVAL 8 DAY, '12:00:00', 0, NULL);

-- 插入测试品鉴笔记
INSERT INTO tasting_notes (tea_product_id, tasting_date, tea_weight, water_type, brew_count, overall_score, notes) VALUES
(1, '2020-05-15', 7.5, 'pure', 8, 82.50, '五年陈化，蜜香初显，苦涩已化，回甘尚可'),
(1, '2022-06-20', 7.5, 'pure', 8, 86.00, '七年陈化，蜜香浓郁，汤色橙黄，回甘明显'),
(1, '2024-04-10', 7.5, 'pure', 8, 89.50, '九年陈化，药香初显，汤色红浓，醇厚顺滑'),
(1, '2025-05-01', 7.5, 'pure', 8, 91.00, '十年陈化，樟香明显，入口即化，陈韵悠长'),
(2, '2021-03-10', 8.0, 'mineral', 10, 88.00, '三年陈化，果香馥郁，易武柔甜特点显现'),
(2, '2023-04-15', 8.0, 'mineral', 10, 91.50, '五年陈化，蜜韵十足，回甘持久，水路细腻'),
(2, '2025-03-20', 8.0, 'mineral', 10, 93.50, '七年陈化，陈香浓郁，汤感厚实，喉韵明显'),
(3, '2022-08-10', 8.5, 'pure', 7, 90.00, '两年陈化，班章霸气依旧，苦涩稍重但化得快'),
(3, '2024-09-01', 8.5, 'pure', 7, 93.00, '四年陈化，苦涩已退，回甘迅猛，层次丰富');

-- 插入测试品鉴详情
INSERT INTO tasting_infusions (tasting_note_id, infusion_number, soup_color, aroma, taste, score) VALUES
-- 2020年品鉴记录
(1, 1, '浅黄明亮', '青香明显', '苦涩稍重，微甜', 78.00),
(1, 2, '浅黄明亮', '青香带蜜', '苦涩化得快，回甘初显', 80.00),
(1, 3, '黄亮', '蜜香初显', '苦弱涩显，回甘明显', 83.00),
(1, 4, '黄亮', '蜜香', '微苦微涩，回甘持久', 85.00),
(1, 5, '黄亮', '蜜香带糖', '甜感显现，回甘明显', 86.00),
-- 2022年品鉴记录
(2, 1, '金黄透亮', '蜜香高扬', '微苦，甜润', 83.00),
(2, 2, '金黄透亮', '蜜香浓郁', '苦感轻，涩感柔', 85.00),
(2, 3, '橙黄', '蜜香带糖', '醇和甘甜，层次显', 88.00),
(2, 4, '橙黄', '蜜香', '醇厚顺滑，回甘久', 89.00),
(2, 5, '橙黄明亮', '糖香', '甜醇温润，水路细', 90.00),
-- 2024年品鉴记录
(3, 1, '橙红明亮', '药香初显', '微苦，醇厚', 88.00),
(3, 2, '橙红明亮', '药香蜜香', '醇和顺滑，回甘显', 90.00),
(3, 3, '红浓', '药香浓郁', '厚重饱满，层次丰富', 91.00),
(3, 4, '红浓明亮', '樟香初显', '醇厚绵柔，回甘持久', 92.00),
(3, 5, '红浓', '陈香', '甜醇温润，喉韵明显', 92.00),
-- 2025年品鉴记录
(4, 1, '红浓明亮', '樟香明显', '入口即化，醇厚', 90.00),
(4, 2, '红浓透亮', '樟香陈香', '醇厚饱满，层次丰富', 91.00),
(4, 3, '红浓', '陈香馥郁', '厚重绵柔，回甘迅猛', 92.00),
(4, 4, '红浓', '樟香药香', '顺滑甜醇，陈韵十足', 93.00),
(4, 5, '红浓明亮', '陈香', '温润甘甜，喉韵悠长', 93.00);

-- 插入测试预警
INSERT INTO alerts (location_id, alert_type, alert_level, message, value, threshold) VALUES
(1, 'humidity_high', 'danger', 'A-01-01仓位湿度过高，已达76.0%', 76.0, 75.0),
(5, 'humidity_high', 'danger', 'B-01-01仓位湿度过高，已达78.0%', 78.0, 75.0),
(5, 'humidity_high', 'warning', 'B-01-01仓位湿度过高，已达76.5%', 76.5, 75.0);
