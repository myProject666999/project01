CREATE DATABASE IF NOT EXISTS art_exhibition DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE art_exhibition;

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('curator', 'artist', 'worker', 'media') NOT NULL DEFAULT 'curator',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE exhibition (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    venue VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('planning', 'preparing', 'installing', 'open', 'closed', 'dismantling') NOT NULL DEFAULT 'planning',
    description TEXT,
    cover_image VARCHAR(500),
    curator_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (curator_id) REFERENCES user(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE artist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exhibition_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar VARCHAR(500),
    bio TEXT,
    phone VARCHAR(30),
    email VARCHAR(100),
    confirm_status ENUM('pending', 'confirmed', 'withdrawn') NOT NULL DEFAULT 'pending',
    confirmed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exhibition_id) REFERENCES exhibition(id) ON DELETE CASCADE,
    INDEX idx_artist_exhibition (exhibition_id),
    INDEX idx_artist_status (confirm_status)
) ENGINE=InnoDB;

CREATE TABLE artwork (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exhibition_id INT NOT NULL,
    artist_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    image VARCHAR(500),
    medium VARCHAR(200),
    dimensions VARCHAR(100),
    year INT,
    transport_status ENUM('shipped', 'in_transit', 'arrived', 'unpacked', 'hung', 'dismantled', 'returned') NOT NULL DEFAULT 'shipped',
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    rotation FLOAT DEFAULT 0,
    wall_label VARCHAR(500),
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exhibition_id) REFERENCES exhibition(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES artist(id) ON DELETE CASCADE,
    INDEX idx_artwork_exhibition (exhibition_id),
    INDEX idx_artwork_artist (artist_id),
    INDEX idx_artwork_status (transport_status)
) ENGINE=InnoDB;

CREATE TABLE artwork_status_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artwork_id INT NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50) NOT NULL,
    operator VARCHAR(100),
    remark TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artwork_id) REFERENCES artwork(id) ON DELETE CASCADE,
    INDEX idx_log_artwork (artwork_id)
) ENGINE=InnoDB;

CREATE TABLE floor_plan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exhibition_id INT NOT NULL,
    background_url VARCHAR(500),
    width INT NOT NULL DEFAULT 1200,
    height INT NOT NULL DEFAULT 800,
    layout_data JSON,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exhibition_id) REFERENCES exhibition(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_floorplan_exhibition (exhibition_id)
) ENGINE=InnoDB;

CREATE TABLE guest (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exhibition_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('vvip', 'vip', 'media', 'general') NOT NULL DEFAULT 'general',
    phone VARCHAR(30),
    email VARCHAR(100),
    organization VARCHAR(200),
    invite_status ENUM('pending', 'sent', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
    checkin_status ENUM('not_checked_in', 'checked_in') NOT NULL DEFAULT 'not_checked_in',
    checkin_at DATETIME,
    checkin_method ENUM('qrcode', 'face', 'manual') NULL,
    face_embedding TEXT,
    qrcode_token VARCHAR(100) UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exhibition_id) REFERENCES exhibition(id) ON DELETE CASCADE,
    INDEX idx_guest_exhibition (exhibition_id),
    INDEX idx_guest_qrcode (qrcode_token)
) ENGINE=InnoDB;

CREATE TABLE media_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exhibition_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    type ENUM('poster', 'press_release', 'other') NOT NULL DEFAULT 'other',
    current_version INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exhibition_id) REFERENCES exhibition(id) ON DELETE CASCADE,
    INDEX idx_media_exhibition (exhibition_id)
) ENGINE=InnoDB;

CREATE TABLE media_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    media_item_id INT NOT NULL,
    version_number INT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(200) NOT NULL,
    file_size INT,
    uploaded_by VARCHAR(100),
    change_log TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_item_id) REFERENCES media_item(id) ON DELETE CASCADE,
    INDEX idx_version_media (media_item_id),
    UNIQUE INDEX idx_version_unique (media_item_id, version_number)
) ENGINE=InnoDB;

CREATE TABLE artist_replacement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exhibition_id INT NOT NULL,
    original_artist_id INT NOT NULL,
    replacement_artist_id INT,
    status ENUM('pending', 'approved', 'completed', 'rejected') NOT NULL DEFAULT 'pending',
    reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (exhibition_id) REFERENCES exhibition(id) ON DELETE CASCADE,
    FOREIGN KEY (original_artist_id) REFERENCES artist(id) ON DELETE CASCADE,
    FOREIGN KEY (replacement_artist_id) REFERENCES artist(id) ON DELETE SET NULL,
    INDEX idx_replacement_exhibition (exhibition_id),
    INDEX idx_replacement_status (status)
) ENGINE=InnoDB;

INSERT INTO user (username, password, email, role) VALUES ('admin', '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu6GK', 'admin@art.com', 'curator');

INSERT INTO exhibition (name, venue, address, start_date, end_date, status, description, curator_id) VALUES 
('当代光影艺术展', '国家美术馆A厅', '北京市朝阳区建国路1号', '2026-07-15', '2026-09-30', 'preparing', '探索光与影在当代艺术中的表现形式，汇集国内外8位艺术家的沉浸式装置与影像作品。', 1),
('水墨新境', '国家美术馆B厅', '北京市朝阳区建国路1号', '2026-08-01', '2026-10-15', 'planning', '以当代视角重新诠释传统水墨精神，展现东方美学的当代表达。', 1);

INSERT INTO artist (exhibition_id, name, avatar, bio, phone, email, confirm_status) VALUES 
(1, '李明辉', NULL, '当代装置艺术家，擅长光影交互作品', '13800001111', 'liminghui@art.com', 'confirmed'),
(1, 'Sarah Chen', NULL, '华裔美国影像艺术家，作品曾参展威尼斯双年展', '13800002222', 'sarahchen@art.com', 'confirmed'),
(1, '王大伟', NULL, '新媒体艺术家，专注于互动装置', '13800003333', 'wangdawei@art.com', 'pending'),
(2, '赵雨晴', NULL, '当代水墨画家，中央美院教授', '13800004444', 'zhaoyuqing@art.com', 'confirmed'),
(2, '陈书远', NULL, '书法与当代艺术跨界创作者', '13800005555', 'chenshuyuan@art.com', 'confirmed');

INSERT INTO artwork (exhibition_id, artist_id, title, image, medium, dimensions, year, transport_status) VALUES 
(1, 1, '光之迷宫', NULL, 'LED装置、亚克力、传感器', '500x500x300cm', 2025, 'shipped'),
(1, 1, '呼吸的墙', NULL, '投影、感应器、白色墙面', '800x400cm', 2026, 'in_transit'),
(1, 2, '记忆碎片', NULL, '单频影像、4K投影', '循环播放15分钟', 2024, 'arrived'),
(1, 2, '无声对话', NULL, '双频影像装置', '各20分钟循环', 2025, 'unpacked'),
(1, 3, '触碰星空', NULL, '互动装置、光纤、Arduino', '600x600x400cm', 2026, 'shipped'),
(2, 4, '山水间·新篇', NULL, '宣纸水墨、综合材料', '180x97cm', 2026, 'shipped'),
(2, 4, '云起', NULL, '宣纸水墨', '240x120cm', 2025, 'in_transit'),
(2, 5, '解构兰亭', NULL, '综合材料、宣纸、亚克力', '200x200cm', 2026, 'shipped');

INSERT INTO guest (exhibition_id, name, category, phone, email, organization, invite_status, qrcode_token) VALUES 
(1, '张馆长', 'vvip', '13900001111', 'zhang@artmuseum.cn', '国家美术馆', 'accepted', 'QR-001-VVIP'),
(1, '李记者', 'media', '13900002222', 'li@artnews.cn', '艺术新闻网', 'sent', 'QR-002-MEDIA'),
(1, '王教授', 'vip', '13900003333', 'wang@university.edu', '中央美术学院', 'accepted', 'QR-003-VIP'),
(2, '赵院长', 'vvip', '13900004444', 'zhao@artacademy.cn', '中国艺术研究院', 'pending', 'QR-004-VVIP'),
(2, '刘编辑', 'media', '13900005555', 'liu@culturepress.cn', '文化出版社', 'sent', 'QR-005-MEDIA');

INSERT INTO media_item (exhibition_id, title, type, current_version) VALUES 
(1, '主海报', 'poster', 2),
(1, '新闻通稿', 'press_release', 1),
(2, '主海报', 'poster', 1);

INSERT INTO media_version (media_item_id, version_number, file_url, file_name, file_size, uploaded_by, change_log) VALUES 
(1, 1, '/uploads/poster1_v1.jpg', '当代光影展海报_v1.jpg', 2048000, 'admin', '初版设计'),
(1, 2, '/uploads/poster1_v2.jpg', '当代光影展海报_v2.jpg', 2156000, 'admin', '更新展览日期和艺术家名单'),
(2, 1, '/uploads/press1_v1.docx', '新闻通稿_v1.docx', 512000, 'admin', '初稿'),
(3, 1, '/uploads/poster2_v1.jpg', '水墨新境海报_v1.jpg', 1890000, 'admin', '初版设计');
