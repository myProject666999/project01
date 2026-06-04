USE tcm_traceability;

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
