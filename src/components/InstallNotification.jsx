import { useEffect, useState } from "react";
import "../style/installNotification.css";

const DISMISS_KEY = "installNotificationDismissedAt";
const SNOOZE_DAYS = 7;      // after "Not now" / close, wait this long before asking again
const SHOW_DELAY = 2000;    // small delay so the popup doesn't flash during page load

/* ───────────────────────── Capture the install event early ─────────────────────────
   `beforeinstallprompt` can fire before React mounts, so we listen at module level
   and let the component subscribe. (Make sure this file is imported at app start,
   e.g. rendered once in App.jsx.) */
let deferredPrompt = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(deferredPrompt));

if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();           // stop the browser's mini-infobar, we show our own UI
        deferredPrompt = event;
        emit();
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        emit();
    });
}

/* ───────────────────────── Helpers ───────────────────────── */
const isStandalone = () =>
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: window-controls-overlay)").matches ||
    window.navigator.standalone === true;

const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isSnoozed = () => {
    try {
        const t = Number(localStorage.getItem(DISMISS_KEY));
        return t > 0 && Date.now() - t < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
    } catch {
        return false;
    }
};

const snooze = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* storage blocked */ }
};

const ShareIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v12" />
        <path d="M8 7l4-4 4 4" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
);

/* ───────────────────────── Component ───────────────────────── */
export default function InstallNotification({ appName = "AI Marketplace", appIcon = "📱" }) {
    const [prompt, setPrompt] = useState(deferredPrompt);
    const [ios] = useState(isIOS);
    const [visible, setVisible] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [showSteps, setShowSteps] = useState(false);

    // Subscribe to the captured install prompt + hide when the app gets installed
    useEffect(() => {
        const onPrompt = (p) => {
            setPrompt(p);
            if (!p) setVisible(false); // consumed or app installed
        };
        listeners.add(onPrompt);
        setPrompt(deferredPrompt);
        return () => listeners.delete(onPrompt);
    }, []);

    // Show only when the app can actually be installed on this device
    useEffect(() => {
        if (isStandalone() || isSnoozed()) return;
        if (!prompt && !ios) return; // browser can't install (e.g. Firefox desktop) → stay hidden
        const t = setTimeout(() => setVisible(true), SHOW_DELAY);
        return () => clearTimeout(t);
    }, [prompt, ios]);

    const dismiss = () => {
        snooze();
        setVisible(false);
    };

    // Close with Escape
    useEffect(() => {
        if (!visible) return;
        const onKey = (e) => e.key === "Escape" && dismiss();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [visible]);

    const handleInstall = async () => {
        // iOS Safari has no install API — show the manual steps instead
        if (ios) {
            setShowSteps((s) => !s);
            return;
        }
        if (!prompt) return;

        setInstalling(true);
        try {
            prompt.prompt();
            const { outcome } = await prompt.userChoice;
            if (outcome === "dismissed") snooze();
        } catch (err) {
            console.error("Install failed:", err);
        } finally {
            // The event can only be used once
            deferredPrompt = null;
            setPrompt(null);
            setInstalling(false);
            setVisible(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="install-notification" role="dialog" aria-labelledby="install-title" aria-describedby="install-desc">
            <div className="install-icon" aria-hidden="true">{appIcon}</div>

            <div className="install-content">
                <strong id="install-title">Install {appName}</strong>
                <p id="install-desc">
                    {ios
                        ? "Add it to your Home Screen for quick, full-screen access."
                        : "Get faster access and a full-screen app experience, right from your device."}
                </p>

                {ios && showSteps && (
                    <ol className="install-steps">
                        <li>Tap the <span className="install-share"><ShareIcon /> Share</span> button in Safari</li>
                        <li>Scroll and choose <b>Add to Home Screen</b></li>
                        <li>Tap <b>Add</b> — done!</li>
                    </ol>
                )}

                <div className="install-actions">
                    <button className="install-button" onClick={handleInstall} disabled={installing}>
                        {installing
                            ? "Installing…"
                            : ios
                                ? (showSteps ? "Hide steps" : "How to install")
                                : "⬇ Install app"}
                    </button>
                    <button className="install-later" onClick={dismiss}>Not now</button>
                </div>
            </div>

            <button className="install-close" onClick={dismiss} aria-label="Close notification">×</button>
        </div>
    );
}