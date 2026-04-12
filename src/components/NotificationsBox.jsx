import React, { useEffect, useState } from "react";
import { FaBell, FaTimes } from "react-icons/fa";
import { Badge, ListGroup, Overlay } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { HiOutlineMail, HiOutlineMailOpen } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import toast from "react-hot-toast";
import { BsCheckAll } from "react-icons/bs";

const COLORS = {
  primary: "#e9f3fa",
  secondary: "#3C8BB4",
  highlighter: "#2f6f8d",
  white: "#ffffff",
  lightGray: "#f8f9fa",
  gray: "#6c757d",
  darkGray: "#343a40",
  success: "#28a745",
  danger: "#dc3545",
  warning: "#ffc107",
};

const NotificationBox = ({ setRefreshTable, refreshNotification, setRefreshNotification }) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);


 
  const handleClick = (event) => {
    setShow(!show);
    setTarget(event.target);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );

    toast.success("Notification marked as read", {
      duration: 2000,
      position: "top-center",
    });

    setTimeout(() => {
      navigate(`/task/view/${notification.record_id}`);
    }, 400);
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;

    const newNotifications = notifications.filter(
      (notification) => !selectedIds.includes(notification.id)
    );

    setNotifications(newNotifications);

    toast.success(
      selectedIds.length === 1
        ? "Notification deleted successfully"
        : `${selectedIds.length} notifications deleted successfully`
    );

    setSelectedIds([]);
    setSelectAll(false);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({
      ...n,
      read: true,
    }));

    setNotifications(updated);

    toast.success("All notifications marked as read");
  };

  const deleteAllNotifications = () => {
    setNotifications([]);
    setSelectedIds([]);
    setSelectAll(false);
    toast.success("All notifications cleared");
  };

  return (
    <div className="position-relative d-inline-block">
      {/* Bell Icon */}
      <div
        className="d-flex align-items-center justify-content-center position-relative"
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          cursor: "pointer",
        }}
        onClick={handleClick}
      >
        <FaBell size={18} className="text-dark" />
        {unreadCount > 0 && (
          <Badge
            pill
            bg="secondary"
            className="position-absolute d-flex align-items-center justify-content-center"
            style={{
              color: "white",
              fontSize: "0.6rem",
              minWidth: "18px",
              height: "18px",
              top: -15,
              right: -12,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </div>

      {/* Notification Panel */}
      <Overlay
        show={show}
        target={target}
        placement="bottom-end"
        rootClose
        onHide={() => {
          setShow(false);
          setSelectedIds([]);
          setSelectAll(false);
        }}
      >
        {(props) => (
          <div
            {...props}
            style={{
              ...props.style,
              width: "380px",
              backgroundColor: COLORS.white,
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12)",
              border: `1px solid ${COLORS.primary}`,
              zIndex: 1060,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              className="d-flex justify-content-between align-items-center p-3"
              style={{ borderBottom: `1px solid ${COLORS.secondary}` }}
            >
              <div className="d-flex align-items-center gap-2">
                <h6 className="mb-0 fw-bold">Notifications</h6>
                {notifications.length > 0 && (
                  <span
                    className="badge rounded-pill"
                    style={{
                      backgroundColor: COLORS.secondary,
                      color: COLORS.white,
                      fontSize: "0.7rem",
                    }}
                  >
                    {notifications.length}
                  </span>
                )}
              </div>

              <div className="d-flex align-items-center gap-2">
                {notifications.some((n) => !n.read) &&
                  notifications.length > 0 && (
                    <button
                      className="btn btn-sm d-flex align-items-center gap-1"
                      onClick={markAllAsRead}
                      style={{
                        backgroundColor: COLORS.secondary,
                        color: COLORS.white,
                        fontSize: "0.8rem",
                        padding: "2px 8px",
                      }}
                    >
                      <BsCheckAll size={14} />
                      <span>Mark all read</span>
                    </button>
                  )}

                <button
                  className="btn btn-sm p-0"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length === 0}
                  style={{
                    color:
                      selectedIds.length > 0
                        ? COLORS.danger
                        : COLORS.gray,
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                >
                  <MdDelete size={20} />
                </button>

                <button
                  className="btn btn-sm p-0"
                  onClick={() => setShow(false)}
                >
                  <FaTimes size={16} />
                </button>
              </div>
            </div>

            {/* LIST */}
            <ListGroup
              variant="flush"
              style={{ maxHeight: "420px", overflowY: "auto" }}
            >
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <ListGroup.Item
                    key={notification.id}
                    className="p-0 border-0"
                    style={{
                      backgroundColor: notification.read
                        ? COLORS.white
                        : COLORS.primary,
                      borderBottom: `1px solid ${COLORS.primary}`,
                    }}
                  >
                    <div className="d-flex align-items-start p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(notification.id)}
                        onChange={() =>
                          handleSelect(notification.id)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="form-check-input mt-1"
                      />

                      <div
                        className="d-flex  mt-2 align-items-center justify-content-center ms-3"
                        style={{
                          width: "50px",
                          height: "40px",
                          borderRadius: "30px",
                          backgroundColor: notification.read
                            ? COLORS.primary
                            : COLORS.secondary,
                        }}
                      >
                        {notification.read ? (
                          <HiOutlineMailOpen
                            style={{ color: COLORS.gray }}
                          />
                        ) : (
                          <HiOutlineMail
                            style={{ color: COLORS.white }}
                          />
                        )}
                      </div>

                      <div
                        className="ms-3 w-100"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                      >
                        <p
                          className={`mb-1 ${notification.read
                            ? ""
                            : "fw-semibold"
                            }`}
                        >
                          {notification.name}
                        </p>
                        <small style={{ color: COLORS.gray }}>
                          {notification.time}
                        </small>

                        <div className="mt-2">
                          <small
                            style={{
                              color: COLORS.secondary,
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              textDecoration: "underline"
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                          >
                            View details →
                          </small>
                        </div>

                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center py-5 border-0">
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <div
                      className="d-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        backgroundColor: COLORS.lightGray,
                        border: `2px dashed ${COLORS.gray}`
                      }}
                    >
                      <HiOutlineMailOpen size={24} style={{ color: COLORS.gray }} />
                    </div>
                    <h6 style={{ color: COLORS.gray, marginBottom: "0.5rem" }}>
                      No notifications
                    </h6>
                    <small style={{ color: COLORS.gray, marginBottom: "1rem" }}>
                      You're all caught up!
                    </small>

                  </div>
                </ListGroup.Item>
              )}
            </ListGroup>

            {/* Footer */}
            {notifications.length > 0 && (
              <div
                className="px-3 py-2 text-center border-top d-flex justify-content-between align-items-center"
                style={{
                  backgroundColor: COLORS.lightGray,
                  borderTop: `1px solid ${COLORS.primary}`
                }}
              >
                <small style={{ color: COLORS.gray }}>
                  {unreadCount > 0 ? (
                    <span>
                      {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span>All notifications read</span>
                  )}
                </small>
              </div>
            )}

          </div>
        )}
      </Overlay>
    </div>
  );
};

export default NotificationBox;