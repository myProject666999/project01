CREATE DATABASE IF NOT EXISTS antique_auction DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE antique_auction;

-- 用户表（系统管理员、工作人员）
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    phone VARCHAR(20),
    email VARCHAR(100),
    status TINYINT NOT NULL DEFAULT 1 COMMENT '1:启用 0:禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 拍卖会表
CREATE TABLE IF NOT EXISTS auctions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL COMMENT '拍卖会名称',
    auction_no VARCHAR(50) NOT NULL UNIQUE COMMENT '拍卖会编号',
    preview_start_date DATE COMMENT '预展开始日期',
    preview_end_date DATE COMMENT '预展结束日期',
    preview_location VARCHAR(200) COMMENT '预展地点',
    auction_date DATETIME NOT NULL COMMENT '拍卖日期',
    auction_location VARCHAR(200) COMMENT '拍卖地点',
    status ENUM('draft', 'preview', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'draft',
    description TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_auction_no (auction_no),
    INDEX idx_status (status),
    INDEX idx_auction_date (auction_date),
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 拍品表
CREATE TABLE IF NOT EXISTS lots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    lot_number INT NOT NULL COMMENT '拍品编号',
    name VARCHAR(200) NOT NULL COMMENT '拍品名称',
    era VARCHAR(100) COMMENT '年代',
    category VARCHAR(100) COMMENT '品类',
    estimate_min DECIMAL(12, 2) COMMENT '估价下限',
    estimate_max DECIMAL(12, 2) COMMENT '估价上限',
    reserve_price DECIMAL(12, 2) COMMENT '保留价（不公开）',
    provenance TEXT COMMENT '来源说明',
    description TEXT COMMENT '详细描述',
    dimensions VARCHAR(100) COMMENT '尺寸',
    material VARCHAR(100) COMMENT '材质',
    condition_note TEXT COMMENT '品相说明',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
    status ENUM('pending', 'approved', 'rejected', 'sold', 'unsold') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_auction_id (auction_id),
    INDEX idx_lot_number (lot_number),
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order),
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_auction_lot (auction_id, lot_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 拍品图片表
CREATE TABLE IF NOT EXISTS lot_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lot_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    image_name VARCHAR(200),
    sort_order INT NOT NULL DEFAULT 0,
    is_primary TINYINT NOT NULL DEFAULT 0 COMMENT '是否主图',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
    INDEX idx_lot_id (lot_id),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 竞买人表
CREATE TABLE IF NOT EXISTS bidders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bidder_no VARCHAR(50) UNIQUE COMMENT '竞买人编号',
    name VARCHAR(50) NOT NULL,
    gender ENUM('male', 'female', 'other'),
    id_card VARCHAR(18) NOT NULL UNIQUE COMMENT '身份证号',
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address VARCHAR(500),
    company VARCHAR(200) COMMENT '公司名称',
    bank_account VARCHAR(50) COMMENT '银行账号',
    bank_name VARCHAR(100) COMMENT '开户银行',
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bidder_no (bidder_no),
    INDEX idx_id_card (id_card),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 竞买人资格审核表（每场拍卖单独审核）
CREATE TABLE IF NOT EXISTS bidder_qualifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    bidder_id INT NOT NULL,
    paddle_number VARCHAR(20) COMMENT '号牌号码',
    deposit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 COMMENT '保证金金额',
    deposit_paid TINYINT NOT NULL DEFAULT 0 COMMENT '保证金是否已缴纳',
    deposit_paid_at DATETIME COMMENT '保证金缴纳时间',
    id_verified TINYINT NOT NULL DEFAULT 0 COMMENT '身份证是否已验证',
    bank_statement_verified TINYINT NOT NULL DEFAULT 0 COMMENT '银行流水是否已验证',
    high_value_bidder TINYINT NOT NULL DEFAULT 0 COMMENT '是否为高价竞买人（需要额外审核）',
    qualification_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    approved_by INT COMMENT '审核人',
    approved_at DATETIME COMMENT '审核时间',
    reject_reason TEXT COMMENT '拒绝原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES bidders(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_auction_bidder (auction_id, bidder_id),
    INDEX idx_paddle_number (paddle_number),
    INDEX idx_status (qualification_status),
    UNIQUE KEY uk_auction_paddle (auction_id, paddle_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 预展预约表
CREATE TABLE IF NOT EXISTS preview_appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    bidder_id INT NOT NULL,
    appointment_date DATE NOT NULL COMMENT '预约日期',
    appointment_time VARCHAR(20) COMMENT '预约时段',
    visitor_count INT NOT NULL DEFAULT 1 COMMENT '参观人数',
    check_in TINYINT NOT NULL DEFAULT 0 COMMENT '是否已签到',
    check_in_time DATETIME COMMENT '签到时间',
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES bidders(id) ON DELETE CASCADE,
    INDEX idx_auction_date (auction_id, appointment_date),
    INDEX idx_bidder_id (bidder_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 拍卖结果表
CREATE TABLE IF NOT EXISTS auction_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lot_id INT NOT NULL UNIQUE,
    auction_id INT NOT NULL,
    hammer_price DECIMAL(12, 2) COMMENT '落槌价',
    buyer_paddle_number VARCHAR(20) COMMENT '买受人号牌',
    buyer_qualification_id INT COMMENT '买受人资格ID',
    is_unsold TINYINT NOT NULL DEFAULT 0 COMMENT '是否流拍',
    entered_by INT NOT NULL COMMENT '录入人',
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    remark TEXT,
    FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_qualification_id) REFERENCES bidder_qualifications(id),
    FOREIGN KEY (entered_by) REFERENCES users(id),
    INDEX idx_auction_id (auction_id),
    INDEX idx_buyer_paddle (buyer_paddle_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    module VARCHAR(50) NOT NULL,
    operation VARCHAR(50) NOT NULL,
    content TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_module (module),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入初始管理员用户（密码: admin123，bcrypt加密）
INSERT INTO users (username, password, real_name, role, phone, email, status) VALUES
('admin', '$2b$10$BDmYGZ6kflp0/0Jn6aDOdubBQBle89Ue9rxBxx8v5neIhhk2eDvG.', '系统管理员', 'admin', '13800138000', 'admin@auction.com', 1);
