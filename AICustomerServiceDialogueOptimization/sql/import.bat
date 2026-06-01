@echo off
mysql -h 127.0.0.1 -P 3306 -u root -p123456 --default-character-set=utf8mb4 < init.sql
echo Import completed!
pause
