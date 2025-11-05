import React from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";

const DashboardLayout = ({ userType, children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar userType={userType} />
      <div className="flex-1 flex flex-col">
        <Header userType={userType} />
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
