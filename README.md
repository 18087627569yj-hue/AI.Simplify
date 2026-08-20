# Still-Life Naive Doodle

将一张静物照片转化为“黑色拙趣线描 + 大面积留白 + 单一亮色点缀”的极简手绘插画，全程不生成小人、人物或拟人角色。

## 关于这个 Skill

`still-life-naive-doodle` 是一个 Codex Skill，适用于杯子、书本、花瓶、水果、餐具、饮品、食品、产品和桌面陈设等静物照片。

- 保留照片中最有辨识度的 1—3 件物品及其摆放关系
- 删除复杂背景、真实光影和次要细节
- 使用松散、不均匀、允许断裂的黑色手绘线条
- 让约 80% 的画面保持空白，只使用一种小面积亮色
- 通过物品的倾斜、堆叠、重复和尺度变化制造安静的冷幽默
- 禁止人物、小人、脸、眼睛、手脚、动物角色和物品拟人化

它不是写实描摹、滤镜或精致矢量化，而是从原照片中提炼物体关系，再重组为克制、松弛的日常视觉诗。

## 使用方法

### 方式一：作为 Codex Skill 使用

推荐直接让 Codex 安装本仓库中的 Skill：

> 使用 `$skill-installer` 从 `https://github.com/18087627569yj-hue/AI.Simplify.git` 安装 `skills/still-life-naive-doodle`。

也可以手动将 [`skills/still-life-naive-doodle`](skills/still-life-naive-doodle) 文件夹复制到 `~/.codex/skills/`。

安装后开启一个新任务，上传一张静物照片并输入：

> 使用 `$still-life-naive-doodle` 将我上传的静物照片转换为极简拙趣手绘插画，不要出现人物或拟人角色。

Skill 会分析照片中的核心物品、位置关系和适合的点缀色，然后调用可用的图片生成能力完成转换。

### 方式二：直接使用提示词

不安装 Skill 时，可以打开 [`references/prompt-template.md`](skills/still-life-naive-doodle/references/prompt-template.md)，将其中的主体物品和点缀色替换为照片内容，再作为图生图提示词使用。

## 核心原则

1. 上传照片始终是唯一内容来源，不凭空替换成另一组静物。
2. 简化但仍可辨认，保留核心物品及其基本空间关系。
3. 叙事只通过静物的排列产生，不使用人物、动物或拟人五官。
4. 默认不生成文字、品牌 Logo、水印、手机界面和黑色外框。

## Skill 结构

```text
skills/still-life-naive-doodle/
├── SKILL.md                       Skill 工作流程与约束
├── agents/openai.yaml             Codex 界面名称与默认入口
└── references/prompt-template.md  主提示词与反向提示词模板
```

运行需要 Codex 的图片生成能力；如果当前环境无法生成图片，Skill 会返回已经根据照片填写好的主提示词和反向提示词。

---

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
