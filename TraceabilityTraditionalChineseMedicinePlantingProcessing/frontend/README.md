# 中药材种植加工溯源系统 - 前端

## 技术栈

- Vue 3 + Composition API
- Vite
- Vue Router 4
- Pinia
- Element Plus
- Axios
- ECharts

## 项目结构

```
frontend/
├── src/
│   ├── api/              # API接口封装
│   │   ├── index.js      # Axios实例配置
│   │   └── modules/      # 各模块API
│   ├── assets/           # 静态资源
│   │   └── styles/       # 全局样式
│   ├── layouts/          # 布局组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia状态管理
│   ├── views/            # 页面组件
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── index.html            # HTML模板
├── vite.config.js        # Vite配置
└── package.json          # 项目依赖
```

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

## 生产构建

```bash
npm run build
```

## 预览生产构建

```bash
npm run preview
```
