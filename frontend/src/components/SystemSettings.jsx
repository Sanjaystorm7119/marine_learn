import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Mail, Bell, Shield, Database, Palette, Users, FileText,
  Save, Upload, RotateCcw, Clock, Server, HardDrive, Settings2, CheckCircle2,
} from "lucide-react";
import '../pages/SystemSettings.css';


/* ─────────────────────────────────────────
   Toast
───────────────────────────────────────── */
const Toast = ({ message, onClose }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="ss-toast"
      >
        <CheckCircle2 className="ss-toast-icon" />
        <div>
          <p className="ss-toast-title">{message.title}</p>
          <p className="ss-toast-desc">{message.desc}</p>
        </div>
        <button onClick={onClose} className="ss-toast-close">&times;</button>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─────────────────────────────────────────
   Toggle Switch
───────────────────────────────────────── */
const Toggle = ({ defaultChecked = false }) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`ss-toggle ${on ? "ss-toggle--on" : "ss-toggle--off"}`}
    >
      <span className={`ss-toggle-thumb ${on ? "ss-toggle-thumb--on" : ""}`} />
    </button>
  );
};

/* ─────────────────────────────────────────
   Input
───────────────────────────────────────── */
const Inp = ({ className = "", ...props }) => (
  <input {...props} className={`ss-input ${className}`} />
);

/* ─────────────────────────────────────────
   Textarea
───────────────────────────────────────── */
const Tarea = ({ className = "", ...props }) => (
  <textarea {...props} className={`ss-textarea ${className}`} />
);

/* ─────────────────────────────────────────
   Select
───────────────────────────────────────── */
const Sel = ({ defaultValue, className = "", children }) => (
  <select defaultValue={defaultValue} className={`ss-select ${className}`}>
    {children}
  </select>
);

/* ─────────────────────────────────────────
   Buttons
───────────────────────────────────────── */
const BtnOutline = ({ onClick, children, className = "" }) => (
  <button onClick={onClick} className={`ss-btn-outline ${className}`}>
    {children}
  </button>
);

const BtnPrimary = ({ onClick, children, className = "" }) => (
  <button onClick={onClick} className={`ss-btn-primary ${className}`}>
    {children}
  </button>
);

/* ─────────────────────────────────────────
   Settings Card
───────────────────────────────────────── */
const SettingsCard = ({ title, desc, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="ss-card"
  >
    <div className="ss-card-header">
      <h2 className="ss-card-title">{title}</h2>
      <p className="ss-card-desc">{desc}</p>
    </div>
    {children}
  </motion.div>
);

/* ─────────────────────────────────────────
   Settings Row
───────────────────────────────────────── */
const SettingsRow = ({ label, children }) => (
  <div className="ss-row">
    <label className="ss-row-label">{label}</label>
    <div className="ss-row-control">{children}</div>
  </div>
);

/* ─────────────────────────────────────────
   Stat Box
───────────────────────────────────────── */
const StatBox = ({ icon: Icon, label, value, sub, green }) => (
  <div className="ss-stat-box">
    <div className="ss-stat-header">
      <Icon className={green ? "ss-stat-icon ss-stat-icon--green" : "ss-stat-icon"} />
      <span className="ss-stat-label">{label}</span>
    </div>
    <p className={green ? "ss-stat-value ss-stat-value--green" : "ss-stat-value"}>{value}</p>
    <p className="ss-stat-sub">{sub}</p>
  </div>
);

/* ─────────────────────────────────────────
   Inline helpers
───────────────────────────────────────── */
const Row2 = ({ children }) => (
  <div className="ss-inline-row">{children}</div>
);

const Hint = ({ children }) => (
  <span className="ss-hint">{children}</span>
);

/* ═══════════════════════════════════════════
   Main SystemSettings Component
═══════════════════════════════════════════ */
const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [toast, setToast] = useState(null);

  const showToast = (title, desc) => {
    setToast({ title, desc });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = () =>
    showToast("Settings saved", "System settings have been updated successfully.");

  const settingsTabs = [
    { id: "general",       label: "General",         icon: Globe    },
    { id: "email",         label: "Email & SMTP",    icon: Mail     },
    { id: "notifications", label: "Notifications",   icon: Bell     },
    { id: "security",      label: "Security",        icon: Shield   },
    { id: "storage",       label: "Storage & Media", icon: Database },
    { id: "appearance",    label: "Appearance",      icon: Palette  },
    { id: "enrollment",    label: "Enrollment",      icon: Users    },
    { id: "certificates",  label: "Certificates",    icon: FileText },
    { id: "maintenance",   label: "Maintenance",     icon: Server   },
  ];

  return (
    <>
      <div className="ss-page">

        {/* ── Header ── */}
        <div className="ss-header">
          <div>
            <h1 className="ss-heading">
              <Settings2 className="ss-heading-icon" />
              System Settings
            </h1>
            <p className="ss-subheading">Configure platform-wide settings and preferences</p>
          </div>
          <div className="ss-header-actions">
            <BtnOutline><RotateCcw className="ss-btn-icon" /> Reset Defaults</BtnOutline>
            <BtnPrimary onClick={handleSave}><Save className="ss-btn-icon" /> Save Changes</BtnPrimary>
          </div>
        </div>

        {/* ── Layout ── */}
        <div className="ss-layout">

          {/* Sidebar */}
          <div className="ss-sidebar">
            {settingsTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`ss-tab-btn ${activeTab === id ? "ss-tab-btn--active" : ""}`}
              >
                <Icon className="ss-tab-icon" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="ss-content">

            {/* General */}
            {activeTab === "general" && (
              <SettingsCard title="Platform Information" desc="Basic platform configuration">
                <SettingsRow label="Platform Name">
                  <Inp defaultValue="MarineLearn" className="ss-input--wide" />
                </SettingsRow>
                <SettingsRow label="Platform URL">
                  <Inp defaultValue="https://marinelearn.com" className="ss-input--wide" />
                </SettingsRow>
                <SettingsRow label="Platform Description">
                  <Tarea
                    defaultValue="Professional maritime e-learning platform for seafarers and maritime professionals."
                    className="ss-input--wide"
                    rows={3}
                  />
                </SettingsRow>
                <SettingsRow label="Default Language">
                  <Sel defaultValue="en" className="ss-input--wide">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="zh">Chinese</option>
                  </Sel>
                </SettingsRow>
                <SettingsRow label="Timezone">
                  <Sel defaultValue="utc" className="ss-input--wide">
                    <option value="utc">UTC</option>
                    <option value="est">Eastern (EST)</option>
                    <option value="pst">Pacific (PST)</option>
                    <option value="ist">India (IST)</option>
                    <option value="gmt">GMT</option>
                  </Sel>
                </SettingsRow>
                <SettingsRow label="Maintenance Mode">
                  <Row2>
                    <Toggle />
                    <Hint>Temporarily disable access for non-admin users</Hint>
                  </Row2>
                </SettingsRow>
              </SettingsCard>
            )}

            {/* Email & SMTP */}
            {activeTab === "email" && (
              <SettingsCard title="SMTP Configuration" desc="Email delivery settings for notifications and alerts">
                <SettingsRow label="SMTP Host">
                  <Inp defaultValue="smtp.gmail.com" className="ss-input--wide" />
                </SettingsRow>
                <SettingsRow label="SMTP Port">
                  <Inp defaultValue="587" className="ss-input--medium" />
                </SettingsRow>
                <SettingsRow label="Sender Email">
                  <Inp defaultValue="noreply@marinelearn.com" className="ss-input--wide" />
                </SettingsRow>
                <SettingsRow label="Sender Name">
                  <Inp defaultValue="MarineLearn" className="ss-input--wide" />
                </SettingsRow>
                <SettingsRow label="SMTP Username">
                  <Inp className="ss-input--wide" placeholder="Enter SMTP username" />
                </SettingsRow>
                <SettingsRow label="SMTP Password">
                  <Inp type="password" className="ss-input--wide" placeholder="••••••••" />
                </SettingsRow>
                <SettingsRow label="Encryption">
                  <Sel defaultValue="tls" className="ss-input--medium">
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </Sel>
                </SettingsRow>
                <div className="ss-extra-action">
                  <BtnOutline><Mail className="ss-btn-icon" /> Send Test Email</BtnOutline>
                </div>
              </SettingsCard>
            )}

            {/* Notifications */}
            {activeTab === "notifications" && (
              <SettingsCard title="Notification Preferences" desc="Configure system-wide notification behavior">
                <SettingsRow label="Welcome Email">
                  <Row2><Toggle defaultChecked /><Hint>Send welcome email on user registration</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Course Enrollment">
                  <Row2><Toggle defaultChecked /><Hint>Notify users upon course enrollment</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Course Completion">
                  <Row2><Toggle defaultChecked /><Hint>Notify when a user completes a course</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Certificate Issued">
                  <Row2><Toggle defaultChecked /><Hint>Notify when certificate is generated</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Quiz Results">
                  <Row2><Toggle defaultChecked /><Hint>Send quiz results via email</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Inactivity Reminder">
                  <Row2><Toggle /><Hint>Remind inactive users to resume learning</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Inactivity Threshold">
                  <Row2>
                    <Inp defaultValue="7" className="ss-input--small" />
                    <Hint>days of inactivity before reminder</Hint>
                  </Row2>
                </SettingsRow>
              </SettingsCard>
            )}

            {/* Security */}
            {activeTab === "security" && (
              <SettingsCard title="Security & Authentication" desc="Platform security configuration">
                <SettingsRow label="Two-Factor Authentication">
                  <Row2><Toggle /><Hint>Require 2FA for all users</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Password Min Length">
                  <Inp type="number" defaultValue="8" className="ss-input--small" />
                </SettingsRow>
                <SettingsRow label="Require Special Characters">
                  <Row2><Toggle defaultChecked /><Hint>Passwords must include symbols</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Session Timeout">
                  <Row2>
                    <Inp type="number" defaultValue="30" className="ss-input--small" />
                    <Hint>minutes of inactivity</Hint>
                  </Row2>
                </SettingsRow>
                <SettingsRow label="Max Login Attempts">
                  <Row2>
                    <Inp type="number" defaultValue="5" className="ss-input--small" />
                    <Hint>before account lockout</Hint>
                  </Row2>
                </SettingsRow>
                <SettingsRow label="Lockout Duration">
                  <Row2>
                    <Inp type="number" defaultValue="15" className="ss-input--small" />
                    <Hint>minutes</Hint>
                  </Row2>
                </SettingsRow>
                <SettingsRow label="IP Whitelisting">
                  <Row2><Toggle /><Hint>Restrict admin access to specific IPs</Hint></Row2>
                </SettingsRow>
              </SettingsCard>
            )}

            {/* Storage */}
            {activeTab === "storage" && (
              <SettingsCard title="Storage & Media" desc="File storage and upload settings">
                <div className="ss-stat-grid">
                  <StatBox icon={HardDrive} label="Storage Used" value="12.4 GB" sub="of 50 GB" />
                  <StatBox icon={FileText}  label="Total Files"  value="1,284"   sub="videos, docs, images" />
                  <StatBox icon={Upload}    label="Uploads Today" value="23"     sub="files uploaded" />
                </div>
                <SettingsRow label="Max Upload Size">
                  <Row2>
                    <Inp type="number" defaultValue="500" className="ss-input--small" />
                    <Hint>MB per file</Hint>
                  </Row2>
                </SettingsRow>
                <SettingsRow label="Allowed Video Formats">
                  <Inp defaultValue="mp4, webm, mkv" className="ss-input--wide" />
                </SettingsRow>
                <SettingsRow label="Allowed Document Formats">
                  <Inp defaultValue="pdf, docx, pptx, xlsx" className="ss-input--wide" />
                </SettingsRow>
                <SettingsRow label="Auto-compress Videos">
                  <Row2><Toggle defaultChecked /><Hint>Compress uploaded videos automatically</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="CDN Enabled">
                  <Row2><Toggle defaultChecked /><Hint>Serve media through CDN for faster delivery</Hint></Row2>
                </SettingsRow>
              </SettingsCard>
            )}

            {/* Appearance */}
            {activeTab === "appearance" && (
              <SettingsCard title="Branding & Appearance" desc="Customize the look and feel of the platform">
                <SettingsRow label="Platform Logo">
                  <div className="ss-upload-row">
                    <div className="ss-logo-preview">
                      <Globe className="ss-logo-icon" />
                    </div>
                    <BtnOutline><Upload className="ss-btn-icon" /> Upload Logo</BtnOutline>
                  </div>
                </SettingsRow>
                <SettingsRow label="Favicon">
                  <div className="ss-upload-row">
                    <div className="ss-favicon-preview">
                      <Globe className="ss-favicon-icon" />
                    </div>
                    <BtnOutline><Upload className="ss-btn-icon" /> Upload Favicon</BtnOutline>
                  </div>
                </SettingsRow>
                <SettingsRow label="Primary Color">
                  <Row2>
                    <div className="ss-color-swatch" />
                    <Inp defaultValue="#3B7DD8" className="ss-input--small" />
                  </Row2>
                </SettingsRow>
                <SettingsRow label="Landing Page Banner">
                  <BtnOutline><Upload className="ss-btn-icon" /> Upload Banner Image</BtnOutline>
                </SettingsRow>
                <SettingsRow label="Custom CSS">
                  <Row2><Toggle /><Hint>Allow custom CSS overrides</Hint></Row2>
                </SettingsRow>
              </SettingsCard>
            )}

            {/* Enrollment */}
            {activeTab === "enrollment" && (
              <SettingsCard title="Enrollment & Access" desc="Control how users access courses">
                <SettingsRow label="Open Registration">
                  <Row2><Toggle defaultChecked /><Hint>Allow anyone to create an account</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Email Verification">
                  <Row2><Toggle defaultChecked /><Hint>Require email verification before access</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Admin Approval">
                  <Row2><Toggle /><Hint>Require admin approval for new registrations</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Auto-Enroll New Users">
                  <Row2><Toggle /><Hint>Automatically enroll new users in mandatory courses</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Max Courses Per User">
                  <Row2>
                    <Inp type="number" defaultValue="10" className="ss-input--small" />
                    <Hint>concurrent enrollments (0 = unlimited)</Hint>
                  </Row2>
                </SettingsRow>
                <SettingsRow label="Course Access Duration">
                  <Row2>
                    <Inp type="number" defaultValue="365" className="ss-input--small" />
                    <Hint>days (0 = lifetime)</Hint>
                  </Row2>
                </SettingsRow>
              </SettingsCard>
            )}

            {/* Certificates */}
            {activeTab === "certificates" && (
              <SettingsCard title="Certificate Settings" desc="Configure certificate generation and templates">
                <SettingsRow label="Auto-Generate Certificate">
                  <Row2><Toggle defaultChecked /><Hint>Generate certificate upon quiz pass</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Passing Score">
                  <Row2>
                    <Inp type="number" defaultValue="70" className="ss-input--small" />
                    <Hint>% minimum to earn certificate</Hint>
                  </Row2>
                </SettingsRow>
                <SettingsRow label="Certificate Expiry">
                  <Row2><Toggle /><Hint>Certificates expire after a set period</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Expiry Duration">
                  <Row2>
                    <Inp type="number" defaultValue="12" className="ss-input--small" />
                    <Hint>months</Hint>
                  </Row2>
                </SettingsRow>
                <SettingsRow label="Signatory Name">
                  <Inp defaultValue="Capt. James Wilson" className="ss-input--wide" />
                </SettingsRow>
                <SettingsRow label="Signatory Title">
                  <Inp defaultValue="Director of Maritime Training" className="ss-input--wide" />
                </SettingsRow>
                <SettingsRow label="Digital Signature">
                  <BtnOutline><Upload className="ss-btn-icon" /> Upload Signature</BtnOutline>
                </SettingsRow>
              </SettingsCard>
            )}

            {/* Maintenance */}
            {activeTab === "maintenance" && (
              <SettingsCard title="System Maintenance" desc="Database, backups, and system health">
                <div className="ss-stat-grid">
                  <StatBox icon={Server}   label="System Status" value="Healthy" sub="All services running" green />
                  <StatBox icon={Clock}    label="Last Backup"   value="2h ago"  sub="Auto-backup enabled" />
                  <StatBox icon={Database} label="DB Size"       value="3.2 GB"  sub="PostgreSQL" />
                </div>
                <SettingsRow label="Auto Backup">
                  <Row2><Toggle defaultChecked /><Hint>Daily automated database backups</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Backup Retention">
                  <Row2>
                    <Inp type="number" defaultValue="30" className="ss-input--small" />
                    <Hint>days</Hint>
                  </Row2>
                </SettingsRow>
                <SettingsRow label="Error Logging">
                  <Row2><Toggle defaultChecked /><Hint>Enable detailed error logging</Hint></Row2>
                </SettingsRow>
                <SettingsRow label="Cache">
                  <BtnOutline><RotateCcw className="ss-btn-icon" /> Clear System Cache</BtnOutline>
                </SettingsRow>
                <SettingsRow label="Audit Log">
                  <Row2><Toggle defaultChecked /><Hint>Track all admin actions</Hint></Row2>
                </SettingsRow>
              </SettingsCard>
            )}

          </div>
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
};

export default SystemSettings;