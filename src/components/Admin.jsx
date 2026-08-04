// ============================================================
// 管理后台 — 数据看板 · 景点管理 · 路线配置
// ============================================================
import React, { useState, useEffect } from "react";
import { CATEGORY_META, SPOT_IMAGES, fetchRecentEvents, fetchEventCount } from "../data.js";
import { getResource } from "../resources.js";
import { Placeholder } from "./Visitor.jsx";

// ---- 横向条形图 ----
function BarChart({ rows, unit, accent }) {
  const max = Math.max(...rows.map((r) => r.v), 1);
  return (
    <div className="bars">
      {rows.map((r, i) => (
        <div key={i} className="bar-row">
          <span className="bar-label">{r.label}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: (r.v / max) * 100 + "%", background: r.color || accent }} />
          </div>
          <span className="bar-val">{r.disp != null ? r.disp : r.v}{unit || ""}</span>
        </div>
      ))}
    </div>
  );
}

function KPI({ label, value, sub }) {
  return (
    <div className="kpi">
      <div className="kpi-val">{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

// ---- 数据看板 ----
function Dashboard({ spots, analytics }) {
  const byId = Object.fromEntries(spots.map((s) => [s.id, s]));
  const clickRows = spots.map((s) => ({
    label: s.name, v: analytics.clicks[s.id] || 0, color: CATEGORY_META[s.cat].color,
  })).sort((a, b) => b.v - a.v);

  const dwellRows = spots.map((s) => {
    const opens = analytics.dwellOpens[s.id] || 0;
    const avg = opens ? (analytics.dwellMs[s.id] || 0) / opens / 1000 : 0;
    return { label: s.name, v: avg, disp: avg.toFixed(0) + "s", color: CATEGORY_META[s.cat].color };
  }).sort((a, b) => b.v - a.v);

  const totalClicks = Object.values(analytics.clicks).reduce((a, b) => a + b, 0);
  const topSpot = clickRows[0];
  const routes = [...analytics.routes].sort((a, b) => b.n - a.n).slice(0, 5);

  return (
    <div className="dash">
      <div className="kpi-grid">
        <KPI label="累计访问" value={analytics.visits.toLocaleString()} sub="预运营期间" />
        <KPI label="景点点击总量" value={totalClicks.toLocaleString()} sub="17 个景点" />
        <KPI label="生成路线次数" value={(analytics.routeCount || 0).toLocaleString()} sub="累计规划" />
        <KPI label="最受欢迎" value={topSpot.label} sub={topSpot.v.toLocaleString() + " 次点击"} />
      </div>

      <div className="dash-grid">
        <section className="card">
          <div className="card-head"><h3>各景点点击量排行</h3><span className="card-sub">识别热门地点 · 优先建设</span></div>
          <BarChart rows={clickRows} unit=" 次" accent="#c9a227" />
        </section>

        <section className="card">
          <div className="card-head"><h3>弹窗平均停留时长</h3><span className="card-sub">评估内容吸引力</span></div>
          <BarChart rows={dwellRows} accent="#dfc25a" />
        </section>

        <section className="card">
          <div className="card-head"><h3>常见路线组合</h3><span className="card-sub">了解用户偏好的游览组合</span></div>
          <div className="combo-list">
            {routes.map((r, i) => (
              <div key={i} className="combo-row">
                <span className="combo-rank">{i + 1}</span>
                <span className="combo-path">
                  {r.combo.map((id, j) => (
                    <React.Fragment key={id}>
                      {byId[id] ? byId[id].name : id}
                      {j < r.combo.length - 1 && <i className="combo-arr">→</i>}
                    </React.Fragment>
                  ))}
                </span>
                <span className="combo-n">{r.n} 次</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><h3>景点热度分布</h3><span className="card-sub">辅助规划决策</span></div>
          <HeatMap spots={spots} clicks={analytics.clicks} />
        </section>
      </div>
    </div>
  );
}

// ---- 前期建设分析 ----
const PHASE_NODE_CLICKS = {
  huanggeshu: 986,
  guyizhan: 914,
  shuiguo: 836,
  zhuhai: 775,
  yanxue: 692,
  minsu: 638,
};

const BUILDING_DB_STATS = [
  { value: "5", label: "新版空间分区", sub: "观景研学、种植体验、历史驿道、滨水康养、生态林场" },
  { value: "6", label: "A-F 建筑类型", sub: "从传统风貌建筑到观景边界构筑物" },
  { value: "14+", label: "节能低碳策略", sub: "围护结构、设备系统、雨水利用与智慧能耗" },
  { value: "R1-R5", label: "改造路线规则", sub: "保护修缮、风貌协调、综合更新、新建植入、轻量构筑" },
];

const BUILDING_WORKFLOW = [
  ["01", "记录现状", "逐栋记录建筑位置、结构、层数、材料、保存状态、使用状态、权属和周边空间条件，形成可筛选、可更新的建筑单体台账。"],
  ["02", "判断价值", "将传统风貌、空间位置、观景条件、结构安全、可运营性纳入综合评级，形成保护修缮、风貌整治和经营导入优先级。"],
  ["03", "推荐策略", "根据建筑类型、材料冲突、保存状态、功能需求推荐外立面与节能改造路线，实现“条件输入—路线输出”。"],
  ["04", "支撑汇报", "将复杂调研转换为建筑分类、问题图谱、材料库、改造矩阵和路线推荐，支撑后续汇报与图面转译。"],
];

const BUILDING_ZONES = [
  { title: "自然观景研学区", text: "北部山地、林田与观景高地，以自然景观、步道系统、研学活动和观景节点为主。", items: ["建筑角色：观景停留、自然研学、科普展示、轻量服务、特色小型住宿配套", "重点对象：观景平台、研学驿站、自然教育教室、山间服务点、研学宿营/工作坊"] },
  { title: "种植生活体验区", text: "以田园种植、果园、水塘及农事活动空间为主，承载采摘、农事体验与农产品展示。", items: ["建筑角色：农事展示、加工体验、亲子活动、餐饮配套、农产品展销", "重点对象：果园配套建筑、田园餐厅、加工/展示空间、亲子农场服务点、邻近居民点民居"] },
  { title: "走马历史驿道区", text: "以走马驿、传统村落核心、荔枝古道沿线、街巷公共空间和重要观景节点为主。", items: ["建筑角色：文化展示、风貌保护、民宿休闲、非遗体验、游客停留", "重点对象：走马驿站、传统民居、风貌整治建筑、损毁宅基地/空地、街巷节点建筑"] },
  { title: "滨水康养休闲区", text: "依托临水岸线、滨水步道、营地及休闲节点，导入康养休闲、慢行体验与滨水消费。", items: ["建筑角色：康养休闲、慢行服务、滨水消费、轻住宿、公共配套", "重点对象：滨水民居、滨水餐饮/咖啡、康养驿站、营地服务建筑、亲水平台、公厕与停车服务点"] },
  { title: "生态林场疗愈区", text: "依托南部林场与林下空间，强调森林疗愈、静养休憩、林下活动和轻量化特色住宿。", items: ["建筑角色：森林疗愈、静修康养、自然教育、林下轻运动、特色住宿", "重点对象：林场周边民居、疗愈小屋/树屋、林下活动服务点、休憩驿站、轻型构筑物"] },
  { title: "分区—建筑联动", text: "同一建筑类型在不同分区会导向不同改造重点。", items: ["传统民居在历史驿道区偏向保护修缮，在滨水康养区偏向轻住宿与康养配套", "闲置建筑在种植体验区可转为农产品展示，在自然观景区可转为研学驿站"] },
];

const BUILDING_FIELDS = [
  ["基础识别", "建筑编号 / 所在分区 / 坐标与海拔", "ZM-B-001；自然观景研学区/种植生活体验区/走马历史驿道区等；临崖/临街/临田", "建立单体索引，与照片、图纸和地图绑定，并判断可达性、视线和安全风险。"],
  ["建筑属性", "建筑年代 / 层数高度 / 结构类型", "传统时期、20世纪后期、近年新建；砖木、砖混、石木、钢结构", "判断保护价值、材料真实性、风貌尺度与加固方式。"],
  ["权属运营", "产权/使用权 / 现状功能", "村民自有、集体、闲置、租赁意向；自住、仓储、经营、公共、废弃", "决定实施可行性、运营模式、改造优先级和功能导入可能。"],
  ["材料记录", "屋顶 / 墙体 / 门窗材料", "小青瓦、树脂瓦、彩钢瓦；石砌、夯土、青砖、红砖、水泥抹灰；木窗、铝框窗、塑钢窗", "识别风貌冲突，决定屋面、墙体、门窗的节能与立面改造路线。"],
  ["病害安全", "结构安全 / 围护病害", "良好、一般、较差、危房；漏水、返潮、开裂、墙面剥落、排水不畅", "决定修缮、加固、封控或拆除新建前置条件。"],
  ["空间潜力", "街巷界面 / 景观条件 / 适配功能 / 节能潜力", "沿主街、巷道端头、节点广场；南观田园、北望城市、临河、建筑阳台；民宿、餐饮、展览、服务点、自住更新", "生成推荐业态、节能路线和近期/中期/远期实施判断。"],
];

const BUILDING_TYPES = [
  ["A", "传统风貌建筑", "小青瓦、石砌/夯土/青砖墙、木门窗，空间尺度与传统村落肌理协调。", ["保护性修缮", "修旧如旧", "结构安全优先"]],
  ["B", "传统骨架+现代材料混合建筑", "形体接近传统民居，但局部使用树脂瓦、彩钢瓦、铝框窗、水泥抹灰等。", ["材料冲突", "风貌协调", "统一屋面门窗"]],
  ["C", "非传统风貌建筑", "新建或改建痕迹明显，体量、屋顶、立面、材料与传统村落不协调。", ["立面突兀", "界面软化", "格栅/绿化遮蔽"]],
  ["D", "损毁民居或空地", "原建筑已损毁、仅余基础或空置宅基地，易造成界面断裂和安全隐患。", ["新建植入", "节点广场", "小体量民宿"]],
  ["E", "公共服务/经营性建筑", "游客中心、技艺工坊、乡村酒店、游客服务点、餐饮建筑等。", ["运营强度高", "识别性", "舒适效率提升"]],
  ["F", "观景与边界构筑物", "临崖空间、观景平台、建筑阳台、景观交通塔、营地平台等。", ["轻量可逆", "安全防护", "防滑排水"]],
];

const BUILDING_RATINGS = [
  ["历史风貌价值", "传统材料与构造保存较完整，位于核心街巷或重要节点", "局部保留传统元素，但现代材料干扰明显", "缺少传统特征或后期改建较重", "价值越高，越强调保护性修缮和最小干预。"],
  ["结构保存状态", "结构稳定，屋面基本完整", "存在局部开裂、渗漏、变形，需加固", "损毁严重或存在安全隐患", "状态越差，越需要结构鉴定和阶段性封控。"],
  ["空间运营潜力", "可达性好、临街/临景、面积适合经营", "位置一般但可通过改造提升", "偏远、面积过小或权属不明确", "决定业态导入优先级。"],
  ["景观视线价值", "具备南观田园、北望城市、临河或临崖景观", "局部视线条件较好", "缺少景观优势", "影响民宿、咖啡、观景平台适配度。"],
  ["实施可行性", "产权清晰、村民意愿较强、施工干扰小", "需协调权属或施工条件", "产权复杂、成本高或政策限制大", "决定近期/中期/远期安排。"],
];

const MATERIAL_DESCRIPTIONS = [
  ["屋顶：小青瓦 / 树脂瓦 / 彩钢瓦", "小青瓦优先修补、翻盖、补漏并保留肌理；树脂瓦和彩钢瓦易造成风貌冲突，彩钢瓦还存在雨噪和热工问题，应优先替换或做隔声隔热处理。"],
  ["墙体：石砌 / 夯土竹编 / 青砖红砖 / 抹灰贴砖", "石砌墙应保护原真性，避免大面积贴面覆盖；夯土与竹编墙强调透气防潮；红砖和亮色抹灰需通过灰色、土色、石材基座或木格栅协调。"],
  ["门窗：木门木窗 / 木框玻璃 / 铝框玻璃 / 塑钢窗", "传统木窗优先修复并提高气密性；铝框和塑钢窗需统一色彩分格，建议深色窄框或木色窗，并增加窗套与遮阳。"],
];

const PROBLEM_LIBRARY = [
  ["屋顶冲突", "高", 92],
  ["墙面冲突", "高", 82],
  ["门窗冲突", "中高", 78],
  ["外挂设备", "中", 70],
  ["附属搭建", "中", 68],
  ["街巷界面薄弱", "中高", 75],
  ["安全与耐久", "优先", 88],
];

const FUNCTION_ADAPTATIONS = [
  ["村民原居改善 / 自住更新", "适用于仍有村民居住或计划继续自住、回迁使用的建筑。重点是结构安全、屋面防水保温、门窗气密、厨卫更新、给排水电气整理、适老化、防滑照明和院落排水。", ["保留原住民生活", "隐私与消防", "避免过度商业化"]],
  ["精品 / 主题民宿", "适用于传统风貌较好、景观视线佳、可独立出入且面积适中的建筑。需重点处理结构加固、卫生间植入、隔声保温、消防疏散与污水处理。", ["历史驿道区", "滨水康养区", "生态林场区"]],
  ["咖啡 / 书吧 / 茶摊", "适用于临街、临崖或节点广场、具备停留景观的建筑。重点是开放界面、遮阳照明、给排水、外摆边界和夜间扰民控制。", ["节点停留", "临崖安全", "外摆界面"]],
  ["非遗 / 技艺工坊", "靠近走马驿或公共空间、具备展示与教学面积的建筑，可植入展陈墙、可清洁地面、储藏、互动桌和无障碍设施。", ["走马历史驿道区", "种植体验节点", "防火收纳"]],
  ["田园餐厅 / 荔枝美食工坊", "靠近果园、居民点、车行可达且给排水便利的建筑，需解决厨房排烟、污水、食品安全、室外就餐平台和消防问题。", ["种植生活体验区", "滨水康养休闲区", "油烟垃圾"]],
  ["游客服务点 / 亲子研学 / 后勤仓储", "游线节点可提供问询、休憩、寄存、厕所、饮水和信息屏；亲子研学强调防滑围栏、洗手遮阴和课程展示；后勤仓储应避免占用核心展示面。", ["服务半径", "儿童安全", "遮蔽外观"]],
];

const ENERGY_STRATEGIES = [
  ["围护结构", "屋面节能", "针对夏季热量进入、雨噪、漏水问题。", ["修缮防水层", "增设保温层与通风层", "彩钢瓦优先替换或加隔声隔热层"]],
  ["围护结构", "外墙节能", "针对返潮、裂缝、热工性能差。", ["先排水防潮再结构修补", "传统墙体采用内侧轻质保温", "避免外贴保温覆盖石墙夯土肌理"]],
  ["门窗系统", "门窗更新", "兼顾气密性与传统风貌协调。", ["修复木窗并加密封条", "更换中空玻璃", "非传统窗统一深色窄框或木色"]],
  ["被动节能", "遮阳系统", "应对夏季西晒和室外停留不足。", ["檐廊、竹木格栅", "可移动遮阳", "藤架与落叶乔木"]],
  ["被动节能", "自然通风", "改善室内潮湿与夏季闷热。", ["组织对流通风", "修复高窗/侧窗", "设置可开启通风扇并兼顾防虫防盗"]],
  ["水环境", "给排水优化", "解决院落积水和屋面雨水无组织排放。", ["檐沟、雨水链、暗沟", "透水铺装", "厨房卫生间单独排污"]],
  ["设备系统", "高效设备", "适合经营性建筑与公共服务建筑。", ["空调外机集中后置并设遮罩", "高效热泵/变频设备", "公共空间分区控制"]],
  ["适老友好", "适老更新", "服务村民自住、民宿和公共服务。", ["防滑铺装、扶手", "夜间导光与无障碍坡道", "适老卫生间"]],
  ["绿色低碳", "可再生能源", "面向游客中心、乡村酒店、营地服务和停车棚等非传统展示面。", ["分布式光伏", "光伏+遮阳+充电复合设施", "深色低反光组件与可逆安装"]],
  ["绿色低碳", "太阳能热水", "为民宿、餐饮、公共卫生间提供生活热水补充。", ["屋后坡面或后场布置", "管线集中隐藏", "避开主要观景面与街巷展示面"]],
  ["水资源", "雨水收集与再利用", "服务庭院浇灌、农事体验、景观补水和道路冲洗。", ["檐沟、雨水链、蓄水桶", "生态水池", "雨污分流，避免直接入河污染"]],
  ["低碳建造", "低碳材料与智慧能耗", "降低建筑垃圾并提升后期运营管理能力。", ["回收条石、青砖、木构件、小青瓦", "可装配、可拆卸、低干扰材料", "分项电表、智能照明、分区空调和能耗监测"]],
];

const ROUTE_RULES = {
  R1: { name: "保护修缮型", desc: "传统风貌完整度高且结构基本可修。核心动作是结构安全加固、屋面修缮、传统材料修复和室内低扰动更新。" },
  R2: { name: "风貌协调型", desc: "传统骨架尚在，但屋顶、门窗、墙面存在现代材料冲突。重点替换树脂瓦/彩钢瓦，统一门窗和墙面。" },
  R3: { name: "综合更新型", desc: "非传统风貌建筑或功能需求较高，但区位和运营潜力好。通过立面分段、坡屋顶协调和内部功能重组改善。" },
  R4: { name: "新建植入型", desc: "损毁民居、空地或闲置宅基地，且符合建设条件。控制体量与高度，植入公共/经营小体量空间。" },
  R5: { name: "轻量构筑型", desc: "临崖、屋后空地、营地、步道节点或高视线价值区域。采用可逆式平台、栏杆、防滑排水和夜景照明。" },
};

const ROUTE_CONDITIONS = [
  ["传统风貌完整度=高，结构安全=良好/一般", "优先 R1 保护修缮型，仅允许低扰动功能植入。"],
  ["屋顶材料=树脂瓦/彩钢瓦，或门窗=铝框玻璃窗，且整体体量仍协调", "优先 R2 风貌协调型，节能重点为屋面、门窗和遮阳。"],
  ["风貌完整度=低，但区位可达=高、运营潜力=高", "推荐 R3 综合更新型，外观以协调为目标，内部可较大幅度更新。"],
  ["使用状态=损毁/空地，且权属清晰、建设条件允许", "推荐 R4 新建植入型，功能优先公共服务和集体经营。"],
  ["空间关系=临崖/屋后空地/巷道端头/建筑阳台，且视线价值高", "推荐 R5 轻量构筑型，必须同步评估结构承载和临崖安全。"],
  ["保存状态=危房/结构较差", "所有路线前置“专业结构鉴定”，不可直接导入经营功能。"],
  ["产权/使用意愿=不明确", "标记为“待协调”，不进入近期实施库。"],
];

const AI_FLOW = [
  ["01 建筑现状录入", "编号、分区、类型、层数、结构、材料、使用状态。"],
  ["02 图片识别辅助", "识别屋顶形式、墙体材料、门窗类型和外挂设备。"],
  ["03 建筑诊断生成", "生成风貌问题、节能问题、安全问题和功能潜力。"],
  ["04 路线匹配", "从 R1-R5 中匹配最适合的改造方向。"],
  ["05 策略组合", "组合立面、围护、遮阳、通风、低碳和适老策略。"],
  ["06 方案输出", "形成推荐路线、设计动作、实施顺序与效果生成提示。"],
];

function PhaseConstruction({ spots, analytics }) {
  const [subpage, setSubpage] = useState("analysis");
  const byId = Object.fromEntries(spots.map((s) => [s.id, s]));
  const ranked = Object.entries(PHASE_NODE_CLICKS)
    .map(([id, clicks]) => byId[id] ? { ...byId[id], clicks } : null)
    .filter(Boolean);
  const maxClicks = Math.max(...ranked.map((s) => s.clicks), 1);

  return (
    <div className="phase">
      <div className="phase-subnav">
        <button className={subpage === "analysis" ? "active" : ""} onClick={() => setSubpage("analysis")}>前期建设分析</button>
        <button className={subpage === "buildingDb" ? "active" : ""} onClick={() => setSubpage("buildingDb")}>建筑改造数据库</button>
        <button className={subpage === "recommender" ? "active" : ""} onClick={() => setSubpage("recommender")}>改造推荐器</button>
      </div>
      {subpage === "buildingDb" && <BuildingDatabaseStrategy />}
      {subpage === "recommender" && <BuildingRecommender />}
      {subpage === "analysis" && (
        <>
      <div className="phase-flow">
        <div className="phase-step">
          <span>1</span>
          <strong>模拟点击排行</strong>
          <p>以汇报图中的候选节点为样本，生成用户关注度排序。</p>
        </div>
        <div className="phase-step">
          <span>2</span>
          <strong>筛选前六节点</strong>
          <p>按热度高低提取 6 个优先节点，作为一期建设对象。</p>
        </div>
        <div className="phase-step">
          <span>3</span>
          <strong>形成建设清单</strong>
          <p>将节点转化为前期建设项目，支撑引流、体验和消费。</p>
        </div>
      </div>

      <div className="phase-summary">
        <section className="phase-brief">
          <div className="card-head">
            <h3>从点击排行到建设决策</h3>
            <span className="card-sub">数据排序 → 节点筛选 → 前期建设</span>
          </div>
          <p>
            首先根据汇报图中的节点生成模拟点击数据，得到用户关注度排行；随后选取排名前六的高热度节点，
            作为一期优先建设对象；最后将这 6 个节点统一纳入前期建设项目，形成从数据判断到空间落位的决策链条。
          </p>
        </section>

        <div className="phase-kpis">
          <KPI label="数据样本" value={ranked.length} sub="模拟点击节点" />
          <KPI label="建设批次" value="一期" sub="前期统一实施" />
          <KPI label="筛选规则" value="Top 6" sub="按热度排序" />
        </div>
      </div>

      <section className="card phase-card">
        <div className="card-head">
          <h3>1 数据排行：模拟点击量 Top 6</h3>
          <span className="card-sub">点击量越高，表示前期关注度与启动价值越强</span>
        </div>
        <PhaseNodeList nodes={ranked} maxClicks={maxClicks} />
      </section>

      <section className="card phase-decision">
        <div className="card-head">
          <h3>2 筛选结论：确定六个前期建设节点</h3>
          <span className="card-sub">从高热度节点中提取一期启动对象</span>
        </div>
        <div className="phase-decision-list">
          {ranked.map((s, i) => (
            <span key={s.id}>{i + 1}. {s.name}</span>
          ))}
        </div>
        <p>
          这 6 个节点覆盖村落客厅、古驿文化、加工消费、竹海研学、田园活动与住宿承接，
          能够串联形成一条完整的前期体验链。
        </p>
      </section>

      <section className="card phase-map-card">
        <div className="card-head">
          <h3>3 建设落位：一期建设分析图</h3>
          <span className="card-sub">将筛选结果落实到空间节点与建设内容</span>
        </div>
        <img
          className="phase-map-img"
          src="assets/phase-construction-analysis.png"
          alt="一期建设分析图"
        />
      </section>
        </>
      )}
    </div>
  );
}

function chooseBuildingRoute(form) {
  const { type, style, structure, roof, window, space, target } = form;
  if (structure === "危房" || structure === "较差") {
    return { key: "R1", note: "需前置专业结构鉴定，完成安全评估前不导入高强度经营功能。" };
  }
  if (type === "D") return { key: "R4" };
  if (type === "F" || ["临崖", "屋后空地", "建筑阳台"].includes(space) || target === "观景平台/半公共阳台") return { key: "R5" };
  if (type === "A" && style === "高") return { key: "R1" };
  if (type === "B" || ["树脂瓦", "彩钢瓦"].includes(roof) || ["铝框玻璃窗", "塑钢窗"].includes(window)) return { key: "R2" };
  if (type === "C" || type === "E" || style === "低") return { key: "R3" };
  return { key: "R2" };
}

function BuildingDatabaseStrategy() {
  const [form, setForm] = useState({
    zone: "走马历史驿道区",
    type: "A",
    style: "高",
    structure: "一般",
    roof: "小青瓦",
    window: "木门木窗",
    space: "沿主街",
    target: "村民原居改善/自住更新",
  });
  const choice = chooseBuildingRoute(form);
  const route = ROUTE_RULES[choice.key];
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const reasons = [
    `所在分区为“${form.zone}”，需要先服从分区风貌和运营定位。`,
    `建筑类型为 ${form.type} 类，风貌完整度“${form.style}”，结构安全“${form.structure}”。`,
    `屋顶为“${form.roof}”、门窗为“${form.window}”，决定立面协调和节能更新重点。`,
    choice.note || `根据数据库规则，当前更适合进入 ${choice.key} ${route.name}。`,
  ];

  return (
    <div className="building-db">
      <section className="building-hero">
        <div>
          <span className="building-kicker">ZOUMA BUILDING RENOVATION DATABASE</span>
          <h3>走马村建筑改造数据库与立面节能策略推荐系统</h3>
          <p>
            基于更新后的建筑数据库，将“空间分区—建筑类型—材料问题—功能适配—节能低碳—路线推荐”
            整合为一个可展示、可筛选、可用于设计判断的网页原型。重点强化原住民自住更新、
            绿色低碳技术库与五大新版场地分区。
          </p>
        </div>
        <div className="building-stat-grid">
          {BUILDING_DB_STATS.map((s) => (
            <div key={s.label} className="building-stat">
              <b>{s.value}</b>
              <span>{s.label}</span>
              <small>{s.sub}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="building-section">
        <div className="building-section-head">
          <span>01 DATABASE LOGIC</span>
          <h3>建筑数据库使用逻辑</h3>
          <p>数据库不只是资料整理，而是从现状录入进入风貌判断、价值评价、节能改造和改造路线生成的设计决策工具。</p>
        </div>
        <div className="building-flow">
          {BUILDING_WORKFLOW.map(([no, title, text]) => (
            <div key={no} className="building-flow-step">
              <b>{no}</b>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="building-section">
        <div className="building-section-head">
          <span>02 SPATIAL ZONES</span>
          <h3>空间分区与建筑角色</h3>
          <p>新版数据库将场地更新为五个主题分区，每个分区对应不同的建筑角色、重点录入对象和后续功能导入方向。</p>
        </div>
        <div className="building-card-grid zones">
          {BUILDING_ZONES.map((zone) => (
            <div key={zone.title} className="building-card">
              <h4>{zone.title}</h4>
              <p>{zone.text}</p>
              <ul>{zone.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="building-section">
        <div className="building-section-head">
          <span>03 SINGLE BUILDING RECORD</span>
          <h3>建筑单体现状采集字段</h3>
          <p>采集字段将现场调研转化为可计算、可判断的设计输入，为后续推荐路线提供条件。</p>
        </div>
        <div className="building-data-table fields">
          <div className="building-data-head"><span>字段组</span><span>字段名称</span><span>取值示例</span><span>设计用途</span></div>
          {BUILDING_FIELDS.map(([group, field, example, use]) => (
            <div key={group} className="building-data-row">
              <b>{group}</b>
              <span>{field}</span>
              <span>{example}</span>
              <span>{use}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="building-section">
        <div className="building-section-head">
          <span>04 BUILDING TYPES</span>
          <h3>建筑类型与价值分级</h3>
          <p>通过 A-F 六类建筑类型识别不同的现状基础、主要问题和建议改造方向。</p>
        </div>
        <div className="building-type-grid">
          {BUILDING_TYPES.map(([code, title, text, tags]) => (
            <div key={code} className="building-type">
              <em>{code}</em>
              <h4>{title}</h4>
              <p>{text}</p>
              <div className="building-tag-row">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
          ))}
        </div>
        <div className="building-data-table rating">
          <div className="building-data-head"><span>评级维度</span><span>A 高</span><span>B 中</span><span>C 低</span><span>对改造的影响</span></div>
          {BUILDING_RATINGS.map(([dim, high, mid, low, impact]) => (
            <div key={dim} className="building-data-row">
              <b>{dim}</b>
              <span>{high}</span>
              <span>{mid}</span>
              <span>{low}</span>
              <span>{impact}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="building-section">
        <div className="building-section-head">
          <span>05 MATERIAL & PROBLEM LIBRARY</span>
          <h3>材料谱系与风貌问题库</h3>
          <p>将屋顶、墙体、门窗和外挂附属问题转化为可识别的标签，形成后续立面和节能改造的判断依据。</p>
        </div>
        <div className="building-two-col compact">
          <div className="building-material-panel">
            <h4>材料谱系数据库</h4>
            {MATERIAL_DESCRIPTIONS.map(([title, text]) => (
              <div key={title} className="building-material-item">
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <div className="building-problem-panel">
            <h4>风貌问题库</h4>
            {PROBLEM_LIBRARY.map(([name, level, value]) => (
              <div key={name} className="building-problem-row">
                <span>{name}</span>
                <div><i style={{ width: `${value}%` }} /></div>
                <b>{level}</b>
              </div>
            ))}
            <div className="building-tag-row wrap">
              {["树脂瓦/彩钢瓦", "贴砖/裸红砖", "设备遮罩", "街巷铺装", "夜景照明"].map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="building-section">
        <div className="building-section-head">
          <span>06 FUNCTION ADAPTATION</span>
          <h3>功能适配数据库</h3>
          <p>新版数据库新增“村民原居改善/自住更新”，强调不是所有建筑都商业化，也要保留和改善村民真实生活。</p>
        </div>
        <div className="building-card-grid function wide">
          {FUNCTION_ADAPTATIONS.map(([title, text, tags]) => (
            <div key={title} className="building-card">
              <h4>{title}</h4>
              <p>{text}</p>
              <div className="building-tag-row">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="building-section">
        <div className="building-section-head">
          <span>07 ENERGY & LOW-CARBON STRATEGY</span>
          <h3>节能、舒适性与绿色低碳改造策略库</h3>
          <p>从围护结构被动节能到可再生能源、雨水利用、低碳材料和智慧能耗管理，形成适用于走马村建筑更新的专业策略库。</p>
        </div>
        <div className="building-energy-grid">
          {ENERGY_STRATEGIES.map(([label, title, text, items]) => (
            <div key={title} className="building-energy">
              <span>{label}</span>
              <b>{title}</b>
              <p>{text}</p>
              <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="building-section">
        <div className="building-section-head">
          <span>08 ROUTE RULES</span>
          <h3>R1-R5 改造路线推荐规则</h3>
          <p>不同建筑条件对应不同改造深度，避免“全部翻新”或“过度商业化”的单一做法。</p>
        </div>
        <div className="building-route-grid">
          {Object.entries(ROUTE_RULES).map(([key, item]) => (
            <div key={key} className={"building-route" + (choice.key === key ? " active" : "")}>
              <span>{key}</span>
              <h4>{item.name}</h4>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="building-data-table route-cond">
          <div className="building-data-head"><span>输入条件</span><span>推荐判断</span></div>
          {ROUTE_CONDITIONS.map(([condition, judgement]) => (
            <div key={condition} className="building-data-row">
              <span>{condition}</span>
              <span>{judgement}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

function BuildingRecommender() {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [aiFields, setAiFields] = useState({
    roof: "小青瓦",
    wall: "石砌墙",
    window: "木门木窗",
    style: "高",
    space: "沿主街",
    color: "上传后自动读取主色，可人工修正",
  });
  const [issues, setIssues] = useState(["屋顶冲突", "门窗冲突"]);
  const [form, setForm] = useState({
    buildingId: "ZM-B-001",
    floors: "1层",
    zone: "走马历史驿道区",
    type: "A",
    use: "自住",
    target: "村民原居改善/自住更新",
    style: "高",
    structure: "一般",
    roof: "小青瓦",
    wall: "石砌墙",
    window: "木门木窗",
    space: "沿主街",
  });

  useEffect(() => {
    if (!photo) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const choice = chooseBuildingRoute(form);
  const route = ROUTE_RULES[choice.key];
  const phase = form.structure === "危房" || form.structure === "较差"
    ? "安全鉴定优先"
    : choice.key === "R1" || choice.key === "R2"
      ? "近期样板 / 风貌整治"
      : choice.key === "R4"
        ? "中期建设协调"
        : "中期培育 / 轻量实施";
  const routeReasons = [
    photo ? `已上传建筑现状照片：${photo.name}，可作为屋顶、墙体、门窗和空间关系识别依据。` : "当前未上传照片，可先按手动条件生成路线。",
    `建筑类型为 ${form.type} 类，风貌完整度“${form.style}”，结构安全“${form.structure}”。`,
    `材料条件：屋顶“${form.roof}”、墙体“${form.wall}”、门窗“${form.window}”。`,
    choice.note || `根据 R1-R5 判断规则，系统推荐 ${choice.key} ${route.name}。`,
  ];

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }
  function updateAi(field, value) {
    setAiFields((prev) => ({ ...prev, [field]: value }));
  }
  function handlePhoto(file) {
    if (!file) return;
    setPhoto(file);
    const name = file.name;
    const next = {};
    if (/彩钢/.test(name)) next.roof = "彩钢瓦";
    if (/树脂/.test(name)) next.roof = "树脂瓦";
    if (/青瓦/.test(name)) next.roof = "小青瓦";
    if (/石|石砌/.test(name)) next.wall = "石砌墙";
    if (/夯土|竹编/.test(name)) next.wall = "夯土墙/竹编墙";
    if (/贴砖/.test(name)) next.wall = "贴砖";
    if (/铝/.test(name)) next.window = "铝框玻璃窗";
    if (/塑钢/.test(name)) next.window = "塑钢窗";
    if (/临崖/.test(name)) next.space = "临崖";
    if (/滨水|临河/.test(name)) next.space = "临河/滨水";
    if (Object.keys(next).length) setAiFields((prev) => ({ ...prev, ...next }));
  }
  function syncAiFields() {
    setForm((prev) => ({
      ...prev,
      roof: aiFields.roof,
      wall: aiFields.wall,
      window: aiFields.window,
      style: aiFields.style,
      space: aiFields.space,
    }));
  }
  function toggleIssue(issue) {
    setIssues((prev) => prev.includes(issue) ? prev.filter((x) => x !== issue) : [...prev, issue]);
  }
  function exportCase() {
    const data = {
      ...form,
      uploadedPhoto: photo ? { name: photo.name, size: photo.size, type: photo.type } : null,
      aiFields,
      issues,
      route: `${choice.key} ${route.name}`,
      routeDescription: route.desc,
      phase,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${form.buildingId || "zouma-building"}_diagnosis.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="building-db recommender-page">
      <section className="building-section recommender">
        <div className="building-section-head">
          <span>09 AI-ASSISTED RECOMMENDER</span>
          <h3>AI辅助改造推荐器：从输入现状到生成方案</h3>
          <p>按照“现状录入—图片识别辅助—建筑诊断生成—路线匹配—策略组合—方案输出”的六步流程，将数据库字段转译为建筑立面、节能绿色策略、功能适配和实施优先级。</p>
        </div>

        <div className="building-ai-flow">
          {AI_FLOW.map(([title, text]) => (
            <div key={title}>
              <b>{title}</b>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="recommender-upload-grid">
          <div className="recommender-upload-card">
            <label className={"recommender-drop" + (preview ? " has-image" : "")}>
              <input type="file" accept="image/*" onChange={(e) => handlePhoto(e.target.files?.[0])} />
              {preview ? (
                <img src={preview} alt="建筑现状照片预览" />
              ) : (
                <span>
                  <b>上传建筑现状照片</b>
                  <small>支持正立面、侧立面、屋顶局部、街巷界面照片。上传后可预览，并把识别/确认结果同步到下方数据库字段。</small>
                </span>
              )}
            </label>
            <div className="recommender-upload-copy">
              <h4>图片识别辅助入口 · 可实际录入</h4>
              <p>这里不再只是展示流程。设计者可以上传照片，系统保留图片预览，并生成一组“待确认字段”。确认后可一键写入建筑现状条件，直接参与 R1-R5 路线推荐。</p>
              <div className="recommender-meta">
                {photo ? `已上传：${photo.name}｜${Math.round(photo.size / 1024)} KB` : "当前未上传照片。可先手动填写识别字段，也可以上传照片后再确认。"}
              </div>
            </div>
          </div>

          <div className="recommender-ai-panel">
            <h4>识别结果确认区</h4>
            <p>照片识别结果作为数据库录入的辅助信息。设计者需要在这里确认屋顶、墙体、门窗、风貌和空间关系，再同步到推荐器。</p>
            <div className="recommender-ai-form">
              <label><span>屋顶形式/材料</span><select value={aiFields.roof} onChange={(e) => updateAi("roof", e.target.value)}><option>小青瓦</option><option>树脂瓦</option><option>彩钢瓦</option><option>水泥瓦</option><option>其他</option></select></label>
              <label><span>墙体材料</span><select value={aiFields.wall} onChange={(e) => updateAi("wall", e.target.value)}><option>石砌墙</option><option>夯土墙/竹编墙</option><option>青砖</option><option>红砖</option><option>水泥抹灰</option><option>贴砖</option></select></label>
              <label><span>门窗类型</span><select value={aiFields.window} onChange={(e) => updateAi("window", e.target.value)}><option>木门木窗</option><option>木框玻璃窗</option><option>铝框玻璃窗</option><option>塑钢窗</option></select></label>
              <label><span>风貌完整度</span><select value={aiFields.style} onChange={(e) => updateAi("style", e.target.value)}><option>高</option><option>中</option><option>低</option></select></label>
              <label><span>空间关系</span><select value={aiFields.space} onChange={(e) => updateAi("space", e.target.value)}><option>沿主街</option><option>巷道端头</option><option>节点广场</option><option>入口广场</option><option>临崖</option><option>屋后空地</option><option>建筑阳台</option><option>临河/滨水</option><option>临田/果园</option></select></label>
              <label><span>立面色彩识别</span><input value={aiFields.color} onChange={(e) => updateAi("color", e.target.value)} /></label>
            </div>
            <div className="recommender-checks">
              {["屋顶冲突", "墙面冲突", "门窗冲突", "外挂设备", "附属搭建", "街巷界面薄弱", "安全与耐久", "适老友好", "雨水收集"].map((issue) => (
                <label key={issue}><input type="checkbox" checked={issues.includes(issue)} onChange={() => toggleIssue(issue)} /> {issue}</label>
              ))}
            </div>
            <div className="recommender-actions">
              <button className="btn btn-primary" onClick={syncAiFields}>确认并写入数据库字段</button>
              <button className="btn btn-ghost" onClick={() => setAiFields((prev) => ({ ...prev, roof: form.roof, wall: form.wall, window: form.window, style: form.style, space: form.space }))}>读取当前手动条件</button>
              <button className="btn btn-ghost" onClick={exportCase}>导出本栋诊断数据</button>
            </div>
            <div className="recommender-status">{photo ? "照片已上传，请确认识别字段后写入数据库字段。" : "等待上传或确认识别字段。"}</div>
          </div>
        </div>

        <div className="building-rec-layout">
          <div className="building-form recommender-form">
            <label><span>建筑编号</span><input value={form.buildingId} onChange={(e) => updateForm("buildingId", e.target.value)} /></label>
            <label><span>层数/高度</span><select value={form.floors} onChange={(e) => updateForm("floors", e.target.value)}><option>1层</option><option>2层</option><option>局部3层</option><option>待核实</option></select></label>
            <label><span>所在分区</span><select value={form.zone} onChange={(e) => updateForm("zone", e.target.value)}>{BUILDING_ZONES.slice(0, 5).map((z) => <option key={z.title}>{z.title}</option>)}</select></label>
            <label><span>建筑类型</span><select value={form.type} onChange={(e) => updateForm("type", e.target.value)}>{BUILDING_TYPES.map(([code, title]) => <option key={code} value={code}>{code} {title}</option>)}</select></label>
            <label><span>使用状态</span><select value={form.use} onChange={(e) => updateForm("use", e.target.value)}><option>自住</option><option>闲置</option><option>仓储</option><option>经营</option><option>公共</option><option>废弃</option><option>损毁/空地</option></select></label>
            <label><span>目标功能</span><select value={form.target} onChange={(e) => updateForm("target", e.target.value)}><option>村民原居改善/自住更新</option><option>精品/主题民宿</option><option>咖啡/书吧/茶摊</option><option>非遗/技艺工坊</option><option>田园餐厅/荔枝美食工坊</option><option>游客服务点</option><option>亲子研学空间</option><option>后勤/仓储</option><option>观景平台/半公共阳台</option></select></label>
            <label><span>传统风貌完整度</span><select value={form.style} onChange={(e) => updateForm("style", e.target.value)}><option>高</option><option>中</option><option>低</option></select></label>
            <label><span>结构安全</span><select value={form.structure} onChange={(e) => updateForm("structure", e.target.value)}><option>良好</option><option>一般</option><option>较差</option><option>危房</option></select></label>
            <label><span>屋顶材料</span><select value={form.roof} onChange={(e) => updateForm("roof", e.target.value)}><option>小青瓦</option><option>树脂瓦</option><option>彩钢瓦</option><option>水泥瓦</option><option>其他</option></select></label>
            <label><span>墙体材料</span><select value={form.wall} onChange={(e) => updateForm("wall", e.target.value)}><option>石砌墙</option><option>夯土墙/竹编墙</option><option>青砖</option><option>红砖</option><option>水泥抹灰</option><option>贴砖</option></select></label>
            <label><span>门窗材料</span><select value={form.window} onChange={(e) => updateForm("window", e.target.value)}><option>木门木窗</option><option>木框玻璃窗</option><option>铝框玻璃窗</option><option>塑钢窗</option></select></label>
            <label><span>空间关系</span><select value={form.space} onChange={(e) => updateForm("space", e.target.value)}><option>沿主街</option><option>巷道端头</option><option>节点广场</option><option>入口广场</option><option>临崖</option><option>屋后空地</option><option>建筑阳台</option><option>临河/滨水</option><option>临田/果园</option></select></label>
          </div>

          <div className="building-result recommender-result">
            <div className="building-result-top">
              <span>{choice.key}</span>
              <div>
                <h4>{route.name}</h4>
                <p>{route.desc}</p>
              </div>
            </div>
            <div className="recommender-mini-grid">
              <div><b>{choice.key}</b><span>推荐路线</span></div>
              <div><b>{phase}</b><span>实施阶段</span></div>
              <div><b>{issues.length}</b><span>问题标签</span></div>
            </div>
            <div className="building-reasons">
              {routeReasons.map((r) => <p key={r}>{r}</p>)}
            </div>
            <div className="condition-ribbon">
              {[form.buildingId, form.zone, form.floors, form.use, form.target, form.roof, form.wall, form.window, ...issues].map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
            <div className="building-output">
              <b>输出内容</b>
              <span>改造路线、建筑诊断、立面策略、节能策略、功能适配、实施优先级和效果图生成提示。</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PhaseNodeList({ nodes, maxClicks }) {
  return (
    <div className="phase-list">
      {nodes.map((s, i) => {
        const meta = CATEGORY_META[s.cat];
        const rank = i + 1;
        return (
          <div key={s.id} className="phase-node">
            <div className="phase-rank">{rank}</div>
            <div className="phase-node-main">
              <div className="phase-node-head">
                <span className="phase-node-name">{s.name}</span>
                <span className="phase-node-cat" style={{ color: meta.color }}>{meta.label}</span>
              </div>
              <div className="phase-node-bar">
                <span style={{ width: Math.max(6, (s.clicks / maxClicks) * 100) + "%", background: meta.color }} />
              </div>
              <div className="phase-node-meta">
                <span>{s.clicks.toLocaleString()} 次模拟点击</span>
                <span>前期建设项目</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 热度地图：在底图上用大小/透明度表示热度
function HeatMap({ spots, clicks }) {
  const max = Math.max(...spots.map((s) => clicks[s.id] || 0), 1);
  return (
    <div className="heatmap">
      <img src={getResource("mapImg", "assets/map.jpg")} alt="" className="heatmap-img" />
      {spots.map((s) => {
        const v = (clicks[s.id] || 0) / max;
        const size = 14 + v * 40;
        return (
          <div key={s.id} className="heat-dot"
            style={{ left: s.x + "%", top: s.y + "%", width: size, height: size, opacity: 0.35 + v * 0.5 }}
            title={`${s.name} · ${clicks[s.id] || 0} 次`} />
        );
      })}
    </div>
  );
}

// ---- 景点内容管理 ----
function ContentAdmin({ spots, setSpots }) {
  function update(id, field, val) {
    setSpots((arr) => arr.map((s) => s.id === id ? { ...s, [field]: val } : s));
  }
  return (
    <div className="admin-content">
      <p className="admin-lead">编辑景点的名称、类别与图文介绍。修改即时生效于游客端地图。</p>
      <div className="content-grid">
        {spots.map((s) => (
          <div key={s.id} className="content-card">
            <div className="cc-img">
              {SPOT_IMAGES && SPOT_IMAGES[s.id]
                ? <img src={SPOT_IMAGES[s.id]} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 4, display: "block" }} alt={s.name} />
                : <Placeholder label="点击替换图片" h={120} />}
              <button className="cc-upload">上传 / 替换</button>
            </div>
            <div className="cc-fields">
              <label className="fld">
                <span>景点名称</span>
                <input value={s.name} onChange={(e) => update(s.id, "name", e.target.value)} />
              </label>
              <label className="fld">
                <span>所属类别</span>
                <select value={s.cat} onChange={(e) => update(s.id, "cat", e.target.value)}>
                  {Object.entries(CATEGORY_META).map(([k, m]) => (
                    <option key={k} value={k}>{m.label}</option>
                  ))}
                </select>
              </label>
              <label className="fld">
                <span>文字介绍</span>
                <textarea value={s.intro} rows={4} onChange={(e) => update(s.id, "intro", e.target.value)} />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- 路线关系配置 ----
function RouteAdmin({ spots, edges, setEdges }) {
  const byId = Object.fromEntries(spots.map((s) => [s.id, s]));
  function update(i, field, val) {
    setEdges((arr) => arr.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  }
  function remove(i) { setEdges((arr) => arr.filter((_, idx) => idx !== i)); }
  function add() {
    setEdges((arr) => [...arr, { a: spots[0].id, b: spots[1].id, dist: 0.5, time: 10, mode: "walk" }]);
  }
  return (
    <div className="admin-routes">
      <p className="admin-lead">配置景点间的可通行关系。路径规划引擎基于此邻接表计算最优路线。</p>
      <div className="route-table">
        <div className="rt-head">
          <span>起点</span><span>终点</span><span>距离 (km)</span><span>时间 (分)</span><span>出行方式</span><span></span>
        </div>
        {edges.map((e, i) => (
          <div key={i} className="rt-row">
            <select value={e.a} onChange={(ev) => update(i, "a", ev.target.value)}>
              {spots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={e.b} onChange={(ev) => update(i, "b", ev.target.value)}>
              {spots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="number" step="0.1" value={e.dist} onChange={(ev) => update(i, "dist", parseFloat(ev.target.value) || 0)} />
            <input type="number" value={e.time} onChange={(ev) => update(i, "time", parseInt(ev.target.value) || 0)} />
            <select value={e.mode} onChange={(ev) => update(i, "mode", ev.target.value)}>
              <option value="walk">步行</option>
              <option value="cart">电瓶车</option>
            </select>
            <button className="rt-rm" onClick={() => remove(i)}>×</button>
          </div>
        ))}
      </div>
      <button className="btn btn-ghost rt-add" onClick={add}>＋ 新增可通行关系</button>

      <div className="rt-preview">
        <div className="rt-prev-title">连通关系预览</div>
        <div className="map-stage map-stage-mini">
          <img src={getResource("mapImg", "assets/map.jpg")} alt="" className="map-img" />
          <svg className="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            {edges.map((e, i) => {
              const a = byId[e.a], b = byId[e.b];
              if (!a || !b) return null;
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                className={"route-line" + (e.mode === "cart" ? " route-cart" : "")}
                vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
          {spots.map((s) => (
            <div key={s.id} className="mini-pin" style={{ left: s.x + "%", top: s.y + "%", background: CATEGORY_META[s.cat].color }}>{s.no}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- 事件日志（从云端 events 表实时读取） ----
const EVENT_TYPE_META = {
  visit: { label: "visit",  color: "var(--river)", cn: "进入系统" },
  click: { label: "click",  color: "var(--green)", cn: "点击景点" },
  dwell: { label: "dwell",  color: "var(--gold)",  cn: "查看详情" },
  route: { label: "route",  color: "var(--gold-d)", cn: "生成路线" },
};

function EventLog({ spots }) {
  const byId = Object.fromEntries(spots.map((s) => [s.id, s]));
  const [rows, setRows] = useState(null); // null=加载中
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [evs, cnt] = await Promise.all([fetchRecentEvents(200), fetchEventCount()]);
      if (alive) { setRows(evs); setTotal(cnt); }
    })();
    return () => { alive = false; };
  }, []);

  function fmtTime(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("zh-CN") + " " +
      String(d.getHours()).padStart(2, "0") + ":" +
      String(d.getMinutes()).padStart(2, "0") + ":" +
      String(d.getSeconds()).padStart(2, "0");
  }
  function describe(e) {
    if (e.type === "route" && e.value && e.value.combo)
      return e.value.combo.map((id) => byId[id]?.name || id).join(" → ");
    if (e.node_id) return byId[e.node_id]?.name || e.node_id;
    return "—";
  }

  const list = rows || [];
  const now = new Date();
  const todayStr = now.toLocaleDateString("zh-CN");
  const thisMonth = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

  // 按日 / 月分组（所有事件）
  const dailyMap = {}, monthlyMap = {};
  list.forEach((e) => {
    const d = new Date(e.created_at);
    const dayKey = d.toLocaleDateString("zh-CN");
    const monKey = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    dailyMap[dayKey]   = (dailyMap[dayKey]   || 0) + 1;
    monthlyMap[monKey] = (monthlyMap[monKey] || 0) + 1;
  });
  const dailyRows = Object.entries(dailyMap).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 14)
    .map(([d, v]) => ({ label: d, v, disp: v + " 次" }));
  const monthlyRows = Object.entries(monthlyMap).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6)
    .map(([m, v]) => ({ label: m, v, disp: v + " 次" }));

  const todayCount = dailyMap[todayStr] || 0;
  const monthCount = monthlyMap[thisMonth] || 0;

  if (rows === null) {
    return <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>正在从云端读取事件…</p>;
  }

  return (
    <div>
      {/* KPI 三卡 */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 28 }}>
        <div className="kpi">
          <div className="kpi-val" style={{ color: "var(--gold)" }}>{todayCount}</div>
          <div className="kpi-label">单日事件量</div>
          <div className="kpi-sub">{todayStr}</div>
        </div>
        <div className="kpi">
          <div className="kpi-val" style={{ color: "var(--green)" }}>{monthCount}</div>
          <div className="kpi-label">单月事件量</div>
          <div className="kpi-sub">{thisMonth}</div>
        </div>
        <div className="kpi">
          <div className="kpi-val">{total.toLocaleString()}</div>
          <div className="kpi-label">累计事件总量</div>
          <div className="kpi-sub">云端 events 表</div>
        </div>
      </div>

      {/* 访问量趋势 */}
      <div className="dash-grid" style={{ marginBottom: 28 }}>
        <section className="card">
          <div className="card-head"><h3>近 14 日事件量</h3><span className="card-sub">按日统计</span></div>
          {dailyRows.length
            ? <BarChart rows={dailyRows} accent="var(--gold)" />
            : <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>暂无数据，请先在游客地图点击景点</p>}
        </section>
        <section className="card">
          <div className="card-head"><h3>月度事件趋势</h3><span className="card-sub">近 6 个月</span></div>
          {monthlyRows.length
            ? <BarChart rows={monthlyRows} accent="var(--green)" />
            : <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>暂无数据</p>}
        </section>
      </div>

      {/* 事件流 */}
      <section className="card">
        <div className="card-head">
          <h3>最近用户行为</h3>
          <span className="card-sub">最新 {list.length} 条 · 云端实时</span>
        </div>
        {list.length === 0 && (
          <p style={{ color: "var(--ink-faint)", fontSize: 13 }}>暂无记录，在游客地图点击任意景点即可生成日志</p>
        )}
        <div className="evlog-list">
          {list.slice(0, 60).map((e, i) => {
            const m = EVENT_TYPE_META[e.type] || { label: e.type, color: "var(--ink-soft)" };
            return (
              <div key={i} className="evlog-row">
                <span className="evlog-type" style={{ color: m.color }}>{m.label}</span>
                <span className="evlog-sep">|</span>
                <span className="evlog-ts">{fmtTime(e.created_at)}</span>
                <span className="evlog-sep">|</span>
                <span className="evlog-spot">{describe(e)}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ---- 管理后台主体 ----
function AdminApp({ spots, setSpots, edges, setEdges, analytics }) {
  const [tab, setTab] = useState("dash");
  const tabs = [
    { k: "dash",    label: "数据看板" },
    { k: "phase",   label: "前期建设" },
    { k: "content", label: "景点管理" },
    { k: "routes",  label: "路线配置" },
    { k: "events",  label: "事件日志" },
  ];
  return (
    <div className="admin">
      <nav className="admin-nav">
        {tabs.map((t) => (
          <button key={t.k} className={"anav-btn" + (tab === t.k ? " active" : "")}
            onClick={() => setTab(t.k)}>{t.label}</button>
        ))}
      </nav>
      <div className="admin-main">
        <h2 className="admin-title">{tabs.find((t) => t.k === tab).label}</h2>
        {tab === "dash"    && <Dashboard spots={spots} analytics={analytics} />}
        {tab === "phase"   && <PhaseConstruction spots={spots} analytics={analytics} />}
        {tab === "content" && <ContentAdmin spots={spots} setSpots={setSpots} />}
        {tab === "routes"  && <RouteAdmin spots={spots} edges={edges} setEdges={setEdges} />}
        {tab === "events"  && <EventLog spots={spots} />}
      </div>
    </div>
  );
}

export { AdminApp };
