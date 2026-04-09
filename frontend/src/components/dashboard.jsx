import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Anchor,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Award,
  Clock,
  TrendingUp,
  Play,
  ChevronRight,
  Bell,
  Search,
  User,
  LogOut,
  Ship,
  Navigation,
  Flame,
  Shield,
  Zap,
  UtensilsCrossed,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  X,
  CheckCircle2,
  Circle,
  Star,
  Layers,
  BookOpenCheck,
} from "lucide-react";

import "../pages/dashboard.css";
import Sidenav from "./sidenav";
import { coursesByDepartment, getDepartmentTitle } from "./courseData";
import { useDebounce } from "../hooks/useDebounce";

import courseSafety from "../assets/course-safety.jpg";
import courseEngine from "../assets/course-engine.jpg";
import courseDeck from "../assets/course-deck.jpg";
import courseElectrical from "../assets/course-electrical.jpg";
import courseCatering from "../assets/course-catering.jpg";
import courseNavigation from "../assets/course-navigation.jpg";

/* ── Search Index ── */
// Flatten all courses and their lessons into a searchable index at module load time.
const searchIndex = (() => {
  const courses = [];
  const modules = [];

  Object.entries(coursesByDepartment).forEach(([deptId, deptCourses]) => {
    const deptLabel = getDepartmentTitle(deptId);
    deptCourses.forEach((course) => {
      courses.push({
        type: "course",
        id: course.id,
        title: course.title,
        description: course.description || "",
        department: deptLabel,
        departmentId: deptId,
        icon: course.icon,
      });

      (course.chapters || []).forEach((chapter) => {
        (chapter.lessons || []).forEach((lesson) => {
          modules.push({
            type: "module",
            id: lesson.id,
            title: lesson.title,
            courseTitle: course.title,
            courseId: course.id,
            department: deptLabel,
            departmentId: deptId,
            duration: lesson.duration,
            topics: (lesson.topics || []).join(" "),
          });
        });
      });
    });
  });

  return { courses, modules };
})();

function runSearch(query) {
  if (!query || query.trim().length < 2) return { courses: [], modules: [] };
  const q = query.toLowerCase().trim();

  const courses = searchIndex.courses
    .filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q),
    )
    .slice(0, 5);

  const modules = searchIndex.modules
    .filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.courseTitle.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.topics.toLowerCase().includes(q),
    )
    .slice(0, 5);

  return { courses, modules };
}

/* ── Theme cycling for backend-sourced Continue Learning cards ── */
const CL_THEMES = [
  { tagColor: "cl-tag--safety",     image: courseSafety },
  { tagColor: "cl-tag--engine",     image: courseEngine },
  { tagColor: "cl-tag--deck",       image: courseDeck },
  { tagColor: "cl-tag--electrical", image: courseElectrical },
  { tagColor: "cl-tag--navigation", image: courseNavigation },
  { tagColor: "cl-tag--catering",   image: courseCatering },
];

const forYouCourses = [
  {
    id: 5,
    title: "Electrical Systems at Sea",
    dept: "Electrical",
    tag: "ELECTRICAL",
    tagColor: "cl-tag--electrical",
    lessons: 20,
    instructor: "Chief Eng. Adams",
    icon: Zap,
    image: courseElectrical,
    departmentId: "electrical",
    courseId: "marine-electrical-safety",
  },
  {
    id: 6,
    title: "Maritime Catering & Hygiene",
    dept: "Catering",
    tag: "CATERING",
    tagColor: "cl-tag--catering",
    lessons: 12,
    instructor: "Chef Maria L.",
    icon: UtensilsCrossed,
    image: courseCatering,
    departmentId: "catering",
    courseId: "maritime-food-safety",
  },
  {
    id: 7,
    title: "Advanced Navigation & ECDIS",
    dept: "Navigation",
    tag: "NAVIGATION",
    tagColor: "cl-tag--navigation",
    lessons: 28,
    instructor: "Capt. James M.",
    icon: Navigation,
    image: courseNavigation,
    departmentId: "navigation",
    courseId: "radar-arpa-fundamentals",
  },
];

const recentActivity = [
  {
    text: "Completed Module 5: Fire Prevention",
    time: "2 hours ago",
    icon: CheckCircle2,
  },
  {
    text: "Started Bridge Simulation Exercise",
    time: "5 hours ago",
    icon: Play,
  },
  { text: "Earned Certificate: Basic Safety", time: "1 day ago", icon: Award },
  {
    text: "Submitted Quiz: Engine Fundamentals",
    time: "2 days ago",
    icon: FileText,
  },
  { text: "Joined study group: Deck Officers", time: "3 days ago", icon: User },
];

const upcomingDeadlines = [
  { title: "STCW Quiz 3", date: "Feb 25, 2026", course: "STCW Basic Safety" },
  {
    title: "Engine Lab Report",
    date: "Feb 28, 2026",
    course: "Marine Engine Operations",
  },
  {
    title: "Final Assessment",
    date: "Mar 5, 2026",
    course: "Deck Officer Certificate",
  },
];

const leaderboard = [
  { name: "Capt. James Miller", points: 2450, rank: 1 },
  { name: "Sarah Chen", points: 2380, rank: 2 },
  { name: "You", points: 2120, rank: 3 },
  { name: "Raj Patel", points: 1980, rank: 4 },
  { name: "Maria Santos", points: 1870, rank: 5 },
];

const sidebarItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    active: true,
    href: "/dashboard",
  },
  { label: "My Courses", icon: BookOpen, href: "/mycourses" },
  { label: "Study Materials", icon: FileText, href: "/study-materials" },
  { label: "Calendar", icon: Calendar, href: "/calendar" },
  { label: "Certificates", icon: Award, href: "/certificates" },
  { label: "Reports", icon: BarChart3, href: "/dashboard" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Help", icon: HelpCircle, href: "/help" },
];

const Dashboard = ({ children }) => {

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState("crew");
  const [dashboardData, setDashboardData] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState(null);
  const navigate = useNavigate();

  /* ── Notifications state ── */
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  /* ── Search state ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 280);
  const searchResults = runSearch(debouncedQuery);
  const hasResults =
    searchResults.courses.length > 0 || searchResults.modules.length > 0;
  const searchRef = useRef(null);

  // Close dropdown when clicking outside the search container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep dropdown open/closed based on query
  useEffect(() => {
    setSearchOpen(debouncedQuery.trim().length >= 2);
  }, [debouncedQuery]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery("");
    setSearchOpen(false);
  }, []);

  const handleResultClick = useCallback(() => {
    setSearchQuery("");
    setSearchOpen(false);
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/notifications/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotifications(await res.json());
    } catch (_) {}
  }, []);

  const markRead = useCallback(async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:8000/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:8000/notifications/read-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  const deleteNotification = useCallback(async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:8000/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Poll notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const [userRes, dashRes] = await Promise.all([
          fetch("http://localhost:8000/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8000/study/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.ok) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const userData = await userRes.json();
        setUserName(userData.full_name.split(" ")[0]);
        setUserRole(userData.role);

        if (dashRes.ok) {
          const data = await dashRes.json();
          setDashboardData(data);
        }

        // Try the new assignment-aware endpoint; fall back to all courses
        // (old server returns 404 for the new endpoint)
        const assignedRes = await fetch(
          "http://localhost:8000/study/my-assigned-courses",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (assignedRes.ok) {
          setAssignedCourses(await assignedRes.json());
        } else {
          // Old server: fall back to full course list
          const allCoursesRes = await fetch(
            "http://localhost:8000/study/courses",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (allCoursesRes.ok) setAssignedCourses(await allCoursesRes.json());
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };
    fetchData();
  }, [navigate]);

  return (
    <div
      className={`dashboard-root${sidebarOpen ? " sidebar-open" : " sidebar-collapsed"}`}
    >
      {/* Desktop Sidebar */}
      <aside
        className={`sidebar-desktop${sidebarOpen ? " sidebar-desktop--open" : " sidebar-desktop--collapsed"}`}
      >
        <Sidenav sidebarOpen={sidebarOpen} sidebarItems={sidebarItems} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="sidebar-mobile-overlay">
          <div
            className="sidebar-mobile-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
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

          <div className="topbar-search-wrap" ref={searchRef}>
            <div className="topbar-search">
              <Search className="topbar-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() =>
                  debouncedQuery.trim().length >= 2 && setSearchOpen(true)
                }
                placeholder="Search courses, modules..."
                className="topbar-search-input"
                autoComplete="off"
                aria-label="Search courses and modules"
                aria-expanded={searchOpen}
                aria-controls="search-dropdown"
                role="combobox"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="topbar-search-clear"
                  aria-label="Clear search"
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  id="search-dropdown"
                  role="listbox"
                  className="search-dropdown"
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  {!hasResults ? (
                    <div className="search-empty">
                      <Search
                        style={{
                          width: 24,
                          height: 24,
                          opacity: 0.3,
                          marginBottom: 8,
                        }}
                      />
                      <p>
                        No results for <strong>"{debouncedQuery}"</strong>
                      </p>
                    </div>
                  ) : (
                    <>
                      {searchResults.courses.length > 0 && (
                        <div className="search-group">
                          <p className="search-group-label">
                            <BookOpen style={{ width: 12, height: 12 }} />{" "}
                            Courses
                          </p>
                          {searchResults.courses.map((course) => (
                            <Link
                              key={`${course.departmentId}-${course.id}`}
                              to={`/course/${course.departmentId}/${course.id}`}
                              className="search-result-item"
                              onClick={handleResultClick}
                              role="option"
                            >
                              <span className="search-result-icon">
                                {course.icon}
                              </span>
                              <div className="search-result-info">
                                <p className="search-result-title">
                                  {course.title}
                                </p>
                                <p className="search-result-meta">
                                  {course.department}
                                </p>
                              </div>
                              <ChevronRight
                                style={{
                                  width: 14,
                                  height: 14,
                                  flexShrink: 0,
                                  opacity: 0.4,
                                }}
                              />
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.modules.length > 0 && (
                        <div className="search-group">
                          <p className="search-group-label">
                            <Layers style={{ width: 12, height: 12 }} /> Modules
                          </p>
                          {searchResults.modules.map((mod) => (
                            <Link
                              key={`${mod.departmentId}-${mod.courseId}-${mod.id}`}
                              to={`/learn/${mod.departmentId}/${mod.courseId}`}
                              className="search-result-item"
                              onClick={handleResultClick}
                              role="option"
                            >
                              <span className="search-result-icon search-result-icon--module">
                                <BookOpenCheck
                                  style={{ width: 14, height: 14 }}
                                />
                              </span>
                              <div className="search-result-info">
                                <p className="search-result-title">
                                  {mod.title}
                                </p>
                                <p className="search-result-meta">
                                  {mod.courseTitle} · {mod.duration}
                                </p>
                              </div>
                              <ChevronRight
                                style={{
                                  width: 14,
                                  height: 14,
                                  flexShrink: 0,
                                  opacity: 0.4,
                                }}
                              />
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="search-footer">
                        <Link
                          to="/coursepage"
                          className="search-browse-all"
                          onClick={handleResultClick}
                        >
                          Browse all courses{" "}
                          <ChevronRight style={{ width: 13, height: 13 }} />
                        </Link>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="topbar-actions">
            {/* Notification Bell */}
            <div className="notif-wrap" ref={notifRef}>
              <button
                className="topbar-bell-btn"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  if (!notifOpen && unreadCount > 0) markAllRead();
                }}
                aria-label="Notifications"
              >
                <Bell className="topbar-bell-icon" />
                {unreadCount > 0 && (
                  <span className="topbar-bell-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    className="notif-panel"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="notif-panel-header">
                      <span className="notif-panel-title">Notifications</span>
                      {notifications.length > 0 && (
                        <button
                          className="notif-clear-btn"
                          onClick={markAllRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">
                          <Bell style={{ width: 24, height: 24, opacity: 0.3, marginBottom: 8 }} />
                          <p>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`notif-item${n.is_read ? "" : " notif-item--unread"}`}
                            onClick={() => !n.is_read && markRead(n.id)}
                          >
                            <div className={`notif-dot notif-dot--${n.type}`} />
                            <div className="notif-body">
                              <p className="notif-title">{n.title}</p>
                              <p className="notif-msg">{n.message}</p>
                              <p className="notif-time">
                                {new Date(n.created_at).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <button
                              className="notif-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              aria-label="Dismiss"
                            >
                              <X style={{ width: 12, height: 12 }} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {children ? children : <>
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="welcome-heading">
              Welcome back, <span className="welcome-name">{userName}!</span>
            </h1>
            <p className="welcome-sub">
              Track your maritime training progress and continue learning.
            </p>
          </motion.div>

          {/* Stats Grid */}
          {(() => {
            const enrolled = dashboardData?.enrolled_courses ?? "—";
            const completed = dashboardData?.completed_courses ?? "—";
            const hours = dashboardData?.hours_logged ?? "—";
            const certs = dashboardData?.certificates ?? "—";
            const completionPct =
              dashboardData && dashboardData.enrolled_courses > 0
                ? Math.round((dashboardData.completed_courses / dashboardData.enrolled_courses) * 100)
                : null;
            const roleLabel = userRole
              ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
              : "Crew";

            const dynamicStats = [
              {
                label: "Enrolled Courses",
                value: String(enrolled),
                icon: BookOpen,
                change: "course/s",
                colorClass: "stat-icon-blue",
              },
              {
                label: "Completed",
                value: String(completed),
                icon: Award,
                change: completionPct !== null ? `${completionPct}% completion rate` : "No courses yet",
                colorClass: "stat-icon-green",
              },
              {
                label: "Hours Logged",
                value: String(hours),
                icon: Clock,
                change: "Estimated from topics",
                colorClass: "stat-icon-amber",
              },
              {
                label: "Certificates",
                value: String(certs),
                icon: GraduationCap,
                change: "From completed courses",
                colorClass: "stat-icon-violet",
              },
            ];

            return (
              <div className="stats-grid">
                {dynamicStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                  >
                    <div className="stat-card">
                      <div className="stat-card-inner">
                        <div>
                          <p className="stat-label">{stat.label}</p>
                          <p className="stat-value">{stat.value}</p>
                          <p className="stat-change">{stat.change}</p>
                        </div>
                        <div className={`stat-icon-wrap ${stat.colorClass}`}>
                          <stat.icon className="stat-icon" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()}

          {/* Course Cards + Right Sidebar */}
          <div className="main-grid">
            {/* Left Column: Continue Learning + For You */}
            <div className="courses-section">
              {/* My Courses */}
              {(() => {
                // Prefer the dedicated assigned-courses list; fall back to
                // dashboard in_progress_courses for when the new endpoint
                // isn't available yet.
                const inProgress = dashboardData?.in_progress_courses ?? [];
                const progressMap = Object.fromEntries(
                  inProgress.map((c) => [c.course_id, c])
                );

                // Build display list from assignedCourses (authoritative) or
                // fall back to inProgress if the new endpoint isn't up yet.
                const displayList =
                  assignedCourses !== null
                    ? assignedCourses.map((c, i) => {
                        const prog = progressMap[c.id];
                        return {
                          course_id: c.id,
                          course_title: c.title,
                          progress_pct: prog?.progress_pct ?? 0,
                          next_module_title:
                            prog?.next_module_title ??
                            c.modules?.[0]?.title ??
                            "Module 1",
                        };
                      })
                    : inProgress;

                return (
                  <div>
                    <div className="section-header">
                      <h2 className="section-title">My Courses</h2>
                      <Link to="/study-materials" className="view-all-btn">
                        See All <ChevronRight className="view-all-icon" />
                      </Link>
                    </div>
                    <div className="cl-list">
                      {displayList.length > 0 ? (
                        displayList.map((course, i) => {
                          const theme = CL_THEMES[i % CL_THEMES.length];
                          const started = course.progress_pct > 0;
                          return (
                            <motion.div
                              key={course.course_id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * i, duration: 0.4 }}
                            >
                              <div className="cl-card">
                                <div className="cl-card-body">
                                  <img
                                    src={theme.image}
                                    alt={course.course_title}
                                    className="cl-thumb"
                                  />
                                  <div className="cl-info">
                                    <span className={`cl-tag ${theme.tagColor}`}>
                                      {Math.round(course.progress_pct)}%
                                    </span>
                                    <h3 className="cl-title">{course.course_title}</h3>
                                    <p className="cl-next">
                                      {started ? "Next: " : "Start with: "}
                                      <span className="cl-next-name">
                                        {course.next_module_title}
                                      </span>
                                    </p>
                                    <div className="cl-progress-track">
                                      <div
                                        className="cl-progress-fill"
                                        style={{ width: `${course.progress_pct}%` }}
                                      />
                                    </div>
                                  </div>
                                  <Link
                                    to={`/study-materials?courseId=${course.course_id}`}
                                    className="cl-resume-btn"
                                  >
                                    {started ? "Resume" : "Start Course"}
                                  </Link>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="cl-card">
                          <div className="cl-card-body" style={{ justifyContent: "center", padding: "24px" }}>
                            <p style={{ color: "var(--text-muted, #888)", fontSize: "0.9rem" }}>
                              {assignedCourses !== null || dashboardData
                                ? "No courses assigned yet. Contact your admin to get started!"
                                : "Loading your courses..."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* For You */}
              <div style={{ marginTop: "24px" }}>
                <div className="section-header">
                  <h2 className="section-title">For You</h2>
                  <Link to="/coursepage" className="view-all-btn">
                    See All <ChevronRight className="view-all-icon" />
                  </Link>
                </div>

                <div className="fy-grid">
                  {forYouCourses.map((course, i) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.4 }}
                    >
                      <Link
                        to={`/course/${course.departmentId}/${course.courseId}`}
                        className="fy-card"
                        style={{ textDecoration: "none" }}
                      >
                        <div className="fy-img-wrap">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="fy-img"
                          />
                        </div>
                        <div className="fy-card-body">
                          <span className={`cl-tag ${course.tagColor}`}>
                            {course.tag}
                          </span>
                          <h3 className="fy-title">{course.title}</h3>
                          <p className="fy-lessons">{course.lessons} Lessons</p>
                          <div className="fy-instructor">
                            <div className="fy-avatar">
                              <User className="fy-avatar-icon" />
                            </div>
                            <div>
                              <p className="fy-instructor-name">
                                {course.instructor}
                              </p>
                              <p className="fy-instructor-label">Instructor</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="right-column">
              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Activity</h3>
                </div>
                <div className="card-body activity-list">
                  {recentActivity.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * i }}
                      className="activity-item"
                    >
                      <div className="activity-icon-wrap">
                        <item.icon className="activity-icon" />
                      </div>
                      <div className="activity-text-wrap">
                        <p className="activity-text">{item.text}</p>
                        <p className="activity-time">{item.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Upcoming Deadlines</h3>
                </div>
                <div className="card-body deadline-list">
                  {upcomingDeadlines.map((item, i) => (
                    <div key={i} className="deadline-item">
                      <div className="deadline-icon-wrap">
                        <Calendar className="deadline-icon" />
                      </div>
                      <div className="deadline-info">
                        <p className="deadline-title">{item.title}</p>
                        <p className="deadline-meta">
                          {item.date} · {item.course}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Leaderboard</h3>
                  <p className="card-desc">Top learners this month</p>
                </div>
                <div className="card-body leaderboard-list">
                  {leaderboard.map((user, i) => (
                    <div
                      key={i}
                      className={`leaderboard-item${user.name === "You" ? " leaderboard-item--you" : ""}`}
                    >
                      <span className={`leaderboard-rank rank-${user.rank}`}>
                        {user.rank <= 3 ? (
                          <Star className="rank-star" />
                        ) : (
                          `#${user.rank}`
                        )}
                      </span>
                      <div className="leaderboard-avatar">
                        <User className="leaderboard-avatar-icon" />
                      </div>
                      <div className="leaderboard-name-wrap">
                        <p
                          className={`leaderboard-name${user.name === "You" ? " leaderboard-name--you" : ""}`}
                        >
                          {user.name}
                        </p>
                      </div>
                      <span className="leaderboard-points">
                        {user.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
           </>}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
