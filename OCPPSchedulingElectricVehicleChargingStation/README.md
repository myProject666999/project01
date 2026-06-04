# OCPP电动汽车充电桩调度系统

基于 OCPP 1.6 协议的电动汽车充电桩调度管理系统，支持充电桩设备管理、用户扫码充电、实时计费、运营看板等功能。

## 技术架构

- **后端**: Go + Echo 框架
- **前端**: React + Ant Design
- **数据库**: MySQL
- **缓存/状态管理**: Redis
- **通信协议**: WebSocket (OCPP 1.6)

## 核心功能

### 用户端功能
- 🌍 地图查找附近充电站
- 📱 扫码绑定充电桩
- ⚡ 一键启动/停止充电
- 💸 实时电量和金额显示
- 💰 账户充值与在线支付
- 📋 充电历史记录

### 抢桩解决机制
1. 用户扫码后系统自动**占桩**（5分钟有效期）
2. 占桩成功后才能启动充电
3. 第二个用户扫码时看到"占用中"状态
4. 使用 Redis SETNX 实现分布式锁

### 运营看板
- 📊 充电桩实时状态监控
- 📈 充电数据统计
- 💹 营收数据看板
- 📋 充电桩可用性一览

## 项目结构

```
OCPPSchedulingElectricVehicleChargingStation/
├── backend/
│   ├── main.go              # 入口文件
│   ├── config/              # 配置
│   ├── model/               # 数据模型和数据库连接
│   ├── handler/             # API处理器
│   ├── service/             # 业务逻辑
│   ├── router/              # 路由
│   ├── ws/                  # OCPP WebSocket服务
│   ├── middleware/          # 中间件
│   └── simulator/           # 充电桩模拟器
├── frontend/
│   ├── src/
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API服务
│   │   └── App.js           # 主应用
│   └── package.json
└── sql/
    └── init.sql             # 数据库初始化脚本
```

## 快速开始

### 1. 启动数据库
确保 MySQL 和 Redis 服务已启动：
- MySQL: 127.0.0.1:3306, root/123456
- Redis: 127.0.0.1:6379

### 2. 初始化数据库
```bash
mysql -h 127.0.0.1 -P 3306 -u root -p123456 < sql/init.sql
```

### 3. 启动后端
```bash
cd backend
go mod tidy
go run main.go
```
后端服务运行在: http://localhost:8080

### 4. 启动前端
```bash
cd frontend
npm install
npm start
```
前端应用运行在: http://localhost:3000

### 5. 启动充电桩模拟器（可选）
```bash
cd backend/simulator
go run simulator.go CP-WJ-001 1
```

## 测试账号

| 手机号 | 密码 | 余额 |
|--------|------|------|
| 13800000001 | 123456 | ¥500.00 |
| 13800000002 | 123456 | ¥300.00 |

## 充电桩二维码编号（测试用）

- QR-CP-WJ-001-1 (望京站1号桩)
- QR-CP-WJ-002-1 (望京站2号桩)
- QR-CP-ZGC-001-1 (中关村站1号桩)
- QR-CP-ZGC-002-1 (中关村站2号桩)
- QR-CP-LJZ-001-1 (陆家嘴站1号桩)
- QR-CP-LJZ-002-1 (陆家嘴站2号桩)

## OCPP 1.6 支持的消息

- BootNotification - 充电桩启动注册
- Heartbeat - 心跳保活
- StatusNotification - 状态变更通知
- StartTransaction - 开始充电交易
- StopTransaction - 停止充电交易
- MeterValues - 电表数据上报
- RemoteStartTransaction - 远程启动充电
- RemoteStopTransaction - 远程停止充电

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 充电站接口
- `GET /api/stations` - 获取充电站列表
- `GET /api/stations/:id/charge-points` - 获取充电桩列表
- `POST /api/scan` - 扫码查询充电桩

### 充电接口
- `POST /api/charge/reserve` - 占桩预约
- `POST /api/charge/start` - 启动充电
- `POST /api/charge/stop` - 停止充电
- `GET /api/charge/transaction/:id` - 获取交易状态
- `GET /api/charge/transactions` - 获取用户充电记录

### 支付接口
- `POST /api/payment/pay` - 支付订单
- `POST /api/payment/recharge` - 账户充值
- `GET /api/payment/balance` - 查询余额

### 运营看板接口
- `GET /api/dashboard/stats` - 获取统计数据
- `GET /api/dashboard/charge-points` - 获取所有充电桩状态
