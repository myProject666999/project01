# 网约出租车计价与对账系统

## 项目简介

传统出租车现在也接网约平台单。司机晚上收车要对账：今天接了多少单平台单，平台说能拿多少，公司这边按真实跑的里程算应该是多少，如果存在数据差异需要排查。

## 技术栈

- **后端**: Node.js + Express
- **前端**: Vue 3 + Element Plus
- **数据库**: MySQL

## 数据库配置

- 主机: 127.0.0.1
- 端口: 3306
- 用户名: root
- 密码: 123456
- 数据库名: taxi_reconciliation

## 项目结构

```
OnlineRideHailingFareCalculationReconciliation/
├── backend/                 # 后端项目
│   ├── app.js              # 入口文件
│   ├── package.json        # 依赖配置
│   ├── config/             # 配置文件
│   │   └── database.js     # 数据库配置
│   ├── models/             # 数据模型
│   ├── controllers/        # 控制器
│   ├── routes/             # 路由
│   └── utils/              # 工具函数
├── frontend/               # 前端项目
│   ├── package.json        # 依赖配置
│   ├── vite.config.js      # Vite配置
│   ├── index.html          # HTML模板
│   └── src/                # 源码目录
│       ├── main.js         # 入口文件
│       ├── App.vue         # 根组件
│       ├── router/         # 路由配置
│       ├── api/            # API接口
│       ├── utils/          # 工具函数
│       └── views/          # 页面组件
└── database/               # 数据库脚本
    ├── schema.sql          # 数据库表结构
    └── import.js           # 数据库导入脚本
```

## 功能模块

### 1. 计价规则配置化
- 起步价14元含3km
- 之后每km 2.5元
- 等候5分钟以上每分钟0.5元
- 23:00到5:00加收30%

### 2. GPS行程计算
- GPS设备每秒上报位置
- 计算起点到终点的距离和时长
- 计算等候时间

### 3. 平台订单导入
- 支持CSV文件导入
- 支持API接口导入
- 按订单号匹配本地行程

### 4. 差异对账
- 金额差异标红显示
- 里程差异标红显示
- 司机或调度员可以申诉

### 5. 司机端
- 当天流水清单
- 应得金额展示
- 申诉功能

## 安装与启动

### 1. 数据库初始化

数据库已自动导入，如需重新导入：

```bash
cd database
node import.js
```

### 2. 后端启动

```bash
cd backend
npm install
npm start
```

后端服务将在 http://localhost:3000 启动

### 3. 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:5173 启动

## API接口文档

### 司机相关
- `GET /api/drivers` - 获取司机列表
- `GET /api/drivers/:id` - 获取司机详情
- `POST /api/drivers` - 创建司机
- `PUT /api/drivers/:id` - 更新司机
- `DELETE /api/drivers/:id` - 删除司机

### 行程相关
- `GET /api/trips` - 获取行程列表
- `GET /api/trips/:id` - 获取行程详情
- `POST /api/trips` - 创建行程
- `PUT /api/trips/:id/complete` - 完成行程
- `GET /api/trips/summary/:driverId/:date` - 获取司机每日汇总

### 平台订单相关
- `POST /api/platform-orders/import` - 导入CSV订单
- `POST /api/platform-orders/api` - API创建订单
- `GET /api/platform-orders` - 获取订单列表
- `GET /api/platform-orders/:id` - 获取订单详情
- `PUT /api/platform-orders/:id/match` - 手动匹配行程
- `POST /api/platform-orders/auto-match` - 自动匹配

### 对账相关
- `POST /api/reconciliations` - 生成对账
- `GET /api/reconciliations` - 获取对账列表
- `GET /api/reconciliations/detail` - 获取对账详情
- `PUT /api/reconciliations/:id/confirm` - 确认对账
- `GET /api/reconciliations/daily-report/:driverId/:date` - 获取司机日报表

### 申诉相关
- `POST /api/appeals` - 创建申诉
- `GET /api/appeals` - 获取申诉列表
- `GET /api/appeals/:id` - 获取申诉详情
- `GET /api/appeals/driver/:driverId` - 获取司机申诉
- `PUT /api/appeals/:id/handle` - 处理申诉
- `GET /api/appeals/pending/count` - 获取待处理申诉数量

### 计价规则相关
- `GET /api/pricing-rules/active` - 获取当前启用规则
- `GET /api/pricing-rules` - 获取规则列表
- `POST /api/pricing-rules` - 创建规则
- `PUT /api/pricing-rules/:id` - 更新规则
- `PUT /api/pricing-rules/:id/active` - 设为启用
- `POST /api/pricing-rules/calculate` - 计算测试价格

### GPS相关
- `POST /api/gps/upload` - 上传单条GPS数据
- `POST /api/gps/upload-batch` - 批量上传GPS数据
- `GET /api/gps` - 获取GPS数据
- `GET /api/gps/trip/:tripId` - 获取行程GPS数据

## CSV导入格式

平台订单CSV文件需要包含以下字段：

| 字段名 | 说明 | 必填 |
|--------|------|------|
| order_no | 订单号 | 是 |
| platform_name | 平台名称 | 是 |
| driver_name | 司机姓名 | 是 |
| vehicle_plate | 车牌号 | 否 |
| start_time | 开始时间 | 是 |
| end_time | 结束时间 | 是 |
| start_address | 起点地址 | 是 |
| end_address | 终点地址 | 是 |
| distance | 里程(km) | 是 |
| duration | 时长(秒) | 是 |
| total_amount | 总金额(元) | 是 |
| driver_amount | 司机所得(元) | 是 |

## 初始数据

系统已预置以下数据：

### 司机
- 张三 (手机号: 13800138001)
- 李四 (手机号: 13800138002)
- 王五 (手机号: 13800138003)

### 车辆
- 京B12345 - 现代索纳塔 - GPS001 (张三)
- 京B12346 - 大众帕萨特 - GPS002 (李四)
- 京B12347 - 丰田凯美瑞 - GPS003 (王五)

### 计价规则
- 起步价: 14元（含3km）
- 每公里单价: 2.5元
- 免费等候: 5分钟
- 等候单价: 0.5元/分钟
- 夜间加价: 30%（23:00-05:00）

## 使用说明

1. 启动后端和前端服务
2. 访问 http://localhost:5173
3. 在右上角选择司机
4. 导入平台订单（管理端 -> 订单管理）
5. 自动或手动匹配行程
6. 生成对账（管理端 -> 对账管理）
7. 司机查看流水清单（司机端 -> 流水清单）
8. 如有差异可发起申诉
9. 管理员处理申诉（管理端 -> 申诉处理）

## 注意事项

1. 确保MySQL服务已启动
2. 数据库连接配置在 backend/config/database.js
3. 首次运行需要分别在backend和frontend目录执行 npm install
4. 后端默认端口3000，前端默认端口5173
