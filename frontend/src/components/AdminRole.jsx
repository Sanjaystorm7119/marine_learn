import React, { useState,useEffect} from "react";
import { Link,useNavigate } from "react-router-dom";
import { Trash2, Pencil, X, ShieldCheck, Users } from "lucide-react";
import "../pages/AdminRole.css";

// ─── Role Badge Colors ─────────────────────────────────────────────────────────
const ROLE_COLORS = {
  admin:            { bg: "rgba(239,68,68,0.12)",   text: "#ef4444",  border: "rgba(239,68,68,0.3)"   },
  "department head":{ bg: "rgba(251,191,36,0.12)",  text: "#fbbf24",  border: "rgba(251,191,36,0.3)"  },
  officers:         { bg: "rgba(49,114,156,0.15)",  text: "#38bdf8",  border: "rgba(56,189,248,0.3)"  },
  crews:            { bg: "rgba(0,196,159,0.12)",   text: "#00C49F",  border: "rgba(0,196,159,0.3)"   },
};

const getBadgeStyle = (name) => {
  const key = name?.toLowerCase();
  return ROLE_COLORS[key] || { bg: "rgba(148,163,184,0.1)", text: "#94a3b8", border: "rgba(148,163,184,0.3)" };
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminRole = () => {
  const [roles, setRoles] = useState([]); // Starts empty, fills from database!
  const [showForm, setShowForm] = useState(false);
  const[editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", lead: "Will be assigned by admin" });
  const [updateMessage, setUpdateMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // <-- Start with empty array!
  const [expandedRole, setExpandedRole] = useState(null);
const [roleUsers, setRoleUsers] = useState([]);
const [editingLead, setEditingLead] = useState({});
const [userLeads, setUserLeads] = useState({});
  
  // --- NEW: Fetch Roles from Backend ---
  useEffect(() => {
    fetchRoles();
  },[]);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/admin/roles", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };
  const fetchRoleUsers = async (roleId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/admin/roles/${roleId}/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
     if (response.ok) {
        const data = await response.json();
        setRoleUsers(data);
        const leads = {};
        // FIXED: Changed u.lead to u.role_lead to perfectly match your backend!
        data.forEach(u => { leads[u.id] = u.role_lead || "Will be assigned by admin"; }); 
        setUserLeads(leads);
      }
    } catch (err) {
      console.error("Failed to fetch role users", err);
    }
  };

  const handleUserCountClick = (role) => {
    if (expandedRole?.id === role.id) {
      setExpandedRole(null);
      setRoleUsers([]);
    } else {
      setExpandedRole(role);
      fetchRoleUsers(role.id);
      
    }
  };

  const handleLeadSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/admin/roles/${editingLead.roleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...roles.find(r => r.id === editingLead.roleId), lead: editingLead.value })
      });
      if (response.ok) {
        showSuccess("Role lead updated!");
        fetchRoles();
        setExpandedRole(prev => ({ ...prev, lead: editingLead.value }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

 const handleUserLeadSave = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/admin/users/${userId}/lead`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ lead: userLeads[userId] })
      });
      if (response.ok) {
        showSuccess("Role lead updated for user!");
        fetchRoles(); 
        fetchRoleUsers(expandedRole.id); // <-- NEW: Refreshes the bottom table!
      } else {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to update user lead");
      }
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // <-- Scrolls up to show the error!
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const showSuccess = (msg) => {
    setUpdateMessage(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setUpdateMessage(null), 3000);
  };

  const openCreate = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "", lead: "Will be assigned by admin" }); // <-- CHANGED
    setError(null);
    setShowForm(true);
  };

  const openEdit = (role) => {
    setEditingRole(role);
    setFormData({ name: role.name, description: role.description, lead: role.lead });
    setError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRole(null);
    setError(null);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────────
 const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Role name is required.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = editingRole 
        ? `http://localhost:8000/admin/roles/${editingRole.id}` 
        : "http://localhost:8000/admin/roles";
      const method = editingRole ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to save role");
      }

      showSuccess(`Role "${formData.name}" saved successfully.`);
      fetchRoles(); // Refresh the table from the database!
      closeForm();
    } catch (err) {
      setError(err.message);
    }
  };

const handleDelete = async (role) => {
    if (role.userCount > 0) {
      alert(`⚠️ Cannot delete "${role.name}"!\n\nThere are still ${role.userCount} user(s) assigned to this role.\nPlease reassign them before deleting.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"? This cannot be undone.`)) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/admin/roles/${role.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Failed to delete role");
      
      showSuccess(`Role "${role.name}" deleted.`);
      fetchRoles(); // Refresh the table!
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="admin-title">Role Management</h1>
          <div className="admin-breadcrumb">
            <Link to="/admin">Admin Dashboard</Link> / <span>Roles</span>
          </div>
        </div>
        <button
          onClick={showForm ? closeForm : openCreate}
          className={`role-header-btn ${showForm ? "role-header-btn--cancel" : "role-header-btn--create"}`}
        >
          {showForm ? "Cancel" : "+ Create New Role"}
        </button>
      </div>

      {/* Toast Messages */}
      {error && <div className="role-toast role-toast--error">{error}</div>}
      {updateMessage && <div className="role-toast role-toast--success">{updateMessage}</div>}

      {/* ── Create / Edit Form ─────────────────────────────────────────────── */}
      {showForm && (
        <div className="role-form-card">
          <div className="role-form-card__header">
            <h3>{editingRole ? `Edit Role — ${editingRole.name}` : "Create New Role"}</h3>
            <button className="role-form-card__close" onClick={closeForm}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="role-form-grid">
            {/* Role Name */}
            <div className="role-form-field">
              <label>Role Name *</label>
              <input
                type="text"
                required
                placeholder="E.g. Senior Officer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Role Lead */}
           {/* Role Lead */}
            <div className="role-form-field">
              <label>Assign Role Lead</label>
              <input
                type="text"
                placeholder="E.g. Capt. John"
                value={formData.lead}
                onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
              />
            </div>

            {/* Description — full width */}
            <div className="role-form-field role-form-field--full">
              <label>Role Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the responsibilities and access level of this role..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="role-form-field role-form-field--full role-form-actions">
              <button type="submit" className="admin-btn role-submit-btn">
                {editingRole ? "Save Changes" : "Create Role"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="admin-table-container">
        <table className="admin-users-table role-table">
          <thead>
            <tr>
              <th>Role ID</th>
              <th>Role Name</th>
              <th>Description</th>
              <th>Role Lead</th>
              <th>Users</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const badge = getBadgeStyle(role.name);
              return (
                <tr key={role.id}>
                  {/* Role ID */}
                  <td>
                    <span className="role-id-badge">{role.id}</span>
                  </td>

                  {/* Role Name */}
                  <td>
                    <span
                      className="role-name-badge"
                      style={{ backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}
                    >
                      <ShieldCheck size={13} style={{ marginRight: "5px", flexShrink: 0 }} />
                      {role.name}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="role-desc-cell">{role.description}</td>

                  {/* Lead */}
                  <td className="role-lead-cell">
                    <div className="role-lead-pill">
                      <div className="role-lead-avatar">
                        {role.lead?.charAt(0).toUpperCase()}
                      </div>
                      <span>{role.lead}</span>
                    </div>
                  </td>

                  {/* User Count */}
                 {/* User Count */}
                  <td>
                    <button
                      className="role-user-count-btn"
                      onClick={() => handleUserCountClick(role)}
                      title="View users in this role"
                    >
                      <Users size={13} style={{ marginRight: "5px" }} />
                      {role.userCount}
                    </button>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="role-actions-cell">
                      <button
                        className="role-action-btn role-action-btn--edit"
                        title="Edit Role"
                        onClick={() => openEdit(role)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="role-action-btn role-action-btn--delete"
                        title={role.userCount > 0 ? `Cannot delete: ${role.userCount} user(s) assigned` : "Delete Role"}
                        onClick={() => handleDelete(role)}
                        style={{ opacity: role.userCount > 0 ? 0.45 : 1 }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {roles.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
            No roles found. Create one to get started.
          </div>
        )}
      </div>
      {/* ── Users in Role Panel ────────────────────────────────────────── */}
      {expandedRole && (
        <div className="admin-table-container" style={{ marginTop: "1.8rem" }}>
          {/* Panel Header */}
          <div style={{ padding: "1rem 1.4rem", borderBottom: "1px solid var(--admin-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <span className="role-name-badge" style={{
                backgroundColor: getBadgeStyle(expandedRole.name).bg,
                color: getBadgeStyle(expandedRole.name).text,
                border: `1px solid ${getBadgeStyle(expandedRole.name).border}`
              }}>
                <ShieldCheck size={13} style={{ marginRight: "5px" }} />
                {expandedRole.name}
              </span>
              <span style={{ color: "var(--admin-text-muted)", fontSize: "0.875rem" }}>
                — {roleUsers.length} user(s)
              </span>
            </div>
            {/* Editable Role Lead */}
            
          </div>

          <table className="admin-users-table role-table">
            <thead>
              <tr>
                <th>Role ID</th>
                <th>Role Name</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role Lead</th>
              </tr>
            </thead>
            <tbody>
              {roleUsers.map((user) => (
                <tr key={user.id}>
                  <td><span className="role-id-badge">{expandedRole.id}</span></td>
                  <td>
                    <span className="role-name-badge" style={{
                      backgroundColor: getBadgeStyle(expandedRole.name).bg,
                      color: getBadgeStyle(expandedRole.name).text,
                      border: `1px solid ${getBadgeStyle(expandedRole.name).border}`
                    }}>
                      <ShieldCheck size={13} style={{ marginRight: "5px" }} />
                      {expandedRole.name}
                    </span>
                  </td>
                  {/* CHANGED user.name TO user.full_name BELOW! */}
                  <td style={{ color: "var(--admin-text-main)", fontWeight: 500 }}>{user.full_name}</td>
<td style={{ color: "var(--admin-text-muted)", fontSize: "0.875rem" }}>{user.email}</td>
<td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div className="role-lead-avatar">
                        {(userLeads[user.id] || "W").charAt(0).toUpperCase()}
                      </div>
                      <input
                        type="text"
                        value={userLeads[user.id] || ""}
                        onChange={(e) => setUserLeads(prev => ({ ...prev, [user.id]: e.target.value }))}
                        style={{
                          padding: "0.3rem 0.6rem",
                          borderRadius: "6px",
                          border: "1px solid var(--admin-border)",
                          background: "var(--admin-bg)",
                          color: "var(--admin-text-main)",
                          fontSize: "0.82rem",
                          outline: "none",
                          width: "130px"
                        }}
                      />
                      <button
                        onClick={() => handleUserLeadSave(user.id)}
                        className="role-submit-btn"
                        style={{ padding: "0.28rem 0.7rem", fontSize: "0.78rem" }}
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {roleUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: "1.5rem" }}>
                    No users assigned to this role yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRole;