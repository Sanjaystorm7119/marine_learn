import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Award, BookOpen, LayoutDashboard, Clock, Calendar,
  Download, Eye, Share2, ExternalLink, CheckCircle2, Loader2,
  Navigation,
  GraduationCap, FileText, BarChart3, Settings, HelpCircle,
  Menu, Search, Bell, BadgeCheck, TrendingUp,
  Star, X
} from "lucide-react";
import "../pages/certificate.css";
import Sidenav from "./sidenav";
import CertificateTemplate from "./CertificateTemplate";
import { downloadCertificatePDF } from "../lib/downloadCertificate";

/* ── Static sidebar items ── */
const sidebarItems = [
  { label: "Dashboard",       icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Courses",      icon: BookOpen,        href: "/mycourses" },
  { label: "Study Materials", icon: FileText,        href: "/study-materials" },
  { label: "Calendar",        icon: Calendar,        href: "/calendar" },
  { label: "Certificates",    icon: Award,           href: "/certificates", active: true },
  { label: "Reports",         icon: BarChart3,       href: "/dashboard" },
  { label: "Settings",        icon: Settings,        href: "/settings" },
  { label: "Help",            icon: HelpCircle,      href: "/help" },
];

/* ── Static timeline (decorative) ── */
const certTimeline = [
  { text: "Joined MarineLearn", date: "", icon: Star },
  { text: "First course completed", date: "", icon: CheckCircle2 },
  { text: "Certificate earned", date: "", icon: Award },
];

const Certificates = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);
  const previewRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8000/study/certificates", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(r => r.json())
      .then(data => {
        setCertificates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const certStats = [
    { label: "Earned",          value: String(certificates.length), icon: Award,     color: "from-emerald-500 to-emerald-600" },
    { label: "Completion Rate", value: certificates.length > 0 ? "100%" : "—",       icon: TrendingUp, color: "from-primary to-accent" },
    { label: "Total Hours",     value: "—",                                           icon: Clock,      color: "from-violet-500 to-violet-600" },
  ];

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
                  <span className="cert-count-earned">{certificates.length}</span> Earned
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
                </div>

                {loading && (
                  <p style={{ color: "#3a7ca5", padding: "16px 0" }}>Loading certificates…</p>
                )}

                {!loading && certificates.length === 0 && (
                  <p style={{ color: "#888", padding: "16px 0" }}>
                    No certificates yet. Complete a course and pass the quiz to earn one!
                  </p>
                )}

                <div className="cert-cards-grid">
                  {certificates.map((cert, i) => (
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
                          <Award className="cert-card-icon" />
                        </div>
                        <div className="cert-card-body">
                          <div className="cert-card-top-row">
                            <h3 className="cert-card-title">{cert.course_title}</h3>
                            <span className="cert-status-badge cert-status-badge--valid">EARNED</span>
                          </div>
                          <div className="cert-card-meta">
                            <span className="cert-card-meta-item">
                              <Calendar className="cert-card-meta-icon" /> {formatDate(cert.issued_at)}
                            </span>
                          </div>
                          <p className="cert-card-id">#{cert.certificate_number}</p>

                          {selectedCert === cert.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="cert-card-expanded"
                            >
                              <div className="cert-card-expanded-row">
                                <span className="cert-card-expanded-label">Awarded To</span>
                                <span className="cert-card-expanded-value">{cert.user_full_name}</span>
                              </div>
                              <div className="cert-card-expanded-row">
                                <span className="cert-card-expanded-label">Issued</span>
                                <span className="cert-card-expanded-value">{formatDate(cert.issued_at)}</span>
                              </div>
                              <div className="cert-card-action-row">
                                <button
                                  className="cert-action-btn"
                                  onClick={(e) => { e.stopPropagation(); setPreviewCert(cert); }}
                                >
                                  <Download className="cert-action-btn-icon" /> PDF
                                </button>
                                <button
                                  className="cert-action-btn"
                                  onClick={(e) => { e.stopPropagation(); setPreviewCert(cert); }}
                                >
                                  <Eye className="cert-action-btn-icon" /> View
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
                  {certificates.length > 0
                    ? certificates.slice(0, 5).map((cert, i) => (
                        <motion.div
                          key={cert.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="cert-timeline-item"
                        >
                          {i < Math.min(certificates.length, 5) - 1 && <div className="cert-timeline-line" />}
                          <div className="cert-timeline-icon-wrap">
                            <Award className="cert-timeline-icon" />
                          </div>
                          <div className="cert-timeline-text-wrap">
                            <p className="cert-timeline-text">Earned: {cert.course_title}</p>
                            <p className="cert-timeline-date">{formatDate(cert.issued_at)}</p>
                          </div>
                        </motion.div>
                      ))
                    : certTimeline.map((item, i) => (
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
                          </div>
                        </motion.div>
                      ))
                  }
                </div>
              </div>

              {/* Quick Actions */}
              <div className="cert-widget-card">
                <div className="cert-widget-header">
                  <h3 className="cert-widget-title">Quick Actions</h3>
                </div>
                <div className="cert-quick-actions">
                  {[
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

      {/* Certificate Preview Modal */}
      {previewCert && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setPreviewCert(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "900px",
              width: "100%",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewCert(null)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#555",
              }}
            >
              <X size={20} />
            </button>

            <CertificateTemplate
              ref={previewRef}
              recipientName={previewCert.user_full_name}
              courseName={previewCert.course_title}
              issuedAt={previewCert.issued_at}
              certificateNumber={previewCert.certificate_number}
            />

            <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                className="cert-btn cert-btn--solid"
                onClick={() =>
                  downloadCertificatePDF(
                    previewRef.current,
                    `certificate-${previewCert.certificate_number}.pdf`
                  )
                }
              >
                <Download className="cert-btn-icon" /> Download PDF
              </button>
              <button className="cert-btn cert-btn--outline" onClick={() => setPreviewCert(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;
