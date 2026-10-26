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
import { LogoutTab } from "../../helper/GlobalHelper.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import TermsAndConditions from "../../components/TermsAndConditions.jsx";

export default function SettingsPage() {

    // const [activeTab, setActiveTab] = useState(from === 'productDefaultAddress' ? 'addresses' : "profile");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const { refresh } = useAuthWrapper();


    const searchRef = useRef();
    const location = useLocation();
    const navigate = useNavigate();

    const from = location.state?.from;

    const [activeTab, setActiveTab] = useState(
        from === "productDefaultAddress" ? "addresses" : "profile"
    );

    useEffect(() => {
        if (from === "productDefaultAddress") {
            setActiveTab("addresses");
        }
    }, [from]);



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
    }, [refresh]);

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
        setLoading(true);

        try {
            const res = await addressApi.createAddress(newAddress);

            if (!res?.success) {
                throw new Error(res?.message || "Failed to save address.");
            }

            const saved = res.data || newAddress;

            setAddresses((prev) => {
                const updated = [...prev, saved];
                localStorage.setItem(
                    "user_addresses",
                    JSON.stringify(updated)
                );
                return updated;
            });

            toast.success("Address saved successfully!");
        } catch (err) {
            toast.error(err.message || "Failed to save address.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth/login", { replace: true });
    };



    return (
        <div className="pd-settings-container">
            <Toolbar
                searchRef={searchRef}
                isSideBar={false}
                isSearch={false}
            />

            <Container fluid className="pd-settings-main">
                <Row className="g-4">

                    {/* Sidebar Navigation */}
                    <Col lg={3} className="mb-4">
                        <Card className="pd-settings-nav-card">
                            <Nav
                                variant="pills"
                                className="flex-column pd-settings-nav"
                            >
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

                    {/* Content Area: Only one tab renders at a time */}
                    <Col lg={9}>

                        {/* Profile */}
                        {activeTab === "profile" && (
                            <Profile
                                userProfile={userProfile}
                                loading={loading}
                                setLoading={setLoading}
                            />
                        )}

                        {/* Security */}
                        {activeTab === "security" && (
                            <Security
                                userProfile={userProfile}
                                loading={loading}
                                setLoading={setLoading}
                            />
                        )}

                        {activeTab === "help" && (
                            navigate('/en/policy')
                        )}

                        {/* Notifications */}
                        {activeTab === "notifications" && (
                            <Card className="pd-settings-card">
                                <Card.Header>
                                    <h5>Notification Preferences</h5>
                                    <p className="text-muted mb-0">
                                        Control how you receive notifications.
                                    </p>
                                </Card.Header>

                                <Card.Body>
                                    {[
                                        ["email_notifications", "Email Notifications"],
                                        ["sms_notifications", "SMS Notifications"],
                                        ["order_updates", "Order Updates"],
                                        ["promotional_emails", "Promotional Emails"],
                                        ["weekly_digest", "Weekly Digest"],
                                        ["chat_messages", "Chat Messages"],
                                        ["review_replies", "Review Replies"],
                                        ["payment_updates", "Payment Updates"],
                                    ].map(([key, label]) => (
                                        <Form.Check
                                            key={key}
                                            type="switch"
                                            id={key}
                                            label={label}
                                            className="mb-3"
                                            checked={Boolean(notifications[key])}
                                            onChange={() => handleNotificationToggle(key)}
                                        />
                                    ))}

                                    <Button
                                        variant="primary"
                                        onClick={handleNotificationSave}
                                        disabled={loading}
                                    >
                                        <IoSave className="me-1" />
                                        {loading ? "Saving..." : "Save Preferences"}
                                    </Button>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Addresses */}
                        {activeTab === "addresses" && (
                            <StepAddress
                                selectedAddr={selectedAddr}
                                addresses={addresses}
                                onSelect={setSelectedAddr}
                                onSaveAddress={saveAddress}
                            />
                        )}

                        {/* Logout */}
                        {activeTab === "logout" && (
                            <LogoutTab />
                        )}

                    </Col>
                </Row>
            </Container>
        </div>
    );
}
