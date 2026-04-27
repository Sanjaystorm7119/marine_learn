import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, CheckCircle, ArrowRight, X } from "lucide-react";
import "../pages/PhishingLanding.css";

const TIPS = [
  "Check the sender's email address carefully — not just the display name",
  "Hover over links before clicking to reveal the real destination URL",
  "Be suspicious of any email that creates urgency or asks you to act immediately",
  "Verify sensitive requests through a separate communication channel",
  "Real IT teams will never ask for your password via email",
];

const PhishingLanding = () => {
  const [searchParams] = useSearchParams();
  const [toastVisible, setToastVisible] = useState(false);
  const caught = searchParams.get("caught") === "1";

  useEffect(() => {
    const t = setTimeout(() => setToastVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="pl-page">
      <AnimatePresence>
        {toastVisible && caught && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="pl-toast"
          >
            <AlertTriangle size={18} className="pl-toast-icon" />
            <span>This was a simulated phishing drill — you clicked a bait link</span>
            <button className="pl-toast-close" onClick={() => setToastVisible(false)}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="pl-card"
      >
        <div className="pl-icon-wrap">
          {caught ? (
            <ShieldAlert size={56} className="pl-main-icon pl-main-icon--red" />
          ) : (
            <CheckCircle size={56} className="pl-main-icon pl-main-icon--green" />
          )}
        </div>

        {caught ? (
          <>
            <h1 className="pl-title">You just clicked a simulated phishing link</h1>
            <p className="pl-subtitle">
              Don&apos;t worry — this was a <strong>cybersecurity awareness drill</strong> run
              by your organisation. No real harm has been done and no credentials were captured.
            </p>

            <div className="pl-section">
              <p className="pl-section-label">Red flags to spot next time</p>
              <ul className="pl-tips">
                {TIPS.map((tip, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                    className="pl-tip"
                  >
                    <ShieldAlert size={15} className="pl-tip-icon" />
                    <span>{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="pl-alert-box">
              <p>
                Your training team has been notified. No action is required — use this as a
                learning moment to strengthen your phishing awareness.
              </p>
            </div>
          </>
        ) : (
          <>
            <h1 className="pl-title">Link not found</h1>
            <p className="pl-subtitle">This tracking link is invalid or has already expired.</p>
          </>
        )}

        <Link to="/dashboard" className="pl-back-btn">
          Return to Dashboard <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
};

export default PhishingLanding;
