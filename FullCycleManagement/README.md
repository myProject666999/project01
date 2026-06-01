# 律师事务所案件全周期管理系统

## 项目简介

本系统是为中小律所设计的案件全周期管理系统，实现从咨询接洽到归档的完整案件管理流程。

## 技术栈

### 后端
- Java 11
- Spring Boot 2.7.18
- Spring Data JPA
- MySQL 8.0
- Apache POI 5.2.5 (Word文档处理)
- pinyin4j 2.5.1 (姓名归一化)
- Lombok

### 前端
- Vue 3.4
- Vue Router 4
- Element Plus 2.4
- Axios
- Vite

## 核心功能

### 1. 案件看板
- 案件状态统计卡片
- 案件列表展示
- 新建案件
- 状态流转（状态机控制，禁止非法跳转）

### 2. 案件详情
- 案件基本信息展示
- 状态时间轴
- 代理律师信息
- 工时记录
- 文书记录
- 开庭安排

### 3. 文书生成
- 基于Word模板的占位符替换
- 支持下载和保存到案件
- 模板管理

### 4. 工时账单
- 工时记录管理
- 6分钟最小计费单元自动计算
- 按月生成账单
- 律师月度账单统计

### 5. 利益冲突检索
- 姓名归一化（去空格、繁简转换、同音字）
- 直接冲突检测（对方当事人）
- 潜在冲突检测（我方当事人）

## 项目结构

```
FullCycleManagement/
├── backend/                          # 后端项目
│   ├── src/main/java/com/lawfirm/case_management/
│   │   ├── CaseManagementApplication.java    # 启动类
│   │   ├── config/                           # 配置类
│   │   │   └── CorsConfig.java
│   │   ├── controller/                       # REST API控制器
│   │   │   ├── CaseController.java
│   │   │   ├── ClientController.java
│   │   │   ├── ConflictCheckController.java
│   │   │   ├── DocumentController.java
│   │   │   ├── LawyerController.java
│   │   │   └── WorkHourController.java
│   │   ├── entity/                           # 实体类
│   │   │   ├── CaseLawyer.java
│   │   │   ├── CaseStatusLog.java
│   │   │   ├── Client.java
│   │   │   ├── CourtSession.java
│   │   │   ├── Document.java
│   │   │   ├── DocumentTemplate.java
│   │   │   ├── Lawyer.java
│   │   │   ├── LegalCase.java
│   │   │   └── WorkHour.java
│   │   ├── enums/                            # 枚举类
│   │   │   ├── CaseStatus.java
│   │   │   └── CaseType.java
│   │   ├── repository/                       # 数据访问层
│   │   ├── service/                          # 业务逻辑层
│   │   │   ├── CaseService.java
│   │   │   ├── ClientService.java
│   │   │   ├── ConflictCheckService.java
│   │   │   ├── DocumentService.java
│   │   │   ├── LawyerService.java
│   │   │   └── WorkHourService.java
│   │   ├── statemachine/                     # 状态机
│   │   │   └── CaseStateMachine.java
│   │   └── util/                             # 工具类
│   │       └── NameNormalizer.java
│   ├── src/main/resources/
│   │   └── application.yml                   # 配置文件
│   └── pom.xml
├── frontend/                         # 前端项目
│   ├── src/
│   │   ├── views/                      # 页面组件
│   │   │   ├── CaseBoard.vue           # 案件看板
│   │   │   ├── CaseDetail.vue          # 案件详情
│   │   │   ├── ConflictCheck.vue       # 利益冲突检索
│   │   │   ├── Document.vue            # 文书生成
│   │   │   └── WorkHour.vue            # 工时账单
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── api/
│   │   │   └── index.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── database/
    └── init.sql                       # 数据库初始化脚本
```

## 案件状态流转

```
咨询接洽(CONSULTATION)
    ↓
已接受委托(ACCEPTED)
    ↓
立案中(FILING)
    ↓
已立案(FILED)
    ↓
庭审中(HEARING)
    ↓
已判决(JUDGED)
    ↓
执行中(EXECUTION)
    ↓
已结案(CLOSED)
    ↓
已归档(ARCHIVED)
```

**注：状态流转由状态机统一控制，禁止非法跳转。任何状态都可直接归档。**

## 数据库设计

### 核心表
- `lawyer` - 律师表
- `client` - 当事人表（含归一化姓名用于冲突检索）
- `legal_case` - 案件表
- `case_lawyer` - 案件律师关联表
- `case_status_log` - 状态流转日志表
- `work_hour` - 工时记录表
- `document` - 文书表
- `document_template` - 文书模板表
- `court_session` - 开庭安排表

## 快速开始

### 1. 数据库初始化

已自动导入到本地MySQL数据库：
- 主机: 127.0.0.1
- 端口: 3306
- 用户名: root
- 密码: 123456
- 数据库: lawfirm_case

### 2. 启动后端服务

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:3000` 启动

## API接口说明

### 案件管理
- `GET /api/cases` - 获取所有案件
- `GET /api/cases/{id}` - 获取案件详情
- `POST /api/cases` - 创建案件
- `PUT /api/cases/{id}/status` - 更新案件状态
- `GET /api/cases/{id}/status-logs` - 获取状态日志

### 工时管理
- `GET /api/work-hours` - 获取所有工时
- `POST /api/work-hours` - 创建工时记录
- `GET /api/work-hours/monthly-bill/{lawyerId}` - 获取月度账单

### 文书管理
- `GET /api/documents/templates` - 获取所有模板
- `GET /api/documents/generate/{caseId}/{templateCode}` - 生成并下载文书
- `POST /api/documents/save/{caseId}/{templateCode}` - 保存文书

### 利益冲突检索
- `GET /api/conflict-check?clientName={name}` - 检索利益冲突

## 测试数据

系统已预置测试数据：
- 4位律师（张伟、李芳、王强、赵敏）
- 4位当事人
- 3个示例案件
- 若干工时记录
- 4个文书模板

## 特色功能说明

### 姓名归一化算法
- 去除空格
- 繁简体转换
- 拼音转换（同音字匹配）
- 编辑距离相似度计算

### 6分钟计费规则
- 每6分钟为一个计费单元
- 不足6分钟按6分钟计算
- 自动计算计费单元和金额

### 状态机
- 严格控制状态流转
- 记录每次状态变更日志
- 防止非法状态跳转

### Word文书生成
- 使用Apache POI处理Word文档
- 占位符替换：`${caseNumber}`, `${caseName}`, `${clientName}`等
- 支持自定义模板

## 注意事项

1. 请确保Java版本为11或更高
2. 确保MySQL服务已启动
3. 首次运行请确保数据库已初始化
4. 文书模板需放置在配置的模板目录下
