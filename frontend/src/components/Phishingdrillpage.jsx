import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Search, Mail, MousePointer,
  ShieldAlert, Target, BarChart3,
  CheckCircle2, XCircle, Plus, X
} from "lucide-react";
import "../pages/Phishingdrillpage.css";

const mockCampaigns = [
  { id: "PD001", name: "March Security Awareness", status: "completed", sentDate: "2026-03-15", targetGroup: "All Crew", totalSent: 150, opened: 120, clicked: 35, reported: 85, template: "Fake IT Password Reset" },
  { id: "PD002", name: "Officer Spear Phishing", status: "completed", sentDate: "2026-03-08", targetGroup: "Officers", totalSent: 45, opened: 40, clicked: 12, reported: 28, template: "Port Authority Notice" },
  { id: "PD003", name: "Engine Dept Social Engineering", status: "active", sentDate: "2026-03-22", targetGroup: "Engine Crew", totalSent: 60, opened: 42, clicked: 18, reported: 20, template: "Fuel Supplier Invoice" },
  { id: "PD004", name: "April Awareness Campaign", status: "scheduled", sentDate: "2026-04-01", targetGroup: "All Crew", totalSent: 0, opened: 0, clicked: 0, reported: 0, template: "Crew Bonus Notification" },
];

const mockUserResults = [
  { id: "U1", name: "James Miller", email: "james@marine.com", role: "Officer", opened: true, clicked: false, reported: true, responseTime: "2 min" },
  { id: "U2", name: "Sarah Chen", email: "sarah@marine.com", role: "Officer", opened: true, clicked: true, reported: false, responseTime: "15 min" },
  { id: "U3", name: "Raj Patel", email: "raj@marine.com", role: "Crew", opened: true, clicked: true, reported: false, responseTime: "8 min" },
  { id: "U4", name: "Maria Santos", email: "maria@marine.com", role: "Crew", opened: false, clicked: false, reported: false, responseTime: "-" },
  { id: "U5", name: "David Kim", email: "david@marine.com", role: "Officer", opened: true, clicked: false, reported: true, responseTime: "5 min" },
  { id: "U6", name: "Anna Wong", email: "anna@marine.com", role: "Crew", opened: true, clicked: true, reported: false, responseTime: "22 min" },
];

const Toast = ({ message, onClose }) => (
  <div className="pd-toast">
    <div className="pd-toast-content">
      <strong>{message.title}</strong>
      <p>{message.description}</p>
    </div>
    <button className="pd-toast-close" onClick={onClose}><X size={14} /></button>
  </div>
);

const PhishingDrillPage = () => {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  const totalSent = mockCampaigns.reduce((s, c) => s + c.totalSent, 0);
  const totalClicked = mockCampaigns.reduce((s, c) => s + c.clicked, 0);
  const totalReported = mockCampaigns.reduce((s, c) => s + c.reported, 0);
  const clickRate = totalSent ? Math.round((totalClicked / totalSent) * 100) : 0;
  const reportRate = totalSent ? Math.round((totalReported / totalSent) * 100) : 0;

  const handleLaunchDrill = () => {
    setToast({ title: "Drill Launched 🚀", description: "Phishing drill campaign has been scheduled." });
    setCreateOpen(false);
    setTimeout(() => setToast(null), 3500);
  };

  const stats = [
    { label: "Total Emails Sent", value: totalSent, icon: Send, colorClass: "icon-primary", bgClass: "bg-primary-soft" },
    { label: "Click Rate", value: `${clickRate}%`, icon: MousePointer, colorClass: "icon-destructive", bgClass: "bg-destructive-soft", sub: `${totalClicked} clicked` },
    { label: "Report Rate", value: `${reportRate}%`, icon: ShieldAlert, colorClass: "icon-emerald", bgClass: "bg-emerald-soft", sub: `${totalReported} reported` },
    { label: "Active Campaigns", value: mockCampaigns.filter(c => c.status === "active").length, icon: Target, colorClass: "icon-amber", bgClass: "bg-amber-soft" },
  ];

  return (
    <div className="pd-page">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Toast message={toast} onClose={() => setToast(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pd-header">
        <div>
          <h1 className="pd-title">
            <ShieldAlert className="pd-title-icon" />
            Phishing Drill Center
          </h1>
          <p className="pd-subtitle">Simulate phishing attacks to test and train crew awareness</p>
        </div>
        <button className="pd-btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> New Campaign
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="pd-stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="pd-stat-card">
            <div className={`pd-stat-icon-wrap ${stat.bgClass}`}>
              <stat.icon className={`pd-stat-icon ${stat.colorClass}`} size={24} />
            </div>
            <div>
              <p className="pd-stat-value">{stat.value}</p>
              <p className="pd-stat-label">{stat.label}</p>
              {stat.sub && <p className="pd-stat-sub">{stat.sub}</p>}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Tabs Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pd-card">
        <div className="pd-tabs-header">
          <div className="pd-tabs-list">
            <button
              className={`pd-tab ${activeTab === "campaigns" ? "pd-tab-active" : ""}`}
              onClick={() => setActiveTab("campaigns")}
            >
              <Target size={14} /> Campaigns
            </button>
            <button
              className={`pd-tab ${activeTab === "results" ? "pd-tab-active" : ""}`}
              onClick={() => setActiveTab("results")}
            >
              <BarChart3 size={14} /> User Results
            </button>
          </div>
          <div className="pd-search-wrap">
            <Search className="pd-search-icon" size={16} />
            <input
              className="pd-search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Campaigns Tab */}
        {activeTab === "campaigns" && (
          <div className="pd-table-wrap">
            <table className="pd-table">
              <thead>
                <tr className="pd-table-header-row">
                  <th>Campaign</th>
                  <th>Target</th>
                  <th>Template</th>
                  <th>Sent</th>
                  <th>Opened</th>
                  <th>Clicked</th>
                  <th>Reported</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockCampaigns.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="pd-table-row"
                    onClick={() => setSelectedCampaign(c)}
                  >
                    <td>
                      <p className="pd-cell-title">{c.name}</p>
                      <p className="pd-cell-sub">{c.sentDate}</p>
                    </td>
                    <td className="pd-cell-muted">{c.targetGroup}</td>
                    <td className="pd-cell-muted">{c.template}</td>
                    <td className="pd-cell-bold">{c.totalSent}</td>
                    <td>
                      <span className="pd-cell-default">{c.opened}</span>
                      {c.totalSent > 0 && <span className="pd-cell-pct">({Math.round((c.opened / c.totalSent) * 100)}%)</span>}
                    </td>
                    <td>
                      <span className="pd-cell-red">{c.clicked}</span>
                      {c.totalSent > 0 && <span className="pd-cell-pct">({Math.round((c.clicked / c.totalSent) * 100)}%)</span>}
                    </td>
                    <td>
                      <span className="pd-cell-green">{c.reported}</span>
                      {c.totalSent > 0 && <span className="pd-cell-pct">({Math.round((c.reported / c.totalSent) * 100)}%)</span>}
                    </td>
                    <td>
                      <span className={`pd-badge ${c.status === "completed" ? "pd-badge-green" : c.status === "active" ? "pd-badge-blue" : "pd-badge-amber"}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Results Tab */}
        {activeTab === "results" && (
          <div className="pd-table-wrap">
            <table className="pd-table">
              <thead>
                <tr className="pd-table-header-row">
                  <th>User</th>
                  <th>Role</th>
                  <th className="text-center">Opened</th>
                  <th className="text-center">Clicked Link</th>
                  <th className="text-center">Reported</th>
                  <th>Response Time</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {mockUserResults.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u, i) => {
                  const risk = u.clicked && !u.reported ? "High" : u.clicked && u.reported ? "Medium" : "Low";
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="pd-table-row"
                    >
                      <td>
                        <p className="pd-cell-title">{u.name}</p>
                        <p className="pd-cell-sub">{u.email}</p>
                      </td>
                      <td><span className="pd-role-badge">{u.role}</span></td>
                      <td className="text-center">
                        {u.opened ? <CheckCircle2 className="pd-check-amber mx-auto" size={20} /> : <XCircle className="pd-check-muted mx-auto" size={20} />}
                      </td>
                      <td className="text-center">
                        {u.clicked ? <CheckCircle2 className="pd-check-red mx-auto" size={20} /> : <XCircle className="pd-check-muted mx-auto" size={20} />}
                      </td>
                      <td className="text-center">
                        {u.reported ? <CheckCircle2 className="pd-check-green mx-auto" size={20} /> : <XCircle className="pd-check-muted mx-auto" size={20} />}
                      </td>
                      <td className="pd-cell-muted">{u.responseTime}</td>
                      <td>
                        <span className={`pd-badge ${risk === "High" ? "pd-badge-red" : risk === "Medium" ? "pd-badge-amber" : "pd-badge-green"}`}>
                          {risk}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Create Campaign Dialog */}
      <AnimatePresence>
        {createOpen && (
          <div className="pd-overlay" onClick={() => setCreateOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pd-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pd-dialog-header">
                <h2 className="pd-dialog-title">Create Phishing Campaign</h2>
                <button className="pd-dialog-close" onClick={() => setCreateOpen(false)}><X size={18} /></button>
              </div>
              <div className="pd-dialog-body">
                <div className="pd-field">
                  <label className="pd-label">Campaign Name</label>
                  <input className="pd-input" placeholder="e.g., April Security Test" />
                </div>
                <div className="pd-field">
                  <label className="pd-label">Target Group</label>
                  <div className="pd-group-btns">
                    {["All Crew", "Officers", "Engine Crew", "Deck Crew"].map(g => (
                      <button key={g} className="pd-group-btn">{g}</button>
                    ))}
                  </div>
                </div>
                <div className="pd-field">
                  <label className="pd-label">Email Template</label>
                  <div className="pd-template-list">
                    {["Fake Password Reset", "Port Authority Notice", "Salary Update", "IT System Alert"].map(t => (
                      <div key={t} className="pd-template-item">
                        <Mail size={16} className="pd-template-icon" />
                        <span className="pd-template-text">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pd-field">
                  <label className="pd-label">Schedule Date</label>
                  <input type="date" className="pd-input" />
                </div>
                <button className="pd-btn-primary pd-btn-full" onClick={handleLaunchDrill}>
                  <Send size={16} /> Launch Campaign
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Campaign Detail Dialog */}
      <AnimatePresence>
        {selectedCampaign && (
          <div className="pd-overlay" onClick={() => setSelectedCampaign(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pd-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pd-dialog-header">
                <h2 className="pd-dialog-title">Campaign Details</h2>
                <button className="pd-dialog-close" onClick={() => setSelectedCampaign(null)}><X size={18} /></button>
              </div>
              <div className="pd-dialog-body">
                <h3 className="pd-detail-name">{selectedCampaign.name}</h3>
                <div className="pd-detail-grid">
                  {[
                    { label: "Emails Sent", value: selectedCampaign.totalSent },
                    { label: "Opened", value: `${selectedCampaign.opened} (${selectedCampaign.totalSent ? Math.round((selectedCampaign.opened / selectedCampaign.totalSent) * 100) : 0}%)` },
                    { label: "Clicked (Failed)", value: `${selectedCampaign.clicked} (${selectedCampaign.totalSent ? Math.round((selectedCampaign.clicked / selectedCampaign.totalSent) * 100) : 0}%)` },
                    { label: "Reported (Passed)", value: `${selectedCampaign.reported} (${selectedCampaign.totalSent ? Math.round((selectedCampaign.reported / selectedCampaign.totalSent) * 100) : 0}%)` },
                  ].map((item, i) => (
                    <div key={i} className="pd-detail-item">
                      <p className="pd-detail-item-label">{item.label}</p>
                      <p className="pd-detail-item-value">{item.value}</p>
                    </div>
                  ))}
                </div>
                {selectedCampaign.totalSent > 0 && (
                  <div className="pd-progress-section">
                    <p className="pd-progress-label-top">Click vs Report Rate</p>
                    <div className="pd-progress-row">
                      <div className="pd-progress-meta">
                        <span className="pd-progress-text-red">Clicked (Vulnerable)</span>
                        <span className="pd-progress-pct">{Math.round((selectedCampaign.clicked / selectedCampaign.totalSent) * 100)}%</span>
                      </div>
                      <div className="pd-progress-bar-bg">
                        <div className="pd-progress-bar pd-progress-bar-red" style={{ width: `${Math.round((selectedCampaign.clicked / selectedCampaign.totalSent) * 100)}%` }} />
                      </div>
                    </div>
                    <div className="pd-progress-row">
                      <div className="pd-progress-meta">
                        <span className="pd-progress-text-green">Reported (Aware)</span>
                        <span className="pd-progress-pct">{Math.round((selectedCampaign.reported / selectedCampaign.totalSent) * 100)}%</span>
                      </div>
                      <div className="pd-progress-bar-bg">
                        <div className="pd-progress-bar pd-progress-bar-green" style={{ width: `${Math.round((selectedCampaign.reported / selectedCampaign.totalSent) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhishingDrillPage;