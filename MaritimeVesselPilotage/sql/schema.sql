-- 海事船舶引水预约系统数据库
-- 创建数据库
CREATE DATABASE IF NOT EXISTS maritime_pilotage DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE maritime_pilotage;

-- 1. 船舶表
CREATE TABLE IF NOT EXISTS vessel (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vessel_name VARCHAR(100) NOT NULL COMMENT '船名',
    imo_number VARCHAR(20) UNIQUE COMMENT 'IMO编号',
    call_sign VARCHAR(20) COMMENT '呼号',
    vessel_type VARCHAR(50) COMMENT '船舶类型',
    gross_tonnage DECIMAL(12,2) COMMENT '总吨位',
    net_tonnage DECIMAL(12,2) NOT NULL COMMENT '净吨位（计费用）',
    deadweight_tonnage DECIMAL(12,2) COMMENT '载重吨',
    length_overall DECIMAL(8,2) COMMENT '总长',
    breadth DECIMAL(8,2) COMMENT '船宽',
    maximum_draft DECIMAL(6,2) NOT NULL COMMENT '最大吃水',
    vessel_level INT NOT NULL DEFAULT 1 COMMENT '船舶等级：1-万吨以下，2-万吨级以上',
    flag VARCHAR(50) COMMENT '船旗国',
    owner VARCHAR(100) COMMENT '船东',
    operator VARCHAR(100) COMMENT '经营人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vessel_name (vessel_name),
    INDEX idx_vessel_level (vessel_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='船舶信息表';

-- 2. 引航员表
CREATE TABLE IF NOT EXISTS pilot (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_no VARCHAR(20) UNIQUE NOT NULL COMMENT '工号',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender VARCHAR(10) COMMENT '性别',
    phone VARCHAR(20) COMMENT '联系电话',
    id_card VARCHAR(18) COMMENT '身份证号',
    pilot_level INT NOT NULL DEFAULT 1 COMMENT '引航员等级：1-三级，2-二级，3-一级，4-高级',
    qualification_cert VARCHAR(50) COMMENT '资质证书号',
    issue_date DATE COMMENT '证书签发日期',
    expiry_date DATE COMMENT '证书有效期',
    status INT NOT NULL DEFAULT 1 COMMENT '状态：0-离职，1-在岗，2-休假，3-培训',
    total_pilotage_count INT DEFAULT 0 COMMENT '累计引航次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pilot_level (pilot_level),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='引航员表';

-- 3. 引航员排班表
CREATE TABLE IF NOT EXISTS pilot_schedule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pilot_id BIGINT NOT NULL COMMENT '引航员ID',
    schedule_date DATE NOT NULL COMMENT '排班日期',
    shift_type INT NOT NULL COMMENT '班次：1-早班(08:00-16:00)，2-中班(16:00-24:00)，3-晚班(00:00-08:00)',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    is_on_call TINYINT DEFAULT 0 COMMENT '是否备班',
    status INT DEFAULT 1 COMMENT '状态：0-取消，1-正常，2-已完成',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id) REFERENCES pilot(id) ON DELETE CASCADE,
    UNIQUE KEY uk_pilot_shift (pilot_id, schedule_date, shift_type),
    INDEX idx_schedule_date (schedule_date),
    INDEX idx_pilot_date (pilot_id, schedule_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='引航员排班表';

-- 4. 潮汐数据表
CREATE TABLE IF NOT EXISTS tide (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tide_date DATE NOT NULL COMMENT '潮汐日期',
    tide_time TIME NOT NULL COMMENT '潮汐时间',
    tide_height DECIMAL(5,2) NOT NULL COMMENT '潮高（米）',
    tide_type INT NOT NULL COMMENT '潮汐类型：1-高潮，2-低潮',
    port VARCHAR(50) DEFAULT '主港区' COMMENT '港区',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_date_time (tide_date, tide_time, port),
    INDEX idx_tide_date (tide_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='潮汐数据表';

-- 5. 拖轮表
CREATE TABLE IF NOT EXISTS tug (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tug_name VARCHAR(50) NOT NULL COMMENT '拖轮名称',
    tug_code VARCHAR(20) UNIQUE NOT NULL COMMENT '拖轮编号',
    horsepower INT NOT NULL COMMENT '马力',
    bollard_pull DECIMAL(6,2) COMMENT '系柱拖力（吨）',
    status INT DEFAULT 1 COMMENT '状态：0-检修，1-可用，2-作业中',
    current_location VARCHAR(100) COMMENT '当前位置',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='拖轮表';

-- 6. 引航预约单（船公司提交的需求）
CREATE TABLE IF NOT EXISTS pilotage_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(30) UNIQUE NOT NULL COMMENT '预约单号',
    vessel_id BIGINT NOT NULL COMMENT '船舶ID',
    company_name VARCHAR(100) NOT NULL COMMENT '申请船公司',
    contact_person VARCHAR(50) COMMENT '联系人',
    contact_phone VARCHAR(20) COMMENT '联系电话',
    eta DATETIME NOT NULL COMMENT '预计抵港时间',
    eta_draft DECIMAL(6,2) NOT NULL COMMENT '抵港吃水',
    departure_port VARCHAR(100) COMMENT '上一港',
    destination_port VARCHAR(100) COMMENT '下一港',
    pilotage_type INT NOT NULL COMMENT '引航类型：1-进港，2-出港，3-移泊',
    berth_from VARCHAR(50) COMMENT '起始泊位',
    berth_to VARCHAR(50) COMMENT '目标泊位',
    special_requirements TEXT COMMENT '特殊要求',
    submit_time DATETIME NOT NULL COMMENT '提交时间',
    status INT DEFAULT 1 COMMENT '状态：0-已取消，1-待审核，2-已确认，3-作业中，4-已完成',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessel(id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_eta (eta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='引航预约单';

-- 7. 引航任务分配表
CREATE TABLE IF NOT EXISTS pilotage_assignment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_no VARCHAR(30) UNIQUE NOT NULL COMMENT '任务编号',
    order_id BIGINT NOT NULL COMMENT '预约单ID',
    pilot_id BIGINT NOT NULL COMMENT '引航员ID',
    tide_window_start DATETIME NOT NULL COMMENT '潮汐窗口开始',
    tide_window_end DATETIME NOT NULL COMMENT '潮汐窗口结束',
    planned_pilotage_time DATETIME NOT NULL COMMENT '计划引航时间',
    pilotage_distance DECIMAL(8,2) NOT NULL COMMENT '引航距离（海里）',
    tug_count INT DEFAULT 1 COMMENT '所需拖轮数量',
    status INT DEFAULT 1 COMMENT '状态：0-已取消，1-待执行，2-执行中，3-已完成，4-已顺延',
    is_extended TINYINT DEFAULT 0 COMMENT '是否顺延',
    original_assignment_id BIGINT COMMENT '原任务ID（顺延时关联）',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES pilotage_order(id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES pilot(id),
    FOREIGN KEY (original_assignment_id) REFERENCES pilotage_assignment(id),
    INDEX idx_assignment_no (assignment_no),
    INDEX idx_order_id (order_id),
    INDEX idx_pilot_id (pilot_id),
    INDEX idx_planned_time (planned_pilotage_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='引航任务分配表';

-- 8. 任务拖轮关联表
CREATE TABLE IF NOT EXISTS assignment_tug (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_id BIGINT NOT NULL COMMENT '任务ID',
    tug_id BIGINT NOT NULL COMMENT '拖轮ID',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES pilotage_assignment(id) ON DELETE CASCADE,
    FOREIGN KEY (tug_id) REFERENCES tug(id),
    UNIQUE KEY uk_assignment_tug (assignment_id, tug_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务拖轮关联表';

-- 9. 引航完成单
CREATE TABLE IF NOT EXISTS pilotage_completion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    completion_no VARCHAR(30) UNIQUE NOT NULL COMMENT '完成单号',
    assignment_id BIGINT NOT NULL COMMENT '任务ID',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    actual_distance DECIMAL(8,2) COMMENT '实际引航距离',
    pilotage_quality INT COMMENT '引航质量评分：1-5',
    delay_reason TEXT COMMENT '延误原因',
    weather_condition VARCHAR(100) COMMENT '天气情况',
    visibility DECIMAL(6,2) COMMENT '能见度（海里）',
    wind_speed DECIMAL(6,2) COMMENT '风速（节）',
    wave_height DECIMAL(5,2) COMMENT '浪高（米）',
    completion_status INT DEFAULT 1 COMMENT '完成状态：1-正常完成，2-延误完成，3-中断',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES pilotage_assignment(id) ON DELETE CASCADE,
    INDEX idx_completion_no (completion_no),
    INDEX idx_assignment_id (assignment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='引航完成单';

-- 10. 计费表
CREATE TABLE IF NOT EXISTS pilotage_billing (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    billing_no VARCHAR(30) UNIQUE NOT NULL COMMENT '账单编号',
    completion_id BIGINT NOT NULL COMMENT '完成单ID',
    order_id BIGINT NOT NULL COMMENT '预约单ID',
    vessel_id BIGINT NOT NULL COMMENT '船舶ID',
    net_tonnage DECIMAL(12,2) NOT NULL COMMENT '计费净吨位',
    pilotage_distance DECIMAL(8,2) NOT NULL COMMENT '计费引航距离',
    base_fee DECIMAL(12,2) NOT NULL COMMENT '基础费用',
    tonnage_fee DECIMAL(12,2) NOT NULL COMMENT '吨位费',
    distance_fee DECIMAL(12,2) NOT NULL COMMENT '里程费',
    tug_fee DECIMAL(12,2) COMMENT '拖轮费',
    night_surcharge DECIMAL(12,2) DEFAULT 0 COMMENT '夜间附加费',
    weekend_surcharge DECIMAL(12,2) DEFAULT 0 COMMENT '周末附加费',
    holiday_surcharge DECIMAL(12,2) DEFAULT 0 COMMENT '节假日附加费',
    other_fee DECIMAL(12,2) DEFAULT 0 COMMENT '其他费用',
    discount DECIMAL(12,2) DEFAULT 0 COMMENT '折扣',
    total_amount DECIMAL(12,2) NOT NULL COMMENT '总金额',
    billing_status INT DEFAULT 1 COMMENT '账单状态：1-待确认，2-已确认，3-已开票，4-已支付',
    billing_date DATE COMMENT '出账日期',
    paid_date DATE COMMENT '支付日期',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (completion_id) REFERENCES pilotage_completion(id),
    FOREIGN KEY (order_id) REFERENCES pilotage_order(id),
    FOREIGN KEY (vessel_id) REFERENCES vessel(id),
    INDEX idx_billing_no (billing_no),
    INDEX idx_order_id (order_id),
    INDEX idx_billing_status (billing_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='引航计费表';

-- 11. 系统通知表
CREATE TABLE IF NOT EXISTS system_notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_type INT NOT NULL COMMENT '通知类型：1-顺延通知，2-任务提醒，3-排班冲突，4-系统告警',
    recipient_type INT NOT NULL COMMENT '接收人类型：1-调度员，2-引航员，3-船公司',
    recipient_id BIGINT COMMENT '接收人ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    related_business_id BIGINT COMMENT '关联业务ID',
    related_business_type VARCHAR(50) COMMENT '关联业务类型',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读',
    read_at DATETIME COMMENT '阅读时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recipient (recipient_type, recipient_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统通知表';

-- 12. 系统用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真实姓名',
    role INT NOT NULL COMMENT '角色：1-管理员，2-调度员，3-引航员，4-船公司用户',
    phone VARCHAR(20) COMMENT '电话',
    email VARCHAR(100) COMMENT '邮箱',
    status INT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    last_login_time DATETIME COMMENT '最后登录时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 插入初始数据
-- 插入引航员数据
INSERT INTO pilot (employee_no, name, gender, phone, pilot_level, status) VALUES
('P001', '张三', '男', '13800138001', 3, 1),
('P002', '李四', '男', '13800138002', 3, 1),
('P003', '王五', '男', '13800138003', 2, 1),
('P004', '赵六', '男', '13800138004', 2, 1),
('P005', '钱七', '男', '13800138005', 1, 1),
('P006', '孙八', '男', '13800138006', 1, 1),
('P007', '周九', '男', '13800138007', 4, 1),
('P008', '吴十', '男', '13800138008', 3, 1);

-- 插入船舶数据
INSERT INTO vessel (vessel_name, imo_number, call_sign, vessel_type, gross_tonnage, net_tonnage, deadweight_tonnage, length_overall, breadth, maximum_draft, vessel_level, flag) VALUES
('中远之星', 'IMO9700001', 'BVJK8', '集装箱船', 95000.00, 52000.00, 120000.00, 335.00, 48.00, 14.50, 2, '巴拿马'),
('海运昌盛', 'IMO9700002', '9HA3772', '散货船', 45000.00, 28000.00, 82000.00, 229.00, 32.26, 12.30, 2, '香港'),
('明珠号', 'IMO9700003', 'VRDU5', '油轮', 75000.00, 42000.00, 110000.00, 250.00, 44.00, 13.80, 2, '新加坡'),
('顺达轮', 'IMO9700004', 'H3SA7', '集装箱船', 15000.00, 8500.00, 22000.00, 180.00, 28.00, 9.50, 1, '中国'),
('海逸号', 'IMO9700005', 'V7GB4', '散货船', 8000.00, 4500.00, 12000.00, 140.00, 22.00, 7.80, 1, '中国');

-- 插入拖轮数据
INSERT INTO tug (tug_name, tug_code, horsepower, bollard_pull, status) VALUES
('港拖1号', 'TG001', 5000, 65.00, 1),
('港拖2号', 'TG002', 5000, 65.00, 1),
('港拖3号', 'TG003', 6500, 80.00, 1),
('港拖4号', 'TG004', 4000, 50.00, 1),
('港拖5号', 'TG005', 8000, 95.00, 1);

-- 插入潮汐数据（模拟未来7天数据）
INSERT INTO tide (tide_date, tide_time, tide_height, tide_type, port) VALUES
-- 第1天
(CURDATE(), '00:15:00', 1.25, 2, '主港区'),
(CURDATE(), '06:32:00', 4.85, 1, '主港区'),
(CURDATE(), '12:48:00', 1.35, 2, '主港区'),
(CURDATE(), '19:05:00', 4.92, 1, '主港区'),
-- 第2天
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '00:58:00', 1.18, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:15:00', 4.90, 1, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:32:00', 1.28, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:48:00', 4.95, 1, '主港区'),
-- 第3天
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '01:42:00', 1.12, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '07:58:00', 4.95, 1, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:15:00', 1.22, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '20:32:00', 5.00, 1, '主港区'),
-- 第4天
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '02:25:00', 1.08, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '08:42:00', 4.98, 1, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:58:00', 1.18, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '21:15:00', 5.02, 1, '主港区'),
-- 第5天
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '03:08:00', 1.05, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '09:25:00', 5.00, 1, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '15:42:00', 1.15, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '21:58:00', 5.05, 1, '主港区'),
-- 第6天
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '03:52:00', 1.02, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '10:08:00', 5.02, 1, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '16:25:00', 1.12, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '22:42:00', 5.08, 1, '主港区'),
-- 第7天
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '04:35:00', 1.00, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '10:52:00', 5.05, 1, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '17:08:00', 1.10, 2, '主港区'),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '23:25:00', 5.10, 1, '主港区');

-- 插入引航员排班（模拟未来3天排班）
INSERT INTO pilot_schedule (pilot_id, schedule_date, shift_type, start_time, end_time, is_on_call, status) VALUES
-- 第1天排班
(1, CURDATE(), 1, CONCAT(CURDATE(), ' 08:00:00'), CONCAT(CURDATE(), ' 16:00:00'), 0, 1),
(2, CURDATE(), 1, CONCAT(CURDATE(), ' 08:00:00'), CONCAT(CURDATE(), ' 16:00:00'), 0, 1),
(3, CURDATE(), 2, CONCAT(CURDATE(), ' 16:00:00'), CONCAT(CURDATE(), ' 24:00:00'), 0, 1),
(4, CURDATE(), 2, CONCAT(CURDATE(), ' 16:00:00'), CONCAT(CURDATE(), ' 24:00:00'), 0, 1),
(5, CURDATE(), 3, CONCAT(CURDATE(), ' 00:00:00'), CONCAT(CURDATE(), ' 08:00:00'), 0, 1),
(6, CURDATE(), 3, CONCAT(CURDATE(), ' 00:00:00'), CONCAT(CURDATE(), ' 08:00:00'), 0, 1),
(7, CURDATE(), 1, CONCAT(CURDATE(), ' 08:00:00'), CONCAT(CURDATE(), ' 16:00:00'), 1, 1),
-- 第2天排班（避免连续两班）
(1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 3, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 00:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), 0, 1),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 24:00:00'), 0, 1),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), 0, 1),
(4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 3, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 00:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), 0, 1),
(5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 24:00:00'), 0, 1),
(6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), 0, 1),
(8, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 24:00:00'), 1, 1),
-- 第3天排班
(1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 24:00:00'), 0, 1),
(2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 3, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 00:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 08:00:00'), 0, 1),
(3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 24:00:00'), 0, 1),
(4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00'), 0, 1),
(5, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 3, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 00:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 08:00:00'), 0, 1),
(6, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 24:00:00'), 0, 1),
(7, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00'), 1, 1);

-- 插入系统用户（密码默认123456，使用BCrypt加密后的密码）
INSERT INTO sys_user (username, password, real_name, role, phone, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', 1, '13900139000', 1),
('dispatcher', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '调度员小王', 2, '13900139001', 1),
('pilot1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张三', 3, '13800138001', 1),
('company1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '中远海运', 4, '13900139002', 1);

-- 插入示例预约单
INSERT INTO pilotage_order (order_no, vessel_id, company_name, contact_person, contact_phone, eta, eta_draft, departure_port, pilotage_type, berth_to, special_requirements, submit_time, status) VALUES
('PO20260601001', 1, '中远海运集装箱运输有限公司', '王经理', '13800000001', DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 10 HOUR, 14.20, '上海港', 1, '3号集装箱泊位', '需备3条拖轮', NOW(), 2),
('PO20260601002', 2, '中外运散货运输有限公司', '李经理', '13800000002', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 14 HOUR, 12.00, '天津港', 1, '5号散货泊位', '', NOW(), 2),
('PO20260601003', 4, '本地港航物流', '赵经理', '13800000003', DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 8 HOUR, 9.20, '宁波港', 1, '2号通用泊位', '', NOW(), 1);
