import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor, Shield, AlertTriangle, Video,
  Bell, Search, User, LogOut,
  Menu, ChevronDown
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../pages/SuperUserLayout.css";

const sidebarItems = [
  { label: "Audits", icon: Shield, href: "/audits" },
  { label: "Phishing Drill", icon: AlertTriangle, href: "/phishing-drill" },
  { label: "Teams Meet", icon: Video, href: "/teams-meet" },
];

const SuperuserLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = localStorage.getItem("full_name") || "Super User";
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/notifications/", { headers: getHeaders() });
      if (res.ok) setNotifications(await res.json());
    } catch { /* silent */ }
  };

  const markRead = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/notifications/${id}/read`, {
        method: "POST",
        headers: getHeaders(),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await fetch("http://127.0.0.1:8000/notifications/read-all", {
        method: "POST",
        headers: getHeaders(),
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const SidebarContent = () => (
    <div className="sul-sidebar-inner">
      <div className="sul-sidebar-logo">
        <Link to="/audits" className="sul-logo-link">
          <Anchor className="sul-logo-icon" />
          {sidebarOpen && (
            <div className="sul-logo-text">
              <span className="sul-logo-title">MarineLearn</span>
              <span className="sul-logo-sub">Super User</span>
            </div>
          )}
        </Link>
      </div>

      <nav className="sul-nav">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.href);
                setMobileSidebarOpen(false);
              }}
              className={`sul-nav-btn ${isActive ? "sul-nav-btn--active" : ""}`}
            >
              <item.icon className="sul-nav-icon" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sul-sidebar-footer">
        <div className="sul-user-row">
          <div className="sul-user-avatar">
            <User className="sul-user-avatar-icon" />
          </div>
          {sidebarOpen && (
            <div className="sul-user-info">
              <p className="sul-user-name">{displayName}</p>
              <p className="sul-user-role">Super User</p>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={() => navigate("/login")}
              className="sul-logout-btn"
            >
              <LogOut className="sul-logout-icon" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="sul-root">
      {/* Desktop Sidebar */}
      <aside className={`sul-sidebar ${sidebarOpen ? "sul-sidebar--open" : "sul-sidebar--collapsed"}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="sul-mobile-overlay">
          <div
            className="sul-mobile-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="sul-mobile-sidebar">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <main className="sul-main">
        {/* Header */}
        <header className="sul-header nav-gradient">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMobileSidebarOpen(true);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="sul-menu-btn"
          >
            <Menu className="sul-menu-icon" />
          </button>

          <div className="sul-search-wrap">
            <div className="sul-search-inner">
              <Search className="sul-search-icon" />
              <input
                type="text"
                placeholder="Search..."
                className="sul-search-input"
              />
            </div>
          </div>

          <div className="sul-header-actions">
            <div className="sul-notif-wrap" ref={notifRef}>
              <button className="sul-notif-btn" onClick={() => setNotifOpen(o => !o)}>
                <Bell className="sul-notif-icon" />
                {unreadCount > 0 && (
                  <span className="sul-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="sul-notif-dropdown"
                  >
                    <div className="sul-notif-header">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <button className="sul-notif-read-all" onClick={markAllRead}>Mark all read</button>
                      )}
                    </div>
                    <div className="sul-notif-list">
                      {notifications.length === 0 ? (
                        <p className="sul-notif-empty">No notifications</p>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <button
                            key={n.id}
                            className={`sul-notif-item ${!n.is_read ? "sul-notif-item--unread" : ""}`}
                            onClick={() => markRead(n.id)}
                          >
                            <p className="sul-notif-title">{n.title}</p>
                            <p className="sul-notif-msg">{n.message}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="sul-profile-wrap" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="sul-profile-btn"
              >
                <div className="sul-profile-avatar">
                  <User className="sul-profile-avatar-icon" />
                </div>
                <ChevronDown
                  className={`sul-chevron ${profileOpen ? "sul-chevron--open" : ""}`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="sul-dropdown"
                  >
                    <div className="sul-dropdown-header nav-gradient">
                      <div className="sul-dropdown-user">
                        <div className="sul-dropdown-avatar">
                          <User className="sul-dropdown-avatar-icon" />
                        </div>
                        <div>
                          <p className="sul-dropdown-name">{displayName}</p>
                          <p className="sul-dropdown-email">{localStorage.getItem("email") || ""}</p>
                        </div>
                      </div>
                    </div>
                    <div className="sul-dropdown-body">
                      <div className="sul-dropdown-role-row">
                        <span className="sul-dropdown-role-label">Role</span>
                        <span className="sul-dropdown-role-badge">Super User</span>
                      </div>
                      <div className="sul-dropdown-actions">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigate("/login");
                          }}
                          className="sul-signout-btn"
                        >
                          <LogOut className="sul-signout-icon" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="sul-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SuperuserLayout;