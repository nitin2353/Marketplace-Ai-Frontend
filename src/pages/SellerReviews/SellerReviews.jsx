import { useState, useEffect, useCallback, useMemo } from "react";
import { Row, Col, Stack } from "react-bootstrap";
import toast from "react-hot-toast";
import reviewApi from "../../api/review.api";       // apna path adjust karo
import JWTService from "../../config/jwt.config";    // apna path adjust karo
import SellerSidebar from "../../components/SellerSidebar";
import SellerNavbar from "../../components/Sellernavbar";
import "./SellerReviews.css";

// ── Constants ─────────────────────────────────────────────────────────────────
const PER_PAGE = 10;
const SIDEBAR_W = 280;
const AVATAR_COLORS = ["#ff6b35", "#f7931e", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f59e0b"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "??";

const avatarColor = (name = "") =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const Stars = ({ rating = 0, size = 14 }) => (
    <span className="sr-stars">
        {[1, 2, 3, 4, 5].map(i => (
            <span key={i} className="sr-star" style={{ fontSize: size, color: i <= rating ? "#f59e0b" : "#e5e7eb" }}>★</span>
        ))}
    </span>
);

const SkeletonRow = () => (
    <div className="sr-review-row" style={{ gap: 14 }}>
        <div className="sr-skel" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
            <div className="sr-skel" style={{ height: 13, width: "30%", marginBottom: 8 }} />
            <div className="sr-skel" style={{ height: 11, width: "60%", marginBottom: 6 }} />
            <div className="sr-skel" style={{ height: 11, width: "80%" }} />
        </div>
    </div>
);

// ── Rating Bar ────────────────────────────────────────────────────────────────
function RatingBar({ star, count, total }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="sr-bar-wrap">
            <span className="sr-bar-label">{star}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>★</span>
            <div className="sr-bar-track"><div className="sr-bar-fill" style={{ width: `${pct}%` }} /></div>
            <span className="sr-bar-count">{count}</span>
        </div>
    );
}

// ── Reply Section ─────────────────────────────────────────────────────────────
function ReplySection({ review, onReplySubmit, submitting }) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState(review.seller_reply || "");

    const hasReply = !!review.seller_reply;

    const handleSubmit = async () => {
        if (!text.trim()) { toast.error("Reply cannot be empty"); return; }
        await onReplySubmit(review.id, text.trim());
        setOpen(false);
    };

    return (
        <div style={{ marginTop: 8 }}>
            {hasReply && !open && (
                <div className="sr-reply-existing">
                    <div style={{ fontSize: "0.72rem", fontWeight: 900, color: "#ff6b35", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                        Your Reply
                    </div>
                    <p style={{ fontSize: "0.84rem", color: "#374151", margin: 0, lineHeight: 1.5 }}>{review.seller_reply}</p>
                    <button className="sr-btn-ghost" style={{ marginTop: 8, fontSize: "0.75rem", padding: "4px 12px" }} onClick={() => setOpen(true)}>
                        ✏️ Edit Reply
                    </button>
                </div>
            )}

            {!hasReply && !open && (
                <button className="sr-btn-ghost" style={{ fontSize: "0.78rem" }} onClick={() => setOpen(true)}>
                    💬 Reply to this review
                </button>
            )}

            {open && (
                <div className="sr-reply-box">
                    <p style={{ fontSize: "0.73rem", fontWeight: 800, color: "#ff6b35", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                        {hasReply ? "Edit your reply" : "Write a reply"}
                    </p>
                    <textarea
                        className="sr-textarea"
                        placeholder="Write a professional, helpful response…"
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />
                    <div className="d-flex gap-2 mt-2">
                        <button className="sr-btn-primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Saving…" : hasReply ? "Update Reply" : "Post Reply"}
                        </button>
                        <button className="sr-btn-ghost" onClick={() => { setOpen(false); setText(review.seller_reply || ""); }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Single Review Card ────────────────────────────────────────────────────────
function ReviewCard({ review, onReply, onDelete, submittingId, deletingId, idx }) {
    const name = review.user_name || review.user?.full_name || "Anonymous";
    const color = avatarColor(name);
    const images = Array.isArray(review.images) ? review.images : [];

    return (
        <div className="sr-review-row sr-fade" style={{ animationDelay: `${idx * 0.04}s` }}>
            {/* Avatar */}
            <div className="sr-avatar" style={{ background: color }}>{initials(name)}</div>

            {/* Body */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header row */}
                <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap mb-1">
                    <div>
                        <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1a1a2e" }}>{name}</span>
                        {review.is_verified_purchase && (
                            <span className="sr-badge sr-badge-verified ms-2">✔ Verified</span>
                        )}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Stars rating={review.rating} />
                        <span style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 700 }}>{fmtDate(review.created_at)}</span>
                    </div>
                </div>

                {/* Product name */}
                {(review.product_title || review.product?.title) && (
                    <div className="d-flex align-items-center gap-2 mb-2" style={{ flexWrap: "wrap" }}>
                        {review.product_image && (
                            <img src={review.product_image} alt="" className="sr-product-img" style={{ width: 28, height: 28 }}
                                onError={e => { e.target.style.display = "none"; }} />
                        )}
                        <span className="sr-badge sr-badge-product">{review.product_title || review.product?.title}</span>
                    </div>
                )}

                {/* Review text */}
                {review.title && (
                    <p style={{ fontWeight: 800, fontSize: "0.88rem", color: "#1a1a2e", margin: "0 0 3px" }}>{review.title}</p>
                )}
                <p style={{ fontSize: "0.86rem", color: "#4b5563", margin: 0, lineHeight: 1.6 }}>{review.comment || review.body || "—"}</p>

                {/* Images */}
                {images.length > 0 && (
                    <div className="d-flex gap-2 mt-2 flex-wrap">
                        {images.slice(0, 5).map((img, i) => (
                            <img key={i} src={img} alt="" className="sr-product-img"
                                onError={e => { e.target.style.display = "none"; }} />
                        ))}
                    </div>
                )}

                {/* Reply */}
                <ReplySection
                    review={review}
                    onReplySubmit={onReply}
                    submitting={submittingId === review.id}
                />
            </div>

            {/* Delete */}
            <button
                className="sr-btn-danger"
                style={{ alignSelf: "flex-start", padding: "5px 10px", fontSize: "0.78rem", flexShrink: 0 }}
                onClick={() => onDelete(review.id)}
                disabled={deletingId === review.id}
            >
                {deletingId === review.id ? "…" : "🗑️"}
            </button>
        </div>
    );
}

// ── Summary Panel ─────────────────────────────────────────────────────────────
function SummaryPanel({ summary, totalReviews }) {
    const avg = summary?.average_rating || 0;
    const dist = summary?.rating_distribution || {};
    const total = totalReviews || summary?.total_reviews || 0;

    const pct5 = dist[5] || 0, pct4 = dist[4] || 0, pct3 = dist[3] || 0;
    const positive = total > 0 ? Math.round(((pct5 + pct4) / total) * 100) : 0;

    return (
        <div className="sr-summary sr-fade">
            <Row className="g-4 align-items-center" style={{ position: "relative", zIndex: 1 }}>
                {/* Big rating */}
                <Col xs={12} md={3} className="text-center text-md-start">
                    <div className="sr-big-rating">{Number(avg).toFixed(1)}</div>
                    <Stars rating={Math.round(avg)} size={18} />
                    <div className="sr-rating-label">{total} reviews total</div>
                </Col>

                {/* Bar chart */}
                <Col xs={12} md={4}>
                    {[5, 4, 3, 2, 1].map(s => (
                        <RatingBar key={s} star={s} count={dist[s] || 0} total={total} />
                    ))}
                </Col>

                {/* Stats chips */}
                <Col xs={12} md={5}>
                    <div className="d-flex gap-3 flex-wrap">
                        <div className="sr-stat-chip">
                            <div className="sr-stat-val">{positive}%</div>
                            <div className="sr-stat-label">Positive</div>
                        </div>
                        <div className="sr-stat-chip">
                            <div className="sr-stat-val">{pct5}</div>
                            <div className="sr-stat-label">5 Star</div>
                        </div>
                        <div className="sr-stat-chip">
                            <div className="sr-stat-val">{dist[1] || 0}</div>
                            <div className="sr-stat-label">1 Star</div>
                        </div>
                        <div className="sr-stat-chip">
                            <div className="sr-stat-val">{pct3}</div>
                            <div className="sr-stat-label">Neutral</div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SellerReviews() {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [ratingFilter, setRatingFilter] = useState("all");
    const [replyFilter, setReplyFilter] = useState("all"); // all | replied | unreplied
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [submittingId, setSubmittingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Get seller ID
    const sellerId = useMemo(() => {
        const d = JWTService.decodeTokenDetails?.() || {};
        return d?.id || d?.user_id;
    }, []);

    // Fetch
    const fetchData = useCallback(async () => {
        if (!sellerId) return;
        setLoading(true); setError(null);
        try {
            const [revRes, sumRes] = await Promise.all([
                reviewApi.getSellerReviews(sellerId),
                reviewApi.getSellerRatingSummary(sellerId),
            ]);
            setReviews(Array.isArray(revRes?.data) ? revRes.data : []);
            setSummary(sumRes?.data || null);
        } catch (err) {
            setError("Failed to load reviews.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [sellerId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Reply handler
    const handleReply = useCallback(async (reviewId, text) => {
        setSubmittingId(reviewId);
        try {
            await reviewApi.updateReview(reviewId, { seller_reply: text });
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, seller_reply: text } : r));
            toast.success("Reply saved!");
        } catch {
            toast.error("Failed to save reply.");
        } finally {
            setSubmittingId(null);
        }
    }, []);

    // Delete handler
    const handleDelete = useCallback(async (reviewId) => {
        if (!window.confirm("Delete this review? This cannot be undone.")) return;
        setDeletingId(reviewId);
        try {
            await reviewApi.deleteReview(reviewId, sellerId);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            toast.success("Review deleted.");
        } catch {
            toast.error("Failed to delete review.");
        } finally {
            setDeletingId(null);
        }
    }, [sellerId]);

    // Filter + sort
    const filtered = useMemo(() => {
        return [...reviews]
            .filter(r => {
                if (ratingFilter !== "all" && String(r.rating) !== ratingFilter) return false;
                if (replyFilter === "replied" && !r.seller_reply) return false;
                if (replyFilter === "unreplied" && r.seller_reply) return false;
                if (search.trim()) {
                    const q = search.toLowerCase();
                    const matchUser = (r.user_name || r.user?.full_name || "").toLowerCase().includes(q);
                    const matchProduct = (r.product_title || r.product?.title || "").toLowerCase().includes(q);
                    const matchComment = (r.comment || r.body || "").toLowerCase().includes(q);
                    if (!matchUser && !matchProduct && !matchComment) return false;
                }
                return true;
            })
            .sort((a, b) => {
                if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
                if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
                if (sortBy === "rating_high") return b.rating - a.rating;
                if (sortBy === "rating_low") return a.rating - b.rating;
                return 0;
            });
    }, [reviews, ratingFilter, replyFilter, search, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    useEffect(() => { setPage(1); }, [ratingFilter, replyFilter, search, sortBy]);
    useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

    const unreplied = reviews.filter(r => !r.seller_reply).length;

    return (
        <div className="sr-page">
            <SellerNavbar pageTitle="Reviews" />

            <div style={{ display: "flex" }}>
                <SellerSidebar />

                <div style={{ flex: 1, marginLeft: window.innerWidth >= 992 ? SIDEBAR_W : 0, minWidth: 0 }}>

                    {/* Orange topbar */}
                    <div className="sr-topbar">
                        <span className="sr-topbar-title">⭐ Reviews Management</span>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                            {unreplied > 0 && (
                                <span style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: "0.78rem", fontWeight: 800, color: "#fff" }}>
                                    {unreplied} awaiting reply
                                </span>
                            )}
                            <button className="sr-btn-ghost" style={{ borderColor: "rgba(255,255,255,0.35)", color: "#fff", fontSize: "0.78rem" }} onClick={fetchData}>
                                🔄 Refresh
                            </button>
                        </div>
                    </div>

                    <div style={{ padding: "24px 20px 48px" }}>

                        {/* Summary */}
                        {!loading && summary && (
                            <div className="mb-4">
                                <SummaryPanel summary={summary} totalReviews={reviews.length} />
                            </div>
                        )}

                        {/* Loading skeletons for summary */}
                        {loading && (
                            <div className="sr-summary mb-4" style={{ minHeight: 120 }}>
                                <div className="sr-skel" style={{ height: 14, width: "20%", marginBottom: 12 }} />
                                <div className="sr-skel" style={{ height: 10, width: "50%" }} />
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 12, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                                <span>⚠️</span>
                                <span style={{ fontWeight: 800, color: "#dc2626", fontSize: "0.88rem" }}>{error}</span>
                                <button onClick={fetchData} style={{ marginLeft: "auto", background: "none", border: "none", color: "#ff6b35", fontWeight: 800, cursor: "pointer", fontSize: "0.82rem" }}>Retry</button>
                            </div>
                        )}

                        {/* Main table card */}
                        <div className="sr-card sr-fade sr-fade-2">

                            {/* Toolbar */}
                            <div className="sr-toolbar">
                                {/* Search */}
                                <div className="sr-search-wrap">
                                    <span className="sr-search-icon">🔍</span>
                                    <input className="sr-search" placeholder="Search by customer, product or review text…"
                                        value={searchInput} onChange={e => setSearchInput(e.target.value)} />
                                </div>

                                {/* Rating filter */}
                                <select className="sr-select" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
                                    <option value="all">All Ratings</option>
                                    {[5, 4, 3, 2, 1].map(r => <option key={r} value={String(r)}>{r} ★</option>)}
                                </select>

                                {/* Reply filter */}
                                <select className="sr-select" value={replyFilter} onChange={e => setReplyFilter(e.target.value)}>
                                    <option value="all">All Reviews</option>
                                    <option value="unreplied">Needs Reply</option>
                                    <option value="replied">Replied</option>
                                </select>

                                {/* Sort */}
                                <select className="sr-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="rating_high">Highest Rating</option>
                                    <option value="rating_low">Lowest Rating</option>
                                </select>

                                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9ca3af", whiteSpace: "nowrap" }}>
                                    {filtered.length} of {reviews.length}
                                </span>
                            </div>

                            {/* Filter tabs */}
                            <div className="d-flex gap-2 px-4 py-3 flex-wrap" style={{ borderBottom: "1.5px solid #f1f4ff" }}>
                                {[
                                    { key: "all", label: "All" },
                                    { key: "unreplied", label: `Unreplied (${unreplied})` },
                                    { key: "replied", label: "Replied" },
                                ].map(t => (
                                    <button key={t.key} className={`sr-tab ${replyFilter === t.key ? "active" : ""}`}
                                        onClick={() => setReplyFilter(t.key)}>{t.label}</button>
                                ))}
                                <div className="ms-auto d-flex gap-2 flex-wrap">
                                    {[5, 4, 3].map(s => (
                                        <button key={s} className={`sr-tab ${ratingFilter === String(s) ? "active" : ""}`}
                                            onClick={() => setRatingFilter(ratingFilter === String(s) ? "all" : String(s))}>
                                            {s} ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Review list */}
                            <div>
                                {loading
                                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                    : paged.length === 0
                                        ? (
                                            <div className="sr-empty">
                                                <div style={{ fontSize: "2.8rem", marginBottom: 10 }}>⭐</div>
                                                <p style={{ fontWeight: 800, fontSize: "1rem", color: "#374151", marginBottom: 6 }}>No reviews found</p>
                                                <p style={{ fontSize: "0.84rem" }}>Try changing filters or check back later.</p>
                                                <button className="sr-btn-ghost" onClick={() => { setSearch(""); setSearchInput(""); setRatingFilter("all"); setReplyFilter("all"); }}>
                                                    Clear filters
                                                </button>
                                            </div>
                                        )
                                        : paged.map((review, i) => (
                                            <ReviewCard
                                                key={review.id}
                                                review={review}
                                                idx={i}
                                                onReply={handleReply}
                                                onDelete={handleDelete}
                                                submittingId={submittingId}
                                                deletingId={deletingId}
                                            />
                                        ))
                                }
                            </div>
                        </div>

                        {/* Pagination */}
                        {!loading && totalPages > 1 && (
                            <div className="d-flex justify-content-center align-items-center gap-2 mt-4 flex-wrap">
                                <button className="sr-pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</button>
                                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                    const p = totalPages <= 7 ? i + 1
                                        : page <= 4 ? i + 1
                                            : page >= totalPages - 3 ? totalPages - 6 + i
                                                : page - 3 + i;
                                    return (
                                        <button key={p} className={`sr-pg-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                                    );
                                })}
                                <button className="sr-pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next ›</button>
                                <span style={{ fontSize: "0.76rem", color: "#9ca3af", fontWeight: 700 }}>
                                    Page {page} of {totalPages} · {filtered.length} reviews
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}