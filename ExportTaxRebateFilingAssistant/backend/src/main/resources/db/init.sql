CREATE DATABASE IF NOT EXISTS export_tax_rebate DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE export_tax_rebate;

DROP TABLE IF EXISTS declaration_progress;
DROP TABLE IF EXISTS declaration_detail;
DROP TABLE IF EXISTS declaration;
DROP TABLE IF EXISTS matching_result;
DROP TABLE IF EXISTS tax_rate;
DROP TABLE IF EXISTS vat_invoice;
DROP TABLE IF EXISTS customs_declaration;
DROP TABLE IF EXISTS matching_rule;
DROP TABLE IF EXISTS sys_user;

CREATE TABLE sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    real_name VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'OPERATOR',
    enabled TINYINT NOT NULL DEFAULT 1,
    last_login_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE customs_declaration (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    declaration_no VARCHAR(50) NOT NULL,
    hs_code VARCHAR(20) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(18,4) NOT NULL,
    unit VARCHAR(20),
    amount_usd DECIMAL(18,2),
    amount_cny DECIMAL(18,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    export_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_declaration_no (declaration_no),
    INDEX idx_hs_code (hs_code),
    INDEX idx_status (status),
    INDEX idx_export_date (export_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE vat_invoice (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(50) NOT NULL,
    invoice_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity DECIMAL(18,4) NOT NULL,
    unit VARCHAR(20),
    amount DECIMAL(18,2) NOT NULL,
    tax_amount DECIMAL(18,2) NOT NULL,
    seller_name VARCHAR(200),
    seller_tax_no VARCHAR(50),
    invoice_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_invoice_no (invoice_no),
    INDEX idx_invoice_code (invoice_code),
    INDEX idx_status (status),
    INDEX idx_invoice_date (invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE matching_result (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customs_id BIGINT NOT NULL,
    invoice_id BIGINT NOT NULL,
    match_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    match_type VARCHAR(20) NOT NULL DEFAULT 'AUTO',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    remark VARCHAR(500),
    confirmed_by BIGINT,
    confirmed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_customs_invoice (customs_id, invoice_id),
    INDEX idx_status (status),
    INDEX idx_match_type (match_type),
    CONSTRAINT fk_matching_customs FOREIGN KEY (customs_id) REFERENCES customs_declaration(id),
    CONSTRAINT fk_matching_invoice FOREIGN KEY (invoice_id) REFERENCES vat_invoice(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tax_rate (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hs_code VARCHAR(20) NOT NULL,
    product_name VARCHAR(200),
    tax_rate DECIMAL(5,4) NOT NULL,
    category VARCHAR(100),
    effective_date DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX uk_hs_code (hs_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE declaration (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    declaration_no VARCHAR(50) NOT NULL UNIQUE,
    period VARCHAR(10) NOT NULL,
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    total_tax_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_by BIGINT,
    submitted_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_period (period),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE declaration_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    declaration_id BIGINT NOT NULL,
    matching_id BIGINT NOT NULL,
    hs_code VARCHAR(20) NOT NULL,
    product_name VARCHAR(200),
    invoice_amount DECIMAL(18,2) NOT NULL,
    tax_rate DECIMAL(5,4) NOT NULL,
    tax_amount DECIMAL(18,2) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_detail_declaration FOREIGN KEY (declaration_id) REFERENCES declaration(id),
    CONSTRAINT fk_detail_matching FOREIGN KEY (matching_id) REFERENCES matching_result(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE declaration_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    declaration_id BIGINT NOT NULL,
    step_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    remark VARCHAR(500),
    operator_id BIGINT,
    operated_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_progress_declaration FOREIGN KEY (declaration_id) REFERENCES declaration(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE matching_rule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    name_similarity_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.70,
    amount_tolerance_rate DECIMAL(3,2) NOT NULL DEFAULT 0.05,
    quantity_tolerance_rate DECIMAL(3,2) NOT NULL DEFAULT 0.05,
    enabled TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO sys_user (username, password, real_name, role) VALUES 
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', 'ADMINISTRATOR'),
('operator', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '操作员', 'OPERATOR');

INSERT INTO matching_rule (rule_name, name_similarity_threshold, amount_tolerance_rate, quantity_tolerance_rate) 
VALUES ('默认匹配规则', 0.70, 0.05, 0.05);

INSERT INTO tax_rate (hs_code, product_name, tax_rate, category, effective_date) VALUES
('85171210', '智能手机', 0.1300, '电子产品', '2023-01-01'),
('84713000', '便携式自动数据处理设备', 0.1300, '计算机设备', '2023-01-01'),
('85287222', '彩色液晶显示器', 0.1300, '显示设备', '2023-01-01'),
('85258013', '高清数字摄像机', 0.1300, '摄像设备', '2023-01-01'),
('61102000', '棉制针织或钩编运动服', 0.1300, '纺织品', '2023-01-01'),
('62034290', '棉制男式长裤', 0.1300, '纺织品', '2023-01-01'),
('85076000', '锂离子蓄电池', 0.1700, '电池', '2023-01-01'),
('39269090', '其他塑料制品', 0.0900, '塑料制品', '2023-01-01'),
('73181590', '其他钢铁制螺钉螺栓螺母', 0.0900, '五金制品', '2023-01-01'),
('85444219', '额定电压不超过80伏的其他电缆', 0.1300, '电线电缆', '2023-01-01');

INSERT INTO customs_declaration (declaration_no, hs_code, product_name, quantity, unit, amount_usd, amount_cny, currency, export_date, status) VALUES
('BG2026060001', '85171210', '智能手机', 100.0000, '台', 45000.00, 315000.00, 'USD', '2026-06-01', 'PENDING'),
('BG2026060002', '84713000', '便携式自动数据处理设备', 50.0000, '台', 30000.00, 210000.00, 'USD', '2026-06-02', 'PENDING'),
('BG2026060003', '85287222', '彩色液晶显示器', 200.0000, '台', 28000.00, 196000.00, 'USD', '2026-06-03', 'PENDING'),
('BG2026060004', '85076000', '锂离子蓄电池', 500.0000, '个', 12500.00, 87500.00, 'USD', '2026-06-04', 'PENDING'),
('BG2026060005', '61102000', '棉制针织运动服', 1000.0000, '套', 18000.00, 126000.00, 'USD', '2026-06-05', 'PENDING'),
('BG2026060006', '62034290', '棉制男式长裤', 800.0000, '条', 12000.00, 84000.00, 'USD', '2026-06-06', 'PENDING'),
('BG2026060007', '85258013', '高清数字摄像机', 30.0000, '台', 15000.00, 105000.00, 'USD', '2026-06-07', 'PENDING'),
('BG2026060008', '39269090', '其他塑料制品', 2000.0000, '千克', 8000.00, 56000.00, 'USD', '2026-06-08', 'PENDING');

INSERT INTO vat_invoice (invoice_no, invoice_code, product_name, quantity, unit, amount, tax_amount, seller_name, seller_tax_no, invoice_date, status) VALUES
('FP000001', '1100253130', '智能手机', 100.0000, '台', 315000.00, 40950.00, '深圳市XX电子有限公司', '91440300MA5EXAMPLE', '2026-06-02', 'PENDING'),
('FP000002', '1100253130', '便携式自动数据处理设备', 50.0000, '台', 210000.00, 27300.00, '北京市XX科技有限公司', '91110000MA5EXAMPLE', '2026-06-03', 'PENDING'),
('FP000003', '1100253130', '彩色液晶显示屏', 200.0000, '台', 196000.00, 25480.00, '东莞市XX显示科技有限公司', '91441900MA5EXAMPLE', '2026-06-04', 'PENDING'),
('FP000004', '1100253130', '锂电池', 500.0000, '个', 87500.00, 11375.00, '惠州市XX电池有限公司', '91441300MA5EXAMPLE', '2026-06-05', 'PENDING'),
('FP000005', '1100253130', '棉制针织运动套装', 1000.0000, '套', 126000.00, 16380.00, '宁波市XX服装有限公司', '91330200MA5EXAMPLE', '2026-06-06', 'PENDING'),
('FP000006', '1100253130', '男士棉制长裤', 800.0000, '条', 84000.00, 10920.00, '温州市XX服饰有限公司', '91330300MA5EXAMPLE', '2026-06-07', 'PENDING'),
('FP000007', '1100253130', '高清数码摄像机', 30.0000, '台', 105000.00, 13650.00, '杭州市XX数码科技有限公司', '91330100MA5EXAMPLE', '2026-06-08', 'PENDING'),
('FP000008', '1100253130', '塑料配件', 2000.0000, '千克', 56000.00, 7280.00, '台州市XX塑料制品有限公司', '91331000MA5EXAMPLE', '2026-06-09', 'PENDING');
