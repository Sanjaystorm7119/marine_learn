import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { coursesByDepartment } from "./courseData";
import {
  LayoutDashboard, BookOpen, Award, BarChart3,
  FileText, Settings, HelpCircle, Calendar,
  Search, Bell, Menu, BookMarked,
} from "lucide-react";
import Sidenav from "./sidenav";
import "../pages/mycourse.css";
import "../pages/dashboard.css";

// ─── Sidebar items (same as dashboard) ───────────────────────────────────────
const sidebarItems = [
  { label: "Dashboard",   icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Courses",      icon: BookOpen,   href: "/mycourses", active: true },
  { label: "Study Materials", icon: BookMarked, href: "/study-materials" },
  { label: "Calendar",        icon: Calendar,   href: "/calendar" },
  { label: "Certificates",icon: Award,           href: "/certificates" },
  { label: "Reports",     icon: BarChart3,       href: "/dashboard" },
  { label: "Resources",   icon: FileText,        href: "/dashboard" },
  { label: "Settings",    icon: Settings,        href: "/settings" },
  { label: "Help",        icon: HelpCircle,      href: "/dashboard" },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconBookOpen = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const IconClock = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

// ─── Department color map ─────────────────────────────────────────────────────
const deptColors = {
  deck:       "mc-tag--deck",
  engine:     "mc-tag--engine",
  safety:     "mc-tag--safety",
  navigation: "mc-tag--navigation",
  electrical: "mc-tag--electrical",
  catering:   "mc-tag--catering",
};

// ─── MyCourses ────────────────────────────────────────────────────────────────
const MyCourses = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const allCourses = useMemo(() => {
    return Object.entries(coursesByDepartment).flatMap(([deptId, courses]) =>
      courses.map(c => ({ ...c, departmentId: deptId }))
    );
  }, []);

  return (
    <div className={`dashboard-root${sidebarOpen ? " sidebar-open" : " sidebar-collapsed"}`}>

      {/* Desktop Sidebar */}
      <aside className={`sidebar-desktop${sidebarOpen ? " sidebar-desktop--open" : " sidebar-desktop--collapsed"}`}>
        <Sidenav sidebarOpen={sidebarOpen} sidebarItems={sidebarItems} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="sidebar-mobile-overlay">
          <div className="sidebar-mobile-backdrop" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="sidebar-mobile-panel">
            <Sidenav sidebarOpen={true} sidebarItems={sidebarItems} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Top Bar */}
        <header className="dashboard-topbar nav-gradient">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMobileSidebarOpen(true);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="topbar-menu-btn"
          >
            <Menu className="topbar-menu-icon" />
          </button>

          <div className="topbar-search-wrap">
            <div className="topbar-search">
              <Search className="topbar-search-icon" />
              <input
                type="text"
                placeholder="Search courses, modules..."
                className="topbar-search-input"
              />
            </div>
          </div>

          <div className="topbar-actions">
            <button className="topbar-bell-btn">
              <Bell className="topbar-bell-icon" />
              <span className="topbar-bell-dot" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          <div className="mc-root">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mc-header"
            >
              <h1 className="mc-title">My Courses</h1>
              <p className="mc-subtitle">Browse all your enrolled maritime cybersecurity courses.</p>
            </motion.div>

            {/* Grid */}
            <div className="mc-grid">
              {allCourses.map((course, i) => {
                const totalLessons = course.chapters.reduce(
                  (sum, ch) => sum + ch.lessons.length, 0
                );
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.4 }}
                    className="mc-card"
                    onClick={() => navigate(`/learn/${course.departmentId}/${course.id}`)}
                  >
                    <div className="mc-card__thumb nav-gradient">
                      <span className="mc-card__icon">{course.icon}</span>
                    </div>
                    <div className="mc-card__body">
                      <span className={`mc-tag ${deptColors[course.departmentId] || "mc-tag--default"}`}>
                        {course.departmentId}
                      </span>
                      <h3 className="mc-card__title">{course.title}</h3>
                      <p className="mc-card__desc">{course.description}</p>
                      <div className="mc-card__footer">
                        <span className="mc-card__meta">
                          <IconBookOpen size={14} />
                          {totalLessons} Lessons
                        </span>
                        <span className="mc-card__meta">
                          <IconClock size={14} />
                          {course.totalDuration}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default MyCourses;