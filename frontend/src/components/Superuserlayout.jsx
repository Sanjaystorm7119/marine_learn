import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor, Shield, AlertTriangle, Video,
  Bell, Search, User, LogOut,
  Menu, ChevronDown
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../pages/SuperuserLayout.css";
import "../pages/Phishingdrillpage.css";


const sidebarItems = [
  { label: "Audits", icon: Shield, href: "/superuser/audits" },
  { label: "Phishing Drill", icon: AlertTriangle, href: "/superuser/phishing-drill" },
  { label: "Teams Meet", icon: Video, href: "/superuser/teams-meet" },
];

const SuperuserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const SidebarContent = () => (
    <div className="sl-sidebar-inner">
      {/* Logo */}
      <div className="sl-sidebar-logo">
        <Link to="/superuser/audits" className="sl-logo-link">
          <Anchor className="sl-logo-icon" />
          {sidebarOpen && (
            <div className="sl-logo-text">
              <span className="sl-logo-title">MarineLearn</span>
              <span className="sl-logo-role">Super User</span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="sl-nav">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.href);
                setMobileSidebarOpen(false);
              }}
              className={`sl-nav-item${isActive ? " active" : ""}`}
            >
              <item.icon className="sl-nav-icon" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="sl-sidebar-footer">
        <div className="sl-user-row">
          <div className="sl-user-avatar">
            <User className="sl-user-avatar-icon" />
          </div>
          {sidebarOpen && (
            <div className="sl-user-info">
              <p className="sl-user-name">John Doe</p>
              <p className="sl-user-role">Super User</p>
            </div>
          )}
          {sidebarOpen && (
            <button onClick={() => navigate("/login")} className="sl-logout-btn">
              <LogOut style={{ width: "1rem", height: "1rem" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="sl-layout">
      {/* Desktop Sidebar */}
      <aside className={`sl-sidebar ${sidebarOpen ? "sl-sidebar-open" : "sl-sidebar-collapsed"}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="sl-mobile-overlay">
          <div
            className="sl-mobile-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="sl-mobile-panel">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="sl-main">
        {/* Topbar */}
        <header className="sl-topbar">
          <button
            className="sl-menu-toggle"
            onClick={() => {
              if (window.innerWidth < 1024) setMobileSidebarOpen(true);
              else setSidebarOpen(!sidebarOpen);
            }}
          >
            <Menu style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>

          {/* Search */}
          <div className="sl-search-wrap">
            <div className="sl-search-inner">
              <Search className="sl-search-icon" />
              <input
                type="text"
                placeholder="Search..."
                className="sl-search-input"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="sl-topbar-actions">
            <button className="sl-notif-btn">
              <Bell style={{ width: "1.25rem", height: "1.25rem" }} />
              <span className="sl-notif-dot" />
            </button>

            <div className="sl-profile-wrap" ref={profileRef}>
              <button
                className="sl-profile-trigger"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="sl-profile-avatar">
                  <User style={{ width: "1rem", height: "1rem" }} />
                </div>
                <ChevronDown
                  className={`sl-chevron${profileOpen ? " rotated" : ""}`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="sl-dropdown"
                  >
                    <div className="sl-dropdown-header">
                      <div className="sl-dropdown-user">
                        <div className="sl-dropdown-avatar">
                          <User style={{ width: "1.5rem", height: "1.5rem", color: "white" }} />
                        </div>
                        <div>
                          <p className="sl-dropdown-name">John Doe</p>
                          <p className="sl-dropdown-email">johndoe@marinelearn.com</p>
                        </div>
                      </div>
                    </div>
                    <div className="sl-dropdown-body">
                      <div className="sl-dropdown-role-row">
                        <span className="sl-dropdown-role-label">Role</span>
                        <span className="sl-dropdown-role-badge">Super User</span>
                      </div>
                      <div className="sl-dropdown-divider">
                        <button
                          className="sl-dropdown-action"
                          onClick={() => { setProfileOpen(false); navigate("/login"); }}
                        >
                          <LogOut style={{ width: "1rem", height: "1rem" }} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="sl-page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SuperuserLayout;