CREATE DATABASE IF NOT EXISTS wastewater_monitoring DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wastewater_monitoring;

DROP TABLE IF EXISTS discharge_point;
CREATE TABLE discharge_point (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    point_code VARCHAR(50) NOT NULL UNIQUE COMMENT '排放点编号',
    point_name VARCHAR(100) NOT NULL COMMENT '排放点名称',
    location VARCHAR(200) NOT NULL COMMENT '位置',
    description VARCHAR(500) COMMENT '描述',
    cod_threshold DECIMAL(10,2) NOT NULL DEFAULT 500.00 COMMENT 'COD阈值 mg/L',
    ph_min_threshold DECIMAL(5,2) NOT NULL DEFAULT 6.00 COMMENT 'pH最小值',
    ph_max_threshold DECIMAL(5,2) NOT NULL DEFAULT 9.00 COMMENT 'pH最大值',
    color_threshold DECIMAL(10,2) NOT NULL DEFAULT 80.00 COMMENT '色度阈值 倍',
    ammonia_threshold DECIMAL(10,2) NOT NULL DEFAULT 45.00 COMMENT '氨氮阈值 mg/L',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态 0-停机 1-正常运行',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排放点档案表';

DROP TABLE IF EXISTS monitor_data;
CREATE TABLE monitor_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    point_id BIGINT NOT NULL COMMENT '排放点ID',
    point_code VARCHAR(50) NOT NULL COMMENT '排放点编号',
    cod_value DECIMAL(10,2) NOT NULL COMMENT 'COD值 mg/L',
    ph_value DECIMAL(5,2) NOT NULL COMMENT 'pH值',
    color_value DECIMAL(10,2) NOT NULL COMMENT '色度值 倍',
    ammonia_value DECIMAL(10,2) NOT NULL COMMENT '氨氮值 mg/L',
    is_over_limit TINYINT NOT NULL DEFAULT 0 COMMENT '是否超标 0-正常 1-超标',
    over_limit_indicators VARCHAR(200) COMMENT '超标指标，逗号分隔',
    monitor_time DATETIME NOT NULL COMMENT '监测时间',
    report_status TINYINT NOT NULL DEFAULT 0 COMMENT '报送状态 0-待报送 1-已报送 2-报送失败',
    report_time DATETIME COMMENT '报送时间',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_point_id (point_id),
    INDEX idx_monitor_time (monitor_time),
    INDEX idx_over_limit (is_over_limit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='监测数据表';

DROP TABLE IF EXISTS alarm_record;
CREATE TABLE alarm_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    point_id BIGINT NOT NULL COMMENT '排放点ID',
    point_code VARCHAR(50) NOT NULL COMMENT '排放点编号',
    indicator VARCHAR(30) NOT NULL COMMENT '超标指标 COD/pH/COLOR/AMMONIA',
    indicator_name VARCHAR(30) NOT NULL COMMENT '指标名称',
    current_value DECIMAL(10,2) NOT NULL COMMENT '当前值',
    threshold_value DECIMAL(10,2) NOT NULL COMMENT '阈值',
    alarm_level TINYINT NOT NULL DEFAULT 1 COMMENT '报警级别 1-预警 2-严重',
    continuous_minutes INT NOT NULL DEFAULT 0 COMMENT '连续超标分钟数',
    monitor_time DATETIME NOT NULL COMMENT '监测时间',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_point_id (point_id),
    INDEX idx_alarm_level (alarm_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报警记录表';

DROP TABLE IF EXISTS shutdown_order;
CREATE TABLE shutdown_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '停机指令编号',
    point_id BIGINT NOT NULL COMMENT '排放点ID',
    point_code VARCHAR(50) NOT NULL COMMENT '排放点编号',
    trigger_indicator VARCHAR(30) NOT NULL COMMENT '触发指标',
    trigger_indicator_name VARCHAR(30) NOT NULL COMMENT '触发指标名称',
    trigger_value DECIMAL(10,2) NOT NULL COMMENT '触发值',
    threshold_value DECIMAL(10,2) NOT NULL COMMENT '阈值',
    continuous_minutes INT NOT NULL COMMENT '连续超标分钟数',
    order_status TINYINT NOT NULL DEFAULT 0 COMMENT '指令状态 0-待确认 1-已确认 2-已执行 3-已复产',
    operator_name VARCHAR(50) COMMENT '操作工姓名',
    confirm_time DATETIME COMMENT '确认时间',
    execute_time DATETIME COMMENT '执行停机时间',
    reason_analysis TEXT COMMENT '原因分析',
    process_adjustment TEXT COMMENT '工艺调整措施',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_point_id (point_id),
    INDEX idx_order_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='停机指令表';

DROP TABLE IF EXISTS recovery_application;
CREATE TABLE recovery_application (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    application_no VARCHAR(50) NOT NULL UNIQUE COMMENT '申请编号',
    shutdown_order_id BIGINT NOT NULL COMMENT '停机指令ID',
    point_id BIGINT NOT NULL COMMENT '排放点ID',
    point_code VARCHAR(50) NOT NULL COMMENT '排放点编号',
    applicant VARCHAR(50) NOT NULL COMMENT '申请人',
    reason_handled TEXT NOT NULL COMMENT '问题处理情况说明',
    test_report VARCHAR(500) COMMENT '检测报告附件路径',
    application_status TINYINT NOT NULL DEFAULT 0 COMMENT '申请状态 0-待审核 1-审核通过 2-审核驳回',
    approver VARCHAR(50) COMMENT '审核人',
    approval_opinion VARCHAR(500) COMMENT '审核意见',
    approval_time DATETIME COMMENT '审核时间',
    recovery_time DATETIME COMMENT '复产时间',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_shutdown_order_id (shutdown_order_id),
    INDEX idx_application_status (application_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='复产申请表';

DROP TABLE IF EXISTS env_report_record;
CREATE TABLE env_report_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    monitor_data_id BIGINT NOT NULL COMMENT '监测数据ID',
    point_id BIGINT NOT NULL COMMENT '排放点ID',
    point_code VARCHAR(50) NOT NULL COMMENT '排放点编号',
    report_content TEXT COMMENT '报送内容(JSON格式)',
    report_status TINYINT NOT NULL DEFAULT 0 COMMENT '报送状态 0-待报送 1-已报送 2-报送失败',
    report_time DATETIME COMMENT '报送时间',
    response_content TEXT COMMENT '平台响应内容',
    retry_count INT NOT NULL DEFAULT 0 COMMENT '重试次数',
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_monitor_data_id (monitor_data_id),
    INDEX idx_report_status (report_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='环保平台报送记录表';

INSERT INTO discharge_point (point_code, point_name, location, description, 
    cod_threshold, ph_min_threshold, ph_max_threshold, color_threshold, ammonia_threshold, status) VALUES
('DP001', '印染一车间排放口', '厂区东北角#1排放口', '印染一车间综合废水排放口，主要包含退浆、煮炼、漂白废水',
    500.00, 6.00, 9.00, 80.00, 45.00, 1),
('DP002', '印染二车间排放口', '厂区东北角#2排放口', '印染二车间综合废水排放口，主要包含染色、印花、整理废水',
    500.00, 6.00, 9.00, 80.00, 45.00, 1),
('DP003', '污水处理站总排放口', '厂区西南角总排放口', '全厂废水处理后总排放口，排入市政污水管网',
    100.00, 6.50, 8.50, 30.00, 15.00, 1);
