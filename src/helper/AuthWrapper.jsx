import { createContext, useContext, useState, useEffect } from "react";

const AuthWrapper = createContext();


export const AuthProvider = ({ children }) => {

  const [isLike, setIsLike] = useState([])
  const [globalCartLength, setGlobalCartLength] = useState(0)
  const [refresh, setRefresh] = useState(false)
  const [coupon, setCoupon] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 992)


  return (
    <AuthWrapper.Provider
      value={{ isLike, setIsLike, refresh, setRefresh, globalCartLength, setGlobalCartLength, coupon, setCoupon, isOpen, setIsOpen }}
    >
      {children}
    </AuthWrapper.Provider>
  );
};

export const useAuthWrapper = () => useContext(AuthWrapper);