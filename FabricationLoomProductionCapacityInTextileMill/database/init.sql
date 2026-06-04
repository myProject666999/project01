CREATE DATABASE IF NOT EXISTS loom_production DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE loom_production;

DROP TABLE IF EXISTS `maintenance_work_order`;
DROP TABLE IF EXISTS `maintenance_plan`;
DROP TABLE IF EXISTS `loom_execution_queue`;
DROP TABLE IF EXISTS `production_schedule`;
DROP TABLE IF EXISTS `production_order`;
DROP TABLE IF EXISTS `shift_report`;
DROP TABLE IF EXISTS `downtime_record`;
DROP TABLE IF EXISTS `downtime_reason`;
DROP TABLE IF EXISTS `oee_stats`;
DROP TABLE IF EXISTS `loom_realtime_data`;
DROP TABLE IF EXISTS `loom`;
DROP TABLE IF EXISTS `fabric_spec`;
DROP TABLE IF EXISTS `shift`;

CREATE TABLE `shift` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '班次名称，如早班、中班、晚班',
  `start_time` TIME NOT NULL COMMENT '班次开始时间',
  `end_time` TIME NOT NULL COMMENT '班次结束时间',
  `planned_hours` DECIMAL(4,2) NOT NULL DEFAULT 8.00 COMMENT '计划工作小时数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班次表';

CREATE TABLE `fabric_spec` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `spec_code` VARCHAR(100) NOT NULL COMMENT '规格编码',
  `spec_name` VARCHAR(200) NOT NULL COMMENT '规格名称',
  `fabric_type` VARCHAR(100) NOT NULL COMMENT '布料类型',
  `width` DECIMAL(8,2) COMMENT '门幅(cm)',
  `density` VARCHAR(100) COMMENT '密度',
  `yarn_count` VARCHAR(100) COMMENT '纱支',
  `weave_pattern` VARCHAR(100) COMMENT '组织结构',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_spec_code` (`spec_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='布料规格表';

CREATE TABLE `loom` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `loom_code` VARCHAR(50) NOT NULL COMMENT '织机编号',
  `brand` VARCHAR(100) NOT NULL COMMENT '品牌',
  `model` VARCHAR(100) COMMENT '型号',
  `location` VARCHAR(100) COMMENT '安装位置',
  `install_date` DATE COMMENT '安装日期',
  `max_speed` INT COMMENT '最高转速(rpm)',
  `rated_capacity` DECIMAL(10,2) COMMENT '额定产能(米/小时)',
  `process_params` JSON COMMENT '工艺参数配置',
  `compatible_specs` JSON COMMENT '兼容的布料规格ID列表',
  `maintenance_interval_hours` INT NOT NULL DEFAULT 2000 COMMENT '保养间隔小时数',
  `total_running_hours` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '累计运行小时数',
  `last_maintenance_date` DATETIME COMMENT '上次保养日期',
  `next_maintenance_date` DATETIME COMMENT '下次保养日期',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-启用 0-停用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_loom_code` (`loom_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='织机档案表';

CREATE TABLE `loom_realtime_data` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `loom_id` INT NOT NULL COMMENT '织机ID',
  `timestamp` DATETIME NOT NULL COMMENT '数据时间戳',
  `meterage` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '累计米数',
  `incremental_meters` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '本次增量米数',
  `running_status` TINYINT NOT NULL COMMENT '运行状态：1-运行 2-停机 3-故障',
  `speed` INT COMMENT '当前转速(rpm)',
  `defective_meters` DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '疵点米数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_loom_time` (`loom_id`, `timestamp`),
  KEY `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='织机实时数据表（聚合后）';

CREATE TABLE `downtime_reason` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `reason_code` VARCHAR(50) NOT NULL COMMENT '原因编码',
  `reason_name` VARCHAR(100) NOT NULL COMMENT '原因名称',
  `category` VARCHAR(50) NOT NULL COMMENT '分类：断纱、换轴、故障、其他',
  `description` VARCHAR(500) COMMENT '描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reason_code` (`reason_code`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='停机原因表';

CREATE TABLE `downtime_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `loom_id` INT NOT NULL COMMENT '织机ID',
  `shift_id` INT COMMENT '班次ID',
  `shift_date` DATE COMMENT '班次日期',
  `reason_id` INT NOT NULL COMMENT '停机原因ID',
  `start_time` DATETIME NOT NULL COMMENT '停机开始时间',
  `end_time` DATETIME COMMENT '停机结束时间',
  `duration_minutes` INT DEFAULT 0 COMMENT '停机时长(分钟)',
  `operator` VARCHAR(100) COMMENT '操作人员',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_loom_time` (`loom_id`, `start_time`),
  KEY `idx_shift` (`shift_id`, `shift_date`),
  KEY `idx_reason` (`reason_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='停机记录表';

CREATE TABLE `oee_stats` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `loom_id` INT NOT NULL COMMENT '织机ID',
  `shift_id` INT NOT NULL COMMENT '班次ID',
  `stat_date` DATE NOT NULL COMMENT '统计日期',
  `planned_production_time` INT NOT NULL DEFAULT 0 COMMENT '计划生产时间(分钟)',
  `actual_running_time` INT NOT NULL DEFAULT 0 COMMENT '实际运行时间(分钟)',
  `downtime` INT NOT NULL DEFAULT 0 COMMENT '停机时间(分钟)',
  `total_output` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '总产量(米)',
  `good_output` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '合格品产量(米)',
  `defective_output` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '不合格品产量(米)',
  `availability_rate` DECIMAL(5,2) COMMENT '时间稼动率 = 实际运行时间 / 计划时间',
  `performance_rate` DECIMAL(5,2) COMMENT '性能稼动率',
  `quality_rate` DECIMAL(5,2) COMMENT '良品率 = 合格品 / 总产量',
  `oee` DECIMAL(5,2) COMMENT 'OEE = 时间稼动率 * 性能稼动率 * 良品率',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_loom_shift_date` (`loom_id`, `shift_id`, `stat_date`),
  KEY `idx_stat_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='OEE统计表';

CREATE TABLE `shift_report` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `loom_id` INT NOT NULL COMMENT '织机ID',
  `shift_id` INT NOT NULL COMMENT '班次ID',
  `shift_date` DATE NOT NULL COMMENT '班次日期',
  `planned_output` DECIMAL(12,4) DEFAULT 0 COMMENT '计划产量(米)',
  `actual_output` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '实际产量(米)',
  `good_output` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '合格品(米)',
  `defective_output` DECIMAL(12,4) NOT NULL DEFAULT 0 COMMENT '不合格品(米)',
  `total_downtime` INT DEFAULT 0 COMMENT '总停机时间(分钟)',
  `downtime_breakdown` JSON COMMENT '停机原因明细汇总',
  `running_hours` DECIMAL(6,2) DEFAULT 0 COMMENT '运行时长(小时)',
  `average_speed` DECIMAL(8,2) DEFAULT 0 COMMENT '平均转速(rpm)',
  `oee_id` BIGINT COMMENT '关联OEE统计ID',
  `operator` VARCHAR(100) COMMENT '挡车工',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_loom_shift_date` (`loom_id`, `shift_id`, `shift_date`),
  KEY `idx_shift_date` (`shift_date`),
  KEY `idx_oee` (`oee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班产报表';

CREATE TABLE `production_order` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(100) NOT NULL COMMENT '订单号',
  `customer_name` VARCHAR(200) COMMENT '客户名称',
  `fabric_spec_id` INT NOT NULL COMMENT '布料规格ID',
  `total_length` DECIMAL(12,2) NOT NULL COMMENT '订单总米数',
  `urgency` TINYINT NOT NULL DEFAULT 1 COMMENT '紧急程度：1-普通 2-紧急 3-特急',
  `delivery_date` DATE COMMENT '交货日期',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待排产 1-排产中 2-生产中 3-已完成 4-已取消',
  `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级，数值越大优先级越高',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_status` (`status`),
  KEY `idx_delivery_date` (`delivery_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生产订单表';

CREATE TABLE `production_schedule` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `loom_id` INT NOT NULL COMMENT '织机ID',
  `scheduled_length` DECIMAL(12,2) NOT NULL COMMENT '排产米数',
  `completed_length` DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '已完成米数',
  `scheduled_start_date` DATE NOT NULL COMMENT '计划开始日期',
  `scheduled_end_date` DATE COMMENT '计划完成日期',
  `actual_start_date` DATETIME COMMENT '实际开始时间',
  `actual_end_date` DATETIME COMMENT '实际完成时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待生产 1-生产中 2-已完成 3-已暂停',
  `queue_position` INT DEFAULT 0 COMMENT '队列位置',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_loom_status` (`loom_id`, `status`),
  KEY `idx_scheduled_date` (`scheduled_start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排产计划表';

CREATE TABLE `loom_execution_queue` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `loom_id` INT NOT NULL COMMENT '织机ID',
  `schedule_id` BIGINT NOT NULL COMMENT '排产计划ID',
  `order_id` BIGINT NOT NULL COMMENT '订单ID',
  `fabric_spec_id` INT NOT NULL COMMENT '布料规格ID',
  `target_length` DECIMAL(12,2) NOT NULL COMMENT '目标米数',
  `position` INT NOT NULL COMMENT '队列顺序',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-排队中 1-当前生产 2-已完成',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_loom_status` (`loom_id`, `status`),
  KEY `idx_schedule` (`schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='织机执行队列';

CREATE TABLE `maintenance_plan` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `plan_name` VARCHAR(100) NOT NULL COMMENT '保养计划名称',
  `maintenance_type` VARCHAR(50) NOT NULL COMMENT '保养类型：日常、一级、二级、大修',
  `interval_hours` INT NOT NULL COMMENT '间隔运行小时数',
  `description` TEXT COMMENT '保养内容描述',
  `check_items` JSON COMMENT '检查项目列表',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保养计划表';

CREATE TABLE `maintenance_work_order` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `work_order_no` VARCHAR(100) NOT NULL COMMENT '工单号',
  `loom_id` INT NOT NULL COMMENT '织机ID',
  `maintenance_plan_id` INT COMMENT '保养计划ID',
  `maintenance_type` VARCHAR(50) NOT NULL COMMENT '保养类型',
  `trigger_type` VARCHAR(50) NOT NULL COMMENT '触发类型：自动(运行小时达标)、手动、故障',
  `trigger_running_hours` DECIMAL(12,2) COMMENT '触发时累计运行小时',
  `scheduled_date` DATE COMMENT '计划保养日期',
  `actual_start_date` DATETIME COMMENT '实际开始时间',
  `actual_end_date` DATETIME COMMENT '实际结束时间',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待处理 1-处理中 2-已完成 3-已取消',
  `check_results` JSON COMMENT '检查结果',
  `maintenance_content` TEXT COMMENT '保养内容',
  `replaced_parts` JSON COMMENT '更换配件',
  `operator` VARCHAR(100) COMMENT '保养人员',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_work_order_no` (`work_order_no`),
  KEY `idx_loom` (`loom_id`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled_date` (`scheduled_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保养工单表';

INSERT INTO `shift` (`name`, `start_time`, `end_time`, `planned_hours`) VALUES
('早班', '08:00:00', '16:00:00', 8.00),
('中班', '16:00:00', '00:00:00', 8.00),
('晚班', '00:00:00', '08:00:00', 8.00);

INSERT INTO `downtime_reason` (`reason_code`, `reason_name`, `category`) VALUES
('DS001', '经纱断', '断纱'),
('DS002', '纬纱断', '断纱'),
('DS003', '边纱断', '断纱'),
('HZ001', '换经轴', '换轴'),
('HZ002', '换卷布辊', '换轴'),
('GZ001', '机械故障', '故障'),
('GZ002', '电气故障', '故障'),
('GZ003', '气压故障', '故障'),
('QT001', '待料', '其他'),
('QT002', '调机', '其他'),
('QT003', '吃饭休息', '其他');

INSERT INTO `fabric_spec` (`spec_code`, `spec_name`, `fabric_type`, `width`, `density`, `yarn_count`, `weave_pattern`) VALUES
('SPEC001', '纯棉平纹布', '纯棉', 160.00, '133*72', '40*40', '平纹'),
('SPEC002', '涤棉斜纹布', '涤棉', 150.00, '120*60', '45*45', '斜纹'),
('SPEC003', '纯涤纶帆布', '化纤', 180.00, '100*50', '21*21', '帆布'),
('SPEC004', '人棉贡缎', '人棉', 145.00, '173*120', '60*60', '贡缎');

INSERT INTO `maintenance_plan` (`plan_name`, `maintenance_type`, `interval_hours`, `description`) VALUES
('日常保养', '日常', 8, '每班日常检查：清洁、润滑、紧固'),
('一级保养', '一级', 500, '一级保养：全面检查、易损件更换'),
('二级保养', '二级', 2000, '二级保养：解体检查、关键部件更换'),
('大修理', '大修', 8000, '大修理：全面解体、恢复精度');

DELIMITER //
CREATE PROCEDURE InsertLoomData()
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE brands TEXT DEFAULT '丰田,津田驹,必佳乐,舒美特';
  DECLARE brand_arr TEXT;
  DECLARE rand_brand VARCHAR(100);
  DECLARE rand_model VARCHAR(100);
  DECLARE rand_location VARCHAR(100);
  DECLARE rand_interval INT;
  DECLARE compatible JSON;
  
  WHILE i <= 200 DO
    SET brand_arr := brands;
    SET rand_brand := SUBSTRING_INDEX(SUBSTRING_INDEX(brand_arr, ',', FLOOR(1 + (RAND() * 4))), ',', -1);
    
    IF rand_brand = '丰田' THEN
      SET rand_model := CONCAT('JAT-', FLOOR(500 + (RAND() * 300)));
    ELSEIF rand_brand = '津田驹' THEN
      SET rand_model := CONCAT('ZW-', FLOOR(300 + (RAND() * 200)));
    ELSEIF rand_brand = '必佳乐' THEN
      SET rand_model := CONCAT('OMNI-', FLOOR(300 + (RAND() * 200)));
    ELSE
      SET rand_model := CONCAT('ST-', FLOOR(500 + (RAND() * 300)));
    END IF;
    
    SET rand_location := CONCAT('厂房A-', FLOOR(1 + (RAND() * 10)), '排-', LPAD(i, 3, '0'));
    SET rand_interval := FLOOR(1500 + (RAND() * 1000));
    SET compatible := JSON_ARRAY(1, 2, 3, 4);
    
    INSERT INTO `loom` (
      `loom_code`, `brand`, `model`, `location`, `install_date`, 
      `max_speed`, `rated_capacity`, `process_params`, `compatible_specs`,
      `maintenance_interval_hours`, `status`
    ) VALUES (
      CONCAT('L-', LPAD(i, 4, '0')),
      rand_brand,
      rand_model,
      rand_location,
      DATE_SUB(CURDATE(), INTERVAL FLOOR(30 + (RAND() * 700)) DAY),
      FLOOR(500 + (RAND() * 300)),
      ROUND(8 + (RAND() * 12), 2),
      JSON_OBJECT('tension', FLOOR(200 + (RAND() * 100)), 'temperature', ROUND(20 + (RAND() * 10), 1), 'humidity', ROUND(50 + (RAND() * 20), 1)),
      compatible,
      rand_interval,
      1
    );
    
    SET i = i + 1;
  END WHILE;
END //
DELIMITER ;

CALL InsertLoomData();
DROP PROCEDURE InsertLoomData;
