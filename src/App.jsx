import React, { useState, useEffect } from "react";
import { SEED_SPOTS, SEED_EDGES, loadAnalytics, fetchAnalytics, logVisit } from "./data.js";
import { HomePage } from "./components/Home.jsx";
import { IntroPages } from "./components/Intro.jsx";
import { BranchGate, Quiz } from "./components/Quiz.jsx";
import { VisitorApp } from "./components/Visitor.jsx";
import { AdminApp } from "./components/Admin.jsx";

// ============================================================
// 应用外壳 — 首页 · 游客地图 · 管理后台
// ============================================================

function App() {
  const [mode, setMode] = useState("home"); // home | intro | branch | quiz | visitor | admin
  const [spots, setSpots] = useState(SEED_SPOTS);
  const [edges, setEdges] = useState(SEED_EDGES);
  const [analytics, setAnalytics] = useState(() => loadAnalytics());
  const [role, setRole] = useState(null);     // 测试得到的古道角色 key
  const [outfit, setOutfit] = useState(0);    // 角色装扮序号

  // 进入应用记一次访问（写入云端 events 表）
  useEffect(() => { logVisit(); }, []);

  // 进入管理后台时，从云端实时拉取统计数据
  useEffect(() => {
    if (mode !== "admin") return;
    let alive = true;
    const refresh = () => fetchAnalytics().then((next) => {
      if (alive) setAnalytics(next);
    });
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [mode]);

  if (mode === "home") {
    return <HomePage onEnter={() => setMode("intro")} />;
  }

  if (mode === "intro") {
    return <IntroPages onFinish={() => setMode("branch")} />;
  }

  if (mode === "branch") {
    return <BranchGate onMap={() => setMode("visitor")} onQuiz={() => setMode("quiz")} />;
  }

  if (mode === "quiz") {
    return (
      <Quiz
        onBack={() => setMode("branch")}
        onEnterMap={(r, o) => { setRole(r); setOutfit(o); setMode("visitor"); }}
      />
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand" style={{ cursor: "pointer" }} onClick={() => setMode("home")}>
          <div className="brand-mark">长</div>
          <div className="brand-text">
            <div className="brand-name">长寿果岭 · 走马古驿</div>
            <div className="brand-sub">以「长寿之果」做产业引擎，以「古道驿站」做体验灵魂</div>
          </div>
        </div>
        <div className="mode-switch">
          <button className={mode === "visitor" ? "active" : ""} onClick={() => setMode("visitor")}>游客地图</button>
          <button className={mode === "admin" ? "active" : ""} onClick={() => setMode("admin")}>管理后台</button>
        </div>
      </header>
      <main className="stage">
        {mode === "visitor"
          ? <VisitorApp spots={spots} setSpots={setSpots} edges={edges} role={role} outfit={outfit} />
          : <AdminApp spots={spots} setSpots={setSpots} edges={edges} setEdges={setEdges} analytics={analytics} />}
      </main>
    </div>
  );
}

export default App;
