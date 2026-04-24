import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Search, Mail, MousePointer,
  ShieldAlert, Target, BarChart3,
  CheckCircle2, XCircle, Plus, X, Trash2, FileText,
  Copy, Eye,
} from "lucide-react";
import "../pages/Phishingdrillpage.css";

const API = "http://127.0.0.1:8000";

const Toast = ({ message, onClose }) => (
  <div className={`pd-toast ${message.type === "error" ? "pd-toast--error" : ""}`}>
    <div className="pd-toast-content">
      <strong>{message.title}</strong>
      <p>{message.description}</p>
    </div>
    <button className="pd-toast-close" onClick={onClose}><X size={14} /></button>
  </div>
);

const PhishingDrillPage = () => {
  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [activeTab, setActiveTab] = useState("campaigns");
  const [createOpen, setCreateOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [launching, setLaunching] = useState(false);

  const [form, setForm] = useState({ name: "", template_id: "" });
  const [templateForm, setTemplateForm] = useState({ name: "", subject: "", html_body: "" });

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, []);

  const showToast = (title, description, type = "success") => {
    setToast({ title, description, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API}/phishing/campaigns`, { headers: getHeaders() });
      if (res.ok) setCampaigns(await res.json());
    } catch {
      showToast("Error", "Failed to load campaigns", "error");
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API}/phishing/templates`, { headers: getHeaders() });
      if (res.ok) setTemplates(await res.json());
    } catch { /* non-critical */ }
  };

  const openCampaignDetail = async (campaign) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setCampaignDetail(null);
    try {
      const res = await fetch(`${API}/phishing/campaigns/${campaign.id}`, { headers: getHeaders() });
      if (res.ok) setCampaignDetail(await res.json());
    } catch {
      showToast("Error", "Failed to load campaign details", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => { setDetailOpen(false); setCampaignDetail(null); };

  const handleLaunchDrill = async () => {
    if (!form.name.trim() || !form.template_id) {
      showToast("Missing fields", "Campaign name and template are required", "error");
      return;
    }
    setLaunching(true);
    try {
      const res = await fetch(`${API}/phishing/campaigns`, {
        method: "POST",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), template_id: parseInt(form.template_id) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Launch failed");
      }
      const created = await res.json();
      setCampaigns(prev => [created, ...prev]);
      showToast("Campaign Launched 🚀", `Drill emails sent to ${created.total_sent} users`);
      setCreateOpen(false);
      setForm({ name: "", template_id: "" });
    } catch (e) {
      showToast("Launch Failed", e.message, "error");
    } finally {
      setLaunching(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.html_body.trim()) {
      showToast("Missing fields", "All template fields are required", "error");
      return;
    }
    try {
      const res = await fetch(`${API}/phishing/templates`, {
        method: "POST",
        headers: { ...getHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(templateForm),
      });
      if (!res.ok) throw new Error("Failed to create template");
      const created = await res.json();
      setTemplates(prev => [...prev, created]);
      showToast("Template Created", `"${created.name}" is ready to use`);
      setTemplateOpen(false);
      setTemplateForm({ name: "", subject: "", html_body: "" });
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  };

  const handleDeleteTemplate = async (id, isBuiltin) => {
    if (isBuiltin) {
      showToast("Cannot Delete", "Built-in templates cannot be removed", "error");
      return;
    }
    try {
      const res = await fetch(`${API}/phishing/templates/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      setTemplates(prev => prev.filter(t => t.id !== id));
      showToast("Deleted", "Template removed");
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  };

  const totalSent = campaigns.reduce((s, c) => s + c.total_sent, 0);
  const totalClicked = campaigns.reduce((s, c) => s + c.total_clicked, 0);
  const clickRate = totalSent ? Math.round((totalClicked / totalSent) * 100) : 0;

  const stats = [
    { label: "Total Emails Sent", value: totalSent, icon: Send, colorClass: "icon-primary", bgClass: "bg-primary-soft" },
    { label: "Click Rate", value: `${clickRate}%`, icon: MousePointer, colorClass: "icon-destructive", bgClass: "bg-destructive-soft", sub: `${totalClicked} clicked` },
    { label: "Active Campaigns", value: campaigns.filter(c => c.status === "active").length, icon: Target, colorClass: "icon-amber", bgClass: "bg-amber-soft" },
    { label: "Total Campaigns", value: campaigns.length, icon: BarChart3, colorClass: "icon-emerald", bgClass: "bg-emerald-soft" },
  ];

  const filteredCampaigns = campaigns.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredTemplates = templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="pd-page">
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
            <button className={`pd-tab ${activeTab === "campaigns" ? "pd-tab-active" : ""}`} onClick={() => setActiveTab("campaigns")}>
              <Target size={14} /> Campaigns
            </button>
            <button className={`pd-tab ${activeTab === "templates" ? "pd-tab-active" : ""}`} onClick={() => setActiveTab("templates")}>
              <FileText size={14} /> Templates
            </button>
          </div>
          <div className="pd-search-wrap">
            <Search className="pd-search-icon" size={16} />
            <input className="pd-search" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* Campaigns Tab */}
        {activeTab === "campaigns" && (
          <div className="pd-table-wrap">
            {filteredCampaigns.length === 0 ? (
              <div className="pd-empty">
                <ShieldAlert size={36} className="pd-empty-icon" />
                <p>{campaigns.length === 0 ? "No campaigns yet. Launch your first drill." : "No campaigns match your search."}</p>
              </div>
            ) : (
              <table className="pd-table">
                <thead>
                  <tr className="pd-table-header-row">
                    <th>Campaign</th>
                    <th>Template</th>
                    <th>Sent</th>
                    <th>Clicked</th>
                    <th>Click Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="pd-table-row"
                      onClick={() => openCampaignDetail(c)}
                    >
                      <td>
                        <p className="pd-cell-title">{c.name}</p>
                        <p className="pd-cell-sub">{new Date(c.created_at).toLocaleDateString()}</p>
                      </td>
                      <td className="pd-cell-muted">{c.template_name}</td>
                      <td className="pd-cell-bold">{c.total_sent}</td>
                      <td><span className="pd-cell-red">{c.total_clicked}</span></td>
                      <td className="pd-cell-bold">{c.click_rate}%</td>
                      <td>
                        <span className={`pd-badge ${c.status === "completed" ? "pd-badge-green" : "pd-badge-blue"}`}>
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <div className="pd-table-wrap">
            <div className="pd-templates-actions">
              <button className="pd-btn-primary pd-btn-sm" onClick={() => setTemplateOpen(true)}>
                <Plus size={14} /> New Template
              </button>
            </div>
            {filteredTemplates.length === 0 ? (
              <div className="pd-empty">
                <Mail size={36} className="pd-empty-icon" />
                <p>No templates yet. Create one to get started.</p>
              </div>
            ) : (
              <table className="pd-table">
                <thead>
                  <tr className="pd-table-header-row">
                    <th>Template Name</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTemplates.map((t, i) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="pd-table-row"
                    >
                      <td><p className="pd-cell-title">{t.name}</p></td>
                      <td className="pd-cell-muted">{t.subject}</td>
                      <td>
                        <span className={`pd-badge ${t.is_builtin ? "pd-badge-amber" : "pd-badge-blue"}`}>
                          {t.is_builtin ? "Built-in" : "Custom"}
                        </span>
                      </td>
                      <td className="pd-action-cell">
                        <button
                          className="pd-icon-btn"
                          title="Preview template"
                          onClick={e => { e.stopPropagation(); setPreviewTemplate(t); }}
                        >
                          <Eye size={15} />
                        </button>
                        {!t.is_builtin && (
                          <button
                            className="pd-icon-btn"
                            title="Delete template"
                            onClick={e => { e.stopPropagation(); handleDeleteTemplate(t.id, t.is_builtin); }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </motion.div>

      {/* Launch Campaign Dialog */}
      <AnimatePresence>
        {createOpen && (
          <div className="pd-overlay" onClick={() => setCreateOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pd-dialog"
              onClick={e => e.stopPropagation()}
            >
              <div className="pd-dialog-header">
                <h2 className="pd-dialog-title">Launch Phishing Campaign</h2>
                <button className="pd-dialog-close" onClick={() => setCreateOpen(false)}><X size={18} /></button>
              </div>
              <div className="pd-dialog-body">
                <div className="pd-field">
                  <label className="pd-label">Campaign Name</label>
                  <input
                    className="pd-input"
                    placeholder="e.g., April Security Awareness"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="pd-field">
                  <label className="pd-label">Email Template</label>
                  <select
                    className="pd-input"
                    value={form.template_id}
                    onChange={e => setForm(prev => ({ ...prev, template_id: e.target.value }))}
                  >
                    <option value="">Select a template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="pd-info-box">
                  <ShieldAlert size={14} />
                  <span>This will send a simulated phishing email to <strong>all users</strong> (crew, admin, and superusers).</span>
                </div>
                <button className="pd-btn-primary pd-btn-full" onClick={handleLaunchDrill} disabled={launching}>
                  {launching ? "Launching..." : <><Send size={16} /> Launch Campaign</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Template Dialog */}
      <AnimatePresence>
        {templateOpen && (
          <div className="pd-overlay" onClick={() => setTemplateOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pd-dialog pd-dialog--wide"
              onClick={e => e.stopPropagation()}
            >
              <div className="pd-dialog-header">
                <h2 className="pd-dialog-title">Create Email Template</h2>
                <button className="pd-dialog-close" onClick={() => setTemplateOpen(false)}><X size={18} /></button>
              </div>
              <div className="pd-dialog-body">
                <div className="pd-field">
                  <label className="pd-label">Template Name</label>
                  <input
                    className="pd-input"
                    placeholder="e.g., Fuel Invoice Alert"
                    value={templateForm.name}
                    onChange={e => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="pd-field">
                  <label className="pd-label">Email Subject</label>
                  <input
                    className="pd-input"
                    placeholder="e.g., Urgent: Verify your invoice"
                    value={templateForm.subject}
                    onChange={e => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="pd-field">
                  <label className="pd-label">HTML Body</label>
                  <p className="pd-label-hint">
                    Use <code>{"{{tracking_url}}"}</code> for the bait link and <code>{"{{recipient_name}}"}</code> for the recipient's name.
                  </p>
                  <textarea
                    className="pd-input pd-textarea"
                    placeholder="<html>...</html>"
                    rows={10}
                    value={templateForm.html_body}
                    onChange={e => setTemplateForm(prev => ({ ...prev, html_body: e.target.value }))}
                  />
                </div>
                <button className="pd-btn-primary pd-btn-full" onClick={handleCreateTemplate}>
                  <Plus size={16} /> Save Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <div className="pd-overlay" onClick={() => setPreviewTemplate(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pd-dialog pd-dialog--wide"
              onClick={e => e.stopPropagation()}
            >
              <div className="pd-dialog-header">
                <div>
                  <h2 className="pd-dialog-title">{previewTemplate.name}</h2>
                  <p className="pd-cell-muted" style={{ margin: 0, fontSize: "0.8rem" }}>Subject: {previewTemplate.subject}</p>
                </div>
                <button className="pd-dialog-close" onClick={() => setPreviewTemplate(null)}><X size={18} /></button>
              </div>
              <div className="pd-dialog-body">
                <p className="pd-label-hint" style={{ marginBottom: "0.5rem" }}>
                  Preview shows template with placeholder values. Actual emails will have personalised tracking links.
                </p>
                <iframe
                  className="pd-preview-frame"
                  title="Template Preview"
                  srcDoc={previewTemplate.html_body
                    .replace(/\{\{tracking_url\}\}/g, "#phishing-drill-preview")
                    .replace(/\{\{recipient_name\}\}/g, "John Doe")}
                  sandbox="allow-same-origin"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Campaign Detail Dialog */}
      <AnimatePresence>
        {detailOpen && (
          <div className="pd-overlay" onClick={closeDetail}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="pd-dialog pd-dialog--wide"
              onClick={e => e.stopPropagation()}
            >
              <div className="pd-dialog-header">
                <h2 className="pd-dialog-title">Campaign Details</h2>
                <button className="pd-dialog-close" onClick={closeDetail}><X size={18} /></button>
              </div>
              <div className="pd-dialog-body">
                {detailLoading || !campaignDetail ? (
                  <p className="pd-cell-muted">Loading...</p>
                ) : (
                  <>
                    <h3 className="pd-detail-name">{campaignDetail.name}</h3>
                    <div className="pd-detail-grid">
                      {[
                        { label: "Template", value: campaignDetail.template_name },
                        { label: "Emails Sent", value: campaignDetail.total_sent },
                        { label: "Clicked", value: `${campaignDetail.total_clicked} (${campaignDetail.click_rate}%)` },
                        { label: "Date", value: new Date(campaignDetail.created_at).toLocaleDateString() },
                      ].map((item, i) => (
                        <div key={i} className="pd-detail-item">
                          <p className="pd-detail-item-label">{item.label}</p>
                          <p className="pd-detail-item-value">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {campaignDetail.total_sent > 0 && (
                      <div className="pd-progress-section">
                        <p className="pd-progress-label-top">Click vs Safe Rate</p>
                        <div className="pd-progress-row">
                          <div className="pd-progress-meta">
                            <span className="pd-progress-text-red">Clicked (Vulnerable)</span>
                            <span className="pd-progress-pct">{campaignDetail.click_rate}%</span>
                          </div>
                          <div className="pd-progress-bar-bg">
                            <div className="pd-progress-bar pd-progress-bar-red" style={{ width: `${campaignDetail.click_rate}%` }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {campaignDetail.targets?.length > 0 && (
                      <div className="pd-table-wrap pd-detail-table">
                        <table className="pd-table">
                          <thead>
                            <tr className="pd-table-header-row">
                              <th>User</th>
                              <th>Role</th>
                              <th>Email</th>
                              <th className="text-center">Clicked</th>
                              <th className="text-center">Tracking Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {campaignDetail.targets.map((t, i) => (
                              <motion.tr
                                key={t.user_id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className="pd-table-row"
                              >
                                <td>
                                  <p className="pd-cell-title">{t.full_name}</p>
                                  <p className="pd-cell-sub">{t.email}</p>
                                </td>
                                <td><span className="pd-role-badge">{t.role}</span></td>
                                <td>
                                  <span className={`pd-badge ${t.email_status === "sent" ? "pd-badge-green" : t.email_status === "failed" ? "pd-badge-red" : "pd-badge-amber"}`}>
                                    {t.email_status}
                                  </span>
                                </td>
                                <td className="text-center">
                                  {t.clicked
                                    ? <CheckCircle2 className="pd-check-red mx-auto" size={18} />
                                    : <XCircle className="pd-check-muted mx-auto" size={18} />
                                  }
                                </td>
                                <td className="text-center">
                                  {t.tracking_url && (
                                    <button
                                      className="pd-icon-btn"
                                      title="Copy tracking link"
                                      onClick={() => {
                                        navigator.clipboard.writeText(t.tracking_url);
                                        showToast("Copied", "Tracking link copied to clipboard");
                                      }}
                                    >
                                      <Copy size={14} />
                                    </button>
                                  )}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
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
