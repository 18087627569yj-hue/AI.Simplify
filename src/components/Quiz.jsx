import React from "react";
import { SEED_SPOTS } from "../data.js";
import { getResource } from "../resources.js";

// ============================================================
// 介绍结束后的分流页 + 古道身份测试
//   BranchGate：选「进游客地图」或「测一测身份」
//   Quiz：5 道题，每选项给对应角色 +1 分，最高分判定角色
//   四角色对应地图四类景点：activity / culture / service / scenic
// ============================================================

export const ROLES = {
  xiaoma: {
    key: "xiaoma", cat: "activity", emoji: "🧧",
    name: "小马", title: "古道挑夫",
    palette: { hat: "#C0492F", hatD: "#8E2F1E" },
    outfits: [
      { name: "短打挑担", robe: "#B5552E", robeD: "#8A3E1F" },
      { name: "青布背篓", robe: "#4E7A5E", robeD: "#365A43" },
      { name: "褐衫行脚", robe: "#8A5A33", robeD: "#653F22" },
    ],
    desc: "你是个闲不住的行动派！翻山越岭、采摘加工、动手体验样样想试，走完整条古道才痛快。走马岭的体验活动，就等你来闯。",
    tag: "体验闯关型",
  },
  zhouyi: {
    key: "zhouyi", cat: "culture", emoji: "🎓",
    name: "周驿", title: "驿站驿丞",
    palette: { hat: "#2B3A66", hatD: "#1C2747" },
    outfits: [
      { name: "靛青持卷", robe: "#2B5273", robeD: "#1E3B55" },
      { name: "黛灰披风", robe: "#4A4F5E", robeD: "#33373F" },
      { name: "绛红印绶", robe: "#7A3340", robeD: "#5A222C" },
    ],
    desc: "你是个爱刨根问底的考据派。每处地名、每段典故都想弄个明白，驿道、仙侠、非遗的老故事最对你的胃口。",
    tag: "文史考据型",
  },
  lusheng: {
    key: "lusheng", cat: "service", emoji: "🌾",
    name: "陆生", title: "田园农人",
    palette: { hat: "#6E8C3E", hatD: "#4F6A2A" },
    outfits: [
      { name: "麻衣荷锄", robe: "#8A7A4E", robeD: "#655836" },
      { name: "苔绿蓑衣", robe: "#5E7A3E", robeD: "#43592A" },
      { name: "土布提篮", robe: "#7A5A38", robeD: "#5A4126" },
    ],
    desc: "你向往的是慢下来的日子。找块田园喝茶发呆、住一晚滨水民宿、尝口地道农家饭，松弛感才是头等大事。",
    tag: "田园慢活型",
  },
  xiaolin: {
    key: "xiaolin", cat: "scenic", emoji: "⛰️",
    name: "小林", title: "山野行者",
    palette: { hat: "#3E7C8C", hatD: "#2A5763" },
    outfits: [
      { name: "天青摄影", robe: "#3E6E8C", robeD: "#2B5070" },
      { name: "月白背包", robe: "#6E7E8C", robeD: "#4F5C68" },
      { name: "黛绿登山", robe: "#3E6E5C", robeD: "#2A5043" },
    ],
    desc: "你是为风景而来的探景派。登高望远、临水观鸟，南观野、北望城，把走马岭的好山好水尽收眼底、拍个痛快。",
    tag: "自然探景型",
  },
};

const ORDER = ["xiaoma", "zhouyi", "lusheng", "xiaolin"]; // 平分时的优先级

// 5 道题，每个选项指向一个角色
const QUESTIONS = [
  {
    q: "周末出门，你最想要的是——",
    opts: [
      { t: "翻山越岭，走完整条线才痛快", r: "xiaoma" },
      { t: "慢慢逛，听每处地名背后的老故事", r: "zhouyi" },
      { t: "找块田园喝茶发呆、采点果子", r: "lusheng" },
      { t: "登高望远，把好山好水拍个够", r: "xiaolin" },
    ],
  },
  {
    q: "到了走马岭，第一个想冲的地方？",
    opts: [
      { t: "梯田采摘谷，亲手摘点带走", r: "xiaoma" },
      { t: "走马古驿站，看看古道驿站长啥样", r: "zhouyi" },
      { t: "田园餐厅，先尝口地道农家味", r: "lusheng" },
      { t: "观景台，把全岭风光一眼望尽", r: "xiaolin" },
    ],
  },
  {
    q: "朋友圈最想发哪一张？",
    opts: [
      { t: "满头大汗刚做好的荔枝蜜饯", r: "xiaoma" },
      { t: "古驿站门口那块斑驳的老匾", r: "zhouyi" },
      { t: "民宿阳台、一壶茶配晚霞", r: "lusheng" },
      { t: "云雾里的龙溪河与远山", r: "xiaolin" },
    ],
  },
  {
    q: "一整天的体力，你愿意花在——",
    opts: [
      { t: "把每个体验项目都玩个遍", r: "xiaoma" },
      { t: "泡在村史与非遗展里慢慢看", r: "zhouyi" },
      { t: "什么都不赶，躺平享受田园", r: "lusheng" },
      { t: "多爬两个观景点，追最好的光", r: "xiaolin" },
    ],
  },
  {
    q: "你心里，旅行最好的纪念是——",
    opts: [
      { t: "一身亲手做出来的成就感", r: "xiaoma" },
      { t: "几个能讲给别人听的故事", r: "zhouyi" },
      { t: "彻底松弛下来的好心情", r: "lusheng" },
      { t: "相机里一组绝美的风景片", r: "xiaolin" },
    ],
  },
];

// 装扮配件 —— 返回 {behind, front}，behind 画在身体后（披风/背篓/背包等）
function renderAcc(roleKey, outfit) {
  const WOOD = "#7A5230", BASKET = "#B98C4A", BASKETD = "#8A6630", STRAW = "#C7A24E",
    PAPER = "#ECE2C6", METAL = "#9AA0A6", ROPE = "#5A4632", GOLD = "#D8AE52", CAP = "#7A4A28";
  switch (roleKey + outfit) {
    // 小马
    case "xiaoma0": // 扁担挑货
      return { front: (<g>
        <rect x="2" y="39" width="60" height="3" fill={WOOD} />
        <rect x="1" y="42" width="11" height="13" fill="#B5552E" />
        <rect x="1" y="42" width="11" height="3" fill={ROPE} />
        <rect x="52" y="42" width="11" height="13" fill="#B5552E" />
        <rect x="52" y="42" width="11" height="3" fill={ROPE} />
      </g>) };
    case "xiaoma1": // 背篓
      return {
        behind: (<g>
          <rect x="44" y="30" width="16" height="27" fill={BASKET} />
          <rect x="44" y="37" width="16" height="2" fill={BASKETD} />
          <rect x="44" y="46" width="16" height="2" fill={BASKETD} />
          <rect x="50" y="30" width="2" height="27" fill={BASKETD} />
        </g>),
        front: (<g><rect x="22" y="41" width="3" height="20" fill={ROPE} /></g>),
      };
    case "xiaoma2": // 肩挎布包 + 短杖
      return { front: (<g>
        <rect x="5" y="52" width="14" height="12" fill="#5A4E2A" />
        <rect x="5" y="52" width="14" height="3" fill={ROPE} />
        <rect x="20" y="40" width="3" height="16" fill={ROPE} />
        <rect x="52" y="30" width="3" height="34" fill={WOOD} />
      </g>) };
    // 周驿
    case "zhouyi0": // 手持卷轴
      return { front: (<g>
        <rect x="50" y="48" width="5" height="16" fill={PAPER} />
        <rect x="49" y="47" width="7" height="3" fill={BASKETD} />
        <rect x="49" y="62" width="7" height="3" fill={BASKETD} />
      </g>) };
    case "zhouyi1": // 披风斗篷
      return {
        behind: (<g>
          <rect x="4" y="42" width="56" height="28" fill="#33373F" />
          <rect x="2" y="60" width="60" height="10" fill="#2A2D34" />
        </g>),
        front: (<g><rect x="16" y="39" width="32" height="4" fill="#4A4F5E" /></g>),
      };
    case "zhouyi2": // 腰间印绶
      return { front: (<g>
        <rect x="14" y="55" width="36" height="5" fill={GOLD} />
        <rect x="30" y="60" width="4" height="9" fill="#7A3340" />
        <rect x="29" y="68" width="6" height="2" fill={GOLD} />
      </g>) };
    // 陆生
    case "lusheng0": // 肩扛锄头
      return { front: (<g>
        <rect x="49" y="22" width="3" height="30" fill={WOOD} />
        <rect x="44" y="22" width="10" height="5" fill={METAL} />
      </g>) };
    case "lusheng1": // 蓑衣
      return { front: (<g>
        <rect x="12" y="40" width="40" height="16" fill={STRAW} />
        <rect x="12" y="44" width="40" height="1.6" fill="#A07C2E" />
        <rect x="12" y="49" width="40" height="1.6" fill="#A07C2E" />
        <rect x="14" y="55" width="4" height="5" fill={STRAW} />
        <rect x="22" y="55" width="4" height="5" fill={STRAW} />
        <rect x="30" y="55" width="4" height="5" fill={STRAW} />
        <rect x="38" y="55" width="4" height="5" fill={STRAW} />
        <rect x="46" y="55" width="4" height="5" fill={STRAW} />
      </g>) };
    case "lusheng2": // 手提竹篮
      return { front: (<g>
        <rect x="3" y="54" width="14" height="11" fill={BASKET} />
        <rect x="3" y="58" width="14" height="2" fill={BASKETD} />
        <rect x="4" y="49" width="12" height="3" fill={BASKETD} />
        <rect x="4" y="50" width="2" height="5" fill={BASKETD} />
        <rect x="14" y="50" width="2" height="5" fill={BASKETD} />
      </g>) };
    // 小林
    case "xiaolin0": // 挎相机包
      return { front: (<g>
        <rect x="20" y="41" width="3" height="18" fill="#3E2A1A" />
        <rect x="30" y="52" width="14" height="9" fill="#2E2A26" />
        <rect x="35" y="54" width="5" height="5" fill="#5A6B72" />
      </g>) };
    case "xiaolin1": // 登山背包
      return {
        behind: (<g>
          <rect x="18" y="33" width="28" height="15" fill="#3E6E5C" />
          <rect x="18" y="40" width="28" height="2" fill="#2A5043" />
        </g>),
        front: (<g>
          <rect x="22" y="41" width="3" height="20" fill="#2A5043" />
          <rect x="39" y="41" width="3" height="20" fill="#2A5043" />
        </g>),
      };
    case "xiaolin2": // 登山杖 + 水壶
      return { front: (<g>
        <rect x="53" y="28" width="2.5" height="36" fill={METAL} />
        <rect x="52" y="28" width="4" height="4" fill="#2E2A26" />
        <rect x="7" y="54" width="8" height="11" fill={GOLD} />
        <rect x="9" y="51" width="4" height="4" fill={CAP} />
      </g>) };
    default:
      return {};
  }
}

// 参数化像素角色头像 —— 头饰区分角色身份，outfit 切换衣服配色 + 造型配件
export function PixelRole({ roleKey, outfit = 0, size = 120 }) {
  const role = ROLES[roleKey];
  if (!role) return null;
  const frame = Math.max(0, Math.min(2, outfit)) + 1;
  const src = `assets/roles/${roleKey}-${frame}.png`;
  return (
    <img
      className="pixel-role-img"
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      style={{ "--role-size": `${size}px` }}
    />
  );
}

// —— 分流页 ——
function BranchGate({ onMap, onQuiz }) {
  return (
    <div className="vbranch">
      <img src={getResource("heroImg", "assets/pixel-bg.png")} className="intro-bg" alt="" />
      <div className="intro-ov" />
      <div className="vbranch-inner">
        <div className="vbranch-eye">马伯：进村之前，你想咋个逛法？</div>
        <h2 className="vbranch-title">选一条路，开始你的走马岭之旅</h2>
        <div className="vbranch-cards">
          <button className="vbranch-card" onClick={onMap}>
            <div className="vbranch-card-ico">🗺️</div>
            <div className="vbranch-card-name">直接进游客地图</div>
            <div className="vbranch-card-desc">自由探索 17 处景点，规划你的慢行路线</div>
            <div className="vbranch-card-go">自由探索 →</div>
          </button>
          <button className="vbranch-card vbranch-card-quiz" onClick={onQuiz}>
            <div className="vbranch-card-ico">🎲</div>
            <div className="vbranch-card-name">先测一测我的身份</div>
            <div className="vbranch-card-desc">答 5 道小题，看看你是哪路古道角色</div>
            <div className="vbranch-card-go">开始测试 →</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// —— 测试 ——
function Quiz({ onEnterMap, onBack }) {
  const [step, setStep] = React.useState(0); // 0..QUESTIONS.length-1，== length 时出结果
  const [scores, setScores] = React.useState({ xiaoma: 0, zhouyi: 0, lusheng: 0, xiaolin: 0 });
  const [outfit, setOutfit] = React.useState(0); // 结果页选中的装扮

  const done = step >= QUESTIONS.length;

  function choose(roleKey) {
    setScores(s => ({ ...s, [roleKey]: s[roleKey] + 1 }));
    setStep(s => s + 1);
  }

  function restart() {
    setScores({ xiaoma: 0, zhouyi: 0, lusheng: 0, xiaolin: 0 });
    setOutfit(0);
    setStep(0);
  }

  if (done) {
    // 取最高分角色，平分按 ORDER 优先
    const winnerKey = ORDER.reduce((best, k) => (scores[k] > scores[best] ? k : best), ORDER[0]);
    const role = ROLES[winnerKey];
    const recs = SEED_SPOTS.filter(s => s.cat === role.cat).slice(0, 3);
    return (
      <div className="vquiz vquiz-result">
        <img src={getResource("heroImg", "assets/pixel-bg.png")} className="intro-bg" alt="" />
        <div className="intro-ov" />
        <div className="vquiz-result-card">
          <div className="vquiz-result-eye">你的古道身份是</div>
          <div className="vquiz-avatar"><PixelRole roleKey={winnerKey} outfit={outfit} size={132} /></div>
          <div className="vquiz-result-name">{role.emoji} {role.name} · {role.title}</div>
          <div className="vquiz-result-tag">{role.tag} · 得分 {scores[winnerKey]} / {QUESTIONS.length}</div>

          {/* 换装选择器 */}
          <div className="vquiz-fits">
            <div className="vquiz-fits-h">挑一套装扮</div>
            <div className="vquiz-fits-row">
              {role.outfits.map((f, i) => (
                <button
                  key={i}
                  className={"vquiz-fit" + (i === outfit ? " active" : "")}
                  onClick={() => setOutfit(i)}
                >
                  <PixelRole roleKey={winnerKey} outfit={i} size={46} />
                  <span className="vquiz-fit-name">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="vquiz-result-desc">{role.desc}</p>

          {recs.length > 0 && (
            <div className="vquiz-recs">
              <div className="vquiz-recs-h">马伯给你点的几处去处</div>
              <div className="vquiz-recs-list">
                {recs.map(s => <span key={s.id} className="vquiz-rec">{s.name}</span>)}
              </div>
            </div>
          )}

          <button className="vquiz-go" onClick={() => onEnterMap(winnerKey, outfit)}>带上「{role.name}」进村探索 →</button>
          <button className="vquiz-restart" onClick={restart}>重新测一次</button>
        </div>
      </div>
    );
  }

  const Q = QUESTIONS[step];
  return (
    <div className="vquiz">
      <img src={getResource("heroImg", "assets/pixel-bg.png")} className="intro-bg" alt="" />
      <div className="intro-ov" />
      <button className="vintro-skip" onClick={onBack}>‹ 返回</button>
      <div className="vquiz-inner">
        <div className="vquiz-progress">第 {step + 1} 题 / 共 {QUESTIONS.length} 题</div>
        <div className="vquiz-bar"><span style={{ width: ((step) / QUESTIONS.length * 100) + "%" }} /></div>
        <h2 className="vquiz-q">{Q.q}</h2>
        <div className="vquiz-opts">
          {Q.opts.map((o, i) => (
            <button key={i} className="vquiz-opt" onClick={() => choose(o.r)}>
              <span className="vquiz-opt-idx">{"ABCD"[i]}</span>
              <span>{o.t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { BranchGate, Quiz };
