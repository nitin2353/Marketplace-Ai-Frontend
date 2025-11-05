import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import IdVerify from "./pages/Auth/IdVerify";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
// import VerifyOtp from "./pages/Auth/verifyOtp";
import PaymentSuccess from "./components/payment/paymentSuccess";
import EditProfile from '../src/pages/Auth/EditProfile'
import GigsDetails from './pages/gigs/gigsDetails'
import OverView from "./pages/OverviewSection";
import CreateGig from "./pages/gigs/createGigs";
import ChattingPage from "./pages/Chatting/ChattingPage";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();




  // load role from localStorage
  
  var u_role = localStorage.getItem("userRole");

  useEffect(() => {
    const storedRole = u_role;
    if (storedRole) setUserRole(storedRole);
    setLoading(false); // done loading
  }, []);

  if (loading) {

    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  }

  const hideLayout =
    userRole &&
    (location.pathname.startsWith("/freelancer-dashboard") ||
      location.pathname.startsWith("/client-dashboard") ||
      location.pathname.startsWith("/admin-dashboard"));

  return (
    <>
      {!hideLayout && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/overview" element={<OverView/>}/>

        {/* redirect based on role */}
        <Route
          path="/dashboard"
          element={
            userRole === "freelancer" ? (
              <Navigate to="/freelancer-dashboard" replace />
            ) : userRole === "user" ? (
              <Navigate to="/client-dashboard" replace />
            ) : userRole === "admin" ? (
              <Navigate to="/admin-dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Freelancer Dashboard */}
        <Route
          path="/freelancer-dashboard"
          element={
            userRole === "freelancer" ? (
              <FreelancerDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/freelancer-dashboard/:id"
          element={
            userRole === "freelancer" ? (
              <GigsDetails  who="freelancer"/>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Client Dashboard */}
        <Route
          path="/client-dashboard"
          element={
            userRole === "user" ? (
              <ClientDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/client-dashboard/:id"
          element={
            userRole === "user" ? (
               <GigsDetails who="user"/>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            userRole === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Auth Routes */}
  
        <Route 
            path="/login" 
            element={
              (!u_role) ? <Login setUserRole={setUserRole} />
              : (u_role == "freelancer") ? <Navigate to="/freelancer-dashboard" replace />
              : (u_role == "user") ? <Navigate to="/client-dashboard" replace />
              : (u_role == "admin") ? <Navigate to="/admin-dashboard" replace />
              : <Login setUserRole={setUserRole} />
            } 
        />


        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* <Route path="/verify-otp" element={<VerifyOtp />} /> */}
        <Route path="/update-profile" element={<EditProfile />} />
        <Route path="/post-gig" element={<CreateGig />} />
        <Route path="/idverify" element={<IdVerify />} />

        {/* Chat */}
        <Route path="client/chat" element={<ChattingPage user={"client"}/>} />

        <Route path="/freelancer/chat" element={<ChattingPage user={"freelancer"}/>} />

        {/* Payment */}
        <Route path="/paymentSuccess" element={<PaymentSuccess />} />

        {/* 404 */}
        <Route
          path="*"
          element={<h2 className="text-center mt-10">404 - Page Not Found</h2>}
        />
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default App;
