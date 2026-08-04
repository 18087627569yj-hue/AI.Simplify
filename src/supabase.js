// ============================================================
// 云数据库连接 — Supabase 客户端
// 钥匙写在项目根目录的 .env.local 文件里（不会上传到公开仓库）
// ============================================================
import { createClient } from "@supabase/supabase-js";

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

// 没填钥匙时给出友好提示（阶段 2 还没填属于正常情况）
if (!url || !key) {
  console.warn(
    "[Supabase] 还没配置数据库钥匙：请在项目根目录的 .env.local 里填入 " +
    "VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY，然后重启 npm run dev。"
  );
}

export const supabase = url && key ? createClient(url, key) : null;
