# 简历手记 MVP

面向应届生和 1–3 年经验求职者的可解释 AI 简历优化产品。代码由 GitHub 管理，前端与安全的 AI 接口部署在 Cloudflare Pages。

## 能力

- 读取 PDF、DOCX、PNG、JPG 简历
- 支持粘贴 JD、公开招聘链接和 JD 截图
- 通过 OpenAI Responses API 生成结构化诊断和针对性改写
- 使用真实性护栏，禁止把未经确认的推断写入最终简历
- 导出 DOCX、PDF 和修改报告

## 本地运行完整版本

1. 安装依赖：`npm install`
2. 复制 `.dev.vars.example` 为 `.dev.vars`
3. 在 `.dev.vars` 中填写 `OPENAI_API_KEY`
4. 运行：`npm run dev:full`
5. 访问 Wrangler 显示的本地地址（默认 `http://localhost:8788`）

单独运行 `npm run dev` 只能预览前端，无法调用 `/api/analyze`。

## Cloudflare Pages 部署

先在 Cloudflare 创建名为 `resume-notes-mvp` 的 Pages 项目，并配置：

- 加密变量 `OPENAI_API_KEY`
- 可选变量 `OPENAI_MODEL`，默认 `gpt-5-mini`

GitHub 仓库需要配置 Actions Secrets：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

推送到 `main` 分支后，工作流会构建并部署静态页面与 `functions/api/analyze.ts`。

## 隐私

本站不建立账号或长期保存用户文件。服务端向 OpenAI 发起诊断请求时设置 `store: false`。部署前仍应根据实际业务补充隐私政策、访问控制、限流和费用保护。
