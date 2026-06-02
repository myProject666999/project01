# 二手车检测报告系统

## 项目介绍

二手车交易前的专业检测报告系统，检测员可按部位分组进行200多项检测，系统自动汇总生成检测报告，支持分享链接（带车架号水印，有效期30天）。

## 技术栈

- **后端**: Golang + Fiber
- **前端**: React + TypeScript + Ant Design
- **数据库**: MySQL 5.7+

## 功能特性

### 检测工作台
- 按部位分组（外观、内饰、底盘、发动机、电气、路试）
- 三项评分机制：正常(OK)、注意、异常
- 拍照取证（支持车架号水印）
- 实时保存检测进度

### 报告系统
- 各大类得分自动计算
- 综合评分与评级(A/B/C/D级)
- 问题项优先展示
- 自动生成维修建议与预估费用
- 分享链接（30天有效期）
- 车架号水印防止复用

### 车辆管理
- 车辆信息录入与维护
- 车架号(VIN)唯一校验

## 项目结构

```
UsedCarInspectionReport/
├── backend/                    # 后端项目
│   ├── config/                # 配置模块
│   │   ├── config.go          # 配置加载
│   │   └── database.go        # 数据库连接
│   ├── controllers/           # 控制器
│   │   ├── auth.go           # 认证接口
│   │   ├── vehicle.go        # 车辆接口
│   │   ├── inspection.go     # 检测项接口
│   │   ├── report.go         # 报告接口
│   │   └── upload.go         # 上传接口
│   ├── middleware/            # 中间件
│   │   ├── auth.go           # JWT认证
│   │   └── cors.go           # 跨域配置
│   ├── models/                # 数据模型
│   ├── utils/                 # 工具函数
│   ├── main.go               # 主入口
│   ├── .env                  # 环境配置
│   └── go.mod                # 依赖管理
├── frontend/                  # 前端项目
│   ├── src/
│   │   ├── components/       # 组件
│   │   ├── pages/           # 页面
│   │   │   ├── Login.tsx
│   │   │   ├── InspectionWorkbench.tsx
│   │   │   ├── ReportList.tsx
│   │   │   ├── ReportDetail.tsx
│   │   │   ├── VehicleList.tsx
│   │   │   └── ShareReport.tsx
│   │   ├── services/        # API服务
│   │   ├── types/           # 类型定义
│   │   └── App.tsx
│   └── package.json
├── database/                  # 数据库脚本
│   └── schema.sql           # 建表脚本
└── README.md
```

## 快速开始

### 环境要求
- Go 1.20+
- Node.js 16+
- MySQL 5.7+

### 数据库配置
已配置本地数据库：
- 地址: 127.0.0.1:3306
- 用户名: root
- 密码: 123456
- 数据库: used_car_inspection

### 启动服务

**1. 启动后端服务**
```bash
cd backend
go run main.go
# 或使用编译后的文件
./server.exe
```
后端服务运行在: http://localhost:3001

**2. 启动前端服务**
```bash
cd frontend
npm install
npm run dev
```
前端服务运行在: http://localhost:5175

### 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| inspector01 | 123456 | 检测员 |
| inspector02 | 123456 | 检测员 |

## 检测大类说明

| 大类 | 检测项数量 | 权重 |
|------|-----------|------|
| 外观 | 40 | 1.00 |
| 内饰 | 30 | 1.00 |
| 底盘 | 30 | 1.20 |
| 发动机 | 40 | 1.50 |
| 电气 | 40 | 1.00 |
| 路试 | 30 | 1.30 |

共计 **210项** 专业检测。

## API文档

### 认证接口
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户
- `PUT /api/auth/password` - 修改密码

### 车辆接口
- `GET /api/vehicles` - 车辆列表
- `GET /api/vehicles/:id` - 车辆详情
- `POST /api/vehicles` - 添加车辆
- `PUT /api/vehicles/:id` - 更新车辆
- `DELETE /api/vehicles/:id` - 删除车辆

### 检测项接口
- `GET /api/inspection/categories` - 检测大类
- `GET /api/inspection/items` - 检测项列表
- `GET /api/inspection/items-with-categories` - 带大类的检测项

### 报告接口
- `GET /api/reports` - 报告列表
- `GET /api/reports/:id` - 报告详情
- `POST /api/reports` - 创建报告
- `POST /api/reports/:id/results` - 保存检测结果
- `POST /api/reports/:id/submit` - 提交报告
- `POST /api/reports/:id/share` - 生成分享链接
- `DELETE /api/reports/:id` - 删除报告

### 公开接口
- `GET /api/share/:token` - 查看分享报告
- `POST /api/upload/photo` - 上传照片
- `DELETE /api/upload/photo/:id` - 删除照片

## 评分规则

- **正常(OK)**: 满分
- **注意**: 60%分
- **异常**: 0分

综合评分按各大类权重加权计算：
- A级: 90分以上
- B级: 80-89分
- C级: 70-79分
- D级: 70分以下

## 特色功能

1. **车架号水印**: 所有上传照片自动添加车架号(VIN)水印，防止报告被篡改后复用
2. **分享有效期**: 报告分享链接30天自动过期
3. **问题汇总**: 异常/注意项优先展示在报告最前面
4. **维修建议**: 根据检测结果自动生成维修建议和预估费用
5. **实时保存**: 检测过程中可随时保存进度

## License

MIT
