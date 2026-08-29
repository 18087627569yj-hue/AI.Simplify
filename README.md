# 杨金的个人作品集

个人作品集网站，展示 AI 产品运营、内容增长、AI 工作流与建筑设计实践。

## 本地预览

```bash
npm install
npm run dev
```

默认预览地址为 `http://localhost:4173`。

开发预览会直接读取 `index.html`、`src/` 和 `public/` 中的最新文件，并关闭浏览器缓存。服务启动后，修改页面、样式、脚本或图片，只需刷新浏览器即可看到结果，不需要重复执行构建。

准备发布时再运行：

```bash
npm run build
```

如需检查构建后的发布版本，先完成构建，再运行 `npm run preview`。

## 项目结构

- `index.html`：网站页面内容
- `src/`：交互逻辑与样式
- `public/`：图片、项目详情与简历等静态资源
- `scripts/`：构建脚本
- `worker/`：在线部署入口
