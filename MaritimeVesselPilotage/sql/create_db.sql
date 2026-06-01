CREATE DATABASE IF NOT EXISTS maritime_pilotage DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE maritime_pilotage;

CREATE TABLE IF NOT EXISTS vessel (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    vessel_name VARCHAR(100) NOT NULL,
    imo_number VARCHAR(20) UNIQUE,
    call_sign VARCHAR(20),
    vessel_type VARCHAR(50),
    gross_tonnage DECIMAL(12,2),
    net_tonnage DECIMAL(12,2) NOT NULL,
    deadweight_tonnage DECIMAL(12,2),
    length_overall DECIMAL(8,2),
    breadth DECIMAL(8,2),
    maximum_draft DECIMAL(6,2) NOT NULL,
    vessel_level INT NOT NULL DEFAULT 1,
    flag VARCHAR(50),
    owner VARCHAR(100),
    operator VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vessel_name (vessel_name),
    INDEX idx_vessel_level (vessel_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pilot (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    phone VARCHAR(20),
    id_card VARCHAR(18),
    pilot_level INT NOT NULL DEFAULT 1,
    qualification_cert VARCHAR(50),
    issue_date DATE,
    expiry_date DATE,
    status INT NOT NULL DEFAULT 1,
    total_pilotage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pilot_level (pilot_level),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pilot_schedule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pilot_id BIGINT NOT NULL,
    schedule_date DATE NOT NULL,
    shift_type INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_on_call TINYINT DEFAULT 0,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pilot_id) REFERENCES pilot(id) ON DELETE CASCADE,
    UNIQUE KEY uk_pilot_shift (pilot_id, schedule_date, shift_type),
    INDEX idx_schedule_date (schedule_date),
    INDEX idx_pilot_date (pilot_id, schedule_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tide (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tide_date DATE NOT NULL,
    tide_time TIME NOT NULL,
    tide_height DECIMAL(5,2) NOT NULL,
    tide_type INT NOT NULL,
    port VARCHAR(50) DEFAULT 'Main Port',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_date_time (tide_date, tide_time, port),
    INDEX idx_tide_date (tide_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tug (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tug_name VARCHAR(50) NOT NULL,
    tug_code VARCHAR(20) UNIQUE NOT NULL,
    horsepower INT NOT NULL,
    bollard_pull DECIMAL(6,2),
    status INT DEFAULT 1,
    current_location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pilotage_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(30) UNIQUE NOT NULL,
    vessel_id BIGINT NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(50),
    contact_phone VARCHAR(20),
    eta DATETIME NOT NULL,
    eta_draft DECIMAL(6,2) NOT NULL,
    departure_port VARCHAR(100),
    destination_port VARCHAR(100),
    pilotage_type INT NOT NULL,
    berth_from VARCHAR(50),
    berth_to VARCHAR(50),
    special_requirements TEXT,
    submit_time DATETIME NOT NULL,
    status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessel(id),
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_eta (eta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pilotage_assignment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_no VARCHAR(30) UNIQUE NOT NULL,
    order_id BIGINT NOT NULL,
    pilot_id BIGINT NOT NULL,
    tide_window_start DATETIME NOT NULL,
    tide_window_end DATETIME NOT NULL,
    planned_pilotage_time DATETIME NOT NULL,
    pilotage_distance DECIMAL(8,2) NOT NULL,
    tug_count INT DEFAULT 1,
    status INT DEFAULT 1,
    is_extended TINYINT DEFAULT 0,
    original_assignment_id BIGINT,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES pilotage_order(id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES pilot(id),
    FOREIGN KEY (original_assignment_id) REFERENCES pilotage_assignment(id),
    INDEX idx_assignment_no (assignment_no),
    INDEX idx_order_id (order_id),
    INDEX idx_pilot_id (pilot_id),
    INDEX idx_planned_time (planned_pilotage_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assignment_tug (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_id BIGINT NOT NULL,
    tug_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES pilotage_assignment(id) ON DELETE CASCADE,
    FOREIGN KEY (tug_id) REFERENCES tug(id),
    UNIQUE KEY uk_assignment_tug (assignment_id, tug_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pilotage_completion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    completion_no VARCHAR(30) UNIQUE NOT NULL,
    assignment_id BIGINT NOT NULL,
    actual_start_time DATETIME,
    actual_end_time DATETIME,
    actual_distance DECIMAL(8,2),
    pilotage_quality INT,
    delay_reason TEXT,
    weather_condition VARCHAR(100),
    visibility DECIMAL(6,2),
    wind_speed DECIMAL(6,2),
    wave_height DECIMAL(5,2),
    completion_status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES pilotage_assignment(id) ON DELETE CASCADE,
    INDEX idx_completion_no (completion_no),
    INDEX idx_assignment_id (assignment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pilotage_billing (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    billing_no VARCHAR(30) UNIQUE NOT NULL,
    completion_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL,
    vessel_id BIGINT NOT NULL,
    net_tonnage DECIMAL(12,2) NOT NULL,
    pilotage_distance DECIMAL(8,2) NOT NULL,
    base_fee DECIMAL(12,2) NOT NULL,
    tonnage_fee DECIMAL(12,2) NOT NULL,
    distance_fee DECIMAL(12,2) NOT NULL,
    tug_fee DECIMAL(12,2),
    night_surcharge DECIMAL(12,2) DEFAULT 0,
    weekend_surcharge DECIMAL(12,2) DEFAULT 0,
    holiday_surcharge DECIMAL(12,2) DEFAULT 0,
    other_fee DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    billing_status INT DEFAULT 1,
    billing_date DATE,
    paid_date DATE,
    remark TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (completion_id) REFERENCES pilotage_completion(id),
    FOREIGN KEY (order_id) REFERENCES pilotage_order(id),
    FOREIGN KEY (vessel_id) REFERENCES vessel(id),
    INDEX idx_billing_no (billing_no),
    INDEX idx_order_id (order_id),
    INDEX idx_billing_status (billing_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS system_notification (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_type INT NOT NULL,
    recipient_type INT NOT NULL,
    recipient_id BIGINT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    related_business_id BIGINT,
    related_business_type VARCHAR(50),
    is_read TINYINT DEFAULT 0,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recipient (recipient_type, recipient_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(50),
    role INT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    status INT DEFAULT 1,
    last_login_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
