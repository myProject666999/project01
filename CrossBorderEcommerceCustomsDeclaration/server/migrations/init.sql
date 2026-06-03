CREATE DATABASE IF NOT EXISTS customs_declaration
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE customs_declaration;

CREATE TABLE IF NOT EXISTS hs_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(16) NOT NULL,
    description VARCHAR(512) NOT NULL,
    category VARCHAR(255) NOT NULL DEFAULT '',
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    unit VARCHAR(32) NOT NULL DEFAULT '',
    remark VARCHAR(512) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    UNIQUE KEY uk_code (code),
    KEY idx_category (category),
    KEY idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='HS编码字典表';

CREATE TABLE IF NOT EXISTS category_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    hs_code VARCHAR(16) NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    auto_match TINYINT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    KEY idx_category (category),
    KEY idx_hs_code (hs_code),
    KEY idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品类目与HS编码映射表';

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    platform_order_id VARCHAR(128) NOT NULL,
    platform VARCHAR(32) NOT NULL COMMENT 'shopify/amazon',
    order_date DATETIME NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(16) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'pending/hs_matched/declared/released/rejected',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    UNIQUE KEY uk_platform_order (platform, platform_order_id),
    KEY idx_status (status),
    KEY idx_order_date (order_date),
    KEY idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='平台订单表';

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_name VARCHAR(512) NOT NULL,
    sku VARCHAR(128) NOT NULL,
    category VARCHAR(255) NOT NULL DEFAULT '',
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    hs_code VARCHAR(16) NOT NULL DEFAULT '',
    origin_country VARCHAR(64) NOT NULL DEFAULT 'CN',
    hs_matched TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    KEY idx_order_id (order_id),
    KEY idx_category (category),
    KEY idx_hs_matched (hs_matched),
    KEY idx_deleted_at (deleted_at),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品明细表';

CREATE TABLE IF NOT EXISTS declarations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    declaration_no VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft' COMMENT 'draft/submitted/reviewing/released/rejected',
    total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_quantity INT NOT NULL DEFAULT 0,
    reject_reason VARCHAR(1024) NOT NULL DEFAULT '',
    reject_type VARCHAR(32) NOT NULL DEFAULT '' COMMENT 'hs_code_error/amount_abnormal/name_irregular/other',
    submitted_at DATETIME NULL,
    reviewed_at DATETIME NULL,
    released_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    UNIQUE KEY uk_declaration_no (declaration_no),
    KEY idx_status (status),
    KEY idx_created_at (created_at),
    KEY idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='海关申报表';

CREATE TABLE IF NOT EXISTS declaration_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    declaration_id BIGINT NOT NULL,
    product_name VARCHAR(512) NOT NULL,
    hs_code VARCHAR(16) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    origin_country VARCHAR(64) NOT NULL DEFAULT 'CN',
    declaration_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    tax_no VARCHAR(64) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    KEY idx_declaration_id (declaration_id),
    KEY idx_deleted_at (deleted_at),
    CONSTRAINT fk_declaration_items_declaration FOREIGN KEY (declaration_id) REFERENCES declarations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='申报商品明细表';

CREATE TABLE IF NOT EXISTS declaration_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    declaration_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    UNIQUE KEY uk_decl_order (declaration_id, order_id),
    KEY idx_declaration_id (declaration_id),
    KEY idx_order_id (order_id),
    CONSTRAINT fk_declaration_orders_declaration FOREIGN KEY (declaration_id) REFERENCES declarations(id) ON DELETE CASCADE,
    CONSTRAINT fk_declaration_orders_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='申报与订单关联表';

CREATE TABLE IF NOT EXISTS tariff_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    declaration_id BIGINT NOT NULL,
    declaration_no VARCHAR(64) NOT NULL,
    tariff_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    currency VARCHAR(16) NOT NULL DEFAULT 'CNY',
    payment_status VARCHAR(16) NOT NULL DEFAULT 'unpaid' COMMENT 'unpaid/paid',
    payment_date DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    KEY idx_declaration_id (declaration_id),
    KEY idx_payment_status (payment_status),
    KEY idx_deleted_at (deleted_at),
    CONSTRAINT fk_tariff_records_declaration FOREIGN KEY (declaration_id) REFERENCES declarations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关税缴纳记录表';

CREATE TABLE IF NOT EXISTS tariff_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tariff_record_id BIGINT NOT NULL,
    hs_code VARCHAR(16) NOT NULL,
    tax_type VARCHAR(64) NOT NULL COMMENT '关税/增值税/消费税',
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    taxable_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    KEY idx_tariff_record_id (tariff_record_id),
    CONSTRAINT fk_tariff_items_tariff_record FOREIGN KEY (tariff_record_id) REFERENCES tariff_records(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关税明细表';

CREATE TABLE IF NOT EXISTS customs_archives (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    declaration_id BIGINT NOT NULL,
    declaration_no VARCHAR(64) NOT NULL,
    archive_no VARCHAR(64) NOT NULL,
    archive_date DATETIME NOT NULL,
    document_url VARCHAR(1024) NOT NULL DEFAULT '',
    status VARCHAR(32) NOT NULL DEFAULT 'archived',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_archive_no (archive_no),
    KEY idx_declaration_id (declaration_id),
    CONSTRAINT fk_customs_archives_declaration FOREIGN KEY (declaration_id) REFERENCES declarations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报关单存档表';

INSERT INTO hs_codes (code, description, category, tax_rate, unit, remark) VALUES
('611020', '棉制针织套头衫', '服装', 12.00, '件', '棉制针织或钩编的套头衫'),
('620342', '棉制男式长裤', '服装', 12.00, '条', '棉制男式长裤、工装裤等'),
('640399', '皮革制鞋靴', '鞋类', 15.00, '双', '皮革制面的其他鞋靴'),
('950300', '玩具', '玩具', 8.00, '个', '三轮车、玩偶等玩具'),
('420212', '塑料箱包', '箱包', 10.00, '个', '塑料或纺织材料制的箱包'),
('610910', '棉制T恤衫', '服装', 12.00, '件', '棉制针织T恤衫、汗衫等'),
('392410', '塑料餐具', '家居用品', 7.00, '套', '塑料制餐具及厨房用品'),
('950410', '电子游戏机', '电子产品', 13.00, '台', '视频游戏控制器及设备'),
('851712', '智能手机', '电子产品', 13.00, '台', '智能手机'),
('850440', '电源适配器', '电子产品', 10.00, '个', '静止式变流器'),
('901380', 'LCD显示屏', '电子产品', 8.00, '个', '液晶显示器件'),
('732393', '不锈钢餐具', '家居用品', 8.00, '套', '不锈钢制餐桌餐具'),
('620520', '棉制男衬衫', '服装', 12.00, '件', '棉制男式衬衫'),
('420222', '塑料手提包', '箱包', 10.00, '个', '塑料或纺织材料制手提包'),
('940350', '木制家具', '家具', 8.00, '件', '木制卧室家具'),
('940310', '金属家具', '家具', 8.00, '件', '金属制办公室家具'),
('847130', '笔记本电脑', '电子产品', 6.00, '台', '便携式自动数据处理设备'),
('852352', '半导体存储器', '电子产品', 0.00, '个', '半导体存储器(固态存储)'),
('330300', '香水', '化妆品', 15.00, '瓶', '香水及花露水'),
('330499', '护肤品', '化妆品', 10.00, '瓶', '其他美容或化妆品');

INSERT INTO category_mappings (category, hs_code, priority, auto_match) VALUES
('服装', '611020', 1, 1),
('服装', '620342', 2, 1),
('鞋类', '640399', 1, 1),
('玩具', '950300', 1, 1),
('箱包', '420212', 1, 1),
('家居用品', '392410', 1, 1),
('电子产品', '851712', 1, 1),
('家具', '940350', 1, 1),
('化妆品', '330300', 1, 1),
('化妆品', '330499', 2, 1);
