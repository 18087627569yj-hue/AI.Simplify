# 走马岭数字预运营系统

这是一个基于 Vite + React 的前端项目，用于走马岭景区数字预运营展示、游客路线规划和管理后台演示。

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址：

```text
http://localhost:5173/
```

## 构建发布

```bash
npm run build
```

构建产物会输出到 `dist/`。

如需本地预览生产包：

```bash
npm run preview
```

## 项目结构

```text
src/
  App.jsx              应用外壳和页面模式切换
  data.js              景点、路线、商品和统计数据逻辑
  resources.js         本地资源兼容入口
  supabase.js          Supabase 客户端
  components/
    Home.jsx           首页
    Intro.jsx          走马村介绍引导
    Quiz.jsx           角色测试和分流页
    Visitor.jsx        游客地图、路线规划
    Admin.jsx          管理后台
    Shop.jsx           商品和路线关联商品
public/assets/         图片和地图素材
supabase/schema.sql    云数据库建表脚本
```

## Supabase 配置

项目会从 `.env.local` 读取：

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

如果没有配置 Supabase，前端仍能运行，管理后台会使用演示数据。需要启用云端访问统计时，在 Supabase SQL Editor 中执行 `supabase/schema.sql`，再重启开发服务器。

## 迁移说明

项目已整理为普通 Vite 项目，不依赖旧 AI 平台运行。历史资源注入方式集中到 `src/resources.js`，默认使用 `public/assets` 中的本地素材。
