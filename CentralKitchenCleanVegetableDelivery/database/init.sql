CREATE DATABASE IF NOT EXISTS central_kitchen DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE central_kitchen;

CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '客户ID',
    name VARCHAR(100) NOT NULL COMMENT '客户名称',
    type VARCHAR(50) NOT NULL COMMENT '客户类型：学校食堂、连锁餐厅等',
    address VARCHAR(255) NOT NULL COMMENT '地址',
    longitude DECIMAL(10, 6) COMMENT '经度',
    latitude DECIMAL(10, 6) COMMENT '纬度',
    contact_person VARCHAR(50) COMMENT '联系人',
    phone VARCHAR(20) COMMENT '联系电话',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户表';

CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '菜品ID',
    name VARCHAR(100) NOT NULL COMMENT '菜品名称',
    category VARCHAR(50) COMMENT '分类：蔬菜、肉类等',
    unit VARCHAR(20) NOT NULL COMMENT '单位：kg、袋等',
    price DECIMAL(10, 2) COMMENT '单价',
    processing_time INT COMMENT '加工时间（分钟）',
    equipment_type VARCHAR(50) COMMENT '所需设备类型',
    status TINYINT DEFAULT 1 COMMENT '状态：1-上架 0-下架',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品表';

CREATE TABLE IF NOT EXISTS equipment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '设备ID',
    name VARCHAR(100) NOT NULL COMMENT '设备名称',
    type VARCHAR(50) NOT NULL COMMENT '设备类型',
    capacity DECIMAL(10, 2) COMMENT '容量/产能',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-维修中',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备表';

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    delivery_date DATE NOT NULL COMMENT '配送日期',
    total_amount DECIMAL(12, 2) DEFAULT 0 COMMENT '总金额',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待确认 1-已确认 2-加工中 3-配送中 4-已完成 5-已取消',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    product_id BIGINT NOT NULL COMMENT '菜品ID',
    quantity DECIMAL(10, 2) NOT NULL COMMENT '数量',
    unit_price DECIMAL(10, 2) COMMENT '单价',
    subtotal DECIMAL(12, 2) COMMENT '小计',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

CREATE TABLE IF NOT EXISTS processing_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
    task_no VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号',
    product_id BIGINT NOT NULL COMMENT '菜品ID',
    total_quantity DECIMAL(10, 2) NOT NULL COMMENT '总数量',
    equipment_id BIGINT COMMENT '设备ID',
    plan_start_time DATETIME COMMENT '计划开始时间',
    plan_end_time DATETIME COMMENT '计划结束时间',
    actual_start_time DATETIME COMMENT '实际开始时间',
    actual_end_time DATETIME COMMENT '实际结束时间',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待开始 1-进行中 2-已完成 3-已取消',
    worker VARCHAR(50) COMMENT '操作人员',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='加工任务表';

CREATE TABLE IF NOT EXISTS processing_task_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    processing_task_id BIGINT NOT NULL COMMENT '加工任务ID',
    order_item_id BIGINT NOT NULL COMMENT '订单明细ID',
    quantity DECIMAL(10, 2) NOT NULL COMMENT '数量',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (processing_task_id) REFERENCES processing_tasks(id),
    FOREIGN KEY (order_item_id) REFERENCES order_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='加工任务明细表';

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '车辆ID',
    plate_number VARCHAR(20) NOT NULL UNIQUE COMMENT '车牌号',
    driver_name VARCHAR(50) COMMENT '司机姓名',
    driver_phone VARCHAR(20) COMMENT '司机电话',
    capacity DECIMAL(10, 2) COMMENT '容量',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常 0-维修中',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆表';

CREATE TABLE IF NOT EXISTS deliveries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '配送单ID',
    delivery_no VARCHAR(50) NOT NULL UNIQUE COMMENT '配送单编号',
    vehicle_id BIGINT NOT NULL COMMENT '车辆ID',
    delivery_date DATE NOT NULL COMMENT '配送日期',
    plan_depart_time DATETIME COMMENT '计划出发时间',
    actual_depart_time DATETIME COMMENT '实际出发时间',
    actual_arrive_time DATETIME COMMENT '实际到达时间',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待发车 1-配送中 2-已完成',
    route TEXT COMMENT '路线信息',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配送单表';

CREATE TABLE IF NOT EXISTS delivery_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    delivery_id BIGINT NOT NULL COMMENT '配送单ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    sequence INT COMMENT '配送顺序',
    sign_time DATETIME COMMENT '签收时间',
    sign_person VARCHAR(50) COMMENT '签收人',
    temperature_confirmed TINYINT DEFAULT 0 COMMENT '温度确认：0-未确认 1-已确认',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配送明细表';

CREATE TABLE IF NOT EXISTS temperature_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    delivery_id BIGINT NOT NULL COMMENT '配送单ID',
    temperature DECIMAL(5, 2) NOT NULL COMMENT '温度值',
    record_time DATETIME NOT NULL COMMENT '记录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='温度记录表';

CREATE TABLE IF NOT EXISTS waste_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    product_id BIGINT NOT NULL COMMENT '菜品ID',
    quantity DECIMAL(10, 2) NOT NULL COMMENT '数量',
    reason VARCHAR(255) NOT NULL COMMENT '报废原因',
    record_date DATE NOT NULL COMMENT '记录日期',
    handler VARCHAR(50) COMMENT '处理人',
    remark TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='报废记录表';

INSERT INTO customers (name, type, address, longitude, latitude, contact_person, phone) VALUES
('第一中学食堂', '学校食堂', '北京市朝阳区青年路1号', 116.4456, 39.9219, '张师傅', '13800138001'),
('快乐炸鸡连锁(朝阳店)', '连锁餐厅', '北京市朝阳区建国路88号', 116.4074, 39.9042, '李经理', '13800138002'),
('第二小学食堂', '学校食堂', '北京市海淀区中关村大街1号', 116.3046, 39.9847, '王师傅', '13800138003');

INSERT INTO products (name, category, unit, price, processing_time, equipment_type) VALUES
('西红柿丁', '蔬菜', 'kg', 8.50, 15, '切菜机'),
('土豆丝', '蔬菜', 'kg', 6.00, 20, '切菜机'),
('鸡丝', '肉类', 'kg', 25.00, 30, '切丝机'),
('黄瓜片', '蔬菜', 'kg', 7.00, 10, '切片机'),
('胡萝卜丁', '蔬菜', 'kg', 5.50, 15, '切菜机');

INSERT INTO equipment (name, type, capacity, status) VALUES
('切菜机A1', '切菜机', 100.00, 1),
('切菜机A2', '切菜机', 100.00, 1),
('切丝机B1', '切丝机', 50.00, 1),
('切片机C1', '切片机', 80.00, 1);

INSERT INTO vehicles (plate_number, driver_name, driver_phone, capacity, status) VALUES
('京A12345', '张司机', '13900139001', 500.00, 1),
('京A67890', '李司机', '13900139002', 500.00, 1),
('京A11111', '王司机', '13900139003', 800.00, 1);
