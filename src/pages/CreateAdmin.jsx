import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; 
import "../assets/createadmin.css";

const CreateAdmin = () => {
  const [email, setEmail] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== rePassword) {
      setError("❌ Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // Verify admin key with backend
      const keyRes = await fetch("http://localhost:4000/api/admin/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey }),
      });

      if (!keyRes.ok) {
        const data = await keyRes.json();
        setError("❌ " + (data.message || "Invalid admin key"));
        setLoading(false);
        return;
      }

      // Create admin account using Supabase with role
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: "admin" }, // mark as admin
        },
      });

      if (error) {
        setError("❌ " + error.message);
      } else {
        // Use the returned data
        console.log("Created admin user data:", data);
        setSuccess(`✅ Admin account created successfully for ${data.user.email}`);
        navigate("/admin");
      }
    } catch (err) {
      setError("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper modern">
      <div className="login-card modern">
        <h1>AquaCheck</h1>
        <p className="subtitle highlight">Create Admin Account</p>

        <form onSubmit={handleSubmit} className="grid-form">
          <div className="input-group modern">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-modern"
            />
          </div>

          <div className="input-group modern">
            <label htmlFor="adminKey">Admin Key</label>
            <input
              id="adminKey"
              type="password"
              required
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter secret admin key"
              className="input-modern"
            />
          </div>

          <div className="input-group modern">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="input-modern"
            />
          </div>

          <div className="input-group modern">
            <label htmlFor="rePassword">Re-enter Password</label>
            <input
              id="rePassword"
              type="password"
              required
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              placeholder="Confirm your password"
              className="input-modern"
            />
          </div>

          <div className="full-width">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="highlight">{success}</p>}
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/admin" className="btn btn-secondary">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CreateAdmin;
