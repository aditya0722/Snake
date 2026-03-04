import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Dialog,
  DialogContent, DialogActions, TextField, IconButton, Snackbar,
  Alert, Stack, InputAdornment, Divider, Avatar, Chip, MenuItem,
  Select, FormControl, InputLabel, Tooltip, CircularProgress,
} from "@mui/material";
import {
  Add, Delete, Edit, Search, Close, Person,
  Phone, LocationOn, Email, AdminPanelSettings,
  Shield, HealthAndSafety, Groups, SupervisorAccount,
  ManageAccounts, FilterList,
} from "@mui/icons-material";

import { useAuth } from "../context/authContext";
import api from "../api/axios";

// ── Role config ───────────────────────────────────────────────────────────────
const ROLES = {
  community: {
    label: "Community",
    color: "#4fc3f7",
    bg: "rgba(79,195,247,0.12)",
    border: "rgba(79,195,247,0.25)",
    icon: <Groups sx={{ fontSize: 14 }} />,
  },
  chw: {
    label: "CHW",
    color: "#00d4aa",
    bg: "rgba(0,212,170,0.12)",
    border: "rgba(0,212,170,0.25)",
    icon: <HealthAndSafety sx={{ fontSize: 14 }} />,
  },
  treatment_provider: {
    label: "Treatment Provider",
    color: "#ffb347",
    bg: "rgba(255,179,71,0.12)",
    border: "rgba(255,179,71,0.25)",
    icon: <Shield sx={{ fontSize: 14 }} />,
  },
  programme_manager: {
    label: "Programme Manager",
    color: "#9c8fff",
    bg: "rgba(156,143,255,0.12)",
    border: "rgba(156,143,255,0.25)",
    icon: <SupervisorAccount sx={{ fontSize: 14 }} />,
  },
  admin: {
    label: "Admin",
    color: "#ff6b6b",
    bg: "rgba(255,107,107,0.12)",
    border: "rgba(255,107,107,0.25)",
    icon: <AdminPanelSettings sx={{ fontSize: 14 }} />,
  },
};

const emptyForm = {
  name: "",
  email: "",
  phone_number: "",
  role: "community",
  address: "",
  district: "",
  latitude: "",
  longitude: "",
};

const AVATAR_COLORS = ["#818cf8", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4"];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

// ── Role Badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const cfg = ROLES[role] || ROLES.community;
  return (
    <Chip
      icon={<Box sx={{ color: `${cfg.color} !important`, display: "flex", ml: "6px !important" }}>{cfg.icon}</Box>}
      label={cfg.label}
      size="small"
      sx={{
        height: 22, fontSize: "0.68rem", fontWeight: 700,
        background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.border}`,
        "& .MuiChip-icon": { ml: 0.5 },
      }}
    />
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ value, label, color }) {
  return (
    <Card sx={{ borderRadius: "15px", boxShadow: "0px 4px 20px rgba(0,0,0,0.08)", border: "none" }}>
      <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: "12px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ fontWeight: 800, color, fontSize: "1.2rem" }}>{value}</Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "#8892a4", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.68rem", lineHeight: 1.3 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ── User Card ─────────────────────────────────────────────────────────────────
function UserCard({ user, onEdit, onDelete, onRoleChange, isLoading }) {
  const color = avatarColor(user.name);
  const roleCfg = ROLES[user.role] || ROLES.community;

  return (
    <Card sx={{
      borderRadius: "20px", boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
      border: "none", overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
      opacity: isLoading ? 0.6 : 1,
      pointerEvents: isLoading ? "none" : "auto",
      "&:hover": { transform: !isLoading && "translateY(-3px)", boxShadow: "0px 12px 32px rgba(0,0,0,0.12)" },
    }}>
      {/* Header band */}
      <Box sx={{
        height: 80, position: "relative",
        background: `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`,
        borderBottom: `2px solid ${color}22`,
      }}>
        {/* Role badge top-left */}
        <Box sx={{ position: "absolute", top: 12, left: 14 }}>
          <RoleBadge role={user.role} />
        </Box>

        {/* Delete top-right */}
        <IconButton
          size="small"
          onClick={() => onDelete(user.id)}
          disabled={isLoading}
          sx={{ position: "absolute", top: 8, right: 8, bgcolor: "rgba(255,255,255,0.8)", color: "#ff6b6b", "&:hover": { bgcolor: "#fff5f5" }, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          {isLoading ? <CircularProgress size={16} /> : <Delete sx={{ fontSize: 16 }} />}
        </IconButton>

        {/* Avatar overlapping the band */}
        <Avatar sx={{
          width: 56, height: 56, fontSize: "1.4rem", fontWeight: 800,
          background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
          border: "3px solid #fff",
          boxShadow: `0 4px 14px ${color}55`,
          position: "absolute", bottom: -28, left: 20,
        }}>
          {user.name?.charAt(0)?.toUpperCase()}
        </Avatar>
      </Box>

      <CardContent sx={{ pt: 5, px: 3, pb: 3 }}>
        {/* Name + district */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: "#1a233a", fontSize: "1rem", lineHeight: 1.2 }}>
            {user.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "#8892a4", fontWeight: 600 }}>
            {user.district || "District not set"}
          </Typography>
        </Box>

        {/* Contact info */}
        <Stack spacing={1} sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, color: "#636e72", fontWeight: 500 }}>
            <Email sx={{ fontSize: 15, color: "#9c8fff", flexShrink: 0 }} />
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </Box>
          </Typography>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, color: "#636e72", fontWeight: 500 }}>
            <Phone sx={{ fontSize: 15, color: "#00d4aa", flexShrink: 0 }} />
            {user.phone_number || "Not provided"}
          </Typography>
          {user.address && (
            <Typography variant="body2" sx={{ display: "flex", alignItems: "flex-start", gap: 1, color: "#636e72", fontWeight: 500 }}>
              <LocationOn sx={{ fontSize: 15, color: "#ff6b6b", flexShrink: 0, mt: 0.15 }} />
              <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.address}
              </Box>
            </Typography>
          )}
        </Stack>

        <Divider sx={{ mb: 2, borderStyle: "dashed" }} />

        {/* Role assignment dropdown */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: "#8892a4", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontSize: "0.62rem", display: "block", mb: 0.8 }}>
            Assign Role
          </Typography>
          <Select
            value={user.role}
            onChange={e => onRoleChange(user.id, e.target.value)}
            disabled={isLoading}
            size="small"
            fullWidth
            sx={{
              borderRadius: "10px",
              bgcolor: "#f4f7f9",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: roleCfg.color,
              "& fieldset": { border: `1px solid ${roleCfg.border}` },
              "& .MuiSelect-select": { py: 1 },
              "&:hover fieldset": { borderColor: roleCfg.color },
              "&.Mui-focused fieldset": { borderColor: roleCfg.color },
            }}
          >
            {Object.entries(ROLES).map(([key, cfg]) => (
              <MenuItem key={key} value={key} sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
                  <span>{cfg.label}</span>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Action buttons */}
        <Stack direction="row" spacing={1.5}>
          <Button fullWidth variant="outlined"
            onClick={() => onEdit(user)}
            disabled={isLoading}
            startIcon={<Edit sx={{ fontSize: 15 }} />}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, borderColor: "#eee", color: "#1a233a", "&:hover": { borderColor: "#1a233a", bgcolor: "#f8f9fa" } }}>
            Edit
          </Button>
          <Button fullWidth variant="contained"
            onClick={() => onDelete(user.id)}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={15} /> : <Delete sx={{ fontSize: 15 }} />}
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, bgcolor: "#fff0f0", color: "#ff6b6b", boxShadow: "none", "&:hover": { bgcolor: "#ffe0e0", boxShadow: "none" } }}>
            Remove
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Users() {
  const { user: currentUser } = useAuth(); // Gets JWT payload: { user_id, name, role, ... }

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState({});

  const theme = { primary: "#1a233a", bg: "#f8f9fa", inputBg: "#f4f7f9", cardShadow: "0px 4px 20px rgba(0,0,0,0.08)" };

  const showSnack = (message, severity = "success") => setSnack({ open: true, message, severity });

  // Debug: Log current user
  useEffect(() => {
    if (currentUser) {
      console.log("✅ Current user loaded from auth context:", currentUser);
    } else {
      console.warn("⚠️ No user in auth context. Make sure you're logged in.");
    }
  }, [currentUser]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/users.php?action=getAll&limit=100");

      if (response.data.success) {
        setUsers(response.data.data || []);
        console.log("✅ Users fetched:", response.data.data?.length || 0);
      } else {
        showSnack("Failed to load users", "error");
        console.error("❌ Error:", response.data.message);
      }
    } catch (err) {
      showSnack("Server error loading users", "error");
      console.error("❌ Network error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generic API handler
  const callAPI = useCallback(async (action, method = "POST", data = {}, params = {}) => {
    try {
      const response = await api({
        method,
        url: "/users/users.php",
        params: { action, ...params },
        data,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Action failed");
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Server error");
    }
  }, []);

  // Filtered users
  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.district || "").toLowerCase().includes(search.toLowerCase());
      const matchRole = filterRole === "all" || u.role === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, search, filterRole]);

  // Stats
  const stats = useMemo(() => [
    { label: "Total Users", value: users.length, color: "#9c8fff" },
    { label: "Admins", value: users.filter(u => u.role === "admin").length, color: "#ff6b6b" },
    { label: "CHW", value: users.filter(u => u.role === "chw").length, color: "#00d4aa" },
    { label: "Treatment Providers", value: users.filter(u => u.role === "treatment_provider").length, color: "#ffb347" },
  ], [users]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpenDialog(true);
  };

  const handleOpenEdit = (user) => {
    setEditingId(user.id);
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      role: user.role || "community",
      address: user.address || "",
      district: user.district || "",
      latitude: user.latitude || "",
      longitude: user.longitude || "",
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    // Validation
    if (!form.name.trim()) {
      showSnack("Name is required", "error");
      return;
    }
    if (!form.email.trim()) {
      showSnack("Email is required", "error");
      return;
    }
    if (form.phone_number && !/^\d{10}$/.test(form.phone_number)) {
      showSnack("Phone number must be exactly 10 digits", "error");
      return;
    }

    // ✅ Use currentUser.id from auth context
    if (!currentUser || !currentUser.id) {
      showSnack("User not logged in. Please log in again.", "error");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await callAPI("update", "POST", {
          id: editingId,
          editorId: currentUser.id, // ← Auth context has 'id', not 'user_id'
          ...form,
        });
        showSnack("User updated successfully", "success");
      } else {
        await callAPI("create", "POST", form);
        showSnack("User added successfully", "success");
      }

      setOpenDialog(false);
      setEditingId(null);
      setForm(emptyForm);

      // Refetch users
      await fetchUsers();
    } catch (err) {
      showSnack(err.message || "Server error", "error");
      console.error("❌ Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle role change with server sync
  const handleRoleChange = async (id, newRole) => {
    const oldUser = users.find(u => u.id === id);
    const oldRole = oldUser?.role;

    // Optimistic update
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));

    if (!currentUser || !currentUser.id) {
      showSnack("User not logged in", "error");
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: oldRole } : u));
      return;
    }

    try {
      setLoadingUsers(prev => ({ ...prev, [id]: true }));

      await callAPI("update", "POST", {
        id,
        editorId: currentUser.id, // ← Auth context has 'id'
        name: oldUser.name,
        role: newRole,
        phone_number: oldUser.phone_number,
        address: oldUser.address,
        district: oldUser.district,
      });

      showSnack(`Role updated to ${ROLES[newRole]?.label || newRole}`, "success");
    } catch (err) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: oldRole } : u));
      showSnack(err.message || "Failed to update role", "error");
    } finally {
      setLoadingUsers(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle delete
  const handleDeleteConfirm = async () => {
    const userId = deleteConfirm;
    const userName = users.find(u => u.id === userId)?.name;

    try {
      setLoadingUsers(prev => ({ ...prev, [userId]: true }));

      await callAPI("delete", "POST", { id: userId });

      setUsers(prev => prev.filter(u => u.id !== userId));
      showSnack(`${userName} removed successfully`, "success");
    } catch (err) {
      showSnack(err.message || "Failed to delete user", "error");
    } finally {
      setLoadingUsers(prev => ({ ...prev, [userId]: false }));
      setDeleteConfirm(null);
    }
  };

  return (
    <Box sx={{ bgcolor: theme.bg, minHeight: "100vh", pb: 6 }}>
      {/* ── Header ── */}
      <Box sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: theme.primary, fontFamily: "'DM Sans', sans-serif" }}>
              Users
            </Typography>
            <Typography variant="body2" color="text.secondary">
              User Management &amp; Role Assignment
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd} disabled={loading}
            sx={{ bgcolor: theme.primary, borderRadius: "10px", textTransform: "none", px: 3, fontWeight: 700 }}>
            Add User
          </Button>
        </Stack>

        {/* ── Stats row ── */}
        <Grid container spacing={2} sx={{ mt: 3, mb: 1 }}>
          {stats.map(s => (
            <Grid item xs={6} sm={3} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>

        {/* ── Search + filter ── */}
        <Box sx={{ mt: 3, p: 2.5, bgcolor: "white", borderRadius: "15px", boxShadow: theme.cardShadow }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
            <TextField
              fullWidth
              placeholder="Search by name, email or district…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search sx={{ color: "text.secondary" }} /></InputAdornment>,
                sx: { borderRadius: "12px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } },
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <FormControl sx={{ minWidth: 190 }} size="medium">
              <Select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                displayEmpty
                startAdornment={<FilterList sx={{ mr: 1, color: "#8892a4", fontSize: 20 }} />}
                sx={{ borderRadius: "12px", bgcolor: theme.inputBg, "& fieldset": { border: "none" }, fontWeight: 600, fontSize: "0.88rem" }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                {Object.entries(ROLES).map(([key, cfg]) => (
                  <MenuItem key={key} value={key}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
                      <span>{cfg.label}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Box>

      {/* ── User Cards ── */}
      <Box sx={{ px: 4 }}>
        {loading ? (
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2, color: "#aaa" }}>
              Loading users...
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <Person sx={{ fontSize: 56, color: "#ddd" }} />
            <Typography variant="body1" fontWeight={600} sx={{ mt: 1, color: "#aaa" }}>
              {search || filterRole !== "all" ? "No users match your filters" : "No users yet — click Add User"}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map(user => (
              <Grid item key={user.id} xs={12} sm={6} lg={4} xl={3}>
                <UserCard
                  user={user}
                  onEdit={handleOpenEdit}
                  onDelete={id => setDeleteConfirm(id)}
                  onRoleChange={handleRoleChange}
                  isLoading={loadingUsers[user.id] || false}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditingId(null); }}
        fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "15px", overflow: "hidden" } }}>

        <Box sx={{ bgcolor: theme.primary, color: "white", p: 3, position: "relative" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ManageAccounts sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {editingId ? "Edit User" : "Add New User"}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.6 }}>
                {editingId ? "Update user information and role" : "Register a new system user"}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={() => { setOpenDialog(false); setEditingId(null); }}
            sx={{ position: "absolute", right: 12, top: 12, color: "rgba(255,255,255,0.6)", "&:hover": { color: "#fff" } }}>
            <Close />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 4, bgcolor: "#fcfdfe" }}>
          <Stack spacing={2.5}>

            {/* Name + Role row */}
            <Stack direction="row" spacing={2}>
              <TextField label="Full Name *" fullWidth value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={loading}
                InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
                InputLabelProps={{ shrink: true }} />

              <FormControl fullWidth>
                <InputLabel shrink sx={{ bgcolor: "#fcfdfe", px: 0.5 }}>Role *</InputLabel>
                <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  disabled={loading}
                  label="Role *"
                  sx={{ borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" }, fontWeight: 600, color: ROLES[form.role]?.color }}>
                  {Object.entries(ROLES).map(([key, cfg]) => (
                    <MenuItem key={key} value={key}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ color: cfg.color }}>{cfg.icon}</Box>
                        <span style={{ fontWeight: 600 }}>{cfg.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField label="Email Address *" fullWidth type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              disabled={loading}
              InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
              InputLabelProps={{ shrink: true }} />

            <TextField label="Phone Number" fullWidth value={form.phone_number}
              onChange={e => setForm({ ...form, phone_number: e.target.value })}
              disabled={loading}
              placeholder="10 digit number"
              InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
              InputLabelProps={{ shrink: true }} />

            <Stack direction="row" spacing={2}>
              <TextField label="District" fullWidth value={form.district}
                onChange={e => setForm({ ...form, district: e.target.value })}
                disabled={loading}
                InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
                InputLabelProps={{ shrink: true }} />
              <TextField label="Address" fullWidth value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                disabled={loading}
                InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
                InputLabelProps={{ shrink: true }} />
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField label="Latitude" fullWidth type="number" value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })}
                disabled={loading}
                InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
                InputLabelProps={{ shrink: true }} />
              <TextField label="Longitude" fullWidth type="number" value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })}
                disabled={loading}
                InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
                InputLabelProps={{ shrink: true }} />
            </Stack>

          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 4, pb: 3, gap: 1 }}>
          <Button onClick={() => { setOpenDialog(false); setEditingId(null); }}
            sx={{ color: "text.secondary", textTransform: "none", fontWeight: 700 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}
            sx={{ bgcolor: theme.primary, px: 4, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>
            {editingId ? "Save Changes" : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}
        maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "15px", overflow: "hidden" } }}>
        <Box sx={{ bgcolor: "#fff1f0", p: 3, borderBottom: "1px solid #ffe0de" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(255,107,107,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Delete sx={{ color: "#ff6b6b", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={800} sx={{ color: "#1a233a", lineHeight: 1.2 }}>Remove User</Typography>
              <Typography variant="caption" sx={{ color: "#8892a4" }}>This action cannot be undone</Typography>
            </Box>
          </Stack>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ color: "#636e72" }}>
            Are you sure you want to remove{" "}
            <strong style={{ color: "#1a233a" }}>
              {users.find(u => u.id === deleteConfirm)?.name || "this user"}
            </strong>
            ? All their data will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteConfirm(null)}
            sx={{ color: "text.secondary", textTransform: "none", fontWeight: 700 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleDeleteConfirm} disabled={loadingUsers[deleteConfirm]}
            sx={{ bgcolor: "#ff6b6b", px: 3, borderRadius: "10px", textTransform: "none", fontWeight: 700, boxShadow: "none", "&:hover": { bgcolor: "#e05555", boxShadow: "none" } }}>
            {loadingUsers[deleteConfirm] ? <CircularProgress size={20} /> : "Yes, Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ borderRadius: "10px" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}