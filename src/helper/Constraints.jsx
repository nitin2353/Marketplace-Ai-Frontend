import { FaHome, FaTasks, FaBan, FaCalendarAlt, FaUser, FaTachometerAlt } from "react-icons/fa";
import { FaCrown } from "react-icons/fa";
import { BiSolidBriefcase, BiSolidCategoryAlt, BiSolidDollarCircle, } from "react-icons/bi";
import { FaProductHunt } from "react-icons/fa6";
import { GrUpdate } from "react-icons/gr";

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
// const API_BASE_URL = `https://bql1tnzk-3000.inc1.devtunnels.ms/api/v1`;



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

export {
  API_BASE_URL,
  SIDEBAR_MENUS,
  SETTINGS_TABS,
};