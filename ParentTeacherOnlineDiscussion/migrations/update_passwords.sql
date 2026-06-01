USE ptod;

UPDATE user SET password='$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG' 
WHERE username IN ('teacher1','teacher2','teacher3','parent1','parent2','admin');

SELECT username, password FROM user;
