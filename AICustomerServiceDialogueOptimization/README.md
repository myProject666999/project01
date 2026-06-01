# AI客服对话质检与话术优化系统

## 项目介绍

本系统是一个完整的AI客服对话质检与话术优化平台，旨在解决客服会话量大、人工抽检覆盖率低的问题。通过AI技术实现全量质检，自动识别违规内容、分析情绪与服务问题，并沉淀优秀话术。

## 技术栈

### 后端
- **框架**: Spring Boot 2.7.18
- **ORM**: MyBatis Plus 3.5.3.1
- **数据库**: MySQL 5.7+
- **缓存**: Redis
- **工具库**: Hutool 5.8.20, Lombok
- **Java版本**: JDK 1.8+

### 前端
- **框架**: Vue 3.4
- **构建工具**: Vite 5
- **UI组件库**: Element Plus 2.4
- **状态管理**: Pinia 2.1
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **图表**: ECharts 5.4

## 核心功能

1. **会话管理** - 客服会话导入、查询、详情查看
2. **质检规则** - 敏感词检测、流程合规、响应时长检测
3. **AI质检** - 情绪分析、满意度预测、智能评分
4. **违规管理** - 违规记录标记、申诉处理
5. **申诉流程** - 多级申诉、流程留痕
6. **话术库** - 优秀话术沉淀、分类管理
7. **评分排行** - 客服质检评分、排行榜展示

## 关键设计特性

- ✅ **批处理+游标** - 全量质检避免OOM，每批处理1000条
- ✅ **结果分离** - 规则质检与AI质检结果分表存储，独立展示
- ✅ **可复算评分** - 评分版本号管理，支持重新计算
- ✅ **申诉留痕** - 完整申诉流程记录，可追溯
- ✅ **隐私分级** - 会话数据隐私级别分类管理

## 项目结构

```
AICustomerServiceDialogueOptimization/
├── backend/                    # 后端项目
│   ├── src/main/java/com/aics/quality/
│   │   ├── common/            # 通用类
│   │   ├── config/            # 配置类
│   │   ├── controller/        # 控制器层
│   │   ├── entity/            # 实体类
│   │   ├── mapper/            # DAO层
│   │   ├── service/           # 业务逻辑层
│   │   └── AiCsQualityApplication.java
│   ├── src/main/resources/
│   │   └── application.yml    # 应用配置
│   └── pom.xml
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── api/               # API接口
│   │   ├── router/            # 路由配置
│   │   ├── styles/            # 全局样式
│   │   ├── utils/             # 工具函数
│   │   ├── views/             # 页面组件
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── sql/                        # 数据库脚本
    ├── init.sql               # 初始化脚本
    └── import.bat             # 导入脚本
```

## 数据库设计

共16张核心表：

| 表名 | 说明 |
|------|------|
| cs_conversation | 会话主表 |
| cs_conversation_message | 会话消息明细表 |
| cs_quality_task | 质检任务表 |
| cs_quality_rule | 质检规则表 |
| cs_quality_result_rule | 规则质检结果表 |
| cs_quality_result_ai | AI质检结果表 |
| cs_violation_record | 违规记录表 |
| cs_appeal | 申诉表 |
| cs_appeal_flow | 申诉流程记录表 |
| cs_script_library | 话术库表 |
| cs_script_category | 话术分类表 |
| cs_cs_score | 客服评分表 |
| cs_sensitive_word | 敏感词表 |
| cs_cs_info | 客服信息表 |
| cs_customer | 客户信息表 |
| cs_quality_template | 质检模板表 |

## 环境要求

- JDK 1.8+
- Maven 3.6+
- Node.js 16+
- MySQL 5.7+
- Redis 5.0+

## 快速启动

### 1. 数据库初始化

```bash
cd sql
# Windows
import.bat
# 或手动执行
mysql -h127.0.0.1 -uroot -p123456 --default-character-set=utf8mb4
source init.sql
```

### 2. 后端启动

```bash
cd backend
# 编译项目
mvn clean install -DskipTests
# 运行项目
mvn spring-boot:run
```

后端服务默认端口: `8080`

### 3. 前端启动

```bash
cd frontend
# 安装依赖
npm install
# 启动开发服务器
npm run dev
```

前端服务默认地址: `http://localhost:5173`

## 配置说明

### 后端配置 (application.yml)

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/ai_cs_quality?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      password:
      database: 0
```

### 前端配置 (vite.config.js)

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## 页面说明

1. **数据概览** (`/`) - 质检数据统计、趋势图表
2. **质检任务** (`/task`) - 质检任务创建、执行、进度查看
3. **会话列表** (`/conversation`) - 会话查询、详情查看
4. **会话详情** (`/conversation/:id`) - 会话内容、质检结果详情
5. **违规记录** (`/violation`) - 违规记录列表、处理
6. **申诉管理** (`/appeal`) - 申诉审核、流程查看
7. **话术库** (`/script`) - 话术管理、分类、搜索
8. **评分排行** (`/ranking`) - 客服评分、排行榜

## API接口

### 会话管理
- `GET /api/conversation/list` - 会话列表
- `GET /api/conversation/{id}` - 会话详情
- `POST /api/conversation/import` - 导入会话

### 质检任务
- `GET /api/quality/task/list` - 任务列表
- `POST /api/quality/task/create` - 创建任务
- `POST /api/quality/task/{id}/execute` - 执行任务

### 违规记录
- `GET /api/violation/list` - 违规列表
- `POST /api/violation/{id}/handle` - 处理违规

### 申诉管理
- `GET /api/appeal/list` - 申诉列表
- `POST /api/appeal/{id}/audit` - 审核申诉

### 话术库
- `GET /api/script/list` - 话术列表
- `POST /api/script/add` - 添加话术

### 评分排行
- `GET /api/score/ranking` - 评分排行
- `POST /api/score/recalculate` - 重新计算

## 注意事项

1. 全量质检使用游标分批处理，避免内存溢出
2. 规则质检与AI质检结果独立存储，便于对比分析
3. 申诉流程每一步操作都会留痕，支持审计追溯
4. 会话数据支持隐私分级，敏感数据需授权访问
5. 评分支持版本管理，可复算确保评分一致性

## License

MIT
