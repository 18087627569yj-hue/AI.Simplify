// ============================================================
// 走马岭数字预运营系统 — 数据层 v3
// 按「慢行交通规划图」实际标注节点重建
// x / y 为百分比，基于完整图幅（含左侧图例面板）
// ============================================================
import { supabase } from "./supabase.js";
import { getResource } from "./resources.js";

export const SEED_SPOTS = [
  {
    id: "yinjiashan", no: 1, name: "尹家山自然教育", category: "自然观景", cat: "scenic", note: "",
    x: 45.3, y: 9.4,
    intro: "走马岭制高点自然教育节点，可俯瞰龙溪河流域全景与层叠梯田，是生态科普与登高揽胜的标志性位置。",
  },
  {
    id: "huanggeshu", no: 2, name: "黄葛树村落客厅", category: "历史人文", cat: "culture", note: "",
    x: 50.1, y: 17.3,
    intro: "以百年黄葛树为中心的传统村落公共空间，兼具村民议事、游客歇脚与在地文化展示功能。",
  },
  {
    id: "yanxue", no: 3, name: "田园研学营地", category: "体验活动", cat: "activity", note: "",
    x: 64.9, y: 21.4,
    intro: "以农耕文化与田园生活为主题的研学营地，可体验插秧、收割、手工制作等农事活动，配套室内课堂与营地住宿。",
  },
  {
    id: "caizhai", no: 4, name: "梯田采摘谷", category: "体验活动", cat: "activity", note: "",
    x: 49.3, y: 28,
    intro: "依山势开垦的层叠梯田，种有荔枝、柑橘、时蔬等作物。游客可随季参与采摘，是走马岭农业体验的核心区域。",
  },
  {
    id: "guanjinghu", no: 5, name: "观景湖", category: "体验活动", cat: "activity", note: "",
    x: 76, y: 35.9,
    intro: "山间天然湖泊，碧水环山，湖面倒映云影山色。沿湖设有亲水栈道与休憩亭台，是游览途中最宜舒缓停驻的自然景观。",
  },
  {
    id: "entry", no: 6, name: "游览入口", category: "入口", cat: "entry", note: "起始点",
    x: 88.6, y: 30.6,
    intro: "走马岭景区主入口，设有游客服务中心、导览牌、停车场与电瓶车接驳站，是全程游览的出发点。",
  },
  {
    id: "kangyang", no: 7, name: "康养门户", category: "游客服务", cat: "service", note: "",
    x: 81.4, y: 35.2,
    intro: "以健康养生为主题的综合服务节点，提供中医理疗、茶歇休憩与健康咨询服务。",
  },
  {
    id: "guyizhan", no: 8, name: "走马古驿站", category: "历史人文", cat: "culture", note: "共享驿",
    x: 61.9, y: 39.7,
    intro: "千年走马古道上的驿站遗址，石板路蜿蜒林间。沿途设共享驿站，游客与村民共享此段历史路径。",
  },
  {
    id: "matou", no: 9, name: "林家湾码头", category: "历史人文", cat: "culture", note: "",
    x: 43.2, y: 44,
    intro: "龙溪河畔的传统渡口码头，保留有历史航运痕迹。现为水上游览的接驳节点与滨河休闲步道起点。",
  },
  {
    id: "tianyuancanting", no: 10, name: "田园餐厅", category: "游客服务", cat: "service", note: "游客+村民",
    x: 65.7, y: 48.2,
    intro: "以在地食材为主的田园餐饮空间，提供川东农家风味菜肴，兼顾游客餐饮与村民日常饮食需求。",
  },
  {
    id: "qinggang", no: 11, name: "青岗林场", category: "历史人文", cat: "culture", note: "",
    x: 72.4, y: 50.2,
    intro: "原生态青岗林保护区域，林木苍翠，空气清新，是森林浴与林下漫步的理想去处。",
  },
  {
    id: "shuiguo", no: 12, name: "水果加工工坊", category: "体验活动", cat: "activity", note: "",
    x: 66.4, y: 58,
    intro: "在地水果的深加工与体验空间，提供果酱制作、果干烘焙等手工体验，可购买特色伴手礼。",
  },
  {
    id: "zhuhai", no: 13, name: "竹海疗愈课堂", category: "历史人文", cat: "culture", note: "",
    x: 71.4, y: 61.3,
    intro: "依托原生竹林设置的疗愈体验区，提供冥想、瑜伽、竹编手工等身心放松项目。",
  },
  {
    id: "minsu", no: 14, name: "滨水民宿", category: "游客服务", cat: "service", note: "游客+村民",
    x: 59.9, y: 74.5,
    intro: "改造传统民居而成的滨水精品住宿，提供留宿、特色餐饮与离园接驳服务。",
  },
  {
    id: "guanjingtai", no: 15, name: "观景台", category: "自然观景", cat: "scenic", note: "",
    x: 78.1, y: 72,
    intro: "临崖架设的观景平台，俯瞰龙溪河东岸弯曲水道与对岸青山。日落时分光影层次丰富，视觉冲击力极强。",
  },
  {
    id: "binshuigongyuan", no: 16, name: "滨水公园", category: "自然观景", cat: "scenic", note: "",
    x: 60.5, y: 84.6,
    intro: "依托龙溪河滨水地带打造的开放休闲公园，是亲水休憩与慢跑的好去处。",
  },
  {
    id: "binshuicanting", no: 17, name: "滨水餐厅", category: "游客服务", cat: "service", note: "终点",
    x: 64.2, y: 88.3,
    intro: "位于景区南端滨水区域的景观餐厅，提供河鲜与农家菜，是全程游览的收尾节点。",
  },
];

// ---- 景点类别配色 ----
export const CATEGORY_META = {
  entry:    { label: "入口",       color: "#c0392b" },
  scenic:   { label: "自然观景",   color: "#4a7a6b" },
  activity: { label: "体验活动",   color: "#c9a227" },
  culture:  { label: "历史人文",   color: "#d48a2e" },
  service:  { label: "游客服务",   color: "#5b6b8a" },
};

// ---- 道路可通行关系表 ----
export const SEED_EDGES = [
  // 入口区域
  { a: "entry",       b: "kangyang",       dist: 0.4, time: 8,  mode: "walk" },
  { a: "entry",       b: "guanjinghu",     dist: 0.8, time: 16, mode: "walk" },
  { a: "kangyang",    b: "guanjinghu",     dist: 0.5, time: 10, mode: "walk" },
  { a: "kangyang",    b: "tianyuancanting",dist: 0.6, time: 12, mode: "walk" },
  { a: "kangyang",    b: "qinggang",       dist: 0.4, time: 8,  mode: "walk" },
  // 北部线路
  { a: "guanjinghu",  b: "yanxue",         dist: 0.9, time: 18, mode: "walk" },
  { a: "guanjinghu",  b: "caizhai",        dist: 0.7, time: 14, mode: "walk" },
  { a: "caizhai",     b: "huanggeshu",     dist: 0.6, time: 12, mode: "walk" },
  { a: "huanggeshu",  b: "yinjiashan",     dist: 0.7, time: 14, mode: "walk" },
  { a: "yinjiashan",  b: "yanxue",         dist: 1.0, time: 20, mode: "walk" },
  // 中部线路
  { a: "caizhai",     b: "guyizhan",       dist: 0.5, time: 10, mode: "walk" },
  { a: "guyizhan",    b: "guanjinghu",     dist: 0.6, time: 12, mode: "walk" },
  { a: "guyizhan",    b: "matou",          dist: 0.5, time: 10, mode: "walk" },
  { a: "guyizhan",    b: "tianyuancanting",dist: 0.6, time: 12, mode: "walk" },
  { a: "matou",       b: "caizhai",        dist: 0.6, time: 12, mode: "walk" },
  // 东侧线路
  { a: "tianyuancanting", b: "qinggang",   dist: 0.5, time: 10, mode: "walk" },
  { a: "qinggang",    b: "zhuhai",         dist: 0.7, time: 14, mode: "walk" },
  { a: "qinggang",    b: "guanjingtai",    dist: 0.8, time: 16, mode: "walk" },
  // 中下部连接
  { a: "guyizhan",    b: "shuiguo",        dist: 0.6, time: 12, mode: "walk" },
  { a: "matou",       b: "shuiguo",        dist: 0.7, time: 14, mode: "walk" },
  { a: "shuiguo",     b: "zhuhai",         dist: 0.6, time: 12, mode: "walk" },
  { a: "shuiguo",     b: "minsu",          dist: 0.7, time: 14, mode: "walk" },
  { a: "zhuhai",      b: "guanjingtai",    dist: 0.5, time: 10, mode: "walk" },
  // 南部终点区
  { a: "minsu",       b: "guanjingtai",    dist: 0.8, time: 15, mode: "cart" },
  { a: "minsu",       b: "binshuigongyuan",dist: 0.6, time: 12, mode: "walk" },
  { a: "binshuigongyuan", b: "binshuicanting", dist: 0.4, time: 8, mode: "walk" },
  { a: "guanjingtai", b: "binshuicanting", dist: 0.7, time: 14, mode: "walk" },
];

export const MODE_LABEL = { walk: "步行", cart: "电瓶车" };

// ============================================================
// 图算法
// ============================================================
export function buildAdj(edges) {
  const adj = {};
  edges.forEach((e) => {
    (adj[e.a] = adj[e.a] || []).push({ to: e.b, ...e });
    (adj[e.b] = adj[e.b] || []).push({ to: e.a, ...e });
  });
  return adj;
}

export function dijkstra(adj, from, to) {
  const dist = {}, prev = {}, visited = {};
  Object.keys(adj).forEach((k) => (dist[k] = Infinity));
  dist[from] = 0;
  while (true) {
    let u = null, best = Infinity;
    for (const k in dist) {
      if (!visited[k] && dist[k] < best) { best = dist[k]; u = k; }
    }
    if (u === null || u === to) break;
    visited[u] = true;
    (adj[u] || []).forEach((e) => {
      const nd = dist[u] + e.time;
      if (nd < dist[e.to]) { dist[e.to] = nd; prev[e.to] = { node: u, edge: e }; }
    });
  }
  if (dist[to] === Infinity) return null;
  const path = [];
  let cur = to;
  while (cur !== from) {
    const p = prev[cur];
    if (!p) return null;
    path.unshift({ from: p.node, to: cur, edge: p.edge });
    cur = p.node;
  }
  return { segments: path, totalTime: dist[to] };
}

export function planRoute(selectedIds, spots, edges) {
  if (selectedIds.length < 2) return null;
  const adj = buildAdj(edges);
  const byId = Object.fromEntries(spots.map((s) => [s.id, s]));

  let start = selectedIds.includes("entry") ? "entry" : selectedIds[0];
  const remaining = new Set(selectedIds.filter((id) => id !== start));
  const order = [start];

  let cur = start;
  while (remaining.size) {
    let nextId = null, nextCost = Infinity;
    for (const cand of remaining) {
      const r = dijkstra(adj, cur, cand);
      if (r && r.totalTime < nextCost) { nextCost = r.totalTime; nextId = cand; }
    }
    if (!nextId) break;
    order.push(nextId);
    remaining.delete(nextId);
    cur = nextId;
  }

  if (order.includes("binshuicanting") && order[order.length - 1] !== "binshuicanting") {
    const i = order.indexOf("binshuicanting");
    order.splice(i, 1);
    order.push("binshuicanting");
  }

  const legs = [];
  let totalDist = 0, totalTime = 0, hasCart = false;
  for (let i = 0; i < order.length - 1; i++) {
    const r = dijkstra(adj, order[i], order[i + 1]);
    if (!r) continue;
    let segDist = 0, segTime = 0;
    const modes = new Set();
    const through = [];
    r.segments.forEach((s) => {
      segDist += s.edge.dist;
      segTime += s.edge.time;
      modes.add(s.edge.mode);
      if (s.edge.mode === "cart") hasCart = true;
      if (s.to !== order[i + 1]) through.push(byId[s.to] ? byId[s.to].name : s.to);
    });
    totalDist += segDist;
    totalTime += segTime;
    legs.push({ from: byId[order[i]], to: byId[order[i + 1]], dist: segDist, time: segTime, mode: modes.has("cart") ? "cart" : "walk", through });
  }

  const orderSpots = order.map((id) => byId[id]);
  const advice = hasCart ? "路线含较长路段，建议步行结合电瓶车辅助接驳。" : "全程以步行为主，路况平缓，适合慢行游览。";
  const cats = new Set(orderSpots.map((s) => s.cat));
  let themes = [];
  if (cats.has("scenic")) themes.push("自然山水");
  if (cats.has("culture")) themes.push("古道人文");
  if (cats.has("activity")) themes.push("田园体验");
  if (cats.has("service")) themes.push("服务配套");
  const summary = "本路线串联" + (themes.join("、") || "多处景观") + "，节奏舒缓，适合半日至全日慢游。";

  return { order: orderSpots, legs, totalDist, totalTime, advice, summary, hasCart };
}

// ============================================================
// 行为数据 — 实时写入云数据库 Supabase（events 表）
// ============================================================

const LOCAL_EVENTS_KEY = "zml_events_backup";
const LOCAL_EVENTS_LIMIT = 5000;

// 匿名访客标识：存在浏览器里，用来区分不同访客
function getSessionId() {
  try {
    let id = localStorage.getItem("zml_session");
    if (!id) {
      id = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("zml_session", id);
    }
    return id;
  } catch (e) { return "s_anon"; }
}

// 空的统计结构（界面初始/离线时用）
export function emptyAnalytics() {
  return { visits: 0, clicks: {}, dwellMs: {}, dwellOpens: {}, routes: [], routeCount: 0 };
}

function readLocalEvents() {
  try {
    const rows = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    return [];
  }
}

function saveLocalEvent(event) {
  try {
    const rows = readLocalEvents();
    rows.unshift(event);
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(rows.slice(0, LOCAL_EVENTS_LIMIT)));
  } catch (e) {}
}

function aggregateEvents(rows, base = emptyAnalytics()) {
  const a = { ...base, clicks: { ...base.clicks }, dwellMs: { ...base.dwellMs }, dwellOpens: { ...base.dwellOpens } };
  const routeMap = Object.fromEntries((base.routes || []).map((r) => [r.combo.join(">"), { ...r }]));

  rows.forEach((e) => {
    if (e.type === "visit") {
      a.visits += 1;
    } else if (e.type === "click" && e.node_id) {
      a.clicks[e.node_id] = (a.clicks[e.node_id] || 0) + 1;
    } else if (e.type === "dwell" && e.node_id) {
      const ms = (e.value && e.value.ms) || 0;
      a.dwellMs[e.node_id] = (a.dwellMs[e.node_id] || 0) + ms;
      a.dwellOpens[e.node_id] = (a.dwellOpens[e.node_id] || 0) + 1;
    } else if (e.type === "route" && e.value && e.value.combo) {
      const key = e.value.combo.join(">");
      if (!routeMap[key]) routeMap[key] = { combo: e.value.combo, n: 0 };
      routeMap[key].n += 1;
      a.routeCount += 1;
    }
  });

  a.routes = Object.values(routeMap).sort((x, y) => y.n - x.n);
  return a;
}

function fallbackAnalytics() {
  const localRows = readLocalEvents();
  return localRows.length ? aggregateEvents(localRows) : seedAnalytics();
}

// 向云端写一条行为事件（失败只告警，不影响页面）
function logEvent(type, nodeId, value) {
  const event = {
    type,
    node_id: nodeId || null,
    session_id: getSessionId(),
    value: value || null,
    created_at: new Date().toISOString(),
  };
  saveLocalEvent(event);
  if (!supabase) return;
  supabase
    .from("events")
    .insert({ type: event.type, node_id: event.node_id, session_id: event.session_id, value: event.value })
    .then(({ error }) => { if (error) console.warn("[events] 写入失败:", error.message); });
}

export function logVisit()           { logEvent("visit", null, null); }
export function logClick(spotId)     { logEvent("click", spotId, null); }
export function logDwell(spotId, ms) { logEvent("dwell", spotId, { ms }); }
export function logRoute(comboIds)   { logEvent("route", null, { combo: comboIds }); }

// 给 app.jsx 初始 state 用（同步返回空结构）
export function loadAnalytics() { return emptyAnalytics(); }

// 从云端读取并聚合成「数据看板」需要的结构
export async function fetchAnalytics() {
  if (!supabase) return fallbackAnalytics(); // 没连数据库时退回本地备份/演示种子
  const a = emptyAnalytics();
  try {
    // 头部 KPI 用精确计数
    const cnt = async (type) => {
      const { count, error } = await supabase
        .from("events").select("*", { count: "exact", head: true }).eq("type", type);
      if (error) throw error;
      return count || 0;
    };
    a.visits = await cnt("visit");
    a.routeCount = await cnt("route");
    // 拉取最近事件做明细聚合（点击排行 / 停留 / 路线组合）
    const { data: rows, error } = await supabase
      .from("events").select("type,node_id,value,created_at")
      .order("created_at", { ascending: false }).limit(10000);
    if (error) throw error;
    if (!rows) return a;
    const details = aggregateEvents(rows);
    details.visits = a.visits;
    details.routeCount = a.routeCount;
    return details;
  } catch (error) {
    console.warn("[events] 读取失败，已使用本地备份/演示数据:", error.message || error);
    return fallbackAnalytics();
  }
}

// 读取最近事件流（事件日志页用）
export async function fetchRecentEvents(limit = 200) {
  if (!supabase) return readLocalEvents().slice(0, limit);
  try {
    const { data, error } = await supabase
      .from("events").select("type,node_id,value,created_at")
      .order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn("[events] 日志读取失败，已使用本地备份:", error.message || error);
    return readLocalEvents().slice(0, limit);
  }
}

// 累计事件总数
export async function fetchEventCount() {
  if (!supabase) return readLocalEvents().length;
  try {
    const { count, error } = await supabase.from("events").select("*", { count: "exact", head: true });
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.warn("[events] 总数读取失败，已使用本地备份:", error.message || error);
    return readLocalEvents().length;
  }
}

// ---- 离线演示用的种子数据（没连数据库时兜底） ----
export function seedAnalytics() {
  return {
    visits: 1284,
    clicks: {
      yinjiashan: 186, huanggeshu: 210, yanxue: 142, caizhai: 324,
      guanjinghu: 456, entry: 412, kangyang: 178, guyizhan: 597,
      matou: 220, tianyuancanting: 318, qinggang: 195, shuiguo: 280,
      zhuhai: 245, minsu: 193, guanjingtai: 338, binshuigongyuan: 178, binshuicanting: 165,
    },
    dwellMs: {
      yinjiashan: 20880000, huanggeshu: 15600000, yanxue: 21600000, caizhai: 15480000,
      guanjinghu: 24960000, entry: 3716000, kangyang: 10800000, guyizhan: 35160000,
      matou: 12000000, tianyuancanting: 14400000, qinggang: 16200000, shuiguo: 18000000,
      zhuhai: 21600000, minsu: 12960000, guanjingtai: 23100000, binshuigongyuan: 10680000, binshuicanting: 9600000,
    },
    dwellOpens: {
      yinjiashan: 186, huanggeshu: 210, yanxue: 142, caizhai: 324,
      guanjinghu: 456, entry: 412, kangyang: 178, guyizhan: 597,
      matou: 220, tianyuancanting: 318, qinggang: 195, shuiguo: 280,
      zhuhai: 245, minsu: 193, guanjingtai: 338, binshuigongyuan: 178, binshuicanting: 165,
    },
    routes: [
      { combo: ["entry", "kangyang", "guyizhan", "shuiguo", "minsu", "binshuicanting"], n: 86 },
      { combo: ["entry", "guanjinghu", "caizhai", "guyizhan", "matou"], n: 64 },
      { combo: ["entry", "kangyang", "qinggang", "zhuhai", "guanjingtai", "binshuicanting"], n: 41 },
      { combo: ["entry", "guanjinghu", "yinjiashan", "huanggeshu", "caizhai"], n: 33 },
      { combo: ["entry", "tianyuancanting", "shuiguo", "minsu", "binshuigongyuan"], n: 28 },
    ],
    routeCount: 392,
  };
}

// ---- 景点图片映射 ----
export const SPOT_IMAGES = {
  yinjiashan:      getResource("photo_guanjing", "assets/photos/观景台.jpg"),
  huanggeshu:      getResource("photo_mandao", "assets/photos/漫步道.jpg"),
  yanxue:          getResource("photo_yanxue", "assets/photos/田园研学营地.jpg"),
  caizhai:         getResource("photo_caizhai", "assets/photos/采摘谷.jpg"),
  guanjinghu:      getResource("photo_gjhu", "assets/photos/观景湖.jpg"),
  entry:           getResource("photo_entry", "assets/photos/码头.jpg"),
  kangyang:        getResource("photo_yingdi", "assets/photos/营地.jpg"),
  guyizhan:        getResource("photo_gudao", "assets/photos/古道.jpg"),
  matou:           getResource("photo_entry", "assets/photos/码头.jpg"),
  tianyuancanting: getResource("photo_tianyuan", "assets/photos/田园餐厅.jpg"),
  qinggang:        getResource("photo_linxia", "assets/photos/林下乐园.jpg"),
  shuiguo:         getResource("photo_meishi", "assets/photos/荔枝美食.jpg"),
  zhuhai:          getResource("photo_yingdi", "assets/photos/营地.jpg"),
  minsu:           getResource("photo_minsu", "assets/photos/田园民宿.jpg"),
  guanjingtai:     getResource("photo_guanjing", "assets/photos/观景台.jpg"),
  binshuigongyuan: getResource("photo_binshui", "assets/photos/滨水公园.jpg"),
  binshuicanting:  getResource("photo_tianyuan", "assets/photos/田园餐厅.jpg"),
};

// ---- 商品数据 ----
export const PRODUCTS = [
  { id: "p1", name: "走马鲜荔枝", nameEn: "Fresh Lychee", price: 68, unit: "约2斤/份",
    cat: "fruit", img: "assets/photos/荔枝.jpg", spots: ["caizhai", "shuiguo"],
    desc: "当季现摘鲜荔枝，走马岭特有沙质土壤培育，风味独特" },
  { id: "p2", name: "龙溪桂圆干", nameEn: "Dried Longan", price: 45, unit: "250g/袋",
    cat: "dried", img: "assets/photos/龙眼.jpg", spots: ["caizhai", "shuiguo"],
    desc: "百年桂圆古树果实，传统日晒工艺，肉厚核小" },
  { id: "p3", name: "荔枝蜂蜜酒", nameEn: "Lychee Mead", price: 128, unit: "500ml/瓶",
    cat: "drink", img: "assets/photos/蜂蜜酒.jpg", spots: ["shuiguo", "tianyuancanting"],
    desc: "荔枝花蜜与山泉水酿造，微甜回甘，限量手工酿" },
  { id: "p4", name: "竹编手工篮", nameEn: "Bamboo Basket", price: 86, unit: "个",
    cat: "craft", img: "assets/photos/竹篮.jpg", spots: ["zhuhai"],
    desc: "竹海疗愈课堂手作体验作品，大叶薄竹编织，可定制" },
  { id: "p5", name: "土蜂蜜", nameEn: "Wild Honey", price: 58, unit: "350g/罐",
    cat: "dried", img: "assets/photos/蜂蜜.jpg", spots: ["qinggang", "yinjiashan"],
    desc: "青岗林场野生蜂群采集，未加工原蜜，四季花源" },
  { id: "p6", name: "荔枝糕点礼盒", nameEn: "Lychee Pastry Box", price: 98, unit: "8枚装",
    cat: "dried", img: "assets/photos/糕点.jpg", spots: ["shuiguo", "tianyuancanting"],
    desc: "荔枝果肉手工糕点，适合伴手礼，精美礼盒包装" },
  { id: "p7", name: "田园民宿体验券", nameEn: "Farmstay Voucher", price: 388, unit: "晚",
    cat: "stay", img: "assets/photos/田园民宿.jpg", spots: ["minsu"],
    desc: "滨水精品民宿住宿体验，含早餐与在地食材晚餐" },
  { id: "p8", name: "田园火锅套餐", nameEn: "Farm Hotpot Set", price: 168, unit: "2-3人份",
    cat: "food", img: "assets/photos/田园餐厅.jpg", spots: ["tianyuancanting", "binshuicanting"],
    desc: "田园餐厅招牌火锅，在地时蔬 + 龙溪河鲜，可预约" },
];

export const PRODUCT_CATS = {
  fruit: { label: "鲜果时令", color: "#6bc26b" },
  dried: { label: "加工美食", color: "#c9a227" },
  drink: { label: "特色饮品", color: "#e88e3c" },
  craft: { label: "手工文创", color: "#4a9eda" },
  food:  { label: "餐饮预约", color: "#e05555" },
  stay:  { label: "住宿体验", color: "#b06fd8" },
};
