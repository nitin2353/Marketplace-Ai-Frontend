import { useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Badge from "react-bootstrap/Badge";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import productApi from "../../api/product.api";
import toast from "react-hot-toast";
import './CreateProduct.css'
import SellerSidebar from "../../components/SellerSidebar";


const PRESET_TAGS = ["New Arrival", "Trending", "Best Seller", "Limited Edition", "Eco Friendly", "Premium", "Sale"];

export default function CreateProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // ── VARIANT TOGGLE: null = not selected yet, true = has variants, false = no variants
    const [hasVariants, setHasVariants] = useState(null);

    // Multi-value fields
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [imageFiles, setImageFiles] = useState([]);
    const [variants, setVariants] = useState([
        { color: "#000000", size: "", price: "", old_price: "", stock: "" }
    ]);

    // Toggle states
    const [isCustomizable, setIsCustomizable] = useState(false);
    const [isReturn, setIsReturn] = useState(false);
    const [isReplace, setIsReplace] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            brand: "",
            category: "",
            base_price: "",
            old_price: "",
            discount: "",
            rating: "",
            reviews: "",
            sold: "",
            stock: "",
            return_replace_duration: "",
            return_replace_instructions: "",
        },
        mode: "onChange",
    });

    const basePriceVal = watch("base_price");
    const oldPriceVal = watch("old_price");

    const computedDiscount =
        basePriceVal && oldPriceVal && Number(oldPriceVal) > 0
            ? Math.round(((Number(oldPriceVal) - Number(basePriceVal)) / Number(oldPriceVal)) * 100)
            : null;

    // Tag helpers
    const addTag = (t) => {
        const val = t || tagInput.trim();
        if (val && !tags.includes(val)) setTags((prev) => [...prev, val]);
        setTagInput("");
    };
    const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t));

    // Variant helpers
    const handleVariantChange = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };
    const addVariant = () => {
        setVariants([...variants, { color: "#000000", size: "", price: "", old_price: "", stock: "" }]);
    };
    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    // ── Validate variants before submit
    const validateVariants = () => {
        if (!hasVariants) return true; // no variants needed
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v.color) { toast.error(`Variant ${i + 1}: Color is required`); return false; }
            if (!v.size) { toast.error(`Variant ${i + 1}: Size is required`); return false; }
            if (!v.price || Number(v.price) <= 0) { toast.error(`Variant ${i + 1}: Valid price is required`); return false; }
            if (v.stock === "" || v.stock === null) { toast.error(`Variant ${i + 1}: Stock is required`); return false; }
        }
        return true;
    };

    const onSubmit = async (payload) => {
        // Guard: must choose variant mode
        if (hasVariants === null) {
            toast.error("Please select whether your product has variants or not.");
            return;
        }
        if (imageFiles.length <= 0) {
            toast.error("Upload at least one image!");
            return;
        }
        if (!validateVariants()) return;

        setLoading(true);
        try {
            const formData = new FormData();

            const final = {
                ...payload,
                tag: tags.join(', ') || "",
                // ── If no variants, color comes from payload (not used), keep empty
                color: hasVariants ? "" : "",
                is_return: isReturn,
                is_replace: isReplace,
                is_customizable: isCustomizable,
            };

            Object.keys(final).forEach(key => {
                formData.append(key, final[key]);
            });

            // ── Only append variants if hasVariants is true
            if (hasVariants) {
                formData.append("variants", JSON.stringify(variants));
            } else {
                formData.append("variants", JSON.stringify([]));
            }

            imageFiles.forEach((img) => {
                formData.append("images", img.file);
            });

            const res = await productApi.createProduct(formData);

            if (res?.success) {
                setSubmitted(true);
                toast.success("Product Created Successfully");
                setTags([]);
                setImageFiles([]);
                setVariants([{ color: "#000000", size: "", price: "", old_price: "", stock: "" }]);
                setHasVariants(null);
                navigate('/seller/products');
            }

        } catch (err) {
            console.error("Create Product Error:", err?.response?.data || err);
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // ── SUCCESS STATE ──
    if (submitted) {
        return (
            <Container fluid className="eco-hero d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
                <Card className="eco-card text-center p-5" style={{ maxWidth: 440 }}>
                    <div className="eco-success-ring mb-3">✅</div>
                    <h2 className="fw-bold mb-2" style={{ fontFamily: "Nunito", fontSize: "1.9rem" }}>Product Listed!</h2>
                    <p className="text-muted mb-3">Your product has been successfully created and is now live on ShopEase.</p>
                    <Alert variant="warning" className="rounded-4 border-0 fw-bold py-2">
                        🎉 Customers can now discover and buy your product!
                    </Alert>
                    <div className="d-flex gap-2 mt-3">
                        <Button className="eco-btn-main flex-fill text-white" onClick={() => setSubmitted(false)}>
                            + Add Another
                        </Button>
                        <Button className="eco-btn-outline flex-fill" onClick={() => navigate("/seller/products")}>
                            My Products
                        </Button>
                    </div>
                </Card>
            </Container>
        );
    }

    return (
        <Container fluid className="p-0" style={{ minHeight: "100vh", background: "#f1f4ff" }}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Row className="g-0" style={{ minHeight: "100vh" }}>

                    {/* ── LEFT SIDEBAR ── */}
                    <Col lg={3} xl={2}>
                        <SellerSidebar />
                    </Col>

                    {/* ── MAIN CONTENT ── */}
                    <Col lg={9} xl={10} className="p-3 p-md-4 p-lg-5" style={{ overflowY: "auto" }}>

                        {/* Mobile header */}
                        <div className="d-lg-none mb-4 d-flex align-items-center gap-3">
                            <div className="fw-black" style={{ fontFamily: "Nunito", fontSize: "1.5rem", color: "#ff6b35", fontWeight: 900 }}>
                                🛍️ ShopEase
                            </div>
                            <Badge bg="warning" text="dark" className="rounded-pill fw-bold">Seller Dashboard</Badge>
                        </div>

                        {/* Page title */}
                        <div className="mb-4">
                            <h2 className="fw-bold mb-1" style={{ fontFamily: "Nunito", fontSize: "1.8rem", color: "#1a1a2e" }}>
                                List a New Product
                            </h2>
                            <p style={{ fontSize: "0.88rem", color: "#777", marginBottom: 0 }}>
                                Fill in all details carefully — complete listings sell 3x faster!
                            </p>
                        </div>

                        <Stack gap={4}>

                            {/* ════════════════════════════════════════════
                                STEP 0 — VARIANT MODE SELECTOR
                                Must be chosen before rest of the form
                            ════════════════════════════════════════════ */}
                            <Card className="eco-section-card p-4" style={{ border: hasVariants === null ? "2px solid #f7931e" : "2px solid #e8eaf6" }}>
                                <div className="eco-section-title">⚙️ Step 1 — Product Type</div>
                                <p style={{ fontSize: "0.88rem", color: "#6b7280", marginBottom: 16 }}>
                                    Does your product come in multiple variants (different sizes, colors, prices)?
                                </p>

                                <div className="d-flex gap-3 flex-wrap">
                                    {/* No Variants */}
                                    <div
                                        onClick={() => setHasVariants(false)}
                                        style={{
                                            flex: 1,
                                            minWidth: 200,
                                            padding: "20px 24px",
                                            borderRadius: 16,
                                            border: `2px solid ${hasVariants === false ? "#22c55e" : "#e8eaf6"}`,
                                            background: hasVariants === false ? "#f0fdf4" : "#fff",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>📦</div>
                                        <div style={{ fontWeight: 800, fontSize: "1rem", color: "#1a1a2e", fontFamily: "Nunito", marginBottom: 4 }}>
                                            Single Product
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                                            One price, one stock. No size or color options.
                                        </div>
                                        {hasVariants === false && (
                                            <div style={{ marginTop: 10, fontWeight: 800, fontSize: "0.78rem", color: "#16a34a" }}>✔ Selected</div>
                                        )}
                                    </div>

                                    {/* Has Variants */}
                                    <div
                                        onClick={() => setHasVariants(true)}
                                        style={{
                                            flex: 1,
                                            minWidth: 200,
                                            padding: "20px 24px",
                                            borderRadius: 16,
                                            border: `2px solid ${hasVariants === true ? "#ff6b35" : "#e8eaf6"}`,
                                            background: hasVariants === true ? "#fff7f0" : "#fff",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>🎨</div>
                                        <div style={{ fontWeight: 800, fontSize: "1rem", color: "#1a1a2e", fontFamily: "Nunito", marginBottom: 4 }}>
                                            Has Variants
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                                            Multiple sizes, colors or price tiers.
                                        </div>
                                        {hasVariants === true && (
                                            <div style={{ marginTop: 10, fontWeight: 800, fontSize: "0.78rem", color: "#ff6b35" }}>✔ Selected</div>
                                        )}
                                    </div>
                                </div>

                                {hasVariants === null && (
                                    <Alert variant="warning" className="rounded-3 border-0 mt-3 py-2" style={{ background: "#fff8e6", fontSize: "0.83rem" }}>
                                        ⚠️ Please select a product type above to continue filling the form.
                                    </Alert>
                                )}
                            </Card>

                            {/* ── Rest of form only shows after variant mode is chosen ── */}
                            {hasVariants !== null && (
                                <>
                                    {/* ════════════════════════════════════════════
                                        STEP 2 — BASIC INFO
                                    ════════════════════════════════════════════ */}
                                    <Card className="eco-section-card p-4">
                                        <div className="eco-section-title">📋 Step 2 — Basic Information</div>
                                        <Row className="g-3">
                                            <Col md={4}>
                                                <label className="eco-label">Product Title *</label>
                                                <Form.Control
                                                    className={`eco-input ${errors.title ? "is-invalid" : ""}`}
                                                    placeholder="e.g. Premium Cotton Casual T-Shirt"
                                                    {...register("title", {
                                                        required: "Product title is required",
                                                        minLength: { value: 5, message: "Title must be at least 5 characters" }
                                                    })}
                                                />
                                                {errors.title && <div className="invalid-feedback d-block">{errors.title.message}</div>}
                                            </Col>
                                            <Col md={4}>
                                                <label className="eco-label">Category *</label>
                                                <Form.Control
                                                    className={`eco-input ${errors.category ? "is-invalid" : ""}`}
                                                    placeholder="e.g. Fashion, Electronics"
                                                    {...register("category", { required: "Category is required" })}
                                                />
                                                {errors.category && <div className="invalid-feedback d-block">{errors.category.message}</div>}
                                            </Col>
                                            <Col md={4}>
                                                <label className="eco-label">Brand *</label>
                                                <Form.Control
                                                    className={`eco-input ${errors.brand ? "is-invalid" : ""}`}
                                                    placeholder="e.g. Nike, Generic"
                                                    {...register("brand", { required: "Brand is required" })}
                                                />
                                                {errors.brand && <div className="invalid-feedback d-block">{errors.brand.message}</div>}
                                            </Col>
                                            <Col xs={12}>
                                                <label className="eco-label">Description *</label>
                                                <Form.Control
                                                    as="textarea"
                                                    className={`eco-textarea ${errors.description ? "is-invalid" : ""}`}
                                                    placeholder="Describe your product — material, size guide, usage, etc."
                                                    rows={4}
                                                    {...register("description", {
                                                        required: "Description is required",
                                                        minLength: { value: 20, message: "Description must be at least 20 characters" }
                                                    })}
                                                />
                                                {errors.description && <div className="invalid-feedback d-block">{errors.description.message}</div>}
                                            </Col>
                                        </Row>
                                    </Card>

                                    <Card className="eco-section-card p-4">
                                        <div className="eco-section-title">💰 Step 3 — Pricing & Inventory</div>

                                        {hasVariants && (
                                            <Alert variant="info" className="rounded-3 border-0 mb-3 py-2" style={{ background: "#eff6ff", fontSize: "0.83rem", color: "#1d4ed8" }}>
                                                ℹ️ Since your product has variants, <b>price and stock per variant</b> will be set in Step 4 below. Base price here is used as the default/display price only.
                                            </Alert>
                                        )}

                                        <Row className="g-3">
                                            <Col sm={6} md={3}>
                                                <label className="eco-label">
                                                    {hasVariants ? "Base / Display Price (₹) *" : "Selling Price (₹) *"}
                                                </label>
                                                <InputGroup>
                                                    <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff", fontWeight: 700 }}>₹</InputGroup.Text>
                                                    <Form.Control
                                                        className={`eco-input ${errors.base_price ? "is-invalid" : ""}`}
                                                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                                                        type="number"
                                                        min="0"
                                                        placeholder="499"
                                                        {...register("base_price", {
                                                            required: "Base price is required",
                                                            min: { value: 1, message: "Price must be > 0" },
                                                        })}
                                                    />
                                                </InputGroup>
                                                {errors.base_price && <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>{errors.base_price.message}</div>}
                                            </Col>

                                            <Col sm={6} md={3}>
                                                <label className="eco-label">MRP / Old Price (₹) *</label>
                                                <InputGroup>
                                                    <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff", fontWeight: 700 }}>₹</InputGroup.Text>
                                                    <Form.Control
                                                        style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                                                        className="eco-input"
                                                        type="number"
                                                        min="0"
                                                        placeholder="999"
                                                        {...register("old_price", { required: "Old price is required" })}
                                                    />
                                                </InputGroup>
                                            </Col>

                                            <Col sm={6} md={3}>
                                                <label className="eco-label">Discount (%)</label>
                                                <Form.Control
                                                    className="eco-input"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    disabled
                                                    placeholder={computedDiscount !== null ? `Auto: ${computedDiscount}%` : "0"}
                                                    {...register("discount", { min: 0, max: 100 })}
                                                />
                                                {computedDiscount !== null && (
                                                    <div className="mt-1 fw-bold" style={{ fontSize: "0.77rem", color: "#22c55e" }}>
                                                        💡 Auto: {computedDiscount}% off
                                                    </div>
                                                )}
                                            </Col>

                                            {/* Stock — required only for single product */}
                                            <Col sm={6} md={3}>
                                                <label className="eco-label">
                                                    Stock Quantity {"*"}
                                                </label>
                                                <Form.Control
                                                    className={`eco-input ${errors.stock ? "is-invalid" : ""}`}
                                                    type="number"
                                                    min="0"
                                                    placeholder="100"
                                                    {...register("stock", {
                                                        required: "Stock is required",
                                                        min: { value: 0, message: "Stock can't be negative" }
                                                    })}
                                                />
                                                {errors.stock && <div className="invalid-feedback d-block">{errors.stock.message}</div>}
                                            </Col>

                                            <Col sm={6} md={3}>
                                                <label className="eco-label">Total Units Sold</label>
                                                <Form.Control className="eco-input" type="number" min="0" placeholder="0" {...register("sold")} />
                                            </Col>

                                            <Col sm={6} md={3}>
                                                <label className="eco-label">Rating (0–5)</label>
                                                <Form.Control className="eco-input" type="number" min="0" max="5" step="0.1" placeholder="4.5" {...register("rating", { min: 0, max: 5 })} />
                                            </Col>

                                            <Col sm={6} md={3}>
                                                <label className="eco-label">Total Reviews</label>
                                                <Form.Control className="eco-input" type="number" min="0" placeholder="0" {...register("reviews")} />
                                            </Col>
                                        </Row>
                                    </Card>

                                    {/* ════════════════════════════════════════════
                                        STEP 4 — VARIANTS (only if hasVariants = true)
                                    ════════════════════════════════════════════ */}
                                    {hasVariants && (
                                        <Card className="eco-section-card p-4" style={{ border: "2px solid #fff0e6" }}>
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <div className="eco-section-title" style={{ marginBottom: 0 }}>🎨 Step 4 — Variants</div>
                                                <Button
                                                    type="button"
                                                    className="eco-btn-main text-white"
                                                    style={{ fontSize: "0.82rem", padding: "6px 16px" }}
                                                    onClick={addVariant}
                                                >
                                                    + Add Variant
                                                </Button>
                                            </div>
                                            <p style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: 16 }}>
                                                Each variant = unique combination of color + size. Set its own price and stock.
                                            </p>

                                            {variants.map((variant, index) => (
                                                <Card key={index} className="p-3 mb-3" style={{ background: "#f8f9ff", border: "1.5px solid #e8eaf6", borderRadius: 14 }}>
                                                    {/* Variant header */}
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#374151", display: "flex", alignItems: "center", gap: 8 }}>
                                                            <span style={{ background: "#ff6b35", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 900 }}>
                                                                {index + 1}
                                                            </span>
                                                            Variant {index + 1}
                                                            {variant.color && (
                                                                <span style={{ width: 16, height: 16, borderRadius: "50%", background: variant.color, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)", display: "inline-block" }} />
                                                            )}
                                                            {variant.size && (
                                                                <span style={{ background: "#e8eaf6", borderRadius: 6, padding: "1px 8px", fontSize: "0.72rem", fontWeight: 800 }}>{variant.size}</span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline-danger"
                                                            size="sm"
                                                            style={{ borderRadius: 8, fontSize: "0.78rem" }}
                                                            onClick={() => removeVariant(index)}
                                                            disabled={variants.length <= 1}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>

                                                    <Row className="g-3 align-items-end">
                                                        {/* Color */}
                                                        <Col md={2} sm={6}>
                                                            <label className="eco-label">Color *</label>
                                                            <div className="d-flex gap-2 align-items-center">
                                                                <Form.Control
                                                                    type="color"
                                                                    value={variant.color || "#000000"}
                                                                    onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                                                                    style={{ width: 44, height: 40, padding: 3, borderRadius: 8, border: "2px solid #e8eaf6", cursor: "pointer" }}
                                                                />
                                                                <Form.Control
                                                                    className="eco-input"
                                                                    type="text"
                                                                    placeholder="#ffffff"
                                                                    value={variant.color || ""}
                                                                    onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                                                                    style={{ fontSize: "0.82rem" }}
                                                                />
                                                            </div>
                                                        </Col>

                                                        {/* Size */}
                                                        <Col md={2} sm={6}>
                                                            <label className="eco-label">Size *</label>
                                                            <Form.Select
                                                                className="eco-input"
                                                                value={variant.size}
                                                                onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                                                            >
                                                                <option value="">Select size</option>
                                                                {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map(s => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </Form.Select>
                                                        </Col>

                                                        {/* Price */}
                                                        <Col md={2} sm={6}>
                                                            <label className="eco-label">Price (₹) *</label>
                                                            <InputGroup>
                                                                <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "10px 0 0 10px", background: "#f8f9ff", fontWeight: 700, fontSize: "0.8rem" }}>₹</InputGroup.Text>
                                                                <Form.Control
                                                                    className="eco-input"
                                                                    style={{ borderRadius: "0 10px 10px 0", borderLeft: "none" }}
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="499"
                                                                    value={variant.price}
                                                                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                                                />
                                                            </InputGroup>
                                                        </Col>

                                                        {/* Old Price */}
                                                        <Col md={2} sm={6}>
                                                            <label className="eco-label">Old Price (₹)</label>
                                                            <InputGroup>
                                                                <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "10px 0 0 10px", background: "#f8f9ff", fontWeight: 700, fontSize: "0.8rem" }}>₹</InputGroup.Text>
                                                                <Form.Control
                                                                    className="eco-input"
                                                                    style={{ borderRadius: "0 10px 10px 0", borderLeft: "none" }}
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="999"
                                                                    value={variant.old_price}
                                                                    onChange={(e) => handleVariantChange(index, "old_price", e.target.value)}
                                                                />
                                                            </InputGroup>
                                                        </Col>

                                                        {/* Stock */}
                                                        <Col md={2} sm={6}>
                                                            <label className="eco-label">Stock *</label>
                                                            <Form.Control
                                                                className="eco-input"
                                                                type="number"
                                                                min="0"
                                                                placeholder="50"
                                                                value={variant.stock}
                                                                onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                                                            />
                                                        </Col>

                                                        {/* Auto discount preview */}
                                                        <Col md={2} sm={6}>
                                                            {variant.price && variant.old_price && Number(variant.old_price) > Number(variant.price) && (
                                                                <div style={{ background: "#dcfce7", borderRadius: 10, padding: "8px 12px", fontSize: "0.78rem", fontWeight: 800, color: "#166534" }}>
                                                                    💡 {Math.round(((Number(variant.old_price) - Number(variant.price)) / Number(variant.old_price)) * 100)}% off
                                                                </div>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            ))}
                                        </Card>
                                    )}

                                    {/* ════════════════════════════════════════════
                                        STEP (4 or 5) — IMAGES
                                    ════════════════════════════════════════════ */}
                                    <Card className="eco-section-card p-4">
                                        <div className="eco-section-title">🖼️ Step {hasVariants ? "5" : "4"} — Product Images *</div>

                                        <Stack gap={2} className="mb-3">
                                            <InputGroup>
                                                <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>
                                                    📁
                                                </InputGroup.Text>
                                                <Form.Control
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="eco-input"
                                                    style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        const newImages = files.map(file => ({
                                                            file,
                                                            preview: URL.createObjectURL(file)
                                                        }));
                                                        setImageFiles((prev) => [...prev, ...newImages]);
                                                        e.target.value = ""; // reset so same file can be re-added
                                                    }}
                                                />
                                            </InputGroup>

                                            {imageFiles.length > 0 && (
                                                <div className="d-flex flex-wrap gap-3 mt-2">
                                                    {imageFiles.map((img, i) => (
                                                        <div key={i} style={{ position: "relative" }}>
                                                            <img
                                                                src={img.preview}
                                                                alt="preview"
                                                                style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 12, border: "2px solid #e8eaf6" }}
                                                            />
                                                            {i === 0 && (
                                                                <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, textAlign: "center", fontSize: "0.6rem", fontWeight: 900, background: "#ff6b35", color: "#fff", borderRadius: "0 0 10px 10px" }}>COVER</div>
                                                            )}
                                                            <Button
                                                                type="button"
                                                                variant="outline-danger"
                                                                size="sm"
                                                                style={{ position: "absolute", top: -8, right: -8, borderRadius: "50%", padding: "2px 6px" }}
                                                                onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                            >
                                                                ✕
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {imageFiles.length === 0 && (
                                                <Alert variant="warning" className="rounded-3 border-0 mt-1 py-2" style={{ background: "#fff8e6", fontSize: "0.82rem" }}>
                                                    ⚠️ At least 1 image is required. First image will be used as cover.
                                                </Alert>
                                            )}
                                        </Stack>
                                    </Card>

                                    {/* ════════════════════════════════════════════
                                        STEP — TAGS & OPTIONS
                                    ════════════════════════════════════════════ */}
                                    <Card className="eco-section-card p-4">
                                        <div className="eco-section-title">🏷️ Step {hasVariants ? "6" : "5"} — Tags & Options</div>

                                        <label className="eco-label mb-2">Product Tags</label>
                                        <div className="d-flex flex-wrap gap-2 mb-2">
                                            {PRESET_TAGS.map((t) => (
                                                <Badge
                                                    key={t}
                                                    bg={tags.includes(t) ? "warning" : "light"}
                                                    className="rounded-3 border-0 px-3 py-2 fw-semibold text-light"
                                                    text={tags.includes(t) ? "dark" : "secondary"}
                                                    style={{ cursor: "pointer", fontSize: "0.78rem", border: tags.includes(t) ? "2px solid #f7931e" : "2px solid #e8eaf6" }}
                                                    onClick={() => tags.includes(t) ? removeTag(t) : addTag(t)}
                                                >
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                        <InputGroup className="mb-3 mt-3" style={{ maxWidth: 340 }}>
                                            <Row>
                                                <Col>
                                                    <Form.Control
                                                        className="eco-input"
                                                        style={{ borderRadius: "12px 0 0 12px", height: '45px' }}
                                                        placeholder="Custom tag..."
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                                    />
                                                </Col>
                                                <Col>
                                                    <Button type="button" className="eco-btn-main text-white px-3" style={{ borderRadius: "0 12px 12px 0", height: '45px'  }} onClick={() => addTag()}>
                                                        Add Tag
                                                    </Button>
                                                </Col>
                                            </Row>


                                        </InputGroup>
                                        {tags.length > 0 && (
                                            <div className="d-flex flex-wrap gap-2 mb-3">
                                                {tags.map((t) => (
                                                    <div key={t} className="eco-tag-pill">
                                                        {t}
                                                        <button type="button" onClick={() => removeTag(t)}>✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <label className="eco-label mb-2 mt-2">Is Product Customizable?</label>
                                        <div className="d-flex gap-2">
                                            <button type="button" className={`eco-toggle-btn ${isCustomizable ? "active" : ""}`} onClick={() => setIsCustomizable(true)}>✅ Yes</button>
                                            <button type="button" className={`eco-toggle-btn ${!isCustomizable ? "active" : ""}`} onClick={() => setIsCustomizable(false)}>❌ No</button>
                                        </div>
                                    </Card>

                                    {/* ════════════════════════════════════════════
                                        STEP — RETURN & REPLACE POLICY
                                    ════════════════════════════════════════════ */}
                                    <Card className="eco-section-card p-4">
                                        <div className="eco-section-title">↩️ Step {hasVariants ? "7" : "6"} — Return & Replace Policy</div>
                                        <Row className="g-3 mb-3">
                                            <Col sm={6}>
                                                <label className="eco-label mb-2">Return Allowed?</label>
                                                <div className="d-flex gap-2">
                                                    <button type="button" className={`eco-toggle-btn ${isReturn ? "active" : ""}`} onClick={() => setIsReturn(true)}>✅ Yes</button>
                                                    <button type="button" className={`eco-toggle-btn ${!isReturn ? "active" : ""}`} onClick={() => setIsReturn(false)}>❌ No</button>
                                                </div>
                                            </Col>
                                            <Col sm={6}>
                                                <label className="eco-label mb-2">Replacement Allowed?</label>
                                                <div className="d-flex gap-2">
                                                    <button type="button" className={`eco-toggle-btn ${isReplace ? "active" : ""}`} onClick={() => setIsReplace(true)}>✅ Yes</button>
                                                    <button type="button" className={`eco-toggle-btn ${!isReplace ? "active" : ""}`} onClick={() => setIsReplace(false)}>❌ No</button>
                                                </div>
                                            </Col>
                                        </Row>

                                        {(isReturn || isReplace) && (
                                            <Row className="g-3">
                                                <Col sm={4}>
                                                    <label className="eco-label">Duration (Days) *</label>
                                                    <InputGroup>
                                                        <Form.Control
                                                            className={`eco-input ${errors.return_replace_duration ? "is-invalid" : ""}`}
                                                            style={{ borderRadius: "12px 0 0 12px" }}
                                                            type="number"
                                                            min="1"
                                                            placeholder="7"
                                                            {...register("return_replace_duration", {
                                                                required: (isReturn || isReplace) ? "Duration is required" : false,
                                                                min: { value: 1, message: "Must be at least 1 day" },
                                                            })}
                                                        />
                                                        <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderLeft: "none", borderRadius: "0 12px 12px 0", background: "#f8f9ff", fontWeight: 700 }}>
                                                            days
                                                        </InputGroup.Text>
                                                    </InputGroup>
                                                    {errors.return_replace_duration && <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>{errors.return_replace_duration.message}</div>}
                                                </Col>
                                                <Col sm={8}>
                                                    <label className="eco-label">Instructions</label>
                                                    <Form.Control
                                                        as="textarea"
                                                        className="eco-textarea"
                                                        rows={2}
                                                        placeholder="e.g. Product must be unused, in original packaging with all tags intact."
                                                        {...register("return_replace_instructions")}
                                                    />
                                                </Col>
                                            </Row>
                                        )}

                                        {!isReturn && !isReplace && (
                                            <Alert variant="warning" className="rounded-3 border-0 mt-2 py-2" style={{ background: "#fff8e6", fontSize: "0.83rem" }}>
                                                ⚠️ Products with return/replace policies tend to have higher buyer confidence.
                                            </Alert>
                                        )}
                                    </Card>

                                    {/* ── ACTION BUTTONS ── */}
                                    <Row className="g-3 pb-4">
                                        <Col sm={8}>
                                            <Button type="submit" className="eco-btn-main w-100 text-white" disabled={loading}>
                                                {loading ? "⏳ Listing Your Product..." : "🚀 Publish Product Now"}
                                            </Button>
                                        </Col>
                                        <Col sm={4}>
                                            <Button type="button" className="eco-btn-outline w-100 py-3" onClick={() => navigate(-1)}>
                                                ← Cancel
                                            </Button>
                                        </Col>
                                    </Row>
                                </>
                            )}

                        </Stack>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}