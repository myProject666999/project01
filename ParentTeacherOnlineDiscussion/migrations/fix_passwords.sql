USE ptod;

-- 密码123456的BCrypt哈希 (通过Spring Security BCryptPasswordEncoder生成)
UPDATE user SET password='$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2' 
WHERE username IN ('teacher1','teacher2','teacher3','parent1','parent2','admin');

SELECT username, password FROM user;
