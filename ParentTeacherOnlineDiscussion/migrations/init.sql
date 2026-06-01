CREATE DATABASE IF NOT EXISTS ptod DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ptod;

DROP TABLE IF EXISTS rating;
DROP TABLE IF EXISTS meeting_summary;
DROP TABLE IF EXISTS room_token;
DROP TABLE IF EXISTS appointment;
DROP TABLE IF EXISTS time_slot;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    subject VARCHAR(50),
    avatar VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_subject (subject)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE time_slot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INT NOT NULL,
    is_available TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_teacher_date (teacher_id, slot_date),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE appointment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    parent_id BIGINT NOT NULL,
    time_slot_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    appointment_time DATETIME NOT NULL,
    duration INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES user(id),
    FOREIGN KEY (parent_id) REFERENCES user(id),
    FOREIGN KEY (time_slot_id) REFERENCES time_slot(id),
    UNIQUE KEY uk_timeslot (time_slot_id),
    INDEX idx_teacher (teacher_id),
    INDEX idx_parent (parent_id),
    INDEX idx_status (status),
    INDEX idx_time (appointment_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE meeting_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE,
    teacher_notes TEXT,
    parent_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointment(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rating (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    parent_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    score INT NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointment(id),
    FOREIGN KEY (parent_id) REFERENCES user(id),
    FOREIGN KEY (teacher_id) REFERENCES user(id),
    UNIQUE KEY uk_appointment_parent (appointment_id, parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE room_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    used TINYINT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointment(id),
    FOREIGN KEY (user_id) REFERENCES user(id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO user (username, password, name, role, email, subject) VALUES
('teacher1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVki6C', '张老师', 'TEACHER', 'zhang@school.com', '语文'),
('teacher2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVki6C', '李老师', 'TEACHER', 'li@school.com', '数学'),
('teacher3', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVki6C', '王老师', 'TEACHER', 'wang@school.com', '英语'),
('parent1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVki6C', '陈家长', 'PARENT', 'chen@parent.com', NULL),
('parent2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVki6C', '刘家长', 'PARENT', 'liu@parent.com', NULL),
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVki6C', '管理员', 'ADMIN', 'admin@school.com', NULL);
