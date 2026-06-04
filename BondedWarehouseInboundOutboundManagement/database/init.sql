-- 创建数据库
CREATE DATABASE IF NOT EXISTS bonded_warehouse DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bonded_warehouse;

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL COMMENT '商品SKU',
    barcode VARCHAR(100) UNIQUE NOT NULL COMMENT '商品条码',
    name VARCHAR(200) NOT NULL COMMENT '商品名称',
    category VARCHAR(50) NOT NULL COMMENT '商品分类(化妆品/奶粉/保健品等)',
    spec VARCHAR(100) COMMENT '规格',
    unit VARCHAR(20) DEFAULT '件' COMMENT '单位',
    price DECIMAL(10, 2) COMMENT '单价',
    country VARCHAR(50) COMMENT '原产国',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sku (sku),
    INDEX idx_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 库位表
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT '库位编码(如A-01-01)',
    zone VARCHAR(20) NOT NULL COMMENT '库区(A/B/C等)',
    aisle VARCHAR(20) COMMENT '通道',
    shelf VARCHAR(20) COMMENT '货架',
    layer VARCHAR(20) COMMENT '层级',
    position VARCHAR(20) COMMENT '货位',
    status TINYINT DEFAULT 1 COMMENT '状态(1-可用,0-禁用)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_zone (zone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库位表';

-- 库存表
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL COMMENT '商品ID',
    location_id INT NOT NULL COMMENT '库位ID',
    quantity INT NOT NULL DEFAULT 0 COMMENT '库存数量',
    available_qty INT NOT NULL DEFAULT 0 COMMENT '可用数量',
    locked_qty INT NOT NULL DEFAULT 0 COMMENT '锁定数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_product_location (product_id, location_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存表';

-- 入库单表
CREATE TABLE IF NOT EXISTS inbound_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '入库单号',
    supplier VARCHAR(100) COMMENT '供应商',
    total_qty INT DEFAULT 0 COMMENT '总数量',
    status TINYINT DEFAULT 0 COMMENT '状态(0-待入库,1-部分入库,2-已完成)',
    remark TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_no (order_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入库单表';

-- 入库单明细表
CREATE TABLE IF NOT EXISTS inbound_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inbound_order_id INT NOT NULL COMMENT '入库单ID',
    product_id INT NOT NULL COMMENT '商品ID',
    plan_qty INT NOT NULL COMMENT '计划数量',
    actual_qty INT DEFAULT 0 COMMENT '实际数量',
    location_id INT COMMENT '入库库位ID',
    status TINYINT DEFAULT 0 COMMENT '状态(0-待入库,1-已入库)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inbound_order_id) REFERENCES inbound_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入库单明细表';

-- 订单表(下游电商订单)
CREATE TABLE IF NOT EXISTS sales_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL COMMENT '订单号',
    platform VARCHAR(50) COMMENT '平台来源',
    customer_name VARCHAR(100) COMMENT '客户姓名',
    customer_phone VARCHAR(20) COMMENT '客户电话',
    address VARCHAR(500) COMMENT '收货地址',
    id_card VARCHAR(20) COMMENT '身份证号(清关用)',
    total_qty INT DEFAULT 0 COMMENT '总数量',
    total_amount DECIMAL(10, 2) DEFAULT 0 COMMENT '总金额',
    status TINYINT DEFAULT 0 COMMENT '状态(0-待处理,1-已生成波次,2-拣货中,3-待复核,4-已完成)',
    wave_id INT COMMENT '波次ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_no (order_no),
    INDEX idx_status (status),
    INDEX idx_wave_id (wave_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售订单表';

-- 订单明细表
CREATE TABLE IF NOT EXISTS sales_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sales_order_id INT NOT NULL COMMENT '订单ID',
    product_id INT NOT NULL COMMENT '商品ID',
    quantity INT NOT NULL COMMENT '数量',
    picked_qty INT DEFAULT 0 COMMENT '已拣数量',
    price DECIMAL(10, 2) COMMENT '单价',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售订单明细表';

-- 波次表
CREATE TABLE IF NOT EXISTS waves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wave_no VARCHAR(50) UNIQUE NOT NULL COMMENT '波次号',
    order_count INT DEFAULT 0 COMMENT '订单数量',
    total_qty INT DEFAULT 0 COMMENT '总数量',
    status TINYINT DEFAULT 0 COMMENT '状态(0-待拣货,1-拣货中,2-拣货完成,3-已取消)',
    picker VARCHAR(50) COMMENT '拣货员',
    picked_at TIMESTAMP NULL COMMENT '拣货完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_wave_no (wave_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='波次表';

-- 波次明细表
CREATE TABLE IF NOT EXISTS wave_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wave_id INT NOT NULL COMMENT '波次ID',
    sales_order_id INT NOT NULL COMMENT '订单ID',
    product_id INT NOT NULL COMMENT '商品ID',
    quantity INT NOT NULL COMMENT '数量',
    picked_qty INT DEFAULT 0 COMMENT '已拣数量',
    location_id INT COMMENT '拣货库位',
    status TINYINT DEFAULT 0 COMMENT '状态(0-待拣,1-已拣)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wave_id) REFERENCES waves(id) ON DELETE CASCADE,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='波次明细表';

-- 复核记录表
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_no VARCHAR(50) UNIQUE NOT NULL COMMENT '复核单号',
    sales_order_id INT NOT NULL COMMENT '订单ID',
    reviewer VARCHAR(50) COMMENT '复核员',
    status TINYINT DEFAULT 0 COMMENT '状态(0-待复核,1-复核通过,2-复核异常)',
    total_items INT DEFAULT 0 COMMENT '商品总数',
    pass_items INT DEFAULT 0 COMMENT '通过数量',
    fail_items INT DEFAULT 0 COMMENT '异常数量',
    remark TEXT COMMENT '备注',
    reviewed_at TIMESTAMP NULL COMMENT '复核时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    INDEX idx_review_no (review_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='复核记录表';

-- 复核明细表
CREATE TABLE IF NOT EXISTS review_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL COMMENT '复核记录ID',
    product_id INT NOT NULL COMMENT '商品ID',
    scanned_barcode VARCHAR(100) COMMENT '扫描条码',
    expected_qty INT NOT NULL COMMENT '期望数量',
    actual_qty INT DEFAULT 0 COMMENT '实际数量',
    status TINYINT DEFAULT 0 COMMENT '状态(0-待扫,1-通过,2-异常)',
    error_type VARCHAR(50) COMMENT '异常类型(条码错误/数量错误等)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='复核明细表';

-- 出库单表
CREATE TABLE IF NOT EXISTS outbound_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    outbound_no VARCHAR(50) UNIQUE NOT NULL COMMENT '出库单号',
    sales_order_id INT NOT NULL COMMENT '销售订单ID',
    review_id INT COMMENT '复核记录ID',
    customs_status TINYINT DEFAULT 0 COMMENT '报关状态(0-待报关,1-报关中,2-已通关,3-报关异常)',
    logistics_no VARCHAR(100) COMMENT '物流单号',
    status TINYINT DEFAULT 0 COMMENT '状态(0-待出库,1-已出库,2-已发货)',
    operator VARCHAR(50) COMMENT '操作员',
    outbound_at TIMESTAMP NULL COMMENT '出库时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE SET NULL,
    INDEX idx_outbound_no (outbound_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出库单表';

-- 盘点单表
CREATE TABLE IF NOT EXISTS stocktakes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stocktake_no VARCHAR(50) UNIQUE NOT NULL COMMENT '盘点单号',
    type TINYINT DEFAULT 0 COMMENT '盘点类型(0-全盘,1-抽盘)',
    status TINYINT DEFAULT 0 COMMENT '状态(0-进行中,1-已完成)',
    total_skus INT DEFAULT 0 COMMENT '盘点SKU数',
    difference_count INT DEFAULT 0 COMMENT '差异数量',
    operator VARCHAR(50) COMMENT '操作员',
    remark TEXT COMMENT '备注',
    started_at TIMESTAMP NULL COMMENT '开始时间',
    finished_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stocktake_no (stocktake_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='盘点单表';

-- 盘点明细表
CREATE TABLE IF NOT EXISTS stocktake_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stocktake_id INT NOT NULL COMMENT '盘点单ID',
    product_id INT NOT NULL COMMENT '商品ID',
    location_id INT NOT NULL COMMENT '库位ID',
    system_qty INT NOT NULL COMMENT '系统数量',
    actual_qty INT DEFAULT 0 COMMENT '实际数量',
    difference INT DEFAULT 0 COMMENT '差异数量',
    status TINYINT DEFAULT 0 COMMENT '状态(0-待盘,1-已盘)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (stocktake_id) REFERENCES stocktakes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='盘点明细表';

-- 插入测试数据 - 商品
INSERT INTO products (sku, barcode, name, category, spec, unit, price, country) VALUES
('SKU001', '6901234567001', '雅诗兰黛小棕瓶精华', '化妆品', '50ml', '瓶', 680.00, '美国'),
('SKU002', '6901234567002', '兰蔻粉水', '化妆品', '400ml', '瓶', 320.00, '法国'),
('SKU003', '6901234567003', '爱他美奶粉3段', '奶粉', '800g', '罐', 220.00, '德国'),
('SKU004', '6901234567004', 'A2奶粉2段', '奶粉', '900g', '罐', 280.00, '澳大利亚'),
('SKU005', '6901234567005', 'Swisse钙片', '保健品', '150片', '瓶', 128.00, '澳大利亚'),
('SKU006', '6901234567006', 'Blackmores鱼油', '保健品', '400粒', '瓶', 168.00, '澳大利亚');

-- 插入测试数据 - 库位
INSERT INTO locations (code, zone, aisle, shelf, layer, position) VALUES
('A-01-01', 'A', '01', '01', '01', '01'),
('A-01-02', 'A', '01', '01', '01', '02'),
('A-01-03', 'A', '01', '01', '01', '03'),
('A-02-01', 'A', '02', '01', '01', '01'),
('A-02-02', 'A', '02', '01', '01', '02'),
('B-01-01', 'B', '01', '01', '01', '01'),
('B-01-02', 'B', '01', '01', '01', '02'),
('B-02-01', 'B', '02', '01', '01', '01');

-- 插入测试数据 - 初始库存
INSERT INTO inventory (product_id, location_id, quantity, available_qty, locked_qty) VALUES
(1, 1, 100, 100, 0),
(2, 2, 150, 150, 0),
(3, 5, 200, 200, 0),
(4, 6, 180, 180, 0),
(5, 7, 300, 300, 0),
(6, 8, 250, 250, 0);

-- 插入测试数据 - 入库单
INSERT INTO inbound_orders (order_no, supplier, total_qty, status, remark) VALUES
('IN202401001', '跨境供应商A', 100, 2, '首批入库'),
('IN202401002', '跨境供应商B', 150, 2, '补货入库');

-- 插入测试数据 - 入库明细
INSERT INTO inbound_items (inbound_order_id, product_id, plan_qty, actual_qty, location_id, status) VALUES
(1, 1, 100, 100, 1, 1),
(2, 2, 150, 150, 2, 1);

-- 插入测试数据 - 销售订单
INSERT INTO sales_orders (order_no, platform, customer_name, customer_phone, address, id_card, total_qty, total_amount, status) VALUES
('SO202401001', '天猫国际', '张三', '13800138001', '北京市朝阳区xxx路xxx号', '110101199001010001', 2, 900.00, 0),
('SO202401002', '京东国际', '李四', '13800138002', '上海市浦东新区xxx路xxx号', '310101199001010002', 3, 728.00, 0),
('SO202401003', '考拉海购', '王五', '13800138003', '广州市天河区xxx路xxx号', '440101199001010003', 1, 220.00, 0);

-- 插入测试数据 - 订单明细
INSERT INTO sales_order_items (sales_order_id, product_id, quantity, price) VALUES
(1, 1, 1, 680.00),
(1, 2, 1, 220.00),
(2, 3, 2, 220.00),
(2, 5, 1, 288.00),
(3, 3, 1, 220.00);
