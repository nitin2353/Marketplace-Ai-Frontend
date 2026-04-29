import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import Badge from "react-bootstrap/Badge";
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

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartModal, setCartModal] = useState(null);
  const { isLike, setIsLike } = useAuthWrapper();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchWishlist();
  }, []);

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

      {/* HERO SECTION */}
      <div className="eco-hero text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="fw-bold" style={{ fontSize: "3rem" }}>
                Shop Smart, Sell Faster 🚀
              </h1>
              <p style={{ opacity: 0.9 }}>
                India's fastest growing marketplace for buyers & sellers.
                Join 2 Crore+ users today.
              </p>

              <Stack direction="horizontal" gap={3} className="mt-4">
                <Button className="eco-btn-main text-white px-4" onClick={() => navigate('/dashboard')}>
                  Start Shopping
                </Button>
                <Button variant="light" className="fw-bold px-4" onClick={() => navigate('/seller/register')}>
                  Become Seller
                </Button>
              </Stack>

              <div className="mt-4">
                {["Electronics", "Fashion", "Grocery", "Beauty"].map(tag => (
                  <Badge key={tag} bg="light" text="dark" className="me-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </Col>

            <Col lg={6} className="text-center mt-4 mt-lg-0">
              <img
                src="https://cdn-icons-png.flaticon.com/512/263/263142.png"
                alt="shopping"
                style={{ width: "80%" }}
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* FEATURES */}
      <Container className="py-5">
        <h2 className="text-center fw-bold mb-4">Why Choose ShopEase?</h2>
        <Row className="g-4">
          {[
            { icon: "🚚", title: "Fast Delivery", desc: "Quick & reliable shipping" },
            { icon: "🔐", title: "Secure Payments", desc: "100% protected" },
            { icon: "💰", title: "Best Prices", desc: "Unbeatable deals" },
            { icon: "📦", title: "Easy Returns", desc: "30-day return policy" },
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
      <div style={{ background: "#fff4ef" }} className="py-5">
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
        <h2 className="text-center fw-bold mb-4">Trending Products 🔥</h2>
        {loading ? (
          <Row className="g-4">
            {[1, 2, 3, 4].map(i => (
              <Col md={6} lg={3} key={i}><SkeletonCard /></Col>
            ))}
          </Row>
        ) : products.length === 0 ? (
          <div className="text-center py-5 text-muted">No products found.</div>
        ) : (
          <Row className="g-4">
            {products.map((p, i) => (
              <Col md={6} lg={3} key={p.id}>
                <ProductCard
                  product={p}
                  setCartModal={setCartModal}
                  onAdd={() => setCartModal(p)}
                  onWishlist={createWishlist}
                  onView={() => navigate(`/product/${p.id}`)}
                  isWished={isLike.includes(p.id)}
                  delay={i * 0.1}
                />
              </Col>
            ))}
          </Row>
        )}
        <div className="text-center mt-5">
           <Button variant="outline-primary" className="px-5 fw-bold" onClick={() => navigate('/dashboard')}>View All Products</Button>
        </div>
      </Container>

      {/* CTA FINAL */}
      <div className="eco-hero text-center text-white py-5">
        <Container>
          <h2 className="fw-bold">Join ShopEase Today 🎉</h2>
          <p>Experience the best shopping platform</p>
          <Button className="eco-btn-main text-white px-5" onClick={() => navigate('/auth/register')}>
            Get Started
          </Button>
        </Container>
      </div>

      {/* FOOTER */}
      <div style={{ background: "#111", color: "#aaa" }} className="py-4 text-center">
        <Container>
          <div className="mb-2">🛍️ ShopEase</div>
          <div style={{ fontSize: "0.85rem" }}>
            © 2026 ShopEase. All rights reserved.
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
