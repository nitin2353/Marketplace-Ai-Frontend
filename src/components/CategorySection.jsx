import React, { useRef } from "react";
import { Row, Col, Button } from "react-bootstrap";
import ProductCard from "./ProductCard";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";

const CategorySection = ({ 
    title, 
    products, 
    onSeeAll, 
    setCartModal, 
    addToCart, 
    createWishlist, 
    toggleCompare, 
    setSelected, 
    isLike, 
    compareList 
}) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <div className="category-section mb-5" style={{ background: "transparent", padding: "10px 0" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 px-1">
                <div className="d-flex align-items-center gap-3">
                    <div style={{ width: "4px", height: "24px", background: "var(--primary)", borderRadius: "4px" }}></div>
                    <h3 className="m-0" style={{ 
                        fontSize: "1.4rem", 
                        fontWeight: 700, 
                        color: "var(--text-main)",
                        fontFamily: "var(--font-heading)"
                    }}>
                        {title}
                    </h3>
                </div>
                <div className="d-flex gap-3 align-items-center">
                    <div className="d-none d-md-flex gap-2">
                        <button 
                            className="scroll-nav-btn" 
                            onClick={() => scroll("left")}
                            style={{ 
                                width: "36px", 
                                height: "36px", 
                                borderRadius: "50%", 
                                border: "1px solid var(--border-light)",
                                background: "white",
                                color: "var(--text-main)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "var(--shadow-sm)",
                                transition: "all 0.2s"
                            }}
                        >
                            <IoArrowBack />
                        </button>
                        <button 
                            className="scroll-nav-btn" 
                            onClick={() => scroll("right")}
                            style={{ 
                                width: "36px", 
                                height: "36px", 
                                borderRadius: "50%", 
                                border: "1px solid var(--border-light)",
                                background: "white",
                                color: "var(--text-main)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "var(--shadow-sm)",
                                transition: "all 0.2s"
                            }}
                        >
                            <IoArrowForward />
                        </button>
                    </div>
                    <button 
                        className="see-all-link" 
                        onClick={onSeeAll}
                        style={{ 
                            background: "none",
                            border: "none",
                            color: "var(--primary)",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            padding: "4px 8px",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        See all
                    </button>
                </div>
            </div>

            <div 
                ref={scrollRef}
                className="product-scroll-container"
                style={{ 
                    display: "flex", 
                    overflowX: "auto", 
                    gap: "20px", 
                    padding: "10px 4px 30px",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    scrollBehavior: "smooth"
                }}
            >
                {products.map((p, i) => (
                    <div key={p.id} style={{ minWidth: "260px", maxWidth: "260px", flexShrink: 0 }}>
                        <ProductCard
                            product={p}
                            setCartModal={setCartModal}
                            onAdd={addToCart}
                            onWishlist={createWishlist}
                            onCompare={toggleCompare}
                            onView={setSelected}
                            isWished={isLike.includes(p.id)}
                            isCompared={!!compareList?.find(x => x.id === p.id)}
                            delay={i * 0.05}
                        />
                    </div>
                ))}
            </div>
            
            <style>{`
                .product-scroll-container::-webkit-scrollbar {
                    display: none;
                }
                .scroll-nav-btn:hover {
                    background: var(--primary) !important;
                    color: white !important;
                    border-color: var(--primary) !important;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2) !important;
                }
                .see-all-link:hover {
                    color: var(--primary-dark) !important;
                    text-decoration: underline !important;
                }
            `}</style>
        </div>
    );
};

export default CategorySection;
