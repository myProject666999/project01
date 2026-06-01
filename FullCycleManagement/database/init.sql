-- 创建数据库
CREATE DATABASE IF NOT EXISTS lawfirm_case DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lawfirm_case;

-- 律师表
CREATE TABLE IF NOT EXISTS lawyer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '律师姓名',
    license_number VARCHAR(50) UNIQUE COMMENT '执业证号',
    phone VARCHAR(20) COMMENT '电话',
    email VARCHAR(100) COMMENT '邮箱',
    specialty VARCHAR(200) COMMENT '专业领域',
    hourly_rate DECIMAL(10,2) DEFAULT 0 COMMENT '小时费率',
    status TINYINT DEFAULT 1 COMMENT '状态 1-在职 0-离职',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='律师表';

-- 当事人表（包含我方和对方）
CREATE TABLE IF NOT EXISTS client (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '当事人姓名/名称',
    normalized_name VARCHAR(100) COMMENT '归一化姓名（用于冲突检索）',
    id_card VARCHAR(50) COMMENT '身份证号/统一社会信用代码',
    phone VARCHAR(20) COMMENT '电话',
    address VARCHAR(300) COMMENT '地址',
    client_type TINYINT DEFAULT 1 COMMENT '类型 1-个人 2-企业',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_normalized_name (normalized_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='当事人表';

-- 案件表
CREATE TABLE IF NOT EXISTS legal_case (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(50) UNIQUE COMMENT '案件编号',
    case_name VARCHAR(200) NOT NULL COMMENT '案件名称',
    case_type TINYINT NOT NULL COMMENT '案件类型 1-民事 2-刑事 3-行政 4-仲裁 5-其他',
    status VARCHAR(30) NOT NULL DEFAULT 'CONSULTATION' COMMENT '案件状态：CONSULTATION-咨询接洽, ACCEPTED-已接受, FILING-立案中, FILED-已立案, HEARING-庭审中, JUDGED-已判决, EXECUTION-执行中, CLOSED-已结案, ARCHIVED-已归档',
    case_description TEXT COMMENT '案件描述',
    client_id BIGINT COMMENT '我方当事人ID',
    opposing_party_id BIGINT COMMENT '对方当事人ID',
    court VARCHAR(200) COMMENT '受理法院',
    judge VARCHAR(50) COMMENT '承办法官',
    filing_date DATE COMMENT '立案日期',
    hearing_date DATE COMMENT '开庭日期',
    judgment_date DATE COMMENT '判决日期',
    close_date DATE COMMENT '结案日期',
    archive_date DATE COMMENT '归档日期',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES client(id),
    FOREIGN KEY (opposing_party_id) REFERENCES client(id),
    INDEX idx_case_number (case_number),
    INDEX idx_status (status),
    INDEX idx_case_type (case_type),
    INDEX idx_client_id (client_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案件表';

-- 案件律师关联表
CREATE TABLE IF NOT EXISTS case_lawyer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT NOT NULL,
    lawyer_id BIGINT NOT NULL,
    role TINYINT DEFAULT 1 COMMENT '角色 1-主办律师 2-协办律师',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES legal_case(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyer(id),
    UNIQUE KEY uk_case_lawyer (case_id, lawyer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案件律师关联表';

-- 文书表
CREATE TABLE IF NOT EXISTS document (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT NOT NULL,
    doc_type VARCHAR(50) COMMENT '文书类型',
    doc_name VARCHAR(200) NOT NULL COMMENT '文书名称',
    template_code VARCHAR(50) COMMENT '模板编号',
    file_path VARCHAR(500) COMMENT '文件路径',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES legal_case(id) ON DELETE CASCADE,
    INDEX idx_case_id (case_id),
    INDEX idx_doc_type (doc_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文书表';

-- 开庭安排表
CREATE TABLE IF NOT EXISTS court_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT NOT NULL,
    session_time DATETIME NOT NULL COMMENT '开庭时间',
    court_room VARCHAR(100) COMMENT '法庭',
    judge VARCHAR(50) COMMENT '法官',
    clerk VARCHAR(50) COMMENT '书记员',
    notes TEXT COMMENT '备注',
    status TINYINT DEFAULT 1 COMMENT '状态 1-待开庭 2-已开庭 3-已取消',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES legal_case(id) ON DELETE CASCADE,
    INDEX idx_case_id (case_id),
    INDEX idx_session_time (session_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='开庭安排表';

-- 工时记录表
CREATE TABLE IF NOT EXISTS work_hour (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT NOT NULL,
    lawyer_id BIGINT NOT NULL,
    work_date DATE NOT NULL COMMENT '工作日期',
    work_minutes INT NOT NULL COMMENT '工作时长（分钟）',
    billing_units INT NOT NULL COMMENT '计费单元（每6分钟一个单元）',
    work_content VARCHAR(500) COMMENT '工作内容',
    work_type VARCHAR(50) COMMENT '工作类型',
    hourly_rate DECIMAL(10,2) COMMENT '小时费率',
    total_amount DECIMAL(10,2) COMMENT '总金额',
    is_billed TINYINT DEFAULT 0 COMMENT '是否已开票',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES legal_case(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyer(id),
    INDEX idx_case_id (case_id),
    INDEX idx_lawyer_id (lawyer_id),
    INDEX idx_work_date (work_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工时记录表';

-- 案件状态流转记录表
CREATE TABLE IF NOT EXISTS case_status_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT NOT NULL,
    previous_status VARCHAR(30) COMMENT '变更前状态',
    new_status VARCHAR(30) NOT NULL COMMENT '变更后状态',
    changed_by BIGINT COMMENT '操作人ID',
    change_reason VARCHAR(500) COMMENT '变更原因',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES legal_case(id) ON DELETE CASCADE,
    INDEX idx_case_id (case_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案件状态流转记录表';

-- 文书模板表
CREATE TABLE IF NOT EXISTS document_template (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_code VARCHAR(50) UNIQUE NOT NULL COMMENT '模板编号',
    template_name VARCHAR(200) NOT NULL COMMENT '模板名称',
    template_type VARCHAR(50) COMMENT '模板类型',
    file_path VARCHAR(500) NOT NULL COMMENT '模板文件路径',
    description VARCHAR(500) COMMENT '描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_template_code (template_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文书模板表';

-- 初始化测试数据
INSERT INTO lawyer (name, license_number, phone, email, specialty, hourly_rate) VALUES
('张伟', '1110120201000001', '13800138001', 'zhangwei@lawfirm.com', '民事、商事', 800.00),
('李芳', '1110120201000002', '13800138002', 'lifang@lawfirm.com', '刑事辩护', 1000.00),
('王强', '1110120201000003', '13800138003', 'wangqiang@lawfirm.com', '行政诉讼', 700.00),
('赵敏', '1110120201000004', '13800138004', 'zhaomin@lawfirm.com', '知识产权', 900.00);

INSERT INTO client (name, normalized_name, id_card, phone, address, client_type) VALUES
('北京科技有限公司', 'beijingkejiyouxiangongsi', '91110000MA00000000', '010-12345678', '北京市海淀区中关村大街1号', 2),
('张三', 'zhangsan', '110101199001011234', '13900139001', '北京市朝阳区望京', 1),
('李四', 'lisi', '110101199002025678', '13900139002', '北京市西城区', 1),
('上海贸易有限公司', 'shanghaimaoyiyouxiangongsi', '91310000MA00000000', '021-87654321', '上海市浦东新区陆家嘴', 2);

INSERT INTO legal_case (case_number, case_name, case_type, status, case_description, client_id, opposing_party_id, court, filing_date) VALUES
('CASE20240001', '北京科技有限公司与上海贸易有限公司合同纠纷案', 1, 'FILED', '合同货款纠纷，涉案金额500万元', 1, 4, '北京市第一中级人民法院', '2024-01-15'),
('CASE20240002', '张三故意伤害案', 2, 'HEARING', '涉嫌故意伤害，现审查起诉阶段', 2, NULL, '北京市朝阳区人民法院', '2024-02-01'),
('CASE20240003', '李四行政复议案', 3, 'CONSULTATION', '行政处罚异议，正在咨询接洽', 3, NULL, NULL, NULL);

INSERT INTO case_lawyer (case_id, lawyer_id, role) VALUES
(1, 1, 1),
(1, 4, 2),
(2, 2, 1),
(3, 3, 1);

INSERT INTO work_hour (case_id, lawyer_id, work_date, work_minutes, billing_units, work_content, work_type, hourly_rate, total_amount) VALUES
(1, 1, '2024-01-16', 120, 20, '撰写起诉状', '文书撰写', 800.00, 1600.00),
(1, 1, '2024-01-17', 180, 30, '调查取证', '调查取证', 800.00, 2400.00),
(1, 4, '2024-01-18', 60, 10, '整理证据清单', '文书撰写', 900.00, 900.00),
(2, 2, '2024-02-02', 120, 20, '会见当事人', '会见', 1000.00, 2000.00);

INSERT INTO case_status_log (case_id, previous_status, new_status, change_reason) VALUES
(1, 'CONSULTATION', 'ACCEPTED', '客户委托，签订代理合同'),
(1, 'ACCEPTED', 'FILING', '准备立案材料'),
(1, 'FILING', 'FILED', '法院受理立案'),
(2, 'CONSULTATION', 'ACCEPTED', '客户委托'),
(2, 'ACCEPTED', 'FILING', '准备起诉'),
(2, 'FILING', 'FILED', '法院受理'),
(2, 'FILED', 'HEARING', '确定开庭时间');

INSERT INTO document_template (template_code, template_name, template_type, file_path, description) VALUES
('COMPLAINT', '民事起诉状模板', '诉讼文书', 'templates/complaint.docx', '民事诉讼案件起诉状标准模板'),
('ANSWER', '答辩状模板', '诉讼文书', 'templates/answer.docx', '民事答辩状模板'),
('CONTRACT', '委托代理合同模板', '合同文书', 'templates/agency_contract.docx', '律师委托代理合同'),
('POWER', '授权委托书模板', '法律文书', 'templates/power_of_attorney.docx', '授权委托书模板');
