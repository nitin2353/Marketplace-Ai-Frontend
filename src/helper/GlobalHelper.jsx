const ALL_TAGS = ["New Arrival", "Trending", "Best Seller", "Limited Edition", "Eco Friendly", "Premium", "Sale", "Exclusive", "Handmade", "Organic", "Featured"];

const SORT_OPTIONS = [
  { v: "relevance", l: "Relevance" },
  { v: "price_lo", l: "Price: Low → High" },
  { v: "price_hi", l: "Price: High → Low" },
  { v: "rating", l: "Top Rated" },
  { v: "newest", l: "Newest First" },
  { v: "popular", l: "Most Popular" },
];



const API_FIELDS_MAP = {

  products: (p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    brand: p.brand ?? "Unknown",
    category: p.category ?? "General",

    price: Number(p.base_price),
    old_price: Number(p.old_price) || 0,
    discount: p.discount ?? 0,

    img: Array.isArray(p.image_url) ? p.image_url[0] : p.image_url ?? "",
    images: Array.isArray(p.image_url) ? p.image_url : [p.image_url],

    tags: typeof p.tag === "string"
      ? p.tag.split(",").map(t => t.trim()).filter(Boolean)
      : Array.isArray(p.tag) ? p.tag : [],
    tag: typeof p.tag === "string" ? p.tag.split(",")[0]?.trim() : p.tag ?? "",

    colors: p.variants?.map(v => v.color).filter(Boolean) ?? [],
    sizes: p.variants?.map(v => v.size).filter(Boolean) ?? [],
    stock: p.variants?.reduce((sum, v) => sum + (v.stock ?? 0), 0) || p.stock || 0,
    variants: p.variants ?? [],

    rating: Number(p.rating) || 0,
    reviews: p.reviews ?? 0,
    sold: p.sold ?? 0,

    is_return: p.is_return ?? false,
    is_replace: p.is_replace ?? false,
    is_customizable: p.is_customizable ?? false,
    return_replace_duration: p.return_replace_duration ?? 0,
    return_replace_instructions: p.return_replace_instructions ?? "",

    created_at: p.created_at,
    seller_id: p.seller_id,
  }),

  cart: (row) => ({
    id: row.cart_id,
    product_id: row.product_id,
    title: row.title,
    brand: row.brand,
    price: parseFloat(row.amount),
    old_price: parseFloat(row.old_price),
    discount: row.discount,
    qty: row.total_quantity,
    stock: Number(row.available_stock) || Number(row.product_avl_stock) || 0,
    image_url: Array.isArray(row.image_url) ? row.image_url[0] : apiItem.image_url,
    color: row.color ? row.color.split(",")[0].trim() : null,
    colors: row.color ? row.color.split(",").map(c => c.trim()) : [],
    tag: row.tag ? row.tag.split(",").map(t => t.trim()) : [],
    rating: row.rating,
    reviews: row.reviews,
    size: row.size,
    product_price: row.product_price,
    is_return: row.is_return,
    is_replace: row.is_replace,
    return_replace_duration: row.return_replace_duration,
  }),

  wishlist: (raw) => ({
    wishlistId: raw.id,
    id: raw.product_id,
    title: raw.title ?? "Unnamed Product",
    description: raw.description ?? "",
    brand: raw.brand ?? "",
    category: raw.category ?? null,
    seller_id: raw.seller_id,
    img: Array.isArray(raw.image_url) ? raw.image_url[0] : raw.image_url ?? "",
    images: Array.isArray(raw.image_url) ? raw.image_url : [raw.image_url].filter(Boolean),
    price: Number(raw.base_price) || 0,
    old_price: Number(raw.old_price) || 0,
    discount: raw.discount != null ? Number(raw.discount) : 0,
    rating: Number(raw.rating) || 0,
    reviews: Number(raw.reviews) || 0,
    sold: Number(raw.sold) || 0,
    stock: Number(raw.stock) || 0,
    tags: typeof raw.tag === "string"
      ? raw.tag.split(",").map(t => t.trim()).filter(Boolean)
      : Array.isArray(raw.tag) ? raw.tag : [],
    is_return: raw.is_return ?? false,
    is_replace: raw.is_replace ?? false,
    is_customizable: raw.is_customizable ?? false,
    return_replace_duration: raw.return_replace_duration ?? 0,
    return_replace_instructions: raw.return_replace_instructions ?? "",
    addedOn: raw.created_time ?? raw.created_at ?? null,
    variants: raw.variants ?? null,
  }),

  cartitem: (raw) => ({
    id: raw.cart_id,
    product_id: raw.product_id,
    variant_id: raw.variant_id,
    title: raw.title ?? "Unnamed Product",
    brand: raw.brand ?? "",
    img: Array.isArray(raw.image_url) ? raw.image_url[0] : raw.image_url ?? "",
    images: Array.isArray(raw.image_url) ? raw.image_url : [raw.image_url].filter(Boolean),
    price: Number(raw.final_price) || 0,
    base_price: Number(raw.base_price) || 0,
    old_price: Number(raw.base_price) || 0,
    color: raw.color ?? null,
    size: raw.size ?? null,
    stock: Number(raw.variant_stock) || Number(raw.stock) || 0,
    qty: Number(raw.total_quantity) || 1,
    discount: raw.base_price && raw.final_price
      ? ((1 - Number(raw.final_price) / Number(raw.base_price)) * 100)
      : 0,
  })
}


export const FMT = (n) => `₹${Number(n).toLocaleString("en-IN")}`;


const COUPONS = {
    SAVE10: 10,
    SHOP20: 20,
    FIRST50: 50,
};

export const METHODS = [
    {
        id: "card",
        icon: "💳",
        label: "Credit / Debit Card",
        sub: "Visa, Mastercard, RuPay",
    },
    {
        id: "upi",
        icon: "📱",
        label: "UPI",
        sub: "GPay, PhonePe, Paytm & more",
    },
    {
        id: "netbanking",
        icon: "🏦",
        label: "Net Banking",
        sub: "All major Indian banks",
    },
    {
        id: "wallet",
        icon: "👛",
        label: "Mobile Wallet",
        sub: "Paytm, Mobikwik, Freecharge",
    },
    {
        id: "cod",
        icon: "💵",
        label: "Cash on Delivery",
        sub: "Pay when you receive",
    },
];

export const METHOD_ICONS = {
    card: "💳",
    upi: "📱",
    netbanking: "🏦",
    wallet: "👛",
    cod: "💵",
};

export const FMT_DATE = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const FMT_DATE_TIME = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";



export const TABS = [
    { key: "all", label: "All Orders" },
    { key: "placed", label: "Placed" },
    { key: "confirmed", label: "Confirmed" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
];


export const STATUS_META = {
    placed: { icon: "📋", label: "Placed" },
    confirmed: { icon: "✅", label: "Confirmed" },
    processing: { icon: "⚙️", label: "Processing" },
    shipped: { icon: "🚚", label: "Shipped" },
    delivered: { icon: "📦", label: "Delivered" },
    cancelled: { icon: "❌", label: "Cancelled" },
    payment_failed: { icon: "⚠️", label: "Payment Failed" },
};

export const TIMELINE_STEPS = ["placed", "confirmed", "processing", "shipped", "delivered"];


export const PAYMENT_METHOD_LABELS = {
    cod: { icon: "💵", label: "Cash on Delivery" },
    card: { icon: "💳", label: "Card" },
    upi: { icon: "📱", label: "UPI" },
    netbanking: { icon: "🏦", label: "Net Banking" },
    wallet: { icon: "👛", label: "Wallet" },
};



export default { ALL_TAGS, SORT_OPTIONS, API_FIELDS_MAP, COUPONS, METHODS, METHOD_ICONS, FMT, FMT_DATE, FMT_DATE_TIME, TABS, STATUS_META, TIMELINE_STEPS, PAYMENT_METHOD_LABELS };