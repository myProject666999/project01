CREATE DATABASE IF NOT EXISTS piano_practice DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE piano_practice;

DROP TABLE IF EXISTS lesson_recordings;
DROP TABLE IF EXISTS lesson_annotations;
DROP TABLE IF EXISTS lesson_evaluations;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS user_course_packages;
DROP TABLE IF EXISTS course_packages;
DROP TABLE IF EXISTS sheet_music;
DROP TABLE IF EXISTS teacher_skills;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'parent', 'teacher', 'admin') NOT NULL,
    name VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    parent_id BIGINT NULL,
    age INT,
    level ENUM('beginner', 'elementary', 'intermediate', 'advanced') DEFAULT 'beginner',
    current_book VARCHAR(100),
    learning_goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teachers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    teaching_years INT DEFAULT 0,
    bio TEXT,
    certifications TEXT,
    hourly_rate DECIMAL(10, 2) DEFAULT 0.00,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    total_lessons INT DEFAULT 0,
    chinese_teaching BOOLEAN DEFAULT FALSE,
    video_intro_url VARCHAR(255),
    available_times JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_rating (rating),
    INDEX idx_chinese_teaching (chinese_teaching)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teacher_skills (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    teacher_id BIGINT NOT NULL,
    difficulty_level ENUM('拜厄', '车尔尼599', '车尔尼849', '车尔尼299', '车尔尼740', '巴赫初级', '巴赫中级', '巴赫高级', '莫扎特奏鸣曲', '贝多芬奏鸣曲', '肖邦练习曲', '李斯特练习曲') NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    UNIQUE KEY uk_teacher_difficulty (teacher_id, difficulty_level),
    INDEX idx_difficulty_level (difficulty_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE course_packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_lessons INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    lesson_duration INT NOT NULL COMMENT 'in minutes',
    level ENUM('all', 'beginner', 'elementary', 'intermediate', 'advanced') DEFAULT 'all',
    valid_days INT DEFAULT 365,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_course_packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    course_package_id BIGINT NOT NULL,
    remaining_lessons INT NOT NULL,
    total_lessons INT NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expire_date TIMESTAMP NULL,
    status ENUM('active', 'used_up', 'expired') DEFAULT 'active',
    transaction_id VARCHAR(100),
    amount_paid DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_package_id) REFERENCES course_packages(id) ON DELETE RESTRICT,
    INDEX idx_user_id (user_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sheet_music (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    composer VARCHAR(100),
    difficulty_level ENUM('拜厄', '车尔尼599', '车尔尼849', '车尔尼299', '车尔尼740', '巴赫初级', '巴赫中级', '巴赫高级', '莫扎特奏鸣曲', '贝多芬奏鸣曲', '肖邦练习曲', '李斯特练习曲'),
    file_type ENUM('pdf', 'image') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    page_count INT DEFAULT 1,
    description TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_difficulty_level (difficulty_level),
    INDEX idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    user_course_package_id BIGINT NOT NULL,
    sheet_music_id BIGINT NULL,
    scheduled_start DATETIME NOT NULL,
    scheduled_end DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'pending',
    cancellation_reason VARCHAR(255),
    cancelled_by BIGINT NULL,
    cancelled_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_course_package_id) REFERENCES user_course_packages(id) ON DELETE RESTRICT,
    FOREIGN KEY (sheet_music_id) REFERENCES sheet_music(id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_scheduled_start (scheduled_start),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lessons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT NOT NULL UNIQUE,
    student_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    sheet_music_id BIGINT NULL,
    actual_start DATETIME NULL,
    actual_end DATETIME NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'interrupted') DEFAULT 'not_started',
    room_id VARCHAR(100),
    teacher_video_url VARCHAR(255),
    student_video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (sheet_music_id) REFERENCES sheet_music(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lesson_annotations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lesson_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    annotation_type ENUM('line', 'circle', 'text', 'finger_number', 'highlight', 'arrow') NOT NULL,
    page_number INT DEFAULT 1,
    position_x DECIMAL(10, 4) NOT NULL,
    position_y DECIMAL(10, 4) NOT NULL,
    end_position_x DECIMAL(10, 4),
    end_position_y DECIMAL(10, 4),
    color VARCHAR(20) DEFAULT '#FF0000',
    line_width INT DEFAULT 2,
    content TEXT,
    timestamp_seconds INT NOT NULL COMMENT 'video timestamp in seconds',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_timestamp (timestamp_seconds)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lesson_evaluations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lesson_id BIGINT NOT NULL UNIQUE,
    teacher_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    rhythm_score INT CHECK (rhythm_score >= 0 AND rhythm_score <= 100),
    rhythm_comment TEXT,
    intonation_score INT CHECK (intonation_score >= 0 AND intonation_score <= 100),
    intonation_comment TEXT,
    expression_score INT CHECK (expression_score >= 0 AND expression_score <= 100),
    expression_comment TEXT,
    accuracy_score INT CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
    accuracy_comment TEXT,
    overall_comment TEXT,
    next_goal TEXT,
    practice_assignments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lesson_recordings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lesson_id BIGINT NOT NULL,
    recording_type ENUM('teacher', 'student', 'combined') NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    duration_seconds INT,
    file_size BIGINT,
    annotation_sync_data JSON COMMENT 'synchronized annotation timeline data',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_recording_type (recording_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, email, password, role, name, phone) VALUES
('admin', 'admin@piano.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', '系统管理员', '13800138000'),
('teacher1', 'teacher1@piano.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'teacher', '张老师', '13900139001'),
('teacher2', 'teacher2@piano.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'teacher', '李老师', '13900139002'),
('parent1', 'parent1@piano.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'parent', '王妈妈', '13700137001'),
('student1', 'student1@piano.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student', '小明', '13600136001');

INSERT INTO teachers (user_id, teaching_years, bio, certifications, hourly_rate, rating, total_lessons, chinese_teaching) VALUES
(2, 8, '中央音乐学院钢琴系硕士，8年教学经验，擅长少儿钢琴启蒙和进阶教学', '中央音乐学院教师资格证、ABRSM认证教师', 200.00, 4.9, 320, TRUE),
(3, 5, '上海音乐学院毕业，专注于车尔尼系列和巴赫作品教学', '上海音乐学院教师资格证', 180.00, 4.8, 256, TRUE);

INSERT INTO teacher_skills (teacher_id, difficulty_level, proficiency_level) VALUES
(1, '拜厄', 'expert'),
(1, '车尔尼599', 'expert'),
(1, '车尔尼849', 'advanced'),
(1, '巴赫初级', 'advanced'),
(1, '巴赫中级', 'intermediate'),
(2, '拜厄', 'advanced'),
(2, '车尔尼599', 'expert'),
(2, '车尔尼849', 'expert'),
(2, '车尔尼299', 'advanced');

INSERT INTO students (user_id, parent_id, age, level, current_book, learning_goals) VALUES
(5, 4, 8, 'beginner', '拜厄', '打好钢琴基础，培养音乐兴趣');

INSERT INTO course_packages (name, description, total_lessons, price, lesson_duration, level, valid_days) VALUES
('启蒙入门包', '适合零基础学员，包含20节一对一课程，从识谱、手型开始系统学习', 20, 3600.00, 30, 'beginner', 180),
('进阶提升包', '适合有一定基础的学员，40节课程，提升演奏技巧和音乐表现力', 40, 6800.00, 45, 'elementary', 365),
('专业精品包', '针对考级学员，60节精品课程，包含考级曲目专项训练', 60, 9600.00, 60, 'intermediate', 365),
('大师一对一', '高级定制课程，由资深教师授课，针对专业演奏水平学员', 10, 2800.00, 60, 'advanced', 180);

INSERT INTO sheet_music (title, composer, difficulty_level, file_type, file_url, page_count, created_by) VALUES
('拜厄钢琴基本教程 No.10', '费迪南德·拜厄', '拜厄', 'pdf', '/sheet_music/bayer/10.pdf', 1, 1),
('拜厄钢琴基本教程 No.20', '费迪南德·拜厄', '拜厄', 'pdf', '/sheet_music/bayer/20.pdf', 1, 1),
('车尔尼599 No.19', '卡尔·车尔尼', '车尔尼599', 'pdf', '/sheet_music/czerny/599_19.pdf', 1, 1),
('车尔尼599 No.45', '卡尔·车尔尼', '车尔尼599', 'pdf', '/sheet_music/czerny/599_45.pdf', 2, 1),
('车尔尼849 No.12', '卡尔·车尔尼', '车尔尼849', 'pdf', '/sheet_music/czerny/849_12.pdf', 2, 1),
('巴赫初级钢琴曲集 No.1', '约翰·塞巴斯蒂安·巴赫', '巴赫初级', 'pdf', '/sheet_music/bach/beginner_1.pdf', 2, 1);

INSERT INTO user_course_packages (user_id, student_id, course_package_id, remaining_lessons, total_lessons, purchase_date, expire_date, amount_paid, transaction_id) VALUES
(4, 1, 1, 18, 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 173 DAY), 3600.00, 'TXN202401010001');

INSERT INTO bookings (student_id, teacher_id, user_course_package_id, sheet_music_id, scheduled_start, scheduled_end, status, notes) VALUES
(1, 1, 1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 30 MINUTE), 'confirmed', '复习拜厄No.10，预习No.20'),
(1, 1, 1, 2, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 30 MINUTE), 'pending', '学习拜厄No.20');

INSERT INTO lessons (booking_id, student_id, teacher_id, sheet_music_id, actual_start, actual_end, status, room_id) VALUES
(1, 1, 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(DATE_SUB(NOW(), INTERVAL 2 DAY), INTERVAL 30 MINUTE), 'completed', 'room_001');

INSERT INTO lesson_annotations (lesson_id, created_by, annotation_type, page_number, position_x, position_y, end_position_x, end_position_y, color, content, timestamp_seconds) VALUES
(1, 2, 'finger_number', 1, 35.5, 42.3, NULL, NULL, '#FF0000', '3', 125),
(1, 2, 'highlight', 1, 30.0, 40.0, 50.0, 45.0, '#FFFF00', NULL, 130),
(1, 2, 'line', 1, 25.0, 38.0, 55.0, 38.0, '#FF0000', NULL, 180),
(1, 2, 'text', 1, 40.0, 50.0, NULL, NULL, '#0000FF', '注意这里的节奏要稳', 240);

INSERT INTO lesson_evaluations (lesson_id, teacher_id, student_id, rhythm_score, rhythm_comment, intonation_score, intonation_comment, expression_score, expression_comment, accuracy_score, accuracy_comment, overall_comment, next_goal, practice_assignments) VALUES
(1, 1, 1, 85, '整体节奏不错，中间有几处稍微抢拍，需要多加注意', 90, '音准很好，识谱能力强', 75, '音乐表现力还可以，建议多听示范录音', 88, '错音很少，只有一处反复记号没注意', '本节课小明表现很好，拜厄No.10已经基本掌握。手型有明显改善，继续保持。', '1. 巩固拜厄No.10，每天练习10分钟；2. 预习拜厄No.20，注意新的节奏型；3. 保持正确的手型和坐姿。', '拜厄No.10 每天5遍；拜厄No.20 分手练习每天3遍；哈农练习第1-5条');

INSERT INTO lesson_recordings (lesson_id, recording_type, video_url, duration_seconds, file_size) VALUES
(1, 'teacher', '/recordings/lesson_1_teacher.mp4', 1800, 256000000),
(1, 'student', '/recordings/lesson_1_student.mp4', 1800, 245000000),
(1, 'combined', '/recordings/lesson_1_combined.mp4', 1800, 480000000);
