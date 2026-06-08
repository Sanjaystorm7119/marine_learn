import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit, Trash2, Ship, Users as UsersIcon,
  CheckCircle2, XCircle, Anchor as AnchorIcon, X,
} from "lucide-react";
import "../pages/VesselManagement.css";

// ─── Static Data ──────────────────────────────────────────────────────────────

const allUsers = [
  { id: 1,  name: "Capt. John Doe",   email: "john@marinelearn.com",       role: "master"  },
  { id: 2,  name: "Arjun M",          email: "arjun.m@marinelearn.com",    role: "officer" },
  { id: 3,  name: "Priya S",          email: "priya.s@marinelearn.com",    role: "officer" },
  { id: 4,  name: "Vikram R",         email: "vikram.r@marinelearn.com",   role: "crew"    },
  { id: 5,  name: "Lakshmi K",        email: "lakshmi.k@marinelearn.com",  role: "crew"    },
  { id: 6,  name: "Rupa N",           email: "rupa@marinelearn.com",       role: "crew"    },
  { id: 7,  name: "Capt. Ravi Menon", email: "ravi.menon@marinelearn.com", role: "master"  },
  { id: 8,  name: "Karthik V",        email: "karthik@marinelearn.com",    role: "officer" },
  { id: 9,  name: "Suresh B",         email: "suresh@marinelearn.com",     role: "crew"    },
  { id: 10, name: "Anjali R",         email: "anjali@marinelearn.com",     role: "crew"    },
];

const initialVessels = [
  { id: 1, name: "MV Ocean Star",      type: "Tanker",       status: "active",   assignedUserIds: [1, 2, 4, 5] },
  { id: 2, name: "MV Pacific Voyager", type: "Container",    status: "active",   assignedUserIds: [7, 3, 6, 9] },
  { id: 3, name: "MV Indian Explorer", type: "Bulk Carrier", status: "inactive", assignedUserIds: [8, 10]       },
  { id: 4, name: "MV Arctic Aurora",   type: "LNG",          status: "active",   assignedUserIds: [1, 8, 9, 10] },
];

const roleBadgeClass = {
  master:  "vm-role-master",
  officer: "vm-role-officer",
  crew:    "vm-role-crew",
};

const vesselTypes = ["Tanker", "Bulk Carrier", "Container", "LNG", "Offshore Supply", "Ro-Ro"];

// ─── Toast (simple inline) ────────────────────────────────────────────────────

const useSimpleToast = () => {
  const [toasts, setToasts] = useState([]);
  const toast = ({ title, description, variant }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };
  return { toast, toasts };
};

const ToastContainer = ({ toasts }) => (
  <div className="vm-toast-container">
    <AnimatePresence>
      {toasts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className={`vm-toast ${t.variant === "destructive" ? "vm-toast-error" : "vm-toast-success"}`}
        >
          <p className="vm-toast-title">{t.title}</p>
          {t.description && <p className="vm-toast-desc">{t.description}</p>}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── VesselManagement ─────────────────────────────────────────────────────────

const VesselManagement = () => {
  const navigate = useNavigate();
  const { toast, toasts } = useSimpleToast();

  const [vessels, setVessels]           = useState(initialVessels);
  const [search, setSearch]             = useState("");
  const [formOpen, setFormOpen]         = useState(false);
  const [editing, setEditing]           = useState(null);
  const [form, setForm]                 = useState({ name: "", type: "Tanker", status: "active" });
  const [assignOpen, setAssignOpen]     = useState(false);
  const [assignVessel, setAssignVessel] = useState(null);
  const [assignSelected, setAssignSelected] = useState([]);
  const [userSearch, setUserSearch]     = useState("");

  // ── filtered vessels ──
  const filtered = useMemo(
    () => vessels.filter(v =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.type.toLowerCase().includes(search.toLowerCase())
    ),
    [vessels, search]
  );

  // ── Add / Edit ──
  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", type: "Tanker", status: "active" });
    setFormOpen(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({ name: v.name, type: v.type, status: v.status });
    setFormOpen(true);
  };

  const saveVessel = () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", description: "Please enter a vessel name.", variant: "destructive" });
      return;
    }
    if (editing) {
      setVessels(prev => prev.map(v => v.id === editing.id ? { ...v, ...form } : v));
      toast({ title: "Vessel updated", description: `${form.name} saved.` });
    } else {
      const id = (vessels[vessels.length - 1]?.id ?? 0) + 1;
      setVessels(prev => [...prev, { id, ...form, assignedUserIds: [] }]);
      toast({ title: "Vessel added", description: `${form.name} created.` });
    }
    setFormOpen(false);
  };

  const deleteVessel = (id) => {
    setVessels(prev => prev.filter(v => v.id !== id));
    toast({ title: "Vessel deleted" });
  };

  // ── Assign Users ──
  const openAssign = (v) => {
    setAssignVessel(v);
    setAssignSelected([...v.assignedUserIds]);
    setUserSearch("");
    setAssignOpen(true);
  };

  const toggleUser = (uid) => {
    setAssignSelected(prev =>
      prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid]
    );
  };

  const saveAssignments = () => {
    if (!assignVessel) return;
    setVessels(prev =>
      prev.map(v => v.id === assignVessel.id ? { ...v, assignedUserIds: assignSelected } : v)
    );
    toast({
      title: "Crew assigned",
      description: `${assignSelected.length} user(s) linked to ${assignVessel.name}.`,
    });
    setAssignOpen(false);
  };

  const filteredAssignUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return allUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [userSearch]);

  const groupedUsers = useMemo(() => ({
    master:  filteredAssignUsers.filter(u => u.role === "master"),
    officer: filteredAssignUsers.filter(u => u.role === "officer"),
    crew:    filteredAssignUsers.filter(u => u.role === "crew"),
  }), [filteredAssignUsers]);

  // ── Stats ──
  const stats = [
    { label: "Total Vessels",       value: vessels.length,                                             iconEl: <Ship className="vm-stat-icon" />,         cls: "vm-stat-blue"    },
    { label: "Active",              value: vessels.filter(v => v.status === "active").length,          iconEl: <CheckCircle2 className="vm-stat-icon" />,  cls: "vm-stat-green"   },
    { label: "Inactive",            value: vessels.filter(v => v.status === "inactive").length,        iconEl: <XCircle className="vm-stat-icon" />,       cls: "vm-stat-amber"   },
    { label: "Total Crew Assigned", value: vessels.reduce((a, v) => a + v.assignedUserIds.length, 0),  iconEl: <UsersIcon className="vm-stat-icon" />,     cls: "vm-stat-violet"  },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} />

      <div className="vm-page">

        {/* ── Header ── */}
        <div className="vm-header">
          <div>
            <h1 className="vm-title">
              <Ship className="vm-title-icon" />
              Vessel Management
            </h1>
            <p className="vm-breadcrumb">
              <span className="vm-breadcrumb-link" onClick={() => navigate("/admin")}>Home</span>
              {" / "}
              <span>Vessel Management</span>
            </p>
          </div>
          <button className="vm-add-btn" onClick={openAdd}>
            <Plus className="vm-btn-icon" /> Add New Vessel
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="vm-stats-grid">
          {stats.map(s => (
            <div key={s.label} className="vm-stat-card">
              <div className={`vm-stat-icon-wrap ${s.cls}`}>{s.iconEl}</div>
              <div>
                <p className="vm-stat-label">{s.label}</p>
                <p className="vm-stat-value">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="vm-search-card">
          <div className="vm-search-wrap">
            <Search className="vm-search-icon" />
            <input
              className="vm-search-input"
              placeholder="Search vessel by name or type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="vm-table-card">
          <div className="vm-table-scroll">
            <table className="vm-table">
              <thead>
                <tr className="vm-thead-row">
                  <th className="vm-th">Vessel</th>
                  <th className="vm-th">Type</th>
                  <th className="vm-th">Assigned Crew</th>
                  <th className="vm-th">Status</th>
                  <th className="vm-th vm-th-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const crew = allUsers.filter(u => v.assignedUserIds.includes(u.id));
                  const counts = {
                    master:  crew.filter(c => c.role === "master").length,
                    officer: crew.filter(c => c.role === "officer").length,
                    crew:    crew.filter(c => c.role === "crew").length,
                  };
                  return (
                    <motion.tr
                      key={v.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="vm-tr"
                    >
                      <td className="vm-td">
                        <div className="vm-vessel-cell">
                          <div className="vm-vessel-icon-wrap">
                            <AnchorIcon className="vm-vessel-icon" />
                          </div>
                          <span className="vm-vessel-name">{v.name}</span>
                        </div>
                      </td>
                      <td className="vm-td vm-td-muted">{v.type}</td>
                      <td className="vm-td">
                        <div className="vm-crew-badges">
                          <span className={`vm-role-badge ${roleBadgeClass.master}`}>{counts.master} Master</span>
                          <span className={`vm-role-badge ${roleBadgeClass.officer}`}>{counts.officer} Officer</span>
                          <span className={`vm-role-badge ${roleBadgeClass.crew}`}>{counts.crew} Crew</span>
                        </div>
                      </td>
                      <td className="vm-td">
                        {v.status === "active" ? (
                          <span className="vm-status vm-status-active">
                            <CheckCircle2 className="vm-status-icon" /> Active
                          </span>
                        ) : (
                          <span className="vm-status vm-status-inactive">
                            <XCircle className="vm-status-icon" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="vm-td vm-td-actions">
                        <div className="vm-actions">
                          <button className="vm-assign-btn" onClick={() => openAssign(v)}>
                            <UsersIcon className="vm-btn-icon-sm" /> Assign Users
                          </button>
                          <button className="vm-icon-btn vm-edit-btn" onClick={() => openEdit(v)}>
                            <Edit className="vm-icon-btn-icon" />
                          </button>
                          <button className="vm-icon-btn vm-delete-btn" onClick={() => deleteVessel(v.id)}>
                            <Trash2 className="vm-icon-btn-icon" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="vm-empty-row">No vessels match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="vm-table-footer">
            <p className="vm-table-count">Showing {filtered.length} of {vessels.length} vessels</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          Add / Edit Vessel Dialog
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {formOpen && (
          <div className="vm-overlay" onClick={() => setFormOpen(false)}>
            <motion.div
              className="vm-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Dialog Header */}
              <div className="vm-dialog-header">
                <div className="vm-dialog-title">
                  <Ship className="vm-dialog-title-icon" />
                  {editing ? "Edit Vessel" : "Add New Vessel"}
                </div>
                <button className="vm-dialog-close" onClick={() => setFormOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              {/* Dialog Body */}
              <div className="vm-dialog-body">
                <div className="vm-field">
                  <label className="vm-label">Vessel Name</label>
                  <input
                    className="vm-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. MV Ocean Star"
                  />
                </div>

                <div className="vm-field">
                  <label className="vm-label">Vessel Type</label>
                  <select
                    className="vm-select"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    {vesselTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="vm-field">
                  <label className="vm-label">Status</label>
                  <div className="vm-status-toggle">
                    {["active", "inactive"].map(s => (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, status: s })}
                        className={`vm-status-btn ${
                          form.status === s
                            ? s === "active" ? "vm-status-btn-active" : "vm-status-btn-inactive-sel"
                            : "vm-status-btn-idle"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dialog Footer */}
              <div className="vm-dialog-footer">
                <button className="vm-btn-ghost" onClick={() => setFormOpen(false)}>Cancel</button>
                <button className="vm-btn-primary" onClick={saveVessel}>
                  {editing ? "Save Changes" : "Create Vessel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          Assign Users Dialog
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {assignOpen && (
          <div className="vm-overlay" onClick={() => setAssignOpen(false)}>
            <motion.div
              className="vm-dialog vm-dialog-wide"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="vm-dialog-header">
                <div className="vm-dialog-title">
                  <UsersIcon className="vm-dialog-title-icon" />
                  Assign Crew —{" "}
                  <span className="vm-dialog-vessel-name">{assignVessel?.name}</span>
                </div>
                <button className="vm-dialog-close" onClick={() => setAssignOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="vm-dialog-body">
                {/* User search */}
                <div className="vm-user-search-wrap">
                  <Search className="vm-user-search-icon" />
                  <input
                    className="vm-input vm-user-search-input"
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search by name, email or role..."
                  />
                </div>

                {/* Selection count */}
                <div className="vm-assign-meta">
                  <span className="vm-assign-count">
                    <strong>{assignSelected.length}</strong> selected
                  </span>
                  <button
                    className="vm-clear-btn"
                    onClick={() => setAssignSelected([])}
                  >
                    Clear selection
                  </button>
                </div>

                {/* Grouped user list */}
                <div className="vm-user-list-scroll">
                  <div className="vm-user-list">
                    {["master", "officer", "crew"].map(role => {
                      const list = groupedUsers[role];
                      if (!list.length) return null;
                      return (
                        <div key={role}>
                          {/* Role section header */}
                          <div className="vm-role-section-header">
                            <span className={`vm-role-badge ${roleBadgeClass[role]}`}>
                              {role}s
                            </span>
                            <span className="vm-role-count">{list.length}</span>
                          </div>

                          {/* Users */}
                          <div className="vm-user-items">
                            {list.map(u => {
                              const checked = assignSelected.includes(u.id);
                              return (
                                <label
                                  key={u.id}
                                  className={`vm-user-item ${checked ? "vm-user-item-checked" : ""}`}
                                >
                                  <input
                                    type="checkbox"
                                    className="vm-checkbox"
                                    checked={checked}
                                    onChange={() => toggleUser(u.id)}
                                  />
                                  <div className="vm-user-info">
                                    <p className="vm-user-name">{u.name}</p>
                                    <p className="vm-user-email">{u.email}</p>
                                  </div>
                                  <span className={`vm-role-badge ${roleBadgeClass[u.role]}`}>
                                    {u.role}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {filteredAssignUsers.length === 0 && (
                      <p className="vm-no-users">No users match your search.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="vm-dialog-footer">
                <button className="vm-btn-ghost" onClick={() => setAssignOpen(false)}>Cancel</button>
                <button className="vm-btn-primary" onClick={saveAssignments}>
                  <CheckCircle2 className="vm-btn-icon-sm" /> Save Assignments
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VesselManagement;