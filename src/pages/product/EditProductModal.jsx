import { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Button, InputGroup, Badge, Stack } from "react-bootstrap";
import { useForm } from "react-hook-form";
import productApi from "../../api/product.api";
import toast from "react-hot-toast";
import { formResetData } from "../../helper/FormDefaults";

// ── Constants ──────────────────────────────────────────────────────────────────
const PRESET_TAGS = ["New Arrival", "Trending", "Best Seller", "Limited Edition", "Eco Friendly", "Premium", "Sale"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "6", "7", "8", "9", "10", "11", "12"];
const DEFAULT_VARIANT = { color: "#000000", size: "", final_price: "", old_price: "", stock: "" };

// ── Sub-components (same as CreateProduct) ────────────────────────────────────
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

// ── Modal Style Override (only modal shell, rest uses CreateProduct.css) ──────
const MODAL_STYLE = `
.ep-modal .modal-content {
    border-radius: 24px !important;
    border: none !important;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18) !important;
    overflow: hidden;
}
.ep-modal .modal-header {
    background: #fff;
    border-bottom: 1.5px solid #eef0f8 !important;
    padding: 20px 28px 16px !important;
}
.ep-modal .modal-body {
    background: #f1f4ff;
    padding: 24px 28px 32px !important;
}
.ep-modal .modal-title {
    font-family: 'Nunito', sans-serif;
    font-size: 1.25rem;
    font-weight: 900;
    color: #1a1a2e;
}
.ep-modal .btn-close {
    opacity: 0.5;
}
.ep-modal .btn-close:hover {
    opacity: 1;
}
`;

if (!document.getElementById("ep-modal-style")) {
    const s = document.createElement("style");
    s.id = "ep-modal-style";
    s.textContent = MODAL_STYLE;
    document.head.appendChild(s);
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function EditProductModal({ show, handleClose, product, setRefresh, refresh }) {
    const [loading, setLoading] = useState(false);
    const [hasVariants, setHasVariants] = useState(false);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [dragover, setDragover] = useState(false);
    const [variants, setVariants] = useState([{ ...DEFAULT_VARIANT }]);
    const [isCustomizable, setIsCustomizable] = useState(false);
    const [isReturn, setIsReturn] = useState(false);
    const [isReplace, setIsReplace] = useState(false);
    const [isCod, setIsCod] = useState(true);
    const [isFreeDelivery, setIsFreeDelivery] = useState(false);
    const [taxInclusive, setTaxInclusive] = useState(false);

    const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: "", description: "", brand: "", category: "",
            base_price: "", old_price: "", stock: "",
            weight: "", length: "", width: "", height: "",
            delivery_days: "", tax_percentage: "", min_stock_alert: "",
            return_replace_duration: "", return_replace_instructions: "",
            slug: "", meta_title: "", meta_description: "",
            customization_type: "", customization_fields: "",
            sold: "", rating: "", reviews: "",
        },
        mode: "onChange",
    });

    const basePriceVal = watch("base_price");
    const oldPriceVal = watch("old_price");
    const discount =
        basePriceVal && oldPriceVal && Number(oldPriceVal) > Number(basePriceVal)
            ? Math.round(((Number(oldPriceVal) - Number(basePriceVal)) / Number(oldPriceVal)) * 100)
            : null;

    // ── Pre-fill when product changes ──
    useEffect(() => {
        if (!product || !show) return;

        reset(formResetData.product(product));

        // Tags
        const tagList = Array.isArray(product.tag)
            ? product.tag
            : (product.tag || "").split(",").map(t => t.trim()).filter(Boolean);
        setTags(tagList);

        // Toggles
        setIsReturn(!!product.is_return);
        setIsReplace(!!product.is_replace);
        setIsCustomizable(!!product.is_customizable);
        setIsCod(product.is_cod_available !== undefined ? !!product.is_cod_available : true);
        setIsFreeDelivery(!!product.is_free_delivery);
        setTaxInclusive(!!product.tax_inclusive);

        // Images
        const urls = Array.isArray(product.image_url)
            ? product.image_url
            : (product.image_url || "").split(",").map(u => u.trim()).filter(Boolean);
        setImageFiles(urls.map(url => ({ preview: url, isExisting: true })));
        setDeletedImages([]);

        // Variants
        if (product.variants && product.variants.length > 0) {
            setHasVariants(true);
            setVariants(product.variants.map(v => ({
                color: v.color || "#000000",
                size: v.size || "",
                final_price: v.price || "",
                old_price: v.old_price || "",
                stock: v.stock || "",
            })));
        } else {
            setHasVariants(false);
            setVariants([{ ...DEFAULT_VARIANT }]);
        }
    }, [product, show, reset]);

    // Auto-sum variant stock
    useEffect(() => {
        if (hasVariants) {
            const sum = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
            setValue("stock", sum);
        }
    }, [variants, hasVariants, setValue]);

    // ── Tag helpers ──
    const addTag = (t) => {
        const val = t || tagInput.trim();
        if (val && !tags.includes(val)) setTags(p => [...p, val]);
        setTagInput("");
    };
    const removeTag = (t) => setTags(p => p.filter(x => x !== t));

    // ── Image helpers ──
    const addImages = (files) => {
        const imgs = Array.from(files).map(f => ({ file: f, preview: URL.createObjectURL(f), isExisting: false }));
        setImageFiles(p => [...p, ...imgs]);
    };
    const removeImage = (i) => {
        setImageFiles(p => {
            const removed = p[i];
            if (removed.isExisting) setDeletedImages(d => [...d, removed.preview]);
            else URL.revokeObjectURL(removed.preview);
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
        if (imageFiles.length === 0) { toast.error("Upload at least one image!"); return; }
        if (!validateVariants()) return;

        setLoading(true);
        try {
            const existingImages = imageFiles.filter(i => i.isExisting).map(i => i.preview);
            const newImages = imageFiles.filter(i => !i.isExisting).map(i => i.file);

            const fd = new FormData();
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
                variants: JSON.stringify(hasVariants ? variants : []),
                existingImages: JSON.stringify(existingImages),
                deletedImages: JSON.stringify(deletedImages),
            };
            console.log("fields", fields)
            Object.entries(fields).forEach(([k, v]) => fd.append(k, v ?? ""));
            newImages.forEach(file => fd.append("images", file));

            const res = await productApi.updateProduct(product.id, fd);
            if (res?.success) {
                toast.success("Product updated successfully!");
                setRefresh(!refresh);
                handleReset();
            } else {
                toast.error(res?.message || "Update failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        reset();
        setTags([]); setImageFiles([]); setDeletedImages([]);
        setVariants([{ ...DEFAULT_VARIANT }]); setHasVariants(false);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleReset} size="xl" centered scrollable className="ep-modal">
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center gap-2 text-light">
                    ✏️ Edit Product
                    {product?.title && (
                        <span style={{ fontSize: "0.85rem", marginTop: "3px", fontWeight: 600, color: "#ffffffff" }}>
                            — {product.title.length > 40 ? product.title.slice(0, 40) + "…" : product.title}
                        </span>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap={4}>

                        {/* ══ SECTION 1 — PRODUCT TYPE ══ */}
                        {/* <div className="cp-card">
                            <SectionTitle icon="⚙️">Product Type</SectionTitle>
                            <p style={{ fontSize: "0.86rem", color: "#6b7280", marginBottom: 16 }}>
                                Does this product have multiple variants (sizes / colors)?
                            </p>
                            <div className="d-flex gap-3 flex-wrap">
                                <div className={`cp-type-card ${!hasVariants ? "selected-single" : ""}`} onClick={() => setHasVariants(false)}>
                                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📦</div>
                                    <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "#1a1a2e", marginBottom: 4 }}>Single Product</div>
                                    <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>One price, one stock. No size or color variants.</div>
                                    {!hasVariants && <div style={{ marginTop: 8, fontWeight: 800, fontSize: "0.75rem", color: "#16a34a" }}>✔ Selected</div>}
                                </div>
                                <div className={`cp-type-card ${hasVariants ? "selected-variant" : ""}`} onClick={() => setHasVariants(true)}>
                                    <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🎨</div>
                                    <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "#1a1a2e", marginBottom: 4 }}>Has Variants</div>
                                    <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>Multiple sizes, colors or price tiers.</div>
                                    {hasVariants && <div style={{ marginTop: 8, fontWeight: 800, fontSize: "0.75rem", color: "#ff6b35" }}>✔ Selected</div>}
                                </div>
                            </div>
                        </div> */}

                        {/* ══ SECTION 2 — BASIC INFO ══ */}
                        <div className="cp-card">
                            <SectionTitle icon="📋">Basic Information</SectionTitle>
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
                                <Col md={2}>
                                    <Field label="Meta Title (SEO)">
                                        <Form.Control className="cp-input" placeholder="SEO title" {...register("meta_title")} />
                                    </Field>
                                </Col>
                                <Col md={3}>
                                    <Field label="Meta Description (SEO)">
                                        <Form.Control className="cp-input" placeholder="SEO description" {...register("meta_description")} />
                                    </Field>
                                </Col>
                                <Col md={3}>
                                    <Field label="Status">
                                        <Form.Select className="cp-select" {...register("status")}>
                                            <option value="true" selected>Active</option>
                                            <option value="false">Inactive</option>
                                        </Form.Select>
                                    </Field>
                                </Col>
                            </Row>
                        </div>

                        {/* ══ SECTION 3 — PRICING & INVENTORY ══ */}
                        <div className="cp-card">
                            <SectionTitle icon="💰">Pricing & Inventory</SectionTitle>
                            {hasVariants && (
                                <div className="cp-info mb-3">ℹ️ Since your product has variants, <b>price & stock per variant</b> will be set below. Base price is the display price only.</div>
                            )}
                            <Row className="g-3">
                                <Col sm={6} md={4}>
                                    <PriceInput label={hasVariants ? "Base / Display Price (₹) *" : "Selling Price (₹) *"}
                                        placeholder="499"
                                        error={errors.base_price?.message}
                                        {...register("base_price", { required: "Base price required", min: { value: 1, message: "Must be > 0" } })} />
                                </Col>
                                <Col sm={6} md={4}>
                                    <PriceInput label="MRP / Old Price (₹)" placeholder="999" {...register("old_price")} />
                                </Col>
                                <Col sm={6} md={4}>
                                    <Field label="Discount">
                                        <div className="cp-input" style={{ display: "flex", alignItems: "center", background: "#f8f9ff", cursor: "default" }}>
                                            {discount !== null
                                                ? <span className="cp-discount-badge">💡 {discount}% off</span>
                                                : <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Auto-calculated</span>}
                                        </div>
                                    </Field>
                                </Col>
                                <Col sm={6} md={4}>
                                    <Field label="Tax (%)">
                                        <InputGroup>
                                            <Form.Control className="cp-input cp-input-inner-right" type="number" min="0" max="100" placeholder="18" {...register("tax_percentage")} />
                                            <InputGroup.Text className="cp-addon cp-addon-right">%</InputGroup.Text>
                                        </InputGroup>
                                    </Field>
                                </Col>
                                <Col sm={6} md={4}>
                                    <Field label={hasVariants ? "Total Stock Quantity (Auto)" : "Stock Quantity *"} error={errors.stock?.message}>
                                        <Form.Control className={`cp-input ${errors.stock ? "is-invalid" : ""}`} type="number" min="0" 
                                            placeholder={hasVariants ? "Auto-calculated" : "100"}
                                            disabled={hasVariants}
                                            {...register("stock", { required: !hasVariants && "Stock required", min: { value: 0, message: "Cannot be negative" } })} />
                                    </Field>
                                </Col>
                                <Col sm={6} md={4}>
                                    <Field label="Min Stock Alert">
                                        <Form.Control className="cp-input" type="number" min="0" placeholder="10" {...register("min_stock_alert")} />
                                    </Field>
                                </Col>
                            </Row>
                        </div>

                        {/* ══ SECTION 4 — VARIANTS ══ */}
                        {hasVariants && (
                            <div className="cp-card" style={{ borderColor: "#fff0e6" }}>
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <SectionTitle icon="🎨">Variants</SectionTitle>
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

                        {/* ══ SECTION 5 — IMAGES ══ */}
                        <div className="cp-card">
                            <SectionTitle icon="🖼️">Product Images *</SectionTitle>
                            <div
                                className={`cp-image-zone mb-3 ${dragover ? "drag" : ""}`}
                                onClick={() => document.getElementById("ep-img-input").click()}
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
                                    <div className="d-flex flex-wrap gap-3 w-100 align-items-center p-1">
                                        {imageFiles.map((img, i) => (
                                            <div key={i} className="cp-img-wrap">
                                                <img src={img.preview} alt="preview" className="cp-img-thumb" />
                                                {i === 0 && <div className="cp-img-cover-badge">COVER</div>}
                                                {img.isExisting && i !== 0 && (
                                                    <div style={{ position: "absolute", bottom: -6, left: 0, right: 0, textAlign: "center", fontSize: "0.52rem", fontWeight: 900, background: "#22c55e", color: "#fff", borderRadius: "0 0 8px 8px", padding: "1px 0" }}>SAVED</div>
                                                )}
                                                <div className="cp-img-remove" onClick={e => { e.stopPropagation(); removeImage(i); }}>✕</div>
                                            </div>
                                        ))}
                                        <div className="cp-img-add-box">+</div>
                                    </div>
                                )}
                                <input id="ep-img-input" type="file" hidden accept="image/*" multiple
                                    onChange={e => { addImages(e.target.files); e.target.value = ""; }} />
                            </div>

                            {imageFiles.length === 0 && (
                                <div className="cp-warn">⚠️ At least 1 image is required. First image will be used as cover.</div>
                            )}
                            {imageFiles.length > 0 && (
                                <div className="d-flex gap-3 flex-wrap align-items-center" style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700 }}>
                                    <span>📷 Total: {imageFiles.length}</span>
                                    <span style={{ color: "#22c55e" }}>✅ Saved: {imageFiles.filter(i => i.isExisting).length}</span>
                                    <span style={{ color: "#f7931e" }}>🆕 New: {imageFiles.filter(i => !i.isExisting).length}</span>
                                    <button type="button" style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: 700, padding: 0, fontSize: "0.78rem" }}
                                        onClick={() => { imageFiles.forEach(f => { if (!f.isExisting) URL.revokeObjectURL(f.preview); }); setImageFiles([]); }}>
                                        🗑️ Clear all
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ══ SECTION 6 — SHIPPING & DELIVERY ══ */}
                        <div className="cp-card">
                            <SectionTitle icon="🚚">Shipping & Delivery</SectionTitle>
                            <Row className="g-3">
                                <Col sm={6} md={3}>
                                    <Field label="Weight (kg)">
                                        <InputGroup>
                                            <Form.Control className="cp-input cp-input-inner-right" type="number" min="0" step="0.01" placeholder="0.5" {...register("weight")} />
                                            <InputGroup.Text className="cp-addon cp-addon-right">kg</InputGroup.Text>
                                        </InputGroup>
                                    </Field>
                                </Col>
                                <Col sm={6} md={5}>
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
                                <Col sm={6} md={6}>
                                    <Field label="COD Available?">
                                        <Toggle value={isCod} onChange={setIsCod} />
                                    </Field>
                                </Col>
                                <Col sm={6} md={6}>
                                    <Field label="Free Delivery?">
                                        <Toggle value={isFreeDelivery} onChange={setIsFreeDelivery} />
                                    </Field>
                                </Col>
                            </Row>
                        </div>

                        {/* ══ SECTION 7 — TAGS & CUSTOMIZATION ══ */}
                        <div className="cp-card">
                            <SectionTitle icon="🏷️">Tags & Options</SectionTitle>

                            <label className="cp-label mb-2">Product Tags</label>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {PRESET_TAGS.map(t => (
                                            <div key={t} text={tags.includes(t) ? "" : ""}
                                                className="rounded-3 px-3 py-2"
                                                style={{ backgroundColor: "#5068f0ff", cursor: "pointer", color: "white", fontSize: "0.78rem", border: tags.includes(t) ? "2px solid #0b2286ff" : "2px solid #e8eaf6" }}
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
                            </Row>
                        </div>

                        {/* ══ SECTION 8 — RETURN & REPLACE ══ */}
                        <div className="cp-card">
                            <SectionTitle icon="↩️">Return & Replace Policy</SectionTitle>
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

                    </Stack>

                    {/* ── FOOTER ACTIONS ── */}
                    <Row className="g-3 mt-2 pt-2" style={{ borderTop: "1.5px solid #eef0f8" }}>
                        <Col sm={8}>
                            <Button type="submit" className="cp-btn-primary w-100" style={{ padding: "14px" }} disabled={loading}>
                                {loading ? "⏳ Saving Changes…" : "💾 Save Changes"}
                            </Button>
                        </Col>
                        <Col sm={4}>
                            <Button type="button" className="cp-btn-outline w-100" style={{ padding: "14px" }} onClick={handleReset} disabled={loading}>
                                ← Cancel
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>
    );
}