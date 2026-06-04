-- =====================================================
-- 民航行李分拣与异常处理系统 - 数据库初始化脚本
-- =====================================================

CREATE DATABASE IF NOT EXISTS civil_aviation_baggage
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE civil_aviation_baggage;

-- 旅客表
CREATE TABLE IF NOT EXISTS `passenger` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `id_number` VARCHAR(20) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_passenger_id_number` (`id_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 航班表
CREATE TABLE IF NOT EXISTS `flight` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `flight_no` VARCHAR(10) NOT NULL,
  `departure_city` VARCHAR(10) NOT NULL,
  `arrival_city` VARCHAR(10) NOT NULL,
  `scheduled_departure` DATETIME NOT NULL,
  `scheduled_arrival` DATETIME NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_flight_no` (`flight_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 行李表
CREATE TABLE IF NOT EXISTS `baggage` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tag_code` VARCHAR(10) NOT NULL,
  `passenger_id` INT NOT NULL,
  `flight_id` INT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'CHECKED_IN',
  `weight` DECIMAL(6,2) DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tag_code` (`tag_code`),
  KEY `idx_baggage_passenger` (`passenger_id`),
  KEY `idx_baggage_flight` (`flight_id`),
  KEY `idx_baggage_status` (`status`),
  CONSTRAINT `fk_baggage_passenger` FOREIGN KEY (`passenger_id`) REFERENCES `passenger` (`id`),
  CONSTRAINT `fk_baggage_flight` FOREIGN KEY (`flight_id`) REFERENCES `flight` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 行李扫描流水表
CREATE TABLE IF NOT EXISTS `baggage_scan_log` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `baggage_id` INT NOT NULL,
  `scan_location` VARCHAR(50) NOT NULL,
  `scan_time` DATETIME NOT NULL,
  `operator` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_scan_baggage` (`baggage_id`),
  KEY `idx_scan_time` (`scan_time`),
  CONSTRAINT `fk_scan_baggage` FOREIGN KEY (`baggage_id`) REFERENCES `baggage` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分拣口表
CREATE TABLE IF NOT EXISTS `sorting_port` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `port_code` VARCHAR(10) NOT NULL,
  `port_name` VARCHAR(50) NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_port_code` (`port_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分拣规则表（航班号→分拣口映射，按时段切换）
CREATE TABLE IF NOT EXISTS `sorting_rule` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `flight_no` VARCHAR(10) NOT NULL,
  `port_id` INT NOT NULL,
  `effective_start` DATETIME NOT NULL,
  `effective_end` DATETIME NOT NULL,
  `priority` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_rule_flight` (`flight_no`),
  KEY `idx_rule_port` (`port_id`),
  KEY `idx_rule_time` (`effective_start`, `effective_end`),
  CONSTRAINT `fk_rule_port` FOREIGN KEY (`port_id`) REFERENCES `sorting_port` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 异常工单表
CREATE TABLE IF NOT EXISTS `exception_order` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `baggage_id` INT NOT NULL,
  `exception_type` VARCHAR(20) NOT NULL COMMENT 'MISROUTED|DELAYED|DAMAGED|LOST',
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING|PROCESSING|RESOLVED|CLOSED',
  `description` TEXT DEFAULT NULL,
  `handler` VARCHAR(50) DEFAULT NULL,
  `sla_deadline` DATETIME DEFAULT NULL,
  `resolution` TEXT DEFAULT NULL,
  `resolved_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_exception_baggage` (`baggage_id`),
  KEY `idx_exception_type` (`exception_type`),
  KEY `idx_exception_status` (`status`),
  KEY `idx_exception_sla` (`sla_deadline`),
  CONSTRAINT `fk_exception_baggage` FOREIGN KEY (`baggage_id`) REFERENCES `baggage` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 旅客通知表
CREATE TABLE IF NOT EXISTS `passenger_notification` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `passenger_id` INT NOT NULL,
  `exception_order_id` INT DEFAULT NULL,
  `content` TEXT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'SENT',
  `sent_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_notification_passenger` (`passenger_id`),
  KEY `idx_notification_order` (`exception_order_id`),
  CONSTRAINT `fk_notification_passenger` FOREIGN KEY (`passenger_id`) REFERENCES `passenger` (`id`),
  CONSTRAINT `fk_notification_order` FOREIGN KEY (`exception_order_id`) REFERENCES `exception_order` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 初始数据
-- =====================================================

INSERT INTO `passenger` (`name`, `id_number`, `phone`) VALUES
('张三', '110101199001011234', '13800138001'),
('李四', '110101199002022345', '13800138002'),
('王五', '110101199003033456', '13800138003'),
('赵六', '110101199004044567', '13800138004'),
('钱七', '110101199005055678', '13800138005');

INSERT INTO `flight` (`flight_no`, `departure_city`, `arrival_city`, `scheduled_departure`, `scheduled_arrival`, `status`) VALUES
('CA1234', '北京', '上海', '2026-06-04 08:00:00', '2026-06-04 10:30:00', 'SCHEDULED'),
('MU5678', '北京', '广州', '2026-06-04 09:00:00', '2026-06-04 12:00:00', 'SCHEDULED'),
('CZ3456', '北京', '成都', '2026-06-04 10:00:00', '2026-06-04 13:00:00', 'SCHEDULED'),
('HU7890', '北京', '深圳', '2026-06-04 11:00:00', '2026-06-04 14:00:00', 'SCHEDULED'),
('CA2468', '北京', '杭州', '2026-06-04 14:00:00', '2026-06-04 16:30:00', 'SCHEDULED'),
('MU1357', '上海', '北京', '2026-06-04 15:00:00', '2026-06-04 17:30:00', 'SCHEDULED'),
('CZ9753', '广州', '北京', '2026-06-04 16:00:00', '2026-06-04 19:00:00', 'SCHEDULED');

INSERT INTO `baggage` (`tag_code`, `passenger_id`, `flight_id`, `status`, `weight`) VALUES
('0000000001', 1, 1, 'CHECKED_IN', 22.50),
('0000000002', 1, 1, 'SORTED', 15.00),
('0000000003', 2, 2, 'CHECKED_IN', 18.30),
('0000000004', 3, 3, 'SORTED', 25.00),
('0000000005', 4, 4, 'LOADED', 12.00),
('0000000006', 5, 5, 'CHECKED_IN', 20.00),
('0000000007', 2, 2, 'MISROUTED', 17.50),
('0000000008', 3, 1, 'DELAYED', 30.00),
('0000000009', 4, 6, 'DAMAGED', 14.00),
('0000000010', 5, 7, 'LOST', 19.50);

INSERT INTO `baggage_scan_log` (`baggage_id`, `scan_location`, `scan_time`, `operator`) VALUES
(1, '值机柜台A01', '2026-06-04 06:30:00', '员工001'),
(1, '安检传输带', '2026-06-04 06:35:00', '系统'),
(1, '分拣区入口', '2026-06-04 06:40:00', '系统'),
(2, '值机柜台A02', '2026-06-04 06:45:00', '员工002'),
(2, '分拣区入口', '2026-06-04 06:50:00', '系统'),
(3, '值机柜台B01', '2026-06-04 07:00:00', '员工003'),
(7, '值机柜台B01', '2026-06-04 07:05:00', '员工003'),
(7, '分拣区入口', '2026-06-04 07:10:00', '系统'),
(7, '错运滑槽C03', '2026-06-04 07:15:00', '系统'),
(9, '值机柜台C01', '2026-06-04 07:20:00', '员工004'),
(9, '分拣区入口', '2026-06-04 07:25:00', '系统'),
(9, '装卸区', '2026-06-04 07:30:00', '员工005');

INSERT INTO `sorting_port` (`port_code`, `port_name`, `status`) VALUES
('P01', '1号滑槽', 'ACTIVE'),
('P02', '2号滑槽', 'ACTIVE'),
('P03', '3号滑槽', 'ACTIVE'),
('P04', '4号滑槽', 'ACTIVE'),
('P05', '5号滑槽', 'ACTIVE'),
('P06', '6号滑槽', 'ACTIVE'),
('P07', '7号滑槽', 'ACTIVE'),
('P08', '8号滑槽', 'INACTIVE');

INSERT INTO `sorting_rule` (`flight_no`, `port_id`, `effective_start`, `effective_end`, `priority`) VALUES
('CA1234', 1, '2026-06-04 06:00:00', '2026-06-04 10:00:00', 10),
('MU5678', 2, '2026-06-04 06:00:00', '2026-06-04 11:00:00', 10),
('CZ3456', 3, '2026-06-04 07:00:00', '2026-06-04 12:00:00', 10),
('HU7890', 4, '2026-06-04 08:00:00', '2026-06-04 13:00:00', 10),
('CA2468', 5, '2026-06-04 10:00:00', '2026-06-04 16:00:00', 10),
('MU1357', 1, '2026-06-04 12:00:00', '2026-06-04 17:00:00', 5),
('CZ9753', 2, '2026-06-04 13:00:00', '2026-06-04 19:00:00', 5);

INSERT INTO `exception_order` (`baggage_id`, `exception_type`, `status`, `description`, `handler`, `sla_deadline`, `resolution`, `resolved_at`) VALUES
(7, 'MISROUTED', 'PROCESSING', '行李被送至C03滑槽，应送往P02滑槽（MU5678航班）', '处理员A', '2026-06-04 09:15:00', NULL, NULL),
(8, 'DELAYED', 'PENDING', '旅客已抵达北京，行李未随机到达', NULL, '2026-06-04 14:00:00', NULL, NULL),
(9, 'DAMAGED', 'PROCESSING', '行李箱外壳破损，轮子脱落', '处理员B', '2026-06-04 13:25:00', NULL, NULL),
(10, 'LOST', 'PENDING', '行李在分拣区后无扫描记录，疑似丢失', NULL, '2026-06-04 20:00:00', NULL, NULL);

INSERT INTO `passenger_notification` (`passenger_id`, `exception_order_id`, `content`, `status`) VALUES
(2, 1, '尊敬的李四先生/女士，您的行李（牌号0000000007）因分拣异常正在处理中，预计9:15前完成，请耐心等待。', 'SENT'),
(3, 2, '尊敬的王五先生/女士，您的行李（牌号0000000008）未能随机到达，我们正在紧急处理中。', 'SENT'),
(4, 3, '尊敬的赵六先生/女士，您的行李（牌号0000000009）在运输中出现破损，请前往行李服务台处理。', 'SENT'),
(5, 4, '尊敬的钱七先生/女士，您的行李（牌号0000000010）目前无法定位，我们正在全力查找中。', 'SENT');
