USE maritime_pilotage;

INSERT INTO pilot (employee_no, name, gender, phone, pilot_level, status) VALUES
('P001', 'Zhang San', 'Male', '13800138001', 3, 1),
('P002', 'Li Si', 'Male', '13800138002', 3, 1),
('P003', 'Wang Wu', 'Male', '13800138003', 2, 1),
('P004', 'Zhao Liu', 'Male', '13800138004', 2, 1),
('P005', 'Qian Qi', 'Male', '13800138005', 1, 1),
('P006', 'Sun Ba', 'Male', '13800138006', 1, 1),
('P007', 'Zhou Jiu', 'Male', '13800138007', 4, 1),
('P008', 'Wu Shi', 'Male', '13800138008', 3, 1);

INSERT INTO vessel (vessel_name, imo_number, call_sign, vessel_type, gross_tonnage, net_tonnage, deadweight_tonnage, length_overall, breadth, maximum_draft, vessel_level, flag) VALUES
('COSCO Star', 'IMO9700001', 'BVJK8', 'Container', 95000.00, 52000.00, 120000.00, 335.00, 48.00, 14.50, 2, 'Panama'),
('Haiyun Chang Sheng', 'IMO9700002', '9HA3772', 'Bulk Carrier', 45000.00, 28000.00, 82000.00, 229.00, 32.26, 12.30, 2, 'Hong Kong'),
('Mingzhu', 'IMO9700003', 'VRDU5', 'Tanker', 75000.00, 42000.00, 110000.00, 250.00, 44.00, 13.80, 2, 'Singapore'),
('Shun Da', 'IMO9700004', 'H3SA7', 'Container', 15000.00, 8500.00, 22000.00, 180.00, 28.00, 9.50, 1, 'China'),
('Hai Yi', 'IMO9700005', 'V7GB4', 'Bulk Carrier', 8000.00, 4500.00, 12000.00, 140.00, 22.00, 7.80, 1, 'China');

INSERT INTO tug (tug_name, tug_code, horsepower, bollard_pull, status) VALUES
('Gang Tuo 1', 'TG001', 5000, 65.00, 1),
('Gang Tuo 2', 'TG002', 5000, 65.00, 1),
('Gang Tuo 3', 'TG003', 6500, 80.00, 1),
('Gang Tuo 4', 'TG004', 4000, 50.00, 1),
('Gang Tuo 5', 'TG005', 8000, 95.00, 1);

INSERT INTO tide (tide_date, tide_time, tide_height, tide_type, port) VALUES
(CURDATE(), '00:15:00', 1.25, 2, 'Main Port'),
(CURDATE(), '06:32:00', 4.85, 1, 'Main Port'),
(CURDATE(), '12:48:00', 1.35, 2, 'Main Port'),
(CURDATE(), '19:05:00', 4.92, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '00:58:00', 1.18, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:15:00', 4.90, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:32:00', 1.28, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:48:00', 4.95, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '01:42:00', 1.12, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '07:58:00', 4.95, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:15:00', 1.22, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '20:32:00', 5.00, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '02:25:00', 1.08, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '08:42:00', 4.98, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:58:00', 1.18, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '21:15:00', 5.02, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '03:08:00', 1.05, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '09:25:00', 5.00, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '15:42:00', 1.15, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '21:58:00', 5.05, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '03:52:00', 1.02, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '10:08:00', 5.02, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '16:25:00', 1.12, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '22:42:00', 5.08, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '04:35:00', 1.00, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '10:52:00', 5.05, 1, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '17:08:00', 1.10, 2, 'Main Port'),
(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '23:25:00', 5.10, 1, 'Main Port');

INSERT INTO pilot_schedule (pilot_id, schedule_date, shift_type, start_time, end_time, is_on_call, status) VALUES
(1, CURDATE(), 1, CONCAT(CURDATE(), ' 08:00:00'), CONCAT(CURDATE(), ' 16:00:00'), 0, 1),
(2, CURDATE(), 1, CONCAT(CURDATE(), ' 08:00:00'), CONCAT(CURDATE(), ' 16:00:00'), 0, 1),
(3, CURDATE(), 2, CONCAT(CURDATE(), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 00:00:00'), 0, 1),
(4, CURDATE(), 2, CONCAT(CURDATE(), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 00:00:00'), 0, 1),
(5, CURDATE(), 3, CONCAT(CURDATE(), ' 00:00:00'), CONCAT(CURDATE(), ' 08:00:00'), 0, 1),
(6, CURDATE(), 3, CONCAT(CURDATE(), ' 00:00:00'), CONCAT(CURDATE(), ' 08:00:00'), 0, 1),
(7, CURDATE(), 1, CONCAT(CURDATE(), ' 08:00:00'), CONCAT(CURDATE(), ' 16:00:00'), 1, 1),
(1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 3, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 00:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), 0, 1),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 00:00:00'), 0, 1),
(3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), 0, 1),
(4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 3, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 00:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), 0, 1),
(5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 00:00:00'), 0, 1),
(6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), 0, 1),
(8, DATE_ADD(CURDATE(), INTERVAL 1 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 00:00:00'), 1, 1),
(1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 00:00:00'), 0, 1),
(2, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 3, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 00:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 08:00:00'), 0, 1),
(3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 00:00:00'), 0, 1),
(4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00'), 0, 1),
(5, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 3, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 00:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 08:00:00'), 0, 1),
(6, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 2, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 3 DAY), ' 00:00:00'), 0, 1),
(7, DATE_ADD(CURDATE(), INTERVAL 2 DAY), 1, CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 08:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 16:00:00'), 1, 1);

INSERT INTO sys_user (username, password, real_name, role, phone, status) VALUES
('admin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'Admin', 1, '13900139000', 1),
('dispatcher', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'Dispatcher Wang', 2, '13900139001', 1),
('pilot1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'Zhang San', 3, '13800138001', 1),
('company1', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'COSCO', 4, '13900139002', 1);

INSERT INTO pilotage_order (order_no, vessel_id, company_name, contact_person, contact_phone, eta, eta_draft, departure_port, pilotage_type, berth_to, special_requirements, submit_time, status) VALUES
('PO20260601001', 1, 'COSCO Container Lines', 'Manager Wang', '13800000001', DATE_ADD(CURDATE(), INTERVAL 2 DAY) + INTERVAL 10 HOUR, 14.20, 'Shanghai', 1, 'Berth 3 Container', 'Need 3 tugs', NOW(), 2),
('PO20260601002', 2, 'Sinotrans Bulk', 'Manager Li', '13800000002', DATE_ADD(CURDATE(), INTERVAL 1 DAY) + INTERVAL 14 HOUR, 12.00, 'Tianjin', 1, 'Berth 5 Bulk', '', NOW(), 2),
('PO20260601003', 4, 'Local Port Logistics', 'Manager Zhao', '13800000003', DATE_ADD(CURDATE(), INTERVAL 3 DAY) + INTERVAL 8 HOUR, 9.20, 'Ningbo', 1, 'Berth 2 General', '', NOW(), 1);
