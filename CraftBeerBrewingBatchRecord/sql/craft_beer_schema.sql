-- 精酿啤酒酿造批次记录系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS craft_beer_batch DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE craft_beer_batch;

-- 1. 原料类型表
DROP TABLE IF EXISTS material_type;
CREATE TABLE material_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    type_code VARCHAR(50) NOT NULL UNIQUE COMMENT '原料类型编码',
    type_name VARCHAR(100) NOT NULL COMMENT '原料类型名称',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料类型表';

-- 2. 原料表
DROP TABLE IF EXISTS material;
CREATE TABLE material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    material_type_id BIGINT NOT NULL COMMENT '原料类型ID',
    material_name VARCHAR(200) NOT NULL COMMENT '原料名称',
    material_code VARCHAR(100) UNIQUE COMMENT '原料编码',
    supplier VARCHAR(200) COMMENT '供应商',
    origin VARCHAR(200) COMMENT '产地',
    specification VARCHAR(500) COMMENT '规格参数（JSON格式存储矿物质成分等）',
    description VARCHAR(1000) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_material_type (material_type_id),
    FOREIGN KEY (material_type_id) REFERENCES material_type(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='原料表';

-- 3. 配方表（版本化）
DROP TABLE IF EXISTS recipe;
CREATE TABLE recipe (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    recipe_name VARCHAR(200) NOT NULL COMMENT '配方名称',
    recipe_code VARCHAR(100) NOT NULL COMMENT '配方编码',
    version INT NOT NULL DEFAULT 1 COMMENT '版本号',
    parent_recipe_id BIGINT COMMENT '父配方ID（基于哪个版本修改）',
    beer_style VARCHAR(100) COMMENT '啤酒风格',
    target_ibu DECIMAL(10,2) COMMENT '目标IBU苦度',
    target_abv DECIMAL(10,2) COMMENT '目标酒精度ABV',
    target_og DECIMAL(10,4) COMMENT '目标原始比重',
    target_fg DECIMAL(10,4) COMMENT '目标最终比重',
    batch_size_liters DECIMAL(10,2) COMMENT '批次容量（升）',
    description VARCHAR(2000) COMMENT '配方描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_recipe_code_version (recipe_code, version),
    INDEX idx_recipe_name (recipe_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配方表';

-- 4. 配方原料明细表
DROP TABLE IF EXISTS recipe_material;
CREATE TABLE recipe_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    recipe_id BIGINT NOT NULL COMMENT '配方ID',
    material_id BIGINT NOT NULL COMMENT '原料ID',
    material_type_id BIGINT NOT NULL COMMENT '原料类型ID',
    usage_amount DECIMAL(10,3) NOT NULL COMMENT '用量',
    usage_unit VARCHAR(20) NOT NULL COMMENT '单位（kg, g, L等）',
    add_timing VARCHAR(100) COMMENT '投放时机（如：煮沸60分钟、煮沸15分钟、干投等）',
    add_order INT COMMENT '添加顺序',
    notes VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES material(id),
    FOREIGN KEY (material_type_id) REFERENCES material_type(id),
    INDEX idx_recipe_id (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配方原料明细表';

-- 5. 工序类型表
DROP TABLE IF EXISTS process_type;
CREATE TABLE process_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    process_code VARCHAR(50) NOT NULL UNIQUE COMMENT '工序编码',
    process_name VARCHAR(100) NOT NULL COMMENT '工序名称',
    process_order INT NOT NULL COMMENT '工序顺序',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工序类型表';

-- 6. 批次表
DROP TABLE IF EXISTS brewing_batch;
CREATE TABLE brewing_batch (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_no VARCHAR(100) NOT NULL UNIQUE COMMENT '批次号',
    recipe_id BIGINT NOT NULL COMMENT '配方ID',
    batch_name VARCHAR(200) COMMENT '批次名称',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    brewer VARCHAR(100) COMMENT '酿酒师',
    actual_batch_size DECIMAL(10,2) COMMENT '实际批次容量（升）',
    batch_status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS' COMMENT '批次状态（IN_PROGRESS, COMPLETED, FAILED）',
    quality_status VARCHAR(50) COMMENT '质量状态（PASSED, FAILED, PENDING）',
    notes VARCHAR(2000) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (recipe_id) REFERENCES recipe(id),
    INDEX idx_batch_no (batch_no),
    INDEX idx_batch_status (batch_status),
    INDEX idx_quality_status (quality_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批次表';

-- 7. 批次工序记录表
DROP TABLE IF EXISTS batch_process_record;
CREATE TABLE batch_process_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_id BIGINT NOT NULL COMMENT '批次ID',
    process_type_id BIGINT NOT NULL COMMENT '工序类型ID',
    start_time DATETIME COMMENT '工序开始时间',
    end_time DATETIME COMMENT '工序结束时间',
    temperature DECIMAL(10,2) COMMENT '温度（℃）',
    brix DECIMAL(10,2) COMMENT '糖度（Brix）',
    sg DECIMAL(10,4) COMMENT '比重（SG）',
    ph DECIMAL(10,2) COMMENT 'pH值',
    volume DECIMAL(10,2) COMMENT '体积（升）',
    operator VARCHAR(100) COMMENT '操作人员',
    parameters TEXT COMMENT '其他参数（JSON格式）',
    notes VARCHAR(2000) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (batch_id) REFERENCES brewing_batch(id) ON DELETE CASCADE,
    FOREIGN KEY (process_type_id) REFERENCES process_type(id),
    INDEX idx_batch_process (batch_id, process_type_id),
    INDEX idx_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批次工序记录表';

-- 8. 发酵温度曲线表（时序数据）
DROP TABLE IF EXISTS fermentation_temperature;
CREATE TABLE fermentation_temperature (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_id BIGINT NOT NULL COMMENT '批次ID',
    record_time DATETIME NOT NULL COMMENT '记录时间',
    tank_temperature DECIMAL(10,2) NOT NULL COMMENT '罐温（℃）',
    coolant_temperature DECIMAL(10,2) COMMENT '冷媒温度（℃）',
    ambient_temperature DECIMAL(10,2) COMMENT '环境温度（℃）',
    pressure DECIMAL(10,3) COMMENT '罐内压力（bar）',
    sg DECIMAL(10,4) COMMENT '当前比重',
    notes VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (batch_id) REFERENCES brewing_batch(id) ON DELETE CASCADE,
    INDEX idx_batch_time (batch_id, record_time),
    INDEX idx_record_time (record_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='发酵温度曲线表';

-- 9. 品测记录表
DROP TABLE IF EXISTS tasting_record;
CREATE TABLE tasting_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_id BIGINT NOT NULL COMMENT '批次ID',
    tasting_time DATETIME NOT NULL COMMENT '品测时间',
    tasting_panel VARCHAR(500) COMMENT '品测人员',
    appearance_score DECIMAL(5,2) COMMENT '外观评分',
    aroma_score DECIMAL(5,2) COMMENT '香气评分',
    flavor_score DECIMAL(5,2) COMMENT '风味评分',
    mouthfeel_score DECIMAL(5,2) COMMENT '口感评分',
    overall_score DECIMAL(5,2) COMMENT '综合评分',
    final_judgment VARCHAR(50) NOT NULL COMMENT '最终判定（PASSED, FAILED）',
    measured_abv DECIMAL(10,2) COMMENT '实测酒精度',
    measured_ibu DECIMAL(10,2) COMMENT '实测IBU',
    measured_color DECIMAL(10,2) COMMENT '实测色度（SRM）',
    tasting_notes TEXT COMMENT '品测备注',
    defects VARCHAR(1000) COMMENT '缺陷描述',
    improvement_suggestions VARCHAR(2000) COMMENT '改进建议',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (batch_id) REFERENCES brewing_batch(id) ON DELETE CASCADE,
    INDEX idx_batch_id (batch_id),
    INDEX idx_final_judgment (final_judgment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='品测记录表';

-- 10. 批次追溯表（不合格批次追溯）
DROP TABLE IF EXISTS batch_traceability;
CREATE TABLE batch_traceability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    batch_id BIGINT NOT NULL COMMENT '批次ID',
    trace_type VARCHAR(50) NOT NULL COMMENT '追溯类型（MATERIAL, PROCESS, BOTH）',
    trace_result TEXT COMMENT '追溯结果（JSON格式）',
    root_cause VARCHAR(500) COMMENT '根本原因',
    root_cause_category VARCHAR(100) COMMENT '原因分类（配方问题/原料问题/工序问题）',
    affected_materials VARCHAR(1000) COMMENT '受影响的原料ID列表',
    affected_processes VARCHAR(1000) COMMENT '受影响的工序ID列表',
    corrective_actions VARCHAR(2000) COMMENT '纠正措施',
    traced_by VARCHAR(100) COMMENT '追溯人员',
    trace_time DATETIME COMMENT '追溯时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (batch_id) REFERENCES brewing_batch(id) ON DELETE CASCADE,
    INDEX idx_batch_id (batch_id),
    INDEX idx_trace_type (trace_type),
    INDEX idx_root_cause (root_cause_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批次追溯表';

-- ==================== 初始化数据 ====================

-- 原料类型
INSERT INTO material_type (type_code, type_name, description) VALUES
('MALT', '麦芽', '酿造用麦芽，包括基础麦芽、特种麦芽等'),
('HOP', '酒花', '酿造用酒花，包括苦花、香花、复合花等'),
('YEAST', '酵母', '酿造用酵母，包括艾尔酵母、拉格酵母等'),
('WATER', '水', '酿造用水，记录矿物质成分'),
('ADDITIVE', '添加剂', '其他添加剂如澄清剂、调节剂等');

-- 工序类型
INSERT INTO process_type (process_code, process_name, process_order, description) VALUES
('MASHING', '糖化', 1, '将麦芽与热水混合，将淀粉转化为糖'),
('LAUTERING', '过滤', 2, '分离麦汁和麦糟'),
('BOILING', '煮沸', 3, '煮沸麦汁，添加酒花'),
('WHIRLPOOL', '回旋沉淀', 4, '分离热凝固物'),
('COOLING', '冷却', 5, '将麦汁冷却至发酵温度'),
('PITCHING', '接种酵母', 6, '向麦汁中添加酵母'),
('FERMENTATION', '发酵', 7, '酵母将糖转化为酒精和二氧化碳'),
('CONDITIONING', '熟化/冷藏', 8, '低温熟成，改善风味'),
('BOTTLING', '装瓶', 9, '装瓶并添加二发糖');

-- 示例原料数据
INSERT INTO material (material_type_id, material_name, material_code, supplier, origin, specification, description) VALUES
(1, '皮尔森麦芽', 'MALT-PIL-001', '维耶曼', '法国', '{"protein": "10.5%", "extract": "80%", "color": "3.5 EBC", "moisture": "4.5%"}', '基础淡色麦芽，适合酿造拉格和皮尔森'),
(1, '慕尼黑麦芽', 'MALT-MUN-001', '城堡', '比利时', '{"protein": "11.5%", "extract": "78%", "color": "20 EBC", "moisture": "4.0%"}', '提供麦芽香气和深色'),
(2, '西楚酒花', 'HOP-CIT-001', 'YCH Hops', '美国', '{"alpha_acid": "12.0%", "beta_acid": "4.0%", "oil": "2.5 ml/100g"}', '浓郁的柑橘和热带水果香气'),
(2, '马格努门酒花', 'HOP-MAG-001', '雅基玛', '德国', '{"alpha_acid": "13.0%", "beta_acid": "6.0%", "oil": "1.8 ml/100g"}', '高α酸苦花，苦味干净'),
(3, 'US-05艾尔酵母', 'YEAST-US05-001', '拉曼', '美国', '{"strain": "Saccharomyces cerevisiae", "attenuation": "78-82%", "flocculation": "Medium", "temperature_range": "18-24℃"}', '经典美式艾尔酵母，发酵干净'),
(3, 'W34/70拉格酵母', 'YEAST-W3470-001', '拉曼', '德国', '{"strain": "Saccharomyces pastorianus", "attenuation": "80-85%", "flocculation": "High", "temperature_range": "10-15℃"}', '经典拉格酵母'),
(4, '酿造用水', 'WATER-001', '本地水厂', '本地', '{"calcium": "50 ppm", "magnesium": "10 ppm", "sodium": "20 ppm", "sulfate": "80 ppm", "chloride": "30 ppm", "bicarbonate": "150 ppm", "ph": "7.2"}', '经过处理的酿造用水');

-- 示例配方
INSERT INTO recipe (recipe_name, recipe_code, version, beer_style, target_ibu, target_abv, target_og, target_fg, batch_size_liters, description) VALUES
('经典西海岸IPA', 'REC-IPA-001', 1, 'American IPA', 65.0, 6.5, 1.065, 1.012, 50.0, '经典美式西海岸IPA，突出酒花香气和苦味'),
('经典西海岸IPA', 'REC-IPA-001', 2, 'American IPA', 70.0, 6.8, 1.068, 1.010, 50.0, '调整酒花用量，增强苦味和香气');

-- 配方原料明细 - 版本1
INSERT INTO recipe_material (recipe_id, material_id, material_type_id, usage_amount, usage_unit, add_timing, add_order) VALUES
(1, 1, 1, 9.5, 'kg', '糖化开始', 1),
(1, 2, 1, 1.0, 'kg', '糖化开始', 2),
(1, 5, 3, 100, 'g', '接种时', 5),
(1, 7, 4, 50, 'L', '糖化用水', 6),
(1, 4, 2, 30, 'g', '煮沸60分钟', 3),
(1, 3, 2, 50, 'g', '煮沸15分钟', 4);

-- 配方原料明细 - 版本2
INSERT INTO recipe_material (recipe_id, material_id, material_type_id, usage_amount, usage_unit, add_timing, add_order) VALUES
(2, 1, 1, 10.0, 'kg', '糖化开始', 1),
(2, 2, 1, 1.0, 'kg', '糖化开始', 2),
(2, 5, 3, 100, 'g', '接种时', 6),
(2, 7, 4, 50, 'L', '糖化用水', 7),
(2, 4, 2, 35, 'g', '煮沸60分钟', 3),
(2, 3, 2, 60, 'g', '煮沸15分钟', 4),
(2, 3, 2, 40, 'g', '关火时', 5);

-- 示例批次
INSERT INTO brewing_batch (batch_no, recipe_id, batch_name, start_time, brewer, actual_batch_size, batch_status, quality_status, notes) VALUES
('BATCH-2024-001', 1, '第一批次西海岸IPA', '2024-01-15 09:00:00', '张酿酒师', 48.5, 'COMPLETED', 'PASSED', '首批次酿造，整体顺利'),
('BATCH-2024-002', 2, '第二批次西海岸IPA', '2024-02-20 10:00:00', '李酿酒师', 49.0, 'COMPLETED', 'FAILED', '发酵温度波动较大，成品有酵母味');

-- 工序记录 - 批次1
INSERT INTO batch_process_record (batch_id, process_type_id, start_time, end_time, temperature, brix, sg, ph, volume, operator, notes) VALUES
(1, 1, '2024-01-15 09:00:00', '2024-01-15 11:00:00', 67.0, 16.5, 1.066, 5.4, 50.0, '张酿酒师', '糖化温度稳定67℃，90分钟'),
(1, 2, '2024-01-15 11:10:00', '2024-01-15 12:00:00', 76.0, NULL, NULL, NULL, 48.5, '张酿酒师', '过滤顺利，麦汁清亮'),
(1, 3, '2024-01-15 12:15:00', '2024-01-15 13:15:00', 100.0, NULL, NULL, NULL, 48.5, '张酿酒师', '煮沸60分钟，按时投酒花'),
(1, 4, '2024-01-15 13:20:00', '2024-01-15 13:40:00', 98.0, NULL, NULL, NULL, NULL, '张酿酒师', '回旋沉淀20分钟'),
(1, 5, '2024-01-15 13:45:00', '2024-01-15 14:15:00', 20.0, 16.2, 1.065, 5.3, 48.5, '张酿酒师', '冷却至20℃，充氧良好'),
(1, 6, '2024-01-15 14:20:00', '2024-01-15 14:30:00', 20.0, NULL, NULL, NULL, NULL, '张酿酒师', '接种US-05酵母100g'),
(1, 7, '2024-01-15 14:30:00', '2024-01-22 14:30:00', 20.0, 4.2, 1.012, 4.2, 47.5, '张酿酒师', '发酵7天，温度稳定'),
(1, 8, '2024-01-22 14:30:00', '2024-01-29 14:30:00', 4.0, NULL, NULL, NULL, 47.0, '张酿酒师', '低温熟化7天'),
(1, 9, '2024-01-29 15:00:00', '2024-01-29 17:00:00', 4.0, NULL, NULL, NULL, 46.5, '张酿酒师', '装瓶330ml共140瓶');

-- 工序记录 - 批次2
INSERT INTO batch_process_record (batch_id, process_type_id, start_time, end_time, temperature, brix, sg, ph, volume, operator, notes) VALUES
(2, 1, '2024-02-20 10:00:00', '2024-02-20 12:00:00', 67.0, 17.0, 1.069, 5.4, 50.0, '李酿酒师', '糖化正常'),
(2, 2, '2024-02-20 12:10:00', '2024-02-20 13:00:00', 76.0, NULL, NULL, NULL, 49.0, '李酿酒师', '过滤正常'),
(2, 3, '2024-02-20 13:15:00', '2024-02-20 14:15:00', 100.0, NULL, NULL, NULL, 49.0, '李酿酒师', '煮沸正常'),
(2, 4, '2024-02-20 14:20:00', '2024-02-20 14:40:00', 98.0, NULL, NULL, NULL, NULL, '李酿酒师', '回旋沉淀正常'),
(2, 5, '2024-02-20 14:45:00', '2024-02-20 15:15:00', 20.0, 16.8, 1.068, 5.3, 49.0, '李酿酒师', '冷却正常'),
(2, 6, '2024-02-20 15:20:00', '2024-02-20 15:30:00', 20.0, NULL, NULL, NULL, NULL, '李酿酒师', '接种酵母'),
(2, 7, '2024-02-20 15:30:00', '2024-02-27 15:30:00', NULL, 4.5, 1.015, 4.1, 47.5, '李酿酒师', '发酵温度波动较大，最高到25℃'),
(2, 8, '2024-02-27 15:30:00', '2024-03-05 15:30:00', 4.0, NULL, NULL, NULL, 47.0, '李酿酒师', '低温熟化'),
(2, 9, '2024-03-05 16:00:00', '2024-03-05 18:00:00', 4.0, NULL, NULL, NULL, 46.0, '李酿酒师', '装瓶');

-- 发酵温度曲线 - 批次1（平稳）
INSERT INTO fermentation_temperature (batch_id, record_time, tank_temperature, coolant_temperature, ambient_temperature, pressure, sg) VALUES
(1, '2024-01-15 18:00:00', 20.0, 18.0, 22.0, 0.0, 1.065),
(1, '2024-01-16 00:00:00', 20.2, 17.8, 21.5, 0.02, 1.060),
(1, '2024-01-16 06:00:00', 20.1, 18.0, 21.0, 0.05, 1.052),
(1, '2024-01-16 12:00:00', 20.0, 18.0, 22.0, 0.08, 1.042),
(1, '2024-01-16 18:00:00', 20.1, 17.9, 22.0, 0.10, 1.034),
(1, '2024-01-17 00:00:00', 20.0, 18.0, 21.5, 0.12, 1.028),
(1, '2024-01-17 06:00:00', 19.9, 18.0, 21.0, 0.12, 1.023),
(1, '2024-01-17 12:00:00', 20.0, 18.0, 22.0, 0.10, 1.020),
(1, '2024-01-17 18:00:00', 19.8, 18.0, 22.0, 0.08, 1.017),
(1, '2024-01-18 00:00:00', 19.9, 18.0, 21.5, 0.05, 1.015),
(1, '2024-01-18 06:00:00', 20.0, 18.0, 21.0, 0.03, 1.014),
(1, '2024-01-18 12:00:00', 20.0, 18.0, 22.0, 0.02, 1.013),
(1, '2024-01-18 18:00:00', 20.0, 18.0, 22.0, 0.01, 1.012),
(1, '2024-01-19 00:00:00', 20.0, 18.0, 21.5, 0.01, 1.012),
(1, '2024-01-19 06:00:00', 19.9, 18.0, 21.0, 0.00, 1.012);

-- 发酵温度曲线 - 批次2（有波动）
INSERT INTO fermentation_temperature (batch_id, record_time, tank_temperature, coolant_temperature, ambient_temperature, pressure, sg) VALUES
(2, '2024-02-20 18:00:00', 20.0, 18.0, 22.0, 0.0, 1.068),
(2, '2024-02-21 00:00:00', 20.5, 17.8, 22.5, 0.03, 1.062),
(2, '2024-02-21 06:00:00', 21.5, 18.0, 23.5, 0.06, 1.054),
(2, '2024-02-21 12:00:00', 23.0, 18.0, 25.0, 0.10, 1.044),
(2, '2024-02-21 18:00:00', 24.5, 17.5, 26.0, 0.15, 1.036),
(2, '2024-02-22 00:00:00', 25.0, 15.0, 25.5, 0.18, 1.030),
(2, '2024-02-22 06:00:00', 23.5, 16.0, 24.0, 0.18, 1.025),
(2, '2024-02-22 12:00:00', 22.0, 17.0, 23.0, 0.15, 1.022),
(2, '2024-02-22 18:00:00', 21.0, 17.5, 22.5, 0.12, 1.020),
(2, '2024-02-23 00:00:00', 20.5, 18.0, 22.0, 0.08, 1.018),
(2, '2024-02-23 06:00:00', 20.2, 18.0, 21.5, 0.05, 1.017),
(2, '2024-02-23 12:00:00', 20.0, 18.0, 22.0, 0.03, 1.016),
(2, '2024-02-23 18:00:00', 20.0, 18.0, 22.0, 0.02, 1.015),
(2, '2024-02-24 00:00:00', 19.9, 18.0, 21.5, 0.01, 1.015),
(2, '2024-02-24 06:00:00', 20.0, 18.0, 21.0, 0.01, 1.015);

-- 品测记录
INSERT INTO tasting_record (batch_id, tasting_time, tasting_panel, appearance_score, aroma_score, flavor_score, mouthfeel_score, overall_score, final_judgment, measured_abv, measured_ibu, measured_color, tasting_notes, defects, improvement_suggestions) VALUES
(1, '2024-02-15 14:00:00', '张酿酒师, 王品酒师, 刘助理', 8.5, 9.0, 8.8, 8.5, 8.7, 'PASSED', 6.4, 63.5, 12.5, '外观清亮金黄，泡沫丰富持久。香气突出柑橘和热带水果，伴有明显的松针香气。入口苦味适中，层次感好，回味干爽。', NULL, '可适当增加干投酒花量增强香气'),
(2, '2024-03-20 14:00:00', '张酿酒师, 王品酒师, 李酿酒师', 7.5, 6.5, 6.0, 7.0, 6.7, 'FAILED', 6.9, 72.0, 13.0, '外观尚可，但香气中有明显的酵母自溶味和硫化物气味，风味不纯，有酯类过量的香蕉味。', '发酵温度过高导致酵母自溶和不良酯类生成，有明显的酵母味和硫化物气味', '严格控制发酵温度，建议使用温度控制更精确的发酵罐。冷却系统需要检查维护。');

-- 批次追溯记录
INSERT INTO batch_traceability (batch_id, trace_type, trace_result, root_cause, root_cause_category, affected_materials, affected_processes, corrective_actions, traced_by, trace_time) VALUES
(2, 'BOTH', 
'{"material_check": {"yeast": {"id": 5, "name": "US-05艾尔酵母", "status": "normal", "expiry": "2024-06-01"}, "malt": {"status": "normal"}, "hop": {"status": "normal"}}, "process_check": {"fermentation": {"temperature_fluctuation": "20-25℃", "max_temp": "25.0℃", "duration": "~24 hours", "cooling_system": "检查发现冷却系统第3天故障，温度失控"}, "mashing": {"status": "normal"}, "boiling": {"status": "normal"}}}', 
'发酵过程中冷却系统故障，导致温度在24小时内从20℃升至25℃，造成酵母自溶和不良风味物质生成', 
'工序问题', 
'5', 
'7', 
'1. 立即检修发酵罐冷却系统，更换故障的温度传感器和制冷机组；2. 增加温度监控报警阈值，超过22℃立即报警；3. 对所有发酵罐进行预防性维护；4. 制定SOP，每2小时人工检查一次发酵温度并记录', 
'张酿酒师', 
'2024-03-21 10:00:00');
