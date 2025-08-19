// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

// ⚡ Enable CORS for frontend
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Admin secret stored in memory
let adminSecret = process.env.ADMIN_SECRET || "SuperSecretAdminKey123";

// Supabase Admin client (service role)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ================= Admin Key API =================

// Verify admin key
app.post("/api/admin/verify-key", (req, res) => {
  const { key } = req.body;
  if (key === adminSecret) {
    return res.json({ valid: true });
  } else {
    return res.status(401).json({ valid: false, message: "Invalid admin key" });
  }
});

// Change admin key
app.post("/api/admin/change-key", (req, res) => {
  const { newKey } = req.body;
  if (!newKey || newKey.trim() === "") {
    return res.status(400).json({ message: "Key cannot be empty" });
  }
  adminSecret = newKey;
  return res.json({ message: "Admin key updated!" });
});

// ================= Admins API =================

// Get all admin users
app.get("/api/admin/users", async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("Admins")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.json({ users: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Delete a user
app.delete("/api/admin/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin
      .from("Admins")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// Enable / Disable user
app.post("/api/admin/users/:id/toggle", async (req, res) => {
  const { id } = req.params;
  const { enable } = req.body; // true = enable, false = disable

  try {
    const { error } = await supabaseAdmin
      .from("Admins")
      .update({ disabled: !enable })
      .eq("id", id);

    if (error) throw error;
    res.json({ message: enable ? "User enabled" : "User disabled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user status" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
