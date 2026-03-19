import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import "../pages/admin.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState(null);
  const navigate = useNavigate();

  const roles = ["Crews", "Officers", "Department Head", "Admin"];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/users/", {
        headers: {
            
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user ${userName}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:8000/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to delete user");
      }

      setUsers(users.filter((u) => u.id !== userId));
      setUpdateMessage(`Successfully deleted user ${userName}`);
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Crews",
    department: "",
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUpdateMessage(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to create user");
      }

      const createdUser = await response.json();

      // Re-fetch users or just append
      setUsers([...users, createdUser]);
      setUpdateMessage(`Successfully created user ${createdUser.full_name}`);
      setShowAddForm(false);
      setNewUser({
        full_name: "",
        email: "",
        password: "",
        role: "Crews",
        department: "",
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdateMessage(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:8000/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );

      setUpdateMessage(`Successfully updated user to ${newRole}`);

      // Clear message after 3 seconds
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading Users...</div>;
  }

  return (
    <div className="admin-container">
      <div
        className="admin-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 className="admin-title">User Management</h1>
          <div className="admin-breadcrumb">
            <Link to="/admin">Admin Dashboard</Link> / <span>Users</span>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: showAddForm ? "#ef4444" : "hsl(207, 52%, 40%)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          {showAddForm ? "Cancel" : "+ Add New User"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {updateMessage && (
        <div
          style={{
            backgroundColor: "rgba(76, 175, 80, 0.1)",
            color: "#4CAF50",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
            border: "1px solid #4CAF50",
          }}
        >
          {updateMessage}
        </div>
      )}

      {showAddForm && (
        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid #334155",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#f8fafc" }}>
            Create New User
          </h3>
          <form
            onSubmit={handleCreateUser}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#cbd5e1",
                  fontSize: "0.9rem",
                }}
              >
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newUser.full_name}
                onChange={(e) =>
                  setNewUser({ ...newUser, full_name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #475569",
                  backgroundColor: "#0f172a",
                  color: "white",
                }}
                placeholder="E.g. John Doe"
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#cbd5e1",
                  fontSize: "0.9rem",
                }}
              >
                Email Address *
              </label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #475569",
                  backgroundColor: "#0f172a",
                  color: "white",
                }}
                placeholder="user@marinelearn.com"
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#cbd5e1",
                  fontSize: "0.9rem",
                }}
              >
                Password *
              </label>
              <input
                type="password"
                required
                minLength="6"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #475569",
                  backgroundColor: "#0f172a",
                  color: "white",
                }}
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#cbd5e1",
                  fontSize: "0.9rem",
                }}
              >
                Role *
              </label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #475569",
                  backgroundColor: "#0f172a",
                  color: "white",
                }}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "0.5rem",
              }}
            >
              <button type="submit" className="admin-btn">
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status & Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: user.is_online ? "#10b981" : "#ef4444",
                      boxShadow: user.is_online
                        ? "0 0 5px rgba(16, 185, 129, 0.5)"
                        : "none",
                    }}
                    title={user.is_online ? "Online" : "Offline"}
                  />
                  {user.full_name}
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    className="role-select"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.email === "admin@marinelearn.com"} // Prevent changing main admin
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="view-details-link"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.full_name)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        cursor:
                          user.email === "admin@marinelearn.com"
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          user.email === "admin@marinelearn.com" ? 0.3 : 1,
                        display: "flex",
                        alignItems: "center",
                        padding: "0.2rem",
                        borderRadius: "4px",
                      }}
                      disabled={user.email === "admin@marinelearn.com"}
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
            No users found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
