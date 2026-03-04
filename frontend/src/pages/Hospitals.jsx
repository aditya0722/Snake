import { useState, useEffect, useCallback, useMemo } from "react";
import NearbyHospitalsDialog from "../components/map/NearbyHospitalsDialog";
import {
  Box, Typography, Grid, Card, CardContent, Button, Dialog,
  DialogContent, DialogActions, TextField,
  IconButton, Snackbar, Alert, Stack, InputAdornment, Divider, Chip, CircularProgress
} from "@mui/material";
import {
  Add, Delete, Map as MapIcon, Phone, LocationOn,
  Edit, Search, LocalHospital, Close, NearMe
} from "@mui/icons-material";
import api from "../api/axios";

const emptyForm = { name: "", address: "", district: "", contact_number: "", latitude: "", longitude: "" };

// Haversine distance in km – instant, no API
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState({});
  const [userPos, setUserPos] = useState(null);

  const theme = {
    primary: "#1a233a",
    accent: "#5c577e",
    bg: "#f8f9fa",
    inputBg: "#f4f7f9",
    cardShadow: "0px 4px 20px rgba(0,0,0,0.08)",
  };

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  // Get user location once on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.log("Location access denied")
    );
  }, []);

  // Fetch hospitals from backend
  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/hospitals/hospitals.php?action=getAll&limit=100");
      
      if (response.data.success) {
        setHospitals(response.data.data || []);
        console.log("✅ Hospitals fetched:", response.data.data?.length || 0);
      } else {
        showSnack("Failed to load hospitals", "error");
        console.error("❌ Error:", response.data.message);
      }
    } catch (err) {
      showSnack("Server error loading hospitals", "error");
      console.error("❌ Network error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch hospitals on mount
  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  // Generic API handler
  const callAPI = useCallback(async (action, method = "POST", data = {}, params = {}) => {
    try {
      const response = await api({
        method,
        url: "/hospitals/hospitals.php",
        params: { action, ...params },
        data,
      });
      console.log("response",response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Action failed");
      }

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Server error");
    }
  }, []);

  // Handle save (create/update)
  const handleSave = async () => {
    if (!form.name.trim()) {
      showSnack("Hospital name is required", "error");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Update
        await callAPI("update", "POST", {
          id: editingId,
          name: form.name,
          address: form.address,
          district: form.district,
          contact_number: form.contact_number,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
        });
        showSnack("Hospital updated successfully", "success");
      } else {
        // Create
        await callAPI("create", "POST", {
          name: form.name,
          address: form.address,
          district: form.district,
          contact_number: form.contact_number,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null,
        });
        showSnack("Hospital added successfully", "success");
      }

      setOpenDialog(false);
      setEditingId(null);
      setForm(emptyForm);

      // Refetch hospitals
      await fetchHospitals();
    } catch (err) {
      showSnack(err.message || "Server error", "error");
      console.error("❌ Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    const hospitalName = hospitals.find(h => h.id === id)?.name;

    try {
      setLoadingHospitals(prev => ({ ...prev, [id]: true }));

      await callAPI("delete", "POST", { id });

      setHospitals(prev => prev.filter(h => h.id !== id));
      showSnack(`${hospitalName} removed successfully`, "success");
    } catch (err) {
      showSnack(err.message || "Failed to delete hospital", "error");
    } finally {
      setLoadingHospitals(prev => ({ ...prev, [id]: false }));
    }
  };

  // Handle edit
  const handleOpenEdit = (h) => {
    setEditingId(h.id);
    setForm({
      name: h.name || "",
      address: h.address || "",
      district: h.district || "",
      contact_number: h.contact_number || "",
      latitude: h.latitude || "",
      longitude: h.longitude || "",
    });
    setOpenDialog(true);
  };

  // Filtered hospitals
  const filtered = useMemo(() => {
    return hospitals.filter(h =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.address || "").toLowerCase().includes(search.toLowerCase()) ||
      (h.district || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [hospitals, search]);

  return (
    <Box sx={{ bgcolor: theme.bg, minHeight: "100vh", pb: 6 }}>

      {/* ── Header ── */}
      <Box sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: theme.primary }}>
              Hospitals
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Facility Network Management
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<MapIcon />} onClick={() => setMapOpen(true)}
              sx={{ borderRadius: "10px", textTransform: "none", color: theme.primary, borderColor: "#ddd", bgcolor: "white" }}>
              Open Map
            </Button>
            <Button variant="contained" startIcon={<Add />}
              onClick={() => { setEditingId(null); setForm(emptyForm); setOpenDialog(true); }}
              sx={{ bgcolor: theme.primary, borderRadius: "10px", textTransform: "none", px: 3, fontWeight: 700 }}>
              Add Hospital
            </Button>
          </Stack>
        </Stack>

        {/* Search */}
        <Box sx={{ mt: 4, p: 2.5, bgcolor: "white", borderRadius: "15px", boxShadow: theme.cardShadow }}>
          <TextField
            fullWidth
            placeholder="Search by hospital name, location or district…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: "text.secondary" }} /></InputAdornment>,
              sx: { borderRadius: "12px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } },
            }}
          />
        </Box>
      </Box>

      {/* ── Hospital Cards ── */}
      <Box sx={{ px: 4 }}>
        {loading ? (
          <Box sx={{ textAlign: "center", mt: 8 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2, color: "#aaa" }}>
              Loading hospitals...
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 8, color: "#aaa" }}>
            <LocalHospital sx={{ fontSize: 56, opacity: 0.2 }} />
            <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
              {search ? "No hospitals match your search" : "No hospitals yet — click Add Hospital"}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map(h => {
              // Calculate distance instantly
              const dist =
                userPos && h.latitude && h.longitude
                  ? haversine(userPos.lat, userPos.lng, h.latitude, h.longitude)
                  : null;

              const isDeleting = loadingHospitals[h.id] || false;

              return (
                <Grid item key={h.id} xs={12} md={6} lg={4}>
                  <Card sx={{
                    borderRadius: "20px",
                    boxShadow: theme.cardShadow,
                    border: "none",
                    overflow: "hidden",
                    opacity: isDeleting ? 0.6 : 1,
                    pointerEvents: isDeleting ? "none" : "auto",
                    transition: "opacity 0.2s",
                  }}>

                    {/* Blue header band */}
                    <Box sx={{ height: 140, bgcolor: "#dbeafe", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <LocalHospital sx={{ fontSize: 56, color: "white", opacity: 0.8 }} />

                      {/* Emergency badge */}
                      <Box sx={{ position: "absolute", top: 14, left: 14, bgcolor: "#ff7675", color: "white", px: 1.5, py: 0.4, borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>
                        EMERGENCY
                      </Box>

                      {/* Distance badge */}
                      {dist !== null && (
                        <Chip
                          icon={<NearMe sx={{ fontSize: "14px !important", color: "#1a233a !important" }} />}
                          label={`${dist} km away`}
                          size="small"
                          sx={{
                            position: "absolute", top: 14, right: 14,
                            bgcolor: "rgba(255,255,255,0.92)", color: theme.primary,
                            fontWeight: 700, fontSize: "0.72rem",
                            backdropFilter: "blur(4px)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                          }}
                        />
                      )}

                      {/* Delete button */}
                      <IconButton
                        onClick={() => handleDelete(h.id)}
                        disabled={isDeleting}
                        sx={{ position: "absolute", bottom: 10, right: 10, bgcolor: "white", color: "#ff7675", "&:hover": { bgcolor: "#fff5f5" }, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        size="small"
                      >
                        {isDeleting ? <CircularProgress size={20} /> : <Delete fontSize="small" />}
                      </IconButton>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5, color: theme.primary }}>
                        {h.name}
                      </Typography>

                      <Stack spacing={1.2} sx={{ mb: 3 }}>
                        {h.district && (
                          <Chip
                            label={h.district}
                            size="small"
                            sx={{ width: "fit-content", bgcolor: "#e0f2f1", color: "#00796b", fontWeight: 600, fontSize: "0.7rem" }}
                          />
                        )}
                        <Typography variant="body2" display="flex" alignItems="center" gap={1} sx={{ color: "#636e72", fontWeight: 500 }}>
                          <LocationOn sx={{ fontSize: 18, color: "#ff7675", flexShrink: 0 }} />
                          {h.address || "Address not provided"}
                        </Typography>
                        <Typography variant="body2" display="flex" alignItems="center" gap={1} sx={{ color: "#636e72", fontWeight: 500 }}>
                          <Phone sx={{ fontSize: 18, color: "#ff7675", flexShrink: 0 }} />
                          {h.contact_number || "Contact not provided"}
                        </Typography>
                        {h.latitude && h.longitude && (
                          <Typography variant="caption" sx={{ color: "#b2bec3", pl: "26px" }}>
                            {Number(h.latitude).toFixed(4)}, {Number(h.longitude).toFixed(4)}
                          </Typography>
                        )}
                      </Stack>

                      <Divider sx={{ mb: 2, borderStyle: "dashed" }} />

                      <Stack direction="row" spacing={1.5}>
                        <Button fullWidth variant="outlined"
                          onClick={() => { setSelectedHospital(h); setMapOpen(true); }}
                          disabled={isDeleting}
                          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, borderColor: "#eee", color: theme.primary }}>
                          View Map
                        </Button>
                        <Button fullWidth variant="contained"
                          onClick={() => handleOpenEdit(h)}
                          disabled={isDeleting}
                          startIcon={<Edit sx={{ fontSize: 16 }} />}
                          sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, bgcolor: "#f1f0fe", color: theme.accent, boxShadow: "none", "&:hover": { bgcolor: "#e8e7ff" } }}>
                          Edit
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setEditingId(null); }} fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "15px", overflow: "hidden" } }}>
        <Box sx={{ bgcolor: theme.primary, color: "white", p: 3, position: "relative" }}>
          <Typography variant="h5" fontWeight={700}>
            {editingId ? "Update Hospital" : "Register Hospital"}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Ensure hospital records are accurate for emergency use
          </Typography>
          <IconButton
            onClick={() => { setOpenDialog(false); setEditingId(null); }}
            sx={{ position: "absolute", right: 12, top: 12, color: "white" }}>
            <Close />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={2.5}>
            <Box sx={{ border: "2px dashed #e0e6ed", borderRadius: "12px", py: 3, textAlign: "center", bgcolor: "#fcfdfe" }}>
              <LocalHospital sx={{ fontSize: 38, color: "#ccd5df", mb: 0.5 }} />
              <Typography variant="body2" fontWeight={600} color="#ccd5df">Hospital Information Entry</Typography>
            </Box>

            <TextField
              label="Hospital Name *"
              fullWidth
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              disabled={loading}
              InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="District"
              fullWidth
              value={form.district}
              onChange={e => setForm({ ...form, district: e.target.value })}
              disabled={loading}
              InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Location Address"
              fullWidth
              multiline
              rows={2}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              disabled={loading}
              InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Contact Number"
              fullWidth
              value={form.contact_number}
              onChange={e => setForm({ ...form, contact_number: e.target.value })}
              disabled={loading}
              InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
              InputLabelProps={{ shrink: true }}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                label="Latitude"
                fullWidth
                type="number"
                value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })}
                disabled={loading}
                placeholder="e.g. 6.9271"
                InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Longitude"
                fullWidth
                type="number"
                value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })}
                disabled={loading}
                placeholder="e.g. 79.8612"
                InputProps={{ sx: { borderRadius: "10px", bgcolor: theme.inputBg, "& fieldset": { border: "none" } } }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Typography variant="caption" sx={{ color: "#b2bec3" }}>
              💡 Tip: Add lat/lng so the distance from your location appears on the card
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => { setOpenDialog(false); setEditingId(null); }}
            disabled={loading}
            sx={{ color: "text.secondary", textTransform: "none", fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{ bgcolor: theme.primary, px: 4, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {editingId ? "Save Changes" : "Submit Hospital"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ borderRadius: "10px" }}>
          {snack.message}
        </Alert>
      </Snackbar>

      {/* ── Map Dialog ── */}
      <NearbyHospitalsDialog
        open={mapOpen}
        onClose={() => { setMapOpen(false); setSelectedHospital(null); }}
        onAddHospital={(hospitalData) => {
          setHospitals(prev => [...prev, hospitalData]);
          showSnack("Hospital added successfully");
        }}
        savedHospitals={hospitals}
        selectedHospital={selectedHospital}
      />
    </Box>
  );
}