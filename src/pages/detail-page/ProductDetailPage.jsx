import { Container, Row, Col, Card, Button, Badge, ProgressBar, ListGroup, Modal } from "react-bootstrap";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productApi from "../../api/product.api";
import toast from "react-hot-toast";
import GlobalLoader from "../../components/GlobalLoader";
import Toolbar from "../../components/Toolbar";
import GlobalHelper from "../../helper/GlobalHelper";
import '../../style//productDetailPage.css'
import wishlistApi from "../../api/wishlist.api";
import StarRating from "../../components/StarRating";
import cartApi from "../../api/cartApi";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import FullScreenImageModal from "../../components/FullScreenImageModal";
import reviewApi from "../../api/review.api";
import { FMT } from "../../helper/GlobalHelper";
import JWTService from "../../config/jwt.config";



// ── Skeleton ────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <Row className="g-4">
      <Col md={5}>
        <Card className="eco-card p-3">
          <div className="pd-skeleton" style={{ aspectRatio: "1/1", borderRadius: 16 }} />
          <div className="d-flex gap-2 mt-3">
            {[1, 2, 3].map(i => <div key={i} className="pd-skeleton" style={{ width: 70, height: 70, borderRadius: 12, flexShrink: 0 }} />)}
          </div>
        </Card>
      </Col>
      <Col md={7}>
        <Card className="eco-card p-4">
          <div className="pd-skeleton" style={{ height: 24, width: "30%", marginBottom: 12 }} />
          <div className="pd-skeleton" style={{ height: 32, width: "80%", marginBottom: 10 }} />
          <div className="pd-skeleton" style={{ height: 18, width: "40%", marginBottom: 16 }} />
          <div className="pd-skeleton" style={{ height: 48, width: "55%", marginBottom: 20 }} />
          <div className="pd-skeleton" style={{ height: 14, marginBottom: 8 }} />
          <div className="pd-skeleton" style={{ height: 14, marginBottom: 8 }} />
          <div className="pd-skeleton" style={{ height: 14, width: "70%", marginBottom: 24 }} />
          <div className="pd-skeleton" style={{ height: 48, borderRadius: 12 }} />
        </Card>
      </Col>
    </Row>
  );
}


export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [sidebar, setSidebar] = useState(false)
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [imgLoading, setImgLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("desc");
  const [activeColor, setActiveColor] = useState(null);
  const [related, setRelated] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeSize, setActiveSize] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);


  const { refresh, setRefresh } = useAuthWrapper()

  const searchRef = useRef();

  useEffect(() => {
    fetchProduct();
    fetchWishlist()
  }, [id]);

  const addToast = useCallback((msg, icon = "✅") => {
    toast.success(msg)
  }, []);



  useEffect(() => {
    if (!product?.variants?.length) return;
    const match = product.variants.find(
      v => v.color === activeColor && v.size === activeSize
    );
    setActiveVariant(match || null);
  }, [activeColor, activeSize, product]);


  const fetchProduct = async () => {
    setLoading(true);
    setActiveImg(0);

    try {
      const response = await productApi.getProductById(id);
      const payload = response?.data ?? response;

      const raw =
        payload?.data?.[0] ??
        payload?.data ??
        payload?.rows?.[0] ??
        payload?.row ??
        payload ??
        null;

      if (raw) {
        const p = GlobalHelper.API_FIELDS_MAP["products"](raw);
        setProduct(p);

        setActiveColor(p?.variants?.[0]?.color || p?.colors?.[0] || null);
        setActiveSize(p?.variants?.[0]?.size || null);
        setActiveVariant(p?.variants?.[0] || null);

        try {
          const relResponse = await productApi.getAllProducts();
          const relPayload = relResponse?.data ?? relResponse;

          const rows =
            relPayload?.data ??
            relPayload?.rows ??
            relPayload?.data?.rows ??
            (Array.isArray(relPayload) ? relPayload : []);

          setRelated(
            (Array.isArray(rows) ? rows : [])
              .map(GlobalHelper.API_FIELDS_MAP["products"])
              .filter((r) => r.id !== p.id)
              .slice(0, 4)
          );
        } catch (_) { }
      } else {
        toast.error("Product not found.");
      }
    } catch (err) {
      console.error("Failed to fetch product:", err);
      toast.error("Failed to load product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await reviewApi.getProductReviews(id);
      if (res?.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "reviews" && reviews.length === 0) {
      fetchReviews();
    }
  }, [activeTab]);

  const displayPrice = activeVariant?.price ?? product?.price ?? 0;
  const displayStock = activeVariant?.stock ?? product?.stock ?? 0;

  console.log("Active variant:", displayStock);

  const fetchWishlist = async () => {
    try {
      const { data } = await wishlistApi.getAllWishlistItems();
      if (data.success) {
        setWishlist(data.data || [])
      }
    } catch (error) {
      console.error(error)
    }
  }


  const switchImage = (i) => {
    if (i === activeImg) return;
    setImgLoading(true);
    setActiveImg(i);
  };

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    if (!product.variants?.length) {
      if (Number(product.stock) === 0) {
        toast.error("This product is out of stock.");
        return;
      }
      const payload = {
        product_id: product.id,
        total_quantity: qty,
        prouduct_price: product.price,
        price: Number(product.price) * qty,
      };

      const result = await cartApi.createCart(payload);
      if (result.success) {
        setRefresh(!refresh)
        setAddedToCart(true);
        toast.success(`${product.title.slice(0, 28)}… added to cart! 🛒`);
        // setTimeout(() => setAddedToCart(false), 2000);
      }
      else {
        toast.success("something went wrong!!")
      }
      return;
    }

    if (!activeVariant) {
      toast.error("Please select a color and size.");
      return;
    }
    if (activeVariant.stock === 0) {
      toast.error("Selected variant is out of stock.");
      return;
    }
    const payload = {
      product_id: product.id,
      variant_id: activeVariant.id,
      total_quantity: qty,
      prouduct_price: activeVariant.price,
      price: Number(activeVariant.price) * qty,
    };
    console.log("Cart payload (with variant):", payload);
    const result = await cartApi.createCart(payload);
    if (result.success) {
      setAddedToCart(true);
      toast.success(`${product.title.slice(0, 28)}… added to cart! 🛒`);
      // setTimeout(() => setAddedToCart(false), 2000);
    } else {
      toast.success("something went wrong!!")
    }
  }, [product, activeVariant, qty]);


  const handleNavigateCustomization = async () => {
    navigate("customization", {
      state: JWTService.decodeTokenDetails()
    });
  }




  const stockPercent = product ? Math.min((product.stock / 200) * 100, 100) : 0;

  if (loading) {
    return (
      <Container fluid style={{ background: "#f1f4ff", minHeight: "100vh" }} className="p-4">
        <Container><DetailSkeleton /></Container>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container fluid style={{ background: "#f1f4ff", minHeight: "100vh" }} className="p-4">
        <Container>
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>😕</div>
            <h4 className="fw-bold">Product not found</h4>
            <p className="text-muted">The product you're looking for doesn't exist or was removed.</p>
            <button
              onClick={() => navigate(-1)}
              style={{ marginTop: 12, border: "none", borderRadius: 12, background: "linear-gradient(135deg,#ff6b35,#f7931e)", color: "#fff", fontWeight: 800, padding: "11px 28px", fontFamily: "Nunito", cursor: "pointer" }}
            >
              ← Go Back
            </button>
          </div>
        </Container>
      </Container>
    );
  }

  return (
    <>
      <Toolbar searchRef={searchRef} search={search} cart={cart} wishlist={wishlist} setWishlist={setWishlist} setSidebar={setSidebar} addToast={addToast} setSearch={setSearch} isSideBar={false} isSearch={false} />
      <Container fluid style={{ background: "#f1f4ff", minHeight: "100vh" }} className="p-4">
        <Container>

          {/* ── Breadcrumb ── */}
          <div className="pd-breadcrumb fu">
            <span onClick={() => navigate("/")}>🏪 Home</span>
            <span className="sep">›</span>
            <span onClick={() => navigate(-1)}>Products</span>
            <span className="sep">›</span>
            <span style={{ color: "#374151" }}>{product.title}</span>
          </div>

          <Row className="g-4">

            {/* ══ IMAGE COLUMN ══ */}
            <Col md={5} className="fu">
              <Card className="eco-card p-3">
                {/* Discount ribbon */}
                <div style={{ position: "relative" }}>
                  {product.discount > 0 && (
                    <div style={{
                      position: "absolute", top: 12, left: 12, zIndex: 2,
                      background: "#dc3545", color: "#fff", borderRadius: "50%",
                      width: 52, height: 52, display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 900, lineHeight: 1.2, textAlign: "center"
                    }}>
                      {product.discount}%<br />OFF
                    </div>
                  )}
                  {/* Hero image */}
                  <img
                    onClick={(e) => { setSelectedImage(e.target.src); setModalShow(true); }}
                    key={activeImg}
                    src={product.images[activeImg] || product.img}
                    alt={product.title}
                    className={`pd-hero-img ${imgLoading ? "loading" : ""}`}
                    onLoad={() => setImgLoading(false)}
                  // onError={e => {
                  //   e.target.src = `https://placehold.co/600x600/f1f4ff/ff6b35?text=${encodeURIComponent(product.title.slice(0, 2))}`;
                  //   setImgLoading(false);
                  // }}
                  />
                </div>

                {/* Thumbnail strip */}
                {product.images.length > 1 && (
                  <div className="pd-thumb-strip">
                    {product.images.map((img, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img
                          src={img}
                          alt={`View ${i + 1}`}
                          className={`pd-thumb ${activeImg === i ? "active" : ""}`}
                          onClick={() => switchImage(i)}
                          onError={e => { e.target.src = `https://placehold.co/70x70/f1f4ff/ff6b35?text=${i + 1}`; }}
                        />
                        {activeImg === i && (
                          <div style={{
                            position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)",
                            width: 6, height: 6, borderRadius: "50%", background: "var(--p)"
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Image count badge */}
                {product.images.length > 1 && (
                  <div className="mt-2 text-center" style={{ fontSize: "0.74rem", color: "#9ca3af", fontWeight: 700 }}>
                    📷 {activeImg + 1} / {product.images.length} — Click thumbnails to switch
                  </div>
                )}
              </Card>
            </Col>

            {/* ══ DETAILS COLUMN ══ */}
            <Col md={7}>
              <Card className="eco-card p-4 fu" style={{ animationDelay: "0.06s" }}>

                {/* Tags row */}
                <div className="d-flex gap-2 flex-wrap mb-3">
                  {product.tags.map(t => (
                    <span key={t} className="pd-tag-pill">{t}</span>
                  ))}
                  {product.is_customizable && (
                    <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 800, background: "#ede9fe", color: "#7c3aed", border: "1.5px solid #ddd6fe" }}>
                      ✏️ Customizable
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="fw-bold mb-2" style={{ color: "var(--text)", lineHeight: 1.3, fontFamily: "Nunito" }}>
                  {product.title}
                </h3>

                {/* Brand */}
                <div className="mb-1" style={{ fontSize: "0.88rem", color: "#6b7280" }}>
                  Brand: <b style={{ color: "var(--p)" }}>{product.brand}</b>
                </div>
                <div className="mb-3" style={{ fontSize: "0.88rem", color: "#6b7280" }}>
                  Category: <b style={{ color: "var(--p)" }}>{product.category}</b>
                </div>

                {/* Rating + sold */}
                <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                  <div className="d-flex align-items-center gap-1" style={{ background: "#f0fdf4", borderRadius: 10, padding: "4px 10px" }}>
                    <StarRating rating={product.rating} />
                    <span style={{ fontWeight: 900, fontSize: "0.9rem", color: "#16a34a", marginLeft: 4 }}>{product.rating}</span>
                  </div>
                  <span style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 700 }}>
                    ({product.reviews.toLocaleString()} reviews)
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 700 }}>
                    🛒 <b style={{ color: "#f7931e" }}>{product.sold.toLocaleString()}</b>+ sold
                  </span>
                </div>

                {/* Price block */}
                <div className="d-flex align-items-baseline gap-3 mb-4 flex-wrap">
                  <span className="pd-price-main">{FMT(displayPrice)}</span>
                  {product.old_price > displayPrice && (
                    <span className="pd-price-old">{FMT(product.old_price)}</span>
                  )}
                  {product.discount > 0 && (
                    <span style={{
                      background: "#dcfce7", color: "#166534", borderRadius: 20,
                      padding: "4px 12px", fontSize: "0.78rem", fontWeight: 900
                    }}>
                      {product.discount}% OFF
                    </span>
                  )}
                  {product.old_price > displayPrice && (
                    <span style={{ fontSize: "0.78rem", color: "#22c55e", fontWeight: 800 }}>
                      You save {FMT(product.old_price - displayPrice)}!
                    </span>
                  )}
                  {/* Variant-level price tag */}
                  {activeVariant && activeVariant.price !== product.price && (
                    <span style={{
                      fontSize: "0.76rem", color: "#6b7280", fontWeight: 700,
                      background: "#f1f4ff", borderRadius: 8, padding: "2px 10px"
                    }}>
                      Variant price
                    </span>
                  )}
                </div>

                {product.variants?.length > 0 && (() => {
                  const availableColors = [...new Set(product.variants.map(v => v.color).filter(Boolean))];
                  const availableSizes = [...new Set(
                    product.variants.filter(v => v.color === activeColor).map(v => v.size).filter(Boolean)
                  )];

                  return (
                    <>
                      {/* Color picker */}
                      {availableColors.length > 0 && (
                        <div className="mb-3">
                          <div className="pd-section-title" style={{ marginBottom: 8 }}>
                            🎨 Color
                            {activeColor && (
                              <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#6b7280", marginLeft: 8 }}>
                                — <b style={{ color: "var(--p)" }}>{activeColor}</b>
                              </span>
                            )}
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            {availableColors.map(c => (
                              <div
                                key={c}
                                onClick={() => {
                                  setActiveColor(c);
                                  // reset size to first available for this color
                                  const firstSize = product.variants.find(v => v.color === c)?.size || null;
                                  setActiveSize(firstSize);
                                }}
                                style={{
                                  width: 32, height: 32, borderRadius: "50%", background: c,
                                  cursor: "pointer", border: "3px solid",
                                  borderColor: activeColor === c ? "var(--p)" : "transparent",
                                  boxShadow: activeColor === c
                                    ? "0 0 0 2px #fff, 0 0 0 4px var(--p)"
                                    : "0 1px 4px rgba(0,0,0,0.18)",
                                  transition: "box-shadow 0.15s, border-color 0.15s",
                                }}
                                title={c}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Size picker */}
                      {availableSizes.length > 0 && (
                        <div className="mb-4">
                          <div className="pd-section-title" style={{ marginBottom: 8 }}>
                            📐 Size
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            {availableSizes.map(s => {
                              const variantForSize = product.variants.find(
                                v => v.color === activeColor && v.size === s
                              );
                              const outOfStock = variantForSize?.stock === 0;
                              return (
                                <button
                                  key={s}
                                  onClick={() => !outOfStock && setActiveSize(s)}
                                  disabled={outOfStock}
                                  style={{
                                    padding: "6px 18px",
                                    borderRadius: 10,
                                    border: `2px solid ${activeSize === s ? "var(--p)" : "#e5e7eb"}`,
                                    background: activeSize === s ? "var(--p)" : "#fff",
                                    color: outOfStock ? "#bbb"
                                      : activeSize === s ? "#fff" : "#374151",
                                    fontWeight: 800,
                                    fontSize: "0.84rem",
                                    fontFamily: "Nunito",
                                    cursor: outOfStock ? "not-allowed" : "pointer",
                                    opacity: outOfStock ? 0.5 : 1,
                                    textDecoration: outOfStock ? "line-through" : "none",
                                    transition: "all 0.15s",
                                    position: "relative",
                                  }}
                                  title={outOfStock ? "Out of stock" : `Size ${s}`}
                                >
                                  {s}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Variant mismatch warning */}
                      {activeColor && activeSize && !activeVariant && (
                        <div style={{
                          background: "#fff7ed", border: "1.5px solid #fed7aa",
                          borderRadius: 10, padding: "8px 14px", marginBottom: 16,
                          fontSize: "0.82rem", fontWeight: 700, color: "#92400e"
                        }}>
                          ⚠️ This combination is unavailable. Please choose another.
                        </div>
                      )}
                    </>
                  );
                })()}
                {/* Stock */}
                <span className="mb-3" style={{
                  color: displayStock === 0 ? "#dc2626"
                    : displayStock < 15 ? "#d97706" : "#16a34a"
                }}>
                  {displayStock === 0 ? "❌ Out of Stock"
                    : displayStock < 15 ? `⚠️ Limited Stock!`
                      : `✔ in stock`}
                </span>
                {/* {console.log(displayStock)}
                <ProgressBar className="mb-3" now={displayStock ? Math.min((displayStock / 200) * 100, 100) : 0} variant={displayStock === 0 ? "danger" : displayStock < 15 ? "warning" : "success"} style={{ height: 9, borderRadius: 8 }} /> */}

                {/* Description tabs */}
                <div className="mb-4">
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "2px solid #e8eaf6", display: "flex" }}>
                    {[
                      ["desc", "📋 Description"],
                      ["policy", "↩️ Return Policy"],
                      ["info", "ℹ️ Product Info"],
                      ["reviews", "★ Reviews"],
                    ].map(([t, l]) => (
                      <button key={t} className={`pd-tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <div style={{
                    padding: "16px",
                    background: "#f8f9ff",
                    borderRadius: "0 0 12px 12px",
                    border: "2px solid #e8eaf6",
                    borderTop: "none",
                    fontSize: "0.87rem",
                    color: "#4b5563",
                    lineHeight: 1.7,
                    minHeight: 80,
                  }}>
                    {activeTab === "desc" && (product.description || "No description provided for this product.")}
                    {activeTab === "policy" && (
                      <div>
                        {product.is_return || product.is_replace ? (
                          <>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {product.is_return && <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 8, padding: "3px 10px", fontSize: "0.78rem", fontWeight: 800 }}>↩️ Return within {product.return_replace_duration} days</span>}
                              {product.is_replace && <span style={{ background: "#dbeafe", color: "#1d4ed8", borderRadius: 8, padding: "3px 10px", fontSize: "0.78rem", fontWeight: 800 }}>🔄 Replace within {product.return_replace_duration} days</span>}
                            </div>
                            {product.return_replace_instructions && (
                              <div style={{ marginTop: 6 }}>
                                <b style={{ color: "#374151" }}>Instructions:</b> {product.return_replace_instructions}
                              </div>
                            )}
                          </>
                        ) : (
                          <span style={{ color: "#9ca3af" }}>No return or replacement policy available for this product.</span>
                        )}
                      </div>
                    )}
                    {activeTab === "info" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
                        {[
                          ["Brand", product.brand],
                          ["Rating", `${product.rating} / 5`],
                          ["Total Reviews", product.reviews.toLocaleString()],
                          ["Units Sold", product.sold.toLocaleString()],
                          ["Stock", `${product.stock} units`],
                          ["Customizable", product.is_customizable ? "Yes" : "No"],
                          ["Colors Available", product?.colors?.length || "N/A"],
                          ["Listed On", product.created_at ? new Date(product.created_at).toLocaleDateString("en-IN") : "N/A"],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em" }}>{k}</span>
                            <div style={{ fontWeight: 700, color: "#374151", marginTop: 1 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === "reviews" && (
                      <div style={{ minHeight: 120 }}>
                        {reviewsLoading ? (
                          <div className="text-center p-4">
                            <div className="pd-skeleton" style={{ height: 20, width: "100%", marginBottom: 10 }} />
                            <div className="pd-skeleton" style={{ height: 20, width: "80%", marginBottom: 10 }} />
                            <div className="pd-skeleton" style={{ height: 20, width: "60%" }} />
                          </div>
                        ) : reviews.length === 0 ? (
                          <div className="text-center p-4 text-muted">
                            <div style={{ fontSize: "2rem", marginBottom: 8 }}>💬</div>
                            <p className="mb-0 fw-bold">No reviews yet</p>
                            <p className="small">Be the first to share your experience after purchasing!</p>
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-3">
                            {reviews.map((r) => (
                              <div key={r.id} style={{ borderBottom: "1.5px solid #f0f0f0", paddingBottom: 12 }}>
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <div className="fw-bold" style={{ fontSize: "0.88rem", color: "#1a1a2e" }}>
                                    {r.user_name || "Verified Customer"}
                                  </div>
                                  <div className="small text-muted" style={{ fontWeight: 600 }}>
                                    {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </div>
                                </div>
                                <div className="mb-2" style={{ display: "flex", gap: 2 }}>
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} style={{ color: s <= r.rating ? "#ffc107" : "#e4e5e9", fontSize: "0.75rem" }}>★</span>
                                  ))}
                                </div>
                                <p className="mb-0" style={{ fontSize: "0.82rem", color: "#4b5563", lineHeight: 1.5 }}>
                                  {r.comment || "No comment provided."}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>


                {/* Quantity selector */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#374151" }}>Quantity:</span>
                  <button className="pd-qty-btn" disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span style={{ fontWeight: 900, fontSize: "1.1rem", minWidth: 28, textAlign: "center", color: "var(--text)" }}>{qty}</span>
                  <button className="pd-qty-btn" disabled={qty >= displayStock || displayStock === 0} onClick={() => setQty(q => Math.min(displayStock, q + 1))}>+</button>
                  {product.stock > 0 && (
                    <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700 }}>
                      Total: <b style={{ color: "var(--p)" }}>{FMT(displayPrice * qty)}</b>
                    </span>
                  )}
                </div>

                {/* CTA buttons */}
                <div className="d-flex gap-3 mb-4">
                  <Button
                    className="eco-btn-main text-white flex-fill py-3"
                    disabled={
                      (product.variants?.length > 0 && !activeVariant) ||
                      displayStock === 0 ||
                      addedToCart
                    }
                    onClick={handleAddToCart}
                  >
                    {product.variants?.length > 0 && !activeVariant ? "⚙️ Select a Variant"
                      : addedToCart ? "✅ Added!"
                        : displayStock === 0 ? "❌ Out of Stock"
                          : (displayStock) ? "Item Added" : "🛒 Add to Cart"}
                  </Button>
                  <Button
                    className="eco-btn-outline flex-fill py-3 fw-bold"

                    disabled={displayStock === 0}
                    style={{ fontSize: "0.9rem" }}
                  >
                    ⚡ Buy Now
                  </Button>
                  <Button
                    className="eco-btn-outline flex-fill py-3 fw-bold"

                    disabled={displayStock === 0}
                    style={{ fontSize: "0.9rem" }}
                    onClick={handleNavigateCustomization}
                  >
                    ⚡ Customize Now
                  </Button>
                </div>

                {/* Policy quick cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { icon: "🚚", title: "Free Delivery", sub: "On orders above ₹499" },
                    { icon: "🔒", title: "Secure Payment", sub: "100% safe checkout" },
                    product.is_return ? { icon: "↩️", title: `${product.return_replace_duration}-Day Return`, sub: "Easy hassle-free returns" }
                      : { icon: "✅", title: "Quality Assured", sub: "Verified by ShopEase" },
                    product.is_replace ? { icon: "🔄", title: `${product.return_replace_duration}-Day Replace`, sub: "Quick replacement service" }
                      : { icon: "⚡", title: "Fast Dispatch", sub: "Ships in 24 hours" },
                  ].map(({ icon, title, sub }) => (
                    <div key={title} className="pd-policy-card">
                      <span style={{ fontSize: "1.3rem", lineHeight: 1, flexShrink: 0 }}>{icon}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.8rem", color: "#1a1a2e" }}>{title}</div>
                        <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 700 }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

              </Card>
            </Col>
          </Row>

          {/* ══ RELATED PRODUCTS ══ */}
          {related.length > 0 && (
            <div className="mt-5 fu" style={{ animationDelay: "0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h4 className="fw-bold mb-0" style={{ fontFamily: "Nunito", color: "var(--text)" }}>
                  🛍️ More Products
                </h4>
                <button
                  onClick={() => navigate(-1)}
                  style={{ border: "none", background: "none", color: "var(--p)", fontWeight: 800, cursor: "pointer", fontFamily: "Nunito", fontSize: "0.84rem" }}
                >
                  View All →
                </button>
              </div>
              <Row className="g-3">
                {related.map((r, i) => (
                  <Col xs={6} md={3} key={r.id}>
                    <div className="pd-rel-card fu" style={{ animationDelay: `${0.2 + i * 0.05}s` }}
                      onClick={() => navigate(`/product/${r.id}`)}>
                      <div style={{ position: "relative" }}>
                        <img
                          src={r.img}
                          alt={r.title}
                          className="pd-rel-img"
                          onError={e => { e.target.src = `https://placehold.co/300x300/f1f4ff/ff6b35?text=${encodeURIComponent(r.title.slice(0, 2))}`; }}
                        />
                        {r.discount > 0 && (
                          <span style={{
                            position: "absolute", top: 8, left: 8,
                            background: "#dc3545", color: "#fff",
                            borderRadius: 20, padding: "2px 8px",
                            fontSize: "0.65rem", fontWeight: 900
                          }}>{r.discount}% OFF</span>
                        )}
                      </div>
                      <div style={{ padding: "12px 14px 14px" }}>
                        <div style={{ fontSize: "0.68rem", color: "var(--p)", fontWeight: 800, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.03em" }}>{r.brand}</div>
                        <div style={{
                          fontWeight: 800, fontSize: "0.88rem", color: "var(--text)",
                          lineHeight: 1.3, marginBottom: 6,
                          overflow: "hidden", display: "-webkit-box",
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                        }}>{r.title}</div>
                        <div className="d-flex align-items-baseline gap-1 mb-2">
                          <span style={{ fontWeight: 900, color: "var(--p)", fontSize: "0.95rem" }}>{FMT(r.price)}</span>
                          {r.old_price > r.price && (
                            <span style={{ fontSize: "0.72rem", color: "#bbb", textDecoration: "line-through" }}>{FMT(r.old_price)}</span>
                          )}
                        </div>
                        {/* Color swatches */}
                        {r.colors.length > 0 && (
                          <div className="d-flex gap-1 mb-2">
                            {r.colors.slice(0, 5).map(c => (
                              <span key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c, border: "1.5px solid rgba(255,255,255,0.8)", boxShadow: "0 1px 3px rgba(0,0,0,.15)", display: "inline-block" }} />
                            ))}
                          </div>
                        )}
                        <button
                          style={{
                            width: "100%", border: "none", borderRadius: 10,
                            background: "linear-gradient(135deg,#ff6b35,#f7931e)",
                            color: "#fff", fontWeight: 800, fontSize: "0.78rem",
                            padding: "8px", fontFamily: "Nunito", cursor: "pointer",
                            transition: "transform 0.15s",
                          }}
                          onClick={e => { e.stopPropagation(); navigate(`/product/${r.id}`); }}
                        >
                          View Product
                        </button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Container>
        <FullScreenImageModal
          selectedImage={selectedImage}
          show={modalShow}
          onHide={() => setModalShow(false)}
        />
      </Container >
    </>
  );
}