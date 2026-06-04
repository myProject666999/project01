-- =============================================
-- 中药材种植加工溯源系统 - 数据库设计
-- Database: tcm_traceability
-- =============================================

DROP DATABASE IF EXISTS tcm_traceability;
CREATE DATABASE tcm_traceability DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tcm_traceability;

-- =============================================
-- 1. 操作人员表
-- =============================================
CREATE TABLE operators (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    phone VARCHAR(20) COMMENT '联系电话',
    role VARCHAR(20) NOT NULL COMMENT '角色：planter/processor/manager',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作人员表';

-- =============================================
-- 2. 农药表（含安全间隔期）
-- =============================================
CREATE TABLE pesticides (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '农药名称',
    registration_no VARCHAR(50) COMMENT '农药登记证号',
    manufacturer VARCHAR(100) COMMENT '生产厂家',
    safe_interval_days INT NOT NULL COMMENT '安全间隔期（天）',
    usage_method VARCHAR(200) COMMENT '使用方法',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农药表';

-- =============================================
-- 3. 肥料表
-- =============================================
CREATE TABLE fertilizers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '肥料名称',
    type VARCHAR(50) COMMENT '肥料类型：有机肥/复合肥/尿素等',
    manufacturer VARCHAR(100) COMMENT '生产厂家',
    nutrient_content VARCHAR(100) COMMENT '养分含量',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='肥料表';

-- =============================================
-- 4. 中药材品种表
-- =============================================
CREATE TABLE herb_varieties (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL COMMENT '品种编码',
    name VARCHAR(100) NOT NULL COMMENT '品种名称',
    alias VARCHAR(100) COMMENT '别名',
    scientific_name VARCHAR(100) COMMENT '学名',
    origin VARCHAR(100) COMMENT '道地产区',
    growth_cycle_days INT COMMENT '生长周期（天）',
    description TEXT COMMENT '品种描述',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='中药材品种表';

-- =============================================
-- 5. 地块档案表
-- =============================================
CREATE TABLE plots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    plot_code VARCHAR(32) UNIQUE NOT NULL COMMENT '地块编号',
    name VARCHAR(100) NOT NULL COMMENT '地块名称',
    province VARCHAR(50) COMMENT '省',
    city VARCHAR(50) COMMENT '市',
    district VARCHAR(50) COMMENT '区/县',
    address VARCHAR(200) COMMENT '详细地址',
    longitude DECIMAL(10, 6) NOT NULL COMMENT '经度',
    latitude DECIMAL(10, 6) NOT NULL COMMENT '纬度',
    altitude DECIMAL(8, 2) COMMENT '海拔（米）',
    soil_type VARCHAR(50) COMMENT '土壤类型：黑土/黄土/红壤/砂质土等',
    soil_ph DECIMAL(4, 2) COMMENT '土壤pH值',
    area DECIMAL(8, 2) COMMENT '面积（亩）',
    seedling_source VARCHAR(200) NOT NULL COMMENT '种苗来源',
    variety_id BIGINT NOT NULL COMMENT '种植品种ID',
    planting_date DATE COMMENT '种植日期',
    expected_harvest_date DATE COMMENT '预计采收日期',
    operator_id BIGINT COMMENT '负责人ID',
    status TINYINT DEFAULT 1 COMMENT '状态：1-种植中 2-已采收 0-废弃',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (variety_id) REFERENCES herb_varieties(id),
    FOREIGN KEY (operator_id) REFERENCES operators(id),
    INDEX idx_plot_code (plot_code),
    INDEX idx_variety (variety_id),
    INDEX idx_status (status),
    INDEX idx_location (province, city),
    INDEX idx_coordinates (longitude, latitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地块档案表';

-- =============================================
-- 6. 农事操作类型表
-- =============================================
CREATE TABLE farming_operation_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL COMMENT '操作编码',
    name VARCHAR(50) NOT NULL COMMENT '操作名称：除草/施肥/打药/浇水/修剪等',
    category VARCHAR(20) NOT NULL COMMENT '分类：weeding/fertilizing/pesticide/watering/pruning/other',
    need_record_detail TINYINT DEFAULT 0 COMMENT '是否需要记录详情：1-是 0-否',
    description VARCHAR(200) COMMENT '描述',
    sort_order INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农事操作类型表';

-- =============================================
-- 7. 农事记录表
-- =============================================
CREATE TABLE farming_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    record_no VARCHAR(32) UNIQUE NOT NULL COMMENT '记录编号',
    plot_id BIGINT NOT NULL COMMENT '地块ID',
    operation_type_id BIGINT NOT NULL COMMENT '操作类型ID',
    operation_date DATE NOT NULL COMMENT '操作日期',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    fertilizer_id BIGINT COMMENT '肥料ID（施肥时）',
    fertilizer_quantity DECIMAL(10, 2) COMMENT '肥料用量（kg）',
    pesticide_id BIGINT COMMENT '农药ID（打药时）',
    pesticide_quantity DECIMAL(10, 2) COMMENT '农药用量（kg或L）',
    safe_interval_days INT COMMENT '安全间隔期（冗余存储，便于查询）',
    operation_detail TEXT COMMENT '操作详情描述',
    weather_condition VARCHAR(100) COMMENT '天气情况',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plot_id) REFERENCES plots(id),
    FOREIGN KEY (operation_type_id) REFERENCES farming_operation_types(id),
    FOREIGN KEY (operator_id) REFERENCES operators(id),
    FOREIGN KEY (fertilizer_id) REFERENCES fertilizers(id),
    FOREIGN KEY (pesticide_id) REFERENCES pesticides(id),
    INDEX idx_record_no (record_no),
    INDEX idx_plot (plot_id),
    INDEX idx_operation_type (operation_type_id),
    INDEX idx_operation_date (operation_date),
    INDEX idx_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农事记录表';

-- =============================================
-- 8. 采收批次表
-- =============================================
CREATE TABLE harvest_batches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    batch_no VARCHAR(32) UNIQUE NOT NULL COMMENT '批次编号（全局唯一）',
    plot_id BIGINT NOT NULL COMMENT '地块ID',
    variety_id BIGINT NOT NULL COMMENT '品种ID',
    harvest_date DATE NOT NULL COMMENT '采收日期',
    quantity DECIMAL(10, 2) NOT NULL COMMENT '采收重量（kg）',
    quality_level VARCHAR(20) COMMENT '质量等级：特级/一级/二级/三级',
    operator_id BIGINT NOT NULL COMMENT '采收负责人ID',
    harvest_method VARCHAR(100) COMMENT '采收方式',
    weather_condition VARCHAR(100) COMMENT '采收时天气',
    safe_check_passed TINYINT DEFAULT 0 COMMENT '安全检查是否通过：1-是 0-否',
    safe_check_remark TEXT COMMENT '安全检查备注',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待加工 2-加工中 3-已完成 0-作废',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plot_id) REFERENCES plots(id),
    FOREIGN KEY (variety_id) REFERENCES herb_varieties(id),
    FOREIGN KEY (operator_id) REFERENCES operators(id),
    UNIQUE KEY uk_batch_no (batch_no),
    INDEX idx_plot (plot_id),
    INDEX idx_harvest_date (harvest_date),
    INDEX idx_status (status),
    INDEX idx_safe_check (safe_check_passed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='采收批次表';

-- =============================================
-- 9. 加工工序类型表
-- =============================================
CREATE TABLE processing_step_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL COMMENT '工序编码',
    name VARCHAR(50) NOT NULL COMMENT '工序名称：净选/切制/炮制/干燥/包装等',
    category VARCHAR(20) NOT NULL COMMENT '分类：cleaning/cutting/processing/drying/packaging/other',
    need_temperature TINYINT DEFAULT 0 COMMENT '是否需要记录温度：1-是 0-否',
    need_time TINYINT DEFAULT 0 COMMENT '是否需要记录时长：1-是 0-否',
    standard_temperature_min DECIMAL(6, 2) COMMENT '标准温度下限（℃）',
    standard_temperature_max DECIMAL(6, 2) COMMENT '标准温度上限（℃）',
    standard_time_min INT COMMENT '标准时长下限（分钟）',
    standard_time_max INT COMMENT '标准时长上限（分钟）',
    description VARCHAR(200) COMMENT '工序描述',
    sort_order INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='加工工序类型表';

-- =============================================
-- 10. 加工记录表
-- =============================================
CREATE TABLE processing_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    record_no VARCHAR(32) UNIQUE NOT NULL COMMENT '记录编号',
    batch_id BIGINT NOT NULL COMMENT '采收批次ID',
    step_type_id BIGINT NOT NULL COMMENT '工序类型ID',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    duration_minutes INT COMMENT '加工时长（分钟）',
    temperature DECIMAL(6, 2) COMMENT '加工温度（℃）',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    processing_detail TEXT COMMENT '加工详情（如：麸炒、蜜炙、醋煅等）',
    input_quantity DECIMAL(10, 2) COMMENT '投入重量（kg）',
    output_quantity DECIMAL(10, 2) COMMENT '产出重量（kg）',
    quality_check_result VARCHAR(20) COMMENT '质检结果：合格/不合格',
    quality_check_remark TEXT COMMENT '质检备注',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES harvest_batches(id),
    FOREIGN KEY (step_type_id) REFERENCES processing_step_types(id),
    FOREIGN KEY (operator_id) REFERENCES operators(id),
    INDEX idx_record_no (record_no),
    INDEX idx_batch (batch_id),
    INDEX idx_step_type (step_type_id),
    INDEX idx_operator (operator_id),
    INDEX idx_start_time (start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='加工记录表';

-- =============================================
-- 11. 产品表
-- =============================================
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_code VARCHAR(32) UNIQUE NOT NULL COMMENT '产品编号',
    product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
    batch_id BIGINT NOT NULL COMMENT '关联采收批次ID',
    specification VARCHAR(50) COMMENT '规格：如250g/盒、500g/袋',
    package_type VARCHAR(50) COMMENT '包装类型：纸盒/塑料袋/瓶装等',
    net_weight DECIMAL(8, 2) COMMENT '净重（g）',
    production_date DATE COMMENT '生产日期',
    shelf_life_months INT COMMENT '保质期（月）',
    storage_condition VARCHAR(200) COMMENT '储存条件',
    total_quantity INT NOT NULL COMMENT '总数量',
    available_quantity INT DEFAULT 0 COMMENT '可用数量',
    status TINYINT DEFAULT 1 COMMENT '状态：1-在库 2-已出库 0-冻结',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES harvest_batches(id),
    INDEX idx_product_code (product_code),
    INDEX idx_batch (batch_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品表';

-- =============================================
-- 12. 二维码表
-- =============================================
CREATE TABLE qr_codes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    qr_code VARCHAR(64) UNIQUE NOT NULL COMMENT '二维码内容（唯一标识）',
    product_id BIGINT NOT NULL COMMENT '关联产品ID',
    batch_id BIGINT NOT NULL COMMENT '关联批次ID（冗余，便于查询）',
    scan_count INT DEFAULT 0 COMMENT '扫码次数',
    last_scan_at DATETIME COMMENT '最后扫码时间',
    status TINYINT DEFAULT 1 COMMENT '状态：1-有效 0-无效',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (batch_id) REFERENCES harvest_batches(id),
    UNIQUE KEY uk_qr_code (qr_code),
    INDEX idx_product (product_id),
    INDEX idx_batch (batch_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='二维码表';

-- =============================================
-- 13. 出库记录表
-- =============================================
CREATE TABLE outbound_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    outbound_no VARCHAR(32) UNIQUE NOT NULL COMMENT '出库单号',
    product_id BIGINT NOT NULL COMMENT '产品ID',
    batch_id BIGINT NOT NULL COMMENT '批次ID（冗余）',
    quantity INT NOT NULL COMMENT '出库数量',
    outbound_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '出库时间',
    receiver VARCHAR(100) COMMENT '接收方',
    operator_id BIGINT NOT NULL COMMENT '出库操作人',
    safe_check_passed TINYINT NOT NULL COMMENT '安全检查是否通过：1-是 0-否',
    safe_check_detail TEXT COMMENT '安全检查详情',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (batch_id) REFERENCES harvest_batches(id),
    FOREIGN KEY (operator_id) REFERENCES operators(id),
    INDEX idx_outbound_no (outbound_no),
    INDEX idx_product (product_id),
    INDEX idx_batch (batch_id),
    INDEX idx_outbound_date (outbound_date),
    INDEX idx_safe_check (safe_check_passed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库记录表';

-- =============================================
-- 14. API访问日志表（用于防爬机制）
-- =============================================
CREATE TABLE api_access_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    api_path VARCHAR(200) NOT NULL COMMENT 'API路径',
    ip_address VARCHAR(45) NOT NULL COMMENT 'IP地址（支持IPv6）',
    user_agent VARCHAR(500) COMMENT '用户代理',
    request_method VARCHAR(10) COMMENT '请求方法',
    response_status INT COMMENT '响应状态码',
    is_blocked TINYINT DEFAULT 0 COMMENT '是否被拦截：1-是 0-否',
    block_reason VARCHAR(200) COMMENT '拦截原因',
    request_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '请求时间',
    INDEX idx_api_path (api_path),
    INDEX idx_ip (ip_address),
    INDEX idx_request_time (request_time),
    INDEX idx_is_blocked (is_blocked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='API访问日志表';

-- =============================================
-- 15. IP黑名单表（防爬）
-- =============================================
CREATE TABLE ip_blacklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45) UNIQUE NOT NULL COMMENT 'IP地址',
    reason VARCHAR(200) COMMENT '拉黑原因',
    blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '拉黑时间',
    expire_at DATETIME COMMENT '过期时间（NULL表示永久）',
    INDEX idx_ip (ip_address),
    INDEX idx_expire (expire_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IP黑名单表';

-- =============================================
-- 插入初始数据
-- =============================================

-- 操作人员
INSERT INTO operators (name, phone, role) VALUES
('张三', '13800138001', 'planter'),
('李四', '13800138002', 'planter'),
('王五', '13800138003', 'processor'),
('赵六', '13800138004', 'processor'),
('管理员', '13800138000', 'manager');

-- 农药
INSERT INTO pesticides (name, registration_no, manufacturer, safe_interval_days, usage_method) VALUES
('多菌灵', 'PD20080888', '某农药厂', 15, '稀释800-1000倍喷雾'),
('吡虫啉', 'PD20090123', '某农药厂', 20, '稀释2000倍喷雾'),
('代森锰锌', 'PD20071234', '某农药厂', 21, '稀释600倍喷雾'),
('阿维菌素', 'PD20104567', '某农药厂', 30, '稀释3000倍喷雾');

-- 肥料
INSERT INTO fertilizers (name, type, manufacturer, nutrient_content) VALUES
('有机肥', '有机肥', '某肥料厂', '有机质≥45%'),
('氮磷钾复合肥', '复合肥', '某肥料厂', 'N-P-K:15-15-15'),
('尿素', '氮肥', '某肥料厂', 'N≥46.4%'),
('磷酸二氢钾', '叶面肥', '某肥料厂', 'P2O5≥52%, K2O≥34%');

-- 中药材品种
INSERT INTO herb_varieties (code, name, alias, scientific_name, origin, growth_cycle_days, description) VALUES
('HQ-001', '蒙古黄芪', '黄耆、独椹', 'Astragalus membranaceus var. mongholicus', '内蒙古', 730, '补气升阳，固表止汗'),
('DQ-001', '定西当归', '秦归、云归', 'Angelica sinensis', '甘肃定西', 365, '补血活血，调经止痛'),
('RL-001', '文山三七', '田七、金不换', 'Panax notoginseng', '云南文山', 1095, '散瘀止血，消肿定痛'),
('XD-001', '乐清铁皮石斛', '黑节草', 'Dendrobium officinale', '浙江乐清', 540, '益胃生津，滋阴清热');

-- 农事操作类型
INSERT INTO farming_operation_types (code, name, category, need_record_detail, sort_order) VALUES
('W001', '人工除草', 'weeding', 0, 1),
('W002', '机械除草', 'weeding', 0, 2),
('F001', '基肥施用', 'fertilizing', 1, 3),
('F002', '追肥施用', 'fertilizing', 1, 4),
('P001', '病害防治', 'pesticide', 1, 5),
('P002', '虫害防治', 'pesticide', 1, 6),
('O001', '浇水灌溉', 'watering', 0, 7),
('O002', '整枝修剪', 'pruning', 0, 8);

-- 加工工序类型
INSERT INTO processing_step_types (code, name, category, need_temperature, need_time, standard_temperature_min, standard_temperature_max, standard_time_min, standard_time_max, sort_order) VALUES
('C001', '净选', 'cleaning', 0, 0, NULL, NULL, NULL, NULL, 1),
('C002', '清洗', 'cleaning', 0, 0, NULL, NULL, NULL, NULL, 2),
('T001', '切制', 'cutting', 0, 0, NULL, NULL, NULL, NULL, 3),
('D001', '晒干', 'drying', 0, 1, NULL, NULL, 180, 360, 4),
('D002', '烘干', 'drying', 1, 1, 50, 70, 120, 240, 5),
('P001', '清炒', 'processing', 1, 1, 150, 200, 10, 30, 6),
('P002', '麸炒', 'processing', 1, 1, 150, 200, 10, 30, 7),
('P003', '蜜炙', 'processing', 1, 1, 100, 150, 15, 45, 8),
('P004', '醋炙', 'processing', 1, 1, 120, 180, 10, 30, 9),
('P005', '煅制', 'processing', 1, 1, 300, 500, 30, 120, 10),
('K001', '包装', 'packaging', 0, 0, NULL, NULL, NULL, NULL, 11);

-- 示例地块
INSERT INTO plots (plot_code, name, province, city, district, address, longitude, latitude, altitude, soil_type, soil_ph, area, seedling_source, variety_id, planting_date, expected_harvest_date, operator_id, status, remark) VALUES
('PLOT-2024-001', '黄芪种植一号地', '内蒙古', '呼和浩特', '和林格尔县', '盛乐镇某村', 111.850000, 40.450000, 1350.00, '砂质壤土', 7.5, 50.00, '内蒙古赤峰某农户', 1, '2024-04-15', '2026-09-30', 1, 1, '道地药材种植基地'),
('PLOT-2024-002', '黄芪种植二号地', '内蒙古', '呼和浩特', '和林格尔县', '盛乐镇某村', 111.852000, 40.452000, 1355.00, '砂质壤土', 7.6, 45.00, '内蒙古赤峰某农户', 1, '2024-04-20', '2026-10-05', 2, 1, '道地药材种植基地'),
('PLOT-2023-001', '当归种植基地', '甘肃', '定西', '岷县', '十里镇某村', 104.030000, 34.430000, 2300.00, '黑垆土', 7.2, 30.00, '甘肃定西某合作社', 2, '2023-06-10', '2024-10-15', 1, 2, '已采收完成'),
('PLOT-2022-001', '三七种植基地', '云南', '文山', '文山市', '平坝镇某村', 103.800000, 23.350000, 1700.00, '红壤', 5.8, 20.00, '云南文山某农户', 3, '2022-03-15', '2025-03-15', 2, 1, '三年生三七');

-- 示例农事记录
INSERT INTO farming_records (record_no, plot_id, operation_type_id, operation_date, operator_id, fertilizer_id, fertilizer_quantity, pesticide_id, pesticide_quantity, safe_interval_days, operation_detail, weather_condition) VALUES
('FR-20240501-001', 1, 1, '2024-05-01', 1, NULL, NULL, NULL, NULL, NULL, '第一次人工除草，清除行间杂草', '晴天'),
('FR-20240515-001', 1, 4, '2024-05-15', 1, 2, 250.00, NULL, NULL, NULL, '追施氮磷钾复合肥，每亩5kg', '多云'),
('FR-20240610-001', 1, 5, '2024-06-10', 2, NULL, NULL, 1, 5.00, 15, '喷施多菌灵防治根腐病，每亩0.1kg', '晴天'),
('FR-20240705-001', 1, 2, '2024-07-05', 1, NULL, NULL, NULL, NULL, NULL, '机械中耕除草', '阴天'),
('FR-20240820-001', 1, 6, '2024-08-20', 2, NULL, NULL, 2, 3.00, 20, '喷施吡虫啉防治蚜虫，每亩0.06kg', '晴天');

-- 示例采收批次
INSERT INTO harvest_batches (batch_no, plot_id, variety_id, harvest_date, quantity, quality_level, operator_id, harvest_method, weather_condition, safe_check_passed, safe_check_remark, status, remark) VALUES
('BATCH-20241001-001', 3, 2, '2024-10-01', 1500.00, '一级', 3, '人工采挖', '晴天', 1, '安全检查通过，最后一次施药距采收45天，超过安全间隔期30天', 3, '2024年首批当归采收'),
('BATCH-20241015-001', 3, 2, '2024-10-15', 2000.00, '特级', 3, '人工采挖', '晴天', 1, '安全检查通过', 3, '2024年第二批当归采收');

-- 示例加工记录
INSERT INTO processing_records (record_no, batch_id, step_type_id, start_time, end_time, duration_minutes, temperature, operator_id, processing_detail, input_quantity, output_quantity, quality_check_result, quality_check_remark) VALUES
('PR-20241002-001', 1, 1, '2024-10-02 08:00:00', '2024-10-02 12:00:00', 240, NULL, 3, '人工挑选，去除杂质和非药用部位', 1500.00, 1425.00, '合格', '净选完成，去除杂质75kg'),
('PR-20241002-002', 1, 2, '2024-10-02 14:00:00', '2024-10-02 16:00:00', 120, NULL, 4, '流动水清洗3遍', 1425.00, 1410.00, '合格', '清洗完成'),
('PR-20241003-001', 1, 3, '2024-10-03 08:00:00', '2024-10-03 11:30:00', 210, NULL, 3, '切厚片，厚度2-4mm', 1410.00, 1380.00, '合格', '切片均匀，符合规格要求'),
('PR-20241003-002', 1, 5, '2024-10-03 13:00:00', '2024-10-03 16:30:00', 210, 60.00, 4, '低温烘干，温度控制在60℃左右', 1380.00, 345.00, '合格', '水分含量≤13%，符合标准'),
('PR-20241004-001', 1, 11, '2024-10-04 09:00:00', '2024-10-04 17:00:00', 480, NULL, 5, '250g/盒无菌包装', 345.00, 1380, '合格', '包装完成，共1380盒');

-- 示例产品
INSERT INTO products (product_code, product_name, batch_id, specification, package_type, net_weight, production_date, shelf_life_months, storage_condition, total_quantity, available_quantity, status, remark) VALUES
('PROD-20241004-001', '定西当归片', 1, '250g/盒', '纸盒', 250.00, '2024-10-04', 24, '密封，置阴凉干燥处，防潮、防蛀', 1380, 1380, 1, '道地药材，品质保证');

-- 示例二维码（消费者扫码用）
INSERT INTO qr_codes (qr_code, product_id, batch_id, status) VALUES
('TCM-7A8B9C0D1E2F3A4B', 1, 1, 1),
('TCM-8B9C0D1E2F3A4B5C', 1, 1, 1),
('TCM-9C0D1E2F3A4B5C6D', 1, 1, 1),
('TCM-0D1E2F3A4B5C6D7E', 1, 1, 1),
('TCM-1E2F3A4B5C6D7E8F', 1, 1, 1);

-- =============================================
-- 创建视图：产品完整溯源信息视图
-- =============================================
CREATE VIEW v_product_traceability AS
SELECT 
    p.id AS product_id,
    p.product_code,
    p.product_name,
    p.specification,
    p.net_weight,
    p.production_date,
    p.shelf_life_months,
    p.storage_condition,
    -- 批次信息
    hb.batch_no,
    hb.harvest_date,
    hb.quantity AS harvest_quantity,
    hb.quality_level,
    hb.safe_check_passed,
    hb.safe_check_remark,
    -- 品种信息
    hv.code AS variety_code,
    hv.name AS variety_name,
    hv.origin AS variety_origin,
    -- 地块信息
    pl.plot_code,
    pl.name AS plot_name,
    pl.province,
    pl.city,
    pl.district,
    pl.address,
    pl.longitude,
    pl.latitude,
    pl.altitude,
    pl.soil_type,
    pl.soil_ph,
    pl.area,
    pl.seedling_source,
    pl.planting_date,
    -- 地块负责人
    op.name AS plot_operator_name,
    -- 采收负责人
    op2.name AS harvest_operator_name
FROM products p
INNER JOIN harvest_batches hb ON p.batch_id = hb.id
INNER JOIN herb_varieties hv ON hb.variety_id = hv.id
INNER JOIN plots pl ON hb.plot_id = pl.id
LEFT JOIN operators op ON pl.operator_id = op.id
LEFT JOIN operators op2 ON hb.operator_id = op2.id;

-- =============================================
-- 创建视图：农事记录详情视图
-- =============================================
CREATE VIEW v_farming_record_details AS
SELECT 
    fr.id,
    fr.record_no,
    fr.plot_id,
    pl.plot_code,
    pl.name AS plot_name,
    fot.code AS operation_type_code,
    fot.name AS operation_type_name,
    fot.category AS operation_category,
    fr.operation_date,
    fr.operator_id,
    op.name AS operator_name,
    fr.fertilizer_id,
    f.name AS fertilizer_name,
    fr.fertilizer_quantity,
    fr.pesticide_id,
    p.name AS pesticide_name,
    p.safe_interval_days,
    fr.pesticide_quantity,
    fr.operation_detail,
    fr.weather_condition,
    fr.created_at
FROM farming_records fr
INNER JOIN plots pl ON fr.plot_id = pl.id
INNER JOIN farming_operation_types fot ON fr.operation_type_id = fot.id
INNER JOIN operators op ON fr.operator_id = op.id
LEFT JOIN fertilizers f ON fr.fertilizer_id = f.id
LEFT JOIN pesticides p ON fr.pesticide_id = p.id;

-- =============================================
-- 创建视图：加工记录详情视图
-- =============================================
CREATE VIEW v_processing_record_details AS
SELECT 
    pr.id,
    pr.record_no,
    pr.batch_id,
    hb.batch_no,
    pst.code AS step_type_code,
    pst.name AS step_type_name,
    pst.category AS step_category,
    pr.start_time,
    pr.end_time,
    pr.duration_minutes,
    pr.temperature,
    pr.operator_id,
    op.name AS operator_name,
    pr.processing_detail,
    pr.input_quantity,
    pr.output_quantity,
    pr.quality_check_result,
    pr.quality_check_remark,
    pr.created_at
FROM processing_records pr
INNER JOIN harvest_batches hb ON pr.batch_id = hb.id
INNER JOIN processing_step_types pst ON pr.step_type_id = pst.id
INNER JOIN operators op ON pr.operator_id = op.id;

-- =============================================
-- 创建存储过程：安全间隔期检查
-- 在采收和出库时调用，检查打药日期距离采收日期是否满足安全间隔期
-- =============================================
DELIMITER $$

CREATE PROCEDURE sp_check_safety_interval(
    IN p_plot_id BIGINT,
    IN p_harvest_date DATE,
    OUT p_passed TINYINT,
    OUT p_remark TEXT
)
BEGIN
    DECLARE v_pesticide_name VARCHAR(100);
    DECLARE v_safe_interval INT;
    DECLARE v_operation_date DATE;
    DECLARE v_days_diff INT;
    DECLARE v_done INT DEFAULT 0;
    
    DECLARE cur CURSOR FOR
        SELECT 
            p.name,
            p.safe_interval_days,
            fr.operation_date
        FROM farming_records fr
        INNER JOIN pesticides p ON fr.pesticide_id = p.id
        WHERE fr.plot_id = p_plot_id
          AND fr.operation_date <= p_harvest_date
          AND fr.pesticide_id IS NOT NULL
        ORDER BY fr.operation_date DESC;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
    
    SET p_passed = 1;
    SET p_remark = '安全检查通过';
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_pesticide_name, v_safe_interval, v_operation_date;
        IF v_done THEN
            LEAVE read_loop;
        END IF;
        
        SET v_days_diff = DATEDIFF(p_harvest_date, v_operation_date);
        
        IF v_days_diff < v_safe_interval THEN
            SET p_passed = 0;
            SET p_remark = CONCAT('安全检查不通过：农药[', v_pesticide_name, ']于', 
                                  DATE_FORMAT(v_operation_date, '%Y-%m-%d'), '施用，安全间隔期', 
                                  v_safe_interval, '天，距采收日期仅', v_days_diff, '天');
            CLOSE cur;
            LEAVE read_loop;
        END IF;
    END LOOP;
    
    IF v_done = 1 AND p_passed = 1 THEN
        -- 统计所有农药施用记录
        SELECT GROUP_CONCAT(
            CONCAT(p.name, '(', DATE_FORMAT(fr.operation_date, '%Y-%m-%d'), ',间隔', p.safe_interval_days, '天,实际', 
                   DATEDIFF(p_harvest_date, fr.operation_date), '天)') 
            SEPARATOR '; ')
        INTO p_remark
        FROM farming_records fr
        INNER JOIN pesticides p ON fr.pesticide_id = p.id
        WHERE fr.plot_id = p_plot_id
          AND fr.operation_date <= p_harvest_date
          AND fr.pesticide_id IS NOT NULL;
        
        IF p_remark IS NULL THEN
            SET p_remark = '安全检查通过，无农药施用记录';
        ELSE
            SET p_remark = CONCAT('安全检查通过，所有农药均满足安全间隔期：', p_remark);
        END IF;
    END IF;
    
    CLOSE cur;
END$$

DELIMITER ;

-- =============================================
-- 创建触发器：插入农事记录时自动填充安全间隔期
-- =============================================
DELIMITER $$

CREATE TRIGGER tr_farming_records_before_insert
BEFORE INSERT ON farming_records
FOR EACH ROW
BEGIN
    IF NEW.pesticide_id IS NOT NULL THEN
        SELECT safe_interval_days INTO NEW.safe_interval_days
        FROM pesticides
        WHERE id = NEW.pesticide_id;
    END IF;
END$$

DELIMITER ;

-- =============================================
-- 创建存储过程：生成全局唯一批次号
-- =============================================
DELIMITER $$

CREATE PROCEDURE sp_generate_batch_no(
    OUT p_batch_no VARCHAR(32)
)
BEGIN
    DECLARE v_prefix VARCHAR(20);
    DECLARE v_suffix INT;
    DECLARE v_exists INT;
    
    SET v_prefix = CONCAT('BATCH-', DATE_FORMAT(NOW(), '%Y%m%d'), '-');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(batch_no, LENGTH(v_prefix) + 1) AS UNSIGNED)), 0) + 1
    INTO v_suffix
    FROM harvest_batches
    WHERE batch_no LIKE CONCAT(v_prefix, '%');
    
    SET p_batch_no = CONCAT(v_prefix, LPAD(v_suffix, 3, '0'));
    
    -- 确保唯一（防止并发）
    SET v_exists = 1;
    WHILE v_exists > 0 DO
        SELECT COUNT(*) INTO v_exists
        FROM harvest_batches
        WHERE batch_no = p_batch_no;
        
        IF v_exists > 0 THEN
            SET v_suffix = v_suffix + 1;
            SET p_batch_no = CONCAT(v_prefix, LPAD(v_suffix, 3, '0'));
        END IF;
    END WHILE;
END$$

DELIMITER ;

-- =============================================
-- 创建存储过程：生成唯一二维码
-- =============================================
DELIMITER $$

CREATE PROCEDURE sp_generate_qr_code(
    IN p_product_id BIGINT,
    OUT p_qr_code VARCHAR(64)
)
BEGIN
    DECLARE v_batch_id BIGINT;
    DECLARE v_exists INT;
    DECLARE v_random_str VARCHAR(32);
    
    SELECT batch_id INTO v_batch_id
    FROM products
    WHERE id = p_product_id;
    
    SET v_exists = 1;
    WHILE v_exists > 0 DO
        -- 生成16位随机十六进制字符串
        SET v_random_str = UPPER(MD5(CONCAT(NOW(), RAND(), UUID())));
        SET v_random_str = SUBSTRING(v_random_str, 1, 16);
        
        SET p_qr_code = CONCAT('TCM-', v_random_str);
        
        SELECT COUNT(*) INTO v_exists
        FROM qr_codes
        WHERE qr_code = p_qr_code;
    END WHILE;
    
    INSERT INTO qr_codes (qr_code, product_id, batch_id, status)
    VALUES (p_qr_code, p_product_id, v_batch_id, 1);
END$$

DELIMITER ;

-- =============================================
-- 创建事件：定时清理过期IP黑名单
-- =============================================
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS event_clean_expired_blacklist
ON SCHEDULE EVERY 1 DAY
STARTS DATE_ADD(CURDATE(), INTERVAL 1 DAY)
DO
    DELETE FROM ip_blacklist
    WHERE expire_at IS NOT NULL AND expire_at < NOW();
