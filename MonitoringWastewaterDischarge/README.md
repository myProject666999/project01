# 印染厂废水排放监测系统

## 项目概述

本系统是针对印染行业高污染废水排放的24小时实时监测系统，实现废水排放指标监测、超标预警、自动停机、复产管理和环保数据报送等完整业务流程。

## 技术栈

### 后端
- **框架**: Spring Boot 2.7.18
- **ORM**: MyBatis-Plus 3.5.3.2
- **数据库**: MySQL 8.0
- **缓存**: Redis (实时数据存储)
- **工具**: Hutool, FastJSON2, Lombok

### 前端
- **框架**: Vue 3.4
- **构建工具**: Vite 5
- **UI组件**: Element Plus 2.4
- **图表**: ECharts 5.4
- **路由**: Vue Router 4

## 核心功能

### 1. 排放点管理
- 维护排放点档案（位置、描述、各指标阈值）
- 支持COD、pH、色度、氨氮四项指标的阈值配置
- 排放点启停状态管理

### 2. 实时数据监测
- 每分钟自动生成模拟监测数据
- Redis存储实时数据，支持快速查询
- 实时展示各排放点监测数据
- 历史数据趋势图表

### 3. 超标检测与自动停机
- 实时检测各指标是否超标
- **防误停机制**: 同一指标连续3分钟超标才触发停机
- 自动生成报警记录
- 自动推送停机指令到生产车间

### 4. 停机指令管理
- 操作工确认收到停机指令
- 执行停机操作，记录原因分析和工艺调整
- 停机状态跟踪

### 5. 复产申请流程
- 停机后人工排查原因、调整工艺
- 提交复产申请，附检测报告
- 审核通过后自动恢复生产

### 6. 环保数据报送
- 数据按格式实时报送给环保监管平台（模拟接口）
- 报送状态跟踪和失败重发机制
- 报送记录查询

## 数据库设计

### 核心表结构

| 表名 | 说明 |
|------|------|
| discharge_point | 排放点档案表 |
| monitor_data | 监测数据表 |
| alarm_record | 报警记录表 |
| shutdown_order | 停机指令表 |
| recovery_application | 复产申请表 |
| env_report_record | 环保报送记录表 |

## 项目结构

```
MonitoringWastewaterDischarge/
├── backend/                    # Spring Boot后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/monitoring/wastewater/
│       │   ├── WastewaterMonitoringApplication.java
│       │   ├── common/          # 公共类
│       │   ├── config/          # 配置类
│       │   ├── controller/      # 控制器
│       │   ├── dto/             # 数据传输对象
│       │   ├── entity/          # 实体类
│       │   ├── mapper/          # MyBatis Mapper
│       │   ├── service/         # 业务服务
│       │   └── task/            # 定时任务
│       └── resources/
│           └── application.yml
├── frontend/                   # Vue3前端
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── router/              # 路由配置
│       ├── utils/               # 工具类
│       ├── views/               # 页面组件
│       └── style.css            # 全局样式
├── sql/                         # 数据库脚本
│   └── init.sql
└── README.md
```

## 快速开始

### 环境要求
- JDK 1.8+
- Node.js 16+
- MySQL 8.0+
- Redis 6.0+

### 1. 数据库初始化

数据库脚本已自动导入到本地MySQL (127.0.0.1:3306, 密码: 123456)

如需手动导入：
```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/init.sql
```

### 2. 启动Redis
```bash
# Windows
redis-server.exe redis.windows.conf
```

### 3. 启动后端服务
```bash
cd backend
mvn clean package
mvn spring-boot:run
```
后端服务端口: 8080，API前缀: /api

### 4. 启动前端服务
```bash
cd frontend
npm install
npm run dev
```
前端服务端口: 3000

### 5. 访问系统
打开浏览器访问: http://localhost:3000

## 系统测试

### 模拟超标测试

1. 进入「环保报送」页面
2. 选择排放点和超标指标（如COD）
3. 点击「触发超标」按钮
4. 系统将在下一次数据模拟时强制该指标超标
5. 连续3分钟超标后，将自动生成停机指令

### 停机流程测试

1. 进入「停机指令」页面
2. 对待确认的指令点击「确认」
3. 对已确认的指令点击「执行停机」，填写原因分析和工艺调整
4. 排放点状态变为「已停机」

### 复产流程测试

1. 进入「复产申请」页面
2. 点击「新建申请」，选择停机指令，填写处理情况
3. 提交申请后，点击「审核」
4. 审核通过后，排放点自动恢复为「运行中」状态

## 关键API接口

| 模块 | 接口 | 方法 | 说明 |
|------|------|------|------|
| 排放点 | /api/discharge-point/list | GET | 获取所有排放点 |
| 监测数据 | /api/monitor-data/realtime/{pointCode} | GET | 获取实时数据 |
| 监测数据 | /api/monitor-data/history | GET | 获取历史数据 |
| 报警记录 | /api/alarm-record/list | GET | 获取报警记录 |
| 停机指令 | /api/shutdown-order/confirm | POST | 确认停机指令 |
| 停机指令 | /api/shutdown-order/execute | POST | 执行停机 |
| 复产申请 | /api/recovery-application | POST | 提交复产申请 |
| 复产申请 | /api/recovery-application/approve | POST | 审核复产申请 |
| 环保报送 | /api/env-report/trigger-overlimit/{pointCode}/{indicator} | POST | 模拟超标 |
| 仪表盘 | /api/dashboard/stats | GET | 获取统计数据 |
| 仪表盘 | /api/dashboard/realtime-all | GET | 获取所有排放点实时数据 |

## 配置说明

### application.yml 关键配置

```yaml
monitoring:
  data-simulation:
    enabled: true           # 是否启用数据模拟
    interval-seconds: 60    # 模拟间隔（秒）
  over-limit:
    continuous-minutes: 3   # 连续超标分钟数触发停机
  env-report:
    enabled: true           # 是否启用环保报送
```

## 注意事项

1. 确保MySQL和Redis服务正常运行
2. 数据模拟默认每分钟执行一次，可在配置中调整
3. 连续超标3分钟的阈值可通过配置修改
4. 环保报送为模拟接口，实际使用需对接真实平台
5. 生产环境建议使用真实的在线监测设备接入
