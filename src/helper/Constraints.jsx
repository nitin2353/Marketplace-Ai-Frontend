import { FaHome, FaTasks, FaBan, FaCalendarAlt, FaUser, FaTachometerAlt } from "react-icons/fa";
import { FaCrown } from "react-icons/fa";
import { BiSolidBriefcase, BiSolidCategoryAlt, BiSolidDollarCircle, } from "react-icons/bi";
import { FaProductHunt } from "react-icons/fa6";
import { GrUpdate } from "react-icons/gr";

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;

console.log("url", API_BASE_URL)



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
  {
    icon: "🔔",
    label: "Notifications",
    id: "notifications",
    description: "Control how you receive notifications"
  },
  {
    icon: "📍",
    label: "Addresses",
    id: "addresses",
    description: "Manage your delivery addresses"
  },
];


const PAYMENT_METHOD_META = {
  cod: { icon: "💵", label: "COD" },
  card: { icon: "💳", label: "Card" },
  upi: { icon: "📱", label: "UPI" },
  netbanking: { icon: "🏦", label: "Net Banking" },
  wallet: { icon: "👛", label: "Wallet" },
};

export const activityMeta = {
  new_order: { icon: "🛒", bg: "#f0fdf4" },
  review_received: { icon: "⭐", bg: "#fefce8" },
  low_stock: { icon: "⚠️", bg: "#fef2f2" },
  return_request: { icon: "↩️", bg: "#f5f3ff" },
  product_published: { icon: "📦", bg: "#eff6ff" },
  payout_processed: { icon: "💰", bg: "#fff3ee" },
  product_trending: { icon: "🚀", bg: "#fdf4ff" },
};

export const timeAgo = (dateString) => {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now - then;

  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};



export {
  API_BASE_URL,
  SIDEBAR_MENUS,
  SETTINGS_TABS,
  PAYMENT_METHOD_META,
};