import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Upload, Download, Trash2, Eye, Search,
  CheckCircle2, AlertTriangle, Shield, Clock, Ship
} from "lucide-react";
import "../pages/Audits.css";

const mockReports = [
  { id: "TR001", title: "Q1 2026 Safety Training Compliance", type: "training", uploadedBy: "Admin", uploadDate: "2026-03-15", fileSize: "2.4 MB", status: "reviewed", vessel: "MV Ocean Star" },
  { id: "TR002", title: "Engine Room Drill Assessment", type: "training", uploadedBy: "Capt. James", uploadDate: "2026-03-10", fileSize: "1.8 MB", status: "pending", vessel: "MV Sea Falcon" },
  { id: "TR003", title: "Bridge Team Navigation Exercise", type: "training", uploadedBy: "Admin", uploadDate: "2026-02-28", fileSize: "3.1 MB", status: "reviewed", vessel: "MV Pacific Voyager" },
  { id: "TR004", title: "Fire Safety Drill Report - Feb", type: "training", uploadedBy: "Safety Officer", uploadDate: "2026-02-20", fileSize: "1.2 MB", status: "flagged", vessel: "MV Ocean Star" },
  { id: "VA001", title: "Network Penetration Test - Q1", type: "vapt", uploadedBy: "CyberSec Team", uploadDate: "2026-03-12", fileSize: "5.6 MB", status: "reviewed", vessel: "MV Sea Falcon" },
  { id: "VA002", title: "Web Application Security Audit", type: "vapt", uploadedBy: "External Auditor", uploadDate: "2026-03-05", fileSize: "4.2 MB", status: "pending", vessel: "MV Pacific Voyager" },
  { id: "VA003", title: "OT/SCADA System Assessment", type: "vapt", uploadedBy: "CyberSec Team", uploadDate: "2026-02-18", fileSize: "7.8 MB", status: "flagged", vessel: "MV Ocean Star" },
  { id: "VA004", title: "Cloud Infrastructure Review", type: "vapt", uploadedBy: "External Auditor", uploadDate: "2026-02-10", fileSize: "3.4 MB", status: "reviewed", vessel: "MV Sea Falcon" },
  { id: "PH001", title: "March Phishing Campaign Results", type: "phishing", uploadedBy: "Admin", uploadDate: "2026-03-20", fileSize: "1.9 MB", status: "reviewed", vessel: "MV Pacific Voyager" },
  { id: "PH002", title: "Targeted Spear-Phishing Drill", type: "phishing", uploadedBy: "CyberSec Team", uploadDate: "2026-03-08", fileSize: "2.3 MB", status: "pending", vessel: "MV Ocean Star" },
  { id: "PH003", title: "Email Security Awareness Test", type: "phishing", uploadedBy: "Admin", uploadDate: "2026-02-25", fileSize: "1.5 MB", status: "reviewed", vessel: "MV Sea Falcon" },
  { id: "PH004", title: "USB Drop Test Report", type: "phishing", uploadedBy: "CyberSec Team", uploadDate: "2026-02-15", fileSize: "0.8 MB", status: "flagged", vessel: "MV Pacific Voyager" },
];

const vesselList = ["MV Ocean Star", "MV Sea Falcon", "MV Pacific Voyager", "MV Atlantic Pioneer", "MV Indian Explorer"];

const statusConfig = {
  reviewed: { label: "Reviewed", colorClass: "status-reviewed", Icon: CheckCircle2 },
  pending:  { label: "Pending",  colorClass: "status-pending",  Icon: Clock },
  flagged:  { label: "Flagged",  colorClass: "status-flagged",  Icon: AlertTriangle },
};

const AuditsPage = () => {
  const [activeTab, setActiveTab] = useState("training");
  const [searchQuery, setSearchQuery] = useState("");
  const [vesselFilter, setVesselFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState("training");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadVessel, setUploadVessel] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (title, description, variant = "default") => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredReports = mockReports.filter(
    (r) =>
      r.type === activeTab &&
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (vesselFilter === "all" || r.vessel === vesselFilter)
  );

  const stats = {
    training: {
      total: mockReports.filter(r => r.type === "training").length,
      reviewed: mockReports.filter(r => r.type === "training" && r.status === "reviewed").length,
    },
    vapt: {
      total: mockReports.filter(r => r.type === "vapt").length,
      flagged: mockReports.filter(r => r.type === "vapt" && r.status === "flagged").length,
    },
    phishing: {
      total: mockReports.filter(r => r.type === "phishing").length,
      pending: mockReports.filter(r => r.type === "phishing" && r.status === "pending").length,
    },
  };

  const handleUpload = () => {
    if (!uploadTitle || !selectedFile || !uploadVessel) {
      showToast("Missing Fields", "Please fill in all fields and select a file.", "destructive");
      return;
    }
    showToast("Report Uploaded ✅", `"${uploadTitle}" for ${uploadVessel} has been uploaded successfully.`);
    setUploadOpen(false);
    setUploadTitle("");
    setUploadVessel("");
    setSelectedFile(null);
  };

  const handleDelete = (report) => {
    showToast("Report Deleted", `"${report.title}" has been removed.`);
  };

  return (
    <div className="audits-page">
      {/* Toast */}
      {toast && (
        <div className={`audits-toast ${toast.variant === "destructive" ? "audits-toast--error" : ""}`}>
          <strong>{toast.title}</strong>
          <span>{toast.description}</span>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="audits-header"
      >
        <div>
          <h1 className="audits-title">
            <Shield className="audits-title-icon" />
            Audit Reports
          </h1>
          <p className="audits-subtitle">Manage and review all compliance and security reports vessel-wise</p>
        </div>
        <button className="audits-btn-primary" onClick={() => setUploadOpen(true)}>
          <Upload size={16} /> Upload Report
        </button>
      </motion.div>

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="audits-modal-overlay" onClick={() => setUploadOpen(false)}>
          <div className="audits-modal" onClick={e => e.stopPropagation()}>
            <div className="audits-modal-header">
              <h2 className="audits-modal-title">Upload New Report</h2>
              <button className="audits-modal-close" onClick={() => setUploadOpen(false)}>×</button>
            </div>
            <div className="audits-modal-body">
              <div className="audits-form-group">
                <label className="audits-label">Report Type</label>
                <div className="audits-type-btns">
                  {["training", "vapt", "phishing"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setUploadType(t)}
                      className={`audits-type-btn ${uploadType === t ? "audits-type-btn--active" : ""}`}
                    >
                      {t === "training" ? "Training" : t === "vapt" ? "VAPT" : "Phishing Drill"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="audits-form-group">
                <label className="audits-label">Report Title</label>
                <input
                  className="audits-input"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Q1 Safety Training Report"
                />
              </div>
              <div className="audits-form-group">
                <label className="audits-label">
                  <Ship size={14} /> Vessel
                </label>
                <select
                  className="audits-select"
                  value={uploadVessel}
                  onChange={(e) => setUploadVessel(e.target.value)}
                >
                  <option value="">Select vessel...</option>
                  {vesselList.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="audits-form-group">
                <label className="audits-label">Select File</label>
                <div className="audits-file-drop">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="audits-file-input"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="audits-file-label">
                    <Upload size={32} className="audits-file-icon" />
                    {selectedFile ? (
                      <p className="audits-file-name">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="audits-file-text">Click to upload or drag & drop</p>
                        <p className="audits-file-hint">PDF, DOC, XLS, CSV (Max 20MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <button className="audits-btn-primary audits-btn-full" onClick={handleUpload}>
                <Upload size={16} /> Upload Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="audits-stats-grid"
      >
        <div className="audits-stat-card">
          <div className="audits-stat-icon audits-stat-icon--primary">
            <FileText size={24} className="audits-stat-icon-svg--primary" />
          </div>
          <div>
            <p className="audits-stat-value">{stats.training.total}</p>
            <p className="audits-stat-label">Training Reports</p>
            <p className="audits-stat-sub audits-stat-sub--green">{stats.training.reviewed} reviewed</p>
          </div>
        </div>
        <div className="audits-stat-card">
          <div className="audits-stat-icon audits-stat-icon--red">
            <Shield size={24} className="audits-stat-icon-svg--red" />
          </div>
          <div>
            <p className="audits-stat-value">{stats.vapt.total}</p>
            <p className="audits-stat-label">VAPT Reports</p>
            <p className="audits-stat-sub audits-stat-sub--red">{stats.vapt.flagged} flagged</p>
          </div>
        </div>
        <div className="audits-stat-card">
          <div className="audits-stat-icon audits-stat-icon--amber">
            <AlertTriangle size={24} className="audits-stat-icon-svg--amber" />
          </div>
          <div>
            <p className="audits-stat-value">{stats.phishing.total}</p>
            <p className="audits-stat-label">Phishing Drill Reports</p>
            <p className="audits-stat-sub audits-stat-sub--amber">{stats.phishing.pending} pending review</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs & Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="audits-card"
      >
        <div className="audits-card-header">
          <div className="audits-toolbar">
            <div className="audits-tabs">
              {[
                { key: "training", Icon: FileText, label: "Training" },
                { key: "vapt", Icon: Shield, label: "VAPT" },
                { key: "phishing", Icon: AlertTriangle, label: "Phishing Drill" },
              ].map(({ key, Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`audits-tab ${activeTab === key ? "audits-tab--active" : ""}`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
            <div className="audits-filters">
              <div className="audits-search-wrap">
                <Search size={16} className="audits-search-icon" />
                <input
                  className="audits-input audits-input--search"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="audits-select"
                value={vesselFilter}
                onChange={(e) => setVesselFilter(e.target.value)}
              >
                <option value="all">All Vessels</option>
                {vesselList.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="audits-table-wrap">
          <table className="audits-table">
            <thead>
              <tr className="audits-thead-row">
                <th>Report ID</th>
                <th>Title</th>
                <th><span className="audits-th-vessel"><Ship size={14} /> Vessel</span></th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Size</th>
                <th>Status</th>
                <th className="audits-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="audits-empty-cell">
                    <FileText size={40} className="audits-empty-icon" />
                    <p>No reports found</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, i) => {
                  const st = statusConfig[report.status];
                  const StIcon = st.Icon;
                  return (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="audits-tr"
                    >
                      <td className="audits-td-mono">{report.id}</td>
                      <td className="audits-td-title">{report.title}</td>
                      <td>
                        <span className="audits-vessel-badge">
                          <Ship size={12} /> {report.vessel}
                        </span>
                      </td>
                      <td className="audits-td-muted">{report.uploadedBy}</td>
                      <td className="audits-td-muted">{report.uploadDate}</td>
                      <td className="audits-td-muted">{report.fileSize}</td>
                      <td>
                        <span className={`audits-status-badge ${st.colorClass}`}>
                          <StIcon size={12} /> {st.label}
                        </span>
                      </td>
                      <td className="audits-td-actions">
                        <div className="audits-action-btns">
                          <button onClick={() => setPreviewReport(report)} className="audits-action-btn">
                            <Eye size={16} />
                          </button>
                          <button className="audits-action-btn">
                            <Download size={16} />
                          </button>
                          <button onClick={() => handleDelete(report)} className="audits-action-btn audits-action-btn--danger">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Preview Modal */}
      {previewReport && (
        <div className="audits-modal-overlay" onClick={() => setPreviewReport(null)}>
          <div className="audits-modal" onClick={e => e.stopPropagation()}>
            <div className="audits-modal-header">
              <h2 className="audits-modal-title">Report Details</h2>
              <button className="audits-modal-close" onClick={() => setPreviewReport(null)}>×</button>
            </div>
            <div className="audits-modal-body">
              <div className="audits-preview-grid">
                {[
                  { label: "Report ID", value: previewReport.id },
                  { label: "Title", value: previewReport.title },
                  { label: "Uploaded By", value: previewReport.uploadedBy },
                  { label: "Upload Date", value: previewReport.uploadDate },
                  { label: "File Size", value: previewReport.fileSize },
                ].map((row) => (
                  <div key={row.label} className="audits-preview-row">
                    <span className="audits-preview-label">{row.label}</span>
                    <span className="audits-preview-value">{row.value}</span>
                  </div>
                ))}
                <div className="audits-preview-row">
                  <span className="audits-preview-label">Vessel</span>
                  <span className="audits-vessel-badge">
                    <Ship size={12} /> {previewReport.vessel}
                  </span>
                </div>
                <div className="audits-preview-row">
                  <span className="audits-preview-label">Status</span>
                  <span className={`audits-status-badge ${statusConfig[previewReport.status].colorClass}`}>
                    {statusConfig[previewReport.status].label}
                  </span>
                </div>
              </div>
              <div className="audits-preview-actions">
                <button className="audits-btn-primary">
                  <Download size={16} /> Download
                </button>
                <button className="audits-btn-outline" onClick={() => {
                  showToast("Status Updated", "Report marked as reviewed.");
                  setPreviewReport(null);
                }}>
                  <CheckCircle2 size={16} /> Mark Reviewed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditsPage;