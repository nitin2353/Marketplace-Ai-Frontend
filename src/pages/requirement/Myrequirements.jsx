import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";

// ── Style Injection (same ShopEase theme) ────────────────────────────────────
const injectStyle = () => {
  if (document.getElementById("mr-style")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "mr-style";
  s.textContent = `
    body { font-family:'Nunito',sans-serif !important; background:#f1f4ff !important; margin:0; }
    :root { --p:#ff6b35; --p2:#f7931e; --border:#e8eaf6; --text:#1a1a2e; }

    .mr-topbar { background:linear-gradient(145deg,#ff6b35 0%,#f7931e 55%,#ffcd3c 100%); padding:20px 32px; display:flex; align-items:center; justify-content:space-between; }
    .mr-card { border-radius:20px !important; border:2px solid var(--border) !important; box-shadow:0 4px 24px rgba(0,0,0,.06) !important; transition:box-shadow .2s,transform .2s,border-color .2s !important; background:#fff; }
    .mr-card:hover { box-shadow:0 12px 32px rgba(255,107,53,.18) !important; transform:translateY(-3px) !important; border-color:var(--p) !important; }
    .mr-stat { border-radius:18px; border:2px solid var(--border); background:#fff; padding:20px; text-align:center; }

    .mr-badge-pending  { background:#fef9c3; color:#854d0e; }
    .mr-badge-active   { background:#dcfce7; color:#166534; }
    .mr-badge-closed   { background:#f1f5f9; color:#64748b; }

    .mr-pill { padding:7px 16px; border-radius:30px; border:2px solid var(--border); background:#fff; font-weight:700; font-size:.8rem; cursor:pointer; transition:all .15s; color:#555; font-family:'Nunito',sans-serif; }
    .mr-pill:hover { border-color:var(--p); color:var(--p); }
    .mr-pill.on { background:linear-gradient(135deg,#ff6b35,#f7931e); color:#fff; border-color:transparent; }

    .mr-btn { background:linear-gradient(135deg,#ff6b35,#f7931e); border:none; border-radius:12px; font-weight:800; font-size:.85rem; padding:9px 20px; color:#fff; cursor:pointer; font-family:'Nunito',sans-serif; transition:transform .15s; }
    .mr-btn:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(255,107,53,.35); }
    .mr-btn-sm { border-radius:10px; font-weight:700; padding:7px 14px; border:2px solid var(--border); background:#fff; color:#555; font-family:'Nunito',sans-serif; cursor:pointer; font-size:.8rem; transition:all .15s; }
    .mr-btn-sm:hover { border-color:var(--p); color:var(--p); }

    .mr-empty { border-radius:20px; border:2.5px dashed #e0e4f0; padding:48px 20px; text-align:center; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
    .fu { animation:fadeUp .32s ease both; }
  `;
  document.head.appendChild(s);
};
injectStyle();

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK = [
  { id:"req-001", title:"Need custom gold necklace 22KT Kundan work", category:"💍 Jewellery", sub_category:"Necklace", budget_type:"Range", min_budget:25000, max_budget:35000, deadline:"2026-04-15", urgency:"Urgent", city:"Mumbai", state:"Maharashtra", status:"active", quotes:4, created_at:"2026-03-20", description:"Traditional Kundan necklace for wedding, heavy work preferred with matching earrings." },
  { id:"req-002", title:"iPhone 15 Pro Max 256GB Natural Titanium", category:"📱 Electronics", sub_category:"Mobile", budget_type:"Fixed", min_budget:84999, max_budget:84999, deadline:"2026-04-10", urgency:"Normal", city:"Delhi", state:"Delhi", status:"pending", quotes:0, created_at:"2026-03-22", description:"Sealed box, genuine Apple, with original bill. Best price please." },
  { id:"req-003", title:"Bridal Lehenga Custom Stitch Rani Pink", category:"👗 Fashion", sub_category:"Custom Stitch", budget_type:"Range", min_budget:12000, max_budget:18000, deadline:"2026-05-20", urgency:"ASAP", city:"Jaipur", state:"Rajasthan", status:"active", quotes:2, created_at:"2026-03-18", description:"Heavy embroidery, gold border, ready to wear in 3 weeks." },
  { id:"req-004", title:"Office Chair Ergonomic with lumbar support", category:"🏠 Home & Living", sub_category:"Furniture", budget_type:"Range", min_budget:8000, max_budget:15000, deadline:"2026-04-01", urgency:"Normal", city:"Pune", state:"Maharashtra", status:"closed", quotes:6, created_at:"2026-03-10", description:"Work from home setup, need comfortable ergonomic chair." },
];

const STATS = [
  { label:"Total Posted",   val:4,  icon:"📋", color:"#6366f1" },
  { label:"Active",         val:2,  icon:"✅", color:"#22c55e" },
  { label:"Quotes Received",val:12, icon:"💬", color:"#ff6b35" },
  { label:"Closed",         val:1,  icon:"🔒", color:"#94a3b8" },
];

const urgClr = { Normal:"#22c55e", Urgent:"#f7931e", ASAP:"#dc3545" };
const fmt = n => n ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

function StatusBadge({ status }) {
  const map = {
    pending:{ cls:"mr-badge-pending", lbl:"⏳ Pending"  },
    active: { cls:"mr-badge-active",  lbl:"✅ Active"   },
    closed: { cls:"mr-badge-closed",  lbl:"🔒 Closed"   },
  };
  const { cls, lbl } = map[status] || map.pending;
  return (
    <span className={cls} style={{ padding:"4px 12px", borderRadius:20, fontWeight:800, fontSize:".72rem" }}>
      {lbl}
    </span>
  );
}

export default function MyRequirements() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = MOCK.filter(r => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const budgetLabel = (r) => {
    if (r.budget_type === "Flexible") return "Flexible";
    if (r.budget_type === "Fixed")    return fmt(r.min_budget);
    return `${fmt(r.min_budget)} – ${fmt(r.max_budget)}`;
  };

  if (selected) {
    const r = MOCK.find(x => x.id === selected);
    return (
      <div style={{ minHeight:"100vh", background:"#f1f4ff" }}>
        {/* Topbar */}
        <div className="mr-topbar">
          <div className="text-white fw-black" style={{ fontFamily:"Nunito", fontSize:"1.5rem" }}>🛍️ ShopEase</div>
          <button className="mr-btn-sm" onClick={() => setSelected(null)}>← Back to My Requirements</button>
        </div>

        <Container className="py-4" style={{ maxWidth:800 }}>
          <Card className="p-0 fu" style={{ borderRadius:20, border:"none", boxShadow:"0 24px 64px rgba(0,0,0,.11)" }}>
            {/* Header */}
            <div style={{ background:"linear-gradient(135deg,#ff6b35,#f7931e)", borderRadius:"20px 20px 0 0", padding:"28px 32px" }}>
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <div className="text-white fw-black" style={{ fontSize:"1.3rem", lineHeight:1.3 }}>{r.title}</div>
                  <div style={{ color:"rgba(255,255,255,.8)", fontSize:".83rem", marginTop:6 }}>
                    {r.category} · {r.sub_category}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            </div>

            <div className="p-4">
              {/* Stats row */}
              <Row className="g-3 mb-4">
                {[
                  { lbl:"Budget",   val: budgetLabel(r), icon:"💰" },
                  { lbl:"Deadline", val: r.deadline,      icon:"📅" },
                  { lbl:"Location", val: `${r.city}, ${r.state}`, icon:"📍" },
                  { lbl:"Quotes",   val: `${r.quotes} received`,  icon:"💬" },
                ].map(({ lbl, val, icon }) => (
                  <Col xs={6} md={3} key={lbl}>
                    <div style={{ background:"#f8f9ff", borderRadius:14, padding:"14px 16px", border:"1.5px solid #e8eaf6" }}>
                      <div style={{ fontSize:"1.2rem", marginBottom:4 }}>{icon}</div>
                      <div style={{ fontSize:".7rem", color:"#888", fontWeight:700, textTransform:"uppercase" }}>{lbl}</div>
                      <div style={{ fontSize:".88rem", fontWeight:900, color:"#1a1a2e" }}>{val}</div>
                    </div>
                  </Col>
                ))}
              </Row>

              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:".75rem", color:"#888", fontWeight:800, textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>Description</div>
                <div style={{ fontSize:".9rem", color:"#444", lineHeight:1.7, background:"#f8f9ff", borderRadius:14, padding:16, border:"1.5px solid #e8eaf6" }}>
                  {r.description}
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mb-4">
                <span style={{ padding:"5px 14px", borderRadius:20, background: urgClr[r.urgency]+"22", color: urgClr[r.urgency], fontWeight:800, fontSize:".76rem" }}>
                  {r.urgency === "ASAP" ? "🔴 ASAP" : r.urgency === "Urgent" ? "🟡 Urgent" : "🟢 Normal"}
                </span>
                <span style={{ fontSize:".76rem", color:"#888", fontWeight:700 }}>Posted on {r.created_at}</span>
              </div>

              <div className="d-flex gap-2">
                <button className="mr-btn">💬 View Quotes ({r.quotes})</button>
                {r.status !== "closed" && <button className="mr-btn-sm">✏️ Edit</button>}
                {r.status !== "closed" && <button className="mr-btn-sm" style={{ color:"#dc3545", borderColor:"#dc3545" }}>🗑️ Close</button>}
              </div>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#f1f4ff" }}>
      {/* ── Topbar ── */}
      <div className="mr-topbar">
        <div className="text-white fw-black" style={{ fontFamily:"Nunito", fontSize:"1.6rem" }}>🛍️ ShopEase</div>
        <div className="text-white fw-semibold" style={{ fontSize:".88rem", opacity:.85 }}>My Requirements</div>
        <button className="mr-btn" style={{ fontSize:".82rem", padding:"9px 18px" }}>➕ Post New Requirement</button>
      </div>

      <Container className="py-4" style={{ maxWidth:1100 }}>

        {/* ── Stats Row ── */}
        <Row className="g-3 mb-4 fu">
          {STATS.map(({ label, val, icon, color }) => (
            <Col xs={6} md={3} key={label}>
              <div className="mr-stat">
                <div style={{ fontSize:"1.8rem", marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:"1.6rem", fontWeight:900, color }}>{val}</div>
                <div style={{ fontSize:".76rem", color:"#888", fontWeight:700, marginTop:2 }}>{label}</div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── Filters + Search ── */}
        <div className="d-flex gap-3 align-items-center flex-wrap mb-4 fu" style={{ animationDelay:".05s" }}>
          <div style={{ position:"relative", flex:1, minWidth:220 }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:"1rem" }}>🔍</span>
            <input
              placeholder="Search requirements…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width:"100%", borderRadius:12, border:"2px solid #e8eaf6", padding:"10px 14px 10px 40px",
                fontFamily:"Nunito", fontSize:".88rem", outline:"none", transition:"border-color .2s",
              }}
              onFocus={e => e.target.style.borderColor="#ff6b35"}
              onBlur={e => e.target.style.borderColor="#e8eaf6"}
            />
          </div>
          <div className="d-flex gap-2">
            {["all","pending","active","closed"].map(f => (
              <button key={f} className={`mr-pill ${filter === f ? "on":""}`} onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Cards ── */}
        {filtered.length === 0 ? (
          <div className="mr-empty fu">
            <div style={{ fontSize:"3rem", marginBottom:12 }}>📭</div>
            <div className="fw-bold" style={{ fontSize:"1.1rem", color:"#555" }}>No requirements found</div>
            <div style={{ color:"#aaa", fontSize:".85rem", marginTop:4 }}>
              {search ? "Try a different search term" : "Post your first requirement to get quotes from sellers!"}
            </div>
            {!search && <button className="mr-btn mt-4">➕ Post Requirement</button>}
          </div>
        ) : (
          <Row className="g-3">
            {filtered.map((r, i) => (
              <Col xs={12} key={r.id} style={{ animationDelay: `${i*0.06}s` }}>
                <Card className="mr-card p-0 fu" style={{ cursor:"pointer" }} onClick={() => setSelected(r.id)}>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                      <div style={{ flex:1 }}>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                          <StatusBadge status={r.status} />
                          <span style={{ padding:"3px 10px", borderRadius:20, background:"#fff0e6", color:"#ff6b35", fontWeight:800, fontSize:".7rem" }}>
                            {r.category}
                          </span>
                          <span style={{ padding:"3px 10px", borderRadius:20, background: urgClr[r.urgency]+"22", color: urgClr[r.urgency], fontWeight:800, fontSize:".7rem" }}>
                            {r.urgency}
                          </span>
                        </div>
                        <div className="fw-black mb-1" style={{ fontSize:"1.05rem", color:"#1a1a2e" }}>{r.title}</div>
                        <div style={{ fontSize:".83rem", color:"#666", marginBottom:10 }}>
                          {r.description.slice(0,100)}…
                        </div>
                        <div className="d-flex gap-3 flex-wrap" style={{ fontSize:".78rem", fontWeight:700, color:"#555" }}>
                          <span>💰 {budgetLabel(r)}</span>
                          <span>📅 {r.deadline}</span>
                          <span>📍 {r.city}, {r.state}</span>
                          <span>💬 {r.quotes} quotes</span>
                        </div>
                      </div>
                      <div className="d-flex flex-column gap-2 align-items-end">
                        <button className="mr-btn" style={{ fontSize:".8rem", padding:"8px 16px" }} onClick={e => { e.stopPropagation(); setSelected(r.id); }}>
                          💬 View Quotes ({r.quotes})
                        </button>
                        <button className="mr-btn-sm" onClick={e => e.stopPropagation()}>✏️ Edit</button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}