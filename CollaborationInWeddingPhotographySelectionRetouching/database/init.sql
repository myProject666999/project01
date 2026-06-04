CREATE DATABASE IF NOT EXISTS wedding_photo_collab DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wedding_photo_collab;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role ENUM('client', 'retoucher', 'admin') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    wedding_date DATE,
    couple_names VARCHAR(100) NOT NULL,
    total_photos INT DEFAULT 0,
    selected_photos INT DEFAULT 0,
    status ENUM('pending', 'uploading', 'selecting', 'retouching', 'reviewing', 'completed', 'cancelled') DEFAULT 'pending',
    deposit_paid BOOLEAN DEFAULT FALSE,
    balance_paid BOOLEAN DEFAULT FALSE,
    total_amount DECIMAL(10,2) DEFAULT 0,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_client_id (client_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_path VARCHAR(255) NOT NULL,
    thumbnail_path VARCHAR(255),
    file_size BIGINT NOT NULL,
    width INT,
    height INT,
    is_selected BOOLEAN DEFAULT FALSE,
    rating TINYINT DEFAULT 0 COMMENT '0=unrated, 1=reject, 3=alternative, 5=must_select',
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_id (order_id),
    INDEX idx_rating (rating),
    INDEX idx_is_selected (is_selected)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE photo_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    photo_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_photo_id (photo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE retouch_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    photo_id INT NOT NULL,
    retoucher_id INT,
    status ENUM('pending', 'assigned', 'in_progress', 'submitted', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    priority TINYINT DEFAULT 1,
    requirements TEXT,
    current_version INT DEFAULT 0,
    max_free_revisions INT DEFAULT 3,
    paid_revisions INT DEFAULT 0,
    revision_fee DECIMAL(10,2) DEFAULT 50.00,
    assigned_at TIMESTAMP NULL,
    submitted_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (photo_id) REFERENCES photos(id) ON DELETE CASCADE,
    FOREIGN KEY (retoucher_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_photo_id (photo_id),
    INDEX idx_retoucher_id (retoucher_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE retouch_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    version INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    is_watermarked BOOLEAN DEFAULT FALSE,
    retoucher_note TEXT,
    client_feedback TEXT,
    status ENUM('submitted', 'approved', 'rejected') DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES retouch_tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_version (task_id, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('deposit', 'balance', 'revision') NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_method VARCHAR(50),
    remark TEXT,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, password, email, phone, role, full_name) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@wedding.com', '13800000000', 'admin', '系统管理员'),
('retoucher1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'retoucher1@wedding.com', '13800000001', 'retoucher', '张修图'),
('retoucher2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'retoucher2@wedding.com', '13800000002', 'retoucher', '李精修'),
('client1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'client1@wedding.com', '13900000001', 'client', '王先生&李女士');
