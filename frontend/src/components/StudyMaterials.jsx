import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Award, BarChart3,
  FileText, Settings, HelpCircle, Calendar,
  Shield, Clock, ChevronRight, BookMarked, Users, Menu, Bell, Search,
} from "lucide-react";
import Sidenav from "./sidenav";
import "../pages/dashboard.css";
import "../pages/StudyMaterials.css";

const sidebarItems = [
  { label: "Dashboard",       icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Courses",      icon: BookOpen,        href: "/mycourses" },
  { label: "Study Materials", icon: BookMarked,      href: "/study-materials", active: true },
  { label: "Calendar",        icon: Calendar,        href: "/calendar" },
  { label: "Certificates",    icon: Award,           href: "/certificates" },
  { label: "Reports",         icon: BarChart3,       href: "/dashboard" },
  { label: "Resources",       icon: FileText,        href: "/dashboard" },
  { label: "Settings",        icon: Settings,        href: "/settings" },
  { label: "Help",            icon: HelpCircle,      href: "/dashboard" },
];

const StudyMaterials = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    fetch("http://localhost:8000/courses/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      })
      .then(setMaterials)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className={`dashboard-root${sidebarOpen ? " sidebar-open" : " sidebar-collapsed"}`}>

      {/* Desktop Sidebar */}
      <aside className={`sidebar-desktop${sidebarOpen ? " sidebar-desktop--open" : " sidebar-desktop--collapsed"}`}>
        <Sidenav sidebarOpen={sidebarOpen} sidebarItems={sidebarItems} />
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="sidebar-mobile-overlay">
          <div className="sidebar-mobile-backdrop" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="sidebar-mobile-panel">
            <Sidenav sidebarOpen={true} sidebarItems={sidebarItems} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="dashboard-main">
        <header className="dashboard-topbar nav-gradient">
          <button
            className="topbar-menu-btn"
            onClick={() => {
              if (window.innerWidth < 1024) setMobileSidebarOpen(true);
              else setSidebarOpen(!sidebarOpen);
            }}
          >
            <Menu className="topbar-menu-icon" />
          </button>

          <div className="topbar-search-wrap">
            <div className="topbar-search">
              <Search className="topbar-search-icon" />
              <input type="text" placeholder="Search materials..." className="topbar-search-input" readOnly />
            </div>
          </div>

          <div className="topbar-actions">
            <button className="topbar-bell-btn">
              <Bell className="topbar-bell-icon" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="sm-root">
          <div className="sm-header">
            <h1 className="sm-title">Study Materials</h1>
            <p className="sm-subtitle">Official training materials assigned to your role</p>
          </div>

          {loading && (
            <div className="sm-state">
              <div className="sm-spinner" />
              <p>Loading materials…</p>
            </div>
          )}

          {error && (
            <div className="sm-state sm-state--error">
              <Shield size={32} />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && materials.length === 0 && (
            <div className="sm-state">
              <BookMarked size={40} />
              <p>No study materials found. Make sure the backend is running.</p>
            </div>
          )}

          {!loading && !error && materials.length > 0 && (
            <div className="sm-grid">
              {materials.map((mat, i) => (
                <motion.div
                  key={mat.material_key}
                  className="sm-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => navigate(`/study-materials/${mat.material_key}`)}
                >
                  <div className="sm-card-icon">{mat.icon}</div>
                  <div className="sm-card-body">
                    <h3 className="sm-card-title">{mat.title}</h3>
                    <p className="sm-card-desc">{mat.description}</p>
                    <div className="sm-card-meta">
                      {mat.total_duration && (
                        <span className="sm-meta-pill">
                          <Clock size={12} /> {mat.total_duration}
                        </span>
                      )}
                      {mat.target_roles?.map((r) => (
                        <span key={r} className="sm-meta-pill sm-meta-pill--role">
                          <Users size={12} /> {r}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="sm-card-arrow">
                    <ChevronRight size={18} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudyMaterials;
