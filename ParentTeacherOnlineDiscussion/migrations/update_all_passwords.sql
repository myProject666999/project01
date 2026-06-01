USE ptod;

-- 更新所有用户密码为123456
UPDATE user SET password='$2a$10$bGzOONG9Zoq70i6W2F3NI.R/qHbzrqDUhE5Rz66Xt27rL7Df8IB0q' 
WHERE username IN ('teacher1','teacher2','teacher3','parent1','parent2','admin');

-- 删除测试用户
DELETE FROM user WHERE username='testuser';

SELECT username, name, role FROM user;
