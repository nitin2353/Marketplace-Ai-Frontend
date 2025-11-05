import React, { useState, useEffect } from "react";
import {
  Briefcase,
  ClipboardList,
  Wallet,
  Star,
  User,
  MessageSquare,
  Menu,
} from "lucide-react";
import BrowseGigs from "./FreeSections/BrowseGigs";
import MyBookings from "./FreeSections/MyBookings";
import WalletSection from "./FreeSections/WalletSection";
import ReviewsRatings from "./FreeSections/ReviewsRatings";
import Profile from "./FreeSections/Profile";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import ChattingPage from "./Chatting/ChattingPage";


const FreelancerDashboard = () => {
  
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("browse");
  // const [logout, logOut] = useState();
  const [isVerify, setVerification] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case "browse":
        return <BrowseGigs />;
      case "bookings":
        return <MyBookings />;
      case "wallet":
        return <WalletSection />;
      case "reviews":
        return <ReviewsRatings />;
      case "chat":
        return navigate('/freelancer/chat');
      case "profile":
        return <Profile />;
      default:
        return <BrowseGigs />;
    }
  };

    useEffect(() => {
        const verficationCheck = async () => {

              try {
                const userRes = await axios.get(
                  `${import.meta.env.VITE_API_URL}/api/user/data`,
                  { withCredentials: true }
                );
                if (userRes.data?.success) {
                  const user = userRes.data.user;
                  setVerification(user.isVerified)
                }
              } catch (error) {
                console.error("Error fetching gigs:", error);
              }

        }
        verficationCheck();
    },[])


 const logOut = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {}, 
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



  return (
  <div className="flex h-screen bg-gray-50 text-gray-800">

    <div
      className={`${
        isSidebarOpen ? "w-64" : "w-20"
      } bg-white shadow-xl border-r border-gray-200 flex flex-col transition-all duration-300`}
    >

      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <div
          className={`flex items-center gap-2 transition-all duration-300 ${
            isSidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0"
          }`}
        >
          <h2
            className={`font-bold text-xl text-blue-600 whitespace-nowrap d-flex transition-all duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            Freelancer <img src={isVerify === true ? "../../public/verify.png" : ""} style={{margin : "4.8px", height: "20px"}}/>
          </h2>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>


      <ul className="mt-6 flex-1 space-y-5">
        {[
          { id: "browse", label: "Browse Gigs", icon: Briefcase },
          { id: "bookings", label: "My Bookings", icon: ClipboardList },
          { id: "wallet", label: "Wallet", icon: Wallet },
          { id: "reviews", label: "Reviews & Ratings", icon: Star },
          { id: "chat", label: "Chat Box", icon: MessageSquare },
          { id: "profile", label: "Profile", icon: User },
        ].map(({ id, label, icon: Icon }) => (
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

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => logOut()}
          className="flex items-center gap-3 text-gray-600 hover:text-red-500 transition-colors text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14a9 9 0 11-9-9 9 9 0 019 9z"
            />
          </svg>
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>

    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto">{renderContent()}</div>
    </div>
  </div>
);

};

export default FreelancerDashboard;
