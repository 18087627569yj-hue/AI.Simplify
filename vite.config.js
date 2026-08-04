import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite 配置：使用 React 插件，自动编译 JSX（替代原来浏览器里的 Babel）
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 允许局域网/手机访问
    port: 5173,
  },
});
