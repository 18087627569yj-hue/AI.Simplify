// ============================================================
// 入口文件 — 挂载 React 应用、引入全局样式
// ============================================================
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
