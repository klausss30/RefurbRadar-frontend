# RefurbRadar Frontend

RefurbRadar 的 React 前端。当前版本不再下载或解析 RSS；它只从 RefurbRadar .NET API 读取已经存入 PostgreSQL 的 listing JSON。

## 数据流程

```text
PostgreSQL ← .NET 后端定时同步 RSS
     ↓
JSON API
     ↓
React 前端 → 搜索、筛选、排序、分页和商品卡片
```

后端负责 RSS XML 解析、价格与货币符号分离、完整型号提取、分类和数据库更新。前端负责展示与交互，并对 API 返回的商品列表做 30 分钟浏览器缓存。

## 功能

- 从后端动态获取支持的国家和地区，并保留固定列表作为断网 fallback
- 根据 URL、本地选择或 IP 自动选择 market
- 按分类、关键词、价格和补货日期筛选
- 按最新补货或价格排序
- 响应式商品卡片和分页
- 深色与浅色主题

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Vercel Analytics

## 本地运行

先启动后端，然后配置并启动前端：

```bash
cp .env.example .env
npm install
npm run dev
```

默认前端地址为 `http://localhost:5173`，默认 API 地址为 `http://localhost:3001`。

## 环境变量

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_SITE_URL=https://refurbradar.com
```

`VITE_API_BASE_URL` 必须指向新的 .NET API，不应指向 RSS 地址。

## 使用的 API

| 方法 | 地址 | 用途 |
| --- | --- | --- |
| GET | `/api/markets` | 国家和地区选择器 |
| GET | `/api/listings?market=nz&page=1&pageSize=1000` | 获取某 market 的商品 |
| GET | `/api/ip/country` | 自动选择 market |

## 常用命令

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## 主要目录

```text
src/
├── api/backend.ts          # JSON API 客户端
├── components/             # 页面组件
├── config/countries.ts     # market fallback 配置
├── context/                # 主题 Provider 与类型
├── hooks/useCountry.ts     # market 加载与自动选择
├── hooks/useFeed.ts        # listing API 请求及缓存
├── hooks/useProductFilters.ts
├── pages/Home.tsx
└── types/product.ts
```

## 生产构建

```bash
npm run lint
npm run build
```

部署时将 `VITE_API_BASE_URL` 设置为 Mac mini 上经 Cloudflare Tunnel 暴露的 API 域名。
