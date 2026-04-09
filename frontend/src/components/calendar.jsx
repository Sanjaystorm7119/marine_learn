import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  Play,
  BookMarked,
  Target,
  Clock,
  FileText,
  BarChart3,
  Trophy,
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Calendar,
  Award,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Sidenav from "./sidenav";
import "../pages/calendar.css";
import "../pages/dashboard.css";

/* ── Sidebar Items — Calendar is active ── */
const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Courses", icon: BookOpen, href: "/mycourses" },
  { label: "Study Materials", icon: FileText, href: "/study-materials" },
  { label: "Calendar", icon: Calendar, href: "/calendar", active: true },
  { label: "Certificates", icon: Award, href: "/certificates" },
  { label: "Reports", icon: BarChart3, href: "/dashboard" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Help", icon: HelpCircle, href: "/help" },
];


const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarPage = () => {
  const today = new Date();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [userRole, setUserRole] = useState("...");
  const [activityData, setActivityData] = useState({});
  const [monthStats, setMonthStats] = useState({ activeDays: 0, totalDays: 0, streak: 0, modulesCompleted: 0, totalModules: 0 });
  const [todayGoals, setTodayGoals] = useState({ lessonWatched: false, quizCompleted: false, studyMinutes: 0, studyGoalMet: false });
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }
      try {
        const res = await fetch("http://localhost:8000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const userData = await res.json();
          setUserName(userData.full_name.split(" ")[0]);
          setUserRole(userData.role);
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const fetchActivity = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoadingActivity(true);
      try {
        const res = await fetch(
          `http://localhost:8000/study/calendar-activity?year=${currentYear}&month=${currentMonth + 1}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          // Convert string keys to ints
          const days = {};
          for (const [k, v] of Object.entries(data.days)) days[parseInt(k)] = v;
          setActivityData(days);
          setMonthStats(data.monthStats);
          setTodayGoals(data.todayGoals);
        }
      } catch (error) {
        console.error("Calendar fetch error:", error);
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchActivity();
  }, [currentYear, currentMonth]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const isToday = (day) =>
    today.getDate() === day &&
    today.getMonth() === currentMonth &&
    today.getFullYear() === currentYear;

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };
  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(today.getDate());
  };

  const selectedActivity = selectedDay ? activityData[selectedDay] : null;

  return (
    <div
      className={`dashboard-root${sidebarOpen ? " sidebar-open" : " sidebar-collapsed"}`}
    >
      {/* ── Desktop Sidebar ── */}
      <aside
        className={`sidebar-desktop${sidebarOpen ? " sidebar-desktop--open" : " sidebar-desktop--collapsed"}`}
      >
        <Sidenav
          sidebarOpen={sidebarOpen}
          sidebarItems={sidebarItems}
          userName={userName}
          userRole={userRole}
        />
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileSidebarOpen && (
        <div className="sidebar-mobile-overlay">
          <div
            className="sidebar-mobile-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="sidebar-mobile-panel">
            <Sidenav
              sidebarOpen={true}
              sidebarItems={sidebarItems}
              userName={userName}
              userRole={userRole}
            />
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-topbar nav-gradient">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMobileSidebarOpen(true);
              else setSidebarOpen((o) => !o);
            }}
            className="topbar-menu-btn"
          >
            <Menu size={20} className="topbar-menu-icon" />
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

        {/* Calendar Content */}
        <div className="dashboard-content">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="welcome-heading">
              Activity <span className="welcome-name">Calendar</span>
            </h1>
            <p className="welcome-sub">
              Track your daily learning progress and maintain your streak.
            </p>
          </motion.div>

          {/* Two-Column Grid */}
          <div className="cal-grid">
            {/* Left: Calendar */}
            <motion.div
              className="cal-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="cal-card">
                {/* Month Nav */}
                <div className="cal-month-nav nav-gradient">
                  <button onClick={goToPrevMonth} className="cal-month-btn">
                    <ChevronLeft size={16} />
                    {MONTH_NAMES[currentMonth === 0 ? 11 : currentMonth - 1]
                      .slice(0, 3)
                      .toUpperCase()}
                  </button>
                  <h2 className="cal-month-title">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </h2>
                  <button onClick={goToNextMonth} className="cal-month-btn">
                    {MONTH_NAMES[currentMonth === 11 ? 0 : currentMonth + 1]
                      .slice(0, 3)
                      .toUpperCase()}
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="cal-card-body">
                  <div className="cal-day-headers">
                    {DAY_NAMES.map((d) => (
                      <div key={d} className="cal-day-label">
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="cal-days-grid">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`e-${i}`} className="cal-day-empty" />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const activity = activityData[day];
                      const isActive = !!activity;
                      const isSelected = selectedDay === day;
                      const isTodayDate = isToday(day);
                      const hasPerfectQuiz = activity?.quizzes?.some(q => q.pct === 100);
                      return (
                        <motion.button
                          key={day}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setSelectedDay(day === selectedDay ? null : day)
                          }
                          className={`cal-day-cell${isSelected ? " cal-day-cell--selected" : ""}${isTodayDate && !isSelected ? " cal-day-cell--today" : ""}`}
                        >
                          <span
                            className={`cal-day-num${isTodayDate ? " cal-day-num--today" : ""}${isSelected ? " cal-day-num--selected" : ""}`}
                          >
                            {day}
                          </span>
                          <span
                            className={`cal-day-dot${isActive ? " cal-day-dot--active" : " cal-day-dot--inactive"}`}
                          />
                          {hasPerfectQuiz && (
                            <span className="cal-day-trophy">🏆</span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="cal-legend-row">
                    <div className="cal-legend">
                      <span className="cal-legend-item">
                        <span className="cal-legend-dot cal-legend-dot--green" />{" "}
                        Active Day
                      </span>
                      <span className="cal-legend-item">
                        <span className="cal-legend-dot cal-legend-dot--red" />{" "}
                        No Activity
                      </span>
                    </div>
                    <button onClick={goToToday} className="cal-today-btn">
                      <Target size={14} /> Today
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Detail Panel */}
              <AnimatePresence mode="wait">
                {selectedDay && (
                  <motion.div
                    key={selectedDay}
                    initial={{ opacity: 0, y: 15, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="cal-detail-wrap"
                  >
                    <div className="cal-card cal-card-border-accent">
                      <div className="cal-detail-header nav-gradient">
                        <h3 className="cal-detail-title">
                          {MONTH_NAMES[currentMonth]} {selectedDay},{" "}
                          {currentYear}
                        </h3>
                        <button
                          onClick={() => setSelectedDay(null)}
                          className="cal-detail-close"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="cal-card-body">
                        {selectedActivity ? (
                          <div className="cal-detail-content">
                            <div className="cal-summary-grid">
                              <div className="cal-stat-box cal-stat-box--green">
                                <Play size={16} className="cal-stat-icon cal-stat-icon--green" />
                                <p className="cal-stat-value cal-stat-value--green">
                                  {selectedActivity.topicsCompleted}
                                </p>
                                <p className="cal-stat-label cal-stat-label--green">Topics</p>
                              </div>
                              <div className="cal-stat-box cal-stat-box--blue">
                                <Clock size={16} className="cal-stat-icon cal-stat-icon--blue" />
                                <p className="cal-stat-value cal-stat-value--blue">
                                  {selectedActivity.timeSpentMinutes}m
                                </p>
                                <p className="cal-stat-label cal-stat-label--blue">Study Time</p>
                              </div>
                              {selectedActivity.quizzes?.length > 0 && (
                                <div className="cal-stat-box cal-stat-box--amber">
                                  <FileText size={16} className="cal-stat-icon cal-stat-icon--amber" />
                                  <p className="cal-stat-value cal-stat-value--amber">
                                    {selectedActivity.quizzes[0].score}/{selectedActivity.quizzes[0].total}
                                  </p>
                                  <p className="cal-stat-label cal-stat-label--amber">Quiz Score</p>
                                </div>
                              )}
                              {selectedActivity.quizzes?.some(q => q.pct === 100) && (
                                <div className="cal-stat-box cal-stat-box--violet">
                                  <Trophy size={16} className="cal-stat-icon cal-stat-icon--violet" />
                                  <p className="cal-stat-value cal-stat-value--violet">100%</p>
                                  <p className="cal-stat-label cal-stat-label--violet">Perfect!</p>
                                </div>
                              )}
                            </div>
                            <div className="cal-detail-list">
                              <div className="cal-detail-row">
                                <CheckCircle2 size={16} className="cal-detail-row-icon cal-detail-row-icon--green" />
                                <span className="cal-detail-row-text">
                                  {selectedActivity.topicsCompleted} topic{selectedActivity.topicsCompleted !== 1 ? "s" : ""} completed
                                  {selectedActivity.timeSpentMinutes > 0 && ` · ${selectedActivity.timeSpentMinutes} min`}
                                </span>
                              </div>
                              {(selectedActivity.topicTitles ?? []).map((t, idx) => (
                                <div key={idx} className="cal-detail-row">
                                  <BookMarked size={16} className="cal-detail-row-icon cal-detail-row-icon--muted" />
                                  <span className="cal-detail-row-text cal-detail-row-text--muted">{t}</span>
                                </div>
                              ))}
                              {(selectedActivity.quizzes ?? []).map((q, idx) => (
                                <div key={idx} className="cal-detail-row">
                                  <FileText size={16} className="cal-detail-row-icon cal-detail-row-icon--amber" />
                                  <span className="cal-detail-row-text">
                                    {q.moduleTitle}: {q.score}/{q.total}
                                    {q.pct === 100 && " ⭐ Perfect"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="cal-no-activity">
                            <div className="cal-no-activity-icon-wrap">
                              <X size={24} className="cal-no-activity-icon" />
                            </div>
                            <p className="cal-no-activity-title">No Activity</p>
                            <p className="cal-no-activity-sub">
                              No lessons watched or quizzes attempted on this
                              day.
                            </p>
                            <Link to="/coursepage" className="cal-start-btn">
                              Start Learning
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right: Stats */}
            <motion.div
              className="cal-right"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Month Stats */}
              <div className="cal-card">
                <div className="cal-card-header">
                  <BarChart3 size={16} className="cal-card-header-icon" />
                  <span className="cal-card-header-title">Month Stats</span>
                </div>
                <div className="cal-card-body cal-stats-body">
                  <div>
                    <div className="cal-progress-row">
                      <span className="cal-progress-label">Active Days</span>
                      <span className="cal-progress-value">
                        {monthStats.activeDays}/{monthStats.totalDays || daysInMonth}
                      </span>
                    </div>
                    <div className="cal-progress-track">
                      <div
                        className="cal-progress-fill"
                        style={{
                          width: `${monthStats.totalDays ? (monthStats.activeDays / monthStats.totalDays) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="cal-progress-hint">
                      {monthStats.totalDays ? Math.round((monthStats.activeDays / monthStats.totalDays) * 100) : 0}% of the month
                    </p>
                  </div>
                  <div className="cal-badge cal-badge--green">
                    <div className="cal-badge-left">
                      <span className="cal-badge-dot cal-badge-dot--green" />
                      <span className="cal-badge-label">Active Days</span>
                    </div>
                    <span className="cal-badge-value cal-badge-value--green">
                      {monthStats.totalDays ? Math.round((monthStats.activeDays / monthStats.totalDays) * 100) : 0}%
                    </span>
                  </div>
                  <div className="cal-badge cal-badge--blue">
                    <div className="cal-badge-left">
                      <GraduationCap size={16} className="cal-badge-icon cal-badge-icon--blue" />
                      <span className="cal-badge-label">Modules Complete</span>
                    </div>
                    <span className="cal-badge-value cal-badge-value--blue">
                      {monthStats.modulesCompleted}/{monthStats.totalModules}
                    </span>
                  </div>
                  <div className="cal-badge cal-badge--amber">
                    <div className="cal-badge-left">
                      <Flame size={16} className="cal-badge-icon cal-badge-icon--amber" />
                      <span className="cal-badge-label">Current Streak</span>
                    </div>
                    <span className="cal-badge-value cal-badge-value--amber">
                      {monthStats.streak} day{monthStats.streak !== 1 ? "s" : ""} 🔥
                    </span>
                  </div>
                </div>
              </div>

              {/* Daily Goals */}
              <div className="cal-card">
                <div className="cal-card-header">
                  <Target size={16} className="cal-card-header-icon" />
                  <span className="cal-card-header-title">Daily Goals</span>
                </div>
                <div className="cal-card-body cal-goals-body">
                  {[
                    { label: "Complete 1+ topic today", done: todayGoals.lessonWatched },
                    { label: "Submit a quiz today", done: todayGoals.quizCompleted },
                    { label: `Study 30 min today${todayGoals.studyMinutes > 0 ? ` (${todayGoals.studyMinutes}m logged)` : ""}`, done: todayGoals.studyGoalMet },
                  ].map((goal, i) => (
                    <div key={i} className="cal-goal-row">
                      {goal.done ? (
                        <CheckCircle2 size={16} className="cal-goal-icon cal-goal-icon--done" />
                      ) : (
                        <div className="cal-goal-circle" />
                      )}
                      <span className={`cal-goal-label${goal.done ? " cal-goal-label--done" : ""}`}>
                        {goal.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="cal-card">
                <div className="cal-card-header">
                  <span className="cal-card-header-title">Legend</span>
                </div>
                <div className="cal-card-body cal-legend-body">
                  <div className="cal-legend-entry">
                    <span className="cal-legend-entry-dot cal-legend-entry-dot--green" />
                    <div>
                      <p className="cal-legend-entry-title">Green — Active</p>
                      <p className="cal-legend-entry-sub">
                        1+ lesson, quiz completed, or phase progress
                      </p>
                    </div>
                  </div>
                  <div className="cal-legend-entry">
                    <span className="cal-legend-entry-dot cal-legend-entry-dot--red" />
                    <div>
                      <p className="cal-legend-entry-title">Red — Inactive</p>
                      <p className="cal-legend-entry-sub">
                        Zero lessons, no quizzes, target missed
                      </p>
                    </div>
                  </div>
                  <div className="cal-legend-entry">
                    <span className="cal-legend-entry-emoji">🏆</span>
                    <div>
                      <p className="cal-legend-entry-title">Achievement</p>
                      <p className="cal-legend-entry-sub">
                        Perfect quiz score or milestone reached
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
