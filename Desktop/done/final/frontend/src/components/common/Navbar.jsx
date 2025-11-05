import React, { useState } from "react";
import { Link, Meta, useLocation, useParams } from "react-router-dom";

const Navbar = ({ logoText }) => {
  const location = useLocation();
  const appLogoText = logoText || "GigConnect";

  // Determine active based on route
  const active =
    location.pathname === "/register"
      ? "signup"
      : location.pathname === "/login"
      ? "login"
      : "";

  console.log(location.pathname === "/client/chat");
  if(location.pathname === "/client/chat" || location.pathname  === "/freelancer/chat"){
        return(
          <>
          </>
        )
  }
  return (

      <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
      {/* Logo */}
      <div className="flex items-center space-x-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="#7C3AED"
              strokeWidth="2"
              fill="#7C3AED"
              fillOpacity="0.2"
              />
              <path d="M2 17L12 22L22 17" stroke="#7C3AED" strokeWidth="2" />
              <path d="M2 12L12 17L22 12" stroke="#7C3AED" strokeWidth="2" />
              </svg>
          <span className="text-xl font-semibold text-gray-900">
          {appLogoText}
          </span>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4 p-4">
          {/* Login Button */}
          <Link
          to="/login"
          className={`px-6 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
            active === "login"
            ? "bg-purple-600 text-white border-purple-600"
            : "text-purple-600 border-purple-600 hover:bg-purple-50"
            }`}
          >
            Log In
            </Link>
            
            {/* Signup Button */}
            <Link
            to="/register"
            className={`px-6 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
              active === "signup"
              ? "bg-purple-600 text-white border-purple-600"
              : "text-purple-600 border-purple-600 hover:bg-purple-50"
              }`}
              >
              Sign Up
              </Link>
              </div>
              </div>
              </div>
            );

};


export default Navbar;
