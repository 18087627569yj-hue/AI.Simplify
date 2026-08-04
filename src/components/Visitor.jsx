// ============================================================
// 游客端 — 地图交互 · 景点弹窗 · 游览计划 · 路线结果
// + 点位编辑模式（拖动定位）
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import { CATEGORY_META, SPOT_IMAGES, MODE_LABEL, planRoute, logClick, logDwell, logRoute } from "../data.js";
import { getResource } from "../resources.js";
import { ShopPage, RouteProducts } from "./Shop.jsx";
import { PixelRole, ROLES } from "./Quiz.jsx";

// ---- 图片占位 ----
function Placeholder({ label, h = 150 }) {
  return (
    <div className="ph" style={{ height: h }}>
      <span className="ph-tag">{label}</span>
    </div>
  );
}

// ---- 地图标记（普通 + 可拖动） ----
function MarkerPin({ spot, idx, inPlan, active, onClick, editMode, onDragStart }) {
  const meta = CATEGORY_META[spot.cat];
  const isDraggable = editMode;

  function handleMouseDown(e) {
    if (!isDraggable) return;
    e.preventDefault();
    e.stopPropagation();
    onDragStart(e, spot);
  }

  return (
    <div
      className={
        "pin" +
        (active && !editMode ? " pin-active" : "") +
        (inPlan && !editMode ? " pin-inplan" : "") +
        (editMode ? " pin-edit" : "")
      }
      style={{ left: spot.x + "%", top: spot.y + "%", "--pc": meta.color }}
      onMouseDown={handleMouseDown}
      onClick={(e) => { if (!isDraggable) { e.stopPropagation(); onClick(spot); } }}
      title={editMode ? `拖动调整位置 · ${spot.name}` : spot.name}
    >
      <span className="pin-dot">{idx === "hide" ? "" : (idx != null ? idx : spot.no)}</span>
      {inPlan && !editMode && <span className="pin-check">✓</span>}
      {editMode && (
        <span className="pin-coord">{spot.x.toFixed(1)},{spot.y.toFixed(1)}</span>
      )}
    </div>
  );
}

// ---- 地图舞台 ----
function MapStage({ spots, plan, activeId, route, onSpotClick, onReopenRoute,
                    editMode, onUpdateSpot }) {
  const stageRef = useRef(null);
  const dragRef = useRef(null); // { id }
  const movedRef = useRef(false);

  const orderIdx = {};
  if (route) route.order.forEach((s, i) => (orderIdx[s.id] = i + 1));

  function startDrag(e, spot) {
    dragRef.current = { id: spot.id };
    movedRef.current = false;

    function onMove(me) {
      if (!stageRef.current || !dragRef.current) return;
      movedRef.current = true;
      const rect = stageRef.current.getBoundingClientRect();
      const x = Math.min(99, Math.max(1, ((me.clientX - rect.left) / rect.width) * 100));
      const y = Math.min(99, Math.max(1, ((me.clientY - rect.top) / rect.height) * 100));
      onUpdateSpot(dragRef.current.id, {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
      });
    }
    function onUp() {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      ref={stageRef}
      className={"map-stage" + (editMode ? " map-stage-edit" : "")}
      onClick={() => { if (!editMode) onSpotClick(null); }}
    >
      <img src={getResource("mapImg", "assets/map.jpg")} alt="走马岭慢行规划图" className="map-img" draggable="false" />

      {spots.map((s) => (
        <MarkerPin key={s.id} spot={s}
          idx={null}
          inPlan={plan.includes(s.id)}
          active={activeId === s.id}
          onClick={onSpotClick}
          editMode={editMode}
          onDragStart={startDrag} />
      ))}

      {route && !editMode && onReopenRoute && (
        <button className="route-reopen"
          onClick={(e) => { e.stopPropagation(); onReopenRoute(); }}>
          查看路线方案
        </button>
      )}
    </div>
  );
}

// ---- 编辑模式坐标面板 ----
function EditPanel({ spots, onCopy, onDone }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const lines = spots.map(s =>
      `  { id:"${s.id}", name:"${s.name}", x:${s.x}, y:${s.y} }`
    ).join(",\n");
    const text = `[\n${lines}\n]`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="edit-panel">
      <div className="edit-panel-head">
        <span className="edit-title">📍 拖动标记调整位置</span>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-ghost edit-copy" onClick={handleCopy}>
            {copied ? "✓ 已复制" : "复制坐标"}
          </button>
          <button className="btn btn-primary edit-done" onClick={onDone}>完成</button>
        </div>
      </div>
      <div className="edit-coords">
        {spots.map(s => (
          <div key={s.id} className="edit-coord-row">
            <span className="edit-coord-name" style={{ color: CATEGORY_META[s.cat].color }}>
              {s.name}
            </span>
            <span className="edit-coord-val">x: {s.x.toFixed(1)}%</span>
            <span className="edit-coord-val">y: {s.y.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const BLUEPRINT_SECTIONS = [
  {
    no: "01",
    title: "核心定位",
    subtitle: "长寿果岭 · 走马古驿",
    text: "走马岭是长寿区唯一一处「千年古道穿过万亩果岭」的地方。以长寿文化作为区域 IP，以果岭产业作为发展引擎，以古驿体验作为空间灵魂。",
    image: "assets/blueprint/core-positioning.png",
    points: ["长寿：对接长寿湖与长寿文化", "果岭：荔枝品牌化与四季花果", "古驿：荔枝古道与驿站文化"],
  },
  {
    no: "02",
    title: "功能分区规划",
    subtitle: "一核引领 · 两带串联 · 多区联动",
    text: "以资源禀赋为基础，以市场需求为导向，构建文化引领、生态赋能、生活为本的乡村发展格局。",
    image: "assets/blueprint/image1.png",
    points: ["自然观景研学区", "种植生活体验区", "走马历史驿道区", "滨水康养休闲区", "生态林场疗愈区"],
  },
  {
    no: "03",
    title: "道路交通规划",
    subtitle: "优化内部交通格局",
    text: "基于现状村道打通滨水道路和山谷村道，结合东西两端布局旅游停车场，形成分散式生态停车系统。",
    image: "assets/blueprint/image2.png",
    points: ["打通北侧山谷村道", "完善龙溪河滨水道路", "东西两端设置旅游停车场"],
  },
  {
    no: "04",
    title: "慢行系统规划",
    subtitle: "串联自然、人文与体验节点",
    text: "通过慢行系统串联历史人文、自然观景与体验活动节点，让游客在连续步行体验中理解走马岭空间结构。",
    image: "assets/blueprint/image3.png",
    points: ["历史人文节点：走马古驿站、黄桷树村落客厅", "自然观景节点：尹家山、观景湖、滨水公园", "体验活动节点：田园研学、采摘谷、水果工坊、竹海课堂"],
  },
  {
    no: "05",
    title: "游客-村民慢行流线",
    subtitle: "生活与游览互不打扰",
    text: "保障村民日常出行，同时提升游客服务品质。通过人车分流和生活静线控制，让旅游动线与村民生活形成有序关系。",
    image: "assets/blueprint/image5.png",
    points: ["保障村民日常出行", "构建沉浸式游览主环线", "完善导览、休憩与卫生设施"],
  },
  {
    no: "06",
    title: "总平面图",
    subtitle: "人本 · 生态 · 融合",
    text: "以分离且有序的流线体系保留村民生活轨迹，为游客开辟沉浸式游览动线，形成文化赋能旅游、旅游反哺乡村的闭环。",
    image: "assets/blueprint/image6.png",
    points: ["人本设计：生活与体验共生", "生态设计：自然与慢行对话", "融合设计：社区与旅游共荣"],
  },
];

function BlueprintModal({ onClose }) {
  return (
    <div className="popup-overlay blueprint-overlay" onClick={onClose}>
      <div className="blueprint-modal" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <div className="blueprint-head">
          <span className="kicker">ZOUMALING BLUEPRINT</span>
          <h2>走马蓝图</h2>
          <p>从规划定位到慢行系统，理解五大功能分区如何支撑游客路线与后续建设决策。</p>
        </div>
        <div className="blueprint-list">
          {BLUEPRINT_SECTIONS.map((item) => (
            <section key={item.no} className="blueprint-section">
              <div className="blueprint-copy">
                <span className="blueprint-no">{item.no}</span>
                <h3>{item.title}</h3>
                <strong>{item.subtitle}</strong>
                <p>{item.text}</p>
                <div className="blueprint-points">
                  {item.points.map((p) => <span key={p}>{p}</span>)}
                </div>
              </div>
              {item.image ? (
                <img className="blueprint-img" src={item.image} alt={item.title} />
              ) : (
                <div className="blueprint-positioning">
                  <div><b>长寿</b><span>区域大 IP</span></div>
                  <div><b>果岭</b><span>产业引擎</span></div>
                  <div><b>古驿</b><span>体验灵魂</span></div>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

const CHAPTER_STORIES = [
  {
    title: "第一章《驿铃初响》",
    text: "龙溪河晨雾笼罩走马古驿站，长寿果会本该热闹，今日却死寂无人。十八岁运货郎小马到驿站，驿官失踪，货册一页被撕，残字提醒勿走南道。守站老人称昨夜有人带走贵重之物。门外泥地单马车载重车辙通向竹海，檐角竹叶刻有神秘记号，小马收好竹叶，察觉岭中藏有秘事。",
  },
  {
    title: "第二章《百果藏契》",
    text: "果坊人声喧闹，与驿站死寂反差强烈，货车踪迹在此消失。老掌柜刻意回避昨夜送货之事，目光紧盯带撬动痕迹的库房。小马潜入，发现一众合规果箱里，有一只无标记改造木箱，侧面刻着竹叶记号。两名工人密谈往后改走竹林运输，小马察觉鲜果只是转运秘物的掩护。",
  },
  {
    title: "第三章《青篁疑踪》",
    text: "小马追车辙入竹海，痕迹尽数消散，山坡空货车轴断裂，车厢仅存适配狭长木匣的凹槽，无鲜果痕迹。车轴刻有竹叶纹，卡着驿站独有石片，车辆是刻意布置的诱饵。戴斗笠青衣人现身拾取竹叶离去，车厢飘落刻字竹叶：寻路者，莫信眼前路。小马明白全程皆为刻意误导。",
  },
  {
    title: "第四章《古道遗碑》",
    text: "研学营地老者讲古驿箴言，小马对照古碑与地图，发现古道里程被人为篡改。他拨开杂草找到布满旧马蹄印的正统青石古道，游客走的都是改建假路。石碑后木牌写着“路改，则人迷”，和竹林密语呼应，小马理清所有迷雾根源是人为篡改古道迷惑众人。",
  },
  {
    title: "第五章《龙溪泊月》",
    text: "傍晚龙溪渡口只剩闲船，老船夫告知贵重货物历来弃陆走水路，流水不留痕迹。废弃渡船底藏空暗格，木牌刻“路止于此”。小马恍然大悟，陆路车辙全是诱饵，真正转运靠河道。船舷再次刻有竹叶记号，证实整条隐秘运输线由同一人策划。",
  },
  {
    title: "第六章《万寿归契》",
    text: "寿果谷寂静无人，小马集齐线索登顶梯田，黄桷树下摆着那只神秘木箱。开箱后无珍宝，只剩空木匣与写着“路契已失”的旧纸条，箱底小字“路通，则百业兴”。青衣人现身观望，转瞬消失。小马仅寻得路契残卷，知晓完整真相还需探寻另外三人的故事。",
  },
];

const STORY_ENDING = {
  truth: "四人最终在梯田采摘谷汇合，四句箴言组合成《长寿契》真正内容：“路、水、人、果，共养一岭。”所谓长寿并非仙药，而是人与自然、交通、产业共同维系的乡土智慧。玩家回到走马古驿站完成契约修复，解锁隐藏剧情与奖励。",
  summary: "千年前，走马岭因古驿、水运与果岭而兴，四位守护者分别掌管道路、医药、驿政与山林，共同守护象征乡土智慧的《长寿契》。然而一次神秘事件让四卷契文同时失散，长寿果会也随之消失。多年后，游客以四位角色的身份重新踏上古驿，在走马古驿站、水果加工工坊、竹海疗愈课堂、田园研学营地、滨水民宿和梯田采摘谷六大节点中，从不同视角寻找线索。每个人看到的真相都不完整，只有多人交流与拼合信息，才能逐渐揭开隐藏在古道、果园、竹林和关渡之间的秘密。最终，玩家发现真正遗失的并非宝藏，而是一套关于道路、水运、产业、生态与村落共生的古老智慧。《长寿契》重新现世，也象征走马岭历史文化的再次延续，让游客在解谜游览中理解这片土地真正的价值。",
};

function chapterStory(chapterNo) {
  const chapter = CHAPTER_STORIES[chapterNo - 1];
  return `${chapter.title}：${chapter.text}`;
}

const STORY_NODES = [
  {
    no: 1,
    chapterNo: 6,
    id: "huanggeshu",
    name: "梯田景观区",
    x: 36.4,
    y: 21.4,
    type: "存量改造",
    role: "小马",
    build: "依托梯田与果岭景观设置观景停留、采摘展示、故事终章打卡和轻量休憩功能，形成游线收束节点。",
    renovationImages: [
      "assets/node-renovations/terrace/01.png",
      "assets/node-renovations/terrace/02.png",
    ],
    story: chapterStory(6),
  },
  {
    no: 2,
    chapterNo: 1,
    id: "guyizhan",
    name: "走马古驿站",
    x: 50.0,
    y: 43.8,
    type: "老屋驿站型",
    build: "通过老屋改造形成古道文化记忆空间，承担展陈、休憩、茶饮、文创和任务打卡功能。",
    renovationImages: [
      "assets/node-renovations/guyizhan/01.png",
      "assets/node-renovations/guyizhan/02.png",
      "assets/node-renovations/guyizhan/03.jpg",
      "assets/node-renovations/guyizhan/04.jpg",
      "assets/node-renovations/guyizhan/05.jpg",
      "assets/node-renovations/guyizhan/06.jpg",
      "assets/node-renovations/guyizhan/07.png",
      "assets/node-renovations/guyizhan/08.png",
      "assets/node-renovations/guyizhan/09.png",
    ],
    role: "小马",
    story: chapterStory(1),
  },
  {
    no: 3,
    chapterNo: 2,
    id: "shuiguo",
    name: "水果加工工坊",
    x: 56.4,
    y: 64.7,
    type: "果园工坊型",
    role: "小马",
    build: "围绕荔枝、桂圆、柑橘等在地果品设置加工体验、展销包装、亲子研学和伴手礼购买功能。",
    renovationImages: [
      "assets/node-renovations/shuiguo/01.jpg",
      "assets/node-renovations/shuiguo/02.jpg",
    ],
    story: chapterStory(2),
  },
  {
    no: 4,
    chapterNo: 3,
    id: "zhuhai",
    name: "竹海疗愈课堂",
    x: 73.2,
    y: 77.5,
    type: "竹林课堂型",
    role: "小马",
    build: "依托竹海设置自然课堂、林下平台、竹编手作和森林疗愈空间，以轻设施介入减少生态扰动。",
    renovationImages: [
      "assets/node-renovations/zhuhai/01.jpg",
      "assets/node-renovations/zhuhai/02.jpg",
    ],
    story: chapterStory(3),
  },
  {
    no: 5,
    chapterNo: 4,
    id: "yanxue",
    name: "田园研学营地",
    x: 58.5,
    y: 25.2,
    type: "轻量活动场地",
    role: "小马",
    build: "设置田间课堂、研学棚和轻量活动场地，承接农事体验、节气课堂、亲子活动与团队研学。",
    renovationImages: [
      "assets/node-renovations/yanxue/01.jpg",
      "assets/node-renovations/yanxue/02.jpg",
    ],
    story: chapterStory(4),
  },
  {
    no: 6,
    chapterNo: 5,
    id: "minsu",
    name: "滨水民宿",
    x: 46.4,
    y: 82.4,
    type: "存量更新",
    role: "小马",
    build: "利用滨水传统民居进行住宿更新，增加庭院休憩、滨水观景、过夜消费和游线接驳功能。",
    renovationImages: [
      "assets/node-renovations/minsu/01.png",
      "assets/node-renovations/minsu/02.png",
    ],
    story: chapterStory(5),
  },
];

function StoryNodeMap({ nodes, onOpenNode, editMode, onMoveNode }) {
  const wrapRef = useRef(null);
  const [selectedNo, setSelectedNo] = useState(null);
  function placeSelected(e) {
    if (!editMode || !wrapRef.current || selectedNo == null) return;
    if (e.target.closest(".story-node")) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    onMoveNode(selectedNo, { x: +x.toFixed(1), y: +y.toFixed(1) });
    setSelectedNo(null);
  }
  return (
    <div className={"story-map-wrap" + (editMode ? " story-editing" : "")} ref={wrapRef} onClick={placeSelected}>
      <img src="assets/story-node-map.png" className="story-map-img" alt="走马岭故事节点图" />
      {nodes.map((node) => (
        <button
          key={node.id}
          className={"story-node" + (selectedNo === node.no ? " selected" : "")}
          style={{ left: node.x + "%", top: node.y + "%" }}
          onClick={(e) => {
            e.stopPropagation();
            if (editMode) setSelectedNo((current) => current === node.no ? null : node.no);
            else onOpenNode(node);
          }}
          title={node.name}
        >
          <span>{node.no}</span>
        </button>
      ))}
    </div>
  );
}

function StoryNodePopup({ node, onClose }) {
  const [preview, setPreview] = useState(null);
  const images = node?.renovationImages || [];
  const showPreviewAt = (index) => {
    if (!images.length) return;
    const nextIndex = (index + images.length) % images.length;
    setPreview({ src: images[nextIndex], index: nextIndex });
  };
  useEffect(() => {
    if (!preview) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") showPreviewAt(preview.index - 1);
      if (e.key === "ArrowRight") showPreviewAt(preview.index + 1);
      if (e.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview, images.length]);
  if (!node) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="story-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <div className="story-popup-head">
          <span className="story-popup-no">{String(node.no).padStart(2, "0")}</span>
          <div>
            <span className="kicker">STORY NODE · {node.role}</span>
            <h2>{node.name}</h2>
          </div>
        </div>
        <div className="story-popup-grid">
          <section className="story-renovation-panel">
            <h3>建筑改造</h3>
            <p>{node.build}</p>
            <span className="story-type">{node.type}</span>
            {node.renovationImages?.length > 0 && (
              <div className="renovation-scroll" aria-label={`${node.name}改造前后图片`}>
                {node.renovationImages.map((src, index) => (
                  <figure
                    key={src}
                    className="renovation-figure"
                    role="button"
                    tabIndex={0}
                    onClick={() => showPreviewAt(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") showPreviewAt(index);
                    }}
                  >
                    <img src={src} alt={`${node.name}改造图 ${index + 1}`} />
                    <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
          <section>
            <h3>节点故事</h3>
            <p>{node.story}</p>
          </section>
        </div>
        {preview && (
          <div className="renovation-preview-overlay" onClick={() => setPreview(null)}>
            <div className="renovation-preview" onClick={(e) => e.stopPropagation()}>
              <button className="popup-close" onClick={() => setPreview(null)}>×</button>
              {images.length > 1 && (
                <button className="renovation-preview-nav prev" onClick={() => showPreviewAt(preview.index - 1)} aria-label="上一张">
                  ‹
                </button>
              )}
              <img src={preview.src} alt={`${node.name}改造图 ${preview.index + 1}`} />
              {images.length > 1 && (
                <button className="renovation-preview-nav next" onClick={() => showPreviewAt(preview.index + 1)} aria-label="下一张">
                  ›
                </button>
              )}
              <strong>{node.name} · 改造图 {String(preview.index + 1).padStart(2, "0")}</strong>
              {images.length > 1 && <span className="renovation-preview-count">{preview.index + 1} / {images.length}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- 景点详情弹窗 ----
function SpotPopup({ spot, inPlan, onClose, onToggle }) {
  if (!spot) return null;
  const meta = CATEGORY_META[spot.cat];
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        {SPOT_IMAGES && SPOT_IMAGES[spot.id]
          ? <img src={SPOT_IMAGES[spot.id]} className="popup-photo" alt={spot.name}
              style={{ objectPosition: "center center" }} />
          : <Placeholder label={`景点照片 · ${spot.name}`} h={180} />}
        <div className="popup-body">
          <div className="popup-cat" style={{ "--pc": meta.color }}>
            <span className="dot" /> {meta.label}
          </div>
          <h2 className="popup-name">{spot.name}</h2>
          <p className="popup-intro">{spot.intro}</p>
          <button
            className={"btn " + (inPlan ? "btn-ghost" : "btn-primary")}
            onClick={() => onToggle(spot)}>
            {inPlan ? "✓ 已加入计划 · 点击移出" : "＋ 加入游览计划"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- 游览计划栏 ----
function PlanPanel({ spots, plan, onRemove, onClear, onGenerate, roleGuide, hideRouteAction = false }) {
  const byId = Object.fromEntries(spots.map((s) => [s.id, s]));
  return (
    <aside className="plan-panel">
      <div className="plan-head">
        <h3>我的游览计划</h3>
        <span className="plan-count">{plan.length}</span>
      </div>
      {roleGuide}

      {plan.length === 0 ? (
        <div className="plan-empty">
          <p>点击地图上的景点<br />将感兴趣的地点加入计划</p>
        </div>
      ) : (
        <ol className="plan-list">
          {plan.map((id) => {
            const s = byId[id];
            const meta = CATEGORY_META[s.cat];
            return (
              <li key={id} className="plan-item">
                <span className="plan-dot" style={{ background: meta.color }} />
                <span className="plan-name">{s.name}</span>
                <span className="plan-tag">{meta.label}</span>
                <button className="plan-rm" onClick={() => onRemove(id)} title="移出">×</button>
              </li>
            );
          })}
        </ol>
      )}

      {!hideRouteAction && (
        <div className="plan-actions">
          {plan.length > 0 && (
            <button className="link-btn" onClick={onClear}>清空</button>
          )}
          <button className="btn btn-primary plan-gen" disabled={plan.length < 2}
            onClick={onGenerate}>
            生成游览路线
          </button>
          {plan.length === 1 && <p className="plan-hint">至少选择 2 个景点</p>}
        </div>
      )}
    </aside>
  );
}

// ---- 路线预览地图（海报示意图风格） ----
const ROUTE_MAP_POS = {};
const ROAD_PATHS = {};
function getRoadPath() { return null; }

const SPOT_NAME_EN = {
  yinjiashan: "Yinjia Mountain", huanggeshu: "Banyan Village", yanxue: "Farm Camp",
  caizhai: "Terrace Orchard", guanjinghu: "Scenic Lake", entry: "Main Entrance",
  kangyang: "Wellness Gate", guyizhan: "Ancient Post", matou: "River Dock",
  tianyuancanting: "Farm Bistro", qinggang: "Oak Forest", shuiguo: "Fruit Workshop",
  zhuhai: "Bamboo Retreat", minsu: "Lakeside Inn", guanjingtai: "Lookout Point",
  binshuigongyuan: "Waterfront Park", binshuicanting: "Waterfront Bistro",
};

function RoutePreviewMap({ route, allSpots }) {
  if (!route || !route.order || route.order.length < 2) return null;
  const spots = route.order;
  const count = spots.length;

  // Z 字形排列：偶数在左，奇数在右，从下到上
  const positions = spots.map((s, i) => {
    const row = count - 1 - i;
    const isLeft = i % 2 === 0;
    const yPad = 6;
    const ySpan = 88 / Math.max(count - 1, 1);
    return {
      ...s, idx: i,
      left: isLeft ? '6%' : '54%',
      top: `${yPad + row * ySpan}%`,
      align: isLeft ? 'left' : 'right',
      lineX: isLeft ? 30 : 70,
      lineY: yPad + row * ySpan + 3,
    };
  });

  return (
    <div className="rpm-poster">
      <img src="assets/route-bg.jpg" className="rpm-poster-bg" alt="" />
      <div className="rpm-poster-ov" />

      <div className="rpm-timeline">
        <div className="rpm-tl-line" />
        {spots.map((s, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div key={s.id} className={"rpm-tl-item rpm-tl-" + (isLeft ? "left" : "right")}>
              <div className="rpm-tl-card">
                <div className="rpm-card-inner">
                  <div className="rpm-card-img-wrap">
                    {SPOT_IMAGES[s.id]
                      ? <img src={SPOT_IMAGES[s.id]} className="rpm-card-img" alt={s.name} />
                      : <div className="rpm-card-img rpm-card-placeholder">{s.name[0]}</div>}
                  </div>
                </div>
                <div className="rpm-card-label">
                  <span className="rpm-card-cn">{s.name}</span>
                  <span className="rpm-card-en">{SPOT_NAME_EN[s.id] || ''}</span>
                </div>
              </div>
              <div className="rpm-tl-connector" />
              <div className="rpm-tl-dot">{i + 1}</div>
            </div>
          );
        })}
      </div>

      <div className="rpm-poster-legend">
        <div className="rpm-poster-title">ROUTE MAP</div>
        {spots.map((s, i) => (
          <span key={s.id} className="rpm-poster-item">({i + 1}) {s.name}</span>
        ))}
      </div>
    </div>
  );
}

// ---- 路线结果弹窗 ----
function RouteResult({ route, spots, onClose }) {
  if (!route) return null;
  const hrs = Math.floor(route.totalTime / 60);
  const mins = route.totalTime % 60;
  const durLabel = (hrs ? hrs + " 小时 " : "") + (mins ? mins + " 分钟" : "");
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="route-modal" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <div className="route-head">
          <span className="kicker">游览规划方案</span>
          <h2>为你推荐的走马岭路线</h2>
        </div>
        <RoutePreviewMap route={route} allSpots={spots} />
        <div className="route-order">
          {route.order.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="ro-node">
                <span className="ro-num">{i + 1}</span>
                <span className="ro-name">{s.name}</span>
              </div>
              {i < route.order.length - 1 && (
                <span className={"ro-arrow" + (route.legs[i] && route.legs[i].mode === "cart" ? " ro-cart" : "")}>
                  {route.legs[i] && route.legs[i].mode === "cart" ? "🚐" : "→"}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="route-stats">
          <div className="rstat"><span className="rstat-v">{route.totalDist.toFixed(1)}</span><span className="rstat-l">全程公里</span></div>
          <div className="rstat"><span className="rstat-v">{durLabel}</span><span className="rstat-l">预计总时长</span></div>
          <div className="rstat"><span className="rstat-v">{route.order.length}</span><span className="rstat-l">途经景点</span></div>
        </div>
        <div className="route-legs">
          <div className="legs-title">分段明细</div>
          {route.legs.map((leg, i) => (
            <div key={i} className="leg-row">
              <span className="leg-path">{leg.from.name} <i>→</i> {leg.to.name}</span>
              {leg.through.length > 0 && <span className="leg-through">经 {leg.through.join("、")}</span>}
              <span className="leg-meta">
                <span className={"leg-mode mode-" + leg.mode}>{MODE_LABEL[leg.mode]}</span>
                {leg.dist.toFixed(1)} km · 约 {leg.time} 分钟
              </span>
            </div>
          ))}
        </div>
        <div className="route-notes">
          <div className="rnote"><span className="rnote-k">出行建议</span><span>{route.advice}</span></div>
          <div className="rnote"><span className="rnote-k">线路简介</span><span>{route.summary}</span></div>
        </div>
        <RouteProducts route={route} />
      </div>
    </div>
  );
}

// ---- 推荐路线数据 ----
const PRESET_ROUTES = [
  {
    id: "zone-scenic-study",
    name: "自然观景研学区路线",
    theme: "自然观景研学区",
    tagline: "从观景湖进入北部山岭，串联田园研学、黄桷树村落与尹家山自然教育节点。",
    spotIds: ["entry", "guanjinghu", "yanxue", "huanggeshu", "yinjiashan"],
    cover: getResource("photo_guanjing", "assets/photos/观景台.jpg"),
    dist: "约 4.2 公里", time: "约 90 分钟",
    tags: ["自然观景", "研学", "山岭"],
  },
  {
    id: "zone-planting-life",
    name: "种植生活体验区路线",
    theme: "种植生活体验区",
    tagline: "围绕梯田、果园与田园餐饮组织游览，突出采摘、农事、餐饮和生活体验。",
    spotIds: ["entry", "kangyang", "guanjinghu", "caizhai", "yanxue", "tianyuancanting"],
    cover: getResource("photo_caizhai", "assets/photos/采摘谷.jpg"),
    dist: "约 3.6 公里", time: "约 78 分钟",
    tags: ["采摘", "农事", "田园生活"],
  },
  {
    id: "zone-ancient-post",
    name: "走马历史驿道区路线",
    theme: "走马历史驿道区",
    tagline: "以走马古驿站为核心，连接关渡口、水陆转运记忆与古道共享驿站。",
    spotIds: ["entry", "kangyang", "guyizhan", "matou", "shuiguo"],
    cover: getResource("photo_gudao", "assets/photos/古道.jpg"),
    dist: "约 3.2 公里", time: "约 70 分钟",
    tags: ["古道", "驿站", "关渡口"],
  },
  {
    id: "zone-water-wellness",
    name: "滨水康养休闲区路线",
    theme: "滨水康养休闲区",
    tagline: "沿龙溪河滨水空间慢行，串联滨水民宿、公园和餐厅，形成休闲度假收尾段。",
    spotIds: ["entry", "guyizhan", "shuiguo", "minsu", "binshuigongyuan", "binshuicanting"],
    cover: getResource("photo_binshui", "assets/photos/滨水公园.jpg"),
    dist: "约 4.6 公里", time: "约 96 分钟",
    tags: ["滨水", "康养", "度假"],
  },
  {
    id: "zone-forest-healing",
    name: "生态林场疗愈区路线",
    theme: "生态林场疗愈区",
    tagline: "从康养门户进入青岗林场与竹海疗愈课堂，连接观景台形成森林疗愈体验。",
    spotIds: ["entry", "kangyang", "qinggang", "zhuhai", "guanjingtai", "binshuicanting"],
    cover: getResource("photo_linxia", "assets/photos/林下乐园.jpg"),
    dist: "约 3.8 公里", time: "约 82 分钟",
    tags: ["林场", "竹海", "疗愈"],
  },
];

// ---- 推荐路线页面 ----
function RecommendedRoutes({ spots, onApply }) {
  const byId = Object.fromEntries(spots.map((s) => [s.id, s]));
  return (
    <div className="rec-routes">
      <div className="rec-header">
        <h2 className="rec-title">五大规划分区路线</h2>
        <p className="rec-sub">每条路线对应一个功能分区，帮助理解走马岭的空间组织与游览体验</p>
      </div>
      <div className="rec-grid">
        {PRESET_ROUTES.map((r) => (
          <div key={r.id} className="rec-card">
            <div className="rec-img-wrap">
              <img src={r.cover} className="rec-img" alt={r.name} />
              <span className="rec-theme">{r.theme}</span>
            </div>
            <div className="rec-body">
              <h3 className="rec-name">{r.name}</h3>
              <p className="rec-tagline">{r.tagline}</p>
              <div className="rec-spots">
                {r.spotIds.map((id, i) => (
                  <React.Fragment key={id}>
                    <span className="rec-spot" style={{ color: byId[id] ? CATEGORY_META[byId[id].cat].color : "inherit" }}>
                      {byId[id] ? byId[id].name : id}
                    </span>
                    {i < r.spotIds.length - 1 && <span className="rec-arr">›</span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="rec-meta">
                <span>&#128205; {r.dist}</span>
                <span>&#9200; {r.time}</span>
                {r.tags.map((t) => <span key={t} className="rec-tag">{t}</span>)}
              </div>
              <button className="btn btn-primary rec-cta" onClick={() => onApply(r.spotIds)}>
                生成分区路线 →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- 身份测试后的角色推荐卡 ----
function RoleGuide({ roleKey, outfit, spots, onApply, buttonLabel = "生成身份路线" }) {
  const role = ROLES[roleKey];
  if (!role) return null;

  const meta = CATEGORY_META[role.cat];
  const recs = spots.filter((s) => s.cat === role.cat).slice(0, 3);
  const routeIds = ["entry", ...recs.map((s) => s.id)];
  if (!routeIds.includes("binshuicanting")) routeIds.push("binshuicanting");

  return (
    <section className="role-guide">
      <div className="role-guide-avatar">
        <PixelRole roleKey={roleKey} outfit={outfit} size={58} />
      </div>
      <div className="role-guide-main">
        <div className="role-guide-kicker">身份导览</div>
        <h3>{role.name} · {role.title}</h3>
        <p>{role.tag}，优先推荐{meta ? meta.label : "兴趣"}节点。</p>
        <div className="role-guide-spots">
          {recs.map((s) => (
            <span key={s.id} style={{ "--pc": meta?.color || "var(--gold)" }}>{s.name}</span>
          ))}
        </div>
      </div>
      <button className="btn btn-primary role-guide-btn" onClick={() => onApply(routeIds)}>
        {buttonLabel}
      </button>
    </section>
  );
}

const SOUVENIRS = [
  { name: "周边套装", src: "assets/souvenirs/souvenir-set.png" },
  { name: "荔枝果干", src: "assets/souvenirs/souvenir-lychee.png" },
  { name: "柑橘果干", src: "assets/souvenirs/souvenir-citrus.png" },
  { name: "龙眼果干", src: "assets/souvenirs/souvenir-longan.png" },
  { name: "柚子果干", src: "assets/souvenirs/souvenir-pomelo.png" },
  { name: "走马纪念品", src: "assets/souvenirs/souvenir-01.webp" },
  { name: "走马纪念品", src: "assets/souvenirs/souvenir-02.png" },
  { name: "走马纪念品", src: "assets/souvenirs/souvenir-04.webp" },
  { name: "走马纪念品", src: "assets/souvenirs/souvenir-05.webp" },
  { name: "走马纪念品", src: "assets/souvenirs/souvenir-06.webp" },
];

function SouvenirPopup({ onClose }) {
  const [preview, setPreview] = useState(null);
  const showPreviewAt = (index) => {
    const nextIndex = (index + SOUVENIRS.length) % SOUVENIRS.length;
    setPreview({ ...SOUVENIRS[nextIndex], index: nextIndex });
  };
  useEffect(() => {
    if (!preview) return undefined;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") showPreviewAt(preview.index - 1);
      if (e.key === "ArrowRight") showPreviewAt(preview.index + 1);
      if (e.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);
  return (
    <div className="souvenir-overlay" onClick={onClose}>
      <div className="souvenir-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <div className="souvenir-head">
          <span>走马岭纪念品</span>
          <h2>领取你的探索纪念</h2>
          <p>完成《长寿契》故事探索后，可解锁走马岭主题周边与果干伴手礼。</p>
        </div>
        <div className="souvenir-grid">
          {SOUVENIRS.map((item, index) => (
            <figure
              key={`${item.src}-${index}`}
              className="souvenir-item"
              role="button"
              tabIndex={0}
              onClick={() => showPreviewAt(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") showPreviewAt(index);
              }}
            >
              <img src={item.src} alt={item.name} />
              <figcaption>{item.name}</figcaption>
            </figure>
          ))}
        </div>
        {preview && (
          <div className="souvenir-preview-overlay" onClick={() => setPreview(null)}>
            <div className="souvenir-preview" onClick={(e) => e.stopPropagation()}>
              <button className="popup-close" onClick={() => setPreview(null)}>×</button>
              {SOUVENIRS.length > 1 && (
                <button className="souvenir-preview-nav prev" onClick={() => showPreviewAt(preview.index - 1)} aria-label="上一张">
                  ‹
                </button>
              )}
              <img src={preview.src} alt={preview.name} />
              {SOUVENIRS.length > 1 && (
                <button className="souvenir-preview-nav next" onClick={() => showPreviewAt(preview.index + 1)} aria-label="下一张">
                  ›
                </button>
              )}
              <strong>{preview.name}</strong>
              <span className="souvenir-preview-count">{preview.index + 1} / {SOUVENIRS.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StorySettlementCard({ roleKey, outfit, visited, onClose }) {
  const [showSouvenirs, setShowSouvenirs] = useState(false);
  const role = ROLES[roleKey] || ROLES.xiaolin;
  const chapters = STORY_NODES.map((node) => ({
    no: node.no,
    name: node.name,
    chapterNo: node.chapterNo,
    title: CHAPTER_STORIES[node.chapterNo - 1].title,
    text: CHAPTER_STORIES[node.chapterNo - 1].text,
    done: visited.includes(node.no),
  })).sort((a, b) => a.chapterNo - b.chapterNo);
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="settlement-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        <section className="settlement-scroll">
          <h2>解锁故事</h2>
          <p>走马驿《长寿契》探索记录</p>
          <div className="settlement-chapters">
            {chapters.map((c) => (
              <div key={c.no} className={c.done ? "done" : ""}>
                <b>节点 {c.no}</b>
                <span className="settlement-chapter-title">{c.title} · {c.name}</span>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
          <strong>最终真相</strong>
          <p>{STORY_ENDING.truth}</p>
          <strong>故事总结</strong>
          <p>{STORY_ENDING.summary}</p>
        </section>
        <aside className="settlement-side">
          <div className="settlement-avatar">
            <PixelRole roleKey={role.key} outfit={outfit} size={118} />
            <span>{role.name}</span>
          </div>
          <div className="settlement-score">
            <b>成就：长寿契探索</b>
            <span>{visited.length} / 6</span>
          </div>
          <button className="btn btn-primary" onClick={() => setShowSouvenirs(true)}>领取纪念品</button>
        </aside>
        {showSouvenirs && <SouvenirPopup onClose={() => setShowSouvenirs(false)} />}
      </div>
    </div>
  );
}

// ---- 游客端主体 ----
function VisitorApp({ spots, setSpots, edges, role, outfit = 0 }) {
  const [tab, setTab] = useState("map"); // map | routes
  const [mapView, setMapView] = useState("tour"); // tour | story
  const [activeSpot, setActiveSpot] = useState(null);
  const [activeStoryNode, setActiveStoryNode] = useState(null);
  const [visitedStories, setVisitedStories] = useState([]);
  const [storyEditMode, setStoryEditMode] = useState(false);
  const [storyNodes, setStoryNodes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("zouma_story_nodes") || "null");
      if (Array.isArray(saved)) {
        return STORY_NODES.map((node) => {
          const hit = saved.find((s) => s.no === node.no);
          return hit ? { ...node, x: hit.x, y: hit.y } : node;
        });
      }
    } catch {}
    return STORY_NODES;
  });
  const [showSettlement, setShowSettlement] = useState(false);
  const [plan, setPlan] = useState([]);
  const [route, setRoute] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const openAt = useRef(null);

  function handleSpotClick(spot) {
    if (editMode) return;
    if (spot) { logClick(spot.id); openAt.current = Date.now(); }
    else if (activeSpot && openAt.current) { logDwell(activeSpot.id, Date.now() - openAt.current); openAt.current = null; }
    setActiveSpot(spot);
  }
  function closePopup() {
    if (activeSpot && openAt.current) { logDwell(activeSpot.id, Date.now() - openAt.current); openAt.current = null; }
    setActiveSpot(null);
  }
  function toggle(spot) {
    setRoute(null);
    setPlan((p) => p.includes(spot.id) ? p.filter((x) => x !== spot.id) : [...p, spot.id]);
  }
  function generate() {
    const r = planRoute(plan, spots, edges);
    if (r) { setRoute(r); setShowRoute(true); logRoute(r.order.map((s) => s.id)); }
  }
  function updateSpot(id, coords) {
    setSpots((arr) => arr.map((s) => s.id === id ? { ...s, ...coords } : s));
  }

  function applyPreset(spotIds) {
    setPlan(spotIds);
    const r = planRoute(spotIds, spots, edges);
    if (r) { setRoute(r); setShowRoute(true); logRoute(spotIds); }
    setTab("map");
  }

  function openStoryNode(node) {
    setActiveStoryNode(node);
    setVisitedStories((list) => list.includes(node.no) ? list : [...list, node.no].sort((a, b) => a - b));
  }
  function moveStoryNode(no, coords) {
    setStoryNodes((nodes) => {
      const next = nodes.map((node) => node.no === no ? { ...node, ...coords } : node);
      localStorage.setItem("zouma_story_nodes", JSON.stringify(next.map(({ no, x, y }) => ({ no, x, y }))));
      return next;
    });
  }

  const inPlan = activeSpot ? plan.includes(activeSpot.id) : false;

  return (
    <div className="visitor">
      <div className="visitor-tabs">
        <button className={"vtab" + (tab === "map" ? " vtab-active" : "")} onClick={() => setTab("map")}>地图探索</button>
        <button className={"vtab" + (tab === "routes" ? " vtab-active" : "")} onClick={() => setTab("routes")}>推荐路线</button>
        <button className={"vtab" + (tab === "shop" ? " vtab-active" : "")} onClick={() => setTab("shop")}>走马好物</button>
      </div>
      {tab === "map" ? (
      <div className="visitor-map-content">
      <div className="map-wrap">
        <div className="map-toolbar">
          <div className="map-view-switch">
            <button className={mapView === "tour" ? "active" : ""} onClick={() => setMapView("tour")}>游览地图</button>
            <button className={mapView === "story" ? "active" : ""} onClick={() => { setMapView("story"); setActiveSpot(null); setEditMode(false); }}>故事节点图</button>
          </div>
          <button className="edit-toggle blueprint-toggle" onClick={() => setShowBlueprint(true)}>
            走马蓝图
          </button>
          {mapView === "story" && (
            <button
              className={"edit-toggle" + (storyEditMode ? " active" : "")}
              onClick={() => setStoryEditMode((v) => !v)}
            >
              {storyEditMode ? "完成调整" : "调整节点"}
            </button>
          )}
          {mapView === "tour" && (
            <button
              className={"edit-toggle" + (editMode ? " active" : "")}
              onClick={() => { setEditMode((v) => !v); setActiveSpot(null); }}
            >
              {editMode ? "⬚ 退出调整" : "⬚ 调整点位"}
            </button>
          )}
        </div>

        {mapView === "story" ? (
          <StoryNodeMap nodes={storyNodes} onOpenNode={openStoryNode} editMode={storyEditMode} onMoveNode={moveStoryNode} />
        ) : (
          <MapStage spots={spots} plan={plan} activeId={activeSpot && activeSpot.id}
            route={route} onSpotClick={handleSpotClick} onReopenRoute={() => setShowRoute(true)}
            editMode={editMode} onUpdateSpot={updateSpot} />
        )}

        {mapView === "story" ? (
          <div className="story-map-caption">
            {storyEditMode ? "拖动 6 个故事节点调整位置，调整结果会自动保存在本机浏览器。" : "点击 6 个前期建设节点，查看建筑改造方向与角色故事。"}
          </div>
        ) : editMode
          ? <EditPanel spots={spots} onDone={() => setEditMode(false)} />
          : <Legend />
        }
      </div>

      {!editMode && (
        <PlanPanel spots={spots} plan={plan}
          onRemove={(id) => { setRoute(null); setPlan((p) => p.filter((x) => x !== id)); }}
          onClear={() => { setPlan([]); setRoute(null); }}
          onGenerate={generate}
          hideRouteAction={mapView === "story"}
          roleGuide={<RoleGuide
            roleKey={role}
            outfit={outfit}
            spots={spots}
            onApply={mapView === "story" ? () => setShowSettlement(true) : applyPreset}
            buttonLabel={mapView === "story" ? "生成结算卡片" : "生成身份路线"}
          />} />
      )}
      </div>
      ) : tab === "routes" ? (
        <RecommendedRoutes spots={spots} onApply={applyPreset} />
      ) : (
        <ShopPage />
      )}

      {activeSpot && !editMode && (
        <SpotPopup spot={activeSpot} inPlan={inPlan} onClose={closePopup} onToggle={toggle} />
      )}
      {activeStoryNode && <StoryNodePopup node={activeStoryNode} onClose={() => setActiveStoryNode(null)} />}
      {showSettlement && <StorySettlementCard roleKey={role} outfit={outfit} visited={visitedStories} onClose={() => setShowSettlement(false)} />}
      {showBlueprint && <BlueprintModal onClose={() => setShowBlueprint(false)} />}
      {showRoute && !editMode && <RouteResult route={route} spots={spots} onClose={() => setShowRoute(false)} />}
    </div>
  );
}

function Legend() {
  return (
    <div className="legend">
      <span className="legend-title">景点类别</span>
      {Object.entries(CATEGORY_META).map(([k, m]) => (
        <span key={k} className="legend-row">
          <span className="legend-dot" style={{ background: m.color }} />{m.label}
        </span>
      ))}
      <span className="legend-sep" />
      <span className="legend-row"><span className="legend-line" />推荐路线</span>
      <span className="legend-row"><span className="legend-line legend-line-cart" />电瓶车段</span>
    </div>
  );
}

export { VisitorApp, Placeholder };
