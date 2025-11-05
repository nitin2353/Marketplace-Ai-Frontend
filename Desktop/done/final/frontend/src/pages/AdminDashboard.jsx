import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  Wallet,
  Star,
  MessageSquare,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import Profile from "../pages/FreeSections/Profile";
import Reviews from './AdminSections/Reviews'
import Bookings from './AdminSections/Bookings'
import AdminPayments from './AdminSections/Payments'
import ManageGigs from "./AdminSections/ManageGigs";
import ManageUsers from "./AdminSections/ManageUsers";



const AdminDashboard = () => {
  const navigate = useNavigate  ()
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-blue-600">
              Admin Overview
            </h2>
            <p className="text-gray-600">
              Welcome to the admin dashboard! Manage users, gigs, payments, and
              monitor performance.
            </p>
          </div>
        );
      case "users":
        return < ManageUsers/>;     //done
      case "gigs":
        return <ManageGigs />;      //done
      case "bookings":
        return <Bookings />;        //done
      case "wallet":
        return <AdminPayments />;   
      case "reviews":
        return <Reviews />;         //done
      case "profile":
        return <Profile />;         //done
      default:
        return <ManageGigs />;      
    }
  };

  const logOut = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        { withCredentials: true }
      );

      if (res.data.success) { 
        localStorage.removeItem("userRole"); 
        navigate("/login");
      }
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };


  const menuItems = [
    { id: "overview", label: "Analytics & Insights", icon: LayoutDashboard },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "gigs", label: "Manage Gigs", icon: Briefcase },
    { id: "bookings", label: "Manage Bookings", icon: ClipboardList },
    { id: "wallet", label: "Payments", icon: Wallet },
    { id: "reviews", label: "Manage Reviews", icon: Star },
    { id: "profile", label: "Profile", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div
            className={`flex items-center gap-2 transition-all duration-300 ${
              isSidebarOpen
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4 w-0"
            }`}
          >
            <h2
              className={`font-bold text-xl text-blue-600 whitespace-nowrap transition-all duration-300 ${
                isSidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              Admin Panel
            </h2>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Sidebar Menu */}
        <ul className="mt-6 flex-1 space-y-5">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <li
              key={id}
              className={`group flex items-center px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                activeTab === id
                  ? "bg-blue-100 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon
                className={`mr-3 h-5 w-5 ${
                  activeTab === id ? "text-blue-600" : "text-gray-500"
                }`}
              />
              {isSidebarOpen && (
                <span className="text-sm tracking-wide">{label}</span>
              )}
            </li>
          ))}
        </ul>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => logOut()}
            className="flex items-center gap-3 text-gray-600 hover:text-red-500 transition-colors text-sm"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <div className="max-w-6xl mx-auto">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
