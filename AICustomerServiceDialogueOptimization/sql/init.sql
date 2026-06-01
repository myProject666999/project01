-- =====================================================
-- AI客服对话质检与话术优化系统 - 数据库初始化脚本
-- =====================================================

CREATE DATABASE IF NOT EXISTS ai_cs_quality DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ai_cs_quality;

-- =====================================================
-- 1. 客服人员表
-- =====================================================
DROP TABLE IF EXISTS cs_customer_service;
CREATE TABLE cs_customer_service (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    staff_no VARCHAR(32) NOT NULL UNIQUE COMMENT '员工编号',
    name VARCHAR(64) NOT NULL COMMENT '姓名',
    department VARCHAR(64) COMMENT '部门',
    team VARCHAR(64) COMMENT '班组',
    position VARCHAR(32) COMMENT '职位',
    status TINYINT DEFAULT 1 COMMENT '状态：1-在职，0-离职',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_department (department),
    INDEX idx_team (team)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客服人员表';

-- =====================================================
-- 2. 会话主表
-- =====================================================
DROP TABLE IF EXISTS cs_conversation;
CREATE TABLE cs_conversation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL UNIQUE COMMENT '会话ID',
    cs_id BIGINT NOT NULL COMMENT '客服ID',
    cs_name VARCHAR(64) NOT NULL COMMENT '客服姓名',
    customer_no VARCHAR(64) COMMENT '客户编号',
    customer_nickname VARCHAR(64) COMMENT '客户昵称',
    channel VARCHAR(32) COMMENT '渠道：APP/WEB/WECHAT/PHONE',
    start_time DATETIME NOT NULL COMMENT '会话开始时间',
    end_time DATETIME COMMENT '会话结束时间',
    duration INT COMMENT '会话时长(秒)',
    message_count INT DEFAULT 0 COMMENT '消息数量',
    privacy_level TINYINT DEFAULT 1 COMMENT '隐私分级：1-普通，2-敏感，3-机密',
    quality_status TINYINT DEFAULT 0 COMMENT '质检状态：0-待质检，1-质检中，2-已质检，3-需复检',
    total_score DECIMAL(5,2) COMMENT '质检总分',
    has_violation TINYINT DEFAULT 0 COMMENT '是否有违规：0-否，1-是',
    ai_emotion VARCHAR(32) COMMENT 'AI分析情绪：POSITIVE/NEUTRAL/NEGATIVE',
    ai_satisfaction_score DECIMAL(5,2) COMMENT 'AI满意度评分',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_cs_id (cs_id),
    INDEX idx_start_time (start_time),
    INDEX idx_quality_status (quality_status),
    INDEX idx_privacy_level (privacy_level),
    INDEX idx_has_violation (has_violation)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会话主表';

-- =====================================================
-- 3. 会话消息明细表
-- =====================================================
DROP TABLE IF EXISTS cs_conversation_message;
CREATE TABLE cs_conversation_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    msg_id VARCHAR(64) NOT NULL UNIQUE COMMENT '消息ID',
    sender_type TINYINT NOT NULL COMMENT '发送方：1-客户，2-客服',
    sender_name VARCHAR(64) COMMENT '发送者名称',
    content TEXT NOT NULL COMMENT '消息内容',
    send_time DATETIME NOT NULL COMMENT '发送时间',
    response_time INT COMMENT '响应时长(毫秒) - 针对客服消息',
    is_desensitized TINYINT DEFAULT 0 COMMENT '是否已脱敏：0-否，1-是',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_session_id (session_id),
    INDEX idx_send_time (send_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='会话消息明细表';

-- =====================================================
-- 4. 质检规则表
-- =====================================================
DROP TABLE IF EXISTS cs_quality_rule;
CREATE TABLE cs_quality_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    rule_code VARCHAR(32) NOT NULL UNIQUE COMMENT '规则编码',
    rule_name VARCHAR(128) NOT NULL COMMENT '规则名称',
    rule_type TINYINT NOT NULL COMMENT '规则类型：1-敏感词，2-流程规范，3-响应时长，4-服务态度',
    rule_content TEXT COMMENT '规则内容',
    score_weight DECIMAL(5,2) DEFAULT 10.00 COMMENT '规则权重分值',
    deduct_score DECIMAL(5,2) DEFAULT 0.00 COMMENT '违规扣分值',
    violation_level TINYINT DEFAULT 1 COMMENT '违规等级：1-轻微，2-一般，3-严重',
    is_enabled TINYINT DEFAULT 1 COMMENT '是否启用：0-禁用，1-启用',
    create_by VARCHAR(64) COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_rule_type (rule_type),
    INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质检规则表';

-- =====================================================
-- 5. 敏感词表
-- =====================================================
DROP TABLE IF EXISTS cs_sensitive_word;
CREATE TABLE cs_sensitive_word (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    word VARCHAR(128) NOT NULL UNIQUE COMMENT '敏感词',
    word_type TINYINT DEFAULT 1 COMMENT '类型：1-辱骂，2-政治，3-广告，4-隐私泄露',
    violation_level TINYINT DEFAULT 1 COMMENT '违规等级：1-轻微，2-一般，3-严重',
    is_enabled TINYINT DEFAULT 1 COMMENT '是否启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_word_type (word_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='敏感词表';

-- =====================================================
-- 6. 质检任务表
-- =====================================================
DROP TABLE IF EXISTS cs_quality_task;
CREATE TABLE cs_quality_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_no VARCHAR(64) NOT NULL UNIQUE COMMENT '任务编号',
    task_name VARCHAR(128) NOT NULL COMMENT '任务名称',
    task_type TINYINT DEFAULT 1 COMMENT '任务类型：1-全量质检，2-抽样质检，3-定向质检',
    quality_type TINYINT DEFAULT 3 COMMENT '质检方式：1-规则质检，2-AI质检，3-混合质检',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待执行，1-执行中，2-已完成，3-失败',
    total_count INT DEFAULT 0 COMMENT '总会话数',
    processed_count INT DEFAULT 0 COMMENT '已处理数',
    pass_count INT DEFAULT 0 COMMENT '通过数',
    violation_count INT DEFAULT 0 COMMENT '违规数',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    time_range_start DATETIME COMMENT '会话时间范围-开始',
    time_range_end DATETIME COMMENT '会话时间范围-结束',
    cs_ids TEXT COMMENT '指定客服ID列表(逗号分隔)',
    create_by VARCHAR(64) COMMENT '创建人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_status (status),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='质检任务表';

-- =====================================================
-- 7. 质检结果表 - 规则质检结果
-- =====================================================
DROP TABLE IF EXISTS cs_quality_result_rule;
CREATE TABLE cs_quality_result_rule (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT COMMENT '质检任务ID',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    rule_id BIGINT NOT NULL COMMENT '规则ID',
    rule_code VARCHAR(32) COMMENT '规则编码',
    rule_name VARCHAR(128) COMMENT '规则名称',
    rule_type TINYINT COMMENT '规则类型',
    is_pass TINYINT NOT NULL COMMENT '是否通过：0-不通过，1-通过',
    deduct_score DECIMAL(5,2) DEFAULT 0.00 COMMENT '扣分值',
    violation_level TINYINT COMMENT '违规等级',
    hit_content TEXT COMMENT '命中内容',
    hit_message_id VARCHAR(64) COMMENT '命中消息ID',
    remark VARCHAR(512) COMMENT '备注',
    quality_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '质检时间',
    INDEX idx_task_id (task_id),
    INDEX idx_session_id (session_id),
    INDEX idx_is_pass (is_pass)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='规则质检结果表';

-- =====================================================
-- 8. 质检结果表 - AI质检结果
-- =====================================================
DROP TABLE IF EXISTS cs_quality_result_ai;
CREATE TABLE cs_quality_result_ai (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    task_id BIGINT COMMENT '质检任务ID',
    session_id VARCHAR(64) NOT NULL UNIQUE COMMENT '会话ID',
    emotion VARCHAR(32) COMMENT '情绪分析：POSITIVE/NEUTRAL/NEGATIVE',
    emotion_confidence DECIMAL(5,4) COMMENT '情绪置信度',
    satisfaction_score DECIMAL(5,2) COMMENT '满意度评分(0-100)',
    service_attitude_score DECIMAL(5,2) COMMENT '服务态度评分',
    professional_score DECIMAL(5,2) COMMENT '专业度评分',
    response_timeliness_score DECIMAL(5,2) COMMENT '响应及时性评分',
    ai_summary TEXT COMMENT 'AI分析总结',
    risk_tags VARCHAR(256) COMMENT '风险标签(逗号分隔)',
    quality_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '质检时间',
    INDEX idx_task_id (task_id),
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI质检结果表';

-- =====================================================
-- 9. 违规记录表
-- =====================================================
DROP TABLE IF EXISTS cs_violation_record;
CREATE TABLE cs_violation_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    violation_no VARCHAR(64) NOT NULL UNIQUE COMMENT '违规编号',
    session_id VARCHAR(64) NOT NULL COMMENT '会话ID',
    cs_id BIGINT COMMENT '客服ID',
    cs_name VARCHAR(64) COMMENT '客服姓名',
    rule_id BIGINT COMMENT '触发规则ID',
    rule_name VARCHAR(128) COMMENT '规则名称',
    violation_type TINYINT COMMENT '违规类型',
    violation_level TINYINT DEFAULT 1 COMMENT '违规等级：1-轻微，2-一般，3-严重',
    deduct_score DECIMAL(5,2) DEFAULT 0.00 COMMENT '扣分值',
    hit_content TEXT COMMENT '违规内容',
    status TINYINT DEFAULT 1 COMMENT '状态：1-待确认，2-已确认，3-申诉中，4-已撤销',
    can_appeal TINYINT DEFAULT 1 COMMENT '是否可申诉：0-否，1-是',
    is_appealed TINYINT DEFAULT 0 COMMENT '是否已申诉：0-否，1-是',
    confirm_time DATETIME COMMENT '确认时间',
    confirm_by VARCHAR(64) COMMENT '确认人',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_session_id (session_id),
    INDEX idx_cs_id (cs_id),
    INDEX idx_status (status),
    INDEX idx_violation_level (violation_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='违规记录表';

-- =====================================================
-- 10. 申诉表
-- =====================================================
DROP TABLE IF EXISTS cs_appeal;
CREATE TABLE cs_appeal (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    appeal_no VARCHAR(64) NOT NULL UNIQUE COMMENT '申诉编号',
    violation_id BIGINT NOT NULL COMMENT '违规记录ID',
    session_id VARCHAR(64) COMMENT '会话ID',
    appellant_id BIGINT COMMENT '申诉人ID',
    appellant_name VARCHAR(64) COMMENT '申诉人姓名',
    appeal_reason TEXT NOT NULL COMMENT '申诉理由',
    appeal_evidence TEXT COMMENT '申诉证据',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-审核通过，2-审核驳回',
    auditor_id BIGINT COMMENT '审核人ID',
    auditor_name VARCHAR(64) COMMENT '审核人姓名',
    audit_opinion TEXT COMMENT '审核意见',
    submit_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间',
    audit_time DATETIME COMMENT '审核时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_violation_id (violation_id),
    INDEX idx_appellant_id (appellant_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='申诉表';

-- =====================================================
-- 11. 申诉流程记录表 - 申诉流程留痕
-- =====================================================
DROP TABLE IF EXISTS cs_appeal_flow;
CREATE TABLE cs_appeal_flow (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    appeal_id BIGINT NOT NULL COMMENT '申诉ID',
    operator_id BIGINT COMMENT '操作人ID',
    operator_name VARCHAR(64) COMMENT '操作人姓名',
    action VARCHAR(32) NOT NULL COMMENT '操作动作：SUBMIT/AUDIT_PASS/AUDIT_REJECT',
    remark TEXT COMMENT '操作备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_appeal_id (appeal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='申诉流程记录表';

-- =====================================================
-- 12. 优秀话术库表
-- =====================================================
DROP TABLE IF EXISTS cs_script_library;
CREATE TABLE cs_script_library (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    script_code VARCHAR(64) NOT NULL UNIQUE COMMENT '话术编码',
    category_id BIGINT COMMENT '分类ID',
    category_name VARCHAR(64) COMMENT '分类名称',
    title VARCHAR(256) NOT NULL COMMENT '话术标题',
    content TEXT NOT NULL COMMENT '话术内容',
    scene_desc TEXT COMMENT '适用场景描述',
    keywords VARCHAR(256) COMMENT '关键词(逗号分隔)',
    use_count INT DEFAULT 0 COMMENT '使用次数',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    source_session_id VARCHAR(64) COMMENT '来源会话ID',
    creator_id BIGINT COMMENT '创建人ID',
    creator_name VARCHAR(64) COMMENT '创建人姓名',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_keywords (keywords)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优秀话术库表';

-- =====================================================
-- 13. 话术分类表
-- =====================================================
DROP TABLE IF EXISTS cs_script_category;
CREATE TABLE cs_script_category (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    category_code VARCHAR(32) NOT NULL UNIQUE COMMENT '分类编码',
    category_name VARCHAR(64) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='话术分类表';

-- =====================================================
-- 14. 客服评分表 - 评分可复算
-- =====================================================
DROP TABLE IF EXISTS cs_cs_score;
CREATE TABLE cs_cs_score (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    cs_id BIGINT NOT NULL COMMENT '客服ID',
    cs_name VARCHAR(64) COMMENT '客服姓名',
    statistics_month VARCHAR(7) NOT NULL COMMENT '统计月份：yyyy-MM',
    total_conversation_count INT DEFAULT 0 COMMENT '总会话数',
    quality_count INT DEFAULT 0 COMMENT '质检会话数',
    pass_count INT DEFAULT 0 COMMENT '通过数',
    violation_count INT DEFAULT 0 COMMENT '违规数',
    rule_score DECIMAL(5,2) DEFAULT 100.00 COMMENT '规则质检得分',
    ai_score DECIMAL(5,2) COMMENT 'AI质检得分',
    total_score DECIMAL(5,2) COMMENT '综合得分',
    avg_response_time INT COMMENT '平均响应时长(毫秒)',
    avg_satisfaction_score DECIMAL(5,2) COMMENT '平均满意度',
    rank INT COMMENT '排名',
    recalculate_version INT DEFAULT 1 COMMENT '复算版本号',
    last_recalculate_time DATETIME COMMENT '最后复算时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_cs_month (cs_id, statistics_month),
    INDEX idx_statistics_month (statistics_month),
    INDEX idx_total_score (total_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客服评分表';

-- =====================================================
-- 15. 批处理执行记录表 - 用于批处理游标避免OOM
-- =====================================================
DROP TABLE IF EXISTS cs_batch_execution;
CREATE TABLE cs_batch_execution (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    batch_no VARCHAR(64) NOT NULL UNIQUE COMMENT '批次号',
    task_id BIGINT COMMENT '关联任务ID',
    task_type VARCHAR(32) COMMENT '任务类型',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待执行，1-执行中，2-已完成，3-失败',
    cursor_position BIGINT DEFAULT 0 COMMENT '游标位置',
    batch_size INT DEFAULT 1000 COMMENT '每批处理数量',
    total_count INT DEFAULT 0 COMMENT '总数量',
    processed_count INT DEFAULT 0 COMMENT '已处理数量',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    error_msg TEXT COMMENT '错误信息',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_task_id (task_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='批处理执行记录表';

-- =====================================================
-- 16. 系统配置表
-- =====================================================
DROP TABLE IF EXISTS cs_sys_config;
CREATE TABLE cs_sys_config (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    config_key VARCHAR(64) NOT NULL UNIQUE COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_desc VARCHAR(256) COMMENT '配置描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入客服人员测试数据
INSERT INTO cs_customer_service (staff_no, name, department, team, position) VALUES
('CS001', '张三', '客服一部', 'A组', '资深客服'),
('CS002', '李四', '客服一部', 'A组', '客服专员'),
('CS003', '王五', '客服一部', 'B组', '客服专员'),
('CS004', '赵六', '客服二部', 'C组', '客服主管'),
('CS005', '钱七', '客服二部', 'C组', '资深客服');

-- 插入质检规则
INSERT INTO cs_quality_rule (rule_code, rule_name, rule_type, rule_content, score_weight, deduct_score, violation_level, create_by) VALUES
('RULE001', '禁用辱骂词汇', 1, '检测消息中是否包含辱骂性词汇', 10.00, 10.00, 3, 'system'),
('RULE002', '首响超时检测', 3, '首次响应时间超过60秒', 15.00, 5.00, 1, 'system'),
('RULE003', '平均响应超时', 3, '平均响应时间超过30秒', 15.00, 3.00, 1, 'system'),
('RULE004', '开场白规范', 2, '客服需使用标准开场白', 10.00, 5.00, 2, 'system'),
('RULE005', '结束语规范', 2, '客服需使用标准结束语', 10.00, 5.00, 2, 'system'),
('RULE006', '服务态度检测', 4, '检测服务态度是否友好', 20.00, 10.00, 2, 'system'),
('RULE007', '专业术语正确', 4, '专业术语使用正确率', 20.00, 8.00, 2, 'system');

-- 插入敏感词
INSERT INTO cs_sensitive_word (word, word_type, violation_level) VALUES
('傻逼', 1, 3),
('滚蛋', 1, 3),
('垃圾', 1, 2),
('白痴', 1, 3),
('神经病', 1, 2);

-- 插入话术分类
INSERT INTO cs_script_category (category_code, category_name, parent_id, sort_order) VALUES
('CAT001', '开场白', 0, 1),
('CAT002', '问题解答', 0, 2),
('CAT003', '投诉处理', 0, 3),
('CAT004', '结束语', 0, 4),
('CAT005', '产品咨询', 0, 5);

-- 插入优秀话术
INSERT INTO cs_script_library (script_code, category_id, category_name, title, content, scene_desc, keywords, creator_name) VALUES
('SCRIPT001', 1, '开场白', '标准问候语', '您好！很高兴为您服务，请问有什么可以帮您的？', '客户进线时使用', '问候,您好,服务', 'system'),
('SCRIPT002', 1, '开场白', '忙碌提示', '您好！当前咨询量较大，我正在处理中，请您稍等片刻，感谢您的理解！', '咨询量大时使用', '忙碌,等待,理解', 'system'),
('SCRIPT003', 2, '问题解答', '确认问题', '我理解您的问题是...对吗？为了更好地帮您解决，请确认一下。', '需要确认客户问题时使用', '确认,理解,问题', 'system'),
('SCRIPT004', 3, '投诉处理', '安抚话术', '非常抱歉给您带来了不好的体验，我会尽力帮您解决这个问题。', '客户投诉时安抚使用', '抱歉,安抚,解决', 'system'),
('SCRIPT005', 4, '结束语', '标准结束语', '感谢您的咨询，如果后续还有问题，欢迎随时联系我们。祝您生活愉快！', '会话结束时使用', '感谢,再见,愉快', 'system');

-- 插入系统配置
INSERT INTO cs_sys_config (config_key, config_value, config_desc) VALUES
('quality.batch.size', '1000', '批量质检每批处理数量'),
('quality.first.response.timeout', '60000', '首次响应超时时间(毫秒)'),
('quality.avg.response.timeout', '30000', '平均响应超时时间(毫秒)'),
('appeal.max.days', '7', '申诉有效期(天)'),
('privacy.desensitize.enabled', 'true', '是否启用数据脱敏');
