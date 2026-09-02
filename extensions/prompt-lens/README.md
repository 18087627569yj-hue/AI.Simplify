# Prompt Lens｜反推提示词

Prompt Lens 是一个可在 Google Chrome 本地安装的 Manifest V3 扩展。安装后，在网页图片上点击右键并选择“反推提示词”，扩展会打开侧边栏并载入所选图片。

当前版本是本地交互原型，不连接豆包或任何其他模型 API，也不会把图片发送到服务器。生成结果由本地 Mock 适配器提供，并在界面中明确标记为 `MOCK`。

## 当前功能

- 网页图片右键菜单“反推提示词”。
- 点击后自动打开 Chrome Side Panel，并显示目标图片。
- 支持本地上传、拖拽和剪贴板粘贴图片。
- 本地压缩图片至最长边不超过 1600 px，并通过 Canvas 重编码移除 EXIF。
- 自动判断、通用图片、人群行为分析图三种模式入口。
- 本地 Mock 分析流程、快捷调整、复制提示词和复制全部。
- 最近 20 条本地历史，可恢复、删除或清空。
- 不包含 API Key、后端地址、远程脚本或发布配置。

## 本地安装

项目已经生成可安装目录：

```text
.output/chrome-mv3
```

安装步骤：

1. 打开 Google Chrome，在地址栏输入 `chrome://extensions`。
2. 打开右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本项目中的 `.output/chrome-mv3` 文件夹。
5. 打开任意普通网页，在一张图片上点击右键。
6. 点击菜单中的“反推提示词”。

要求 Chrome 116 或更高版本，因为通过右键菜单主动打开 Side Panel 使用了 Chrome 116 引入的 `sidePanel.open()`。

## 本地开发

```bash
npm install
npm run dev
```

生产构建与检查：

```bash
npm run check
```

仅重新生成构建目录：

```bash
npm run build
```

## 目录说明

```text
entrypoints/
  background.ts          # 右键菜单、图片上下文、Side Panel 打开逻辑
  sidepanel/             # React 侧边栏界面
src/
  lib/analyzer.ts        # 可替换的分析适配器；当前仅有 Mock
  lib/history.ts         # chrome.storage.local 历史记录
  lib/image.ts           # 图片校验、压缩、缩略图与 EXIF 移除
  shared/types.ts        # 共享数据结构
public/icon/             # 扩展图标
wxt.config.ts            # Chrome MV3 manifest 配置
```

## 隐私边界

- 网页图片 URL、上传图片、Mock 结果和历史只保存在当前浏览器本地。
- 未配置任何 `host_permissions`，不会主动请求任意网站或服务端 API。
- 本地历史最多保存 20 条，可在侧边栏中一键清空。
- 受保护 CDN、登录态资源或禁止外链的图片可能无法直接预览；此时界面会提示粘贴或上传图片。

## 后续接入模型

正式接入模型时，应新增实现 `VisionAnalyzer` 接口的 API 适配器，并保留当前 UI、状态和历史逻辑。API Key 必须存放在后端 Secret 中，不能写进扩展包。
