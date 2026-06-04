USE tcm_traceability;

SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS event_clean_expired_blacklist;

DELIMITER $$

CREATE EVENT IF NOT EXISTS event_clean_expired_blacklist
ON SCHEDULE EVERY 1 DAY
STARTS DATE_ADD(CURDATE(), INTERVAL 1 DAY)
DO
BEGIN
    DELETE FROM ip_blacklist
    WHERE expire_at IS NOT NULL AND expire_at < NOW();
END$$

DELIMITER ;
