// src/components/Header.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header
      className="header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px",
        background: "#f5f5f5",
      }}
    >
      <h1>MyApp</h1>
      <div>
        <span style={{ marginRight: "10px" }}>{user?.name}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

<<<<<<< HEAD
<<<<<<< HEAD
export default Header;
=======
export default Header;
>>>>>>> b0631ab8d75811578626353574088e42e50af8f2
=======
export default Header;
>>>>>>> 8685df037814285e8694df32842517a96114253e
