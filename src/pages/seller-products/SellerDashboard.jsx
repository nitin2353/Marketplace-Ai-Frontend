import { useState, useMemo, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import SellerSidebar from "../../components/SellerSidebar";
import EditProductModal from "../product/EditProductModal";
import GlobalLoader from "../../components/GlobalLoader";
import productApi from "../../api/product.api";
import { requestFormReset } from "react-dom";
import toast from "react-hot-toast";
import SellerNavbar from "../../components/SellerNavbar.jsx";
import "./SellerDashboard.css";


const FILTERS = ["All", "In Stock", "Low Stock", "Out of Stock", "Customizable", "Returnable"];

export default function SellerProducts() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [viewMode, setViewMode] = useState("grid");
    const [sortBy, setSortBy] = useState("newest");
    const [deleteModal, setDeleteModal] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProductData, setSelectedProductData] = useState({})
    // ── Filtered + Sorted ──


    const filtered = useMemo(() => {
        let list = [...products];
        if (search?.trim()) {
            const q = search;
            list = list?.filter(p =>
                p?.title.includes(q) ||
                p?.brand.includes(q) ||
                p?.tag.includes(q)
            );
        }
        if (activeFilter === "In Stock") list = list.filter(p => p.stock > 10);
        else if (activeFilter === "Low Stock") list = list.filter(p => p.stock > 0 && p.stock <= 10);
        else if (activeFilter === "Out of Stock") list = list.filter(p => p.stock === 0);
        else if (activeFilter === "Customizable") list = list.filter(p => p.is_customizable);
        else if (activeFilter === "Returnable") list = list.filter(p => p.is_return);

        if (sortBy === "newest") list.sort((a, b) => new Date(b?.created_at) - new Date(a?.created_at));
        else if (sortBy === "oldest") list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        else if (sortBy === "price_high") list.sort((a, b) => b.base_price - a.base_price);
        else if (sortBy === "price_low") list.sort((a, b) => a.base_price - b.base_price);
        else if (sortBy === "stock_low") list.sort((a, b) => a.stock - b.stock);
        else if (sortBy === "top_rated") list.sort((a, b) => b.rating - a.rating);
        else if (sortBy === "best_selling") list.sort((a, b) => b.sold - a.sold);
        return list;
    }, [products, search, activeFilter, sortBy]);


    const totalRevenue = products.reduce((s, p) => s + p.base_price * p.sold, 0);
    const avgRating = (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1);
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;

    const sidebarStats = [
        { icon: "📦", label: "Total Products", val: products.length },
        { icon: "💰", label: "Total Revenue", val: `₹${(totalRevenue / 100000).toFixed(1)}L` },
        { icon: "⭐", label: "Avg Rating", val: avgRating },
    ];


    useEffect(() => {
        (
            async () => {
                await fetchAllProducts()
            }
        )()
    }, [refresh])

    const handleProductUpdate = (product) => {
        setSelectedProductData(product)
    }



    const fetchAllProducts = async () => {
        try {
            setShowEditModal(false)
            setLoading(true);
            const { data } = await productApi.getAllProducts();
            console.log(data)
            if (data) {
                const formatted = data.data.map(p => ({
                    ...p,

                    base_price: Number(p.base_price),
                    old_price: p.old_price ? Number(p.old_price) : null,
                    rating: Number(p.rating),

                    tag: typeof p.tag === "string"
                        ? p.tag.split(",").map(t => t.trim())
                        : [],

                    color: typeof p.color === "string"
                        ? p.color.split(",").map(c => c.trim())
                        : [],

                    image_url: Array.isArray(p.image_url)
                        ? p.image_url
                        : []
                }));

                setProducts(formatted);
            } else {
                setProducts([])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }




    const confirmDelete = async (id) => {
        setDeleteLoading(true);
        const response = await productApi.deleteProduct(deleteModal.id)
        if (response.success) {
            toast.success("Product Deleted Successfully!")
            setRefresh(!refresh)
        }
        setProducts(prev => prev.filter(p => p.id !== deleteModal.id));
        setDeleteLoading(false);
        setDeleteModal(null);
    };

    const stockBadge = (stock) => {
        if (stock === 0) return <Badge className="eco-badge-stock-out rounded-pill px-2 py-1">Out of Stock</Badge>;
        if (stock <= 10) return <Badge className="eco-badge-stock-low rounded-pill px-2 py-1">Low: {stock}</Badge>;
        return <Badge className="eco-badge-stock-ok  rounded-pill px-2 py-1">In Stock: {stock}</Badge>;
    };

    return (

        <Container fluid className="p-0" style={{ minHeight: "100vh", background: "#f1f4ff" }}>
            <SellerNavbar />
            {loading && <GlobalLoader />}
            <Row className="g-0" style={{ minHeight: "100vh" }}>

                <Col lg={3} xl={2}>
                    <SellerSidebar stats={sidebarStats} />
                </Col>

                {/* ── MAIN CONTENT ── */}
                <Col lg={9} xl={10} className="p-3 p-md-4" style={{ overflowY: "auto" }}>

                    {/* Mobile header */}
                    <div className="d-lg-none mb-3 d-flex align-items-center justify-content-between">
                        <div className="fw-black" style={{ fontSize: "1.4rem", color: "#ff6b35", fontWeight: 900 }}>🛍️ ShopEase</div>
                        <Badge bg="warning" text="dark" className="rounded-pill fw-bold">Seller</Badge>
                    </div>

                    {/* Page header */}
                    <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
                        <div>
                            <h2 className="fw-bold mb-1" style={{ fontFamily: "Nunito", fontSize: "1.7rem", color: "#1a1a2e" }}>My Products</h2>
                            <p style={{ fontSize: "0.87rem", color: "#777", marginBottom: 0 }}>Manage, edit and track all your listed products</p>
                        </div>
                        <Button className="eco-btn-main text-white d-flex align-items-center gap-2" onClick={() => navigate("/seller/product/create")}>
                            <span style={{ fontSize: "1rem" }}>➕</span> Add New Product
                        </Button>
                    </div>
                    {/* Stats chips */}
                    <Row className="g-3 mb-4">
                        {[
                            { icon: "📦", label: "Total Products", val: products.length, color: "#eff6ff", iconBg: "#dbeafe" },
                            { icon: "💰", label: "Total Revenue", val: `₹${(totalRevenue / 100000).toFixed(1)}`, color: "#f0fdf4", iconBg: "#dcfce7" },
                            { icon: "🔴", label: "Out of Stock", val: outOfStock, color: "#fef2f2", iconBg: "#fee2e2" },
                            { icon: "⚠️", label: "Low Stock", val: lowStock, color: "#fffbeb", iconBg: "#fef3c7" },
                            { icon: "⭐", label: "Avg Rating", val: avgRating, color: "#fefce8", iconBg: "#fef9c3" },
                            { icon: "🛒", label: "Total Sold", val: products.reduce((s, p) => s + p.sold, 0), color: "#fdf4ff", iconBg: "#f3e8ff" },
                        ].map(({ icon, label, val, color, iconBg }) => (
                            <Col xs={6} md={4} xl={2} key={label}>
                                <div className="stat-chip h-100" style={{ background: color }}>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <div className="stat-chip-icon" style={{ background: iconBg }}>{icon}</div>
                                    </div>
                                    <div className="fw-black" style={{ fontSize: "1.3rem", color: "#1a1a2e", lineHeight: 1.2 }}>{val}</div>
                                    <div style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 700, marginTop: 2 }}>{label}</div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    {/* Search + Sort + View toggle */}
                    <Card className="eco-section-card p-3 mb-4">
                        <div className="d-flex flex-wrap gap-3 align-items-center">
                            <InputGroup style={{ maxWidth: 320, flex: "1 1 200px" }}>
                                <InputGroup.Text style={{ border: "2px solid #e8eaf6", borderRight: "none", borderRadius: "12px 0 0 12px", background: "#f8f9ff" }}>🔍</InputGroup.Text>
                                <Form.Control
                                    className="eco-input"
                                    style={{ borderRadius: "0 12px 12px 0", borderLeft: "none" }}
                                    placeholder="Search by title, brand, tag..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </InputGroup>
                            <Form.Select
                                className="eco-input"
                                style={{ maxWidth: 190, padding: "10px 14px", cursor: "pointer" }}
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                            >
                                <option value="newest">🕐 Newest First</option>
                                <option value="oldest">🕐 Oldest First</option>
                                <option value="price_high">💰 Price: High → Low</option>
                                <option value="price_low">💰 Price: Low → High</option>
                                <option value="top_rated">⭐ Top Rated</option>
                                <option value="best_selling">🔥 Best Selling</option>
                                <option value="stock_low">⚠️ Low Stock First</option>
                            </Form.Select>
                        </div>
                        <div className="d-flex gap-2 flex-wrap mt-3">
                            {FILTERS.map(f => (
                                <button key={f} type="button" className={`eco-filter-pill ${activeFilter === f ? "active" : ""}`} onClick={() => setActiveFilter(f)}>
                                    {f}
                                    {f !== "All" && (
                                        <span className="ms-1" style={{ fontSize: "0.72rem", opacity: 0.7 }}>
                                            ({f === "In Stock" ? products.filter(p => p.stock > 10).length
                                                : f === "Low Stock" ? products.filter(p => p.stock > 0 && p.stock <= 10).length
                                                    : f === "Out of Stock" ? products.filter(p => p.stock === 0).length
                                                        : f === "Customizable" ? products.filter(p => p.is_customizable).length
                                                            : products.filter(p => p.is_return).length})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Result count */}
                    <div className="mb-3 d-flex align-items-center justify-content-between">
                        <span style={{ fontSize: "0.83rem", color: "#6b7280", fontWeight: 700 }}>
                            Showing <span style={{ color: "#3538ffff" }}>{filtered.length}</span> of {products.length} products
                        </span>
                        {search && (
                            <button type="button" className="eco-filter-pill" style={{ fontSize: "0.78rem" }} onClick={() => setSearch("")}>✕ Clear search</button>
                        )}
                    </div>

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <Card className="eco-section-card">
                            <div className="empty-state">
                                <div className="empty-ring">📦</div>
                                <h4 className="fw-bold mb-2" style={{ color: "#1a1a2e" }}>No Products Found</h4>
                                <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                                    {search ? `No results for "${search}". Try a different search term.` : "You haven't listed any products yet. Start by adding your first product!"}
                                </p>
                                <Button className="eco-btn-main text-white px-5" onClick={() => navigate("/seller/product/create")}>➕ Add Your First Product</Button>
                            </div>
                        </Card>
                    )}

                    {/* Grid view */}
                    {viewMode === "grid" && filtered.length > 0 && (
                        <Row className="g-3">
                            {filtered.map(product => (
                                <Col xs={12} sm={6} xl={3} key={product.id}>
                                    <Card className="product-card h-100">
                                        {product.image_url
                                            ? <img src={product.image_url[0]} alt={product.title} className="product-img" />
                                            : <div className="product-img-placeholder">📦</div>
                                        }
                                        <Card.Body className="p-3">
                                            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                                                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>{product.brand}</span>
                                                {product.tag.map((t, idx) => {
                                                    return idx < 1 ? <Badge key={t} className="eco-badge-tag">{t.trim()}</Badge> : null;
                                                })}
                                                {product.is_customizable && <Badge className="eco-badge-tag">✏️ Custom</Badge>}
                                            </div>
                                            <div className="fw-bold mb-2" style={{ fontSize: "0.92rem", color: "#1a1a2e", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {product.title}
                                            </div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <span className="fw-black" style={{ fontSize: "1.1rem", color: "#ff6b35" }}>₹{product.base_price.toLocaleString()}</span>
                                                {product.old_price && <span style={{ fontSize: "0.78rem", color: "#9ca3af", textDecoration: "line-through" }}>₹{product.old_price.toLocaleString()}</span>}
                                                {product.discount > 0 && <Badge bg="success" className="rounded-pill" style={{ fontSize: "0.7rem" }}>{product.discount}% off</Badge>}
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                {stockBadge(product.stock)}
                                                <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700 }}>⭐ {product.rating} · 🛒 {product.sold} sold</span>
                                            </div>
                                            {product.color && (
                                                <div className="d-flex gap-1 mb-3">
                                                    {product.color.map(c => (
                                                        <span key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", display: "inline-block" }} />
                                                    ))}
                                                    {product.color.length > 6 && <span style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 700, alignSelf: "center" }}>+{product.color.length - 6}</span>}
                                                </div>
                                            )}
                                            <div className="d-flex gap-2">
                                                <Button className="eco-btn-main flex-fill text-white" style={{ fontSize: "0.82rem", padding: "8px 10px" }} onClick={(e) => { setShowEditModal(true); handleProductUpdate(product) }}>✏️ Edit</Button>
                                                <Button className="eco-btn-outline" style={{ fontSize: "0.82rem", padding: "8px 14px", color: "#dc2626", borderColor: "#fca5a5" }} onClick={() => setDeleteModal(product)}>🗑️</Button>
                                                <Button className="eco-btn-outline" style={{ fontSize: "0.82rem", padding: "8px 14px" }} onClick={() => navigate(`/seller/product/${product.id}`)}>👁️</Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                    <div style={{ height: 40 }} />
                </Col>
            </Row>

            <EditProductModal show={showEditModal} product={selectedProductData} setRefresh={setRefresh} refresh={refresh} handleClose={() => setShowEditModal(false)} />

            {/* Delete Modal */}
            <Modal show={!!deleteModal} onHide={() => !deleteLoading && setDeleteModal(null)} centered dialogClassName="eco-modal">
                <Modal.Body className="p-4 text-center rounded-5">
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>🗑️</div>
                    <h4 className="fw-bold mb-2" style={{ color: "#1a1a2e" }}>Delete Product?</h4>
                    <p className="text-muted mb-1" style={{ fontSize: "0.88rem" }}>You are about to permanently delete:</p>
                    <p className="fw-bold mb-4" style={{ color: "#ff6b35", fontSize: "0.95rem" }}>"{deleteModal?.title}"</p>
                    <div className="d-flex gap-3">
                        <Button className="eco-btn-outline flex-fill py-2" onClick={() => setDeleteModal(null)} disabled={deleteLoading}>Cancel</Button>
                        <Button
                            className="flex-fill py-2 fw-bold text-white"
                            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", border: "none", borderRadius: 12, fontSize: "0.9rem" }}
                            onClick={confirmDelete}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? "⏳ Deleting..." : "🗑️ Yes, Delete"}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </Container>
    );
}