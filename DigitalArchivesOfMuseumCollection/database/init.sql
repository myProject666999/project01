-- 博物馆藏品数字化档案系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS museum_collection DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE museum_collection;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(加密)',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '联系电话',
    department VARCHAR(50) COMMENT '部门',
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff' COMMENT '角色',
    status TINYINT DEFAULT 1 COMMENT '状态:1启用,0禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_real_name (real_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 藏品分类表
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '分类编码',
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    description TEXT COMMENT '分类描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='藏品分类表';

-- 藏品表
CREATE TABLE IF NOT EXISTS collections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    collection_no VARCHAR(100) NOT NULL UNIQUE COMMENT '藏品总号',
    category_id BIGINT COMMENT '分类ID',
    category_no VARCHAR(50) COMMENT '分类号',
    name VARCHAR(200) NOT NULL COMMENT '名称',
    era VARCHAR(100) COMMENT '年代',
    source VARCHAR(50) COMMENT '来源:征集/出土/捐赠/其他',
    material VARCHAR(100) COMMENT '材质',
    level ENUM('一级', '二级', '三级', '一般') DEFAULT '一般' COMMENT '文物级别',
    value_assessment DECIMAL(15,2) COMMENT '价值评估(元)',
    current_location VARCHAR(200) COMMENT '当前位置',
    qr_code VARCHAR(200) UNIQUE COMMENT '二维码内容',
    description TEXT COMMENT '详细描述',
    dimensions VARCHAR(200) COMMENT '尺寸',
    weight DECIMAL(10,3) COMMENT '重量(kg)',
    status ENUM('在库', '展出', '外借', '修复中', '待查') DEFAULT '在库' COMMENT '藏品状态',
    keeper_id BIGINT COMMENT '保管员ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_collection_no (collection_no),
    INDEX idx_category_id (category_id),
    INDEX idx_name (name),
    INDEX idx_status (status),
    INDEX idx_era (era),
    INDEX idx_level (`level`),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (keeper_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='藏品表';

-- 藏品照片表
CREATE TABLE IF NOT EXISTS collection_photos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    collection_id BIGINT NOT NULL COMMENT '藏品ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '存储路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_type VARCHAR(50) COMMENT '文件类型',
    angle VARCHAR(50) COMMENT '拍摄角度:正面/侧面/背面/细节等',
    is_primary TINYINT DEFAULT 0 COMMENT '是否主图:1是,0否',
    uploaded_by BIGINT COMMENT '上传人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_collection_id (collection_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='藏品照片表';

-- 三维扫描文件表
CREATE TABLE IF NOT EXISTS collection_3d_models (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    collection_id BIGINT NOT NULL COMMENT '藏品ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '存储路径',
    file_size BIGINT COMMENT '文件大小(字节)',
    file_format VARCHAR(10) COMMENT '文件格式:OBJ/PLY',
    description TEXT COMMENT '描述',
    uploaded_by BIGINT COMMENT '上传人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_collection_id (collection_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='三维扫描文件表';

-- 位置表（库房、展厅等）
CREATE TABLE IF NOT EXISTS locations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '位置名称',
    type ENUM('库房', '展厅', '修复室', '其他') DEFAULT '库房' COMMENT '位置类型',
    building VARCHAR(100) COMMENT '楼号',
    floor VARCHAR(50) COMMENT '楼层',
    room_no VARCHAR(50) COMMENT '房间号',
    shelf_no VARCHAR(50) COMMENT '货架号',
    description TEXT COMMENT '描述',
    status TINYINT DEFAULT 1 COMMENT '状态:1启用,0禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='位置表';

-- 移动记录表
CREATE TABLE IF NOT EXISTS movement_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    movement_no VARCHAR(50) NOT NULL UNIQUE COMMENT '移动单号',
    collection_id BIGINT NOT NULL COMMENT '藏品ID',
    movement_type ENUM('调库', '展出', '外借', '归还', '修复') NOT NULL COMMENT '移动类型',
    from_location VARCHAR(200) COMMENT '原位置',
    to_location VARCHAR(200) COMMENT '目标位置',
    reason TEXT COMMENT '移动原因',
    exhibition_name VARCHAR(200) COMMENT '展览名称(外借/展出时)',
    borrower VARCHAR(100) COMMENT '借展单位',
    borrower_contact VARCHAR(50) COMMENT '借展联系人',
    borrower_phone VARCHAR(20) COMMENT '借展联系电话',
    expected_return_date DATE COMMENT '预计归还日期',
    actual_return_date DATETIME COMMENT '实际归还日期',
    applicant_id BIGINT COMMENT '申请人ID',
    approver_id BIGINT COMMENT '审批人ID',
    approved_at DATETIME COMMENT '审批时间',
    out_handover_id BIGINT COMMENT '出库交接人ID',
    out_handover_at DATETIME COMMENT '出库交接时间',
    in_handover_id BIGINT COMMENT '入库交接人ID',
    in_handover_at DATETIME COMMENT '入库交接时间',
    out_signature_url VARCHAR(500) COMMENT '出库签字文件URL',
    in_signature_url VARCHAR(500) COMMENT '入库签字文件URL',
    status ENUM('待审批', '已批准', '出库中', '已完成', '已拒绝', '已取消') DEFAULT '待审批' COMMENT '状态',
    remarks TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_movement_no (movement_no),
    INDEX idx_collection_id (collection_id),
    INDEX idx_status (status),
    INDEX idx_movement_type (movement_type),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (out_handover_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (in_handover_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='移动记录表';

-- 封箱清单表
CREATE TABLE IF NOT EXISTS packing_lists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    list_no VARCHAR(50) NOT NULL UNIQUE COMMENT '清单编号',
    movement_id BIGINT NOT NULL COMMENT '移动记录ID',
    box_no VARCHAR(50) COMMENT '箱号',
    collection_count INT DEFAULT 0 COMMENT '藏品数量',
    created_by BIGINT COMMENT '创建人ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_list_no (list_no),
    INDEX idx_movement_id (movement_id),
    FOREIGN KEY (movement_id) REFERENCES movement_records(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='封箱清单表';

-- 封箱清单明细表
CREATE TABLE IF NOT EXISTS packing_list_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    packing_list_id BIGINT NOT NULL COMMENT '封箱清单ID',
    collection_id BIGINT NOT NULL COMMENT '藏品ID',
    collection_no VARCHAR(100) COMMENT '藏品总号',
    collection_name VARCHAR(200) COMMENT '藏品名称',
    remarks VARCHAR(500) COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_packing_list_id (packing_list_id),
    INDEX idx_collection_id (collection_id),
    FOREIGN KEY (packing_list_id) REFERENCES packing_lists(id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='封箱清单明细表';

-- 盘点计划表
CREATE TABLE IF NOT EXISTS inventory_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    plan_no VARCHAR(50) NOT NULL UNIQUE COMMENT '盘点计划编号',
    plan_name VARCHAR(200) NOT NULL COMMENT '盘点名称',
    plan_date DATE COMMENT '计划盘点日期',
    location_scope VARCHAR(500) COMMENT '盘点范围位置',
    category_scope VARCHAR(500) COMMENT '盘点范围分类',
    status ENUM('待执行', '进行中', '已完成') DEFAULT '待执行' COMMENT '状态',
    total_count INT DEFAULT 0 COMMENT '应盘点总数',
    checked_count INT DEFAULT 0 COMMENT '已盘点数量',
    missing_count INT DEFAULT 0 COMMENT '待查数量',
    creator_id BIGINT COMMENT '创建人ID',
    executor_id BIGINT COMMENT '执行人ID',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    remarks TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plan_no (plan_no),
    INDEX idx_status (status),
    INDEX idx_plan_date (plan_date),
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (executor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='盘点计划表';

-- 盘点明细表
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    plan_id BIGINT NOT NULL COMMENT '盘点计划ID',
    collection_id BIGINT NOT NULL COMMENT '藏品ID',
    collection_no VARCHAR(100) COMMENT '藏品总号',
    collection_name VARCHAR(200) COMMENT '藏品名称',
    expected_location VARCHAR(200) COMMENT '应在位置',
    actual_location VARCHAR(200) COMMENT '实际位置',
    status ENUM('待盘点', '已盘点', '待查', '异常') DEFAULT '待盘点' COMMENT '盘点状态',
    checked_by BIGINT COMMENT '盘点人ID',
    checked_at DATETIME COMMENT '盘点时间',
    is_offline TINYINT DEFAULT 0 COMMENT '是否离线扫码:1是,0否',
    remarks TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_plan_id (plan_id),
    INDEX idx_collection_id (collection_id),
    INDEX idx_status (status),
    FOREIGN KEY (plan_id) REFERENCES inventory_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (checked_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='盘点明细表';

-- 文物状态变化记录表
CREATE TABLE IF NOT EXISTS status_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    collection_id BIGINT NOT NULL COMMENT '藏品ID',
    old_status VARCHAR(50) COMMENT '原状态',
    new_status VARCHAR(50) NOT NULL COMMENT '新状态',
    change_reason TEXT COMMENT '变化原因',
    damage_description TEXT COMMENT '损坏描述(如有)',
    repair_plan TEXT COMMENT '修复方案',
    record_type ENUM('状态变更', '损坏记录', '修复记录', '保养记录') NOT NULL COMMENT '记录类型',
    recorder_id BIGINT COMMENT '记录人ID',
    attachment_urls TEXT COMMENT '附件URL(JSON数组)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_collection_id (collection_id),
    INDEX idx_record_type (record_type),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (recorder_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='状态变化记录表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT COMMENT '操作人ID',
    username VARCHAR(50) COMMENT '用户名',
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(50) COMMENT '操作类型',
    target_id BIGINT COMMENT '目标ID',
    target_type VARCHAR(50) COMMENT '目标类型',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    request_params TEXT COMMENT '请求参数(JSON)',
    response_data TEXT COMMENT '响应数据(JSON)',
    status TINYINT DEFAULT 1 COMMENT '状态:1成功,0失败',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_module (module),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- 初始化数据
-- 插入默认管理员用户 (密码: admin123, 实际使用时请修改)
INSERT INTO users (username, password, real_name, department, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', '信息中心', 'admin');

-- 插入示例分类
INSERT INTO categories (code, name, parent_id, sort_order) VALUES
('A', '青铜器', 0, 1),
('B', '陶瓷器', 0, 2),
('C', '书画', 0, 3),
('D', '玉器', 0, 4),
('E', '杂项', 0, 5),
('A01', '青铜礼器', 1, 1),
('A02', '青铜兵器', 1, 2),
('B01', '瓷器', 2, 1),
('B02', '陶器', 2, 2),
('C01', '书法', 3, 1),
('C02', '绘画', 3, 2);

-- 插入示例位置
INSERT INTO locations (name, type, building, floor, room_no, description) VALUES
('一号库房A区', '库房', '主楼', '一层', '101', '珍贵文物库房'),
('一号库房B区', '库房', '主楼', '一层', '102', '一般文物库房'),
('二号库房', '库房', '副楼', '二层', '201', '大型文物库房'),
('一号展厅', '展厅', '展览楼', '一层', '101', '常设展厅'),
('二号展厅', '展厅', '展览楼', '二层', '201', '临时展厅'),
('修复工作室', '修复室', '科研楼', '三层', '301', '文物修复中心');

-- 插入示例藏品
INSERT INTO collections (collection_no, category_id, category_no, name, era, source, material, `level`, value_assessment, current_location, description, status, keeper_id) VALUES
('C202400001', 6, 'A01', '青铜鼎', '商代', '征集', '青铜', '一级', 5000000.00, '一号库房A区-01-01', '商代青铜鼎，器型完整，纹饰精美', '在库', 1),
('C202400002', 8, 'B01', '青花瓷瓶', '清代', '捐赠', '瓷', '二级', 800000.00, '一号库房A区-02-03', '清代青花瓷瓶，康熙年间', '在库', 1),
('C202400003', 10, 'C01', '行书条幅', '明代', '征集', '纸本', '一级', 1200000.00, '一号库房B区-01-05', '明代著名书法家行书作品', '在库', 1),
('C202400004', 4, 'D', '玉佩', '汉代', '出土', '玉', '三级', 150000.00, '一号库房B区-03-02', '汉代玉佩，和田玉质', '在库', 1),
('C202400005', 5, 'E', '木雕佛像', '唐代', '征集', '木', '二级', 350000.00, '一号展厅-A01', '唐代木雕佛像，神态庄严', '展出', 1);
