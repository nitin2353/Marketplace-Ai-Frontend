import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, InputGroup, Badge, Stack, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import productApi from "../../api/product.api";
import toast from "react-hot-toast";
import "./CreateProduct.css";
import SellerSidebar from "../../components/SellerSidebar";
import SellerNavbar from "../../components/SellerNavbar";

// ── Constants ─────────────────────────────────────────────────────────────────
const PRESET_TAGS = ["New Arrival", "Trending", "Best Seller", "Limited Edition", "Eco Friendly", "Premium", "Sale"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "6", "7", "8", "9", "10", "11", "12"];
const SIDEBAR_W = 280;

const DEFAULT_VARIANT = { color: "#000000", size: "", final_price: "", old_price: "", stock: "" };

// ── Helpers ───────────────────────────────────────────────────────────────────
const autoDiscount = (selling, mrp) => {
    const s = Number(selling), m = Number(mrp);
    return s > 0 && m > s ? Math.round(((m - s) / m) * 100) : null;
};

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionTitle({ icon, children }) {
    return <div className="cp-section-title">{icon} {children}</div>;
}

function Field({ label, error, children }) {
    return (
        <div>
            <label className="cp-label">{label}</label>
            {children}
            {error && <p className="cp-error">{error}</p>}
        </div>
    );
}

function Toggle({ label, value, onChange }) {
    return (
        <div className="d-flex gap-2 align-items-center">
            <button type="button" className={`cp-toggle ${value ? "on" : ""}`} onClick={() => onChange(true)}>✅ Yes</button>
            <button type="button" className={`cp-toggle ${!value ? "off-active" : ""}`} onClick={() => onChange(false)}>❌ No</button>
            {label && <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 700 }}>{label}</span>}
        </div>
    );
}

function PriceInput({ label, error, ...props }) {
    return (
        <Field label={label} error={error}>
            <InputGroup>
                <InputGroup.Text className="cp-addon cp-addon-left">₹</InputGroup.Text>
                <Form.Control className={`cp-input cp-input-inner-left ${error ? "is-invalid" : ""}`} type="number" min="0" {...props} />
            </InputGroup>
        </Field>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CreateProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [hasVariants, setHasVariants] = useState(null); // null | true | false
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [dragover, setDragover] = useState(false);
    const [variants, setVariants] = useState([{ ...DEFAULT_VARIANT }]);
    const [isCustomizable, setIsCustomizable] = useState(false);
    const [isReturn, setIsReturn] = useState(false);
    const [isReplace, setIsReplace] = useState(false);
    const [isCod, setIsCod] = useState(true);
    const [isFreeDelivery, setIsFreeDelivery] = useState(false);
    const [taxInclusive, setTaxInclusive] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            title: "", description: "", brand: "", category: "",
            base_price: "", old_price: "", stock: "",
            // shipping
            weight: "", length: "", width: "", height: "",
            delivery_days: "", tax_percentage: "",
            min_stock_alert: "",
            // return
            return_replace_duration: "", return_replace_instructions: "",
            // seo
            slug: "", meta_title: "", meta_description: "",
            // customization
            customization_type: "", customization_fields: "",
        },
        mode: "onChange",
    });

    const basePriceVal = watch("base_price");
    const oldPriceVal = watch("old_price");
    const discount = autoDiscount(basePriceVal, oldPriceVal);

    // ── Tag helpers ──
    const addTag = (t) => {
        const val = t || tagInput.trim();
        if (val && !tags.includes(val)) setTags(p => [...p, val]);
        setTagInput("");
    };
    const removeTag = (t) => setTags(p => p.filter(x => x !== t));

    // ── Image helpers ──
    const addImages = (files) => {
        const imgs = Array.from(files).map(f => ({ file: f, preview: URL.createObjectURL(f) }));
        setImageFiles(p => [...p, ...imgs]);
    };
    const removeImage = (i) => {
        setImageFiles(p => {
            URL.revokeObjectURL(p[i]?.preview);
            return p.filter((_, idx) => idx !== i);
        });
    };

    // ── Variant helpers ──
    const updateVariant = (i, field, val) => {
        setVariants(p => { const n = [...p]; n[i] = { ...n[i], [field]: val }; return n; });
    };
    const addVariant = () => setVariants(p => [...p, { ...DEFAULT_VARIANT }]);
    const removeVariant = (i) => setVariants(p => p.filter((_, idx) => idx !== i));

    const validateVariants = () => {
        if (!hasVariants) return true;
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v.color) { toast.error(`Variant ${i + 1}: Color required`); return false; }
            if (!v.size) { toast.error(`Variant ${i + 1}: Size required`); return false; }
            if (!v.final_price || Number(v.final_price) <= 0) { toast.error(`Variant ${i + 1}: Price required`); return false; }
            if (v.stock === "") { toast.error(`Variant ${i + 1}: Stock required`); return false; }
        }
        return true;
    };

    // ── Submit ──
    const onSubmit = async (payload) => {
        if (hasVariants === null) { toast.error("Please select product type first."); return; }
        if (imageFiles.length === 0) { toast.error("Upload at least one image!"); return; }
        if (!validateVariants()) return;

        setLoading(true);
        try {
            const fd = new FormData();

            // Basic fields
            const fields = {
                ...payload,
                tag: tags.join(","),
                is_return: isReturn,
                is_replace: isReplace,
                is_customizable: isCustomizable,
                is_cod_available: isCod,
                is_free_delivery: isFreeDelivery,
                tax_inclusive: taxInclusive,
                discount: discount ?? 0,
            };
            Object.entries(fields).forEach(([k, v]) => fd.append(k, v ?? ""));

            // Variants
            fd.append("variants", JSON.stringify(hasVariants ? variants : []));

            // Images
            imageFiles.forEach(img => fd.append("images", img.file));

            const res = await productApi.createProduct(fd);
            if (res?.success) {
                setSubmitted(true);
                toast.success("Product Created Successfully!");
            } else {
                toast.error(res?.message || "Something went wrong");
            }
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // ── Success screen ──
    if (submitted) {
        return (
            <div className="cp-page d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", background: "linear-gradient(145deg, #ff6b35 0%, #f7931e 55%, #ffcd3c 100%)" }}>
                <div className="cp-card text-center p-5" style={{ maxWidth: 440 }}>
                    <div className="cp-success-ring mb-3">✅</div>
                    <h2 className="fw-bold mb-2" style={{ fontFamily: "Nunito", fontSize: "1.8rem", color: "#1a1a2e" }}>Product Listed!</h2>
                    <p className="text-muted mb-3">Your product has been successfully created and is now live on ShopEase.</p>
                    <Alert variant="warning" className="rounded-4 border-0 fw-bold py-2">🎉 Customers can now discover your product!</Alert>
                    <div className="d-flex gap-2 mt-3">
                        <Button className="cp-btn-primary flex-fill" onClick={() => { setSubmitted(false); setHasVariants(null); setTags([]); setImageFiles([]); setVariants([{ ...DEFAULT_VARIANT }]); }}>+ Add Another</Button>
                        <Button className="cp-btn-outline flex-fill" onClick={() => navigate("/seller/products")}>My Products</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cp-page">
            <SellerNavbar pageTitle="Add Product" />
            <div style={{ display: "flex" }}>
                <SellerSidebar />
                <div style={{ flex: 1, marginLeft: window.innerWidth >= 992 ? SIDEBAR_W : 0, padding: "28px 24px 48px", minWidth: 0 }}>

                    {/* Page header */}
                    <div className="mb-4">
                        <h2 className="fw-bold mb-1" style={{ fontFamily: "Nunito", fontSize: "1.7rem", color: "#1a1a2e" }}>List a New Product</h2>
                        <p style={{ fontSize: "0.86rem", color: "#9ca3af", marginBottom: 0 }}>Fill all details carefully — complete listings sell 3× faster!</p>
                    </div>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Stack gap={4}>

                            {/* ══════════════════════════════════════════════════
                                STEP 1 — PRODUCT TYPE
                            ══════════════════════════════════════════════════ */}
                            <div className={`cp-card ${hasVariants === null ? "active-step" : ""}`}>
                                <SectionTitle icon="⚙️">Step 1 — Product Type</SectionTitle>
                                <p style={{ fontSize: "0.86rem", color: "#6b7280", marginBottom: 16 }}>
                                    Does your product come in multiple variants (sizes / colors)?
                                </p>
                                <div className="d-flex gap-3 flex-wrap">
                                    <div className={`cp-type-card ${hasVariants === false ? "selected-single" : ""}`} onClick={() => setHasVariants(false)}>
                                        <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📦</div>
                                        <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "#1a1a2e", marginBottom: 4 }}>Single Product</div>
                                        <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>One price, one stock. No size or color variants.</div>
                                        {hasVariants === false && <div style={{ marginTop: 8, fontWeight: 800, fontSize: "0.75rem", color: "#16a34a" }}>✔ Selected</div>}
                                    </div>
                                    <div className={`cp-type-card ${hasVariants === true ? "selected-variant" : ""}`} onClick={() => setHasVariants(true)}>
                                        <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🎨</div>
                                        <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "#1a1a2e", marginBottom: 4 }}>Has Variants</div>
                                        <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>Multiple sizes, colors or price tiers.</div>
                                        {hasVariants === true && <div style={{ marginTop: 8, fontWeight: 800, fontSize: "0.75rem", color: "#ff6b35" }}>✔ Selected</div>}
                                    </div>
                                </div>
                                {hasVariants === null && (
                                    <div className="cp-warn mt-3">⚠️ Please select a product type above to continue.</div>
                                )}
                            </div>

                            {/* Show rest only after type selected */}
                            {hasVariants !== null && (<>

                                {/* ══════════════════════════════════════════════════
                                STEP 2 — BASIC INFO
                            ══════════════════════════════════════════════════ */}
                                <div className="cp-card">
                                    <SectionTitle icon="📋">Step 2 — Basic Information</SectionTitle>
                                    <Row className="g-3">
                                        <Col md={5}>
                                            <Field label="Product Title *" error={errors.title?.message}>
                                                <Form.Control className={`cp-input ${errors.title ? "is-invalid" : ""}`} placeholder="e.g. Premium Cotton T-Shirt"
                                                    {...register("title", { required: "Title is required", minLength: { value: 5, message: "Min 5 characters" } })} />
                                            </Field>
                                        </Col>
                                        <Col md={4}>
                                            <Field label="Category *" error={errors.category?.message}>
                                                <Form.Control className={`cp-input ${errors.category ? "is-invalid" : ""}`} placeholder="e.g. Fashion, Electronics"
                                                    {...register("category", { required: "Category is required" })} />
                                            </Field>
                                        </Col>
                                        <Col md={3}>
                                            <Field label="Brand *" error={errors.brand?.message}>
                                                <Form.Control className={`cp-input ${errors.brand ? "is-invalid" : ""}`} placeholder="e.g. Nike"
                                                    {...register("brand", { required: "Brand is required" })} />
                                            </Field>
                                        </Col>
                                        <Col xs={12}>
                                            <Field label="Description *" error={errors.description?.message}>
                                                <Form.Control as="textarea" rows={4} className={`cp-textarea ${errors.description ? "is-invalid" : ""}`}
                                                    placeholder="Describe your product — material, size guide, usage, etc."
                                                    {...register("description", { required: "Description required", minLength: { value: 20, message: "Min 20 characters" } })} />
                                            </Field>
                                        </Col>
                                        <Col md={4}>
                                            <Field label="URL Slug">
                                                <InputGroup>
                                                    <InputGroup.Text className="cp-addon cp-addon-left" style={{ fontSize: "0.75rem" }}>/p/</InputGroup.Text>
                                                    <Form.Control className="cp-input cp-input-inner-left" placeholder="product-name" {...register("slug")} />
                                                </InputGroup>
                                            </Field>
                                        </Col>
                                        <Col md={4}>
                                            <Field label="Meta Title (SEO)">
                                                <Form.Control className="cp-input" placeholder="SEO title" {...register("meta_title")} />
                                            </Field>
                                        </Col>
                                        <Col md={4}>
                                            <Field label="Meta Description (SEO)">
                                                <Form.Control className="cp-input" placeholder="SEO description" {...register("meta_description")} />
                                            </Field>
                                        </Col>
                                    </Row>
                                </div>

                                {/* ══════════════════════════════════════════════════
                                STEP 3 — PRICING & INVENTORY
                            ══════════════════════════════════════════════════ */}
                                <div className="cp-card">
                                    <SectionTitle icon="💰">Step 3 — Pricing & Inventory</SectionTitle>

                                    {hasVariants && (
                                        <div className="cp-info mb-3">ℹ️ Since your product has variants, <b>price & stock per variant</b> will be set in Step 4. Base price is the display price only.</div>
                                    )}

                                    <Row className="g-3">
                                        <Col sm={6} md={3}>
                                            <PriceInput label={hasVariants ? "Base / Display Price (₹) *" : "Selling Price (₹) *"}
                                                placeholder="499"
                                                error={errors.base_price?.message}
                                                className={`cp-input cp-input-inner-left ${errors.base_price ? "is-invalid" : ""}`}
                                                {...register("base_price", { required: "Base price required", min: { value: 1, message: "Must be > 0" } })} />
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <PriceInput label="MRP / Old Price (₹)" placeholder="999"
                                                className="cp-input cp-input-inner-left"
                                                {...register("old_price")} />
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <Field label="Discount">
                                                <div className="cp-input" style={{ display: "flex", alignItems: "center", background: "#f8f9ff", cursor: "default" }}>
                                                    {discount !== null
                                                        ? <span className="cp-discount-badge">💡 {discount}% off</span>
                                                        : <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Auto-calculated</span>}
                                                </div>
                                            </Field>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <Field label="Tax (%)" >
                                                <InputGroup>
                                                    <Form.Control className="cp-input cp-input-inner-right" type="number" min="0" max="100" placeholder="18" {...register("tax_percentage")} />
                                                    <InputGroup.Text className="cp-addon cp-addon-right">%</InputGroup.Text>
                                                </InputGroup>
                                            </Field>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <Field label="Stock Quantity *" error={errors.stock?.message}>
                                                <Form.Control className={`cp-input ${errors.stock ? "is-invalid" : ""}`} type="number" min="0" placeholder="100"
                                                    {...register("stock", { required: "Stock required", min: { value: 0, message: "Cannot be negative" } })} />
                                            </Field>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <Field label="Min Stock Alert">
                                                <Form.Control className="cp-input" type="number" min="0" placeholder="10" {...register("min_stock_alert")} />
                                            </Field>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <Field label="Tax Inclusive?">
                                                <Toggle value={taxInclusive} onChange={setTaxInclusive} />
                                            </Field>
                                        </Col>
                                    </Row>
                                </div>

                                {/* ══════════════════════════════════════════════════
                                STEP 4 — VARIANTS (only if hasVariants)
                            ══════════════════════════════════════════════════ */}
                                {hasVariants && (
                                    <div className="cp-card" style={{ borderColor: "#fff0e6" }}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <SectionTitle icon="🎨">Step 4 — Variants</SectionTitle>
                                            <Button type="button" className="cp-btn-primary cp-btn-sm" onClick={addVariant}>+ Add Variant</Button>
                                        </div>
                                        <p style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: 16 }}>Each variant = unique color + size combination with its own price & stock.</p>

                                        {variants.map((v, i) => (
                                            <div key={i} className="cp-variant-card">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: "0.85rem", color: "#374151" }}>
                                                        <span className="cp-variant-badge">{i + 1}</span>
                                                        Variant {i + 1}
                                                        {v.color && <span style={{ width: 14, height: 14, borderRadius: "50%", background: v.color, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)", display: "inline-block" }} />}
                                                        {v.size && <Badge bg="light" text="dark" className="fw-bold" style={{ fontSize: "0.7rem" }}>{v.size}</Badge>}
                                                    </div>
                                                    <Button type="button" variant="outline-danger" size="sm" style={{ borderRadius: 8, fontSize: "0.75rem" }}
                                                        onClick={() => removeVariant(i)} disabled={variants.length <= 1}>Remove</Button>
                                                </div>

                                                <Row className="g-3 align-items-end">
                                                    <Col md={2} sm={6}>
                                                        <label className="cp-label">Color *</label>
                                                        <div className="d-flex gap-2">
                                                            <Form.Control type="color" value={v.color || "#000000"}
                                                                onChange={e => updateVariant(i, "color", e.target.value)}
                                                                style={{ width: 44, height: 40, padding: 3, borderRadius: 8, border: "2px solid #e8eaf6", cursor: "pointer", flexShrink: 0 }} />
                                                            <Form.Control className="cp-input" placeholder="#000000" value={v.color}
                                                                onChange={e => updateVariant(i, "color", e.target.value)} style={{ fontSize: "0.82rem" }} />
                                                        </div>
                                                    </Col>
                                                    <Col md={2} sm={6}>
                                                        <label className="cp-label">Size *</label>
                                                        <Form.Select className="cp-select" value={v.size} onChange={e => updateVariant(i, "size", e.target.value)}>
                                                            <option value="">Select size</option>
                                                            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </Form.Select>
                                                    </Col>
                                                    <Col md={2} sm={6}>
                                                        <label className="cp-label">Final Price (₹) *</label>
                                                        <InputGroup>
                                                            <InputGroup.Text className="cp-addon cp-addon-left">₹</InputGroup.Text>
                                                            <Form.Control className="cp-input cp-input-inner-left" type="number" min="0" placeholder="499"
                                                                value={v.final_price} onChange={e => updateVariant(i, "final_price", e.target.value)} />
                                                        </InputGroup>
                                                    </Col>
                                                    <Col md={2} sm={6}>
                                                        <label className="cp-label">Old Price (₹)</label>
                                                        <InputGroup>
                                                            <InputGroup.Text className="cp-addon cp-addon-left">₹</InputGroup.Text>
                                                            <Form.Control className="cp-input cp-input-inner-left" type="number" min="0" placeholder="999"
                                                                value={v.old_price} onChange={e => updateVariant(i, "old_price", e.target.value)} />
                                                        </InputGroup>
                                                    </Col>
                                                    <Col md={2} sm={6}>
                                                        <label className="cp-label">Stock *</label>
                                                        <Form.Control className="cp-input" type="number" min="0" placeholder="50"
                                                            value={v.stock} onChange={e => updateVariant(i, "stock", e.target.value)} />
                                                    </Col>
                                                    <Col md={2} sm={6}>
                                                        {v.final_price && v.old_price && Number(v.old_price) > Number(v.final_price) && (
                                                            <div className="cp-discount-badge">
                                                                💡 {Math.round(((Number(v.old_price) - Number(v.final_price)) / Number(v.old_price)) * 100)}% off
                                                            </div>
                                                        )}
                                                    </Col>
                                                </Row>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ══════════════════════════════════════════════════
                                STEP 5 — IMAGES
                            ══════════════════════════════════════════════════ */}
                                <div className="cp-card">
                                    <SectionTitle icon="🖼️">Step {hasVariants ? "5" : "4"} — Product Images *</SectionTitle>

                                    <div
                                        className={`cp-image-zone mb-3 ${dragover ? "drag" : ""}`}
                                        onClick={() => document.getElementById("cp-img-input").click()}
                                        onDragOver={e => { e.preventDefault(); setDragover(true); }}
                                        onDragLeave={() => setDragover(false)}
                                        onDrop={e => { e.preventDefault(); setDragover(false); addImages(e.dataTransfer.files); }}
                                    >
                                        {imageFiles.length === 0 ? (
                                            <div className="text-center text-muted py-2">
                                                <div style={{ fontSize: "2rem" }}>📸</div>
                                                <div className="fw-bold" style={{ fontSize: "0.9rem" }}>Click or drag & drop images here</div>
                                                <div style={{ fontSize: "0.75rem" }}>PNG, JPG, WEBP • Multiple allowed • First image = Cover</div>
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-wrap gap-3 w-100 align-items-center">
                                                {imageFiles.map((img, i) => (
                                                    <div key={i} className="cp-img-wrap">
                                                        <img src={img.preview} alt="preview" className="cp-img-thumb" />
                                                        {i === 0 && <div className="cp-img-cover-badge">COVER</div>}
                                                        <div className="cp-img-remove" onClick={e => { e.stopPropagation(); removeImage(i); }}>✕</div>
                                                    </div>
                                                ))}
                                                <div className="cp-img-add-box">+</div>
                                            </div>
                                        )}
                                        <input id="cp-img-input" type="file" hidden accept="image/*" multiple
                                            onChange={e => { addImages(e.target.files); e.target.value = ""; }} />
                                    </div>

                                    {imageFiles.length === 0 && (
                                        <div className="cp-warn">⚠️ At least 1 image is required. First image will be used as cover.</div>
                                    )}
                                    {imageFiles.length > 0 && (
                                        <div style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700 }}>
                                            📷 {imageFiles.length} image{imageFiles.length > 1 ? "s" : ""} selected &nbsp;·&nbsp;
                                            <button type="button" style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: 700, padding: 0, fontSize: "0.78rem" }}
                                                onClick={() => { imageFiles.forEach(f => URL.revokeObjectURL(f.preview)); setImageFiles([]); }}>
                                                🗑️ Clear all
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* ══════════════════════════════════════════════════
                                STEP 6 — SHIPPING & DELIVERY
                            ══════════════════════════════════════════════════ */}
                                <div className="cp-card">
                                    <SectionTitle icon="🚚">Step {hasVariants ? "6" : "5"} — Shipping & Delivery</SectionTitle>
                                    <Row className="g-3">
                                        <Col sm={6} md={3}>
                                            <Field label="Weight (kg)">
                                                <InputGroup>
                                                    <Form.Control className="cp-input cp-input-inner-right" type="number" min="0" step="0.01" placeholder="0.5" {...register("weight")} />
                                                    <InputGroup.Text className="cp-addon cp-addon-right">kg</InputGroup.Text>
                                                </InputGroup>
                                            </Field>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <Field label="Dimensions (L×W×H cm)">
                                                <Row className="g-1">
                                                    <Col><Form.Control className="cp-input" type="number" min="0" placeholder="L" {...register("length")} /></Col>
                                                    <Col><Form.Control className="cp-input" type="number" min="0" placeholder="W" {...register("width")} /></Col>
                                                    <Col><Form.Control className="cp-input" type="number" min="0" placeholder="H" {...register("height")} /></Col>
                                                </Row>
                                            </Field>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <Field label="Delivery Days">
                                                <InputGroup>
                                                    <Form.Control className="cp-input cp-input-inner-right" type="number" min="1" placeholder="5" {...register("delivery_days")} />
                                                    <InputGroup.Text className="cp-addon cp-addon-right">days</InputGroup.Text>
                                                </InputGroup>
                                            </Field>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <Field label="COD Available?">
                                                <Toggle value={isCod} onChange={setIsCod} />
                                            </Field>
                                        </Col>
                                        <Col sm={6} md={3}>
                                            <Field label="Free Delivery?">
                                                <Toggle value={isFreeDelivery} onChange={setIsFreeDelivery} />
                                            </Field>
                                        </Col>
                                    </Row>
                                </div>

                                {/* ══════════════════════════════════════════════════
                                STEP 7 — TAGS & CUSTOMIZATION
                            ══════════════════════════════════════════════════ */}
                                <div className="cp-card">
                                    <SectionTitle icon="🏷️">Step {hasVariants ? "7" : "6"} — Tags & Options</SectionTitle>

                                    <label className="cp-label mb-2">Product Tags</label>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {PRESET_TAGS.map(t => (
                                            <div key={t}  text={tags.includes(t) ? "" : ""}
                                                className="rounded-3 px-3 py-2"
                                                style={{backgroundColor:"#5068f0ff",cursor: "pointer", fontSize: "0.78rem", border: tags.includes(t) ? "2px solid #355aff" : "2px solid #e8eaf6" }}
                                                onClick={() => tags.includes(t) ? removeTag(t) : addTag(t)}>
                                                {t}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="d-flex gap-2 mb-3" style={{ maxWidth: 380 }}>
                                        <Form.Control className="cp-input" placeholder="Custom tag…" value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} />
                                        <Button type="button" className="cp-btn-primary" style={{ whiteSpace: "nowrap" }} onClick={() => addTag()}>Add Tag</Button>
                                    </div>

                                    {tags.length > 0 && (
                                        <div className="d-flex flex-wrap gap-2 mb-4">
                                            {tags.map(t => (
                                                <div key={t} className="cp-tag-pill">{t}<button type="button" onClick={() => removeTag(t)}>✕</button></div>
                                            ))}
                                        </div>
                                    )}

                                    <Row className="g-3 mt-1">
                                        <Col sm={6}>
                                            <label className="cp-label mb-2">Is Product Customizable?</label>
                                            <Toggle value={isCustomizable} onChange={setIsCustomizable} />
                                        </Col>
                                        {isCustomizable && (<>
                                            <Col sm={6}>
                                                <Field label="Customization Type">
                                                    <Form.Control className="cp-input" placeholder="e.g. Text, Engraving, Upload" {...register("customization_type")} />
                                                </Field>
                                            </Col>
                                            <Col xs={12}>
                                                <Field label="Customization Fields (JSON)">
                                                    <Form.Control as="textarea" rows={3} className="cp-textarea" placeholder='e.g. [{"name":"Text","type":"input","maxLength":50}]' {...register("customization_fields")} />
                                                </Field>
                                            </Col>
                                        </>)}
                                    </Row>
                                </div>

                                {/* ══════════════════════════════════════════════════
                                STEP 8 — RETURN & REPLACE
                            ══════════════════════════════════════════════════ */}
                                <div className="cp-card">
                                    <SectionTitle icon="↩️">Step {hasVariants ? "8" : "7"} — Return & Replace Policy</SectionTitle>
                                    <Row className="g-3 mb-3">
                                        <Col sm={6}>
                                            <label className="cp-label mb-2">Return Allowed?</label>
                                            <Toggle value={isReturn} onChange={setIsReturn} />
                                        </Col>
                                        <Col sm={6}>
                                            <label className="cp-label mb-2">Replacement Allowed?</label>
                                            <Toggle value={isReplace} onChange={setIsReplace} />
                                        </Col>
                                    </Row>

                                    {(isReturn || isReplace) && (
                                        <Row className="g-3">
                                            <Col sm={4}>
                                                <Field label="Duration (Days) *" error={errors.return_replace_duration?.message}>
                                                    <InputGroup>
                                                        <Form.Control className={`cp-input cp-input-inner-right ${errors.return_replace_duration ? "is-invalid" : ""}`}
                                                            type="number" min="1" placeholder="7"
                                                            {...register("return_replace_duration", {
                                                                required: (isReturn || isReplace) ? "Duration required" : false,
                                                                min: { value: 1, message: "Min 1 day" },
                                                            })} />
                                                        <InputGroup.Text className="cp-addon cp-addon-right">days</InputGroup.Text>
                                                    </InputGroup>
                                                </Field>
                                            </Col>
                                            <Col sm={8}>
                                                <Field label="Instructions">
                                                    <Form.Control as="textarea" rows={2} className="cp-textarea"
                                                        placeholder="e.g. Product must be unused, in original packaging with all tags intact."
                                                        {...register("return_replace_instructions")} />
                                                </Field>
                                            </Col>
                                        </Row>
                                    )}

                                    {!isReturn && !isReplace && (
                                        <div className="cp-warn mt-2">⚠️ Products with return/replace policies have higher buyer confidence.</div>
                                    )}
                                </div>

                                {/* ── ACTION BUTTONS ── */}
                                <Row className="g-3 pb-2">
                                    <Col sm={8}>
                                        <Button type="submit" className="cp-btn-primary w-100" style={{ padding: "14px" }} disabled={loading}>
                                            {loading ? "⏳ Listing Your Product…" : "🚀 Publish Product Now"}
                                        </Button>
                                    </Col>
                                    <Col sm={4}>
                                        <Button type="button" className="cp-btn-outline w-100" style={{ padding: "14px" }} onClick={() => navigate(-1)}>
                                            ← Cancel
                                        </Button>
                                    </Col>
                                </Row>

                            </>)}
                        </Stack>
                    </Form>
                </div>
            </div>
        </div>
    );
}