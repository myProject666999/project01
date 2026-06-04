USE tcm_traceability;

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
