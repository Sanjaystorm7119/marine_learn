import { Anchor, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../pages/sidenav.css";

const Sidenav = ({ sidebarOpen, sidebarItems }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("full_name") || "User";
  const userRole = localStorage.getItem("role") || "Crew";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  return (
    <div className="sidebar-content">
      {/* Logo */}
      <div className="sidebar-logo-area">
        <Link to="/" className="sidebar-logo-link">
          <div className="sidebar-logo-icon-wrap">
            <Anchor className="sidebar-anchor-icon" />
          </div>
          {sidebarOpen && (
            <div className="sidebar-logo-text">
              <span className="sidebar-brand">MarineLearn</span>
              <span className="sidebar-sub">Dashboard</span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`sidebar-nav-item${item.active ? " sidebar-nav-item--active" : ""}`}
          >
            <item.icon className="sidebar-nav-icon" />
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="sidebar-user-area">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <User className="sidebar-avatar-icon" />
          </div>
          {sidebarOpen && (
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{userName}</p>
              <p className="sidebar-user-role">{userRole}</p>
            </div>
          )}
          {sidebarOpen && (
            <button className="sidebar-logout-btn" onClick={handleLogout}>
              <LogOut className="sidebar-logout-icon" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidenav;