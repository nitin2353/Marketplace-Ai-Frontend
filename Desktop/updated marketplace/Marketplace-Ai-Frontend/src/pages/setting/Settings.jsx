import { useState, useRef, useEffect, useCallback } from "react";
import { Container, Row, Col, Form, Button, Card, Nav, Alert } from "react-bootstrap";
import { IoSave, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import Toolbar from "../../components/Toolbar";
import { SETTINGS_TABS } from "../../helper/Constraints";
import settingsApi from "../../api/settings.api";
import GlobalLoader from "../../components/GlobalLoader";
import Profile from "./Profile.jsx";
import JWTService from "../../config/jwt.config.jsx";
import authApi from "../../api/authApi.jsx";
import Security from "./Security.jsx";
import StepAddress from "../../components/StepAddress.jsx";
import addressApi from "../../api/address.api.jsx";
import { useAuthWrapper } from "../../helper/AuthWrapper.jsx";
import CustomerReturnsList from "../../components/returns/CustomerReturnsList.jsx";
import { LogoutTab } from "../../helper/GlobalHelper.jsx";


export default function SettingsPage() {
    const searchRef = useRef();
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const { refresh } = useAuthWrapper();



    // Security State
    const [security, setSecurity] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Notification State
    const [notifications, setNotifications] = useState({
        email_notifications: true,
        sms_notifications: false,
        order_updates: true,
        promotional_emails: false,
        weekly_digest: false,
        chat_messages: true,
        review_replies: true,
        payment_updates: true
    });

    // Privacy State
    const [privacy, setPrivacy] = useState({
        profileVisibility: "public",
        showActivity: false,
        allowMessages: true,
    });

    // Address State
    const [addresses, setAddresses] = useState([]);
    const [selectedAddr, setSelectedAddr] = useState(null);

    const [newAddress, setNewAddress] = useState({
        type: "home",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [userProfile, setUserProfile] = useState({})

    // ── Fetch Initial Data ───────────────────────────────────────────────────
    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [loading, refresh]);

    const fetchAllData = async () => {
        setPageLoading(true);
        try {
            await Promise.all([
                fetchNotificationPreferences(),
                fetchPrivacySettings(),
                fetchProfileData(),
                fetchAddresses(),
            ]);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load settings");
        } finally {
            setPageLoading(false);
        }
    };


    // ── Fetch Profile ──────────────────────────────────────────────────────────
    const fetchProfileData = async () => {
        try {
            const { id } = JWTService.decodeTokenDetails();
            const { data } = await authApi.getUserById(id)
            if (data.user) {
                setUserProfile(data.user)
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        }
    };








    // ── Notification Handlers ───────────────────────────────────────────────────
    const fetchNotificationPreferences = async () => {
        try {
            const { data } = await settingsApi.getNotificationPreferences();
            if (data) {
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const handleNotificationToggle = (key) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleNotificationSave = async () => {
        setLoading(true);
        try {
            await settingsApi.updateNotificationPreferences(notifications);
            toast.success("Notification preferences updated!");
        } catch (error) {
            toast.error(error.message || "Failed to update preferences");
        } finally {
            setLoading(false);
        }
    };

    // ── Privacy Handlers ────────────────────────────────────────────────────────
    const fetchPrivacySettings = async () => {
        try {
            const { data } = await settingsApi.getPrivacySettings();
            if (data) {
                setPrivacy(data);
            }
        } catch (error) {
            console.error("Failed to fetch privacy settings:", error);
        }
    };


    // ── Address Handlers ────────────────────────────────────────────────────────
    const fetchAddresses = async () => {
        try {
            const { data } = await settingsApi.getUserAddresses();
            if (Array.isArray(data)) {
                setAddresses(data);
            }
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
        }
    };



    if (pageLoading) {
        return <GlobalLoader />;
    }



    const saveAddress = async (newAddress) => {
        setLoading(true)
        try {
            const res = await addressApi.createAddress(newAddress);
            if (!res?.success) throw new Error(res?.message || "Failed to save address.");
            const saved = res.data || newAddress;
            const updated = [...addresses, saved];
            setAddresses(updated);
            localStorage.setItem("user_addresses", JSON.stringify(updated));
            setLoading(false)
        } catch (err) {
            toast.error(err.message || "Failed to save address.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth/login");
    };




    return (
        <div className="pd-settings-container">
            <Toolbar searchRef={searchRef} isSideBar={false} isSearch={false} />

            <Container fluid className="pd-settings-main">
                <Row className="g-4">
                    {/* Sidebar Navigation */}
                    <Col lg={3} className="mb-4">
                        <Card className="pd-settings-nav-card">
                            <Nav variant="pills" className="flex-column pd-settings-nav">
                                {SETTINGS_TABS.map((tab) => (
                                    <Nav.Item key={tab.id}>
                                        <Nav.Link
                                            active={activeTab === tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className="pd-nav-link"
                                        >
                                            {tab.icon} {tab.label}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </Card>
                    </Col>

                    {/* Content Area */}
                    <Col lg={9}>

                        {activeTab === "profile" && (
                            <Profile userProfile={userProfile} loading={loading} setLoading={setLoading} />
                        )}

                        {/* ──────────────────────── Security Tab ──────────────────────────── */}
                        {activeTab === "security" && (
                            <Security userProfile={userProfile} loading={loading} setLoading={setLoading} />
                        )}

                        {/* ──────────────────────── Notifications Tab ──────────────────────────── */}
                        {activeTab === "notifications" && (
                            <Card className="pd-settings-card">
                                <Card.Header className="pd-settings-header">
                                    <h5>Notification Preferences</h5>
                                    <p className="text-muted">Control how you receive notifications</p>
                                </Card.Header>
                                <Card.Body>
                                    <div className="pd-notification-list">
                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>Email Notifications</h6>
                                                <p className="text-muted">Receive updates via email</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="email_notifications"
                                                className="pd-switch"
                                                checked={notifications.email_notifications}
                                                onChange={() => handleNotificationToggle("email_notifications")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>SMS Notifications</h6>
                                                <p className="text-muted">Receive updates via SMS</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="sms_notifications"
                                                className="pd-switch"
                                                checked={notifications.sms_notifications}
                                                onChange={() => handleNotificationToggle("sms_notifications")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>Order Updates</h6>
                                                <p className="text-muted">Get notified about your orders</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="order_updates"
                                                className="pd-switch"
                                                checked={notifications.order_updates}
                                                onChange={() => handleNotificationToggle("order_updates")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>Chat Messages</h6>
                                                <p className="text-muted">Get notified when you receive a message</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="chat_messages"
                                                className="pd-switch"
                                                checked={notifications.chat_messages}
                                                onChange={() => handleNotificationToggle("chat_messages")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>Review Replies</h6>
                                                <p className="text-muted">Get notified when a seller replies to your review</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="review_replies"
                                                className="pd-switch"
                                                checked={notifications.review_replies}
                                                onChange={() => handleNotificationToggle("review_replies")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>Payment Updates</h6>
                                                <p className="text-muted">Get notified about your payments and refunds</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="payment_updates"
                                                className="pd-switch"
                                                checked={notifications.payment_updates}
                                                onChange={() => handleNotificationToggle("payment_updates")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>Promotional Emails</h6>
                                                <p className="text-muted">Receive offers and promotions</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="promotional_emails"
                                                className="pd-switch"
                                                checked={notifications.promotional_emails}
                                                onChange={() => handleNotificationToggle("promotional_emails")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>Weekly Digest</h6>
                                                <p className="text-muted">Receive weekly summary</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="weekly_digest"
                                                className="pd-switch"
                                                checked={notifications.weekly_digest}
                                                onChange={() => handleNotificationToggle("weekly_digest")}
                                            />
                                        </div>
                                    </div>
                                    <div className="pd-button-group mt-4">
                                        <Button
                                            variant="primary"
                                            className="pd-btn-save"
                                            onClick={handleNotificationSave}
                                            disabled={loading}
                                        >
                                            <IoSave /> {loading ? "Saving..." : "Save Preferences"}
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}



                        {activeTab === "addresses" && (
                            <StepAddress
                                selectedAddr={selectedAddr}
                                addresses={addresses}
                                onSelect={setSelectedAddr}
                                onSaveAddress={saveAddress}
                            />
                        )}

                        {activeTab === "logout" && (
                            <LogoutTab />
                        )}

                        {/* {activeTab === "returns" && (
                            <Card className="pd-settings-card">
                                <Card.Header className="pd-settings-header">
                                    <h5>My Returns & Replacements</h5>
                                    <p className="text-muted">Track and manage your return requests</p>
                                </Card.Header>
                                <Card.Body>
                                    <CustomerReturnsList />
                                </Card.Body>
                            </Card>
                        )} */}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
