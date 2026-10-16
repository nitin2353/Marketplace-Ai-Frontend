import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

const injectStyle = () => {
  if (document.getElementById("rl-style")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "rl-style";
  s.textContent = `
    body { font-family:'Nunito',sans-serif !important; background:#f1f4ff !important; margin:0; }
    :root { --p:#ff6b35; --p2:#f7931e; --border:#e8eaf6; }

    .rl-topbar { background:linear-gradient(145deg,#ff6b35 0%,#f7931e 55%,#ffcd3c 100%); padding:18px 32px; display:flex; align-items:center; justify-content:space-between; }
    .rl-sidebar { background:#fff; border-radius:20px; border:2px solid var(--border); padding:20px; position:sticky; top:20px; }
    .rl-card { border-radius:18px !important; border:2px solid var(--border) !important; background:#fff; transition:box-shadow .2s,transform .2s,border-color .2s !important; }
    .rl-card:hover { box-shadow:0 12px 32px rgba(255,107,53,.18) !important; transform:translateY(-3px) !important; border-color:var(--p) !important; cursor:pointer; }
    .rl-pill { padding:7px 15px; border-radius:30px; border:2px solid var(--border); background:#fff; font-weight:700; font-size:.78rem; cursor:pointer; transition:all .15s; color:#555; font-family:'Nunito',sans-serif; }
    .rl-pill:hover { border-color:var(--p); color:var(--p); }
    .rl-pill.on { background:linear-gradient(135deg,#ff6b35,#f7931e); color:#fff; border-color:transparent; }
    .rl-btn { background:linear-gradient(135deg,#ff6b35,#f7931e); border:none; border-radius:11px; font-weight:800; font-size:.83rem; padding:9px 18px; color:#fff; cursor:pointer; font-family:'Nunito',sans-serif; transition:transform .15s; }
    .rl-btn:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(255,107,53,.35); }
    .rl-btn-sm { border-radius:10px; font-weight:700; padding:7px 14px; border:2px solid var(--border); background:#fff; color:#555; font-family:'Nunito',sans-serif; cursor:pointer; font-size:.78rem; transition:all .15s; }
    .rl-btn-sm:hover { border-color:var(--p); color:var(--p); }
    .rl-input { border-radius:12px; border:2px solid var(--border); padding:10px 14px 10px 40px; font-family:'Nunito'; font-size:.88rem; outline:none; transition:border-color .2s; width:100%; }
    .rl-input:focus { border-color:var(--p); box-shadow:0 0 0 3px rgba(255,107,53,.12); }
    .rl-select { border-radius:12px; border:2px solid var(--border); padding:9px 14px; font-family:'Nunito'; font-size:.85rem; outline:none; width:100%; cursor:pointer; }
    .rl-select:focus { border-color:var(--p); }
    .rl-label { font-weight:800; color:#555; font-size:.73rem; text-transform:uppercase; letter-spacing:.06em; margin-bottom:6px; display:block; }
    .rl-page-btn { width:36px; height:36px; border-radius:10px; border:2px solid var(--border); background:#fff; font-weight:800; font-size:.82rem; cursor:pointer; transition:all .15s; font-family:'Nunito'; }
    .rl-page-btn:hover, .rl-page-btn.on { background:var(--p); color:#fff; border-color:transparent; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
    .fu { animation:fadeUp .3s ease both; }
  `;
  document.head.appendChild(s);
};
injectStyle();

const CATEGORIES = ["All","💍 Jewellery","📱 Electronics","👗 Fashion","🏠 Home","💄 Beauty","🏋️ Sports","🚗 Automotive","🛒 Food","🛠️ Services"];
const urgClr = { Normal:"#22c55e", Urgent:"#f7931e", ASAP:"#dc3545" };
const fmt = n => n ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

const MOCK = [
  { id:"r1", title:"Custom 22KT Gold Necklace - Kundan Work", category:"💍 Jewellery", budget_type:"Range", min_budget:25000, max_budget:35000, deadline:"2026-04-15", urgency:"Urgent", city:"Mumbai", state:"Maharashtra", description:"Traditional Kundan necklace for wedding ceremony. Heavy work, matching earrings needed.", quotes:4, created_at:"2026-03-20" },
  { id:"r2", title:"iPhone 15 Pro Max 256GB Natural Titanium Sealed", category:"📱 Electronics", budget_type:"Fixed", min_budget:84999, max_budget:84999, deadline:"2026-04-10", urgency:"Normal", city:"Delhi", state:"Delhi", description:"Genuine Apple product with original invoice. Best market price please.", quotes:7, created_at:"2026-03-22" },
  { id:"r3", title:"Bridal Lehenga Custom Stitch - Rani Pink Heavy Embroidery", category:"👗 Fashion", budget_type:"Range", min_budget:12000, max_budget:18000, deadline:"2026-05-20", urgency:"ASAP", city:"Jaipur", state:"Rajasthan", description:"Heavy embroidery gold zari border, 3-week delivery needed. Measurement will be shared.", quotes:2, created_at:"2026-03-18" },
  { id:"r4", title:"Ergonomic Office Chair with Lumbar Support", category:"🏠 Home", budget_type:"Range", min_budget:8000, max_budget:15000, deadline:"2026-04-01", urgency:"Normal", city:"Pune", state:"Maharashtra", description:"Work from home setup upgrade. Need mesh back, adjustable armrests.", quotes:6, created_at:"2026-03-10" },
  { id:"r5", title:"Organic Spices Bulk Wholesale 50kg Pack", category:"🛒 Food", budget_type:"Flexible", min_budget:0, max_budget:0, deadline:"2026-04-25", urgency:"Normal", city:"Ahmedabad", state:"Gujarat", description:"Turmeric, coriander, cumin - food grade certified. Monthly supply contract preferred.", quotes:3, created_at:"2026-03-21" },
  { id:"r6", title:"Wedding Photography + Videography Package", category:"🛠️ Services", budget_type:"Range", min_budget:50000, max_budget:80000, deadline:"2026-06-10", urgency:"Urgent", city:"Hyderabad", state:"Telangana", description:"2-day wedding event. Candid photography + cinematic video. Portfolio required.", quotes:9, created_at:"2026-03-19" },
];

const PER_PAGE = 4;

export default function RequirementListing() {
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");
  const [urgency, setUrgency]     = useState("All");
  const [sortBy, setSortBy]       = useState("newest");
  const [page, setPage]           = useState(1);
  const [quoteModal, setQModal]   = useState(null);
  const [quoteSent, setQSent]     = useState([]);

  const filtered = MOCK
    .filter(r => {
      const ms = r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
      const mc = category === "All" || r.category === category;
      const mu = urgency === "All" || r.urgency === urgency;
      return ms && mc && mu;
    })
    .sort((a,b) => {
      if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "budget_hi") return (b.max_budget||b.min_budget) - (a.max_budget||a.min_budget);
      if (sortBy === "budget_lo") return (a.min_budget) - (b.min_budget);
      if (sortBy === "deadline") return new Date(a.deadline) - new Date(b.deadline);
      if (sortBy === "quotes") return b.quotes - a.quotes;
      return 0;
    });

  const total   = filtered.length;
  const pages   = Math.ceil(total / PER_PAGE);
  const paged   = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);

  const budgetLabel = (r) => {
    if (r.budget_type === "Flexible") return "🤝 Flexible";
    if (r.budget_type === "Fixed")    return fmt(r.min_budget);
    return `${fmt(r.min_budget)} – ${fmt(r.max_budget)}`;
  };

  const sendQuote = (id) => { setQSent(p => [...p, id]); setQModal(null); };

  return (
    <div style={{ minHeight:"100vh", background:"#f1f4ff" }}>

      {/* ── Topbar ── */}
      <div className="rl-topbar">
        <div className="text-white fw-black" style={{ fontFamily:"Nunito", fontSize:"1.6rem" }}>🛍️ ShopEase</div>
        <div className="text-white fw-semibold" style={{ opacity:.85, fontSize:".88rem" }}>Seller Dashboard · Browse Requirements</div>
        <div style={{ background:"rgba(255,255,255,.2)", borderRadius:12, padding:"7px 16px", color:"#fff", fontWeight:800, fontSize:".82rem" }}>
          👋 Welcome, Seller
        </div>
      </div>

      <Container fluid className="py-4 px-3 px-md-4" style={{ maxWidth:1200 }}>
        <Row className="g-4">

          {/* ══ SIDEBAR ══ */}
          <Col lg={3}>
            <div className="rl-sidebar fu">
              <div style={{ fontWeight:900, fontSize:"1rem", color:"#1a1a2e", marginBottom:16 }}>🔍 Filter Requirements</div>

              {/* Search */}
              <div className="mb-4">
                <label className="rl-label">Search</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)" }}>🔍</span>
                  <input className="rl-input" placeholder="Search requirements…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="rl-label">Category</label>
                <div className="d-flex flex-column gap-1">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => { setCategory(c); setPage(1); }}
                      style={{ textAlign:"left", padding:"8px 12px", borderRadius:10, border:"none", background: category===c ? "#fff0e6" : "transparent", color: category===c ? "#ff6b35" : "#555", fontWeight: category===c ? 800 : 600, fontSize:".84rem", cursor:"pointer", fontFamily:"Nunito", transition:"all .15s" }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div className="mb-4">
                <label className="rl-label">Urgency</label>
                <div className="d-flex flex-column gap-1">
                  {["All","Normal","Urgent","ASAP"].map(u => (
                    <button key={u} onClick={() => { setUrgency(u); setPage(1); }}
                      style={{ textAlign:"left", padding:"8px 12px", borderRadius:10, border:"none", background: urgency===u ? "#fff0e6" : "transparent", color: urgency===u ? "#ff6b35" : "#555", fontWeight: urgency===u ? 800 : 600, fontSize:".84rem", cursor:"pointer", fontFamily:"Nunito", transition:"all .15s" }}>
                      {u === "ASAP" ? "🔴 ASAP" : u === "Urgent" ? "🟡 Urgent" : u === "Normal" ? "🟢 Normal" : "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div style={{ background:"linear-gradient(135deg,#fff0e6,#fff8e6)", borderRadius:14, padding:"14px 16px", border:"1.5px solid #ffddc9" }}>
                <div style={{ fontSize:".72rem", color:"#92400e", fontWeight:800, textTransform:"uppercase", marginBottom:8 }}>📊 Overview</div>
                {[["Total Active",MOCK.length],["Matching",total],["Quotes Sent",quoteSent.length]].map(([l,v]) => (
                  <div key={l} className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontSize:".8rem", color:"#555", fontWeight:700 }}>{l}</span>
                    <span style={{ fontSize:".88rem", color:"#ff6b35", fontWeight:900 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* ══ MAIN LISTING ══ */}
          <Col lg={9}>
            {/* Sort + Count */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2 fu">
              <div style={{ fontWeight:700, color:"#888", fontSize:".85rem" }}>
                Showing <strong style={{ color:"#ff6b35" }}>{total}</strong> requirements
                {category !== "All" && <span> in <strong style={{ color:"#ff6b35" }}>{category}</strong></span>}
              </div>
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize:".8rem", color:"#888", fontWeight:700 }}>Sort by:</span>
                <select className="rl-select" style={{ width:"auto", padding:"7px 12px" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="budget_hi">Budget: High to Low</option>
                  <option value="budget_lo">Budget: Low to High</option>
                  <option value="deadline">Deadline: Soonest</option>
                  <option value="quotes">Most Quoted</option>
                </select>
              </div>
            </div>

            {/* Cards */}
            {paged.length === 0 ? (
              <div style={{ borderRadius:20, border:"2.5px dashed #e0e4f0", padding:"56px 20px", textAlign:"center" }} className="fu">
                <div style={{ fontSize:"3rem", marginBottom:12 }}>🔍</div>
                <div className="fw-bold" style={{ fontSize:"1.1rem", color:"#555" }}>No matching requirements</div>
                <div style={{ color:"#aaa", fontSize:".85rem", marginTop:4 }}>Try adjusting your filters</div>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {paged.map((r, i) => (
                  <Card key={r.id} className="rl-card p-0 fu" style={{ animationDelay:`${i*.07}s` }}>
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div style={{ flex:1 }}>
                          {/* Badges */}
                          <div className="d-flex gap-2 flex-wrap mb-2">
                            <span style={{ padding:"3px 10px", borderRadius:20, background:"#fff0e6", color:"#ff6b35", fontWeight:800, fontSize:".7rem" }}>{r.category}</span>
                            <span style={{ padding:"3px 10px", borderRadius:20, background: urgClr[r.urgency]+"22", color: urgClr[r.urgency], fontWeight:800, fontSize:".7rem" }}>
                              {r.urgency === "ASAP" ? "🔴 ASAP" : r.urgency === "Urgent" ? "🟡 Urgent" : "🟢 Normal"}
                            </span>
                            {quoteSent.includes(r.id) && (
                              <span style={{ padding:"3px 10px", borderRadius:20, background:"#dcfce7", color:"#166534", fontWeight:800, fontSize:".7rem" }}>✅ Quote Sent</span>
                            )}
                          </div>

                          {/* Title */}
                          <div className="fw-black mb-1" style={{ fontSize:"1.05rem", color:"#1a1a2e", lineHeight:1.3 }}>{r.title}</div>

                          {/* Desc */}
                          <div style={{ fontSize:".83rem", color:"#666", marginBottom:12, lineHeight:1.55 }}>
                            {r.description.slice(0,110)}…
                          </div>

                          {/* Meta */}
                          <div className="d-flex gap-3 flex-wrap" style={{ fontSize:".78rem", fontWeight:700, color:"#555" }}>
                            <span>💰 {budgetLabel(r)}</span>
                            <span>📅 {r.deadline}</span>
                            <span>📍 {r.city}, {r.state}</span>
                            <span>💬 {r.quotes} quotes</span>
                            <span>🕐 {r.created_at}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex flex-column gap-2 align-items-end">
                          {!quoteSent.includes(r.id) ? (
                            <button className="rl-btn" onClick={() => setQModal(r)}>
                              📤 Send Quote
                            </button>
                          ) : (
                            <button className="rl-btn" style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)", cursor:"default" }}>
                              ✅ Quote Sent
                            </button>
                          )}
                          <button className="rl-btn-sm">👁️ View Details</button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-4 fu">
                <button className="rl-page-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹</button>
                {Array.from({ length:pages },(_,i) => i+1).map(p => (
                  <button key={p} className={`rl-page-btn ${page===p?"on":""}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="rl-page-btn" disabled={page===pages} onClick={() => setPage(p=>p+1)}>›</button>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* ── Quote Modal ── */}
      {quoteModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div className="fu" style={{ background:"#fff", borderRadius:24, padding:32, maxWidth:480, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,.25)" }}>
            <div className="fw-black mb-1" style={{ fontSize:"1.2rem", color:"#1a1a2e" }}>📤 Send Quote</div>
            <div style={{ fontSize:".82rem", color:"#888", marginBottom:20 }}>
              Responding to: <strong style={{ color:"#ff6b35" }}>{quoteModal.title}</strong>
            </div>

            <div className="mb-3">
              <label className="rl-label">Your Quote Amount (₹) *</label>
              <input style={{ width:"100%", borderRadius:12, border:"2px solid #e8eaf6", padding:"11px 15px", fontFamily:"Nunito", fontSize:".93rem", outline:"none" }}
                placeholder="Enter your best price" type="number" />
            </div>
            <div className="mb-3">
              <label className="rl-label">Delivery Timeline *</label>
              <input style={{ width:"100%", borderRadius:12, border:"2px solid #e8eaf6", padding:"11px 15px", fontFamily:"Nunito", fontSize:".93rem", outline:"none" }}
                placeholder="e.g. 7-10 business days" />
            </div>
            <div className="mb-4">
              <label className="rl-label">Message to Buyer</label>
              <textarea rows={3} style={{ width:"100%", borderRadius:12, border:"2px solid #e8eaf6", padding:"11px 15px", fontFamily:"Nunito", fontSize:".88rem", outline:"none", resize:"vertical" }}
                placeholder="Introduce yourself, your experience, why you're the best choice…" />
            </div>

            <div className="d-flex gap-2">
              <button className="rl-btn" style={{ flex:1 }} onClick={() => sendQuote(quoteModal.id)}>🚀 Submit Quote</button>
              <button className="rl-btn-sm" onClick={() => setQModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}