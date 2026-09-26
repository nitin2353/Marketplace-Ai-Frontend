import { FaHome, FaTasks, FaBan, FaCalendarAlt, FaUser, FaTachometerAlt } from "react-icons/fa";
import { FaCrown } from "react-icons/fa";
import { BiSolidBriefcase, BiSolidCategoryAlt, BiSolidDollarCircle, } from "react-icons/bi";
import { FaProductHunt } from "react-icons/fa6";
import { GrUpdate } from "react-icons/gr";

// const API_BASE_URL = `https://marketplace-ai-backend-lffk.onrender.com/api/v1`;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;




const SIDEBAR_MENUS = [
  {
    icon: "🏪",
    label: "All Products",
    id: "all"
  },
  {
    icon: "🔥",
    label: "Trending",
    id: "trending"
  },
  {
    icon: "🆕",
    label: "New Arrivals",
    id: "new"
  },
  {
    icon: "💸",
    label: "On Sale",
    id: "sale"
  },
  {
    icon: "⭐",
    label: "Top Rated",
    id: "toprated"
  },
  {
    icon: "🛒",
    label: "Orders",
    id: "orders"
  },
  {
    icon: "⚙️",
    label: "Settings",
    id: "settings"
  },
];

const SETTINGS_TABS = [
  {
    icon: "👤",
    label: "Profile",
    id: "profile",
    description: "Update your profile details"
  },
  {
    icon: "🔒",
    label: "Security",
    id: "security",
    description: "Manage your account security"
  },
  // {
  //   icon: "🔔",
  //   label: "Notifications",
  //   id: "notifications",
  //   description: "Control how you receive notifications"
  // },
  {
    icon: "📍",
    label: "Addresses",
    id: "addresses",
    description: "Manage your delivery addresses"
  },
  {
    icon: "🚪",
    label: "Logout",
    id: "logout",
    description: "Logout your account"
  },
  // {
  //   icon: "🔄",
  //   label: "Returns & Replacements",
  //   id: "returns",
  //   description: "Manage your returns & replacements"
  // },
];

const SELLER_NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", path: "/seller/dashboard" },
  { icon: "📦", label: "My Products", path: "/seller/products" },
  { icon: "➕", label: "Add Product", path: "/seller/product/create" },
  { icon: "🛒", label: "Orders", path: "/seller/orders" },
  { icon: "💬", label: "Customization Chat", path: "/chat" },
  // { icon: "🔄", label: "Returns & Rep..", path: "/seller/returns" },
  { icon: "💰", label: "Payments", path: "/seller/payments" },
  { icon: "⭐", label: "Reviews", path: "/seller/reviews" },
  { icon: "⚙️", label: "Settings", path: "/seller/settings" },
];



const PAYMENT_METHOD_META = {
  cod: { icon: "💵", label: "COD" },
  card: { icon: "💳", label: "Card" },
  upi: { icon: "📱", label: "UPI" },
  netbanking: { icon: "🏦", label: "Net Banking" },
  wallet: { icon: "👛", label: "Wallet" },
};

export const activityMeta = {
  new_order: { icon: "🛒", bg: "#f0fdf4", type: 'orders' },
  review_received: { icon: "⭐", bg: "#fefce8", type: 'review' },
  low_stock: { icon: "⚠️", bg: "#fef2f2", type: 'product' },
  return_request: { icon: "↩️", bg: "#f5f3ff", type: 'orders' },
  product_published: { icon: "📦", bg: "#eff6ff", type: 'product' },
  payout_processed: { icon: "💰", bg: "#fff3ee", type: 'payment' },
  product_trending: { icon: "🚀", bg: "#fdf4ff", type: 'product' },
};

export const timeAgo = (dateString) => {
  const now = new Date();
  const then = new Date(dateString);

  if (isNaN(then.getTime())) {
    return "Invalid date";
  }

  const diffMs = Math.max(0, now - then);

  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(days / 365);

  return `${years}y ago`;
};



export {
  API_BASE_URL,
  SIDEBAR_MENUS,
  SETTINGS_TABS,
  PAYMENT_METHOD_META,
  SELLER_NAV_ITEMS
};