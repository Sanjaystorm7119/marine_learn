import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Search,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Clock,
  Ship,
  ArrowLeft,
  FileSpreadsheet,
  FileCheck2,
  ClipboardList,
  Briefcase,
  Filter,
  Plus,
} from "lucide-react";
import "../pages/Audits.css";

// ── VAPT category definitions ─────────────────────────────────────────────────
const vaptCategories = [
  {
    key: "technical",
    label: "Technical Summary",
    Icon: FileCheck2,
    color: "vapt-icon--sky",
    accept: ".pdf,.doc,.docx",
  },
  {
    key: "executive",
    label: "Executive Summary",
    Icon: Briefcase,
    color: "vapt-icon--violet",
    accept: ".pdf,.doc,.docx",
  },
  {
    key: "remediation",
    label: "Remediation Plan",
    Icon: ClipboardList,
    color: "vapt-icon--amber",
    accept: ".pdf,.doc,.docx",
  },
  {
    key: "excel",
    label: "Findings Excel",
    Icon: FileSpreadsheet,
    color: "vapt-icon--emerald",
    accept: ".xls,.xlsx,.csv",
  },
];

const vesselList = [
  { name: "MV Ocean Star", type: "Tanker" },
  { name: "MV Sea Falcon", type: "Bulk Carrier" },
  { name: "MV Pacific Voyager", type: "Container" },
  { name: "MV Atlantic Pioneer", type: "LNG" },
  { name: "MV Indian Explorer", type: "Offshore Supply" },
];

const statusConfig = {
  reviewed: {
    label: "Reviewed",
    colorClass: "status-reviewed",
    Icon: CheckCircle2,
  },
  pending: { label: "Pending", colorClass: "status-pending", Icon: Clock },
  flagged: {
    label: "Flagged",
    colorClass: "status-flagged",
    Icon: AlertTriangle,
  },
};

const AuditsPage = () => {
  const [activeTab, setActiveTab] = useState("vapt");
  const [activeVesselTab, setActiveVesselTab] = useState("vapt");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState("training");
  const [uploadVaptCategory, setUploadVaptCategory] = useState("technical");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadVessel, setUploadVessel] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedVessel, setSelectedVessel] = useState(vesselList[0].name);
  const [vesselSearch, setVesselSearch] = useState("");

  // --- BACKEND STATES ---
  const [reports, setReports] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/audits/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const showToast = (title, description, variant = "default") => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3000);
  };

  const stats = {
    training: {
      total: reports.filter((r) => r.type === "training").length,
      reviewed: reports.filter(
        (r) => r.type === "training" && r.status === "reviewed"
      ).length,
    },
    vapt: {
      total: reports.filter((r) => r.type === "vapt").length,
      flagged: reports.filter(
        (r) => r.type === "vapt" && r.status === "flagged"
      ).length,
    },
    phishing: {
      total: reports.filter((r) => r.type === "phishing").length,
      pending: reports.filter(
        (r) => r.type === "phishing" && r.status === "pending"
      ).length,
    },
  };

  // Filtered vessels for sidebar
  const filteredVessels = vesselList.filter((v) =>
    v.name.toLowerCase().includes(vesselSearch.toLowerCase())
  );

  // Get reports for current vessel + tab
  const vesselReportsForTab = (vessel, tab) =>
    reports.filter(
      (r) => r.vessel === vessel && r.type === tab
    );

  // VAPT helpers
  const vaptReportsForVessel = (vessel) =>
    vaptCategories.map((cat) => ({
      category: cat,
      report:
        reports.find(
          (r) =>
            r.type === "vapt" &&
            r.vessel === vessel &&
            r.vaptCategory === cat.key
        ) || null,
    }));

  const getVesselVaptCount = (vesselName) =>
    reports.filter((r) => r.type === "vapt" && r.vessel === vesselName).length;

  const getVesselVaptProgress = (vesselName) =>
    (getVesselVaptCount(vesselName) / 4) * 100;

  const getVesselFlagged = (vesselName) =>
    reports.some(
      (r) => r.type === "vapt" && r.vessel === vesselName && r.status === "flagged"
    );

  const handleUpload = async () => {
    if (!uploadTitle || !selectedFile || !uploadVessel) {
      showToast("Missing Fields", "Please fill in all fields and select a file.", "destructive");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", uploadTitle);
    formData.append("report_type", uploadType);
    formData.append("vessel", uploadVessel);
    if (uploadType === "vapt") {
      formData.append("vapt_category", uploadVaptCategory);
    }
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/audits/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const newReport = await response.json();
        setReports([newReport, ...reports]);
        const catLabel =
          uploadType === "vapt"
            ? ` (${(vaptCategories.find((c) => c.key === uploadVaptCategory) || {}).label || ""})`
            : "";
        showToast("Report Uploaded ✅", `"${uploadTitle}"${catLabel} for ${uploadVessel} uploaded successfully.`);
        setUploadOpen(false);
        setUploadTitle("");
        setUploadVessel("");
        setSelectedFile(null);
      } else {
        const errData = await response.json();
        showToast("Upload Failed", errData.detail || "Something went wrong", "destructive");
      }
    } catch (error) {
      showToast("Upload Error", "Could not connect to server", "destructive");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (report) => {
    if (!window.confirm(`Are you sure you want to delete "${report.title}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/audits/${report.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setReports(reports.filter((r) => r.id !== report.id));
        showToast("Report Deleted", `"${report.title}" has been removed.`);
        if (previewReport && previewReport.id === report.id) setPreviewReport(null);
      } else {
        showToast("Error", "Failed to delete report", "destructive");
      }
    } catch (error) {
      showToast("Error", "Could not connect to server", "destructive");
    }
  };

  const handleAction = async (reportId, actionType) => {
    try {
      const token = localStorage.getItem("token");
      showToast("Please wait", `Generating secure ${actionType} link...`);
      const response = await fetch(`http://127.0.0.1:8000/audits/${reportId}/links`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const links = await response.json();
        if (actionType === "view") window.open(links.viewUrl, "_blank");
        else if (actionType === "download") window.open(links.downloadUrl, "_blank");
      } else {
        showToast("Error", "Could not fetch secure file link", "destructive");
      }
    } catch (error) {
      showToast("Error", "Could not connect to server", "destructive");
    }
  };

  const openUploadFor = (type, vessel, category) => {
    setUploadType(type);
    if (vessel) setUploadVessel(vessel);
    if (category) setUploadVaptCategory(category);
    setUploadOpen(true);
  };

  const currentAccept =
    uploadType === "vapt"
      ? (vaptCategories.find((c) => c.key === uploadVaptCategory) || {}).accept || ".pdf,.doc,.docx"
      : ".pdf,.doc,.docx,.xls,.xlsx,.csv";

  const fileHint =
    uploadType === "vapt" && uploadVaptCategory === "excel"
      ? "XLS, XLSX, CSV (Max 20MB)"
      : "PDF, DOC, DOCX (Max 20MB)";

  // Current vessel data
  const currentVesselObj = vesselList.find((v) => v.name === selectedVessel);
  const currentVaptCount = getVesselVaptCount(selectedVessel);
  const currentVaptProgress = getVesselVaptProgress(selectedVessel);

  // Training / phishing reports for current vessel
  const vesselTabReports = vesselReportsForTab(selectedVessel, activeVesselTab).filter(
    (r) => r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="ap-root">
      {/* Toast */}
      {toast && (
        <div className={`ap-toast ${toast.variant === "destructive" ? "ap-toast--err" : ""}`}>
          <strong>{toast.title}</strong>
          <span>{toast.description}</span>
        </div>
      )}

      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="ap-page-header">
        <div className="ap-page-header-left">
          <Shield size={20} className="ap-header-icon" />
          <div>
            <h1 className="ap-page-title">Audit Reports</h1>
            <p className="ap-page-sub">Fleet-wide compliance, VAPT and security drill reports — organised vessel-wise.</p>
          </div>
        </div>
        <div className="ap-page-header-right">
          <span className="ap-fleet-badge">
            <Ship size={14} /> {vesselList.length} vessels
          </span>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <div className="ap-stats-row">
        <div className="ap-stat-card">
          <div className="ap-stat-icon ap-stat-icon--blue"><FileText size={18} /></div>
          <div>
            <p className="ap-stat-num">{stats.training.total || 30}</p>
            <p className="ap-stat-name">Training Reports</p>
            <p className="ap-stat-hint ap-stat-hint--muted">across fleet</p>
          </div>
        </div>
        <div className="ap-stat-card">
          <div className="ap-stat-icon ap-stat-icon--red"><Shield size={18} /></div>
          <div>
            <p className="ap-stat-num">{stats.vapt.total || 240}</p>
            <p className="ap-stat-name">VAPT Reports</p>
            <p className="ap-stat-hint ap-stat-hint--red">{stats.vapt.flagged || 12} flagged</p>
          </div>
        </div>
        <div className="ap-stat-card">
          <div className="ap-stat-icon ap-stat-icon--amber"><AlertTriangle size={18} /></div>
          <div>
            <p className="ap-stat-num">{stats.phishing.total || 15}</p>
            <p className="ap-stat-name">Phishing Drills</p>
            <p className="ap-stat-hint ap-stat-hint--muted">campaigns logged</p>
          </div>
        </div>
        <div className="ap-stat-card">
          <div className="ap-stat-icon ap-stat-icon--green"><CheckCircle2 size={18} /></div>
          <div>
            <p className="ap-stat-num">50%</p>
            <p className="ap-stat-name">Fleet Coverage</p>
            <p className="ap-stat-hint ap-stat-hint--muted">VAPT completion</p>
          </div>
        </div>
      </div>

      {/* ── Main split layout ──────────────────────────────────── */}
      <div className="ap-split">
        {/* LEFT — Vessel Sidebar */}
        <aside className="ap-sidebar">
          <div className="ap-sidebar-header">
            <span className="ap-sidebar-title">
              <Filter size={14} /> Vessels
            </span>
            <span className="ap-sidebar-count">{vesselList.length}/{vesselList.length}</span>
          </div>
          <div className="ap-sidebar-search-wrap">
            <Search size={14} className="ap-sidebar-search-icon" />
            <input
              className="ap-sidebar-search"
              placeholder="Search vessel..."
              value={vesselSearch}
              onChange={(e) => setVesselSearch(e.target.value)}
            />
          </div>
          <div className="ap-vessel-list">
            {filteredVessels.map((v) => {
              const prog = getVesselVaptProgress(v.name);
              const isFlagged = getVesselFlagged(v.name);
              const count = getVesselVaptCount(v.name);
              const isActive = selectedVessel === v.name;
              return (
                <button
                  key={v.name}
                  className={`ap-vessel-item ${isActive ? "ap-vessel-item--active" : ""}`}
                  onClick={() => setSelectedVessel(v.name)}
                >
                  <div className="ap-vessel-item-top">
                    <div className="ap-vessel-item-icon">
                      <Ship size={14} />
                    </div>
                    <div className="ap-vessel-item-info">
                      <span className="ap-vessel-item-name">{v.name}</span>
                      <span className="ap-vessel-item-type">
                        {v.type} · {count}/4 reports
                      </span>
                    </div>
                    {isFlagged && (
                      <span className="ap-vessel-flag-dot" title="Has flagged reports" />
                    )}
                  </div>
                  <div className="ap-vessel-progress-track">
                    <div
                      className={`ap-vessel-progress-bar ${
                        prog === 0
                          ? "ap-prog--zero"
                          : prog < 50
                          ? "ap-prog--low"
                          : prog < 100
                          ? "ap-prog--mid"
                          : "ap-prog--full"
                      }`}
                      style={{ width: `${prog}%` }}
                    />
                  </div>
                  <span className="ap-vessel-prog-label">{Math.round(prog)}% VAPT coverage</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT — Content Panel */}
        <main className="ap-content">
          {/* Content header */}
          <div className="ap-content-header">
            <div className="ap-content-vessel-row">
              <div className="ap-content-vessel-icon">
                <Ship size={20} />
              </div>
              <div>
                <h2 className="ap-content-vessel-name">{selectedVessel}</h2>
                <p className="ap-content-vessel-sub">
                  {currentVesselObj?.type} · {currentVaptCount}/4 VAPT reports uploaded
                </p>
              </div>
            </div>

            {/* Tab row + upload button */}
            <div className="ap-content-toolbar">
              <div className="ap-content-tabs">
                {[
                  { key: "training", Icon: FileText, label: "Training" },
                  { key: "vapt", Icon: Shield, label: "VAPT" },
                  { key: "phishing", Icon: AlertTriangle, label: "Phishing" },
                ].map(({ key, Icon, label }) => (
                  <button
                    key={key}
                    className={`ap-content-tab ${activeVesselTab === key ? "ap-content-tab--active" : ""}`}
                    onClick={() => setActiveVesselTab(key)}
                  >
                    <Icon size={13} /> {label}
                  </button>
                ))}
              </div>
              <button
                className="ap-upload-btn"
                onClick={() => openUploadFor(activeVesselTab, selectedVessel, "technical")}
              >
                <Upload size={14} />
                Upload {activeVesselTab === "vapt" ? "VAPT" : activeVesselTab === "training" ? "Training" : "Phishing"} Report
              </button>
            </div>
          </div>

          {/* Search bar (training/phishing) */}
          {activeVesselTab !== "vapt" && (
            <div className="ap-content-search-row">
              <div className="ap-content-search-wrap">
                <Search size={14} className="ap-content-search-icon" />
                <input
                  className="ap-content-search"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── VAPT content ─────────────────────────────────────────── */}
          {activeVesselTab === "vapt" && (
            <div className="ap-vapt-section">
              <div className="ap-vapt-section-title">
                VAPT Reports ({currentVaptCount}/4)
              </div>
              <div className="ap-vapt-table">
                <div className="ap-vapt-table-head">
                  <span>Report Type</span>
                  <span>File Name</span>
                  <span>Uploaded By</span>
                  <span>Date</span>
                  <span>Size</span>
                  <span>Status</span>
                  <span className="ap-col-right">Actions</span>
                </div>
                {vaptReportsForVessel(selectedVessel).map(({ category, report }) => {
                  const Icon = category.Icon;
                  const st = report ? statusConfig[report.status] : null;
                  const StIcon = st?.Icon;
                  return (
                    <div key={category.key} className="ap-vapt-table-row">
                      <div className="ap-vapt-type-cell">
                        <div className={`ap-vapt-type-icon`}>
                          <Icon size={15} className={category.color} />
                        </div>
                        <span className="ap-vapt-type-label">{category.label}</span>
                      </div>
                      <span className={`ap-vapt-filename ${!report ? "ap-muted-dash" : ""}`}>
                        {report ? report.title : "Not uploaded"}
                      </span>
                      <span className="ap-vapt-meta">{report?.uploadedBy || "—"}</span>
                      <span className="ap-vapt-meta">{report?.uploadDate || "—"}</span>
                      <span className="ap-vapt-meta">{report?.fileSize || "—"}</span>
                      <span>
                        {st && StIcon ? (
                          <span className={`ap-status-badge ${st.colorClass}`}>
                            <StIcon size={11} /> {st.label}
                          </span>
                        ) : (
                          <span className="ap-vapt-meta">—</span>
                        )}
                      </span>
                      <div className="ap-vapt-actions ap-col-right">
                        {report ? (
                          <>
                            <button
                              className="ap-icon-btn"
                              title="View"
                              onClick={() => handleAction(report.id, "view")}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              className="ap-icon-btn"
                              title="Download"
                              onClick={() => handleAction(report.id, "download")}
                            >
                              <Download size={15} />
                            </button>
                            <button
                              className="ap-icon-btn ap-icon-btn--danger"
                              title="Delete"
                              onClick={() => handleDelete(report)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <button
                            className="ap-upload-inline-btn"
                            onClick={() =>
                              openUploadFor("vapt", selectedVessel, category.key)
                            }
                          >
                            <Plus size={13} /> Upload
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Training / Phishing content ───────────────────────────── */}
          {activeVesselTab !== "vapt" && (
            <div className="ap-table-section">
              <table className="ap-table">
                <thead>
                  <tr className="ap-thead-row">
                    <th>Report ID</th>
                    <th>Title</th>
                    <th>Uploaded By</th>
                    <th>Date</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th className="ap-th-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vesselTabReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="ap-empty-cell">
                        <FileText size={32} className="ap-empty-icon" />
                        <p>No reports found for this vessel</p>
                      </td>
                    </tr>
                  ) : (
                    vesselTabReports.map((report, i) => {
                      const st = statusConfig[report.status];
                      const StIcon = st.Icon;
                      return (
                        <motion.tr
                          key={report.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="ap-tr"
                        >
                          <td className="ap-td-mono">{report.id}</td>
                          <td className="ap-td-title">{report.title}</td>
                          <td className="ap-td-muted">{report.uploadedBy}</td>
                          <td className="ap-td-muted">{report.uploadDate}</td>
                          <td className="ap-td-muted">{report.fileSize}</td>
                          <td>
                            <span className={`ap-status-badge ${st.colorClass}`}>
                              <StIcon size={11} /> {st.label}
                            </span>
                          </td>
                          <td className="ap-td-actions">
                            <div className="ap-action-btns">
                              <button
                                className="ap-icon-btn"
                                onClick={() => handleAction(report.id, "view")}
                                title="View"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                className="ap-icon-btn"
                                onClick={() => handleAction(report.id, "download")}
                                title="Download"
                              >
                                <Download size={15} />
                              </button>
                              <button
                                className="ap-icon-btn ap-icon-btn--danger"
                                onClick={() => handleDelete(report)}
                              >
                                <Trash2 size={15} />
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
          )}
        </main>
      </div>

      {/* ── Upload Modal ───────────────────────────────────────── */}
      {uploadOpen && (
        <div className="ap-modal-overlay" onClick={() => setUploadOpen(false)}>
          <motion.div
            className="ap-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
            <div className="ap-modal-header">
              <h2 className="ap-modal-title">Upload New Report</h2>
              <button className="ap-modal-close" onClick={() => setUploadOpen(false)}>×</button>
            </div>
            <div className="ap-modal-body">
              <div className="ap-form-group">
                <label className="ap-label">Report Type</label>
                <div className="ap-type-btns">
                  {["training", "vapt", "phishing"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setUploadType(t)}
                      className={`ap-type-btn ${uploadType === t ? "ap-type-btn--active" : ""}`}
                    >
                      {t === "training" ? "Training" : t === "vapt" ? "VAPT" : "Phishing Drill"}
                    </button>
                  ))}
                </div>
              </div>

              {uploadType === "vapt" && (
                <div className="ap-form-group">
                  <label className="ap-label">VAPT Category</label>
                  <div className="ap-vapt-cat-grid">
                    {vaptCategories.map((cat) => {
                      const Icon = cat.Icon;
                      const active = uploadVaptCategory === cat.key;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => setUploadVaptCategory(cat.key)}
                          className={`ap-vapt-cat-btn ${active ? "ap-vapt-cat-btn--active" : ""}`}
                        >
                          <Icon size={15} className={cat.color} />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="ap-form-group">
                <label className="ap-label">Report Title</label>
                <input
                  className="ap-input"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Q1 VAPT Technical Summary"
                />
              </div>

              <div className="ap-form-group">
                <label className="ap-label"><Ship size={13} /> Vessel</label>
                <select
                  className="ap-select"
                  value={uploadVessel}
                  onChange={(e) => setUploadVessel(e.target.value)}
                >
                  <option value="">Select vessel...</option>
                  {vesselList.map((v) => (
                    <option key={v.name} value={v.name}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="ap-form-group">
                <label className="ap-label">Select File</label>
                <div className="ap-file-drop">
                  <input
                    type="file"
                    accept={currentAccept}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="ap-file-input"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="ap-file-label">
                    <Upload size={28} className="ap-file-icon" />
                    {selectedFile ? (
                      <p className="ap-file-name">{selectedFile.name}</p>
                    ) : (
                      <>
                        <p className="ap-file-text">Click to upload or drag & drop</p>
                        <p className="ap-file-hint">{fileHint}</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button
                className="ap-btn-primary ap-btn-full"
                onClick={handleUpload}
                disabled={isUploading}
                style={{ opacity: isUploading ? 0.7 : 1 }}
              >
                <Upload size={15} />
                {isUploading ? "Uploading to SharePoint..." : "Upload Report"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Preview Modal ──────────────────────────────────────── */}
      {previewReport && (
        <div className="ap-modal-overlay" onClick={() => setPreviewReport(null)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <h2 className="ap-modal-title">Report Details</h2>
              <button className="ap-modal-close" onClick={() => setPreviewReport(null)}>×</button>
            </div>
            <div className="ap-modal-body">
              <div className="ap-preview-grid">
                {[
                  { label: "Report ID", value: previewReport.id },
                  { label: "Title", value: previewReport.title },
                  { label: "Uploaded By", value: previewReport.uploadedBy },
                  { label: "Upload Date", value: previewReport.uploadDate },
                  { label: "File Size", value: previewReport.fileSize },
                ].map((row) => (
                  <div key={row.label} className="ap-preview-row">
                    <span className="ap-preview-label">{row.label}</span>
                    <span className="ap-preview-value">{row.value}</span>
                  </div>
                ))}
                {previewReport.vaptCategory && (
                  <div className="ap-preview-row">
                    <span className="ap-preview-label">Category</span>
                    <span className="ap-preview-value">
                      {(vaptCategories.find((c) => c.key === previewReport.vaptCategory) || {}).label}
                    </span>
                  </div>
                )}
                <div className="ap-preview-row">
                  <span className="ap-preview-label">Vessel</span>
                  <span className="ap-vessel-badge"><Ship size={11} /> {previewReport.vessel}</span>
                </div>
                <div className="ap-preview-row">
                  <span className="ap-preview-label">Status</span>
                  <span className={`ap-status-badge ${statusConfig[previewReport.status].colorClass}`}>
                    {statusConfig[previewReport.status].label}
                  </span>
                </div>
              </div>
              <div className="ap-preview-actions">
                <button className="ap-btn-primary" onClick={() => handleAction(previewReport.id, "download")}>
                  <Download size={15} /> Download
                </button>
                <button
                  className="ap-btn-outline"
                  onClick={() => {
                    showToast("Status Updated", "Report marked as reviewed.");
                    setPreviewReport(null);
                  }}
                >
                  <CheckCircle2 size={15} /> Mark Reviewed
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