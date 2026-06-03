CREATE DATABASE IF NOT EXISTS foreign_trade_sample_tracking DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE foreign_trade_sample_tracking;

CREATE TABLE IF NOT EXISTS samples (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model VARCHAR(100) NOT NULL UNIQUE,
    unit_cost DECIMAL(10, 2) NOT NULL,
    weight DECIMAL(8, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_model (model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS couriers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    api_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crm_customer_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_crm_id (crm_customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mailings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    sample_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    courier_id INT NOT NULL,
    tracking_number VARCHAR(100) NOT NULL,
    mailing_date DATE NOT NULL,
    status ENUM('pending', 'in_transit', 'delivered', 'exception') DEFAULT 'pending',
    shipping_cost DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (sample_id) REFERENCES samples(id) ON DELETE CASCADE,
    FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE,
    INDEX idx_tracking_number (tracking_number),
    INDEX idx_status (status),
    INDEX idx_mailing_date (mailing_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tracking_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mailing_id INT NOT NULL,
    status ENUM('pending', 'in_transit', 'delivered', 'exception') NOT NULL,
    location VARCHAR(255),
    description TEXT,
    tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mailing_id) REFERENCES mailings(id) ON DELETE CASCADE,
    INDEX idx_mailing_id (mailing_id),
    INDEX idx_tracked_at (tracked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedbacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mailing_id INT NOT NULL UNIQUE,
    feedback_type ENUM('satisfied', 'ordered', 'bargain', 'discarded') NOT NULL,
    order_amount DECIMAL(12, 2) DEFAULT 0,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mailing_id) REFERENCES mailings(id) ON DELETE CASCADE,
    INDEX idx_feedback_type (feedback_type),
    INDEX idx_follow_up_date (follow_up_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO couriers (name, code) VALUES
('DHL', 'DHL'),
('FedEx', 'FEDEX'),
('UPS', 'UPS'),
('TNT', 'TNT'),
('EMS', 'EMS'),
('SF Express', 'SF');

INSERT INTO samples (model, unit_cost, weight, description) VALUES
('SAMPLE-A001', 150.00, 0.5, 'Electronics sample A series'),
('SAMPLE-A002', 200.00, 0.8, 'Electronics sample A series upgraded'),
('SAMPLE-B001', 350.00, 1.2, 'Mechanical parts sample B series'),
('SAMPLE-C001', 80.00, 0.2, 'Textile sample C series');

INSERT INTO customers (crm_customer_id, name, country, email) VALUES
('CRM-001', 'John Smith', 'USA', 'john@example.com'),
('CRM-002', 'Maria Garcia', 'Spain', 'maria@example.com'),
('CRM-003', 'Hans Mueller', 'Germany', 'hans@example.com'),
('CRM-004', 'Yuki Tanaka', 'Japan', 'yuki@example.com');
