# AI.Simplify

面向 Codex 的 AI 图片风格化 Skill 合集。每个 Skill 都将一种可复用的视觉转换方法封装为清晰的工作流程、风格约束和提示词模板。

## Skills

| Skill | 功能 | 入口 |
| --- | --- | --- |
| Still-Life Naive Doodle | 将静物照片转换为无人物、大留白、单一亮色点缀的极简拙趣线描插画 | [`skills/still-life-naive-doodle`](skills/still-life-naive-doodle) |

## 安装

推荐直接让 Codex 安装指定 Skill：

> 使用 `$skill-installer` 从 `https://github.com/18087627569yj-hue/AI.Simplify.git` 安装 `skills/still-life-naive-doodle`。

也可以手动将目标 Skill 文件夹复制到 `~/.codex/skills/`，然后开启一个新的 Codex 任务。

## 使用示例

上传一张静物照片并输入：

> 使用 `$still-life-naive-doodle` 将这张照片转换为极简拙趣手绘插画，不要出现人物、小人或拟人角色。

Skill 会分析照片中的核心物品、空间关系和适合的点缀色，再调用可用的图片生成能力完成转换。如果当前环境无法生成图片，则返回已经根据照片填写好的主提示词和反向提示词。

## 仓库结构

```text
AI.Simplify/
├── README.md
├── LICENSE
└── skills/
    └── still-life-naive-doodle/
        ├── SKILL.md
        ├── agents/
        │   └── openai.yaml
        └── references/
            └── prompt-template.md
```

## Skill 设计原则

- 一个文件夹对应一个独立、可安装的 Skill。
- `SKILL.md` 只保留触发条件、核心流程和不可妥协的约束。
- 详细提示词、风格规范和条件性说明放在 `references/` 中。
- `agents/openai.yaml` 提供清晰的显示名称、简短说明和默认调用入口。
- 示例素材只能帮助理解预期效果，不应成为新任务的默认内容来源。

后续新增的图片风格化能力将继续放入 `skills/`，并在本页登记入口。
