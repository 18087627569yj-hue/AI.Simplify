import React from "react";
import { getResource } from "../resources.js";

// ============================================================
// 首页英雄屏 — 全幅底图 · 描边大字 · 路线 SVG · 进入动效
// ============================================================

function HomePage({ onEnter }) {
  const [exiting, setExiting] = React.useState(false);

  function handleEnter() {
    setExiting(true);
    setTimeout(onEnter, 680);
  }

  return (
    <div className={"hero" + (exiting ? " hero-exit" : "")}>
      {/* 底图 */}
      <img src={getResource("heroImg", "assets/pixel-bg.png")} className="hero-bg" alt="" />
      <div className="hero-ov" />

      {/* 四角标注 */}
      <div className="hero-tl">
        <div>龙溪河流域</div>
        <div>乡村慢行目的地</div>
      </div>
      <div className="hero-tr">
        <div>重庆·长寿区</div>
        <div>数字预运营系统</div>
      </div>

      {/* 主内容 */}
      <div className="hero-center">
        <div className="hero-eye">ZOUMALING · SLOW TRAIL · 2026</div>

        {/* 标题：走马岭 */}
        <div className="hero-title">
          <span className="hero-ch hero-ch-fill">走</span>
          <span className="hero-ch hero-ch-stroke">马</span>
          <span className="hero-ch hero-ch-fill">岭</span>
        </div>

        <div className="hero-subtitle">数字预运营系统</div>

        {/* 路线 SVG 示意 — 全宽背景 */}
        <svg className="hero-trail" viewBox="-75 -20 900 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(58 -20) scale(0.82)">
            {/* 主路线 */}
            <path
              d="M 52,142
                 C 42,124 46,104 64,94
                 C 72,84 86,82 100,80
                 C 120,52 144,44 178,34
                 C 226,20 286,44 342,28
                 C 382,18 398,-6 440,18
                 C 468,28 484,18 502,56
                 C 512,80 534,82 570,90
                 C 614,102 656,86 700,92
                 C 730,96 746,118 764,140
                 C 782,164 768,176 742,184
                 C 724,190 708,190 694,214
                 C 678,240 674,264 650,272
                 C 604,286 548,278 506,258
                 C 472,244 444,216 398,206
                 C 356,198 318,188 278,198
                 C 244,206 226,232 188,238
                 C 142,246 88,232 58,200
                 C 34,176 30,156 52,142
                 Z"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 游览入口 */}
            <circle cx="704" cy="96" r="8" fill="white" opacity="0.95" />
            <text className="hero-trail-label" x="712" y="82" fill="white" fontSize="10" fontFamily="monospace" opacity="0.85" fontWeight="500">游览入口</text>

            {/* 滨水餐厅 */}
            <circle cx="64" cy="196" r="6" fill="none" stroke="white" strokeWidth="2.2" opacity="0.7" />
            <text className="hero-trail-label" x="16" y="226" fill="white" fontSize="9" fontFamily="monospace" opacity="0.72">滨水餐厅</text>

            {/* 尹家山自然教育 */}
            <circle cx="178" cy="34" r="5" fill="white" opacity="0.88" />
            <text className="hero-trail-label" x="148" y="16" fill="white" fontSize="10" fontFamily="monospace" opacity="0.85" fontWeight="500">尹家山</text>

            {/* 黄葛树村落客厅 */}
            <circle cx="292" cy="36" r="5" fill="white" opacity="0.88" />
            <text className="hero-trail-label" x="270" y="18" fill="white" fontSize="10" fontFamily="monospace" opacity="0.85" fontWeight="500">黄葛树</text>

            {/* 田园研学营地 */}
            <circle cx="404" cy="10" r="5" fill="white" opacity="0.88" />
            <text className="hero-trail-label" x="376" y="-8" fill="white" fontSize="10" fontFamily="monospace" opacity="0.85" fontWeight="500">研学营地</text>

            {/* 走马古驿站 — 核心节点 */}
            <circle cx="502" cy="56" r="8" fill="white" opacity="0.96" />
            <text className="hero-trail-label" x="470" y="36" fill="white" fontSize="13" fontFamily="monospace" opacity="0.94" fontWeight="700">古驿站</text>

            {/* 观景湖 */}
            <circle cx="620" cy="94" r="5" fill="white" opacity="0.88" />
            <text className="hero-trail-label" x="628" y="82" fill="white" fontSize="10" fontFamily="monospace" opacity="0.85" fontWeight="500">观景湖</text>

            {/* 观景台 */}
            <circle cx="742" cy="184" r="5" fill="white" opacity="0.88" />
            <text className="hero-trail-label" x="750" y="174" fill="white" fontSize="10" fontFamily="monospace" opacity="0.85" fontWeight="500">观景台</text>

            {/* 竹海疗愈课堂 */}
            <circle cx="650" cy="272" r="5" fill="white" opacity="0.88" />
            <text className="hero-trail-label" x="656" y="296" fill="white" fontSize="10" fontFamily="monospace" opacity="0.85" fontWeight="500">竹海疗愈</text>

            {/* 滨水民宿 */}
            <circle cx="506" cy="258" r="5" fill="white" opacity="0.88" />
            <text className="hero-trail-label" x="490" y="286" fill="white" fontSize="10" fontFamily="monospace" opacity="0.85" fontWeight="500">滨水民宿</text>

            {/* 水果加工工坊 */}
            <circle cx="398" cy="206" r="5" fill="white" opacity="0.88" />
            <text className="hero-trail-label" x="354" y="234" fill="white" fontSize="10" fontFamily="monospace" opacity="0.85" fontWeight="500">水果工坊</text>

            {/* 滨水公园 */}
            <circle cx="278" cy="198" r="5" fill="white" opacity="0.88" />
            <text className="hero-trail-label" x="222" y="220" fill="white" fontSize="10" fontFamily="monospace" opacity="0.85" fontWeight="500">滨水公园</text>
          </g>
        </svg>

        {/* 信息胶囊 */}
        <div className="hero-pills">
          <div className="hero-pill">景点 · 17处</div>
          <div className="hero-pill">全程 · 约8公里</div>
          <div className="hero-pill">模式 · 慢行游览</div>
        </div>

        <button className="hero-cta" onClick={handleEnter}>
          进入探索<span className="hero-arrow"> →</span>
        </button>
      </div>

      {/* 底部栏 */}
      <div className="hero-foot">
        <div className="hero-foot-l">
          <div className="hero-foot-mark">走</div>
          <div>
            <div className="hero-foot-brand">走马岭数字预运营系统</div>
            <div className="hero-foot-desc">龙溪河流域乡村慢行旅游目的地</div>
          </div>
        </div>
        <div className="hero-foot-r">
          构建数字底座 · 探索旅游潜力 · 赋能乡村发展
        </div>
      </div>
    </div>
  );
}

export { HomePage };
