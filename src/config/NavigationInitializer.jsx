
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setNavigator } from "./navigate.helper";
import { useAuthWrapper } from "../helper/AuthWrapper";


const NavigationInitializer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchPermissions } = useAuthWrapper();

  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);

  const prevPathname = useRef(location.pathname);
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      if (fetchPermissions) {
        fetchPermissions();
      }
    }
  }, [location.pathname, fetchPermissions]);

  return null; // No UI needed
};

export default NavigationInitializer;