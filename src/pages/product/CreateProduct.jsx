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


const PRESET_COLORS = [
    { name: "Red", hex: "#ef4444" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Green", hex: "#22c55e" },
    { name: "Yellow", hex: "#eab308" },
    { name: "Black", hex: "#1a1a1a" },
    { name: "White", hex: "#f5f5f5" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Purple", hex: "#a855f7" },
    { name: "Orange", hex: "#f97316" },
    { name: "Brown", hex: "#92400e" },
];

const PRESET_TAGS = ["New Arrival", "Trending", "Best Seller", "Limited Edition", "Eco Friendly", "Premium", "Sale"];

export default function CreateProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Multi-value fields
    const [selectedColors, setSelectedColors] = useState([]);
    const [customColor, setCustomColor] = useState("");
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [imageUrls, setImageUrls] = useState([""]);
    const [variants, setVariants] = useState([
        { color: "", size: "", price: "", stock: "" }
    ]);
    // Toggle states
    const [isCustomizable, setIsCustomizable] = useState(false);
    const [isReturn, setIsReturn] = useState(false);
    const [isReplace, setIsReplace] = useState(false);

    const [imageFiles, setImageFiles] = useState([]);

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
            base_price: "",
            old_price: "",
            discount: "",
            rating: "",
            reviews: "",
            sold: "",
            stock: "",
            tag: tags.join(',') || "",
            color: selectedColors.join(',') || "",
            is_return: isReturn || false,
            is_replace: isReplace || false,
            return_replace_duration: "",
            return_replace_instructions: "",
        },
        mode: "onChange",
    });

    const basePriceVal = watch("base_price");
    const oldPriceVal = watch("old_price");

    // Auto-computed discount preview
    const computedDiscount =
        basePriceVal && oldPriceVal && Number(oldPriceVal) > 0
            ? (((Number(oldPriceVal) - Number(basePriceVal)) / Number(oldPriceVal)) * 100)
            : null;

    // Color helpers
    const toggleColor = (hex) => {
        setSelectedColors((prev) =>
            prev.includes(hex) ? prev.filter((c) => c !== hex) : [...prev, hex]
        );
    };
    const addCustomColor = () => {
        if (customColor && !selectedColors.includes(customColor)) {
            setSelectedColors((prev) => [...prev, customColor]);
        }
        setCustomColor("");
    };

    const addTag = (t) => {
        const val = t || tagInput.trim();
        if (val && !tags.includes(val)) setTags((prev) => [...prev, val]);
        setTagInput("");
    };
    const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t));

    const updateImageUrl = (i, val) => {
        setImageUrls((prev) => { const arr = [...prev]; arr[i] = val; return arr; });
    };
    const addImageUrl = () => setImageUrls((prev) => [...prev, ""]);
    const removeImageUrl = (i) => setImageUrls((prev) => prev.filter((_, idx) => idx !== i));

    // const onSubmit = async (payload) => {
    //     setLoading(true);

    //     try {

    //         const final = {
    //             ...payload, tag: tags.join(', ') || "",
    //             color: selectedColors.join(', ') || "",
    //             is_return: isReturn || false,
    //             is_replace: isReplace || false,
    //             is_customizable: isCustomizable || false,
    //             image_url: ""
    //         }

    //         console.log("payload", final)
    //         return;
    //         const res = await productApi.createProduct(final)
    //         if (res?.success) {
    //             setSubmitted(true);
    //             toast.success("Product Created Successfully")
    //             setSelectedColors([]);
    //             setTags([]);
    //             setImageUrls([]);
    //             navigate('/seller/product')
    //         }

    //     } catch (err) {
    //         console.error("Create Product Error:", err?.response?.data || err);

    //         toast.error(
    //             err?.response?.data?.message || "Something went wrong"
    //         );
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const onSubmit = async (payload) => {
        setLoading(true);

        try {

            const formData = new FormData();
            const final = {
                ...payload,
                tag: tags.join(', ') || "",
                color: selectedColors.join(', ') || "",
                is_return: isReturn || false,
                is_replace: isReplace || false,
                is_customizable: isCustomizable || false,
            };
            
            Object.keys(final).forEach(key => {
                formData.append(key, final[key]);
            });

            formData.append("variants", JSON.stringify(variants));
            
            imageFiles.forEach((img) => {
                formData.append("images", img.file);
            });
            if (imageFiles.length <= 0) {
                toast.error("Upload Atleast One Image!")
                return;
            }
            const res = await productApi.createProduct(formData);
        
            if (res?.success) {
                setSubmitted(true);
                toast.success("Product Created Successfully");
                setSelectedColors([]);
                setTags([]);
                setImageFiles([]);
                navigate('/seller/product');
            }

        } catch (err) {
            console.error("Create Product Error:", err?.response?.data || err);

            toast.error(
                err?.response?.data?.message || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };


    const handleVariantChange = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    const addVariant = () => {
        setVariants([...variants, { color: null, size: null, price: "", old_price: null, stock: null }]);
    };

    const removeVariant = (index) => {
        const updated = variants.filter((_, i) => i !== index);
        setVariants(updated);
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
                        <Button className="eco-btn-outline flex-fill" onClick={() => navigate("/seller/product")}>
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
                    <Col lg={3} xl={2} className="eco-hero d-none d-lg-flex flex-column justify-content-between p-4" style={{ minHeight: "100vh" }}>
                        <div>
                            <div
                                className="text-white fw-black mb-1"
                                style={{ fontFamily: "Nunito", fontSize: "1.9rem", fontWeight: 900, cursor: "pointer" }}
                                onClick={() => navigate("/")}
                            >
                                🛍️ ShopEase
                            </div>
                            <div className="text-white fw-semibold mb-5" style={{ opacity: 0.85, fontSize: "0.88rem" }}>
                                Seller Dashboard
                            </div>

                            {/* Steps */}
                            <Stack gap={3}>
                                {[
                                    { step: 1, label: "Basic Info", desc: "Title, Brand, Description" },
                                    { step: 2, label: "Pricing", desc: "Price, Discount, Stock" },
                                    { step: 3, label: "Visuals", desc: "Images" },
                                    { step: 4, label: "Variants", desc: "Variants" },
                                    { step: 5, label: "Tags & Options", desc: "Tags, Customizable" },
                                    { step: 6, label: "Return Policy", desc: "Return & Replace rules" },
                                ].map(({ step, label, desc }) => (
                                    <div key={step} className="d-flex align-items-start gap-3">
                                        <div className="step-badge mt-1">{step}</div>
                                        <div className="text-white">
                                            <div className="fw-bold" style={{ fontSize: "0.85rem" }}>{label}</div>
                                            <div style={{ fontSize: "0.73rem", opacity: 0.75 }}>{desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </Stack>
                        </div>

                        {/* Stats */}
                        <Stack gap={2} className="mt-4">
                            {[
                                { icon: "📦", label: "Products Listed", val: "142" },
                                { icon: "💰", label: "Total Revenue", val: "₹3.2L" },
                                { icon: "⭐", label: "Avg Rating", val: "4.6" },
                            ].map(({ icon, label, val }) => (
                                <div key={label} className="eco-sidebar-stat d-flex align-items-center gap-2">
                                    <span style={{ fontSize: "1.3rem" }}>{icon}</span>
                                    <div className="text-white">
                                        <div className="fw-bold" style={{ fontSize: "0.92rem" }}>{val}</div>
                                        <div style={{ fontSize: "0.7rem", opacity: 0.75 }}>{label}</div>
                                    </div>
                                </div>
                            ))}
                        </Stack>

                        <div className="mt-4 text-white" style={{ opacity: 0.65, fontSize: "0.75rem" }}>
                            ⭐ Trusted by 2 Crore+ happy customers
                        </div>
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

                            {/* ── SECTION 1: BASIC INFO ── */}
                            <Card className="eco-section-card p-4">
                                <div className="eco-section-title">📋 Step 1 — Basic Information</div>
                                <Row className="g-3">
                                    <Col md={8}>
                                        <label className="eco-label">Product Title *</label>
                                        <Form.Control
                                            className={`eco-input ${errors.title ? "is-invalid" : ""}`}
                                            placeholder="e.g. Premium Cotton Casual T-Shirt for Men"
                                            {...register("title", { required: "Product title is required", minLength: { value: 5, message: "Title must be at least 5 characters" } })}
                                        />
                                        {errors.title && <div className="invalid-feedback d-block">{errors.title.message}</div>}
                                    </Col>
                                    <Col md={4}>
                                        <label className="eco-label">Brand *</label>
                                        <Form.Control
                                            className={`eco-input ${errors.brand ? "is-invalid" : ""}`}
                                            placeholder="e.g. Nike, Puma, Generic"
                                            {...register("brand", { required: "Brand is required" })}
                                        />
                                        {errors.brand && <div className="invalid-feedback d-block">{errors.brand.message}</div>}
                                    </Col>
                                    <Col xs={12}>
                                        <label className="eco-label">Description *</label>
                                        <Form.Control
                                            as="textarea"
                                            className={`eco-textarea ${errors.description ? "is-invalid" : ""}`}
                                            placeholder="Describe your product in detail — material, fit, size guide, usage, etc."
                                            rows={4}
                                            {...register("description", { required: "Description is required", minLength: { value: 20, message: "Description must be at least 20 characters" } })}
                                        />
                                        {errors.description && <div className="invalid-feedback d-block">{errors.description.message}</div>}
                                    </Col>
                                </Row>
                            </Card>

                            {/* ── SECTION 2: Inventory & Rating ── */}
                            <Card className="eco-section-card p-4">
                                <div className="eco-section-title">💰 Step 2 — Inventory & Rating</div>
                                <Row className="g-3">
                                    <Col sm={6} md={3}>
                                        <label className="eco-label">Selling Price (₹) *</label>
                                        <InputGroup>
                                            <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff", fontWeight: 700 }}>₹</InputGroup.Text>
                                            <Form.Control
                                                className={`eco-input ${errors.base_price ? "is-invalid" : ""}`}
                                                style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                                                type="number"
                                                min="0"
                                                placeholder="499"
                                                {...register("base_price", {
                                                    required: "Selling price is required",
                                                    min: { value: 1, message: "Price must be > 0" },
                                                })}
                                            />
                                        </InputGroup>
                                        {errors.base_price && <div className="text-danger mt-1" style={{ fontSize: "0.8rem" }}>{errors.base_price.message}</div>}
                                    </Col>

                                    <Col sm={6} md={3}>
                                        <label className="eco-label">MRP / Old Price (₹)</label>
                                        <InputGroup>
                                            <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff", fontWeight: 700 }}>₹</InputGroup.Text>
                                            <Form.Control
                                                style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                                                className="eco-input"
                                                type="number"
                                                min="0"
                                                placeholder="999"
                                                {...register("old_price")}
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
                                            placeholder={computedDiscount !== null ? `Auto: ${computedDiscount}%` : "0"}
                                            {...register("discount", { min: { value: 0 }, max: { value: 100 } })}
                                        />
                                        {computedDiscount !== null && (
                                            <div className="mt-1 fw-bold" style={{ fontSize: "0.77rem", color: "#22c55e" }}>
                                                💡 Auto-calculated: {computedDiscount}% off
                                            </div>
                                        )}
                                    </Col>

                                    <Col sm={6} md={3}>
                                        <label className="eco-label">Stock Quantity *</label>
                                        <Form.Control
                                            className={`eco-input ${errors.stock ? "is-invalid" : ""}`}
                                            type="number"
                                            min="0"
                                            placeholder="100"
                                            {...register("stock", { required: "Stock is required", min: { value: 0, message: "Stock can't be negative" } })}
                                        />
                                        {errors.stock && <div className="invalid-feedback d-block">{errors.stock.message}</div>}
                                    </Col>

                                    <Col sm={6} md={3}>
                                        <label className="eco-label">Total Units Sold</label>
                                        <Form.Control
                                            className="eco-input"
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            {...register("sold")}
                                        />
                                    </Col>

                                    <Col sm={6} md={3}>
                                        <label className="eco-label">Rating (0–5)</label>
                                        <Form.Control
                                            className="eco-input"
                                            type="number"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            placeholder="4.5"
                                            {...register("rating", { min: 0, max: 5 })}
                                        />
                                    </Col>

                                    <Col sm={6} md={3}>
                                        <label className="eco-label">Total Reviews</label>
                                        <Form.Control
                                            className="eco-input"
                                            type="number"
                                            min="0"
                                            placeholder="0"
                                            {...register("reviews")}
                                        />
                                    </Col>
                                </Row>
                            </Card>

                            {/* ── SECTION 3: IMAGES & COLORS ── */}
                            <Card className="eco-section-card p-4">
                                <div className="eco-section-title">🖼️ Step 3 — Images & Colors</div>

                                {/* Image URLs */}
                                <label className="eco-label mb-2">Product Images *</label>

                                <Stack gap={2} className="mb-3">

                                    {/* Upload Input (UI same feel) */}
                                    <InputGroup>
                                        <InputGroup.Text
                                            style={{
                                                border: "2px solid #e8eaf6",
                                                borderRight: "none",
                                                borderRadius: "12px 0 0 12px",
                                                background: "#f8f9ff"
                                            }}
                                        >
                                            📁
                                        </InputGroup.Text>

                                        <Form.Control
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="eco-input"
                                            style={{
                                                borderRadius: "0 12px 12px 0",
                                                borderLeft: "none"
                                            }}
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);

                                                const newImages = files.map(file => ({
                                                    file,
                                                    preview: URL.createObjectURL(file)
                                                }));

                                                setImageFiles((prev) => [...prev, ...newImages]);
                                            }}
                                        />
                                    </InputGroup>

                                    {/* Preview (same spacing + responsive) */}
                                    <div className="d-flex flex-wrap gap-3 mt-2">
                                        {imageFiles.map((img, i) => (
                                            <div key={i} style={{ position: "relative" }}>
                                                <img
                                                    src={img.preview}
                                                    alt="preview"
                                                    style={{
                                                        width: 90,
                                                        height: 90,
                                                        objectFit: "cover",
                                                        borderRadius: 12,
                                                        border: "2px solid #e8eaf6"
                                                    }}
                                                />

                                                <Button
                                                    type="button"
                                                    variant="outline-danger"
                                                    size="sm"
                                                    style={{
                                                        position: "absolute",
                                                        top: -8,
                                                        right: -8,
                                                        borderRadius: "50%",
                                                        padding: "2px 6px"
                                                    }}
                                                    onClick={() => {
                                                        setImageFiles(prev => prev.filter((_, index) => index !== i));
                                                    }}
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                </Stack>


                            </Card>

                            {/* ── SECTION 4: TAGS & OPTIONS ── */}
                            <Card className="eco-section-card p-4">
                                <div className="eco-section-title">🏷️ Step 4 — Variants (optional)</div>
                                {/* Color Picker */}
                                <Row>
                                    <Col lg={12} className="mt-2">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <label className="eco-label">Variants</label>
                                            <Button className="eco-btn-main" onClick={addVariant} >
                                                + Add Variant
                                            </Button>
                                        </div>

                                        {variants.map((variant, index) => (
                                            <Card key={index} className="p-3 mb-3 shadow-sm">
                                                <Row className="g-3 align-items-center">

                                                    {/* Color */}
                                                    <Col md={2}>
                                                        <div className="d-flex align-items-center gap-2">

                                                            <Form.Control
                                                                type="color"
                                                                value={variant.color || "#000000"}
                                                                onChange={(e) =>
                                                                    handleVariantChange(index, "color", e.target.value)
                                                                }
                                                                style={{ width: 50, height: 40, padding: 4 }}
                                                            />

                                                            <Form.Control
                                                                type="text"
                                                                placeholder="#ffffff"
                                                                value={variant.color || ""}
                                                                onChange={(e) =>
                                                                    handleVariantChange(index, "color", e.target.value)
                                                                }
                                                            />

                                                        </div>
                                                    </Col>

                                                    {/* Size */}
                                                    <Col md={2}>
                                                        <Form.Select
                                                            value={variant.size}
                                                            onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                                                        >
                                                            <option value="">Size</option>
                                                            {["S", "M", "L", "XL"].map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Col>

                                                    {/* Price */}
                                                    <Col md={2}>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="Price"
                                                            value={variant.price}
                                                            onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                                        />
                                                    </Col>

                                                    {/* Price */}
                                                    <Col md={2}>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="Old Price"
                                                            value={variant.old_price}
                                                            onChange={(e) => handleVariantChange(index, "old_price", e.target.value)}
                                                        />
                                                    </Col>

                                                    {/* Stock */}
                                                    <Col md={2}>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="Stock"
                                                            value={variant.stock}
                                                            onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                                                        />
                                                    </Col>

                                                    {/* Remove */}
                                                    <Col md={2}>
                                                        <Button
                                                            variant="outline-danger"
                                                            onClick={() => removeVariant(index)}
                                                            disabled={variants.length <= 1 ? true : false}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </Col>

                                                </Row>
                                            </Card>
                                        ))}
                                    </Col>
                                </Row>



                            </Card>


                            <Card className="eco-section-card p-4">
                                <div className="eco-section-title">🏷️ Step 5 — Tags & Options</div>

                                {/* Tags */}
                                <label className="eco-label mb-2">Product Tags</label>
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                    {PRESET_TAGS.map((t) => (
                                        <Badge
                                            key={t}
                                            bg={tags.includes(t) ? "warning" : "light"}
                                            className="rounded-pill px-3 py-2 fw-semibold"
                                            text={tags.includes(t) ? "dark" : "secondary"}
                                            style={{ cursor: "pointer", fontSize: "0.78rem", border: tags.includes(t) ? "2px solid #f7931e" : "2px solid #e8eaf6" }}
                                            onClick={() => tags.includes(t) ? removeTag(t) : addTag(t)}
                                        >
                                            {t}
                                        </Badge>
                                    ))}
                                </div>
                                <InputGroup className="mb-3 mt-4" style={{ maxWidth: 340 }}>
                                    <Form.Control
                                        className="eco-input"
                                        style={{ borderRadius: "12px 0 0 12px" }}
                                        placeholder="Custom tag..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                    />
                                    <Button type="button" className="eco-btn-main text-white px-3" style={{ borderRadius: "0 12px 12px 0" }} onClick={() => addTag()}>
                                        Add Tag
                                    </Button>
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

                                {/* Is Customizable */}
                                <label className="eco-label mb-2">Is Product Customizable?</label>
                                <div className="d-flex gap-2">
                                    <button type="button" className={`eco-toggle-btn ${isCustomizable ? "active" : ""}`} onClick={() => setIsCustomizable(true)}>
                                        ✅ Yes
                                    </button>
                                    <button type="button" className={`eco-toggle-btn ${!isCustomizable ? "active" : ""}`} onClick={() => setIsCustomizable(false)}>
                                        ❌ No
                                    </button>
                                </div>
                            </Card>

                            {/* ── SECTION 5: RETURN & REPLACE POLICY ── */}
                            <Card className="eco-section-card p-4">
                                <div className="eco-section-title">↩️ Step 6 — Return & Replace Policy</div>
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
                                        ⚠️ Products with return/replace policies tend to have higher buyer confidence and conversion rates.
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
                                    <Button
                                        type="button"
                                        className="eco-btn-outline w-100 py-3"
                                        onClick={() => navigate(-1)}
                                    >
                                        ← Cancel
                                    </Button>
                                </Col>
                            </Row>

                        </Stack>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}