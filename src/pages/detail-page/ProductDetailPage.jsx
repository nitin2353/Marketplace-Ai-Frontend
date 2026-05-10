import { Container, Row, Col, Card, Button, Badge, ProgressBar, ListGroup, Modal } from "react-bootstrap";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productApi from "../../api/product.api";
import toast from "react-hot-toast";
import GlobalLoader from "../../components/GlobalLoader";
import Toolbar from "../../components/Toolbar";
import GlobalHelper from "../../helper/GlobalHelper";
import wishlistApi from "../../api/wishlist.api";
import StarRating from "../../components/StarRating";
import cartApi from "../../api/cartApi";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import FullScreenImageModal from "../../components/FullScreenImageModal";
import reviewApi from "../../api/review.api";
import chatApi from "../../api/chat.api";
import orderApi from "../../api/order.api";
import { FMT } from "../../helper/GlobalHelper";
import JWTService from "../../config/jwt.config";
import { FcRating } from "react-icons/fc";
import { IoIosStarOutline } from "react-icons/io";




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
  const [reviewsSummary, setReviewsSummary] = useState(null);
  const [buyingNow, setBuyingNow] = useState(false);


  const { refresh, setRefresh } = useAuthWrapper()

  const searchRef = useRef();

  useEffect(() => {
    fetchProduct();
    fetchWishlist()
    fetchReviews()
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
      const [revRes, sumRes] = await Promise.all([
        reviewApi.getProductReviews(id),
        reviewApi.getProductRatingSummary(id)
      ]);

      if (revRes?.success) {
        setReviews(revRes.data || []);
      }
      if (sumRes?.success) {
        setReviewsSummary(sumRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };


  const displayPrice = activeVariant?.price ?? product?.price ?? 0;
  const displayStock = activeVariant?.stock ?? product?.stock ?? 0;


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
  }, [product, activeVariant, qty, refresh]);


  const handleBuyNow = useCallback(async () => {
    if (!product) return;

    if (product.variants?.length && !activeVariant) {
      toast.error("Please select a color and size.");
      return;
    }

    if (displayStock === 0) {
      toast.error("This product is out of stock.");
      return;
    }

    setBuyingNow(true);
    try {
      const payload = {
        product_id: product.id,
        variant_id: activeVariant?.id || null,
        quantity: qty
      };

      const res = await orderApi.buyNow(payload);
      if (res.success) {
        localStorage.setItem("buyNowData", JSON.stringify(res.data));
        navigate("/dashboard/checkout?type=buy-now");
      } else {
        throw new Error(res.message || "Failed to process buy now");
      }
    } catch (err) {
      console.error("BUY NOW ERROR:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setBuyingNow(false);
    }
  }, [product, activeVariant, qty, displayStock, navigate]);


  const handleCustomizeWithSeller = async () => {
    try {
      const response = await chatApi.getOrCreateConversation({
        seller_id: product.seller_id,
        product_id: product.id
      });
      if (response.status) {
        navigate(`/chat/${response.data.id}`);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };




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
      <Container fluid style={{ minHeight: "100vh", background: "white" }} className="p-4">
        <Container>

          {/* ── Breadcrumb ── */}
          <div className="pd-breadcrumb fu d-none d-sm-flex" style={{ display: "flex", gap: "8px", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-light)", marginBottom: "24px" }}>
            <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: "var(--primary)" }}>Home</span>
            <span>/</span>
            <span onClick={() => navigate(-1)} style={{ cursor: "pointer", color: "var(--primary)" }}>Products</span>
            <span>/</span>
            <span style={{ color: "var(--text-main)" }}>{product.title}</span>
          </div>

          <Row className="g-5">

            {/* ══ IMAGE COLUMN ══ */}
            <Col lg={5} className="fu">
              <div style={{ position: window.innerWidth >= 992 ? 'sticky' : 'relative', top: '100px' }}>
                <Card className="eco-card overflow-hidden" style={{ border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}>
                  <div style={{ position: "relative", background: "#f8fafc", padding: "20px" }}>
                    {product.discount > 0 && (
                      <div style={{
                        position: "absolute", top: 20, left: 20, zIndex: 2,
                        background: "var(--danger)", color: "#fff",
                        padding: "4px 12px", borderRadius: "4px",
                        fontSize: "0.8rem", fontWeight: 700
                      }}>
                        {product.discount}% OFF
                      </div>
                    )}
                    <img
                      onClick={(e) => { setSelectedImage(e.target.src); setModalShow(true); }}
                      key={activeImg}
                      src={product.images[activeImg] || product.img}
                      alt={product.title}
                      className={`pd-hero-img ${imgLoading ? "loading" : ""}`}
                      style={{ width: "100%", aspectRatio: "1/1", objectFit: "contain", cursor: "zoom-in" }}
                      onLoad={() => setImgLoading(false)}
                    />
                  </div>

                  <div className="p-3 border-top">
                    {product.images.length > 1 && (
                      <div className="d-flex gap-2 overflow-auto pb-2" style={{ scrollbarWidth: "none" }}>
                        {product.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`View ${i + 1}`}
                            className={`pd-thumb ${activeImg === i ? "active" : ""}`}
                            style={{
                              width: "70px",
                              height: "70px",
                              objectFit: "contain",
                              border: activeImg === i ? "2px solid var(--primary)" : "1px solid var(--border-light)",
                              borderRadius: "8px",
                              cursor: "pointer",
                              padding: "4px",
                              background: "#fff"
                            }}
                            onClick={() => switchImage(i)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </Col>

            {/* ══ DETAILS COLUMN ══ */}
            <Col lg={7}>
              <div className="fu" style={{ animationDelay: "0.1s" }}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
                    {product.brand}
                  </span>
                  <span style={{ color: "var(--border-medium)" }}>•</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    {product.category}
                  </span>
                </div>

                <h1 className="pd-title" style={{
                  fontSize: "calc(1.1rem + 1vw)",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  lineHeight: 1.3,
                  fontFamily: "var(--font-heading)",
                  marginBottom: "16px"
                }}>
                  {product.title}
                </h1>

                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="d-flex align-items-center gap-2 px-2 py-1" style={{ background: "#f0fdf4", borderRadius: "6px", border: "1px solid #dcfce7" }}>
                    <StarRating rating={reviewsSummary?.avg_rating} />
                    <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#16a34a" }}>
                      {reviewsSummary?.avg_rating}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-light)", fontWeight: 500 }}>
                    {product?.reviews} Reviews
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-light)", fontWeight: 500 }}>
                    |
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    🛒 {product.sold}+ sold
                  </span>
                </div>

                <div className="d-flex align-items-baseline gap-3 mb-4 flex-wrap">
                  <span style={{ fontSize: "calc(1.2rem + 1vw)", fontWeight: 800, color: "var(--text-main)" }}>
                    {FMT(displayPrice)}
                  </span>
                  {product.old_price > displayPrice && (
                    <span style={{ fontSize: "1.0rem", color: "var(--text-light)", textDecoration: "line-through" }}>
                      {FMT(product.old_price)}
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span style={{
                      background: "#fee2e2", color: "#b91c1c",
                      padding: "4px 12px", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 800
                    }}>
                      -{product.discount}%
                    </span>
                  )}
                </div>

                <hr style={{ border: "0", borderTop: "1px solid var(--border-light)", margin: "24px 0" }} />

                {product.variants?.length > 0 && (
                  <div className="mb-4">
                    {/* Color picker */}
                    <div className="mb-4">
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "12px" }}>
                        SELECT COLOR: <span style={{ color: "var(--primary)" }}>{activeColor}</span>
                      </p>
                      <div className="d-flex gap-3">
                        {[...new Set(product.variants.map(v => v.color).filter(Boolean))].map(c => (
                          <div
                            key={c}
                            onClick={() => {
                              setActiveColor(c);
                              const firstSize = product.variants.find(v => v.color === c)?.size || null;
                              setActiveSize(firstSize);
                            }}
                            style={{
                              width: "36px", height: "36px", borderRadius: "50%", background: c,
                              cursor: "pointer", border: activeColor === c ? "2px solid white" : "2px solid transparent",
                              boxShadow: activeColor === c ? `0 0 0 2px var(--primary)` : "0 2px 4px rgba(0,0,0,0.1)",
                              transition: "all 0.2s"
                            }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Size picker */}
                    <div className="mb-4">
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "12px" }}>
                        SELECT SIZE:
                      </p>
                      <div className="d-flex gap-2">
                        {[...new Set(product.variants.filter(v => v.color === activeColor).map(v => v.size).filter(Boolean))].map(s => {
                          const outOfStock = product.variants.find(v => v.color === activeColor && v.size === s)?.stock === 0;
                          const active = activeSize === s;
                          return (
                            <button
                              key={s}
                              onClick={() => !outOfStock && setActiveSize(s)}
                              disabled={outOfStock}
                              style={{
                                padding: "8px 20px",
                                borderRadius: "8px",
                                border: active ? "1px solid var(--primary)" : "1px solid var(--border-light)",
                                background: active ? "var(--bg-hover)" : "white",
                                color: active ? "var(--primary)" : outOfStock ? "var(--text-light)" : "var(--text-main)",
                                fontWeight: 700,
                                cursor: outOfStock ? "not-allowed" : "pointer",
                                opacity: outOfStock ? 0.5 : 1,
                                transition: "all 0.2s"
                              }}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex align-items-center gap-4 mb-4">
                  <div className="d-flex align-items-center border rounded-pill p-1" style={{ background: "#f8fafc" }}>
                    <button className="pd-qty-btn" style={{ width: "32px", height: "32px", border: "none", background: "white", borderRadius: "50%" }} disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span style={{ width: "40px", textAlign: "center", fontWeight: 700 }}>{qty}</span>
                    <button className="pd-qty-btn" style={{ width: "32px", height: "32px", border: "none", background: "white", borderRadius: "50%" }} disabled={qty >= displayStock} onClick={() => setQty(q => Math.min(displayStock, q + 1))}>+</button>
                  </div>
                  <span style={{ fontSize: "0.9rem", color: displayStock < 15 ? "var(--danger)" : "var(--success)", fontWeight: 700 }}>
                    {displayStock === 0 ? "Out of Stock" : displayStock < 15 ? `Limited Stock!` : "In Stock"}
                  </span>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-3 mb-5">
                  <Button
                    className="eco-btn-main flex-fill"
                    disabled={displayStock === 0 || addedToCart}
                    onClick={handleAddToCart}
                    style={{ fontSize: "1rem", letterSpacing: "0.5px", height: "50px" }}
                  >
                    {addedToCart ? "Added to Cart" : displayStock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  <Button
                    className="eco-btn-outline flex-fill py-3 bg-transparent d-flex align-items-center justify-content-center rounded-4"
                    style={{ border: "2px solid var(--primary)", color: "var(--primary", fontWeight: 700, height: "50px" }}
                    disabled={displayStock === 0 || buyingNow}
                    onClick={handleBuyNow}
                  >
                    {buyingNow ? "Processing..." : "Buy Now"}
                  </Button>
                  {product.is_customizable && (
                    <Button
                      className="eco-btn-main flex-fill"
                      style={{ border: "2px solid var(--primary)", color: "white", fontWeight: 700, height: "50px" }}
                      onClick={handleCustomizeWithSeller}
                    >
                      Customize
                    </Button>
                  )}
                </div>

                <div className="pd-tabs-container mb-5">
                  <div className="d-flex border-bottom overflow-auto" style={{ scrollbarWidth: "none" }}>
                    {["desc", "policy", "info"].map(tab => (
                      <button
                        key={tab}
                        className={`pd-tab-btn ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          padding: "12px 20px",
                          border: "none",
                          background: "none",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          color: activeTab === tab ? "var(--primary)" : "var(--text-light)",
                          borderBottom: activeTab === tab ? "3px solid var(--primary)" : "3px solid transparent",
                          transition: "all 0.2s"
                        }}
                      >
                        {tab === "desc" ? "Description" : tab === "policy" ? "Shipping & Returns" : "Product Specs"}
                      </button>
                    ))}
                  </div>
                  <div className="py-4" style={{ color: "var(--text-muted)", lineHeight: 1.8, fontSize: "0.95rem" }}>
                    {activeTab === "desc" && product.description}
                    {activeTab === "policy" && (
                      <div className="fu">
                        <p className="mb-3"><strong>Delivery:</strong> Free shipping on orders over ₹499. Standard delivery takes 3-5 business days.</p>
                        <div className="p-3 bg-light rounded-3 border">
                          <h6 className="fw-bold mb-2">Return & Replacement Policy</h6>
                          {product.is_return || product.is_replace ? (
                            <>
                              <p className="mb-1 small">
                                {product.is_return && product.is_replace 
                                  ? `This item is eligible for return or replacement within ${product.return_replace_duration} days of delivery.`
                                  : product.is_return 
                                    ? `This item is eligible for return and refund within ${product.return_replace_duration} days of delivery.`
                                    : `This item is eligible for replacement within ${product.return_replace_duration} days of delivery.`}
                              </p>
                              {product.return_replace_instructions && (
                                <p className="mb-0 mt-2 extra-small text-muted">
                                  <strong>Note:</strong> {product.return_replace_instructions}
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="mb-0 small text-danger">This item is non-returnable and non-replaceable.</p>
                          )}
                        </div>
                      </div>
                    )}
                    {activeTab === "info" && (
                      <div className="row g-3">
                        <div className="col-6"><strong>Brand:</strong> {product.brand}</div>
                        <div className="col-6"><strong>Category:</strong> {product.category}</div>
                        <div className="col-6"><strong>Units Sold:</strong> {product.sold}+</div>
                        <div className="col-6"><strong>Material:</strong> Premium Grade</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="row g-3">
                  {[
                    { icon: "🚚", title: "Free Delivery", sub: "On orders over ₹499" },
                    { icon: "🔒", title: "Secure Checkout", sub: "100% safe payment" },
                    { icon: "✅", title: "Guarantee", sub: product.is_return || product.is_replace ? `${product.return_replace_duration}-day easy returns` : "Quality Assured" },
                    { icon: "🎧", title: "24/7 Support", sub: "Get help anytime" },
                  ].map(({ icon, title, sub }) => (
                    <div key={title} className="col-6 col-sm-6 col-md-3">
                      <div className="p-3 border rounded-3 d-flex flex-column align-items-center text-center h-100" style={{ background: "#f8fafc" }}>
                        <span style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--text-main)" }}>{title}</div>
                          <div style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>{sub}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
          <Row className={'mt-5 full-width'}>
            <Col>
              <>
                <h4 className="fw-bold d-flex align-items-center gap-2 mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--text-main)" }}>
                  <IoIosStarOutline size={24} color="var(--primary)" />
                  Customer Reviews
                </h4>
                {reviewsSummary && (
                  <div className="review-summary-box mb-5 p-4" style={{ background: "var(--bg-hover)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
                    <Row className="align-items-center g-4">
                      <Col xs={12} md={4} className="text-center border-end-md">
                        <h2 className="fw-bold mb-1" style={{ color: "var(--text-main)", fontSize: "3rem" }}>{reviewsSummary.avg_rating}</h2>
                        <div className="mb-2"><StarRating rating={reviewsSummary.avg_rating} /></div>
                        <div style={{ fontSize: "0.9rem", color: "var(--text-light)", fontWeight: 600 }}>{reviewsSummary.total_reviews} Global Ratings</div>
                      </Col>
                      <Col xs={12} md={8}>
                        {[5, 4, 3, 2, 1].map((star) => {
                          const key = star === 5 ? "five_star" : star === 4 ? "four_star" : star === 3 ? "three_star" : star === 2 ? "two_star" : "one_star";
                          const count = reviewsSummary[key] || 0;
                          const percent = reviewsSummary.total_reviews > 0 ? (count / reviewsSummary.total_reviews) * 100 : 0;
                          return (
                            <div key={star} className="d-flex align-items-center gap-3 mb-2">
                              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-light)", minWidth: 24 }}>{star}★</span>
                              <div className="flex-fill" style={{ height: "8px", background: "white", borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                                <div style={{ height: "100%", width: `${percent}%`, background: "var(--primary)", borderRadius: "4px" }} />
                              </div>
                              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-light)", minWidth: 32 }}>{Math.round(percent)}%</span>
                            </div>
                          );
                        })}
                      </Col>
                    </Row>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <div className="text-center py-5 border rounded-3" style={{ background: "var(--bg-surface)", borderStyle: "dashed !important" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 16, opacity: 0.5 }}>💬</div>
                    <h5 className="fw-bold" style={{ color: "var(--text-main)" }}>No reviews yet</h5>
                    <p className="text-muted mb-0">Be the first to share your thoughts on this product!</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-4" style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <div style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "var(--bg-hover)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              color: "var(--primary)",
                              border: "1px solid var(--border-light)"
                            }}>
                              {r.user_name?.[0] || "U"}
                            </div>
                            <div>
                              <div className="fw-bold" style={{ fontSize: "1rem", color: "var(--text-main)" }}>
                                {r.user_name || "Verified Customer"}
                              </div>
                              {r.order_number && (
                                <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700 }}>
                                  <span style={{ marginRight: "4px" }}>✓</span> Verified Purchase
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-light)", fontWeight: 600 }}>
                            {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        </div>
                        <div className="mb-3 d-flex align-items-center gap-2">
                          <StarRating rating={r.rating} />
                          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-main)" }}>{r.rating}/5</span>
                        </div>
                        <p style={{ fontSize: "1rem", color: "var(--text-main)", lineHeight: 1.6, marginBottom: r.images?.length > 0 ? "16px" : "0" }}>
                          {r.comment || "No comment provided."}
                        </p>

                        {/* Review Images */}
                        {r.images && r.images.length > 0 && (
                          <div className="d-flex gap-3 flex-wrap mt-3">
                            {r.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt="Review"
                                onClick={() => { setSelectedImage(img); setModalShow(true); }}
                                style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", cursor: "pointer", border: "1px solid var(--border-light)", transition: "all 0.2s" }}
                                className="hover-opacity"
                              />
                            ))}
                          </div>
                        )}

                        {/* Seller Reply */}
                        {r.seller_reply && (
                          <div className="p-3 mt-4" style={{ background: "var(--bg-hover)", borderRadius: "8px", borderLeft: "4px solid var(--primary)" }}>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Response from Seller</span>
                              <span style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>• {new Date(r.seller_reply_at).toLocaleDateString("en-IN")}</span>
                            </div>
                            <p className="mb-0" style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                              "{r.seller_reply}"
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
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
                          className="eco-btn-main flex-fill d-flex justify-content-center align-items-center"
                          style={{
                            width: "100%", height: "40px", border: "none", borderRadius: 10,
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