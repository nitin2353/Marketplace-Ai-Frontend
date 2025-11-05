import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ userType }) => {
  const menuItems = {
    freelancer: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "My Gigs", path: "/my-gigs" },
      { name: "Wallet", path: "/wallet" },
      { name: "Reviews", path: "/reviews" },
    ],
    client: [
      { name: "Dashboard", path: "/dashboard" },
      { name: "Post a Gig", path: "/post-gig" },
      { name: "My Projects", path: "/projects" },
      { name: "Payments", path: "/payments" },
    ],
    admin: [
      { name: "Overview", path: "/dashboard" },
      { name: "Manage Users", path: "/users" },
      { name: "Transactions", path: "/transactions" },
      { name: "Reports", path: "/reports" },
    ],
  };

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4 text-xl font-bold border-b">Dashboard</div>
      <ul className="p-4 space-y-2">
        {menuItems[userType].map((item, index) => (
          <li key={index}>
            <Link
              to={item.path}
              className="block p-2 rounded hover:bg-blue-100 transition"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
