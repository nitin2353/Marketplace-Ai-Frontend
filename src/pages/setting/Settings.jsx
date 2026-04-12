import { useState, useRef, useEffect, useCallback } from "react";
import { Container, Row, Col, Form, Button, Card, Nav, Alert } from "react-bootstrap";
import { IoSave, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import Toolbar from "../../components/Toolbar";
import { SETTINGS_TABS } from "../../helper/Constraints";
import settingsApi from "../../api/settings.api";
import GlobalLoader from "../../components/GlobalLoader";
import "./Settings.css";
import Profile from "./Profile.jsx";
import JWTService from "../../config/jwt.config.jsx";
import authApi from "../../api/authApi.jsx";
import Security from "./Security.jsx";
import StepAddress from "../../components/StepAddress.jsx";
import addressApi from "../../api/address.api.jsx";
import { useAuthWrapper } from "../../helper/AuthWrapper.jsx";

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
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotionalEmails: true,
        weeklyDigest: false,
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
            console.log(data)
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
                                                id="emailNotifications"
                                                className="pd-switch"
                                                checked={notifications.emailNotifications}
                                                onChange={() => handleNotificationToggle("emailNotifications")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>SMS Notifications</h6>
                                                <p className="text-muted">Receive updates via SMS</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="smsNotifications"
                                                className="pd-switch"
                                                checked={notifications.smsNotifications}
                                                onChange={() => handleNotificationToggle("smsNotifications")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>Order Updates</h6>
                                                <p className="text-muted">Get notified about your orders</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="orderUpdates"
                                                className="pd-switch"
                                                checked={notifications.orderUpdates}
                                                onChange={() => handleNotificationToggle("orderUpdates")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>Promotional Emails</h6>
                                                <p className="text-muted">Receive offers and promotions</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="promotionalEmails"
                                                className="pd-switch"
                                                checked={notifications.promotionalEmails}
                                                onChange={() => handleNotificationToggle("promotionalEmails")}
                                            />
                                        </div>

                                        <div className="pd-notification-item">
                                            <div className="pd-notification-content">
                                                <h6>Weekly Digest</h6>
                                                <p className="text-muted">Receive weekly summary</p>
                                            </div>
                                            <Form.Check
                                                type="switch"
                                                id="weeklyDigest"
                                                className="pd-switch"
                                                checked={notifications.weeklyDigest}
                                                onChange={() => handleNotificationToggle("weeklyDigest")}
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
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
