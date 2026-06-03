# 食品厂生产批次溯源系统

一个基于BFS广度优先搜索的食品生产批次溯源系统，实现快速定位问题批次和召回成本估算。

## 系统架构

- **数据库**: MySQL 8.0
- **后端**: Node.js + Express
- **前端**: Vue 3 + Element Plus + Vite

## 核心功能

### 1. 正向溯源（召回模拟）
从**原料批次**出发，通过BFS算法遍历整个生产链条：
- 原料批次 → 生产工单 → 成品批次 → 经销商
- 自动计算预估召回成本

### 2. 反向溯源（原料追溯）
从**成品批次**出发，反向查找所有使用的原料：
- 成品批次 → 生产工单 → 原料批次
- 识别涉及的供应商

## 数据模型

```
原料批次 (material_batches)
    ↓
工单领料关联 (work_order_materials)
    ↓
生产工单 (work_orders)
    ↓
成品批次 (product_batches)
    ↓
出库记录 (shipments)
    ↓
经销商 (distributors)
```

## 项目结构

```
TraceabilityProductionBatche/
├── database/
│   └── traceability.sql      # 数据库脚本
├── backend/
│   ├── src/
│   │   ├── app.js            # 主应用入口
│   │   ├── config/
│   │   │   └── db.js         # 数据库配置
│   │   ├── routes/
│   │   │   ├── trace.js      # 溯源API路由
│   │   │   └── basic.js      # 基础数据路由
│   │   └── utils/
│   │       └── bfs.js        # BFS溯源算法
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.vue           # 主应用组件
    │   ├── main.js           # 入口文件
    │   └── components/
    │       ├── RecallSimulation.vue   # 召回模拟组件
    │       └── BackwardTrace.vue      # 反向溯源组件
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 快速开始

### 1. 数据库配置

数据库已自动导入，配置信息：
- 主机: 127.0.0.1
- 端口: 3306
- 用户: root
- 密码: 123456
- 数据库: traceability

### 2. 启动后端服务

```bash
cd backend
npm install
npm start
```
后端运行在: http://localhost:3000

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```
前端运行在: http://localhost:5173

## API接口

### 正向溯源（原料→成品→经销商）
```
GET /api/trace/material/:batchNo
```
响应示例:
```json
{
  "success": true,
  "data": {
    "materialBatches": [...],
    "workOrders": [...],
    "productBatches": [...],
    "distributors": [...],
    "totalRecallCost": 196800
  }
}
```

### 反向溯源（成品→原料）
```
GET /api/trace/product/:batchNo
```

### 基础数据接口
- `GET /api/materials` - 获取所有原料批次
- `GET /api/products` - 获取所有成品批次
- `GET /api/distributors` - 获取所有经销商
- `GET /api/suppliers` - 获取所有供应商
- `GET /api/stats` - 获取统计数据

## 测试数据

系统已预置测试数据：

### 原料批次
- RM20240101001 - 小麦粉 (河南面粉厂)
- RM20240101002 - 小麦粉 (河南面粉厂)
- RM20240102001 - 大豆油 (黑龙江大豆基地)
- RM20240103001 - 白砂糖 (广东糖业)
- RM20240104001 - 鸡蛋 (山东农场一号)

### 生产工单
- WO20240110001 - 吐司面包 (500箱)
- WO20240111001 - 牛角包 (300箱)
- WO20240112001 - 蛋糕 (200箱)
- WO20240113001 - 吐司面包 (400箱)
- WO20240114001 - 饼干 (600箱)

### 成品批次
- FG20240110001 - 吐司面包
- FG20240111001 - 牛角包
- FG20240112001 - 蛋糕
- FG20240113001 - 吐司面包
- FG20240114001 - 饼干

### 经销商
- 北京商贸有限公司 (华北)
- 上海食品贸易 (华东)
- 广州批发商 (华南)
- 成都食品配送 (西南)

## BFS算法原理

系统使用**广度优先搜索(BFS)** 算法遍历有向图：

### 正向BFS遍历层级
- **Level 0**: 问题原料批次
- **Level 1**: 使用该原料的生产工单
- **Level 2**: 工单生产的成品批次
- **Level 3**: 成品发往的经销商

### 反向BFS遍历层级
- **Level 0**: 问题成品批次
- **Level 1**: 对应生产工单
- **Level 2**: 工单使用的所有原料批次

## 召回成本计算

```
召回成本 = Σ(出库数量 × 产品单价)
```

系统自动计算所有受影响成品的总价值，为召回决策提供数据支持。

## 使用示例

1. **召回模拟**: 选择原料批次 `RM20240101001`（小麦粉），点击"开始溯源分析"
   - 将显示：影响3个工单、3个成品批次、4家经销商
   - 预估召回成本：¥196,800

2. **反向溯源**: 选择成品批次 `FG20240110001`（吐司面包）
   - 将显示：该批次使用了哪些原料批次
   - 列出涉及的供应商
