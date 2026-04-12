import React, { useRef, useState } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Toolbar from "../../components/Toolbar";
import "./Requirement.css";

/* ── Constants ────────────────────────────────────────────────────────────── */
const PRESET_COLORS = [
  { hex: "#1a1a1a", label: "Jet Black" },
  { hex: "#f5f5f5", label: "Pearl White" },
  { hex: "#ec4899", label: "Rose Pink" },
  { hex: "#a855f7", label: "Lavender" },
  { hex: "#ef4444", label: "Crimson" },
  { hex: "#3b82f6", label: "Royal Blue" },
  { hex: "#22c55e", label: "Emerald" },
  { hex: "#f59e0b", label: "Amber" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "Custom"];

const MATERIAL_OPTIONS = [
  "Cotton", "Silk", "Polyester", "Linen", "Wool",
  "Jute", "Leather", "Bamboo", "Recycled Fabric",
];

const FINISH_OPTIONS = ["Matte", "Glossy", "Satin", "Textured", "Embossed", "Metallic"];

const STEPS = [
  { id: 1, name: "Basic Info",   sub: "Product & quantity"  },
  { id: 2, name: "Design",       sub: "Color & size"        },
  { id: 3, name: "Details",      sub: "Material & finish"   },
  { id: 4, name: "Review",       sub: "Confirm & submit"    },
];

/* ── Small helper components ──────────────────────────────────────────────── */
const FieldLabel = ({ children }) => (
  <div className="rq-label">{children}</div>
);

const Divider = () => <div className="rq-divider" />;

/* ══════════════════════════════════════════════════════════════════════════ */
export default function RequirementPage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const product    = location.state?.product || null;   // passed from product page

  const [cart, setCart]       = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [sidebar, setSidebar] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef();

  const addToast = (msg) => toast.success(msg);

  /* ── Step State ── */
  const [currentStep, setCurrentStep] = useState(1);

  /* ── Form State ── */
  const [form, setForm] = useState({
    // Step 1 – Basic
    productName:  product?.title || "",
    quantity:     1,
    deadline:     "",
    priority:     "medium",
    budgetMin:    500,
    budgetMax:    5000,

    // Step 2 – Design
    selectedColors:  [],
    customColor:     "",
    selectedSizes:   [],
    customSize:      "",

    // Step 3 – Details
    selectedMaterials: [],
    selectedFinish:    "",
    engravingText:     "",
    specialTags:       [],
    tagInput:          "",
    notes:             "",
    referenceImages:   [],
  });

  const [validated, setValidated] = useState(false);

  /* ── Patch helper ── */
  const patch = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  /* ── Quantity ── */
  const changeQty = (delta) => {
    patch("quantity", Math.max(1, Math.min(999, form.quantity + delta)));
  };

  /* ── Color toggle ── */
  const toggleColor = (hex) => {
    setForm(prev => ({
      ...prev,
      selectedColors: prev.selectedColors.includes(hex)
        ? prev.selectedColors.filter(c => c !== hex)
        : [...prev.selectedColors, hex],
    }));
  };

  /* ── Chip toggle (multi) ── */
  const toggleChip = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  /* ── Single-select chip ── */
  const selectChip = (key, value) => {
    patch(key, form[key] === value ? "" : value);
  };

  /* ── Tags ── */
  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && form.tagInput.trim()) {
      e.preventDefault();
      const tag = form.tagInput.trim().replace(/,/g, "");
      if (!form.specialTags.includes(tag) && form.specialTags.length < 10) {
        patch("specialTags", [...form.specialTags, tag]);
      }
      patch("tagInput", "");
    }
  };

  const removeTag = (tag) => {
    patch("specialTags", form.specialTags.filter(t => t !== tag));
  };

  /* ── Image upload ── */
  const fileInputRef = useRef();
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    patch("referenceImages", [...form.referenceImages, ...newPreviews].slice(0, 6));
  };

  const removeImage = (id) => {
    patch("referenceImages", form.referenceImages.filter(img => img.id !== id));
  };

  /* ── Drag & drop ── */
  const [dragover, setDragover] = useState(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    const newPreviews = files.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    patch("referenceImages", [...form.referenceImages, ...newPreviews].slice(0, 6));
  };

  /* ── Step Validation ── */
  const validateStep = (step) => {
    if (step === 1) {
      if (!form.productName.trim()) { toast.error("Product name is required"); return false; }
      if (!form.deadline)            { toast.error("Please select a deadline");  return false; }
    }
    if (step === 2) {
      if (form.selectedColors.length === 0 && !form.customColor) {
        toast.error("Please select at least one colour");
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(s => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    setCurrentStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      // Replace with your actual API call
      // await requirementApi.submitRequirement(form);
      await new Promise(r => setTimeout(r, 1000));
      toast.success("Requirements submitted successfully! 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Budget display ── */
  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  /* ── Min deadline (tomorrow) ── */
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  /* ── Notes char count ── */
  const notesLen = form.notes.length;
  const notesClass = notesLen > 450 ? "danger" : notesLen > 380 ? "warn" : "";

  /* ══════════════════════════════════════════════════════ */
  return (
    <div className="rq-page">
      <Toolbar
        searchRef={searchRef}
        cart={cart}
        wishlist={wishlist}
        setSidebar={setSidebar}
        addToast={addToast}
        isSideBar={false}
        isSearch={false}
      />

      {/* ── Page Header ── */}
      <div className="rq-header">
        <Container>
          <div className="rq-header-inner">
            <div className="rq-header-badge">✨ Customization Request</div>
            <h1 className="rq-header-title">Tell Us What You Need</h1>
            <p className="rq-header-sub">Fill in your requirements and we'll craft the perfect product for you</p>
          </div>
        </Container>
      </div>

      <Container className="py-4">

        {/* ── Step Indicator ── */}
        <div className="rq-steps mb-4">
          {STEPS.map(step => (
            <div
              key={step.id}
              className={`rq-step ${currentStep === step.id ? "active" : ""} ${currentStep > step.id ? "done" : ""}`}
            >
              <div className="rq-step-dot">
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <div className="rq-step-label">
                <span className="rq-step-name">{step.name}</span>
                <span className="rq-step-sub">{step.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="g-4">

            {/* ── LEFT: Form Steps ── */}
            <Col lg={8}>

              {/* ════════ STEP 1 — BASIC INFO ════════ */}
              {currentStep === 1 && (
                <div className="rq-card">
                  <div className="rq-card-title">📦 Basic Information</div>
                  <div className="rq-card-sub">Tell us which product you want customised and basic order details</div>

                  <Row className="g-3">

                    {/* Product Name */}
                    <Col md={12}>
                      <Form.Group controlId="productName">
                        <FieldLabel>Product Name *</FieldLabel>
                        <Form.Control
                          required
                          type="text"
                          className="rq-control"
                          placeholder="e.g. Morpankh Wall Art, Custom Tote Bag"
                          value={form.productName}
                          onChange={e => patch("productName", e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                          Product name is required.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Quantity */}
                    <Col md={6}>
                      <FieldLabel>Quantity *</FieldLabel>
                      <div className="rq-qty-control">
                        <button type="button" className="rq-qty-btn" disabled={form.quantity <= 1} onClick={() => changeQty(-1)}>−</button>
                        <span className="rq-qty-value">{form.quantity}</span>
                        <button type="button" className="rq-qty-btn" disabled={form.quantity >= 999} onClick={() => changeQty(1)}>+</button>
                      </div>
                    </Col>

                    {/* Deadline */}
                    <Col md={6}>
                      <Form.Group controlId="deadline">
                        <FieldLabel>Required By (Deadline) *</FieldLabel>
                        <Form.Control
                          required
                          type="date"
                          className="rq-control"
                          min={minDate}
                          value={form.deadline}
                          onChange={e => patch("deadline", e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please select a delivery deadline.
                        </Form.Control.Feedback>
                        <div className="rq-date-hint">📅 Earliest possible: {tomorrow.toLocaleDateString("en-IN")}</div>
                      </Form.Group>
                    </Col>

                    {/* Priority */}
                    <Col md={12}>
                      <FieldLabel>Priority Level</FieldLabel>
                      <div className="rq-priority-group">
                        {[
                          { value: "low",    icon: "🟢", label: "Low",    desc: "Flexible timeline" },
                          { value: "medium", icon: "🟡", label: "Medium", desc: "Standard urgency"   },
                          { value: "high",   icon: "🔴", label: "High",   desc: "Urgent order"       },
                        ].map(p => (
                          <button
                            key={p.value}
                            type="button"
                            className={`rq-priority-btn ${form.priority === p.value ? `active-${p.value}` : ""}`}
                            onClick={() => patch("priority", p.value)}
                          >
                            <span className="rq-priority-icon">{p.icon}</span>
                            <span>{p.label}</span>
                            <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>{p.desc}</span>
                          </button>
                        ))}
                      </div>
                    </Col>

                    {/* Budget Range */}
                    <Col md={12}>
                      <FieldLabel>Budget Range (per unit)</FieldLabel>
                      <div className="rq-budget-display mb-3">
                        {fmt(form.budgetMin)} — {fmt(form.budgetMax)}
                      </div>
                      <Row className="g-2">
                        <Col sm={6}>
                          <Form.Label className="rq-label">Min Budget</Form.Label>
                          <input
                            type="range"
                            className="rq-range-slider"
                            min={100}
                            max={form.budgetMax - 100}
                            step={100}
                            value={form.budgetMin}
                            onChange={e => patch("budgetMin", Number(e.target.value))}
                          />
                          <div className="rq-date-hint">₹100 — {fmt(form.budgetMax - 100)}</div>
                        </Col>
                        <Col sm={6}>
                          <Form.Label className="rq-label">Max Budget</Form.Label>
                          <input
                            type="range"
                            className="rq-range-slider"
                            min={form.budgetMin + 100}
                            max={100000}
                            step={100}
                            value={form.budgetMax}
                            onChange={e => patch("budgetMax", Number(e.target.value))}
                          />
                          <div className="rq-date-hint">{fmt(form.budgetMin + 100)} — ₹1,00,000</div>
                        </Col>
                      </Row>
                    </Col>

                  </Row>
                </div>
              )}

              {/* ════════ STEP 2 — DESIGN ════════ */}
              {currentStep === 2 && (
                <div className="rq-card">
                  <div className="rq-card-title">🎨 Design Preferences</div>
                  <div className="rq-card-sub">Choose your colours, sizes and visual style</div>

                  {/* Colors */}
                  <FieldLabel>Preferred Colours * (select all that apply)</FieldLabel>
                  <div className="rq-color-grid mb-3">
                    {PRESET_COLORS.map(c => (
                      <div
                        key={c.hex}
                        className={`rq-color-swatch ${form.selectedColors.includes(c.hex) ? "selected" : ""}`}
                        style={{ background: c.hex }}
                        title={c.label}
                        onClick={() => toggleColor(c.hex)}
                      />
                    ))}

                    {/* Custom colour picker */}
                    <div className="rq-color-custom" title="Pick custom colour"
                      onClick={() => fileInputRef.current?.click()}>
                      {form.customColor
                        ? <div style={{ width: "100%", height: "100%", background: form.customColor, borderRadius: "50%" }} />
                        : "＋"
                      }
                      <input
                        type="color"
                        ref={fileInputRef}
                        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
                        onChange={e => {
                          patch("customColor", e.target.value);
                          if (!form.selectedColors.includes(e.target.value)) {
                            patch("selectedColors", [...form.selectedColors, e.target.value]);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {form.selectedColors.length === 0 && (
                    <div className="rq-feedback-invalid">⚠ Please select at least one colour</div>
                  )}

                  <Divider />

                  {/* Sizes */}
                  <FieldLabel>Size / Dimensions</FieldLabel>
                  <div className="rq-chips mb-3">
                    {SIZE_OPTIONS.map(s => (
                      <div
                        key={s}
                        className={`rq-chip ${form.selectedSizes.includes(s) ? "active" : ""}`}
                        onClick={() => toggleChip("selectedSizes", s)}
                      >{s}</div>
                    ))}
                  </div>

                  {form.selectedSizes.includes("Custom") && (
                    <Form.Group controlId="customSize" className="mt-2">
                      <Form.Control
                        type="text"
                        className="rq-control"
                        placeholder="e.g. 30cm × 45cm, A4, King size..."
                        value={form.customSize}
                        onChange={e => patch("customSize", e.target.value)}
                      />
                    </Form.Group>
                  )}

                  <Divider />

                  {/* Reference Images */}
                  <FieldLabel>Reference Images (optional, max 6)</FieldLabel>
                  <div
                    className={`rq-upload-zone ${dragover ? "dragover" : ""}`}
                    onDragOver={e => { e.preventDefault(); setDragover(true); }}
                    onDragLeave={() => setDragover(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("rq-file-input").click()}
                  >
                    <div className="rq-upload-icon">🖼️</div>
                    <div className="rq-upload-title">Drag & drop images here</div>
                    <div className="rq-upload-hint">
                      or <span className="rq-upload-browse">browse files</span> — PNG, JPG, WEBP up to 5 MB each
                    </div>
                    <input
                      id="rq-file-input"
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                  </div>

                  {form.referenceImages.length > 0 && (
                    <div className="rq-preview-grid">
                      {form.referenceImages.map(img => (
                        <div key={img.id} className="rq-preview-item">
                          <img src={img.url} alt={img.name} />
                          <button className="rq-preview-remove" type="button" onClick={() => removeImage(img.id)}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ════════ STEP 3 — DETAILS ════════ */}
              {currentStep === 3 && (
                <div className="rq-card">
                  <div className="rq-card-title">🔧 Product Details</div>
                  <div className="rq-card-sub">Specify materials, finish, and any custom text or extras</div>

                  {/* Material */}
                  <FieldLabel>Material Preference (select all that apply)</FieldLabel>
                  <div className="rq-chips mb-3">
                    {MATERIAL_OPTIONS.map(m => (
                      <div
                        key={m}
                        className={`rq-chip ${form.selectedMaterials.includes(m) ? "active" : ""}`}
                        onClick={() => toggleChip("selectedMaterials", m)}
                      >{m}</div>
                    ))}
                  </div>

                  <Divider />

                  {/* Finish */}
                  <FieldLabel>Surface Finish</FieldLabel>
                  <div className="rq-chips mb-3">
                    {FINISH_OPTIONS.map(f => (
                      <div
                        key={f}
                        className={`rq-chip ${form.selectedFinish === f ? "active" : ""}`}
                        onClick={() => selectChip("selectedFinish", f)}
                      >{f}</div>
                    ))}
                  </div>

                  <Divider />

                  {/* Engraving / Print Text */}
                  <Form.Group controlId="engravingText" className="mb-3">
                    <FieldLabel>Engraving / Print Text (if any)</FieldLabel>
                    <Form.Control
                      type="text"
                      className="rq-control"
                      placeholder="e.g. Your Name, Company Logo, Quote..."
                      maxLength={80}
                      value={form.engravingText}
                      onChange={e => patch("engravingText", e.target.value)}
                    />
                  </Form.Group>

                  <Divider />

                  {/* Special Tags */}
                  <Form.Group className="mb-3">
                    <FieldLabel>Special Keywords / Tags (press Enter to add)</FieldLabel>
                    <div className="rq-tag-wrap">
                      {form.specialTags.map(tag => (
                        <span key={tag} className="rq-tag">
                          {tag}
                          <button type="button" className="rq-tag-remove" onClick={() => removeTag(tag)}>✕</button>
                        </span>
                      ))}
                      <input
                        className="rq-tag-input"
                        placeholder={form.specialTags.length === 0 ? "e.g. eco-friendly, handmade, festive..." : ""}
                        value={form.tagInput}
                        onChange={e => patch("tagInput", e.target.value)}
                        onKeyDown={addTag}
                        disabled={form.specialTags.length >= 10}
                      />
                    </div>
                    {form.specialTags.length >= 10 && (
                      <div className="rq-feedback-invalid">⚠ Maximum 10 tags allowed</div>
                    )}
                  </Form.Group>

                  <Divider />

                  {/* Additional Notes */}
                  <Form.Group controlId="notes">
                    <FieldLabel>Additional Notes / Special Instructions</FieldLabel>
                    <Form.Control
                      as="textarea"
                      className={`rq-control rq-textarea`}
                      rows={4}
                      placeholder="Describe anything else you need — packaging preferences, occasion, gifting details, assembly instructions, etc."
                      maxLength={500}
                      value={form.notes}
                      onChange={e => patch("notes", e.target.value)}
                    />
                    <div className={`rq-char-count ${notesClass}`}>{notesLen}/500</div>
                  </Form.Group>
                </div>
              )}

              {/* ════════ STEP 4 — REVIEW ════════ */}
              {currentStep === 4 && (
                <div className="rq-card">
                  <div className="rq-card-title">✅ Review Your Requirements</div>
                  <div className="rq-card-sub">Confirm everything looks right before submitting</div>

                  {[
                    {
                      section: "📦 Basic Info",
                      rows: [
                        { key: "Product",   val: form.productName },
                        { key: "Quantity",  val: `${form.quantity} unit${form.quantity > 1 ? "s" : ""}` },
                        { key: "Deadline",  val: form.deadline ? new Date(form.deadline).toLocaleDateString("en-IN") : "—" },
                        { key: "Priority",  val: form.priority.charAt(0).toUpperCase() + form.priority.slice(1) },
                        { key: "Budget",    val: `${fmt(form.budgetMin)} — ${fmt(form.budgetMax)}` },
                      ],
                    },
                    {
                      section: "🎨 Design",
                      rows: [
                        { key: "Colours",   val: form.selectedColors.length > 0 ? `${form.selectedColors.length} selected` : "—" },
                        { key: "Sizes",     val: form.selectedSizes.join(", ") || "—" },
                        { key: "Images",    val: form.referenceImages.length > 0 ? `${form.referenceImages.length} uploaded` : "None" },
                      ],
                    },
                    {
                      section: "🔧 Details",
                      rows: [
                        { key: "Material",  val: form.selectedMaterials.join(", ") || "—" },
                        { key: "Finish",    val: form.selectedFinish || "—" },
                        { key: "Text",      val: form.engravingText || "—" },
                        { key: "Tags",      val: form.specialTags.join(", ") || "—" },
                        { key: "Notes",     val: form.notes ? form.notes.slice(0, 60) + (form.notes.length > 60 ? "…" : "") : "—" },
                      ],
                    },
                  ].map(group => (
                    <div key={group.section} className="mb-4">
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", fontWeight: 800, color: "var(--text)", marginBottom: 10 }}>
                        {group.section}
                      </div>
                      <div style={{ border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                        {group.rows.map((row, i) => (
                          <div
                            key={row.key}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "10px 16px",
                              background: i % 2 === 0 ? "#fafbff" : "#fff",
                              borderBottom: i < group.rows.length - 1 ? "1px solid var(--border)" : "none",
                              gap: 12,
                            }}
                          >
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", flexShrink: 0 }}>{row.key}</span>
                            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text)", textAlign: "right" }}>{row.val}</span>
                          </div>
                        ))}
                      </div>
                      {group.section !== "🔧 Details" && <Divider />}
                    </div>
                  ))}

                  {/* Color preview row */}
                  {form.selectedColors.length > 0 && (
                    <div className="mt-2">
                      <FieldLabel>Selected Colours</FieldLabel>
                      <div className="rq-color-grid">
                        {form.selectedColors.map(c => (
                          <div key={c} className="rq-color-swatch selected" style={{ background: c }} title={c} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step Navigation Buttons ── */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  type="button"
                  className="rq-btn-outline"
                  style={{ width: "auto", padding: "11px 28px" }}
                  onClick={currentStep === 1 ? () => navigate(-1) : goPrev}
                >
                  ← {currentStep === 1 ? "Back" : "Previous"}
                </button>

                {currentStep < 4 ? (
                  <button type="button" className="rq-btn-submit" style={{ width: "auto", padding: "11px 32px" }} onClick={goNext}>
                    Next Step →
                  </button>
                ) : (
                  <button type="submit" className="rq-btn-submit" style={{ width: "auto", padding: "11px 32px" }} disabled={loading}>
                    {loading ? "⏳ Submitting..." : "🚀 Submit Requirements"}
                  </button>
                )}
              </div>
            </Col>

            {/* ── RIGHT: Summary Sidebar ── */}
            <Col lg={4}>
              <div className="rq-summary">
                <div className="rq-summary-title">📋 Order Summary</div>

                {/* Product card */}
                <div className="rq-summary-product">
                  {product?.image_url
                    ? <img src={Array.isArray(product.image_url) ? product.image_url[0] : product.image_url} alt={product.title} className="rq-summary-img" />
                    : <div className="rq-summary-img-placeholder">🎁</div>
                  }
                  <div>
                    <div className="rq-summary-name">{form.productName || "Custom Product"}</div>
                    <div className="rq-summary-price">
                      {form.budgetMin && form.budgetMax ? `${fmt(form.budgetMin)} — ${fmt(form.budgetMax)}` : "Budget TBD"}
                    </div>
                  </div>
                </div>

                {/* Live summary rows */}
                {[
                  { key: "Quantity",  val: `${form.quantity} unit${form.quantity > 1 ? "s" : ""}` },
                  { key: "Deadline",  val: form.deadline ? new Date(form.deadline).toLocaleDateString("en-IN") : null },
                  { key: "Priority",  val: form.priority ? form.priority.charAt(0).toUpperCase() + form.priority.slice(1) : null },
                  { key: "Colours",   val: form.selectedColors.length > 0 ? `${form.selectedColors.length} selected` : null },
                  { key: "Sizes",     val: form.selectedSizes.length > 0 ? form.selectedSizes.join(", ") : null },
                  { key: "Material",  val: form.selectedMaterials.length > 0 ? form.selectedMaterials.slice(0, 2).join(", ") + (form.selectedMaterials.length > 2 ? "…" : "") : null },
                  { key: "Finish",    val: form.selectedFinish || null },
                  { key: "Ref Images",val: form.referenceImages.length > 0 ? `${form.referenceImages.length} file${form.referenceImages.length > 1 ? "s" : ""}` : null },
                ].map(({ key, val }) => (
                  <div key={key} className="rq-summary-row">
                    <span className="rq-summary-key">{key}</span>
                    <span className={val ? "rq-summary-val" : "rq-summary-empty"}>
                      {val || "Not set yet"}
                    </span>
                  </div>
                ))}

                {/* Step progress */}
                <div style={{ margin: "16px 0 4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted)", marginBottom: 6 }}>
                    <span>Step {currentStep} of {STEPS.length}</span>
                    <span>{Math.round((currentStep / STEPS.length) * 100)}% complete</span>
                  </div>
                  <div style={{ height: 6, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(currentStep / STEPS.length) * 100}%`,
                      background: "var(--p-grad)",
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>

                {/* Trust badges */}
                <div className="rq-trust">
                  {[
                    { icon: "🔒", text: "100% Secure Submission" },
                    { icon: "🎯", text: "Personalised Crafting" },
                    { icon: "✅", text: "Quality Guaranteed" },
                    { icon: "↩️", text: "Revision Requests Accepted" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="rq-trust-item">
                      <span>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

          </Row>
        </Form>
      </Container>
    </div>
  );
}