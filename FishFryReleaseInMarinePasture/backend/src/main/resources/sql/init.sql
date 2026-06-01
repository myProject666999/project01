CREATE DATABASE IF NOT EXISTS fish_fry_release
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE fish_fry_release;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'OPERATOR',
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE sea_area (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    area_code VARCHAR(20) UNIQUE NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    area_size DECIMAL(10,2),
    longitude DECIMAL(10,6),
    latitude DECIMAL(10,6),
    description VARCHAR(500),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE species (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    species_name VARCHAR(100) NOT NULL,
    species_code VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(50),
    description VARCHAR(500),
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE release_plan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    area_id BIGINT NOT NULL,
    species_id BIGINT NOT NULL,
    plan_year INT NOT NULL,
    plan_season VARCHAR(20) NOT NULL,
    plan_quantity BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    remarks VARCHAR(500),
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES sea_area(id),
    FOREIGN KEY (species_id) REFERENCES species(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id)
);

CREATE TABLE release_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_id BIGINT,
    area_id BIGINT NOT NULL,
    species_id BIGINT NOT NULL,
    vessel_name VARCHAR(100) NOT NULL,
    weather_condition VARCHAR(100),
    release_time DATETIME NOT NULL,
    actual_quantity BIGINT NOT NULL,
    remarks VARCHAR(500),
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES release_plan(id),
    FOREIGN KEY (area_id) REFERENCES sea_area(id),
    FOREIGN KEY (species_id) REFERENCES species(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id)
);

CREATE TABLE recapture_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    area_id BIGINT NOT NULL,
    species_id BIGINT NOT NULL,
    vessel_name VARCHAR(100) NOT NULL,
    size_grade VARCHAR(20),
    catch_weight DECIMAL(10,2) NOT NULL,
    catch_count INT NOT NULL,
    catch_date DATE NOT NULL,
    remarks VARCHAR(500),
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES sea_area(id),
    FOREIGN KEY (species_id) REFERENCES species(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id)
);

CREATE TABLE water_quality (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    area_id BIGINT NOT NULL,
    salinity DECIMAL(5,2),
    temperature DECIMAL(5,2),
    dissolved_oxygen DECIMAL(5,2),
    ph_value DECIMAL(4,2),
    monitor_time DATETIME NOT NULL,
    remarks VARCHAR(500),
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (area_id) REFERENCES sea_area(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id)
);

INSERT INTO sys_user (username, password, real_name, role, status) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员', 'ADMIN', 1),
('operator', 'e10adc3949ba59abbe56e057f20f883e', '操作员', 'OPERATOR', 1);

INSERT INTO sea_area (area_code, area_name, area_size, longitude, latitude, description, status) VALUES
('A001', '东湾一号牧场', 1200.50, 121.854300, 29.876500, '位于舟山东湾近海海域，水深8-15米，底质为砂泥混合', 1),
('A002', '南礁二号牧场', 850.00, 122.103600, 29.652100, '位于舟山南礁外侧海域，水深12-20米，礁石区与沙地交错', 1),
('A003', '西滩三号牧场', 980.75, 121.592800, 30.021400, '位于舟山西滩浅海区域，水深5-12米，滩涂与浅水区过渡带', 1);

INSERT INTO species (species_name, species_code, category, description, status) VALUES
('大黄鱼', 'SP001', '鱼类', '石首鱼科，传统海洋经济鱼类，肉质鲜嫩，为东海重要增殖放流品种', 1),
('黑鲷', 'SP002', '鱼类', '鲷科，近海底层鱼类，适应性强，适合礁区放流', 1),
('鲈鱼', 'SP003', '鱼类', '花鲈，广盐性鱼类，生长迅速，海洋牧场常见放流品种', 1),
('三疣梭子蟹', 'SP004', '甲壳类', '梭子蟹科，东海重要经济甲壳类，底栖生活，适合沙泥底质海域放流', 1),
('日本对虾', 'SP005', '甲壳类', '对虾科，生长周期短，经济价值高，适合浅海沙底海域增殖', 1);

INSERT INTO release_plan (area_id, species_id, plan_year, plan_season, plan_quantity, status, remarks, created_by) VALUES
(1, 1, 2026, '春季', 500000, 'ACTIVE', '2026年东湾大黄鱼春季增殖放流计划', 1),
(1, 4, 2026, '夏季', 300000, 'DRAFT', '2026年东湾梭子蟹夏季增殖放流计划', 1),
(2, 2, 2026, '春季', 200000, 'COMPLETED', '2026年南礁黑鲷春季增殖放流计划', 1),
(2, 5, 2026, '夏季', 400000, 'ACTIVE', '2026年南礁日本对虾夏季增殖放流计划', 1),
(3, 3, 2026, '春季', 150000, 'COMPLETED', '2026年西滩鲈鱼春季增殖放流计划', 1),
(3, 1, 2026, '夏季', 350000, 'DRAFT', '2026年西滩大黄鱼夏季增殖放流计划', 2);

INSERT INTO release_record (plan_id, area_id, species_id, vessel_name, weather_condition, release_time, actual_quantity, remarks, created_by) VALUES
(1, 1, 1, '浙岱渔05188', '东南风3级，晴，能见度良好', '2026-03-15 08:30:00', 520000, '实际放流量略超计划', 1),
(3, 2, 2, '浙嵊渔07231', '东风2级，多云，海面平稳', '2026-03-20 09:00:00', 198000, '放流过程顺利', 1),
(5, 3, 3, '浙定渔03456', '北风3级，阴，轻浪', '2026-03-22 07:45:00', 155000, '鲈鱼苗种活力良好', 1),
(1, 1, 1, '浙岱渔05188', '东风2级，晴，海况优良', '2026-04-10 08:00:00', 480000, '补充放流批次', 2),
(3, 2, 2, '浙嵊渔07231', '东南风3级，多云转晴', '2026-04-18 09:30:00', 210000, '第二批补充放流', 2),
(1, 1, 1, '浙普渔06012', '南风2级，晴，微风', '2026-05-05 08:15:00', 300000, '春季最后一批放流', 1),
(4, 2, 5, '浙嵊渔07231', '南风3级，晴间多云', '2026-06-10 09:00:00', 410000, '对虾苗种规格整齐', 1),
(5, 3, 3, '浙定渔03456', '东风2级，多云', '2026-06-15 08:30:00', 160000, '鲈鱼苗平均体长8cm', 2);

INSERT INTO recapture_record (area_id, species_id, vessel_name, size_grade, catch_weight, catch_count, catch_date, remarks, created_by) VALUES
(1, 1, '浙岱渔05188', '大', 1250.50, 3200, '2026-05-20', '回捕大黄鱼个体均重约390g，生长状况良好', 1),
(1, 1, '浙岱渔05188', '中', 860.00, 4100, '2026-06-05', '中等规格大黄鱼回捕', 1),
(1, 4, '浙普渔06012', '大', 520.30, 2800, '2026-07-15', '梭子蟹回捕个体饱满', 1),
(2, 2, '浙嵊渔07231', '中', 430.80, 1950, '2026-05-28', '黑鲷回捕规格中等', 1),
(2, 2, '浙嵊渔07231', '小', 185.60, 2200, '2026-06-12', '小规格黑鲷回捕，建议继续保护', 1),
(2, 5, '浙嵊渔07231', '大', 310.20, 5600, '2026-07-20', '日本对虾回捕率较高', 2),
(3, 3, '浙定渔03456', '大', 680.90, 980, '2026-06-01', '鲈鱼回捕个体较大', 1),
(3, 3, '浙定渔03456', '中', 390.50, 1320, '2026-06-18', '中等规格鲈鱼回捕', 1),
(3, 1, '浙定渔03456', '小', 210.40, 2600, '2026-07-10', '小规格大黄鱼回捕', 2),
(1, 4, '浙岱渔05188', '中', 340.70, 1900, '2026-08-01', '梭子蟹中等规格回捕', 2);

INSERT INTO water_quality (area_id, salinity, temperature, dissolved_oxygen, ph_value, monitor_time, remarks, created_by) VALUES
(1, 28.50, 16.30, 7.80, 8.15, '2026-03-10 10:00:00', '春季常规监测', 1),
(1, 30.20, 18.50, 7.50, 8.10, '2026-04-15 10:30:00', '春季常规监测', 1),
(1, 22.80, 24.60, 4.80, 7.95, '2026-06-20 11:00:00', '溶解氧偏低，需关注', 2),
(1, 31.50, 27.30, 6.20, 8.05, '2026-07-15 10:00:00', '夏季常规监测', 1),
(1, 33.10, 29.50, 5.90, 8.00, '2026-08-10 11:30:00', '高温期监测', 2),
(2, 29.80, 15.80, 8.10, 8.20, '2026-03-12 09:30:00', '春季常规监测', 1),
(2, 32.50, 22.40, 6.90, 8.05, '2026-05-18 10:00:00', '盐度偏高', 1),
(2, 38.20, 25.80, 6.50, 7.90, '2026-07-08 10:30:00', '盐度异常偏高，超出正常范围', 2),
(2, 29.00, 28.60, 5.80, 7.85, '2026-08-05 11:00:00', '夏季高温期监测', 1),
(3, 26.30, 17.20, 7.60, 8.25, '2026-03-15 09:00:00', '春季常规监测', 1),
(3, 19.50, 21.80, 7.20, 8.10, '2026-05-20 10:00:00', '盐度偏低，可能受陆源淡水影响', 2),
(3, 27.80, 25.40, 4.50, 7.80, '2026-06-25 11:00:00', '溶解氧偏低，需加强监测', 1),
(3, 28.60, 32.50, 5.20, 7.75, '2026-07-22 10:30:00', '水温超出适宜范围，需关注', 2),
(3, 26.90, 27.80, 6.10, 7.95, '2026-08-15 10:00:00', '夏季常规监测', 1),
(1, 36.80, 19.20, 7.00, 8.08, '2026-09-01 09:30:00', '盐度偏高，需持续监测', 2);
