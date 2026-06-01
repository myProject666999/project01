-- 二手车检测报告系统数据库
-- 创建数据库
CREATE DATABASE IF NOT EXISTS used_car_inspection CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE used_car_inspection;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'inspector') NOT NULL DEFAULT 'inspector',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1:启用 0:禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 车辆表
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vin VARCHAR(17) NOT NULL UNIQUE COMMENT '车架号',
    brand VARCHAR(50) NOT NULL COMMENT '品牌',
    model VARCHAR(100) NOT NULL COMMENT '型号',
    year INT COMMENT '年款',
    mileage INT COMMENT '里程(公里)',
    license_plate VARCHAR(20) COMMENT '车牌号',
    color VARCHAR(20),
    first_registration_date DATE COMMENT '首次登记日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vin (vin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 检测大类表
CREATE TABLE IF NOT EXISTS inspection_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '大类编码',
    name VARCHAR(50) NOT NULL COMMENT '大类名称',
    description VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    weight DECIMAL(5,2) NOT NULL DEFAULT 1.00 COMMENT '权重',
    status TINYINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 检测项表
CREATE TABLE IF NOT EXISTS inspection_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '检测项编码',
    name VARCHAR(100) NOT NULL COMMENT '检测项名称',
    description TEXT COMMENT '检测说明',
    standard TEXT COMMENT '检测标准',
    sort_order INT NOT NULL DEFAULT 0,
    score_ok INT NOT NULL DEFAULT 5 COMMENT 'OK得分',
    score_attention INT NOT NULL DEFAULT 3 COMMENT '注意得分',
    score_abnormal INT NOT NULL DEFAULT 0 COMMENT '异常得分',
    need_photo TINYINT NOT NULL DEFAULT 1 COMMENT '是否需要拍照 1:是 0:否',
    status TINYINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_id (category_id),
    FOREIGN KEY (category_id) REFERENCES inspection_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 检测报告表
CREATE TABLE IF NOT EXISTS inspection_reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_no VARCHAR(32) NOT NULL UNIQUE COMMENT '报告编号',
    vehicle_id BIGINT UNSIGNED NOT NULL,
    inspector_id BIGINT UNSIGNED NOT NULL,
    status ENUM('draft', 'submitted', 'expired') NOT NULL DEFAULT 'draft',
    total_score DECIMAL(5,2) COMMENT '综合得分',
    level VARCHAR(10) COMMENT '评级: A/B/C/D',
    inspection_date DATE COMMENT '检测日期',
    mileage INT COMMENT '检测时里程',
    remark TEXT COMMENT '备注',
    share_token VARCHAR(64) UNIQUE COMMENT '分享token',
    share_expire_at TIMESTAMP COMMENT '分享过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_report_no (report_no),
    INDEX idx_share_token (share_token),
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_inspector_id (inspector_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    FOREIGN KEY (inspector_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 检测结果表
CREATE TABLE IF NOT EXISTS inspection_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT UNSIGNED NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    result ENUM('ok', 'attention', 'abnormal') NOT NULL,
    score INT NOT NULL,
    remark TEXT COMMENT '检测说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_report_item (report_id, item_id),
    INDEX idx_report_id (report_id),
    INDEX idx_item_id (item_id),
    INDEX idx_result (result),
    FOREIGN KEY (report_id) REFERENCES inspection_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inspection_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 检测照片表
CREATE TABLE IF NOT EXISTS inspection_photos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    result_id BIGINT UNSIGNED NOT NULL,
    report_id BIGINT UNSIGNED NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_result_id (result_id),
    INDEX idx_report_id (report_id),
    INDEX idx_item_id (item_id),
    FOREIGN KEY (result_id) REFERENCES inspection_results(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES inspection_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 维修建议表
CREATE TABLE IF NOT EXISTS repair_suggestions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    result_id BIGINT UNSIGNED NOT NULL,
    report_id BIGINT UNSIGNED NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    problem_description TEXT COMMENT '问题描述',
    suggestion TEXT COMMENT '维修建议',
    estimated_cost DECIMAL(10,2) COMMENT '预估费用',
    urgency ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' COMMENT '紧急程度',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_result_id (result_id),
    INDEX idx_report_id (report_id),
    FOREIGN KEY (result_id) REFERENCES inspection_results(id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES inspection_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 大类得分表
CREATE TABLE IF NOT EXISTS category_scores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    report_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    total_score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_report_category (report_id, category_id),
    FOREIGN KEY (report_id) REFERENCES inspection_reports(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES inspection_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 初始化数据
-- 插入检测大类
INSERT INTO inspection_categories (code, name, description, sort_order, weight) VALUES
('appearance', '外观', '车辆外观检测', 1, 1.00),
('interior', '内饰', '车辆内饰检测', 2, 1.00),
('chassis', '底盘', '车辆底盘检测', 3, 1.20),
('engine', '发动机', '发动机舱检测', 4, 1.50),
('electrical', '电气', '电气系统检测', 5, 1.00),
('road_test', '路试', '道路测试', 6, 1.30);

-- 插入检测项 - 外观 (appearance)
INSERT INTO inspection_items (category_id, code, name, description, standard, sort_order, need_photo) VALUES
(1, 'APP-001', '前保险杠', '检查前保险杠是否有划痕、凹陷、破损', '无划痕、无凹陷、无破损', 1, 1),
(1, 'APP-002', '后保险杠', '检查后保险杠是否有划痕、凹陷、破损', '无划痕、无凹陷、无破损', 2, 1),
(1, 'APP-003', '左前翼子板', '检查左前翼子板是否有划痕、凹陷、喷漆痕迹', '原厂漆面，无损伤', 3, 1),
(1, 'APP-004', '右前翼子板', '检查右前翼子板是否有划痕、凹陷、喷漆痕迹', '原厂漆面，无损伤', 4, 1),
(1, 'APP-005', '左后翼子板', '检查左后翼子板是否有划痕、凹陷、喷漆痕迹', '原厂漆面，无损伤', 5, 1),
(1, 'APP-006', '右后翼子板', '检查右后翼子板是否有划痕、凹陷、喷漆痕迹', '原厂漆面，无损伤', 6, 1),
(1, 'APP-007', '左前车门', '检查左前车门是否有划痕、凹陷、开关是否正常', '开关顺畅，无损伤', 7, 1),
(1, 'APP-008', '右前车门', '检查右前车门是否有划痕、凹陷、开关是否正常', '开关顺畅，无损伤', 8, 1),
(1, 'APP-009', '左后车门', '检查左后车门是否有划痕、凹陷、开关是否正常', '开关顺畅，无损伤', 9, 1),
(1, 'APP-010', '右后车门', '检查右后车门是否有划痕、凹陷、开关是否正常', '开关顺畅，无损伤', 10, 1),
(1, 'APP-011', '发动机盖', '检查发动机盖是否有划痕、凹陷、密封是否良好', '密封良好，无损伤', 11, 1),
(1, 'APP-012', '行李厢盖', '检查行李厢盖是否有划痕、凹陷、开关是否正常', '开关顺畅，无损伤', 12, 1),
(1, 'APP-013', '车顶', '检查车顶是否有划痕、凹陷、天窗功能', '无损伤，天窗正常', 13, 1),
(1, 'APP-014', '前挡风玻璃', '检查前挡风玻璃是否有裂纹、破损', '无裂纹、无破损', 14, 1),
(1, 'APP-015', '后挡风玻璃', '检查后挡风玻璃是否有裂纹、破损', '无裂纹、无破损', 15, 1),
(1, 'APP-016', '左前门玻璃', '检查左前门玻璃是否有划痕、升降是否正常', '升降顺畅，无划痕', 16, 1),
(1, 'APP-017', '右前门玻璃', '检查右前门玻璃是否有划痕、升降是否正常', '升降顺畅，无划痕', 17, 1),
(1, 'APP-018', '左后门玻璃', '检查左后门玻璃是否有划痕、升降是否正常', '升降顺畅，无划痕', 18, 1),
(1, 'APP-019', '右后门玻璃', '检查右后门玻璃是否有划痕、升降是否正常', '升降顺畅，无划痕', 19, 1),
(1, 'APP-020', '左前大灯', '检查左前大灯外观是否完好、功能是否正常', '外观完好，功能正常', 20, 1),
(1, 'APP-021', '右前大灯', '检查右前大灯外观是否完好、功能是否正常', '外观完好，功能正常', 21, 1),
(1, 'APP-022', '左后尾灯', '检查左后尾灯外观是否完好、功能是否正常', '外观完好，功能正常', 22, 1),
(1, 'APP-023', '右后尾灯', '检查右后尾灯外观是否完好、功能是否正常', '外观完好，功能正常', 23, 1),
(1, 'APP-024', '前雾灯', '检查前雾灯外观是否完好、功能是否正常', '外观完好，功能正常', 24, 1),
(1, 'APP-025', '后雾灯', '检查后雾灯外观是否完好、功能是否正常', '外观完好，功能正常', 25, 1),
(1, 'APP-026', '左外后视镜', '检查左外后视镜外观、调节功能', '外观完好，调节正常', 26, 1),
(1, 'APP-027', '右外后视镜', '检查右外后视镜外观、调节功能', '外观完好，调节正常', 27, 1),
(1, 'APP-028', '前格栅', '检查前格栅是否完好、固定是否牢固', '完好牢固', 28, 1),
(1, 'APP-029', '左前轮毂', '检查左前轮毂是否有划痕、变形', '无划痕、无变形', 29, 1),
(1, 'APP-030', '右前轮毂', '检查右前轮毂是否有划痕、变形', '无划痕、无变形', 30, 1),
(1, 'APP-031', '左后轮毂', '检查左后轮毂是否有划痕、变形', '无划痕、无变形', 31, 1),
(1, 'APP-032', '右后轮毂', '检查右后轮毂是否有划痕、变形', '无划痕、无变形', 32, 1),
(1, 'APP-033', '左前轮胎', '检查左前轮胎品牌、花纹深度、磨损情况', '花纹深度≥3mm，磨损均匀', 33, 1),
(1, 'APP-034', '右前轮胎', '检查右前轮胎品牌、花纹深度、磨损情况', '花纹深度≥3mm，磨损均匀', 34, 1),
(1, 'APP-035', '左后轮胎', '检查左后轮胎品牌、花纹深度、磨损情况', '花纹深度≥3mm，磨损均匀', 35, 1),
(1, 'APP-036', '右后轮胎', '检查右后轮胎品牌、花纹深度、磨损情况', '花纹深度≥3mm，磨损均匀', 36, 1),
(1, 'APP-037', '备胎', '检查备胎气压、磨损情况', '气压正常，无严重磨损', 37, 1),
(1, 'APP-038', '雨刮器', '检查雨刮器胶条老化情况、喷水功能', '胶条无老化，喷水正常', 38, 1),
(1, 'APP-039', '车身腰线', '检查车身腰线是否平整、有无钣金痕迹', '平整，无钣金痕迹', 39, 1),
(1, 'APP-040', '车门密封胶条', '检查车门密封胶条是否老化、破损', '无老化、无破损', 40, 1);

-- 插入检测项 - 内饰 (interior)
INSERT INTO inspection_items (category_id, code, name, description, standard, sort_order, need_photo) VALUES
(2, 'INT-001', '方向盘', '检查方向盘磨损情况、多功能按键', '磨损正常，按键功能正常', 1, 1),
(2, 'INT-002', '驾驶座椅', '检查驾驶座椅磨损、调节功能', '磨损正常，调节顺畅', 2, 1),
(2, 'INT-003', '副驾驶座椅', '检查副驾驶座椅磨损、调节功能', '磨损正常，调节顺畅', 3, 1),
(2, 'INT-004', '后排座椅', '检查后排座椅磨损、折叠功能', '磨损正常，功能正常', 4, 1),
(2, 'INT-005', '仪表盘', '检查仪表盘显示是否正常、有无故障灯', '显示正常，无故障灯', 5, 1),
(2, 'INT-006', '中控台', '检查中控台外观、按键功能', '外观完好，按键正常', 6, 1),
(2, 'INT-007', '空调系统', '检查空调制冷、制热、出风功能', '制冷制热正常，出风顺畅', 7, 1),
(2, 'INT-008', '音响系统', '检查音响功能、扬声器', '功能正常，音质清晰', 8, 1),
(2, 'INT-009', '导航系统', '检查导航功能、GPS信号', '定位准确，功能正常', 9, 1),
(2, 'INT-010', '车内照明灯', '检查车内照明灯功能', '全部正常点亮', 10, 1),
(2, 'INT-011', '天窗内饰', '检查天窗内饰板、遮阳板', '完好无损', 11, 1),
(2, 'INT-012', '内后视镜', '检查内后视镜防眩目功能', '功能正常', 12, 1),
(2, 'INT-013', '遮阳板', '检查遮阳板化妆镜、照明灯', '功能正常', 13, 1),
(2, 'INT-014', '安全带', '检查安全带锁止、回缩功能', '锁止正常，回缩顺畅', 14, 1),
(2, 'INT-015', '安全气囊指示灯', '检查安全气囊指示灯是否正常', '自检后熄灭', 15, 1),
(2, 'INT-016', '手刹/电子手刹', '检查手刹/电子手刹功能', '功能正常', 16, 1),
(2, 'INT-017', '换挡杆', '检查换挡杆外观、换挡顺畅度', '外观完好，换挡顺畅', 17, 1),
(2, 'INT-018', '油门踏板', '检查油门踏板响应情况', '响应灵敏，无卡滞', 18, 1),
(2, 'INT-019', '刹车踏板', '检查刹车踏板行程、力度', '行程适中，力度均匀', 19, 1),
(2, 'INT-020', '离合踏板', '检查离合踏板行程、结合点', '行程适中，结合清晰', 20, 1),
(2, 'INT-021', '车门内饰板', '检查车门内饰板是否完好', '完好无损', 21, 1),
(2, 'INT-022', '顶棚内饰', '检查顶棚内饰是否有污渍、破损', '无污渍、无破损', 22, 1),
(2, 'INT-023', '脚垫', '检查脚垫磨损情况', '磨损正常', 23, 1),
(2, 'INT-024', '后备箱内饰', '检查后备箱内饰、工具', '完好，工具齐全', 24, 1),
(2, 'INT-025', '点烟器/电源接口', '检查点烟器、USB接口功能', '功能正常', 25, 1),
(2, 'INT-026', '杯架', '检查杯架是否完好', '完好无损', 26, 1),
(2, 'INT-027', '储物盒', '检查储物盒开关功能', '开关正常', 27, 1),
(2, 'INT-028', '车内异味', '检查车内是否有异味', '无异味', 28, 1),
(2, 'INT-029', '座椅加热', '检查座椅加热功能', '功能正常', 29, 1),
(2, 'INT-030', '座椅通风', '检查座椅通风功能', '功能正常', 30, 1);

-- 插入检测项 - 底盘 (chassis)
INSERT INTO inspection_items (category_id, code, name, description, standard, sort_order, need_photo) VALUES
(3, 'CHS-001', '前悬挂', '检查前悬挂是否有异响、漏油', '无异常', 1, 1),
(3, 'CHS-002', '后悬挂', '检查后悬挂是否有异响、漏油', '无异常', 2, 1),
(3, 'CHS-003', '减震器', '检查减震器是否漏油、失效', '无漏油，减震正常', 3, 1),
(3, 'CHS-004', '下摆臂', '检查下摆臂胶套是否老化、球头是否松动', '无老化，无松动', 4, 1),
(3, 'CHS-005', '平衡杆', '检查平衡杆胶套、连接杆', '完好无损', 5, 1),
(3, 'CHS-006', '转向拉杆', '检查转向拉杆球头是否松动', '无松动', 6, 1),
(3, 'CHS-007', '方向机', '检查方向机是否漏油、异响', '无漏油，无异响', 7, 1),
(3, 'CHS-008', '传动轴', '检查传动轴是否有旷量、防尘套', '无旷量，防尘套完好', 8, 1),
(3, 'CHS-009', '半轴', '检查半轴防尘套是否破损', '完好无损', 9, 1),
(3, 'CHS-010', '差速器', '检查差速器是否漏油、异响', '无漏油，无异响', 10, 1),
(3, 'CHS-011', '变速箱底部', '检查变速箱底部是否漏油', '无漏油', 11, 1),
(3, 'CHS-012', '发动机油底壳', '检查发动机油底壳是否漏油', '无漏油', 12, 1),
(3, 'CHS-013', '排气管', '检查排气管是否漏气、锈蚀', '无漏气，无严重锈蚀', 13, 1),
(3, 'CHS-014', '三元催化器', '检查三元催化器是否完好', '完好无损', 14, 1),
(3, 'CHS-015', '燃油箱', '检查燃油箱是否漏油、磕碰', '无漏油，无严重磕碰', 15, 1),
(3, 'CHS-016', '刹车总泵', '检查刹车总泵是否漏油', '无漏油', 16, 1),
(3, 'CHS-017', '刹车分泵', '检查刹车分泵是否漏油、回位', '无漏油，回位正常', 17, 1),
(3, 'CHS-018', '刹车盘', '检查刹车盘磨损、沟槽', '磨损正常，无沟槽', 18, 1),
(3, 'CHS-019', '刹车片', '检查刹车片厚度', '厚度≥3mm', 19, 1),
(3, 'CHS-020', '刹车油管', '检查刹车油管是否老化、漏油', '无老化，无漏油', 20, 1),
(3, 'CHS-021', 'ABS泵', '检查ABS泵是否正常', '功能正常', 21, 1),
(3, 'CHS-022', '底盘护板', '检查底盘护板是否完好', '完好无损', 22, 1),
(3, 'CHS-023', '车架', '检查车架是否变形、锈蚀', '无变形，无严重锈蚀', 23, 1),
(3, 'CHS-024', '元宝梁', '检查元宝梁是否变形、磕碰', '无变形，无严重磕碰', 24, 1),
(3, 'CHS-025', '稳定杆', '检查稳定杆胶套', '无老化', 25, 1),
(3, 'CHS-026', '转向助力泵', '检查转向助力泵是否漏油', '无漏油', 26, 1),
(3, 'CHS-027', '下支臂球头', '检查下支臂球头是否松动', '无松动', 27, 1),
(3, 'CHS-028', '轮毂轴承', '检查轮毂轴承是否异响、松旷', '无异响，无松旷', 28, 1),
(3, 'CHS-029', '球笼', '检查球笼防尘套', '完好无损', 29, 1),
(3, 'CHS-030', '底盘整体', '检查底盘整体锈蚀情况', '无严重锈蚀', 30, 1);

-- 插入检测项 - 发动机 (engine)
INSERT INTO inspection_items (category_id, code, name, description, standard, sort_order, need_photo) VALUES
(4, 'ENG-001', '发动机外观', '检查发动机外观是否整洁、漏油', '整洁，无漏油', 1, 1),
(4, 'ENG-002', '发动机怠速', '检查发动机怠速是否平稳', '平稳，无抖动', 2, 1),
(4, 'ENG-003', '发动机异响', '检查发动机是否有异响', '无异响', 3, 1),
(4, 'ENG-004', '机油状态', '检查机油液位、颜色', '液位正常，颜色正常', 4, 1),
(4, 'ENG-005', '防冻液', '检查防冻液液位、颜色', '液位正常，颜色正常', 5, 1),
(4, 'ENG-006', '变速箱油', '检查变速箱油液位、颜色', '液位正常，颜色正常', 6, 1),
(4, 'ENG-007', '刹车油', '检查刹车油液位、含水量', '液位正常，含水量≤1%', 7, 1),
(4, 'ENG-008', '转向助力油', '检查转向助力油液位', '液位正常', 8, 1),
(4, 'ENG-009', '电瓶', '检查电瓶电压、外观', '电压≥12V，外观完好', 9, 1),
(4, 'ENG-010', '发电机', '检查发电机发电量', '发电量13.5-14.5V', 10, 1),
(4, 'ENG-011', '启动机', '检查启动机工作情况', '启动顺畅', 11, 1),
(4, 'ENG-012', '正时皮带/链条', '检查正时皮带/链条状态', '状态良好', 12, 1),
(4, 'ENG-013', '水泵', '检查水泵是否漏水、异响', '无漏水，无异响', 13, 1),
(4, 'ENG-014', '节温器', '检查节温器工作是否正常', '工作正常', 14, 1),
(4, 'ENG-015', '散热器', '检查散热器是否漏水、堵塞', '无漏水，无堵塞', 15, 1),
(4, 'ENG-016', '电子风扇', '检查电子风扇工作情况', '工作正常', 16, 1),
(4, 'ENG-017', '进气系统', '检查进气管路是否漏气', '无漏气', 17, 1),
(4, 'ENG-018', '空气滤芯', '检查空气滤芯清洁度', '清洁或需更换', 18, 1),
(4, 'ENG-019', '节气门', '检查节气门积碳情况', '无明显积碳', 19, 1),
(4, 'ENG-020', '喷油嘴', '检查喷油嘴工作情况', '工作正常', 20, 1),
(4, 'ENG-021', '火花塞', '检查火花塞状态', '状态良好', 21, 1),
(4, 'ENG-022', '点火线圈', '检查点火线圈是否正常', '功能正常', 22, 1),
(4, 'ENG-023', '排气系统', '检查排气是否有黑烟、蓝烟', '排气正常', 23, 1),
(4, 'ENG-024', '涡轮增压器', '检查涡轮增压器是否正常', '工作正常', 24, 1),
(4, 'ENG-025', '废气阀', '检查废气阀是否正常', '功能正常', 25, 1),
(4, 'ENG-026', '碳罐', '检查碳罐是否正常', '功能正常', 26, 1),
(4, 'ENG-027', '燃油泵', '检查燃油泵压力', '压力正常', 27, 1),
(4, 'ENG-028', '燃油滤芯', '检查燃油滤芯状态', '状态良好', 28, 1),
(4, 'ENG-029', '发动机脚胶', '检查发动机脚胶是否老化', '无老化', 29, 1),
(4, 'ENG-030', '变速箱机脚胶', '检查变速箱机脚胶是否老化', '无老化', 30, 1),
(4, 'ENG-031', '离合器', '检查离合器工作情况', '结合平稳，无打滑', 31, 1),
(4, 'ENG-032', '废气再循环阀', '检查EGR阀工作情况', '工作正常', 32, 1),
(4, 'ENG-033', '曲轴箱通风', '检查曲轴箱通风系统', '工作正常', 33, 1),
(4, 'ENG-034', '机油滤芯', '检查机油滤芯状态', '状态良好', 34, 1),
(4, 'ENG-035', '变速箱滤芯', '检查变速箱滤芯状态', '状态良好', 35, 1),
(4, 'ENG-036', '真空管', '检查真空管是否老化、漏气', '无老化，无漏气', 36, 1),
(4, 'ENG-037', '传感器', '检查各类传感器工作情况', '全部正常', 37, 1),
(4, 'ENG-038', '发动机故障码', '读取发动机故障码', '无故障码', 38, 1),
(4, 'ENG-039', '变速箱故障码', '读取变速箱故障码', '无故障码', 39, 1),
(4, 'ENG-040', '发动机启停', '检查发动机启停功能', '功能正常', 40, 1);

-- 插入检测项 - 电气 (electrical)
INSERT INTO inspection_items (category_id, code, name, description, standard, sort_order, need_photo) VALUES
(5, 'ELE-001', '整车灯光', '检查所有灯光功能', '全部正常', 1, 1),
(5, 'ELE-002', '喇叭', '检查喇叭功能', '声音洪亮', 2, 1),
(5, 'ELE-003', '雨刮系统', '检查雨刮各档位功能', '各档位正常', 3, 1),
(5, 'ELE-004', '喷水系统', '检查玻璃喷水功能', '喷水正常', 4, 1),
(5, 'ELE-005', '电动车窗', '检查电动车窗功能', '升降顺畅', 5, 1),
(5, 'ELE-006', '电动后视镜', '检查电动后视镜调节', '调节正常', 6, 1),
(5, 'ELE-007', '后视镜加热', '检查后视镜加热功能', '功能正常', 7, 1),
(5, 'ELE-008', '电动座椅', '检查电动座椅调节', '调节正常', 8, 1),
(5, 'ELE-009', '座椅记忆', '检查座椅记忆功能', '功能正常', 9, 1),
(5, 'ELE-010', '中控锁', '检查中控锁功能', '功能正常', 10, 1),
(5, 'ELE-011', '遥控钥匙', '检查遥控钥匙功能', '功能正常', 11, 1),
(5, 'ELE-012', '无钥匙进入', '检查无钥匙进入功能', '功能正常', 12, 1),
(5, 'ELE-013', '一键启动', '检查一键启动功能', '功能正常', 13, 1),
(5, 'ELE-014', '自动大灯', '检查自动大灯功能', '功能正常', 14, 1),
(5, 'ELE-015', '自动雨刮', '检查自动雨刮功能', '功能正常', 15, 1),
(5, 'ELE-016', '定速巡航', '检查定速巡航功能', '功能正常', 16, 1),
(5, 'ELE-017', '自适应巡航', '检查自适应巡航功能', '功能正常', 17, 1),
(5, 'ELE-018', '车道保持', '检查车道保持功能', '功能正常', 18, 1),
(5, 'ELE-019', '并线辅助', '检查并线辅助功能', '功能正常', 19, 1),
(5, 'ELE-020', '倒车雷达', '检查倒车雷达功能', '功能正常', 20, 1),
(5, 'ELE-021', '倒车影像', '检查倒车影像功能', '图像清晰', 21, 1),
(5, 'ELE-022', '360全景影像', '检查360全景影像功能', '图像清晰', 22, 1),
(5, 'ELE-023', '自动泊车', '检查自动泊车功能', '功能正常', 23, 1),
(5, 'ELE-024', '胎压监测', '检查胎压监测功能', '显示正常', 24, 1),
(5, 'ELE-025', '胎压报警', '检查胎压报警功能', '功能正常', 25, 1),
(5, 'ELE-026', 'ABS功能', '检查ABS功能', '功能正常', 26, 1),
(5, 'ELE-027', 'ESP功能', '检查ESP功能', '功能正常', 27, 1),
(5, 'ELE-028', '电子手刹', '检查电子手刹功能', '功能正常', 28, 1),
(5, 'ELE-029', '自动驻车', '检查自动驻车功能', '功能正常', 29, 1),
(5, 'ELE-030', '上坡辅助', '检查上坡辅助功能', '功能正常', 30, 1),
(5, 'ELE-031', '下坡辅助', '检查下坡辅助功能', '功能正常', 31, 1),
(5, 'ELE-032', 'USB接口', '检查USB接口功能', '功能正常', 32, 1),
(5, 'ELE-033', 'AUX接口', '检查AUX接口功能', '功能正常', 33, 1),
(5, 'ELE-034', '蓝牙功能', '检查蓝牙连接功能', '连接正常', 34, 1),
(5, 'ELE-035', '车载WiFi', '检查车载WiFi功能', '功能正常', 35, 1),
(5, 'ELE-036', '行车记录仪', '检查行车记录仪功能', '功能正常', 36, 1),
(5, 'ELE-037', '抬头显示', '检查HUD功能', '显示正常', 37, 1),
(5, 'ELE-038', '氛围灯', '检查氛围灯功能', '功能正常', 38, 1),
(5, 'ELE-039', '感应雨刷', '检查感应雨刷功能', '功能正常', 39, 1),
(5, 'ELE-040', '全车电路', '检查全车电路老化情况', '无老化', 40, 1);

-- 插入检测项 - 路试 (road_test)
INSERT INTO inspection_items (category_id, code, name, description, standard, sort_order, need_photo) VALUES
(6, 'RDT-001', '起步', '检查车辆起步是否平顺', '平顺，无顿挫', 1, 0),
(6, 'RDT-002', '加速', '检查车辆加速性能', '加速有力', 2, 0),
(6, 'RDT-003', '减速', '检查车辆减速性能', '减速平稳', 3, 0),
(6, 'RDT-004', '换挡', '检查变速箱换挡平顺性', '平顺，无顿挫', 4, 0),
(6, 'RDT-005', '转向', '检查转向精准度、助力', '精准，助力适中', 5, 0),
(6, 'RDT-006', '制动', '检查制动效果、ABS介入', '制动有力，ABS正常', 6, 0),
(6, 'RDT-007', '高速行驶', '检查高速行驶稳定性', '稳定，无抖动', 7, 0),
(6, 'RDT-008', '过弯', '检查过弯侧倾情况', '侧倾较小', 8, 0),
(6, 'RDT-009', '颠簸路面', '检查颠簸路面舒适性', '舒适性良好', 9, 0),
(6, 'RDT-010', '发动机噪音', '检查发动机噪音大小', '噪音正常', 10, 0),
(6, 'RDT-011', '风噪', '检查风噪大小', '风噪正常', 11, 0),
(6, 'RDT-012', '胎噪', '检查胎噪大小', '胎噪正常', 12, 0),
(6, 'RDT-013', '底盘异响', '检查底盘是否有异响', '无异响', 13, 0),
(6, 'RDT-014', '方向盘抖动', '检查方向盘是否抖动', '无抖动', 14, 0),
(6, 'RDT-015', '车身抖动', '检查车身是否抖动', '无抖动', 15, 0),
(6, 'RDT-016', '跑偏', '检查车辆是否跑偏', '不跑偏', 16, 0),
(6, 'RDT-017', '回正力矩', '检查方向盘回正力矩', '回正正常', 17, 0),
(6, 'RDT-018', '爬坡', '检查爬坡动力', '动力充足', 18, 0),
(6, 'RDT-019', '油耗', '检查油耗显示', '油耗正常', 19, 0),
(6, 'RDT-020', '空调效果', '检查行驶中空调效果', '制冷正常', 20, 0),
(6, 'RDT-021', '音响效果', '检查行驶中音响效果', '效果正常', 21, 0),
(6, 'RDT-022', '自动启停', '检查行驶中启停功能', '功能正常', 22, 0),
(6, 'RDT-023', '变速箱响应', '检查变速箱响应速度', '响应迅速', 23, 0),
(6, 'RDT-024', '悬挂舒适性', '检查悬挂舒适性', '舒适性良好', 24, 0),
(6, 'RDT-025', '紧急制动', '检查紧急制动效果', '制动有力，不跑偏', 25, 0),
(6, 'RDT-026', '定速巡航', '检查定速巡航功能', '功能正常', 26, 0),
(6, 'RDT-027', '车道保持', '检查车道保持功能', '功能正常', 27, 0),
(6, 'RDT-028', '变道辅助', '检查变道辅助功能', '功能正常', 28, 0),
(6, 'RDT-029', '整体感受', '整体驾驶感受评价', '良好', 29, 0),
(6, 'RDT-030', '异常情况', '是否发现其他异常', '无异常', 30, 0);

-- 插入默认用户 (密码: 123456)
INSERT INTO users (username, password, real_name, phone, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', '13800138000', 'admin'),
('inspector01', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张检测员', '13800138001', 'inspector'),
('inspector02', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李检测员', '13800138002', 'inspector');

-- 插入测试车辆
INSERT INTO vehicles (vin, brand, model, year, mileage, license_plate, color, first_registration_date) VALUES
('LBV1Z3108KM000001', '宝马', '320Li 时尚型', 2019, 45000, '京A12345', '白色', '2019-03-15'),
('LFV2A21K6G3000002', '大众', '迈腾 330TSI', 2018, 62000, '京B67890', '黑色', '2018-08-20'),
('LGBF2DE07KY000003', '日产', '天籁 2.0L', 2020, 28000, '京C11111', '银色', '2020-01-10');
