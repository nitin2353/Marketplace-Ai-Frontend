import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import Badge from "react-bootstrap/Badge";

export default function LandingPage() {
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
                <Button className="eco-btn-main text-white px-4">
                  Start Shopping
                </Button>
                <Button variant="light" className="fw-bold px-4">
                  Become Seller
                </Button>
              </Stack>

              <div className="mt-4">
                {["Electronics", "Fashion", "Grocery", "Beauty"].map(tag => (
                  <Badge key={tag} bg="light" text="dark" className="me-2">
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
              <Button className="eco-btn-main text-white">
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
        <Row className="g-4">
          {[1, 2, 3, 4].map(i => (
            <Col md={6} lg={3} key={i}>
              <Card className="eco-card p-3">
                <img
                  src="https://via.placeholder.com/200"
                  className="mb-2"
                />
                <h6 className="fw-bold">Product {i}</h6>
                <div className="text-warning">⭐⭐⭐⭐☆</div>
                <div className="fw-bold">₹{999 + i * 100}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* CTA FINAL */}
      <div className="eco-hero text-center text-white py-5">
        <Container>
          <h2 className="fw-bold">Join ShopEase Today 🎉</h2>
          <p>Experience the best shopping platform</p>
          <Button className="eco-btn-main text-white px-5">
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

    </div>
  );
}
