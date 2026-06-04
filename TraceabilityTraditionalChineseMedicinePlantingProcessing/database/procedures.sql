USE tcm_traceability;

-- =============================================
-- 创建存储过程：安全间隔期检查
-- =============================================
DROP PROCEDURE IF EXISTS sp_check_safety_interval;

DELIMITER $$

CREATE PROCEDURE sp_check_safety_interval(
    IN p_plot_id BIGINT,
    IN p_harvest_date DATE,
    OUT p_passed TINYINT,
    OUT p_remark TEXT
)
BEGIN
    DECLARE v_pesticide_name VARCHAR(100);
    DECLARE v_safe_interval INT;
    DECLARE v_operation_date DATE;
    DECLARE v_days_diff INT;
    DECLARE v_done INT DEFAULT 0;
    
    DECLARE cur CURSOR FOR
        SELECT 
            p.name,
            p.safe_interval_days,
            fr.operation_date
        FROM farming_records fr
        INNER JOIN pesticides p ON fr.pesticide_id = p.id
        WHERE fr.plot_id = p_plot_id
          AND fr.operation_date <= p_harvest_date
          AND fr.pesticide_id IS NOT NULL
        ORDER BY fr.operation_date DESC;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
    
    SET p_passed = 1;
    SET p_remark = '安全检查通过';
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_pesticide_name, v_safe_interval, v_operation_date;
        IF v_done THEN
            LEAVE read_loop;
        END IF;
        
        SET v_days_diff = DATEDIFF(p_harvest_date, v_operation_date);
        
        IF v_days_diff < v_safe_interval THEN
            SET p_passed = 0;
            SET p_remark = CONCAT('安全检查不通过：农药[', v_pesticide_name, ']于', 
                                  DATE_FORMAT(v_operation_date, '%Y-%m-%d'), '施用，安全间隔期', 
                                  v_safe_interval, '天，距采收日期仅', v_days_diff, '天');
            CLOSE cur;
            LEAVE read_loop;
        END IF;
    END LOOP;
    
    IF v_done = 1 AND p_passed = 1 THEN
        SELECT GROUP_CONCAT(
            CONCAT(p.name, '(', DATE_FORMAT(fr.operation_date, '%Y-%m-%d'), ',间隔', p.safe_interval_days, '天,实际', 
                   DATEDIFF(p_harvest_date, fr.operation_date), '天)') 
            SEPARATOR '; ')
        INTO p_remark
        FROM farming_records fr
        INNER JOIN pesticides p ON fr.pesticide_id = p.id
        WHERE fr.plot_id = p_plot_id
          AND fr.operation_date <= p_harvest_date
          AND fr.pesticide_id IS NOT NULL;
        
        IF p_remark IS NULL THEN
            SET p_remark = '安全检查通过，无农药施用记录';
        ELSE
            SET p_remark = CONCAT('安全检查通过，所有农药均满足安全间隔期：', p_remark);
        END IF;
    END IF;
    
    CLOSE cur;
END$$

DELIMITER ;

-- =============================================
-- 创建触发器：插入农事记录时自动填充安全间隔期
-- =============================================
DROP TRIGGER IF EXISTS tr_farming_records_before_insert;

DELIMITER $$

CREATE TRIGGER tr_farming_records_before_insert
BEFORE INSERT ON farming_records
FOR EACH ROW
BEGIN
    IF NEW.pesticide_id IS NOT NULL THEN
        SELECT safe_interval_days INTO NEW.safe_interval_days
        FROM pesticides
        WHERE id = NEW.pesticide_id;
    END IF;
END$$

DELIMITER ;

-- =============================================
-- 创建存储过程：生成全局唯一批次号
-- =============================================
DROP PROCEDURE IF EXISTS sp_generate_batch_no;

DELIMITER $$

CREATE PROCEDURE sp_generate_batch_no(
    OUT p_batch_no VARCHAR(32)
)
BEGIN
    DECLARE v_prefix VARCHAR(20);
    DECLARE v_suffix INT;
    DECLARE v_exists INT;
    
    SET v_prefix = CONCAT('BATCH-', DATE_FORMAT(NOW(), '%Y%m%d'), '-');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(batch_no, LENGTH(v_prefix) + 1) AS UNSIGNED)), 0) + 1
    INTO v_suffix
    FROM harvest_batches
    WHERE batch_no LIKE CONCAT(v_prefix, '%');
    
    SET p_batch_no = CONCAT(v_prefix, LPAD(v_suffix, 3, '0'));
    
    SET v_exists = 1;
    WHILE v_exists > 0 DO
        SELECT COUNT(*) INTO v_exists
        FROM harvest_batches
        WHERE batch_no = p_batch_no;
        
        IF v_exists > 0 THEN
            SET v_suffix = v_suffix + 1;
            SET p_batch_no = CONCAT(v_prefix, LPAD(v_suffix, 3, '0'));
        END IF;
    END WHILE;
END$$

DELIMITER ;

-- =============================================
-- 创建存储过程：生成唯一二维码
-- =============================================
DROP PROCEDURE IF EXISTS sp_generate_qr_code;

DELIMITER $$

CREATE PROCEDURE sp_generate_qr_code(
    IN p_product_id BIGINT,
    OUT p_qr_code VARCHAR(64)
)
BEGIN
    DECLARE v_batch_id BIGINT;
    DECLARE v_exists INT;
    DECLARE v_random_str VARCHAR(32);
    
    SELECT batch_id INTO v_batch_id
    FROM products
    WHERE id = p_product_id;
    
    SET v_exists = 1;
    WHILE v_exists > 0 DO
        SET v_random_str = UPPER(MD5(CONCAT(NOW(), RAND(), UUID())));
        SET v_random_str = SUBSTRING(v_random_str, 1, 16);
        
        SET p_qr_code = CONCAT('TCM-', v_random_str);
        
        SELECT COUNT(*) INTO v_exists
        FROM qr_codes
        WHERE qr_code = p_qr_code;
    END WHILE;
    
    INSERT INTO qr_codes (qr_code, product_id, batch_id, status)
    VALUES (p_qr_code, p_product_id, v_batch_id, 1);
END$$

DELIMITER ;

-- =============================================
-- 创建事件：定时清理过期IP黑名单
-- =============================================
SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS event_clean_expired_blacklist;

CREATE EVENT IF NOT EXISTS event_clean_expired_blacklist
ON SCHEDULE EVERY 1 DAY
STARTS DATE_ADD(CURDATE(), INTERVAL 1 DAY)
DO
    DELETE FROM ip_blacklist
    WHERE expire_at IS NOT NULL AND expire_at < NOW();
