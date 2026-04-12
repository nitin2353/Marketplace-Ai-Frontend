import { useEffect, useState } from "react";
import { Modal, Row, Col, Form, Button, InputGroup, Badge, Stack } from "react-bootstrap";
import { useForm } from "react-hook-form";
import productApi from "../../api/product.api";
import toast from "react-hot-toast";

const PRESET_COLORS = [
    { name: "Red", hex: "#ef4444" }, { name: "Blue", hex: "#3b82f6" },
    { name: "Green", hex: "#22c55e" }, { name: "Yellow", hex: "#eab308" },
    { name: "Black", hex: "#1a1a1a" }, { name: "White", hex: "#f5f5f5" },
    { name: "Pink", hex: "#ec4899" }, { name: "Purple", hex: "#a855f7" },
    { name: "Orange", hex: "#f97316" }, { name: "Brown", hex: "#92400e" },
];

const PRESET_TAGS = [
    "New Arrival", "Trending", "Best Seller",
    "Limited Edition", "Eco Friendly", "Premium", "Sale",
];

// ── Inject styles (same ShopEase theme) ──
const injectStyle = () => {
    if (document.getElementById("eco-edit-modal-style")) return;
    const s = document.createElement("style");
    s.id = "eco-edit-modal-style";
    s.textContent = `
        .eco-modal .modal-content  { border-radius: 24px !important; border: none !important; box-shadow: 0 24px 64px rgba(0,0,0,0.18) !important; }
        .eco-modal .modal-header   { border-bottom: 1px solid #f1f4ff !important; }
        .eco-modal .modal-body     { background: #f8f9ff; border-radius: 0 0 24px 24px; }
        .eco-section-card          { background: #fff; border-radius: 16px; border: none; box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: 20px; }
        .eco-section-title         { font-size: 0.72rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: #ff6b35; display: flex; align-items: center; gap: 8px; }
        .eco-section-title::after  { content: ''; flex: 1; height: 2px; background: linear-gradient(90deg, #ff6b35 0%, transparent 100%); border-radius: 2px; }
        .eco-label                 { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 5px; display: block; }
        .eco-input                 { border-radius: 10px !important; border: 2px solid #e8eaf6 !important; padding: 9px 13px !important; font-size: 0.9rem !important; font-family: 'Nunito', sans-serif !important; transition: border-color 0.2s, box-shadow 0.2s !important; }
        .eco-input:focus           { border-color: #ff6b35 !important; box-shadow: 0 0 0 3px rgba(255,107,53,0.13) !important; outline: none !important; }
        .eco-input.is-invalid      { border-color: #dc3545 !important; }
        .eco-textarea              { border-radius: 10px !important; border: 2px solid #e8eaf6 !important; padding: 9px 13px !important; font-size: 0.9rem !important; font-family: 'Nunito', sans-serif !important; transition: border-color 0.2s !important; resize: vertical !important; }
        .eco-textarea:focus        { border-color: #ff6b35 !important; box-shadow: 0 0 0 3px rgba(255,107,53,0.13) !important; outline: none !important; }
        .eco-btn-main              { background: linear-gradient(135deg, #ff6b35, #f7931e) !important; border: none !important; border-radius: 10px !important; font-weight: 800 !important; font-size: 0.88rem !important; transition: transform 0.15s, box-shadow 0.15s !important; }
        .eco-btn-main:hover        { transform: translateY(-1px) !important; box-shadow: 0 6px 18px rgba(255,107,53,0.35) !important; }
        .eco-btn-outline           { border-radius: 10px !important; font-weight: 700 !important; border: 2px solid #e8eaf6 !important; background: #fff !important; color: #555 !important; transition: all 0.2s !important; }
        .eco-btn-outline:hover     { border-color: #ff6b35 !important; color: #ff6b35 !important; background: #fff7f4 !important; }
        .eco-toggle-btn            { border-radius: 8px !important; font-weight: 700 !important; font-size: 0.8rem !important; padding: 6px 14px !important; border: 2px solid #e8eaf6 !important; background: #fff !important; color: #888 !important; transition: all 0.15s !important; }
        .eco-toggle-btn.active     { border-color: #ff6b35 !important; background: linear-gradient(135deg,#fff3ee,#fff8f4) !important; color: #ff6b35 !important; }
        .eco-color-dot             { width: 26px; height: 26px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: border-color 0.15s, transform 0.15s; display: inline-block; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
        .eco-color-dot.selected    { border-color: #ff6b35 !important; transform: scale(1.2); }
        .eco-image-dropzone        { border: 2.5px dashed #d1d5db; border-radius: 14px; background: #f8faff; min-height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .eco-image-dropzone:hover  { border-color: #ff6b35; background: #fff7f4; }
        .eco-image-dropzone.dragover { border-color: #ff6b35; background: #fff3ee; }
        .eco-img-thumb             { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; border: 2px solid #e8eaf6; }
        .eco-img-remove            { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 50%; background: #ef4444; color: #fff; font-size: 0.6rem; font-weight: 900; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; line-height: 1; }
        .eco-tag-pill              { display: inline-flex; align-items: center; gap: 5px; background: #fff3ee; color: #ff6b35; border-radius: 20px; padding: 3px 10px; font-size: 0.78rem; font-weight: 700; }
        .eco-tag-pill button       { background: none; border: none; color: #ff6b35; cursor: pointer; padding: 0; font-size: 0.8rem; line-height: 1; }
        .eco-success-ring          { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg,#ff6b35,#ffcd3c); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto; }
        .eco-add-more-box          { width: 72px; height: 72px; border-radius: 10px; background: #f1f4ff; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; cursor: pointer; color: #9ca3af; transition: border-color 0.2s, color 0.2s; flex-shrink: 0; }
        .eco-add-more-box:hover    { border-color: #ff6b35; color: #ff6b35; }
        .eco-discount-display      { border-radius: 10px; border: 2px solid #e8eaf6; padding: 9px 13px; font-size: 0.88rem; background: #f8f9ff; font-weight: 700; color: #22c55e; min-height: 42px; display: flex; align-items: center; }
    `;
    document.head.appendChild(s);
};
injectStyle();

export default function EditProductModal({ show, handleClose, product, setRefresh, refresh }) {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [dragover, setDragover] = useState(false);

    // Multi-value fields
    const [selectedColors, setSelectedColors] = useState([]);
    const [customColor, setCustomColor] = useState("#ff6b35");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [imageFiles, setImageFiles] = useState([]); // [{file?, preview, isExisting}]

    // Toggles
    const [isCustomizable, setIsCustomizable] = useState(false);
    const [isReturn, setIsReturn] = useState(false);
    const [isReplace, setIsReplace] = useState(false);

    const [deletedImages, setDeletedImages] = useState([]);

    const {
        register, handleSubmit, watch, reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "", description: "", brand: "",
            base_price: "", old_price: "", discount: "",
            stock: "", sold: "", rating: "", reviews: "",
            return_replace_duration: "", return_replace_instructions: "",
        },
        mode: "onChange",
    });

    const basePriceVal = watch("base_price");
    const oldPriceVal = watch("old_price");

    const computedDiscount =
        basePriceVal && oldPriceVal && Number(oldPriceVal) > 0
            ? (((Number(oldPriceVal) - Number(basePriceVal)) / Number(oldPriceVal)) * 100)
            : null;

    // ── Pre-fill form when product changes ──
    useEffect(() => {
        if (!product) return;

        reset({
            title: product.title || "",
            description: product.description || "",
            brand: product.brand || "",
            base_price: product.base_price || "",
            old_price: product.old_price || "",
            discount: product.discount || "",
            stock: product.stock || "",
            sold: product.sold || "",
            rating: product.rating || "",
            reviews: product.reviews || "",
            return_replace_duration: product.return_replace_duration || "",
            return_replace_instructions: product.return_replace_instructions || "",
        });

        // Colors — support both string "hex1,hex2" and array
        const colors = Array.isArray(product.color)
            ? product.color
            : (product.color || "").split(",").map(c => c.trim()).filter(Boolean);
        setSelectedColors(colors);

        // Tags — support both string and array
        const tagList = Array.isArray(product.tag)
            ? product.tag
            : (product.tag || "").split(",").map(t => t.trim()).filter(Boolean);
        setTags(tagList);

        // Toggles
        setIsReturn(!!product.is_return);
        setIsReplace(!!product.is_replace);
        setIsCustomizable(!!product.is_customizable);

        // Images — support both string "url1,url2" and array
        const urls = Array.isArray(product.image_url)
            ? product.image_url
            : (product.image_url || "").split(",").map(u => u.trim()).filter(Boolean);
        setImageFiles(urls.map(url => ({ preview: url, isExisting: true })));
        console.log('urls', urls)

    }, [product, show, reset]);

    // ── Image Handlers ──
    const addFiles = (files) => {
        const newImgs = Array.from(files).map(file => ({
            file,
            preview: URL.createObjectURL(file),
            isExisting: false,
        }));
        setImageFiles(prev => [...prev, ...newImgs]);
    };

    const handleImageChange = (e) => addFiles(e.target.files);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragover(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    };

    // const removeImage = (index) => {
    //     setImageFiles(prev => {
    //         const img = prev[index];
    //         if (img && !img.isExisting && img.preview) URL.revokeObjectURL(img.preview);
    //         return prev.filter((_, i) => i !== index);
    //     });
    // };

    const removeImage = (index) => {
        setImageFiles(prev => {
            const removed = prev[index];

            if (removed.isExisting) {
                setDeletedImages(d => [...d, removed.preview]);
            }

            return prev.filter((_, i) => i !== index);
        });
    };

    // ── Color Handlers ──
    const toggleColor = (hex) => {
        if (!hex) return;
        setSelectedColors(prev =>
            prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]
        );
    };

    const addCustomColor = () => {
        if (customColor && !selectedColors.includes(customColor)) {
            setSelectedColors(prev => [...prev, customColor]);
        }
    };

    // ── Tag Handlers ──
    const toggleTag = (t) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

    const addCustomTag = () => {
        const val = tagInput.trim();
        if (val && !tags.includes(val)) {
            setTags(prev => [...prev, val]);
            setTagInput("");
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // 👉 existing images
            const existingImages = imageFiles
                .filter(i => i.isExisting)
                .map(i => i.preview);

            // 👉 new images
            const newImages = imageFiles
                .filter(i => !i.isExisting)
                .map(i => i.file);

            // 👉 FormData
            const formData = new FormData();

            // ✅ normal fields
            Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
            });

            // ✅ override / custom fields
            formData.set("discount", computedDiscount);
            formData.set("is_return", isReturn);
            formData.set("is_replace", isReplace);
            formData.set("is_customizable", isCustomizable);

            // ✅ ARRAY FIELDS (IMPORTANT 🔥)
            formData.set("color", selectedColors);
            formData.set("tag", tags);

            // ✅ IMAGE DATA (IMPORTANT 🔥)
            formData.set("existingImages", JSON.stringify(existingImages));
            formData.set("deletedImages", JSON.stringify(deletedImages));

            // ✅ FILES (multer name must match backend)
            newImages.forEach(file => {
                formData.append("images", file);
            });
            
            if (!newImages.length && !existingImages.length) {
                toast.error("Upload Atleast One Image!")
                return;
            }

            const response = await productApi.updateProduct(product.id, formData);

            if (response.success) {
                toast.success("Product updated successfully!");
                setSubmitted(true);
                setRefresh(!refresh);
            } else {
                toast.error(response.message || "Update failed. Please try again.");
            }

            handleClose();

        } catch (err) {
            console.error(err);
            toast.error("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => { reset(); setSelectedColors([]); setTags([]); setImageFiles([]); setSubmitted(false); handleClose(); };

    return (
        <Modal show={show} onHide={handleReset} size="xl" centered scrollable className="eco-modal">
            <Modal.Header closeButton className="border-0 px-4 pt-4 pb-3" style={{ background: "#fff" }}>
                <Modal.Title className="fw-bold d-flex align-items-center gap-2" style={{ color: "black", fontFamily: "Nunito", fontSize: "1.3rem" }}>
                    Edit Product
                    {product?.title && (
                        <span className="fw-normal " style={{ fontSize: "0.85rem" }}>
                            — {product.title.length > 40 ? product.title.slice(0, 40) + "…" : product.title}
                        </span>
                    )}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 pb-4" style={{ background: "#f8f9ff" }}>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap={3}>

                        {/* ── SECTION 1: BASIC INFO ── */}
                        <div className="eco-section-card">
                            <div className="eco-section-title mb-3">📋 Basic Information</div>
                            <Row className="g-3">
                                <Col md={8}>
                                    <label className="eco-label">Product Title *</label>
                                    <Form.Control
                                        className={`eco-input ${errors.title ? "is-invalid" : ""}`}
                                        placeholder="e.g. Premium Cotton Casual T-Shirt"
                                        {...register("title", { required: "Title is required", minLength: { value: 5, message: "Min 5 characters" } })}
                                    />
                                    {errors.title && <div className="invalid-feedback d-block" style={{ fontSize: "0.78rem" }}>{errors.title.message}</div>}
                                </Col>
                                <Col md={4}>
                                    <label className="eco-label">Brand *</label>
                                    <Form.Control
                                        className={`eco-input ${errors.brand ? "is-invalid" : ""}`}
                                        placeholder="e.g. Nike"
                                        {...register("brand", { required: "Brand is required" })}
                                    />
                                    {errors.brand && <div className="invalid-feedback d-block" style={{ fontSize: "0.78rem" }}>{errors.brand.message}</div>}
                                </Col>
                                <Col xs={12}>
                                    <label className="eco-label">Description *</label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        className={`eco-textarea ${errors.description ? "is-invalid" : ""}`}
                                        placeholder="Describe your product in detail..."
                                        {...register("description", { required: "Description is required", minLength: { value: 10, message: "Min 10 characters" } })}
                                    />
                                    {errors.description && <div className="invalid-feedback d-block" style={{ fontSize: "0.78rem" }}>{errors.description.message}</div>}
                                </Col>
                            </Row>
                        </div>

                        {/* ── SECTION 2: PRICING & INVENTORY ── */}
                        <div className="eco-section-card">
                            <div className="eco-section-title mb-3">💰 Pricing & Inventory</div>
                            <Row className="g-3">
                                <Col sm={6} md={3}>
                                    <label className="eco-label">Selling Price (₹) *</label>
                                    <InputGroup>
                                        <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "10px 0 0 10px", background: "#f8f9ff", fontWeight: 700 }}>₹</InputGroup.Text>
                                        <Form.Control
                                            className={`eco-input ${errors.base_price ? "is-invalid" : ""}`}
                                            style={{ borderRadius: "0 10px 10px 0", borderLeft: "none" }}
                                            type="number" min="1" placeholder="499"
                                            {...register("base_price", { required: "Required", min: { value: 1, message: "Must be > 0" } })}
                                        />
                                    </InputGroup>
                                    {errors.base_price && <div className="text-danger mt-1" style={{ fontSize: "0.75rem" }}>{errors.base_price.message}</div>}
                                </Col>
                                <Col sm={6} md={3}>
                                    <label className="eco-label">MRP / Old Price (₹)</label>
                                    <InputGroup>
                                        <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "10px 0 0 10px", background: "#f8f9ff", fontWeight: 700 }}>₹</InputGroup.Text>
                                        <Form.Control
                                            className="eco-input"
                                            style={{ borderRadius: "0 10px 10px 0", borderLeft: "none" }}
                                            type="number" min="0" placeholder="999"
                                            {...register("old_price")}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col sm={6} md={3}>
                                    <label className="eco-label">Discount</label>
                                    <div className="eco-discount-display">
                                        {computedDiscount !== null
                                            ? <><span style={{ color: "#22c55e" }}>💡 {computedDiscount}% off</span></>
                                            : <span className="text-muted fw-normal" style={{ fontSize: "0.85rem" }}>Auto-calculated</span>
                                        }
                                    </div>
                                </Col>
                                <Col sm={6} md={3}>
                                    <label className="eco-label">Stock *</label>
                                    <Form.Control
                                        className={`eco-input ${errors.stock ? "is-invalid" : ""}`}
                                        type="number" min="0" placeholder="100"
                                        {...register("stock", { required: "Required", min: { value: 0, message: "Cannot be negative" } })}
                                    />
                                    {errors.stock && <div className="invalid-feedback d-block" style={{ fontSize: "0.75rem" }}>{errors.stock.message}</div>}
                                </Col>
                                <Col sm={6} md={3}>
                                    <label className="eco-label">Units Sold</label>
                                    <Form.Control className="eco-input" type="number" min="0" placeholder="0" {...register("sold")} />
                                </Col>
                                <Col sm={6} md={3}>
                                    <label className="eco-label">Rating (0–5)</label>
                                    <Form.Control className="eco-input" type="number" min="0" max="5" step="0.1" placeholder="4.5" {...register("rating", { min: 0, max: 5 })} />
                                </Col>
                                <Col sm={6} md={3}>
                                    <label className="eco-label">Reviews Count</label>
                                    <Form.Control className="eco-input" type="number" min="0" placeholder="0" {...register("reviews")} />
                                </Col>
                            </Row>
                        </div>

                        {/* ── SECTION 3: IMAGES ── */}
                        <div className="eco-section-card">
                            <div className="eco-section-title mb-3">🖼️ Product Images</div>

                            {/* Drag & Drop Zone */}
                            <div
                                className={`eco-image-dropzone mb-3 ${dragover ? "dragover" : ""}`}
                                onClick={() => document.getElementById("edit-img-upload").click()}
                                onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
                                onDragLeave={() => setDragover(false)}
                                onDrop={handleDrop}
                            >
                                {console.log("imageFiles", imageFiles)}
                                {imageFiles.length === 0 ? (
                                    <div className="text-center text-muted py-3">
                                        <div style={{ fontSize: "2rem" }}>📸</div>
                                        <div className="fw-bold" style={{ fontSize: "0.88rem" }}>Click or drag & drop images here</div>
                                        <div style={{ fontSize: "0.75rem" }}>PNG, JPG, WEBP supported · Multiple allowed</div>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2 p-3 w-100 align-items-center">
                                        {imageFiles.map((img, i) => (
                                            <div key={i} className="position-relative flex-shrink-0">
                                                <img src={img.preview} alt="" className="eco-img-thumb" />
                                                {img.isExisting && (
                                                    <div
                                                        title="Existing image"
                                                        style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#fff", fontSize: "0.55rem", fontWeight: 900, borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap" }}
                                                    >
                                                        SAVED
                                                    </div>
                                                )}
                                                <div className="eco-img-remove" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>✕</div>
                                            </div>
                                        ))}
                                        {/* Add more box */}
                                        <div className="eco-add-more-box flex-shrink-0" title="Add more images">+</div>
                                    </div>
                                )}
                                <input id="edit-img-upload" type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
                            </div>

                            {/* Image count summary */}
                            {imageFiles.length > 0 && (
                                <div className="d-flex gap-3" style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700 }}>
                                    <span>📷 Total: {imageFiles.length}</span>
                                    <span style={{ color: "#22c55e" }}>✅ Saved: {imageFiles.filter(i => i.isExisting).length}</span>
                                    <span style={{ color: "#f7931e" }}>🆕 New: {imageFiles.filter(i => !i.isExisting).length}</span>
                                    <button
                                        type="button"
                                        style={{ background: "none", border: "none", color: "#dc2626", fontWeight: 700, cursor: "pointer", padding: 0, fontSize: "0.78rem" }}
                                        onClick={() => setImageFiles([])}
                                    >
                                        🗑️ Clear all
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── SECTION 4: COLORS & TAGS ── */}
                        <div className="eco-section-card">
                            <div className="eco-section-title mb-3">🎨 Colors & Tags</div>
                            <Row className="g-4">
                                {/* Colors */}
                                <Col md={6}>
                                    <label className="eco-label mb-2">Available Colors</label>
                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                        {PRESET_COLORS.map(c => (
                                            <div
                                                key={c.hex}
                                                className={`eco-color-dot ${selectedColors.includes(c.hex) ? "selected" : ""}`}
                                                style={{ background: c.hex }}
                                                title={c.name}
                                                onClick={() => toggleColor(c.hex)}
                                            />
                                        ))}
                                    </div>
                                    <InputGroup size="sm">
                                        <Form.Control
                                            type="color"
                                            value={customColor}
                                            onChange={e => setCustomColor(e.target.value)}
                                            style={{ width: 42, padding: 3, borderRadius: "8px 0 0 8px", border: "2px solid #e8eaf6", cursor: "pointer" }}
                                        />
                                        <Form.Control
                                            className="eco-input"
                                            style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", fontSize: "0.82rem" }}
                                            placeholder="Hex e.g. #ff6b35"
                                            value={customColor}
                                            onChange={e => setCustomColor(e.target.value)}
                                        />
                                        <Button type="button" className="eco-btn-main text-white px-3" style={{ borderRadius: "0 8px 8px 0", fontSize: "0.82rem" }} onClick={addCustomColor}>Add</Button>
                                    </InputGroup>
                                    {/* Selected colors display */}
                                    {selectedColors.length > 0 && (
                                        <div className="d-flex flex-wrap gap-2 mt-3">
                                            {selectedColors.map(c => (
                                                <div key={c} className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill fw-bold" style={{ background: "#f3f4f6", fontSize: "0.75rem", color: "#374151" }}>
                                                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: c, display: "inline-block", border: "1px solid rgba(0,0,0,0.1)", flexShrink: 0 }} />
                                                    {c}
                                                    <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "0.8rem", padding: 0, lineHeight: 1 }} onClick={() => toggleColor(c)}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Col>

                                {/* Tags */}
                                <Col md={6}>
                                    <label className="eco-label mb-2">Product Tags</label>
                                    <div className="d-flex flex-wrap gap-1 mb-3">
                                        {PRESET_TAGS.map(t => (
                                            <Badge
                                                key={t}
                                                bg={tags.includes(t) ? "warning" : "light"}
                                                text={tags.includes(t) ? "dark" : "secondary"}
                                                className="rounded-pill px-2 py-1 fw-semibold"
                                                style={{ cursor: "pointer", fontSize: "0.75rem", border: tags.includes(t) ? "2px solid #f7931e" : "2px solid #e8eaf6" }}
                                                onClick={() => toggleTag(t)}
                                            >
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>
                                    <InputGroup size="sm">
                                        <Form.Control
                                            className="eco-input"
                                            style={{ borderRadius: "8px 0 0 8px", fontSize: "0.82rem" }}
                                            placeholder="Custom tag..."
                                            value={tagInput}
                                            onChange={e => setTagInput(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                                        />
                                        <Button type="button" className="eco-btn-main text-white px-3" style={{ borderRadius: "0 8px 8px 0", fontSize: "0.82rem" }} onClick={addCustomTag}>Add</Button>
                                    </InputGroup>
                                    {/* Selected custom tags */}
                                    {tags.filter(t => !PRESET_TAGS.includes(t)).length > 0 && (
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            {tags.filter(t => !PRESET_TAGS.includes(t)).map(t => (
                                                <div key={t} className="eco-tag-pill">
                                                    {t}
                                                    <button type="button" onClick={() => toggleTag(t)}>✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </div>

                        {/* ── SECTION 5: OPTIONS & RETURN POLICY ── */}
                        <div className="eco-section-card">
                            <div className="eco-section-title mb-3">↩️ Options & Return Policy</div>
                            <Row className="g-3">
                                {/* Toggles */}
                                <Col xs={12}>
                                    <label className="eco-label mb-2">Product Options</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {[
                                            { label: "✏️ Customizable", state: isCustomizable, toggle: () => setIsCustomizable(v => !v) },
                                            { label: "↩️ Return Allowed", state: isReturn, toggle: () => setIsReturn(v => !v) },
                                            { label: "🔄 Replacement Allowed", state: isReplace, toggle: () => setIsReplace(v => !v) },
                                        ].map(({ label, state, toggle }) => (
                                            <button
                                                key={label} type="button"
                                                className={`eco-toggle-btn ${state ? "active" : ""}`}
                                                onClick={toggle}
                                            >
                                                {state ? "✅ " : ""}{label}
                                            </button>
                                        ))}
                                    </div>
                                </Col>

                                {/* Return/Replace details */}
                                {(isReturn || isReplace) && (
                                    <>
                                        <Col sm={4}>
                                            <label className="eco-label">Duration (Days) *</label>
                                            <InputGroup>
                                                <Form.Control
                                                    className={`eco-input ${errors.return_replace_duration ? "is-invalid" : ""}`}
                                                    style={{ borderRadius: "10px 0 0 10px" }}
                                                    type="number" min="1" placeholder="7"
                                                    {...register("return_replace_duration", {
                                                        required: "Duration is required",
                                                        min: { value: 1, message: "Min 1 day" },
                                                    })}
                                                />
                                                <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderLeft: "none", borderRadius: "0 10px 10px 0", background: "#f8f9ff", fontWeight: 700, fontSize: "0.82rem" }}>days</InputGroup.Text>
                                            </InputGroup>
                                            {errors.return_replace_duration && <div className="text-danger mt-1" style={{ fontSize: "0.75rem" }}>{errors.return_replace_duration.message}</div>}
                                        </Col>
                                        <Col sm={8}>
                                            <label className="eco-label">Instructions</label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                className="eco-textarea"
                                                placeholder="e.g. Product must be unused with original packaging and all tags intact."
                                                {...register("return_replace_instructions")}
                                            />
                                        </Col>
                                    </>
                                )}
                            </Row>
                        </div>

                    </Stack>

                    {/* ── FOOTER ACTIONS ── */}
                    <div className="d-flex gap-2 mt-4 pt-3" style={{ borderTop: "2px solid #f1f4ff" }}>
                        <Button type="submit" className="eco-btn-main text-white flex-fill py-2" disabled={loading}>
                            {loading ? "⏳ Saving Changes..." : "💾 Save Changes"}
                        </Button>
                        <Button type="button" className="eco-btn-outline px-4 py-2" onClick={handleReset} disabled={loading}>
                            Cancel
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}