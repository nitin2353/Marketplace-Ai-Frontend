import { createContext, useContext, useState, useEffect } from "react";
import uvCapitalApi from "../api/AiMarketPlaceApi";
import JWTService from "../config/jwt.config";

const AuthWrapper = createContext();


export const AuthProvider = ({ children }) => {

  const [isLike, setIsLike] = useState([])
  const [globalCartLength, setGlobalCartLength] = useState(0)
  const [refresh, setRefresh] = useState(false)
  const [coupon, setCoupon] = useState("");


  return (
    <AuthWrapper.Provider
      value={{ isLike, setIsLike, refresh, setRefresh, globalCartLength, setGlobalCartLength, coupon, setCoupon }}
    >
      {children}
    </AuthWrapper.Provider>
  );
};

export const useAuthWrapper = () => useContext(AuthWrapper);