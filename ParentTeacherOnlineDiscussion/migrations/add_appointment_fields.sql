USE ptod;

ALTER TABLE appointment 
ADD COLUMN subject VARCHAR(200) NULL AFTER duration,
ADD COLUMN description TEXT NULL AFTER subject;

DESCRIBE appointment;
