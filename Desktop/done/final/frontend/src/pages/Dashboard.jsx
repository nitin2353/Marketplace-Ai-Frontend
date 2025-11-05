import React from "react";
import Header from "../components/dashboard/Header";
import AdminDashboard from "./AdminDashboard";
import FreelancerDashboard from "./FreelancerDashboard";
import ClientDashboard from "./ClientDashboard";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <p>Please login</p>;

  switch (user.role) {
    case "admin":
      return (
        <div>
          <Header user={user} />
          <AdminDashboard />
        </div>
      );
    case "freelancer":
      return (
        <div>
          <Header user={user} />
          <FreelancerDashboard />
        </div>
      );
    default:
      return (
        <div>
          <Header user={user} />
          <ClientDashboard />
        </div>
      );
  }
};

export default Dashboard;
