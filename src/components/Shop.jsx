import React from "react";
import { PRODUCTS, PRODUCT_CATS } from "../data.js";

// ============================================================
// 走马好物 — 商品展示页 + 路线沿途推荐
// ============================================================

// ---- 商品卡片 ----
function ProductCard({ p, compact }) {
  const cat = PRODUCT_CATS[p.cat] || {};
  const [added, setAdded] = React.useState(false);

  function handleAdd() {
    setAdded(true);
    // 存入 localStorage 伴手礼清单
    try {
      const list = JSON.parse(localStorage.getItem("zm_cart") || "[]");
      if (!list.includes(p.id)) { list.push(p.id); localStorage.setItem("zm_cart", JSON.stringify(list)); }
    } catch(e) {}
    setTimeout(() => setAdded(false), 1500);
  }

  if (compact) {
    return (
      <div className="prod-compact">
        <div className="prod-c-img-wrap">
          <img src={p.img} className="prod-c-img" alt={p.name} />
          <span className="prod-c-cat" style={{ background: cat.color }}>{cat.label}</span>
        </div>
        <div className="prod-c-info">
          <div className="prod-c-name">{p.name}</div>
          <div className="prod-c-price">¥{p.price}<span className="prod-c-unit">/{p.unit}</span></div>
        </div>
        <button className={"prod-c-btn" + (added ? " added" : "")} onClick={handleAdd}>
          {added ? "✓ 已加" : "+ 加入"}
        </button>
      </div>
    );
  }

  return (
    <div className="prod-card">
      <div className="prod-img-wrap">
        <img src={p.img} className="prod-img" alt={p.name} />
        <span className="prod-cat" style={{ background: cat.color }}>{cat.label}</span>
      </div>
      <div className="prod-body">
        <h4 className="prod-name">{p.name}</h4>
        <span className="prod-name-en">{p.nameEn}</span>
        <p className="prod-desc">{p.desc}</p>
        <div className="prod-footer">
          <div className="prod-price">
            <span className="prod-price-sym">¥</span>
            <span className="prod-price-val">{p.price}</span>
            <span className="prod-price-unit">/{p.unit}</span>
          </div>
          <button className={"btn prod-btn" + (added ? " prod-btn-added" : "")} onClick={handleAdd}>
            {added ? "✓ 已加入清单" : "加入伴手礼清单"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- 走马好物页面 ----
function ShopPage() {
  const [filter, setFilter] = React.useState("all");
  const cats = ["all", ...Object.keys(PRODUCT_CATS)];
  const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h2 className="shop-title">走马好物</h2>
        <p className="shop-sub">在地特产 · 手工文创 · 餐饮体验 · 伴手好礼</p>
      </div>
      <div className="shop-filters">
        {cats.map(c => (
          <button key={c}
            className={"shop-filter" + (filter === c ? " active" : "")}
            style={filter === c && c !== "all" ? { borderColor: PRODUCT_CATS[c]?.color, color: PRODUCT_CATS[c]?.color } : {}}
            onClick={() => setFilter(c)}>
            {c === "all" ? "全部" : PRODUCT_CATS[c].label}
          </button>
        ))}
      </div>
      <div className="shop-grid">
        {filtered.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}

// ---- 沿途好物推荐（嵌入路线结果卡片） ----
function RouteProducts({ route }) {
  if (!route || !route.order) return null;
  const spotIds = new Set(route.order.map(s => s.id));
  const recommended = PRODUCTS.filter(p => p.spots.some(sid => spotIds.has(sid)));
  if (recommended.length === 0) return null;

  return (
    <div className="route-products">
      <div className="rp-head">
        <h3>沿途好物</h3>
        <span className="rp-sub">途经景点关联特产 · 可提前预购</span>
      </div>
      <div className="rp-list">
        {recommended.slice(0, 4).map(p => (
          <ProductCard key={p.id} p={p} compact />
        ))}
      </div>
    </div>
  );
}

export { ShopPage, RouteProducts, ProductCard };
