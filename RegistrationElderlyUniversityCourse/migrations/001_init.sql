CREATE DATABASE IF NOT EXISTS elderly_university
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE elderly_university;

-- ============================================================
-- 表结构
-- ============================================================

DROP TABLE IF EXISTS activity_registrations;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS club_members;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS waitlist;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  phone       VARCHAR(20)  NOT NULL,
  password    VARCHAR(255) NOT NULL,
  name        VARCHAR(50)  NOT NULL,
  avatar      VARCHAR(500) DEFAULT '',
  role        TINYINT      NOT NULL DEFAULT 0 COMMENT '0-student 1-teacher 2-admin',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  name           VARCHAR(100) NOT NULL,
  category       VARCHAR(50)  NOT NULL COMMENT '书画/声乐/舞蹈/手工',
  teacher        VARCHAR(50)  NOT NULL,
  description    TEXT,
  schedule_day   VARCHAR(20)  NOT NULL COMMENT '星期几',
  schedule_time  VARCHAR(50)  NOT NULL COMMENT '上课时间段',
  classroom      VARCHAR(50)  NOT NULL,
  capacity       INT          NOT NULL DEFAULT 30,
  enrolled_count INT          NOT NULL DEFAULT 0,
  status         TINYINT      NOT NULL DEFAULT 1 COMMENT '0-disabled 1-enabled',
  image          VARCHAR(500) DEFAULT '',
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE enrollments (
  id         BIGINT  NOT NULL AUTO_INCREMENT,
  user_id    BIGINT  NOT NULL,
  course_id  BIGINT  NOT NULL,
  status     TINYINT NOT NULL DEFAULT 1 COMMENT '0-cancelled 1-enrolled 2-completed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_course (user_id, course_id),
  KEY idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE waitlist (
  id         BIGINT  NOT NULL AUTO_INCREMENT,
  user_id    BIGINT  NOT NULL,
  course_id  BIGINT  NOT NULL,
  position   INT     NOT NULL DEFAULT 0,
  status     TINYINT NOT NULL DEFAULT 0 COMMENT '0-waiting 1-admitted 2-cancelled',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_course (user_id, course_id),
  KEY idx_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE attendance (
  id              BIGINT  NOT NULL AUTO_INCREMENT,
  enrollment_id   BIGINT  NOT NULL,
  attendance_date DATE    NOT NULL,
  status          TINYINT NOT NULL DEFAULT 1 COMMENT '0-absent 1-present 2-leave',
  remark          VARCHAR(200) DEFAULT '',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_enrollment_date (enrollment_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE clubs (
  id           BIGINT       NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  image        VARCHAR(500) DEFAULT '',
  member_count INT          NOT NULL DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE club_members (
  id       BIGINT  NOT NULL AUTO_INCREMENT,
  user_id  BIGINT  NOT NULL,
  club_id  BIGINT  NOT NULL,
  status   TINYINT NOT NULL DEFAULT 1 COMMENT '0-quit 1-active',
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_club (user_id, club_id),
  KEY idx_club (club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activities (
  id               BIGINT       NOT NULL AUTO_INCREMENT,
  club_id          BIGINT       NOT NULL,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  location         VARCHAR(200) NOT NULL,
  start_time       DATETIME     NOT NULL,
  end_time         DATETIME     NOT NULL,
  capacity         INT          NOT NULL DEFAULT 50,
  registered_count INT          NOT NULL DEFAULT 0,
  status           TINYINT      NOT NULL DEFAULT 1 COMMENT '0-cancelled 1-upcoming 2-ongoing 3-ended',
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_club (club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activity_registrations (
  id          BIGINT  NOT NULL AUTO_INCREMENT,
  user_id     BIGINT  NOT NULL,
  activity_id BIGINT  NOT NULL,
  status      TINYINT NOT NULL DEFAULT 1 COMMENT '0-cancelled 1-registered',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_activity (user_id, activity_id),
  KEY idx_activity (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE announcements (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  title      VARCHAR(200) NOT NULL,
  content    TEXT         NOT NULL,
  type       TINYINT      NOT NULL DEFAULT 0 COMMENT '0-notice 1-policy 2-activity',
  status     TINYINT      NOT NULL DEFAULT 1 COMMENT '0-draft 1-published',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 种子数据
-- ============================================================

-- 管理员密码 admin123  /  学员密码 123456  (明文，后续接入 bcrypt 后替换)
INSERT INTO users (id, phone, password, name, avatar, role) VALUES
(1, '13800000001', 'admin123', '系统管理员', '', 2),
(2, '13800000002', '123456',  '张同学',   '', 0);

-- 8 门课程: 书画×3  声乐×2  舞蹈×2  手工×1
INSERT INTO courses (id, name, category, teacher, description, schedule_day, schedule_time, classroom, capacity, enrolled_count, status) VALUES
(1, '国画基础',   '书画', '王墨轩', '学习传统中国写意画，掌握梅兰竹菊等经典题材',         '周一', '09:00-11:00', 'A301', 25, 18, 1),
(2, '书法入门',   '书画', '李翰林', '从楷书入门，临摹颜真卿、柳公权经典碑帖',             '周三', '09:00-11:00', 'A302', 25, 22, 1),
(3, '山水画提高', '书画', '王墨轩', '深入学习山水画皴法与构图，适合有基础的学员',         '周五', '14:00-16:00', 'A301', 20, 15, 1),
(4, '声乐基础',   '声乐', '陈雅琴', '科学发声训练，学唱经典红歌与民歌',                   '周二', '09:00-11:00', 'B201', 30, 26, 1),
(5, '合唱排练',   '声乐', '陈雅琴', '多声部合唱训练，参加校内外演出',                     '周四', '14:00-16:00', 'B201', 30, 28, 1),
(6, '民族舞基础', '舞蹈', '赵曼妮', '学习藏族、蒙古族、维吾尔族等民族舞蹈基本步伐',       '周一', '14:00-16:00', 'C101', 25, 20, 1),
(7, '太极养生',   '舞蹈', '孙浩然', '二十四式简化太极拳，修身养性强身健体',               '周三', '14:00-16:00', 'C101', 30, 25, 1),
(8, '手工编织',   '手工', '周巧手', '学习钩针编织与绳结艺术，制作围巾、杯垫等实用物件',   '周二', '14:00-16:00', 'A201', 20, 12, 1);

-- 报名记录（学员张同学报了 4 门课）
INSERT INTO enrollments (user_id, course_id, status) VALUES
(2, 1, 1),
(2, 4, 1),
(2, 6, 1),
(2, 8, 1);

-- 考勤记录
INSERT INTO attendance (enrollment_id, attendance_date, status, remark) VALUES
(1, '2026-05-18', 1, ''),
(1, '2026-05-25', 1, ''),
(2, '2026-05-19', 1, ''),
(2, '2026-05-26', 1, ''),
(3, '2026-05-18', 2, '身体不适请假'),
(3, '2026-05-25', 1, ''),
(4, '2026-05-19', 1, ''),
(4, '2026-05-26', 0, '未到');

-- 社团
INSERT INTO clubs (id, name, description, member_count) VALUES
(1, '书画社', '以书会友、以画传情，定期举办笔会与作品展览',             35),
(2, '合唱团', '排练经典合唱曲目，参与社区及校际文艺演出',             42),
(3, '舞蹈队', '民族舞与交谊舞并重，强身健体、展现风采',             28);

-- 社团成员
INSERT INTO club_members (user_id, club_id, status) VALUES
(2, 1, 1),
(2, 2, 1);

-- 活动
INSERT INTO activities (id, club_id, title, description, location, start_time, end_time, capacity, registered_count, status) VALUES
(1, 1, '端午书法笔会',       '端午佳节齐聚一堂，挥毫泼墨共庆传统节日',         'A301书画教室', '2026-06-05 09:00:00', '2026-06-05 12:00:00', 40, 22, 1),
(2, 2, '七一红歌汇演',       '排练《没有共产党就没有新中国》等经典曲目，七一汇报演出', 'B201排练厅', '2026-06-20 14:00:00', '2026-06-20 17:00:00', 60, 45, 1),
(3, 3, '社区交谊舞联谊',     '与周边社区联合举办交谊舞联谊活动',               'C101舞蹈教室', '2026-06-15 14:00:00', '2026-06-15 16:30:00', 50, 30, 1),
(4, 1, '山水写生采风',       '组织学员前往公园实地写生，感受自然之美',         '校门口集合',   '2026-06-28 08:00:00', '2026-06-28 16:00:00', 25, 18, 1),
(5, 2, '中秋节诗歌朗诵会',   '诗与歌的交融，共度中秋佳节',                     '多功能厅',     '2026-09-14 09:00:00', '2026-09-14 11:30:00', 80, 10, 1);

-- 活动报名
INSERT INTO activity_registrations (user_id, activity_id, status) VALUES
(2, 1, 1),
(2, 3, 1);

-- 公告
INSERT INTO announcements (id, title, content, type, status) VALUES
(1, '2026年春季学期开学通知', '各位学员：2026年春季学期将于3月3日正式开学，请按课程表准时到校。如有疑问请致电教务处。', 0, 1),
(2, '关于课程退改的规定',     '为规范教学秩序，开学两周内可申请退课或改选，逾期不再受理。退课需填写《退课申请表》并经任课教师签字。', 1, 1),
(3, '校园开放日邀请',         '本校将于6月15日举办校园开放日，欢迎各位学员及家属参观校园、体验课程。活动当天设有免费试听课和茶歇。', 2, 1);
