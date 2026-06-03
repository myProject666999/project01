-- H2 database initialization data
-- Password: 123456 (BCrypt encrypted)
INSERT INTO sys_user (username, password, real_name, role, qualification_no, phone, email, status, created_at, updated_at) VALUES
('admin', '$2a$10$k6SE4XaX0cRfF.94iK/6fesOKZmkmosW4u4sIHz6c185CaqWRrVnK', '系统管理员', 'ADMIN', NULL, '13800000000', 'admin@judicial.com', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('appraiser1', '$2a$10$k6SE4XaX0cRfF.94iK/6fesOKZmkmosW4u4sIHz6c185CaqWRrVnK', '张法医', 'APPRAISER', 'FA2023001', '13800000001', 'zhang@judicial.com', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('appraiser2', '$2a$10$k6SE4XaX0cRfF.94iK/6fesOKZmkmosW4u4sIHz6c185CaqWRrVnK', '李痕迹', 'APPRAISER', 'TR2023001', '13800000002', 'li@judicial.com', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('appraiser3', '$2a$10$k6SE4XaX0cRfF.94iK/6fesOKZmkmosW4u4sIHz6c185CaqWRrVnK', '王电子', 'APPRAISER', 'EL2023001', '13800000003', 'wang@judicial.com', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('reviewer1', '$2a$10$k6SE4XaX0cRfF.94iK/6fesOKZmkmosW4u4sIHz6c185CaqWRrVnK', '陈复核', 'REVIEWER1', 'RV2023001', '13800000004', 'chen1@judicial.com', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('reviewer2', '$2a$10$k6SE4XaX0cRfF.94iK/6fesOKZmkmosW4u4sIHz6c185CaqWRrVnK', '刘审核', 'REVIEWER2', 'RV2023002', '13800000005', 'chen2@judicial.com', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('reviewer3', '$2a$10$k6SE4XaX0cRfF.94iK/6fesOKZmkmosW4u4sIHz6c185CaqWRrVnK', '赵审定', 'REVIEWER3', 'RV2023003', '13800000006', 'chen3@judicial.com', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO client (client_type, name, id_card_no, contact_person, contact_phone, address, created_at) VALUES
('ORG', '某市公安局', '123456789012345678', '王警官', '13900000001', '某市某区公安路1号', CURRENT_TIMESTAMP),
('PERSON', '张三', '110101199001011234', '张三', '13900000002', '某市某区某街道100号', CURRENT_TIMESTAMP);
