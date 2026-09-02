import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Prompt Lens｜反推提示词',
    description: '在网页图片上点击右键，快速生成可复制、可编辑的中文生图提示词。',
    minimum_chrome_version: '116',
    permissions: ['contextMenus', 'sidePanel', 'storage', 'activeTab'],
    action: {
      default_title: '打开 Prompt Lens',
      default_icon: {
        16: 'icon/16.png',
        32: 'icon/32.png',
      },
    },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
});
