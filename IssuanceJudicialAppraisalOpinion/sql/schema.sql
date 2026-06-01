-- 司法鉴定意见书出具系统数据库
-- 核心概念：检材监管链

CREATE DATABASE IF NOT EXISTS judicial_appraisal DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE judicial_appraisal;

-- ============================================
-- 1. 系统用户表
-- ============================================
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录账号',
    password VARCHAR(100) NOT NULL COMMENT '密码(BCrypt加密)',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    role VARCHAR(20) NOT NULL COMMENT '角色：ADMIN-管理员, APPRAISER-鉴定人, REVIEWER1-一级复核, REVIEWER2-二级复核, REVIEWER3-三级复核',
    qualification_no VARCHAR(50) COMMENT '执业资格证号',
    phone VARCHAR(20),
    email VARCHAR(100),
    signature_pkcs7 TEXT COMMENT 'PKCS#7格式电子签名',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用, 0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB COMMENT='系统用户表';

-- ============================================
-- 2. 委托人表
-- ============================================
DROP TABLE IF EXISTS client;
CREATE TABLE client (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    client_type VARCHAR(20) NOT NULL COMMENT '类型：PERSON-个人, ORG-机构',
    name VARCHAR(100) NOT NULL COMMENT '委托人姓名/单位名称',
    id_card_no VARCHAR(30) COMMENT '身份证号/统一社会信用代码',
    contact_person VARCHAR(50),
    contact_phone VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_id_card (id_card_no)
) ENGINE=InnoDB COMMENT='委托人表';

-- ============================================
-- 3. 委托登记表
-- ============================================
DROP TABLE IF EXISTS entrustment;
CREATE TABLE entrustment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entrustment_no VARCHAR(50) NOT NULL UNIQUE COMMENT '委托编号',
    client_id BIGINT NOT NULL COMMENT '委托人ID',
    case_name VARCHAR(200) NOT NULL COMMENT '案件名称',
    case_description TEXT COMMENT '案情简介',
    appraisal_type VARCHAR(50) NOT NULL COMMENT '鉴定类型：FORENSIC-法医, TRACE-痕迹, ELECTRONIC-电子数据',
    appraisal_matter VARCHAR(200) NOT NULL COMMENT '鉴定事项',
    entrust_date DATE NOT NULL COMMENT '委托日期',
    deadline DATE COMMENT '要求完成日期',
    status VARCHAR(20) DEFAULT 'REGISTERED' COMMENT '状态：REGISTERED-已登记, ACCEPTED-已受理, IN_PROGRESS-鉴定中, REVIEWING-复核中, COMPLETED-已完成, REJECTED-已退回',
    created_by BIGINT NOT NULL COMMENT '登记人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES client(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_entrustment_no (entrustment_no),
    INDEX idx_status (status),
    INDEX idx_appraisal_type (appraisal_type)
) ENGINE=InnoDB COMMENT='委托登记表';

-- ============================================
-- 4. 检材表
-- ============================================
DROP TABLE IF EXISTS evidence;
CREATE TABLE evidence (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    evidence_no VARCHAR(50) NOT NULL UNIQUE COMMENT '检材编号(封条编号)',
    entrustment_id BIGINT NOT NULL COMMENT '委托ID',
    evidence_name VARCHAR(200) NOT NULL COMMENT '检材名称',
    evidence_type VARCHAR(50) COMMENT '检材类型',
    description TEXT COMMENT '检材描述',
    quantity INT DEFAULT 1 COMMENT '数量',
    weight DECIMAL(10,3) COMMENT '重量(克)',
    seal_status VARCHAR(20) DEFAULT 'SEALED' COMMENT '封存状态：SEALED-已封存, UNSEALED-已启封, RETURNED-已退回',
    storage_location VARCHAR(100) COMMENT '存放位置',
    receive_time DATETIME NOT NULL COMMENT '接收时间',
    received_by BIGINT NOT NULL COMMENT '接收人ID',
    delivered_by VARCHAR(100) NOT NULL COMMENT '送检人',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entrustment_id) REFERENCES entrustment(id),
    FOREIGN KEY (received_by) REFERENCES sys_user(id),
    INDEX idx_evidence_no (evidence_no),
    INDEX idx_entrustment_id (entrustment_id),
    INDEX idx_seal_status (seal_status)
) ENGINE=InnoDB COMMENT='检材表';

-- ============================================
-- 5. 检材监管链表 - 核心表
-- ============================================
DROP TABLE IF EXISTS evidence_chain;
CREATE TABLE evidence_chain (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    evidence_id BIGINT NOT NULL COMMENT '检材ID',
    chain_no VARCHAR(50) NOT NULL UNIQUE COMMENT '监管链流水号',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型：RECEIVE-接收, SEAL-封存, UNSEAL-启封, TRANSFER-交接, INSPECT-检验, RETURN-退回',
    operation_time DATETIME NOT NULL COMMENT '操作时间',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    operator_signature TEXT COMMENT '操作人签名(PKCS#7)',
    counterpart_id BIGINT COMMENT '对方人员ID(交接时需要)',
    counterpart_signature TEXT COMMENT '对方签名(PKCS#7)',
    previous_seal_status VARCHAR(20) COMMENT '操作前封存状态',
    new_seal_status VARCHAR(20) COMMENT '操作后封存状态',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id),
    FOREIGN KEY (operator_id) REFERENCES sys_user(id),
    FOREIGN KEY (counterpart_id) REFERENCES sys_user(id),
    INDEX idx_evidence_id (evidence_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_operation_time (operation_time),
    INDEX idx_chain_no (chain_no)
) ENGINE=InnoDB COMMENT='检材监管链表';

-- ============================================
-- 6. 鉴定任务表
-- ============================================
DROP TABLE IF EXISTS appraisal_task;
CREATE TABLE appraisal_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    task_no VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号',
    entrustment_id BIGINT NOT NULL COMMENT '委托ID',
    evidence_id BIGINT COMMENT '检材ID',
    appraiser_id BIGINT NOT NULL COMMENT '鉴定人ID',
    assistant_id BIGINT COMMENT '助理鉴定人ID',
    task_description TEXT COMMENT '任务说明',
    status VARCHAR(20) DEFAULT 'ASSIGNED' COMMENT '状态：ASSIGNED-已分派, IN_PROGRESS-进行中, COMPLETED-已完成, CANCELLED-已取消',
    assign_time DATETIME COMMENT '分派时间',
    start_time DATETIME COMMENT '开始时间',
    complete_time DATETIME COMMENT '完成时间',
    created_by BIGINT NOT NULL COMMENT '派单人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entrustment_id) REFERENCES entrustment(id),
    FOREIGN KEY (evidence_id) REFERENCES evidence(id),
    FOREIGN KEY (appraiser_id) REFERENCES sys_user(id),
    FOREIGN KEY (assistant_id) REFERENCES sys_user(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_task_no (task_no),
    INDEX idx_entrustment_id (entrustment_id),
    INDEX idx_appraiser_id (appraiser_id),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='鉴定任务表';

-- ============================================
-- 7. 检验记录表
-- ============================================
DROP TABLE IF EXISTS inspection_record;
CREATE TABLE inspection_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    record_no VARCHAR(50) NOT NULL UNIQUE COMMENT '记录编号',
    task_id BIGINT NOT NULL COMMENT '任务ID',
    evidence_id BIGINT NOT NULL COMMENT '检材ID',
    inspection_date DATE NOT NULL COMMENT '检验日期',
    inspection_location VARCHAR(100) COMMENT '检验地点',
    environment_desc TEXT COMMENT '环境条件(温度/湿度等)',
    method TEXT COMMENT '检验方法',
    process TEXT COMMENT '检验过程',
    result TEXT COMMENT '检验结果',
    instrument VARCHAR(200) COMMENT '使用仪器',
    appraiser_id BIGINT NOT NULL COMMENT '鉴定人ID',
    appraiser_signature TEXT COMMENT '鉴定人签名',
    assistant_id BIGINT COMMENT '助理鉴定人ID',
    assistant_signature TEXT COMMENT '助理签名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES appraisal_task(id),
    FOREIGN KEY (evidence_id) REFERENCES evidence(id),
    FOREIGN KEY (appraiser_id) REFERENCES sys_user(id),
    FOREIGN KEY (assistant_id) REFERENCES sys_user(id),
    INDEX idx_record_no (record_no),
    INDEX idx_task_id (task_id),
    INDEX idx_evidence_id (evidence_id)
) ENGINE=InnoDB COMMENT='检验记录表';

-- ============================================
-- 8. 司法鉴定意见书表
-- ============================================
DROP TABLE IF EXISTS opinion;
CREATE TABLE opinion (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    opinion_no VARCHAR(50) NOT NULL UNIQUE COMMENT '意见书编号',
    entrustment_id BIGINT NOT NULL COMMENT '委托ID',
    version INT DEFAULT 1 COMMENT '版本号',
    title VARCHAR(200) NOT NULL COMMENT '意见书标题',
    basic_info TEXT COMMENT '基本情况',
    inspection_info TEXT COMMENT '检验情况',
    analysis_description TEXT COMMENT '分析说明',
    conclusion TEXT NOT NULL COMMENT '鉴定意见',
    appraiser1_id BIGINT NOT NULL COMMENT '第一鉴定人',
    appraiser1_signature TEXT COMMENT '第一鉴定人签名',
    appraiser2_id BIGINT COMMENT '第二鉴定人',
    appraiser2_signature TEXT COMMENT '第二鉴定人签名',
    reviewer1_id BIGINT COMMENT '一级复核人',
    reviewer1_signature TEXT COMMENT '一级复核人签名',
    reviewer2_id BIGINT COMMENT '二级复核人',
    reviewer2_signature TEXT COMMENT '二级复核人签名',
    reviewer3_id BIGINT COMMENT '三级复核人',
    reviewer3_signature TEXT COMMENT '三级复核人签名',
    issue_date DATE COMMENT '出具日期',
    verify_code VARCHAR(100) UNIQUE COMMENT '验真码(二维码内容)',
    qr_code_path VARCHAR(255) COMMENT '二维码图片路径',
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态：DRAFT-草稿, REVIEW1-一级复核中, REVIEW2-二级复核中, REVIEW3-三级复核中, REJECTED-已驳回, ISSUED-已出具',
    current_review_level INT DEFAULT 0 COMMENT '当前复核级别：0-未复核,1-一级,2-二级,3-三级',
    created_by BIGINT NOT NULL COMMENT '创建人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entrustment_id) REFERENCES entrustment(id),
    FOREIGN KEY (appraiser1_id) REFERENCES sys_user(id),
    FOREIGN KEY (appraiser2_id) REFERENCES sys_user(id),
    FOREIGN KEY (reviewer1_id) REFERENCES sys_user(id),
    FOREIGN KEY (reviewer2_id) REFERENCES sys_user(id),
    FOREIGN KEY (reviewer3_id) REFERENCES sys_user(id),
    FOREIGN KEY (created_by) REFERENCES sys_user(id),
    INDEX idx_opinion_no (opinion_no),
    INDEX idx_entrustment_id (entrustment_id),
    INDEX idx_verify_code (verify_code),
    INDEX idx_status (status)
) ENGINE=InnoDB COMMENT='司法鉴定意见书表';

-- ============================================
-- 9. 复核记录表 - 支持驳回回流
-- ============================================
DROP TABLE IF EXISTS review_record;
CREATE TABLE review_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    opinion_id BIGINT NOT NULL COMMENT '意见书ID',
    review_level INT NOT NULL COMMENT '复核级别：1-一级,2-二级,3-三级',
    reviewer_id BIGINT NOT NULL COMMENT '复核人ID',
    reviewer_signature TEXT COMMENT '复核人签名',
    result VARCHAR(20) NOT NULL COMMENT '复核结果：PASS-通过, REJECT-驳回',
    reject_target_level INT COMMENT '打回目标级别：0-退回撰写人,1-退回一级,2-退回二级',
    opinion TEXT NOT NULL COMMENT '复核意见',
    review_time DATETIME NOT NULL COMMENT '复核时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (opinion_id) REFERENCES opinion(id),
    FOREIGN KEY (reviewer_id) REFERENCES sys_user(id),
    INDEX idx_opinion_id (opinion_id),
    INDEX idx_review_level (review_level),
    INDEX idx_review_time (review_time)
) ENGINE=InnoDB COMMENT='复核记录表';

-- ============================================
-- 10. 附件表 - 照片等
-- ============================================
DROP TABLE IF EXISTS attachment;
CREATE TABLE attachment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    attachment_no VARCHAR(50) NOT NULL UNIQUE COMMENT '附件编号',
    biz_type VARCHAR(50) NOT NULL COMMENT '业务类型：EVIDENCE-检材照片, INSPECTION-检验照片, OPINION-意见书附件',
    biz_id BIGINT NOT NULL COMMENT '业务ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(255) NOT NULL COMMENT '存储路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型',
    watermark_info TEXT COMMENT '水印信息(JSON: timestamp, location, hash)',
    file_hash VARCHAR(64) COMMENT '文件哈希(SHA-256)',
    uploaded_by BIGINT NOT NULL COMMENT '上传人ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES sys_user(id),
    INDEX idx_attachment_no (attachment_no),
    INDEX idx_biz (biz_type, biz_id),
    INDEX idx_file_hash (file_hash)
) ENGINE=InnoDB COMMENT='附件表';

-- ============================================
-- 11. 验真记录表 - 防爬限频
-- ============================================
DROP TABLE IF EXISTS verify_log;
CREATE TABLE verify_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    verify_code VARCHAR(100) NOT NULL COMMENT '验真码',
    client_ip VARCHAR(50) COMMENT '客户端IP',
    user_agent VARCHAR(500) COMMENT '用户代理',
    verify_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '验真时间',
    result VARCHAR(20) COMMENT '结果：SUCCESS-成功, FAILED-失败, RATE_LIMITED-被限频',
    INDEX idx_verify_code (verify_code),
    INDEX idx_client_ip (client_ip),
    INDEX idx_verify_time (verify_time)
) ENGINE=InnoDB COMMENT='验真记录表';

-- ============================================
-- 初始化数据
-- ============================================

-- 插入测试用户(密码都是123456，BCrypt加密)
INSERT INTO sys_user (username, password, real_name, role, qualification_no, phone, email) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '系统管理员', 'ADMIN', NULL, '13800000000', 'admin@judicial.com'),
('appraiser1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '张法医', 'APPRAISER', 'FA2023001', '13800000001', 'zhang@judicial.com'),
('appraiser2', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '李痕迹', 'APPRAISER', 'TR2023001', '13800000002', 'li@judicial.com'),
('appraiser3', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '王电子', 'APPRAISER', 'EL2023001', '13800000003', 'wang@judicial.com'),
('reviewer1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '陈复核', 'REVIEWER1', 'RV2023001', '13800000004', 'chen1@judicial.com'),
('reviewer2', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '刘审核', 'REVIEWER2', 'RV2023002', '13800000005', 'chen2@judicial.com'),
('reviewer3', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', '赵审定', 'REVIEWER3', 'RV2023003', '13800000006', 'chen3@judicial.com');

-- 插入测试委托人
INSERT INTO client (client_type, name, id_card_no, contact_person, contact_phone, address) VALUES
('ORG', '某市公安局', '123456789012345678', '王警官', '13900000001', '某市某区公安路1号'),
('PERSON', '张三', '110101199001011234', '张三', '13900000002', '某市某区某街道100号');
