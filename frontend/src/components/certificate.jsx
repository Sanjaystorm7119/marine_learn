import { useState } from "react";
import { motion } from "framer-motion";
import {
  Anchor, Award, BookOpen, LayoutDashboard, Clock, Calendar,
  Download, Eye, Share2, ExternalLink, CheckCircle2, Loader2,
  Shield, Flame, Navigation, Ship, Zap, UtensilsCrossed,
  GraduationCap, FileText, BarChart3, Settings, HelpCircle,
  Menu, User, LogOut, Search, Bell, BadgeCheck, TrendingUp,
  Star, X
} from "lucide-react";
import { Link } from "react-router-dom";
import "../pages/certificate.css";
import Sidenav from "./sidenav";

/* ── Mock Data ── */
const certStats = [
  { label: "Earned", value: "12", icon: Award, color: "from-emerald-500 to-emerald-600" },
  { label: "Pending", value: "3", icon: Loader2, color: "from-amber-500 to-amber-600" },
  { label: "Completion Rate", value: "95%", icon: TrendingUp, color: "from-primary to-accent" },
  { label: "Total Hours", value: "420", icon: Clock, color: "from-violet-500 to-violet-600" },
];

const completedCerts = [
  { id: "MAR-00123", title: "STCW Able Seafarer Deck", dept: "Deck", icon: Ship, issued: "Feb 24, 2026", expires: "Feb 24, 2027", score: 92, status: "valid" },
  { id: "MAR-00124", title: "STCW Firefighting & Fire Prevention", dept: "Safety", icon: Flame, issued: "Jan 15, 2026", expires: "Jan 15, 2027", score: 88, status: "valid" },
  { id: "MAR-00125", title: "Bridge Watchkeeping Certificate", dept: "Navigation", icon: Navigation, issued: "Dec 10, 2025", expires: "Dec 10, 2026", score: 95, status: "valid" },
  { id: "MAR-00126", title: "Basic Safety Training (BST)", dept: "Safety", icon: Shield, issued: "Nov 20, 2025", expires: "Nov 20, 2026", score: 90, status: "valid" },
  { id: "MAR-00127", title: "Marine Electrical Fundamentals", dept: "Electrical", icon: Zap, issued: "Oct 05, 2025", expires: "Oct 05, 2026", score: 87, status: "valid" },
  { id: "MAR-00128", title: "Ship Sanitation & Hygiene", dept: "Catering", icon: UtensilsCrossed, issued: "Sep 12, 2025", expires: "Sep 12, 2026", score: 91, status: "valid" },
  { id: "MAR-00129", title: "Survival Craft & Rescue Boats", dept: "Safety", icon: Shield, issued: "Aug 01, 2025", expires: "Aug 01, 2026", score: 94, status: "valid" },
  { id: "MAR-00130", title: "Personal Safety & Social Responsibilities", dept: "Safety", icon: Shield, issued: "Jul 18, 2025", expires: "Jul 18, 2026", score: 89, status: "valid" },
  { id: "MAR-00131", title: "Advanced Fire Fighting", dept: "Safety", icon: Flame, issued: "Jun 05, 2025", expires: "Jun 05, 2026", score: 86, status: "valid" },
  { id: "MAR-00132", title: "Medical First Aid on Board", dept: "Safety", icon: Shield, issued: "May 22, 2025", expires: "May 22, 2026", score: 93, status: "valid" },
  { id: "MAR-00133", title: "Engine Room Simulator", dept: "Engine", icon: Flame, issued: "Apr 10, 2025", expires: "Apr 10, 2026", score: 85, status: "expiring" },
  { id: "MAR-00134", title: "Proficiency in Security Awareness", dept: "Safety", icon: Shield, issued: "Mar 01, 2025", expires: "Mar 01, 2026", score: 96, status: "expiring" },
];

const pendingCerts = [
  { id: "P-001", title: "Radar Observer (ARPA)", dept: "Navigation", icon: Navigation, progress: 85, lessonsLeft: 3 },
  { id: "P-002", title: "GMDSS Radio Operator", dept: "Navigation", icon: Navigation, progress: 67, lessonsLeft: 8 },
  { id: "P-003", title: "Tanker Familiarization", dept: "Deck", icon: Ship, progress: 42, lessonsLeft: 14 },
];

const certTimeline = [
  { text: "Earned STCW Able Seafarer Deck", date: "Feb 24, 2026", icon: Award },
  { text: "Completed Firefighting course", date: "Jan 15, 2026", icon: CheckCircle2 },
  { text: "Earned Bridge Watchkeeping", date: "Dec 10, 2025", icon: Award },
  { text: "Completed BST course", date: "Nov 20, 2025", icon: CheckCircle2 },
  { text: "Joined MarineLearn", date: "Mar 01, 2025", icon: Star },
];

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Courses", icon: BookOpen, href: "course/cybersecurity/maritime-cybersecurity-q1" },
  { label: "Calendar", icon: Calendar, href: "/dashboard" },
  { label: "Certificates", icon: Award, href: "/certificates", active: true },
  { label: "Reports", icon: BarChart3, href: "/dashboard" },
  { label: "Resources", icon: FileText, href: "/dashboard" },
  { label: "Settings", icon: Settings, href: "/dashboard" },
  { label: "Help", icon: HelpCircle, href: "/dashboard" },
];

const Certificates = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedCert, setSelectedCert] = useState(null);

  const filteredCerts = filter === "all"
    ? completedCerts
    : completedCerts.filter(c => c.status === filter);

  return (
    <div className="cert-root">
      {/* Desktop Sidebar */}
      <aside className={`cert-sidebar-desktop${sidebarOpen ? " cert-sidebar-desktop--open" : " cert-sidebar-desktop--collapsed"}`}>
        <Sidenav sidebarOpen={sidebarOpen} sidebarItems={sidebarItems} />
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="cert-sidebar-mobile-overlay">
          <div className="cert-sidebar-mobile-backdrop" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="cert-sidebar-mobile-panel">
            <Sidenav sidebarOpen={true} sidebarItems={sidebarItems} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="cert-main">
        {/* Top Bar */}
        <header className="cert-topbar nav-gradient">
          <button
            onClick={() => { if (window.innerWidth < 1024) setMobileSidebarOpen(true); else setSidebarOpen(!sidebarOpen); }}
            className="cert-topbar-menu-btn"
          >
            <Menu className="cert-topbar-menu-icon" />
          </button>
          <div className="cert-topbar-search-wrap">
            <div className="cert-topbar-search">
              <Search className="cert-topbar-search-icon" />
              <input
                type="text"
                placeholder="Search certificates..."
                className="cert-topbar-search-input"
              />
            </div>
          </div>
          <button className="cert-topbar-bell-btn">
            <Bell className="cert-topbar-bell-icon" />
            <span className="cert-topbar-bell-dot" />
          </button>
        </header>

        {/* Content */}
        <div className="cert-content">

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="cert-page-header"
          >
            <div className="cert-page-title-wrap">
              <div className="cert-page-icon-wrap">
                <GraduationCap className="cert-page-icon" />
              </div>
              <div>
                <h1 className="cert-page-title">My Certificates</h1>
                <p className="cert-page-subtitle">
                  <span className="cert-count-earned">12</span> Earned •{" "}
                  <span className="cert-count-pending">3</span> Pending •{" "}
                  <span className="cert-count-rate">95%</span> Course Completion Rate
                </p>
              </div>
            </div>
            <div className="cert-page-actions">
              <button className="cert-btn cert-btn--outline">
                <BadgeCheck className="cert-btn-icon" /> Verify All
              </button>
              <button className="cert-btn cert-btn--solid">
                <Share2 className="cert-btn-icon" /> Share Portfolio
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="cert-stats-grid">
            {certStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
              >
                <div className="cert-stat-card">
                  <div>
                    <p className="cert-stat-label">{stat.label}</p>
                    <p className="cert-stat-value">{stat.value}</p>
                  </div>
                  <div className={`cert-stat-icon-wrap cert-gradient-${i}`}>
                    <stat.icon className="cert-stat-icon" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="cert-main-grid">

            {/* Left Column */}
            <div className="cert-left-col">

              {/* Completed Certificates */}
              <div className="cert-section">
                <div className="cert-section-header">
                  <div className="cert-section-title-wrap">
                    <CheckCircle2 className="cert-section-title-icon cert-section-title-icon--green" />
                    <h2 className="cert-section-title">Completed Certificates</h2>
                  </div>
                  <div className="cert-filter-wrap">
                    {["all", "valid", "expiring"].map(f => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`cert-filter-btn${filter === f ? " cert-filter-btn--active" : ""}`}
                      >
                        {f === "all" ? "All" : f === "valid" ? "Valid" : "Expiring"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cert-cards-grid">
                  {filteredCerts.map((cert, i) => (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.4 }}
                      layout
                    >
                      <div
                        className={`cert-card${selectedCert === cert.id ? " cert-card--selected" : ""}`}
                        onClick={() => setSelectedCert(selectedCert === cert.id ? null : cert.id)}
                      >
                        <div className="cert-card-icon-wrap">
                          <cert.icon className="cert-card-icon" />
                        </div>
                        <div className="cert-card-body">
                          <div className="cert-card-top-row">
                            <h3 className="cert-card-title">{cert.title}</h3>
                            <span className={`cert-status-badge cert-status-badge--${cert.status}`}>
                              {cert.status === "valid" ? "VALID" : "EXPIRING"}
                            </span>
                          </div>
                          <p className="cert-card-dept">{cert.dept} Department</p>
                          <div className="cert-card-meta">
                            <span className="cert-card-meta-item">
                              <Calendar className="cert-card-meta-icon" /> {cert.issued}
                            </span>
                            <span>Score: <strong className="cert-card-score">{cert.score}%</strong></span>
                          </div>
                          <p className="cert-card-id">#{cert.id}</p>

                          {selectedCert === cert.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="cert-card-expanded"
                            >
                              <div className="cert-card-expanded-row">
                                <span className="cert-card-expanded-label">Expires</span>
                                <span className="cert-card-expanded-value">{cert.expires}</span>
                              </div>
                              <div className="cert-card-expanded-row">
                                <span className="cert-card-expanded-label">Verification</span>
                                <span className="cert-card-verified">
                                  <BadgeCheck className="cert-card-verified-icon" /> Verified
                                </span>
                              </div>
                              <div className="cert-card-action-row">
                                <button className="cert-action-btn">
                                  <Download className="cert-action-btn-icon" /> PDF
                                </button>
                                <button className="cert-action-btn">
                                  <Eye className="cert-action-btn-icon" /> View
                                </button>
                                <button className="cert-action-btn">
                                  <Share2 className="cert-action-btn-icon" /> Share
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pending Certificates */}
              <div className="cert-section">
                <div className="cert-section-title-wrap">
                  <Loader2 className="cert-section-title-icon cert-section-title-icon--amber" />
                  <h2 className="cert-section-title">Pending Certificates</h2>
                </div>
                <div className="cert-pending-grid">
                  {pendingCerts.map((cert, i) => (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.4 }}
                    >
                      <div className="cert-pending-card">
                        <div className="cert-pending-icon-wrap">
                          <cert.icon className="cert-pending-icon" />
                        </div>
                        <div className="cert-pending-body">
                          <h3 className="cert-pending-title">{cert.title}</h3>
                          <p className="cert-pending-dept">{cert.dept} Department</p>
                          <div className="cert-pending-progress-area">
                            <div className="cert-pending-progress-header">
                              <span className="cert-pending-lessons">{cert.lessonsLeft} lessons remaining</span>
                              <span className="cert-pending-percent">{cert.progress}%</span>
                            </div>
                            <div className="cert-progress-track">
                              <div className="cert-progress-fill" style={{ width: `${cert.progress}%` }} />
                            </div>
                          </div>
                          <button className="cert-continue-btn">
                            Continue Course <ExternalLink className="cert-continue-icon" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Expiring Banner */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <div className="cert-expiring-banner">
                  <div className="cert-expiring-icon-wrap">
                    <Clock className="cert-expiring-icon" />
                  </div>
                  <div className="cert-expiring-text">
                    <h3 className="cert-expiring-title">2 Certificates Expiring Soon</h3>
                    <p className="cert-expiring-desc">Engine Room Simulator and Proficiency in Security Awareness expire within 30 days. Renew now to stay compliant.</p>
                  </div>
                  <button className="cert-btn cert-btn--outline cert-btn--amber">Renew</button>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="cert-right-col">

              {/* Timeline */}
              <div className="cert-widget-card">
                <div className="cert-widget-header">
                  <h3 className="cert-widget-title">Achievement Timeline</h3>
                  <p className="cert-widget-desc">Your certification journey</p>
                </div>
                <div className="cert-timeline">
                  {certTimeline.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="cert-timeline-item"
                    >
                      {i < certTimeline.length - 1 && <div className="cert-timeline-line" />}
                      <div className="cert-timeline-icon-wrap">
                        <item.icon className="cert-timeline-icon" />
                      </div>
                      <div className="cert-timeline-text-wrap">
                        <p className="cert-timeline-text">{item.text}</p>
                        <p className="cert-timeline-date">{item.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Skills Breakdown */}
              <div className="cert-widget-card">
                <div className="cert-widget-header">
                  <h3 className="cert-widget-title">Skills Breakdown</h3>
                  <p className="cert-widget-desc">Certifications by department</p>
                </div>
                <div className="cert-skills-list">
                  {[
                    { dept: "Safety", count: 6, total: 8, color: "bg-emerald-500" },
                    { dept: "Navigation", count: 3, total: 5, color: "bg-primary" },
                    { dept: "Deck", count: 1, total: 3, color: "bg-amber-500" },
                    { dept: "Engine", count: 1, total: 4, color: "bg-violet-500" },
                    { dept: "Electrical", count: 1, total: 2, color: "bg-cyan-500" },
                  ].map((skill, i) => (
                    <div key={skill.dept} className="cert-skill-item">
                      <div className="cert-skill-header">
                        <span className="cert-skill-dept">{skill.dept}</span>
                        <span className="cert-skill-count">{skill.count}/{skill.total}</span>
                      </div>
                      <div className="cert-skill-track">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(skill.count / skill.total) * 100}%` }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                          className={`cert-skill-fill ${skill.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="cert-widget-card">
                <div className="cert-widget-header">
                  <h3 className="cert-widget-title">Quick Actions</h3>
                </div>
                <div className="cert-quick-actions">
                  {[
                    { label: "Download All as ZIP", icon: Download },
                    { label: "Print Certificate Wall", icon: FileText },
                    { label: "Share LinkedIn Portfolio", icon: Share2 },
                    { label: "Request Verification Letter", icon: BadgeCheck },
                  ].map((action) => (
                    <button key={action.label} className="cert-quick-action-btn">
                      <action.icon className="cert-quick-action-icon" />
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Certificates;