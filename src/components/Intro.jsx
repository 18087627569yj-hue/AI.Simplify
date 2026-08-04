import React from "react";
import { getResource } from "../resources.js";

// ============================================================
// 走马村介绍页 — RPG 对话风 · 像素角色「村长」逐段讲解
// 文案提炼自《走马村概念规划方案 2026.03》：空间印象 / 文脉记忆 / 游览体验
// 台词以 parts 数组书写；{hl:"…"} 表示重点意象，渲染为金色加粗高亮
// ============================================================

const SCENES = [
  {
    parts: [
      "哎哟，来贵客啦！我是走马岭的村长。你看这地方有意思得很——一边望得到长寿城的楼影，一边转身就是山岭、果树、田埂和老屋。走马村不是远在深山里的景区，它是",
      { hl: "贴着城市生长的一片乡村山岭" },
      "，近得来得方便，慢下来又像换了一个世界。",
    ],
  },
  {
    parts: [
      "这条岭最值得记住的，是它不只有风景，还有路上的故事。老早以前，荔枝从这片山水间赶路，古道、驿站、渡口把村子和外面的世界连起来。今天我们再走一遍，不是只看一条路，而是在走",
      { hl: "千年荔枝古道留下的乡土记忆" },
      "。",
      { hl: "黄桷树" },
      "、",
      { hl: "石板路" },
      "、",
      { hl: "关渡口" },
      "、",
      { hl: "老屋院坝" },
      "，都是故事停下来的地方。",
    ],
  },
  {
    parts: [
      "往里走，你会碰到五种不一样的走马岭：山顶看城，田里识果，古驿听故事，竹海歇一口气，水边住一晚。我们想做的，不是把村子变成千篇一律的景点，而是让每个人都能找到一条自己的慢行路线。走嘛，村长这就带你进村，看看你会被哪一处留住。",
    ],
  },
];

// 计算一幕台词的总字数
function sceneLen(parts) {
  return parts.reduce((n, p) => n + (typeof p === "string" ? p.length : p.hl.length), 0);
}

// 按已显示字数 n 渲染台词（含高亮，支持逐字打字到一半的高亮词）
function renderParts(parts, n) {
  const nodes = [];
  let used = 0;
  for (let k = 0; k < parts.length && used < n; k++) {
    const p = parts[k];
    const isHl = typeof p !== "string";
    const txt = isHl ? p.hl : p;
    const take = Math.min(txt.length, n - used);
    const sub = txt.slice(0, take);
    used += take;
    nodes.push(
      isHl
        ? <span key={k} className="vintro-hl">{sub}</span>
        : <React.Fragment key={k}>{sub}</React.Fragment>
    );
    if (take < txt.length) break;
  }
  return nodes;
}

// 像素角色「村长」— 使用外部像素角色图
function PixelElder() {
  return (
    <div className="vintro-elder" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <img
          key={n}
          className={"vintro-elder-frame frame-" + n}
          src={getResource(`villageChief${n}`, `assets/village-chief-${n}.png`)}
          alt=""
          draggable="false"
        />
      ))}
    </div>
  );
}

function IntroPages({ onFinish }) {
  const [idx, setIdx] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);
  const scene = SCENES[idx];
  const total = React.useMemo(() => sceneLen(scene.parts), [scene]);
  const isLast = idx === SCENES.length - 1;

  // 打字机：逐字推进当前幕
  React.useEffect(() => {
    setCount(0);
    setDone(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setCount(i);
      if (i >= total) {
        clearInterval(t);
        setDone(true);
      }
    }, 34);
    return () => clearInterval(t);
  }, [idx, total]);

  function finish() {
    setExiting(true);
    setTimeout(onFinish, 600);
  }

  // 点对话框：没打完→立刻显示全文；打完了→下一幕 / 结束
  function advance() {
    if (!done) {
      setCount(total);
      setDone(true);
      return;
    }
    if (isLast) finish();
    else setIdx(i => i + 1);
  }

  return (
    <div className={"vintro" + (exiting ? " vintro-exit" : "")}>
      <img src={getResource("heroImg", "assets/pixel-bg.png")} className="intro-bg" alt="" />
      <div className="intro-ov" />

      {/* 进度点 */}
      <div className="vintro-dots">
        {SCENES.map((_, i) => (
          <span key={i} className={"vintro-dot" + (i === idx ? " active" : i < idx ? " past" : "")} />
        ))}
      </div>

      {/* 跳过 */}
      <button className="vintro-skip" onClick={finish}>跳过引导 ›</button>

      {/* 舞台：村长 + 对话框 */}
      <div className="vintro-stage" onClick={advance}>
        <div className="vintro-elder-wrap">
          <PixelElder />
          <div className="vintro-nametag">村 长</div>
        </div>

        <div className="vintro-box">
          <div className="vintro-name">走马岭村长</div>
          <p className="vintro-text">
            {renderParts(scene.parts, count)}
            {!done && <span className="vintro-caret" />}
          </p>

          <div className="vintro-hint">
            {done
              ? (isLast ? "点击进村探索 ▸" : "点击，听村长接着讲 ▾")
              : "点击跳过逐字…"}
          </div>
        </div>
      </div>
    </div>
  );
}

export { IntroPages };
