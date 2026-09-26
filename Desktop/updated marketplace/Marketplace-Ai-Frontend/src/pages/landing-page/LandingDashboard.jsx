import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import Badge from "react-bootstrap/Badge";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";

import { useState, useEffect } from "react";
import productApi from "../../api/product.api";
import wishlistApi from "../../api/wishlist.api";
import { useAuthWrapper } from "../../helper/AuthWrapper";
import toast from "react-hot-toast";
import AddToCartModal from "../../components/AddToCartModal";
import SkeletonCard from "../../components/SkeletonCard";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { FMT } from "../../helper/GlobalHelper";
import GlobalHelper from "../../helper/GlobalHelper";
import CategorySection from "../../components/CategorySection";


export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [categorySections, setCategorySections] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);


  const [cartModal, setCartModal] = useState(null);
  const { isLike, setIsLike } = useAuthWrapper();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
    fetchCategorySections();
  }, []);

  const fetchCategorySections = async () => {
    try {
      const res = await productApi.getCategorySections();
      if (res.success) {
        const mappedSections = res.data.map(section => ({
          ...section,
          products: section.products.map(GlobalHelper.API_FIELDS_MAP['products'])
        }));
        setCategorySections(mappedSections);
      }
    } catch (error) {
      console.error("Landing Sections Fetch Error:", error);
    }
  };


  const fetchProducts = async () => {
    try {
      const { data } = await productApi.getAllProducts();
      const rows = Array.isArray(data.data) ? data.data : data.data?.rows || [];
      setProducts(rows.map(GlobalHelper.API_FIELDS_MAP['products']).slice(0, 8));
    } catch (error) {
      console.error("Home Products Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await wishlistApi.getAllWishlistItems();
      if (data.success) {
        setIsLike(data.data.map(ele => ele.id) || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createWishlist = async (product) => {
    try {
      const result = await wishlistApi.toogleWishlist({ id: product.id });
      if (result.success) {
        toast.success(result?.data?.message || result?.message);
        fetchWishlist();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div style={{ fontFamily: "Nunito" }}>

      {/* HEADER */}
      <div className="landing-header py-3 px-4 d-flex align-items-center justify-content-between bg-white shadow-sm sticky-top">
        <div className="d-flex align-items-center gap-4">
          <div className="text-dark fw-black" style={{ fontFamily: "var(--font-heading)", fontSize: "1.7rem", cursor: 'pointer' }} onClick={() => navigate('/')}>
            🛍️ MarketPlace
          </div>
          <div className="d-none d-lg-flex gap-3">
            <span className="fw-bold text-muted cursor-pointer" onClick={() => navigate('/dashboard')}>Categories</span>
            <span className="fw-bold text-muted cursor-pointer" onClick={() => navigate('/dashboard?nav=trending')}>Trending</span>
            <span className="fw-bold text-muted cursor-pointer" onClick={() => navigate('/dashboard?nav=sale')}>Deals</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <InputGroup className="d-none d-md-flex" style={{ width: "300px" }}>
            <Form.Control
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && navigate(`/dashboard?search=${search}`)}
              style={{ borderRadius: "20px 0 0 20px", border: "1px solid #eee", background: "#f8f9ff" }}
            />
            <Button
              variant="light"
              style={{ borderRadius: "0 20px 20px 0", border: "1px solid #eee", background: "#f8f9ff" }}
              onClick={() => navigate(`/dashboard?search=${search}`)}
            >
              🔍
            </Button>
          </InputGroup>
          <Button variant="outline-primary" className="rounded-pill px-4 fw-bold" onClick={() => navigate('/auth/login')}>Login</Button>
          <Button className="eco-btn-main text-white rounded-pill px-4 fw-bold" onClick={() => navigate('/auth/register')}>Join Free</Button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="eco-hero text-white py-5" style={{ background: "var(--primary-gradient)", borderRadius: "0 0 40px 40px" }}>
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="fw-bold mb-3" style={{ fontSize: "3.5rem", lineHeight: 1.1 }}>
                Everything You Love, <span style={{ color: "var(--accent, #fbbf24)" }}>Delivered.</span> 🚀
              </h1>
              <p className="mb-4" style={{ opacity: 0.9, fontSize: "1.1rem" }}>
                Discover millions of products from verified sellers.
                Fast delivery, easy returns, and the best prices in India.
              </p>

              <div className="d-flex gap-3 mb-4">
                <Button className="btn-light btn-lg rounded-pill px-5 fw-bold text-primary shadow" onClick={() => navigate('/dashboard')}>
                  Shop Now
                </Button>
              </div>

              <div className="mt-4">
                <span className="me-2 opacity-75">Popular:</span>
                {["Electronics", "Fashion", "Beauty"].map(tag => (
                  <Badge key={tag} bg="transparent" className="border me-2" style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboard?search=${tag}`)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </Col>

            <Col lg={6} className="text-center mt-4 mt-lg-0">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png"
                alt="shopping"
                className="img-fluid floating-anim"
                style={{ maxWidth: "80%" }}
              />
            </Col>
          </Row>
        </Container>
      </div>

      <style>{`
        .floating-anim {
          animation: floating 3s ease-in-out infinite;
        }
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .cursor-pointer { cursor: pointer; }
        .fw-black { font-weight: 900; }
      `}</style>


      {/* FEATURES */}
      <Container className="py-5">
        <h2 className="text-center fw-bold mb-4">Why Choose ShopEase?</h2>
        <Row className="g-4">
          {[
            { icon: "🚚", title: "Fast Delivery", desc: "Quick & reliable shipping" },
            { icon: "🔐", title: "Secure Payments", desc: "100% protected" },
            { icon: "💰", title: "Best Prices", desc: "Unbeatable deals" },
            // { icon: "📦", title: "Easy Returns", desc: "30-day return policy" },
          ].map(f => (
            <Col md={6} lg={3} key={f.title}>
              <Card className="eco-card text-center p-3">
                <div style={{ fontSize: "2rem" }}>{f.icon}</div>
                <h5 className="fw-bold mt-2">{f.title}</h5>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>{f.desc}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* SELLER CTA */}
      <div style={{ background: "var(--bg-hover)" }} className="py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="fw-bold">Start Selling Today 💼</h2>
              <p className="text-muted">
                Reach millions of customers and grow your business.
              </p>
              <Button className="eco-btn-main text-white" onClick={() => navigate('/seller/register')}>
                Create Seller Account
              </Button>
            </Col>
            <Col lg={6} className="text-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1040/1040230.png"
                style={{ width: "70%" }}
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* PRODUCTS PREVIEW */}
      <Container className="py-5">
        {loading ? (
          <Row className="g-4">
            {[1, 2, 3, 4].map(i => (
              <Col md={6} lg={3} key={i}><SkeletonCard /></Col>
            ))}
          </Row>
        ) : categorySections.length === 0 ? (
          <div className="text-center py-5 text-muted">No products found.</div>
        ) : (
          <div className="landing-sections">
            {categorySections.map((section) => (
              <CategorySection
                key={section.section_key}
                title={section.title}
                products={section.products}
                onSeeAll={() => {
                  if (section.category) {
                    navigate(`/dashboard?search=${section.category}`);
                  } else if (section.section_key === "trending") {
                    navigate('/dashboard?nav=trending');
                  } else if (section.section_key === "new_arrivals") {
                    navigate('/dashboard?nav=new');
                  } else if (section.section_key === "on_sale") {
                    navigate('/dashboard?nav=sale');
                  } else if (section.section_key === "top_rated") {
                    navigate('/dashboard?nav=toprated');
                  } else {
                    navigate('/dashboard');
                  }
                }}
                setCartModal={setCartModal}
                addToCart={(p) => setCartModal(p)}
                createWishlist={createWishlist}

                setSelected={(p) => navigate(`/product/${p.id}`)}
                isLike={isLike}
              />
            ))}
          </div>
        )}
        <div className="text-center mt-5">
          <Button variant="outline-primary" className="px-5 fw-bold" onClick={() => navigate('/dashboard')}>View All Products</Button>
        </div>
      </Container>


      {/* CTA FINAL */}
      <div className="eco-hero text-center text-white py-5" style={{ background: "var(--primary-gradient)" }}>
        <Container>
          <h2 className="fw-bold">Join MarketPlace Today 🎉</h2>
          <p>Experience the best shopping platform</p>
          <Button className="eco-btn-main text-white px-5" onClick={() => navigate('/auth/register')}>
            Get Started
          </Button>
        </Container>
      </div>

      {/* FOOTER */}
      <div style={{ background: "#111", color: "#aaa" }} className="py-4 text-center">
        <Container>
          <div className="mb-2">🛍️ MarketPlace</div>
          <div style={{ fontSize: "0.85rem" }}>
            © 2026 MarketPlace. All rights reserved.
          </div>
        </Container>
      </div>

      {cartModal && (
        <AddToCartModal
          item={cartModal}
          onClose={() => setCartModal(null)}
          onSuccess={() => setCartModal(null)}
        />
      )}

    </div>
  );
}
