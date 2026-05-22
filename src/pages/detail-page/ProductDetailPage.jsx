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
import { IoIosStarOutline, IoIosShareAlt, IoIosHeartEmpty, IoIosHeart } from "react-icons/io";
import { FiShoppingCart, FiZap, FiMessageSquare } from "react-icons/fi";
import './detail.css';

// ── Skeleton ────────────────────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <Row className="g-4">
      <Col md={5}>
        <Card className="eco-card p-3 border-0 shadow-sm">
          <div className="pd-skeleton" style={{ aspectRatio: "1/1", borderRadius: 16 }} />
          <div className="d-flex gap-2 mt-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="pd-skeleton" style={{ width: 70, height: 70, borderRadius: 12, flexShrink: 0 }} />)}
          </div>
        </Card>
      </Col>
      <Col md={7}>
        <Card className="eco-card p-4 border-0 shadow-sm">
          <div className="pd-skeleton" style={{ height: 24, width: "30%", marginBottom: 12 }} />
          <div className="pd-skeleton" style={{ height: 40, width: "90%", marginBottom: 10 }} />
          <div className="pd-skeleton" style={{ height: 18, width: "40%", marginBottom: 20 }} />
          <div className="pd-skeleton" style={{ height: 56, width: "50%", marginBottom: 24 }} />
          <div className="pd-skeleton" style={{ height: 14, marginBottom: 8 }} />
          <div className="pd-skeleton" style={{ height: 14, marginBottom: 8 }} />
          <div className="pd-skeleton" style={{ height: 14, width: "70%", marginBottom: 32 }} />
          <div className="d-flex gap-3">
            <div className="pd-skeleton" style={{ height: 50, flex: 1, borderRadius: 12 }} />
            <div className="pd-skeleton" style={{ height: 50, flex: 1, borderRadius: 12 }} />
          </div>
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
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 4;

  const { refresh, setRefresh } = useAuthWrapper()
  const searchRef = useRef();

  useEffect(() => {
    fetchProduct();
    fetchWishlist()
    fetchReviews()
    window.scrollTo(0, 0);
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
      const raw = payload?.data?.[0] ?? payload?.data ?? payload?.rows?.[0] ?? payload?.row ?? payload ?? null;

      if (raw) {
        const p = GlobalHelper.API_FIELDS_MAP["products"](raw);
        setProduct(p);
        setActiveColor(p?.variants?.[0]?.color || p?.colors?.[0] || null);
        setActiveSize(p?.variants?.[0]?.size || null);
        setActiveVariant(p?.variants?.[0] || null);

        try {
          const relResponse = await productApi.getAllProducts();
          const relPayload = relResponse?.data ?? relResponse;
          const rows = relPayload?.data ?? relPayload?.rows ?? relPayload?.data?.rows ?? (Array.isArray(relPayload) ? relPayload : []);
          setRelated((Array.isArray(rows) ? rows : [])
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
      toast.error("Failed to load product.");
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
      if (revRes?.success) setReviews(revRes.data || []);
      if (sumRes?.success) setReviewsSummary(sumRes.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const displayPrice = activeVariant?.price ?? product?.price ?? 0;
  const displayStock = activeVariant?.stock ?? product?.stock ?? 0;

  useEffect(() => {
    if (displayStock > 0 && qty > displayStock) {
      setQty(displayStock);
    } else if (displayStock === 0 && qty !== 1) {
      setQty(1);
    }
  }, [displayStock, qty]);

  const fetchWishlist = async () => {
    try {
      const { data } = await wishlistApi.getAllWishlistItems();
      if (data.success) setWishlist(data.data || [])
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
        toast.error("Out of stock.");
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
        setRefresh(!refresh);
        setAddedToCart(true);
        toast.success("Added to cart! 🛒");
      } else {
        toast.error("Failed to add to cart.");
      }
      return;
    }

    if (!activeVariant) {
      toast.error("Select color and size.");
      return;
    }
    if (activeVariant.stock === 0) {
      toast.error("Variant out of stock.");
      return;
    }
    const payload = {
      product_id: product.id,
      variant_id: activeVariant.id,
      total_quantity: qty,
      prouduct_price: activeVariant.price,
      price: Number(activeVariant.price) * qty,
    };
    const result = await cartApi.createCart(payload);
    if (result.success) {
      setAddedToCart(true);
      toast.success("Added to cart! 🛒");
    } else {
      toast.error("Failed to add to cart.");
    }
  }, [product, activeVariant, qty, refresh]);

  const handleBuyNow = useCallback(async () => {
    if (!product) return;
    if (product.variants?.length && !activeVariant) {
      toast.error("Select color and size.");
      return;
    }
    if (displayStock === 0) {
      toast.error("Out of stock.");
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
        throw new Error(res.message || "Failed to process.");
      }
    } catch (err) {
      toast.error(err.message || "Error processing buy now.");
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

      if (response.status) navigate(`/chat/${response.data.id}`);
    } catch (error) {
      toast.error("Failed to start chat.");
      navigate('/auth/login')
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const res = await wishlistApi.toogleWishlist({ id: product.id });
      if (res.success) {
        addToast(isWished ? "Removed from wishlist" : "Added to wishlist");
        fetchWishlist(); // Refresh local list
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  const isWished = wishlist.some(w => w.product_id === product?.id);

  if (loading) {
    return (
      <>
        <Toolbar isSearch={false} isSideBar={false} />
        <Container className="py-5 pd-main-content">
          <DetailSkeleton />
        </Container>
      </>
    );
  }

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <div style={{ fontSize: "4rem" }}>🔍</div>
        <h3>Product Not Found</h3>
        <Button variant="primary" className="mt-3 rounded-pill px-4" onClick={() => navigate("/")}>Go Home</Button>
      </Container>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: product?.title || "Product",
      text: `Check out this ${product?.title} on our marketplace!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard! 🔗");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        toast.error("Failed to share.");
      }
    }
  };

  return (
    <>
      <Toolbar searchRef={searchRef} search={search} cart={cart} wishlist={wishlist} setWishlist={setWishlist} setSidebar={setSidebar} addToast={addToast} setSearch={setSearch} isSideBar={false} isSearch={false} />

      <Container className="py-4 pd-main-content">
        {/* ── Breadcrumb & Actions ── */}
        <div className="d-flex justify-content-between align-items-center mb-4 fu">
          <div className="pd-breadcrumb d-none d-md-flex align-items-center gap-2 text-muted small">
            <span onClick={() => navigate("/")} className="cursor-pointer hover-primary">Home</span>
            <span>/</span>
            <span onClick={() => navigate(-1)} className="cursor-pointer hover-primary">Products</span>
            <span>/</span>
            <span className="text-dark fw-bold">{product.title.slice(0, 30)}...</span>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light rounded-circle border p-2 d-flex shadow-sm" title="Share" onClick={handleShare}><IoIosShareAlt size={20} /></button>
            {
              JWTService.isTokenAvailable() && (
                <button className="btn btn-light rounded-circle border p-2 d-flex shadow-sm" title="Wishlist" onClick={handleToggleWishlist}>
                  {isWished ? <IoIosHeart size={20} color="var(--danger)" /> : <IoIosHeartEmpty size={20} />}
                </button>
              )
            }
          </div>
        </div>

        <Row className="g-lg-5">
          {/* ══ IMAGE GALLERY ══ */}
          <Col lg={6} className="fu">
            <div className="pd-image-section">
              <div className="pd-hero-container mb-3 shadow-sm">
                <div className="position-relative">
                  {product.discount > 0 && (
                    <Badge bg="danger" className="position-absolute top-0 start-0 m-3 px-3 py-2" style={{ zIndex: 10 }}>
                      {product.discount}% OFF
                    </Badge>
                  )}
                  <img
                    onClick={() => { setSelectedImage(product.images[activeImg] || product.img); setModalShow(true); }}
                    src={product.images[activeImg] || product.img}
                    alt={product.title}
                    className={`pd-hero-img w-100 ${imgLoading ? "loading" : ""}`}
                    style={{ aspectRatio: "1/1", objectFit: "contain", background: "#f8fafc", cursor: "zoom-in" }}
                    onLoad={() => setImgLoading(false)}
                  />
                </div>
              </div>

              {product.images?.length > 1 && (
                <div className="d-flex gap-2 overflow-auto pb-2 scrollbar-hidden">
                  {product.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Thumbnail"
                      className={`pd-thumb ${activeImg === i ? "active" : ""}`}
                      style={{ width: "80px", height: "80px", cursor: "pointer", background: "#fff", padding: "4px", borderRadius: "12px" }}
                      onClick={() => switchImage(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* ══ PRODUCT DETAILS ══ */}
          <Col lg={6} className="fu" style={{ animationDelay: "0.1s" }}>
            <div className="ps-lg-3 mt-4 mt-lg-0">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Badge bg="primary-light" className="text-primary fw-bold" style={{ fontSize: "0.75rem" }}>{product.brand}</Badge>
                <span className="text-muted small fw-bold">| {product.category}</span>
              </div>

              <h1 className="fw-bold mb-3" style={{ fontSize: "2rem", color: "var(--text-main)", lineHeight: 1.2 }}>{product.title}</h1>

              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-1 bg-success-light px-2 py-1 rounded" style={{ color: "var(--success)" }}>
                  <StarRating rating={reviewsSummary?.avg_rating || 0} />
                  <span className="fw-bold ms-1">{reviewsSummary?.avg_rating || "0.0"}</span>
                </div>
                <span className="text-muted small fw-bold">{reviewsSummary?.total_reviews || 0} Reviews</span>
                <span className="text-success small fw-bold">• {product.sold || 0} Sold</span>
              </div>

              <div className="p-4 bg-light rounded-4 mb-4 border border-white shadow-sm">
                <div className="d-flex align-items-baseline gap-3 mb-1">
                  <h2 className="fw-bold text-primary mb-0" style={{ fontSize: "2.5rem" }}>{FMT(displayPrice)}</h2>
                  {product.old_price > displayPrice && (
                    <span className="text-muted text-decoration-line-through fs-5">{FMT(product.old_price)}</span>
                  )}
                </div>
                <p className="text-muted small mb-0 fw-bold">Inclusive of all taxes</p>
              </div>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="mb-4">
                  <div className="mb-4">
                    <p className="fw-bold mb-3 small text-uppercase letter-spacing-1">Color: <span className="text-primary">{activeColor}</span></p>
                    <div className="d-flex gap-3">
                      {[...new Set(product.variants.map(v => v.color).filter(Boolean))].map(c => (
                        <div key={c} onClick={() => { setActiveColor(c); const first = product.variants.find(v => v.color === c)?.size; setActiveSize(first); }}
                          className={`pd-color-dot ${activeColor === c ? "active" : ""}`} style={{ background: c }} />
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="fw-bold mb-3 small text-uppercase letter-spacing-1">Size:</p>
                    <div className="d-flex flex-wrap gap-2">
                      {[...new Set(product.variants.filter(v => v.color === activeColor).map(v => v.size).filter(Boolean))].map(s => {
                        const out = product.variants.find(v => v.color === activeColor && v.size === s)?.stock === 0;
                        return (
                          <button key={s} disabled={out} onClick={() => setActiveSize(s)}
                            className={`pd-size-btn ${activeSize === s ? "active" : ""}`}>{s}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="d-flex align-items-center gap-4 mb-5">
                <div className="d-flex align-items-center border rounded-pill p-1 bg-white shadow-sm">
                  <button className="btn btn-sm btn-light rounded-circle shadow-none" style={{ width: 32, height: 32 }} disabled={displayStock === 0 || qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                  <span className="px-3 fw-bold" style={{ minWidth: 40, textAlign: "center" }}>{displayStock === 0 ? 0 : qty}</span>
                  <button className="btn btn-sm btn-light rounded-circle shadow-none" style={{ width: 32, height: 32 }} disabled={displayStock === 0 || qty >= displayStock} onClick={() => setQty(q => Math.min(displayStock, q + 1))}>+</button>
                </div>
                <div className="d-flex flex-column">
                  <span className={`small fw-bold ${displayStock < 10 ? 'text-danger' : 'text-success'}`}>
                    {displayStock === 0 ? "Out of Stock" : displayStock < 10 ? `Only ${displayStock} left!` : "In Stock"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="d-none d-md-flex gap-3 mb-5">
                <Button variant="primary" className="flex-fill rounded-pill fw-bold py-3 shadow" style={{ height: 56 }}
                  onClick={() => { JWTService.isTokenAvailable() ? handleAddToCart() : navigate("/auth/login") }} disabled={displayStock === 0 || addedToCart}>
                  <FiShoppingCart className="me-2" /> {addedToCart ? "Added" : "Add to Cart"}
                </Button>
                <Button variant="outline-primary" className="flex-fill rounded-pill fw-bold py-3 shadow-sm" style={{ height: 56, borderWidth: 2 }}
                  onClick={() => { JWTService.isTokenAvailable() ? handleBuyNow() : navigate("/auth/login") }} disabled={displayStock === 0}>
                  <FiZap className="me-2" /> Buy Now
                </Button>
                {product.is_customizable && (
                  <Button variant="dark" className="rounded-pill px-4" title="Customize" onClick={handleCustomizeWithSeller}>
                    <FiMessageSquare />
                  </Button>
                )}
              </div>

              {/* Info Tabs */}
              <div className="mb-5 border rounded-4 overflow-hidden shadow-sm">
                <div className="d-flex border-bottom bg-light">
                  {["desc", "policy", "specs"].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                      className={`pd-tab-btn flex-fill border-0 bg-transparent fw-bold ${activeTab === t ? "active text-primary" : "text-muted"}`}>
                      {t === "desc" ? "About" : t === "policy" ? "Shipping" : "Details"}
                    </button>
                  ))}
                </div>
                <div className="p-4 bg-white" style={{ minHeight: 180 }}>
                  {activeTab === "desc" && <p className="mb-0 text-muted" style={{ lineHeight: 1.7 }}>{product.description}</p>}
                  {activeTab === "policy" && (
                    <div className="small">
                      <p className="mb-2"><strong>Free Delivery:</strong> On orders above ₹499.</p>
                      <p className="mb-2"><strong>Returns:</strong> {product.is_return ? `Easy returns within ${product.return_replace_duration} days.` : "Non-returnable."}</p>
                      <p className="mb-2"><strong>Replacements:</strong> {product.is_replace ? `Easy replacements within ${product.return_replace_duration} days.` : "Non-replaceable."}</p>
                      {product.return_replace_instructions && (
                        <p className="mb-2"><strong>Policy Details:</strong> {product.return_replace_instructions}</p>
                      )}
                      <p className="mb-0"><strong>Payments:</strong> Secure encrypted payments via Razorpay.</p>
                    </div>
                  )}
                  {activeTab === "specs" && (
                    <div className="row g-2 small">
                      <div className="col-6"><span className="text-muted">Brand</span><br /><span className="fw-bold">{product.brand}</span></div>
                      <div className="col-6"><span className="text-muted">Material</span><br /><span className="fw-bold">Premium Grade</span></div>
                      <div className="col-6"><span className="text-muted">Origin</span><br /><span className="fw-bold">Handcrafted</span></div>
                      <div className="col-6"><span className="text-muted">SKU</span><br /><span className="fw-bold">PD-{product.id.slice(0, 6).toUpperCase()}</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* ── REVIEWS SECTION ── */}
        <div className="mt-5 fu">
          <h3 className="fw-bold mb-4 d-flex align-items-center gap-2">
            <IoIosStarOutline className="text-primary" /> Customer Voice
          </h3>

          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-5">
            <Row className="g-0">
              <Col md={4} className="bg-primary text-white p-4 text-center d-flex flex-column justify-content-center">
                <h1 className="display-3 fw-bold mb-0">{reviewsSummary?.avg_rating || "0.0"}</h1>
                <div className="mb-2"><StarRating rating={reviewsSummary?.avg_rating || 0} color="#ffc107" /></div>
                <p className="mb-0 small fw-bold opacity-75">{reviewsSummary?.total_reviews || 0} Global Ratings</p>
              </Col>
              <Col md={8} className="p-4">
                {[5, 4, 3, 2, 1].map(star => {
                  const key = star === 5 ? "five_star" : star === 4 ? "four_star" : star === 3 ? "three_star" : star === 2 ? "two_star" : "one_star";
                  const count = reviewsSummary?.[key] || 0;
                  const pct = reviewsSummary?.total_reviews ? (count / reviewsSummary.total_reviews) * 100 : 0;
                  return (
                    <div key={star} className="d-flex align-items-center gap-3 mb-2">
                      <span className="small fw-bold text-muted" style={{ minWidth: 24 }}>{star}★</span>
                      <div className="flex-fill bg-light rounded-pill" style={{ height: 8 }}>
                        <div className="h-100 bg-primary rounded-pill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="small text-muted" style={{ minWidth: 32 }}>{Math.round(pct)}%</span>
                    </div>
                  );
                })}
              </Col>
            </Row>
          </Card>

          <Row className="g-3">
            {reviews.slice((reviewPage - 1) * reviewsPerPage, reviewPage * reviewsPerPage).map(r => (
              <Col lg={6} key={r.id}>
                <div className="review-card p-3 bg-white border rounded-4 shadow-sm" style={{ minHeight: "220px" }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-light rounded-circle fw-bold text-primary d-flex align-items-center justify-content-center extra-small" style={{ width: 32, height: 32, border: "1.5px solid #fff" }}>{r.user_name?.[0] || "U"}</div>
                      <div>
                        <div className="fw-bold extra-small">{r.user_name || "Customer"}</div>
                        <span className="text-success extra-small fw-bold" style={{ fontSize: "0.6rem" }}><FiZap size={8} /> Verified</span>
                      </div>
                    </div>
                    <span className="text-muted extra-small">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="mb-2 d-flex align-items-center gap-2">
                    <StarRating rating={r.rating} />
                  </div>

                  <div className="review-content" style={{ maxHeight: "60px", overflowY: "auto" }}>
                    <p className="extra-small text-muted mb-2" style={{ lineHeight: 1.4 }}>{r.comment}</p>
                  </div>

                  {/* Review Images */}
                  {r.images && r.images.length > 0 && (
                    <div className="d-flex gap-1 flex-wrap mb-2">
                      {r.images.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Review"
                          onClick={() => { setSelectedImage(img); setModalShow(true); }}
                          className="rounded-2 border cursor-pointer"
                          style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Seller Reply */}
                  {r.seller_reply && (
                    <div className="p-2 bg-light rounded-3 border-start border-primary border-3 mt-2">
                      <p className="mb-0 extra-small text-muted" style={{ fontStyle: "italic", fontSize: "0.65rem" }}>
                        <span className="fw-bold text-primary">Reply:</span> {r.seller_reply}
                      </p>
                    </div>
                  )}
                </div>
              </Col>
            ))}
          </Row>

          {/* Review Pagination */}
          {reviews.length > reviewsPerPage && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-pill px-3"
                disabled={reviewPage === 1}
                onClick={() => setReviewPage(p => p - 1)}
              >
                Previous
              </Button>
              <div className="d-flex align-items-center px-2 small fw-bold">
                {reviewPage} / {Math.ceil(reviews.length / reviewsPerPage)}
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                className="rounded-pill px-3"
                disabled={reviewPage === Math.ceil(reviews.length / reviewsPerPage)}
                onClick={() => setReviewPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <div className="mt-5 pt-5 border-top fu">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Recommended for You</h4>
              <button className="btn btn-link text-decoration-none fw-bold" onClick={() => navigate("/")}>See More</button>
            </div>
            <Row className="g-3">
              {related.map(r => (
                <Col xs={6} md={3} key={r.id}>
                  <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden cursor-pointer hover-up" onClick={() => navigate(`/product/${r.id}`)}>
                    <div className="bg-light p-2">
                      <img src={r.img} alt={r.title} className="w-100 rounded-3" style={{ aspectRatio: "1/1", objectFit: "contain" }} />
                    </div>
                    <Card.Body className="p-3">
                      <h6 className="fw-bold text-truncate mb-1">{r.title}</h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-primary">{FMT(r.price)}</span>
                        <Badge bg="success-light" className="text-success x-small"><IoIosStarOutline /> {r.rating}</Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>

      {/* Sticky Bottom Actions (Mobile) */}
      <div className="pd-sticky-actions">
        <div className="d-flex flex-column me-2">
          <span className="text-muted x-small fw-bold">Total Price</span>
          <span className="fw-bold text-primary h5 mb-0">{FMT(displayPrice * qty)}</span>
        </div>
        <div className="flex-fill d-flex gap-2">
          <Button variant="light" className="border flex-fill rounded-pill fw-bold shadow-sm" onClick={handleAddToCart} disabled={displayStock === 0}>
            + Cart
          </Button>
          <Button variant="primary" className="flex-fill rounded-pill fw-bold shadow" onClick={handleBuyNow} disabled={displayStock === 0}>
            Buy Now
          </Button>
        </div>
      </div>

      <FullScreenImageModal show={modalShow} onHide={() => setModalShow(false)} selectedImage={selectedImage} />
    </>
  );
}