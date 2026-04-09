import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../pages/settings.css";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  const userName = localStorage.getItem("full_name") || "User";
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const [toggles, setToggles] = useState({
    courseUpdates: true,
    certificateReady: true,
    quizReminders: true,
    promotionalEmails: false,
    weeklyReport: false,
    twoFactor: false,
    sessionTimeout: true,
    compactMode: false,
    animations: true,
  });

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    {
      id: "profile", label: "Profile",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      )
    },
    {
      id: "notifications", label: "Notifications",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      )
    },
    {
      id: "security", label: "Security",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      )
    },
    {
      id: "language", label: "Language",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      )
    },
  ];

  return (
    <div className="settings-page">
     
      <div className="settings-container">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account preferences and configurations.</p>
        </div>

        <div className="settings-layout">
          {/* Sidebar */}
          <div className="settings-sidebar">
            <div className="settings-sidebar-card">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`settings-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="tab-arrow">›</span>
                </button>
              ))}
              <hr className="settings-divider" />
              <button className="settings-tab-btn signout-btn" onClick={handleSignOut}>
                <span className="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="settings-content">

            {activeTab === "profile" && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <h2>Profile Information</h2>
                  <p>Update your personal details and profile picture.</p>
                </div>
                <div className="settings-card-body">
                  <div className="profile-avatar-row">
                    <div className="avatar-wrapper">
                      <div className="avatar-circle">{userInitials}</div>
                      <button className="avatar-camera-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                        </svg>
                      </button>
                    </div>
                    <div>
                      <p className="profile-name">{userName}</p>
                      <p className="profile-role">Maritime Professional</p>
                    </div>
                  </div>
                  <hr className="settings-divider" />
                  <div className="settings-form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" defaultValue="John" />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" defaultValue="Doe" />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" defaultValue="john.doe@maritime.com" />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="text" defaultValue="+1 234 567 890" />
                    </div>
                    <div className="form-group full-width">
                      <label>Designation / Rank</label>
                      <input type="text" defaultValue="Third Officer" />
                    </div>
                    <div className="form-group full-width">
                      <label>Company / Vessel</label>
                      <input type="text" defaultValue="Pacific Shipping Lines" />
                    </div>
                  </div>
                  <div className="settings-form-actions">
                    <button className="btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <h2>Notification Preferences</h2>
                  <p>Choose how you want to receive updates.</p>
                </div>
                <div className="settings-card-body">
                  {[
                    { key: "courseUpdates", title: "Course Updates", desc: "Get notified when new lessons or courses are added." },
                    { key: "certificateReady", title: "Certificate Ready", desc: "Receive alerts when your certificate is available." },
                    { key: "quizReminders", title: "Quiz Reminders", desc: "Reminders to complete pending quizzes." },
                    { key: "promotionalEmails", title: "Promotional Emails", desc: "Offers and discounts on premium courses." },
                    { key: "weeklyReport", title: "Weekly Progress Report", desc: "Summary of your weekly learning progress." },
                  ].map((item) => (
                    <div key={item.key} className="toggle-row">
                      <div>
                        <p className="toggle-title">{item.title}</p>
                        <p className="toggle-desc">{item.desc}</p>
                      </div>
                      <div className={`toggle-switch ${toggles[item.key] ? "on" : ""}`} onClick={() => handleToggle(item.key)}>
                        <div className="toggle-knob" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <h2>Security Settings</h2>
                  <p>Manage your password and account security.</p>
                </div>
                <div className="settings-card-body">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" placeholder="Enter current password" />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" placeholder="Enter new password" />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" />
                  </div>
                  <button className="btn-primary">Update Password</button>
                  <hr className="settings-divider" />
                  {[
                    { key: "twoFactor", title: "Two-Factor Authentication", desc: "Add an extra layer of security to your account." },
                    { key: "sessionTimeout", title: "Auto Session Timeout", desc: "Automatically log out after a period of inactivity." },
                  ].map((item) => (
                    <div key={item.key} className="toggle-row">
                      <div>
                        <p className="toggle-title">{item.title}</p>
                        <p className="toggle-desc">{item.desc}</p>
                      </div>
                      <div className={`toggle-switch ${toggles[item.key] ? "on" : ""}`} onClick={() => handleToggle(item.key)}>
                        <div className="toggle-knob" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "language" && (
              <div className="settings-card">
                <div className="settings-card-header">
                  <h2>Language & Region</h2>
                  <p>Set your preferred language and timezone.</p>
                </div>
                <div className="settings-card-body">
                  <div className="form-group">
                    <label>Language</label>
                    <select>
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Timezone</label>
                    <select>
                      <option>UTC+0 (Greenwich Mean Time)</option>
                      <option>UTC+5:30 (India Standard Time)</option>
                      <option>UTC-5 (Eastern Standard Time)</option>
                      <option>UTC+8 (Singapore Standard Time)</option>
                      <option>UTC+9 (Japan Standard Time)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date Format</label>
                    <select>
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;