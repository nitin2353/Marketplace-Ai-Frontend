import { Fragment, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import SidebarCard from '../../../../components/Sidebar';
import CompanyLogo from '../../../../components/CompanyLogo';
import { SIDEBAR_MENUS } from '../../../../helper/Constraints';
import './index.css';

const WebSideBar = () => {
  const location = useLocation();
  const [sidebarSubMenu, setSidebarSubMenu] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [_isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef(0);

  const saveScroll = useCallback(() => {
    const el = document.querySelector('#sidebar .sub-menus');
    if (el) scrollRef.current = el.scrollTop;
  }, []);

  const restoreScroll = useCallback(() => {
    const el = document.querySelector('#sidebar .sub-menus');
    if (el) requestAnimationFrame(() => el.scrollTop = scrollRef.current);
  }, []);

  const filteredMenus = useMemo(() => {
    saveScroll();
    return SIDEBAR_MENUS;
  }, [saveScroll]);

  useEffect(() => {
    const updatedMenus = filteredMenus.map(menu => {
      const isActive = location.pathname === menu.redirect || location.pathname.startsWith(menu.redirect + "/");
      return { ...menu, isActive };
    });
    setSidebarSubMenu(updatedMenus);
    restoreScroll();
  }, [filteredMenus, location.pathname, restoreScroll]);

  const closeSidebar = useCallback(() => {
    const sidebar = document.querySelector("#sidebar");
    const overlay = document.querySelector(".mobile-overlay");
    const mainContent = document.querySelector("#main-content");

    if (sidebar && !sidebar.classList.contains("hide")) {
      sidebar.classList.add("hide");
      setIsSidebarOpen(false);
      overlay?.classList.remove("show");
      mainContent?.classList.add("full-width");
    }
  }, []);

  const navigate = useNavigate();

  const navigatePage = useCallback((path, hideSidebar = false) => {
    if (isMobile || hideSidebar) closeSidebar();
    navigate(path);
  }, [closeSidebar, navigate]);

  const toggleSidebar = useCallback(() => {
    const sidebar = document.querySelector("#sidebar");
    const overlay = document.querySelector(".mobile-overlay");
    const mainContent = document.querySelector("#main-content");

    if (!sidebar) return;

    if (sidebar.classList.contains("hide")) {
      sidebar.classList.remove("hide");
      setIsSidebarOpen(true);
      overlay?.classList.add("show");
      mainContent?.classList.remove("full-width");
    } else {
      closeSidebar();
    }
  }, [closeSidebar]);

  useEffect(() => {
    window.toggleSideBar = toggleSidebar;
    window.closeSideBar = closeSidebar;
    return () => {
      delete window.toggleSideBar;
      delete window.closeSideBar;
    };
  }, [toggleSidebar, closeSidebar]);

  return (
    <Fragment>
      <SidebarCard showModal={showModal} setShowModal={setShowModal} />
      <div className='sub-menus mt-3'>
        {sidebarSubMenu.map((item, index) => (
          <ul
            key={index}
            className="list-unstyled components d-flex align-items-center menu-list"
            onClick={() => navigatePage(item.redirect)}
          >
            <li className={`${item.isActive ? 'active-sidebar d-flex align-items-center' : "inactive-sidebar"}`}>
              <span className="custom-link-sidebar icon-default ms-2">
                <span className='fs-6'>{item.icon}</span> {item.title}
              </span>
            </li>
          </ul>
        ))}
        <CompanyLogo />
      </div>
    </Fragment>
  );
};

export default WebSideBar;
