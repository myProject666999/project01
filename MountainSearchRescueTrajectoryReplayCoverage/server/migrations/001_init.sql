CREATE DATABASE IF NOT EXISTS mountain_rescue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mountain_rescue;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE mission (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  status ENUM('planning', 'active', 'completed') NOT NULL DEFAULT 'planning',
  search_area JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE rescue_team (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  leader_id INT,
  color VARCHAR(20),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES member(id)
);

CREATE TABLE member (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  team_id INT NOT NULL,
  phone VARCHAR(20),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES rescue_team(id)
);

CREATE TABLE sub_area (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mission_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  boundary JSON,
  team_id INT,
  status ENUM('unassigned', 'searching', 'completed') NOT NULL DEFAULT 'unassigned',
  color VARCHAR(20),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mission_id) REFERENCES mission(id),
  FOREIGN KEY (team_id) REFERENCES rescue_team(id)
);

CREATE TABLE gps_point (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  mission_id INT NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  altitude DECIMAL(8, 2),
  speed DECIMAL(5, 2),
  timestamp DATETIME(3) NOT NULL,
  is_cached TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES member(id),
  FOREIGN KEY (mission_id) REFERENCES mission(id)
);

CREATE TABLE discovery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mission_id INT NOT NULL,
  member_id INT NOT NULL,
  type ENUM('footprint', 'clothing', 'person', 'other') NOT NULL,
  description TEXT,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  image_url VARCHAR(500),
  timestamp DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mission_id) REFERENCES mission(id),
  FOREIGN KEY (member_id) REFERENCES member(id)
);

CREATE INDEX idx_sub_area_mission_team ON sub_area(mission_id, team_id);
CREATE INDEX idx_member_team ON member(team_id);
CREATE INDEX idx_gps_point_member_mission ON gps_point(member_id, mission_id);
CREATE INDEX idx_gps_point_mission_timestamp ON gps_point(mission_id, timestamp);
CREATE INDEX idx_discovery_mission_type ON discovery(mission_id, type);
CREATE INDEX idx_discovery_mission_timestamp ON discovery(mission_id, timestamp);

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO rescue_team (id, name, color) VALUES
(1, '蓝鹰救援队', '#2196F3'),
(2, '红枫救援队', '#F44336'),
(3, '绿野救援队', '#4CAF50');

INSERT INTO member (id, name, team_id, phone) VALUES
(1, '张伟', 1, '13800001001'),
(2, '李明', 1, '13800001002'),
(3, '王强', 2, '13800002001'),
(4, '赵磊', 2, '13800002002'),
(5, '刘洋', 3, '13800003001'),
(6, '陈飞', 3, '13800003002');

UPDATE rescue_team SET leader_id = 1 WHERE id = 1;
UPDATE rescue_team SET leader_id = 3 WHERE id = 2;
UPDATE rescue_team SET leader_id = 5 WHERE id = 3;

INSERT INTO mission (id, name, status, search_area) VALUES
(1, '磨山失踪人员搜救行动', 'active', '{"type":"Polygon","coordinates":[[[114.2500,30.4500],[114.3500,30.4500],[114.3500,30.5500],[114.2500,30.5500],[114.2500,30.4500]]]}');

INSERT INTO sub_area (id, mission_id, name, boundary, team_id, status, color) VALUES
(1, 1, 'A区-西侧区域', '{"type":"Polygon","coordinates":[[[114.2500,30.4500],[114.3000,30.4500],[114.3000,30.5500],[114.2500,30.5500],[114.2500,30.4500]]]}', 1, 'searching', '#2196F3'),
(2, 1, 'B区-东北区域', '{"type":"Polygon","coordinates":[[[114.3000,30.5000],[114.3500,30.5000],[114.3500,30.5500],[114.3000,30.5500],[114.3000,30.5000]]]}', 2, 'searching', '#F44336'),
(3, 1, 'C区-东南区域', '{"type":"Polygon","coordinates":[[[114.3000,30.4500],[114.3500,30.4500],[114.3500,30.5000],[114.3000,30.5000],[114.3000,30.4500]]]}', 3, 'searching', '#4CAF50');

INSERT INTO gps_point (member_id, mission_id, lat, lng, altitude, speed, timestamp, is_cached) VALUES
(1, 1, 30.4780000, 114.2720000, 156.30, 1.20, '2026-06-04 08:00:00.000', 0),
(1, 1, 30.4800000, 114.2750000, 158.50, 1.50, '2026-06-04 08:10:00.000', 0),
(1, 1, 30.4830000, 114.2780000, 162.10, 0.80, '2026-06-04 08:20:00.000', 0),
(2, 1, 30.4950000, 114.2850000, 170.20, 1.00, '2026-06-04 08:00:00.000', 0),
(2, 1, 30.4980000, 114.2880000, 173.40, 1.30, '2026-06-04 08:10:00.000', 0),
(2, 1, 30.5020000, 114.2900000, 175.60, 0.90, '2026-06-04 08:20:00.000', 0),
(3, 1, 30.5050000, 114.3150000, 145.80, 1.40, '2026-06-04 08:00:00.000', 0),
(3, 1, 30.5100000, 114.3200000, 148.20, 1.10, '2026-06-04 08:10:00.000', 0),
(3, 1, 30.5150000, 114.3250000, 151.60, 1.60, '2026-06-04 08:20:00.000', 0),
(4, 1, 30.5200000, 114.3300000, 155.30, 0.70, '2026-06-04 08:00:00.000', 0),
(4, 1, 30.5250000, 114.3350000, 157.90, 1.20, '2026-06-04 08:10:00.000', 0),
(4, 1, 30.5300000, 114.3400000, 160.40, 1.00, '2026-06-04 08:20:00.000', 0),
(5, 1, 30.4600000, 114.3100000, 132.50, 1.80, '2026-06-04 08:00:00.000', 0),
(5, 1, 30.4650000, 114.3150000, 135.70, 1.50, '2026-06-04 08:10:00.000', 0),
(5, 1, 30.4700000, 114.3200000, 138.20, 1.30, '2026-06-04 08:20:00.000', 0),
(6, 1, 30.4750000, 114.3250000, 140.60, 1.10, '2026-06-04 08:00:00.000', 0),
(6, 1, 30.4800000, 114.3300000, 143.80, 0.90, '2026-06-04 08:10:00.000', 0),
(6, 1, 30.4850000, 114.3350000, 146.10, 1.40, '2026-06-04 08:20:00.000', 0);

INSERT INTO discovery (mission_id, member_id, type, description, lat, lng, image_url, timestamp) VALUES
(1, 1, 'footprint', '在A区西侧小径发现疑似失踪者脚印', 30.4810000, 114.2760000, '/images/discovery/footprint_001.jpg', '2026-06-04 08:15:00'),
(1, 4, 'clothing', '在B区东侧灌木丛中发现一件破损外套', 30.5220000, 114.3320000, '/images/discovery/clothing_001.jpg', '2026-06-04 08:18:00');
