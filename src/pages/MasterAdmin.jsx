import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../components/Sidebar";
import { AdminContext } from "../App";
import "../assets/masteradmin.css";

const API_BASE = "http://localhost:4000/api/admin";

const MasterAdmin = () => {
  const { isAdmin } = useContext(AdminContext);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Fetch all users
  useEffect(() => {
    if (!isAdmin) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        setUsers(data.users || []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unexpected error fetching users");
      }
    };

    fetchUsers();
  }, [isAdmin]);

  // Delete user
  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
      setError("Unexpected error deleting user");
    }
  };

  // Toggle disable/enable
  const handleToggleUser = async (userId, currentlyDisabled) => {
    // Placeholder for toggle API (implement if you have a toggle route)
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, disabled: !currentlyDisabled } : u))
    );
  };

  // Secret admin password
  const handlePasswordChange = () => {
    if (!newPassword.trim()) {
      setPasswordMessage("Password cannot be empty.");
      return;
    }
    setPasswordMessage("✅ Secret admin password changed successfully!");
    setNewPassword("");
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordMessage("");
    }, 2000);
  };

  if (!isAdmin)
    return (
      <p style={{ padding: 20, textAlign: "center", color: "#ef4444" }}>
        Access Denied
      </p>
    );

  return (
    <div className="container masteradmin-container">
      <Sidebar />
      <main className="main-content" role="main">
        <h1 className="masteradmin-header">Master Admin - User Management</h1>

        {error && <p className="masteradmin-error">{error}</p>}

        <div className="card">
          <button className="btn-primary" onClick={() => setShowPasswordModal(true)}>
            🔑 Change Secret Admin Password
          </button>
        </div>

        <div className="card" aria-live="polite">
          <table className="masteradmin-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Email</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">No users found 👀</div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email || "No email"}</td>
                    <td>{new Date(user.created_at).toLocaleString()}</td>
                    <td>{user.disabled ? "Disabled ❌" : "Active ✅"}</td>
                    <td>
                      <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>
                        Delete
                      </button>
                      <button
                        className={`btn ${user.disabled ? "btn-success" : "btn-warning"}`}
                        onClick={() => handleToggleUser(user.id, user.disabled)}
                        style={{ marginLeft: 8 }}
                      >
                        {user.disabled ? "Enable" : "Disable"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showPasswordModal && (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal">
              <h2>Change Secret Admin Password</h2>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoFocus
              />
              {passwordMessage && (
                <p
                  style={{
                    color: passwordMessage.includes("successfully") ? "green" : "red",
                    marginTop: 8,
                  }}
                >
                  {passwordMessage}
                </p>
              )}
              <div style={{ marginTop: 20 }}>
                <button className="modal-btn confirm" onClick={handlePasswordChange}>
                  Confirm
                </button>
                <button
                  className="modal-btn cancel"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword("");
                    setPasswordMessage("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MasterAdmin;
