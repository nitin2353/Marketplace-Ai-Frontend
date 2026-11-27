import { Button, Col, Container, Row } from "react-bootstrap";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoLogOutOutline } from "react-icons/io5";
import { useAuthWrapper } from "../../../../helper/AuthWrapper";
import { useNavigate } from 'react-router-dom';
import JWTService from "../../../../config/jwt.config";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useState } from "react";
import NotificationBox from "../../../../components/NotificationsBox";

const WebHeader = ({ setRefreshTable, refreshNotification, setRefreshNotification }) => {
  const { user, permissions, clearUser } = useAuthWrapper();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  let groupName = "";

  if (JWTService.getTokenDetails()) {
    try {
      const decoded = JWTService.decodeTokenDetails(
        JWTService.getTokenDetails()
      );
      groupName = decoded?.user?.group_name;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const toggleSidebar = () => {
    if (window.toggleSideBar) {
      window.toggleSideBar();
    }
  };

  const handleLogout = () => {
    // revoke any in-memory blob URL and clear user from context first
    try {
      if (typeof clearUser === 'function') clearUser();
    } catch (err) {
      console.debug('clearUser error', err);
    }
    JWTService.clearTokenDetails();
    navigate('/login', { replace: true });
  };

  return (
    <Container fluid className="header-content py-0">
      <Row className="align-items-center justify-content-between flex-wrap">
        <Col xs={6} md="auto" className="d-flex align-items-center gap-2 order-1">
          <Button
            type="button"
            id="sidebarCollapse"
            className="btn custom-btn-secondary"
            onClick={toggleSidebar}
          >
            <GiHamburgerMenu fontSize={16} className="icon-default" />
          </Button>

          <div className="company-logo fs-3 fs-sm-5 fs-md-4 fs-lg-3" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img
              src="/logo-icon.png"
              className="company-logo-topbar-image ms-4"
            />
          </div>
        </Col>

        <Col
          xs="auto"
          className="d-none d-md-flex align-items-center order-md-2 ms-lg-5"
        >
          <div className="user-group d-flex align-items-center px-2 rounded-pill custom-pill">
            <img
              src={user?.file_name ? user?.file_name : "/default-user.png"}
              alt="User Profile"
              className="header_badge_img"

            />
            <span className="py-1 text-white">{user?.postgresUser?.group_name ? user?.postgresUser?.group_name : "Guest"}</span>
          </div>
        </Col>

        {/* Right Section → Always end me */}
        <Col
          xs={6} md="auto"
          className="h-full d-flex justify-content-end align-items-end gap-2 gap-md-3 order-2 order-md-3 ms-auto"
        >
          {(permissions?.deal?.create || permissions?.category?.create || permissions?.product?.create || permissions?.client?.create || permissions?.investor?.create) &&
            <div className="d-flex align-items-center position-relative">
              <MdKeyboardArrowLeft
                size={20}
                className={`fs-4 toggle-btn icon-default user-group rounded-pill custom-pill ${open ? "rotate" : ""}`}
                onClick={() => setOpen(!open)}
                title="Action"
              />
            </div >}
          <NotificationBox setRefreshTable={setRefreshTable} refreshNotification={refreshNotification} setRefreshNotification={setRefreshNotification} />
          <IoLogOutOutline
            fontSize={22}
            className="icon-default me-md-3"
            onClick={handleLogout}
            title="Logout"
          />
        </Col>
      </Row>

    </Container>

  );
};

export default WebHeader;
