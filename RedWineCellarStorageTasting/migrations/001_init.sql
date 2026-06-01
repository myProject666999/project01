CREATE DATABASE IF NOT EXISTS wine_cellar DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wine_cellar;

CREATE TABLE wine (
    id INT AUTO_INCREMENT PRIMARY KEY,
    region VARCHAR(255) NOT NULL COMMENT '产区',
    chateau VARCHAR(255) NOT NULL COMMENT '酒庄',
    vintage INT NOT NULL COMMENT '年份',
    abv DECIMAL(4,2) NOT NULL COMMENT '酒精度ABV',
    drink_from INT NOT NULL COMMENT '适饮期起始年份',
    drink_to INT NOT NULL COMMENT '适饮期结束年份',
    purchase_price DECIMAL(10,2) NOT NULL COMMENT '购入价',
    market_price DECIMAL(10,2) NULL COMMENT '当前市价',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE grape_variety (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wine_id INT NOT NULL,
    name VARCHAR(100) NOT NULL COMMENT '葡萄品种名',
    percentage INT NOT NULL COMMENT '占比百分比',
    FOREIGN KEY (wine_id) REFERENCES wine(id) ON DELETE CASCADE
);

CREATE TABLE cellar_slot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rack_no INT NOT NULL COMMENT '架号',
    layer_no INT NOT NULL COMMENT '层号',
    position_no INT NOT NULL COMMENT '位号',
    status ENUM('empty', 'occupied') NOT NULL DEFAULT 'empty' COMMENT '窖位状态',
    UNIQUE KEY uk_slot (rack_no, layer_no, position_no)
);

CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wine_id INT NOT NULL,
    slot_id INT NOT NULL,
    status ENUM('in_cellar', 'opened') NOT NULL DEFAULT 'in_cellar' COMMENT '库存状态',
    stock_in_date DATE NOT NULL COMMENT '入库日期',
    opened_date DATE NULL COMMENT '开瓶日期',
    FOREIGN KEY (wine_id) REFERENCES wine(id),
    FOREIGN KEY (slot_id) REFERENCES cellar_slot(id)
);

CREATE TABLE tasting_note (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wine_id INT NOT NULL,
    inventory_id INT NOT NULL,
    tasting_date DATE NOT NULL COMMENT '品鉴日期',
    companions VARCHAR(500) NULL COMMENT '同饮者',
    appearance_score INT NOT NULL COMMENT '外观评分1-20',
    aroma_score INT NOT NULL COMMENT '香气评分1-30',
    taste_score INT NOT NULL COMMENT '口感评分1-40',
    overall_score INT NOT NULL COMMENT '综合评分1-100',
    notes TEXT NULL COMMENT '品鉴备注',
    FOREIGN KEY (wine_id) REFERENCES wine(id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

CREATE INDEX idx_wine_region ON wine(region(100));
CREATE INDEX idx_wine_chateau ON wine(chateau(100));
CREATE INDEX idx_wine_vintage ON wine(vintage);
CREATE INDEX idx_wine_drink_to ON wine(drink_to);
CREATE INDEX idx_grape_variety_wine_id ON grape_variety(wine_id);
CREATE INDEX idx_cellar_slot_status ON cellar_slot(status);
CREATE INDEX idx_cellar_slot_rack ON cellar_slot(rack_no, layer_no);
CREATE INDEX idx_inventory_wine_id ON inventory(wine_id);
CREATE INDEX idx_inventory_slot_id ON inventory(slot_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_tasting_note_wine_id ON tasting_note(wine_id);
CREATE INDEX idx_tasting_note_date ON tasting_note(tasting_date);

INSERT INTO cellar_slot (rack_no, layer_no, position_no, status)
SELECT r.rack, l.layer, p.pos, 'empty'
FROM
    (SELECT 1 AS rack UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) r,
    (SELECT 1 AS layer UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) l,
    (SELECT 1 AS pos UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) p
ORDER BY r.rack, l.layer, p.pos;

INSERT INTO wine (region, chateau, vintage, abv, drink_from, drink_to, purchase_price, market_price) VALUES
('波尔多-玛歌', 'Château Margaux', 2015, 13.50, 2025, 2040, 3500.00, 4800.00),
('波尔多-波亚克', 'Château Lafite Rothschild', 2016, 13.00, 2026, 2045, 5800.00, 7200.00),
('波尔多-圣埃美隆', 'Château Ausone', 2017, 14.00, 2024, 2038, 4200.00, 5500.00),
('勃艮第-夜丘', 'Domaine de la Romanée-Conti', 2018, 13.50, 2028, 2050, 28000.00, 35000.00),
('波尔多-波亚克', 'Château Mouton Rothschild', 2016, 13.50, 2025, 2042, 3200.00, 4500.00);

INSERT INTO grape_variety (wine_id, name, percentage) VALUES
(1, '赤霞珠', 70),
(1, '美乐', 20),
(1, '品丽珠', 10),
(2, '赤霞珠', 70),
(2, '美乐', 25),
(2, '品丽珠', 5),
(3, '美乐', 55),
(3, '品丽珠', 45),
(4, '黑皮诺', 100),
(5, '赤霞珠', 80),
(5, '美乐', 10),
(5, '品丽珠', 10);

INSERT INTO inventory (wine_id, slot_id, status, stock_in_date) VALUES
(1, 1, 'in_cellar', '2024-03-15'),
(1, 2, 'in_cellar', '2024-03-15'),
(2, 7, 'in_cellar', '2024-05-20'),
(3, 13, 'in_cellar', '2024-06-10'),
(3, 14, 'opened', '2024-06-10'),
(4, 19, 'in_cellar', '2024-08-01'),
(5, 25, 'in_cellar', '2024-09-12');

UPDATE cellar_slot SET status = 'occupied' WHERE id IN (1, 2, 7, 13, 14, 19, 25);

INSERT INTO tasting_note (wine_id, inventory_id, tasting_date, companions, appearance_score, aroma_score, taste_score, overall_score, notes) VALUES
(3, 5, '2025-01-15', '张伟、李娜', 17, 26, 35, 92, '非常优雅，果香浓郁，单宁细腻丝滑，余味悠长');
