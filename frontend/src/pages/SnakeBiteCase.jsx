import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import { useAuth } from "../context/authContext";
import {
  Box, Card, CardContent, TextField, Button, Dialog, DialogContent,
  DialogActions, Alert, Stack, Typography, Grid, Chip, Avatar,
  Tabs, Tab, Menu, MenuItem, IconButton, Divider,
  Paper, Stepper, Step, StepLabel, Snackbar,
  InputAdornment, FormControl, InputLabel, Select,
} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import {
  MapPin, Phone, MapIcon, Camera, AlertCircle, CheckCircle,
  Clock, Heart, Users, LogOut, Settings, Bell, Home,
  Plus, Edit, Trash2, Eye, Send, Filter, Search as SearchIcon,
  Navigation, FileText, Video, User, Shield, TrendingUp, MapPin as MapPinLucide,
} from "lucide-react";
import { NearMe } from "@mui/icons-material";


function CommunityUserDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState(0);
  const [cases, setCases] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [rescuers, setRescuers] = useState([]);
  const [openBiteDialog, setOpenBiteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [biteForm, setBiteForm] = useState({
    patient_name: "",
    patient_age: "",
    patient_gender: "Male",
    bite_location: "Hand",
    symptoms: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [casesRes, hospitalsRes, rescuersRes] = await Promise.all([
        api.get(`/bite-cases/getMy.php?user_id=${user.id}`),
        api.get(`/hospitals/hospitals.php?action=nearby`),
        api.get(`/rescuers/rescuers.php?action=list`),
      ]);

      if (casesRes.data.success) setCases(casesRes.data.data || []);
      if (hospitalsRes.data.success) setHospitals(hospitalsRes.data.data || []);
      if (rescuersRes.data.success) setRescuers(rescuersRes.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleSubmitBiteCase = async () => {
    if (!biteForm.patient_name || !biteForm.patient_age) {
      setSnackbar({ open: true, message: "Please fill all fields", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/bite-cases/bite-cases.php?action=report", {
        ...biteForm,
        reported_by: user.id,
        latitude: biteForm.latitude || 20.5937,
        longitude: biteForm.longitude || 78.9629,
      });

      const data = response.data;

      if (data.success) {
        setSnackbar({ open: true, message: "Bite case submitted successfully!", severity: "success" });
        setOpenBiteDialog(false);
        setBiteForm({
          patient_name: "",
          patient_age: "",
          patient_gender: "Male",
          bite_location: "Hand",
          symptoms: "",
          latitude: null,
          longitude: null,
        });
        fetchData();
      } else {
        setSnackbar({ open: true, message: data.message || "Failed to submit", severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Error: " + (err.response?.data?.message || err.message), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Premium Header */}
      <Box sx={{
        background: "linear-gradient(135deg, #1a1f36 0%, #2e3a59 100%)",
        color: "white",
        p: 2.5,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 44, height: 44 }}>
              <Users size={22} color="white" />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Community Portal • User Dashboard
              </Typography>
            </Box>
          </Stack>
          <Button
            startIcon={<LogOut size={16} />}
            onClick={logout}
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              borderRadius: "8px",
              textTransform: "none"
            }}
            variant="outlined"
            size="small"
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ textAlign: "center", display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <AlertCircle size={32} color="#ff6b6b" style={{ marginBottom: 8 }} />
                <Typography variant="h5" fontWeight="bold">
                  {cases.length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Cases Reported
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ textAlign: "center", display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <MapPin size={32} color="#667eea" style={{ marginBottom: 8 }} />
                <Typography variant="h5" fontWeight="bold">
                  {hospitals.length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Nearby Hospitals
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ textAlign: "center", display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Users size={32} color="#00d4aa" style={{ marginBottom: 8 }} />
                <Typography variant="h5" fontWeight="bold">
                  {rescuers.length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Available Rescuers
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
            <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ textAlign: "center", display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Heart size={32} color="#ffb347" style={{ marginBottom: 8 }} />
                <Typography variant="h5" fontWeight="bold">
                  {cases.filter((c) => c.status === "recovered").length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Recovered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="My Cases" />
          <Tab label="Hospitals" />
          <Tab label="Rescuers" />
          <Tab label="First Aid" />
        </Tabs>

        {/* Tab Content */}
        {tab === 0 && (
          <Box>
            <Button
              startIcon={<Plus size={18} />}
              variant="contained"
              onClick={() => setOpenBiteDialog(true)}
              sx={{ mb: 2, background: "#1a1f36", color: "white", "&:hover": { background: "#0f1425" } }}
            >
              Report Snake Bite Case
            </Button>

            <Grid container spacing={2}>
              {cases.map((caseItem) => (
                <Grid item xs={12} sm={6} md={4} key={caseItem.id} sx={{ display: 'flex' }}>
                  <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '180px'
                              }}
                              title={caseItem.patient_name}
                            >
                              {caseItem.patient_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Case ID: {caseItem.id}
                            </Typography>
                          </Box>
                          <Chip
                            label={caseItem.status}
                            color={caseItem.status === "recovered" ? "success" : "warning"}
                            size="small"
                          />
                        </Stack>
                        <Divider />
                        <Stack spacing={0.5}>
                          <Typography variant="body2">
                            <strong>Age:</strong> {caseItem.patient_age} years
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={caseItem.bite_location}
                          >
                            <strong>Bite Location:</strong> {caseItem.bite_location}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Date:</strong> {new Date(caseItem.bite_time).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {cases.length === 0 && (
              <Alert severity="info">No cases reported yet. Click "Report Snake Bite Case" to submit one.</Alert>
            )}
          </Box>
        )}

        {tab === 1 && (
          <Grid container spacing={2}>
            {hospitals.map((hospital) => (
              <Grid item xs={12} sm={6} md={4} key={hospital.id}>
                <Card>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Typography variant="h6" fontWeight="bold">
                        {hospital.name}
                      </Typography>
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1}>
                          <MapPin size={18} color="#667eea" />
                          <Typography variant="body2">{hospital.address}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Phone size={18} color="#667eea" />
                          <Typography variant="body2">{hospital.contact_number}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <CheckCircle size={18} color="#00d4aa" />
                          <Typography variant="body2">
                            ASV Available: {hospital.asv_vials_available || "Unknown"}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Button variant="outlined" fullWidth startIcon={<Navigation size={18} />}>
                        Navigate
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {tab === 2 && (
          <Grid container spacing={2}>
            {rescuers.map((rescuer) => (
              <Grid item xs={12} sm={6} md={4} key={rescuer.id}>
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <Avatar sx={{ width: 50, height: 50, bgcolor: "#667eea" }}>
                          {rescuer.user_name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {rescuer.user_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {rescuer.district}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack spacing={0.5}>
                        <Stack direction="row" spacing={1}>
                          <Phone size={16} />
                          <Typography variant="body2">{rescuer.phone_number}</Typography>
                        </Stack>
                        <Typography variant="body2" color="textSecondary">
                          Distance: {(rescuer.distance || 0).toFixed(1)} km
                        </Typography>
                      </Stack>
                      <Button variant="outlined" fullWidth>
                        Contact Rescuer
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {tab === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    First Aid: Key Messages
                  </Typography>
                  <Stack spacing={2}>
                    <Box sx={{ p: 2, bgcolor: "#fff3cd", borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        ⚠️ If Bitten:
                      </Typography>
                      <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                        <li>Immobilize the bitten limb</li>
                        <li>Remove jewelry and tight clothing</li>
                        <li>Apply pressure bandage (not too tight)</li>
                        <li>Keep limb below heart level</li>
                        <li>Seek medical help immediately</li>
                      </ul>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: "#d1ecf1", borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        🚫 DO NOT:
                      </Typography>
                      <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                        <li>Cut or apply tourniquets</li>
                        <li>Use ice or heat</li>
                        <li>Apply traditional remedies</li>
                        <li>Delay seeking medical care</li>
                      </ul>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    First Aid Video
                  </Typography>
                  <Box
                    sx={{
                      width: "100%",
                      height: 250,
                      bgcolor: "#f0f0f0",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Video size={48} color="#ccc" />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      First Aid Tutorial Video
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Bite Case Dialog */}
      <Dialog open={openBiteDialog} onClose={() => setOpenBiteDialog(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight="bold">
              Report Snake Bite Case
            </Typography>
            <TextField
              label="Patient Name"
              fullWidth
              value={biteForm.patient_name}
              onChange={(e) => setBiteForm({ ...biteForm, patient_name: e.target.value })}
            />
            <TextField
              label="Patient Age"
              type="number"
              fullWidth
              value={biteForm.patient_age}
              onChange={(e) => setBiteForm({ ...biteForm, patient_age: e.target.value })}
            />
            <TextField
              label="Bite Location"
              fullWidth
              value={biteForm.bite_location}
              onChange={(e) => setBiteForm({ ...biteForm, bite_location: e.target.value })}
            />
            <TextField
              label="Symptoms"
              fullWidth
              multiline
              rows={3}
              value={biteForm.symptoms}
              onChange={(e) => setBiteForm({ ...biteForm, symptoms: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenBiteDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitBiteCase}
            disabled={loading}
            sx={{ background: "#1a1f36", color: "white", "&:hover": { background: "#0f1425" } }}
          >
            {loading ? "Submitting..." : "Submit Case"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────
// CHW DASHBOARD
// ──────────────────────────────────────────────────────────────────
function CHWDashboard() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchCases();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/notifications.php?user_id=${user.id}`);
      if (res.data.success) setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await api.get(`/bite-cases/bite-cases.php?action=getAll&status=reported`);
      if (res.data.success) setCases(res.data.data || []);
    } catch (err) {
      console.error("Error fetching cases:", err);
    }
  };

  const confirmBiteCase = async (caseId) => {
    setLoading(true);
    try {
      const res = await api.post(`/bite-cases/bite-cases.php?action=updateStatus`, {
        case_id: caseId,
        status: "confirmed",
        chw_id: user.id,
      });

      if (res.data.success) {
        fetchCases();
        setOpenDetails(false);
      }
    } catch (err) {
      console.error("Error confirming case:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Header */}
      {/* Premium Header */}
      <Box sx={{
        background: "linear-gradient(135deg, #1a1f36 0%, #2e3a59 100%)",
        color: "white",
        p: 2.5,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 44, height: 44 }}>
              <Heart size={22} color="white" />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                CHW Network • Community Health Worker
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<Bell size={16} />}
              variant="text"
              onClick={fetchNotifications}
              sx={{
                color: "white",
                textTransform: "none",
                fontWeight: 700,
                opacity: 0.9,
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)", opacity: 1 }
              }}
            >
              Notifications ({notifications.length})
            </Button>
            <Button
              startIcon={<LogOut size={16} />}
              onClick={logout}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                borderRadius: "8px",
                textTransform: "none"
              }}
              variant="outlined"
              size="small"
            >
              Logout
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
        {/* Urgent Cases */}
        <Card sx={{ mb: 3, borderLeft: "4px solid #ff6b6b" }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <AlertCircle size={28} color="#ff6b6b" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  🚨 {cases.length} Cases Awaiting Confirmation
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Review and confirm bite cases in your area
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Cases List */}
        <Grid container spacing={2}>
          {cases.map((caseItem) => (
            <Grid item xs={12} sm={6} md={4} key={caseItem.id} sx={{ display: 'flex' }}>
              <Card sx={{ cursor: "pointer", "&:hover": { boxShadow: 3 }, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '180px'
                          }}
                          title={caseItem.patient_name}
                        >
                          {caseItem.patient_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {caseItem.id}
                        </Typography>
                      </Box>
                      <Chip label="Reported" color="warning" size="small" />
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Age:</strong> {caseItem.patient_age} years
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={caseItem.bite_location}
                      >
                        <strong>Bite Location:</strong> {caseItem.bite_location}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={caseItem.symptoms}
                      >
                        <strong>Symptoms:</strong> {caseItem.symptoms}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Reporter:</strong> {caseItem.reporter_name}
                      </Typography>
                    </Stack>

                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setSelectedCase(caseItem);
                          setOpenDetails(true);
                        }}
                        sx={{ background: "#1a1f36", color: "white", "&:hover": { background: "#0f1425" } }}
                      >
                        Confirm & Handle
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {cases.length === 0 && (
          <Alert severity="success">All cases have been confirmed. Great work!</Alert>
        )}
      </Box>

      {/* Case Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        {selectedCase && (
          <>
            <DialogContent sx={{ pt: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight="bold">
                  Confirm Snake Bite Case
                </Typography>
                <Alert severity="info" icon={<AlertCircle size={20} />}>
                  Please verify all details before confirming this case
                </Alert>
                <Box sx={{ p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="textSecondary">
                        Patient Name:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedCase.patient_name}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="textSecondary">
                        Age:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedCase.patient_age} years
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="textSecondary">
                        Bite Location:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedCase.bite_location}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="textSecondary">
                        Symptoms:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {selectedCase.symptoms}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenDetails(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={() => confirmBiteCase(selectedCase.id)}
                disabled={loading}
                sx={{ background: "#047857", color: "white", "&:hover": { background: "#065f46" } }}
              >
                {loading ? "Confirming..." : "Confirm Case"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────
// TREATMENT PROVIDER DASHBOARD
// ──────────────────────────────────────────────────────────────────
function TreatmentProviderDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState(0);
  const [cases, setCases] = useState([]);
  const [asvStock, setAsvStock] = useState(0);
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [registerForm, setRegisterForm] = useState({
    patient_name: "",
    patient_age: "",
    patient_gender: "Male",
    bite_location: "Hand",
    symptoms: "",
    snake_type: "Unknown",
  });

  useEffect(() => {
    fetchCases();
    fetchASVStock();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await api.get(`/bite-cases/bite-cases.php?action=getAll&status=confirmed`);
      if (res.data.success) setCases(res.data.data || []);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const fetchASVStock = async () => {
    try {
      const res = await api.get(`/asv-stock/asv-stock.php?action=check&hospital_id=${user.id}`);
      if (res.data.success) {
        setAsvStock(res.data.available_vials || 0);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleRegisterCase = async () => {
    if (!registerForm.patient_name || !registerForm.patient_age) {
      setSnackbar({ open: true, message: "Please fill all required fields", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/bite-cases/bite-cases.php?action=report", {
        ...registerForm,
        reported_by: user.id,
        hospital_id: user.id,
        latitude: 20.5937,
        longitude: 78.9629,
      });

      const data = res.data;

      if (data.success) {
        setSnackbar({ open: true, message: "Case registered successfully!", severity: "success" });
        setOpenRegisterDialog(false);
        setRegisterForm({
          patient_name: "",
          patient_age: "",
          patient_gender: "Male",
          bite_location: "Hand",
          symptoms: "",
          snake_type: "Unknown",
        });
        fetchCases();
      } else {
        setSnackbar({ open: true, message: data.message, severity: "error" });
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Error: " + (err.response?.data?.message || err.message), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Premium Header */}
      <Box sx={{
        background: "linear-gradient(135deg, #1a1f36 0%, #2e3a59 100%)",
        color: "white",
        p: 2.5,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 44, height: 44 }}>
              <Shield size={22} color="white" />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Treatment Provider • Facility Console
              </Typography>
            </Box>
          </Stack>
          <Button
            startIcon={<LogOut size={16} />}
            onClick={logout}
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              borderRadius: "8px",
              textTransform: "none"
            }}
            variant="outlined"
            size="small"
          >
            Logout
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
        {/* ASV Stock Alert */}
        <Card sx={{ mb: 3, borderLeft: `4px solid ${asvStock > 10 ? "#00d4aa" : asvStock > 5 ? "#ffb347" : "#ff6b6b"}` }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  ASV Vials Available: {asvStock}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {asvStock > 10 ? "Healthy stock levels" : asvStock > 5 ? "Low stock warning" : "CRITICAL: Stock running out!"}
                </Typography>
              </Box>
              <Button variant="outlined">Update Stock</Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Active Cases" />
          <Tab label="Referrals" />
          <Tab label="Treatment Updates" />
        </Tabs>

        {/* Cases */}
        {tab === 0 && (
          <Box>
            <Button
              startIcon={<Plus size={18} />}
              variant="contained"
              onClick={() => setOpenRegisterDialog(true)}
              sx={{ mb: 2, background: "#1a1f36", color: "white", "&:hover": { background: "#0f1425" } }}
            >
              Register New Case
            </Button>

            <Grid container spacing={2}>
              {cases.map((caseItem) => (
                <Grid item xs={12} sm={6} md={4} key={caseItem.id}>
                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant="h6" fontWeight="bold">
                          {caseItem.patient_name}
                        </Typography>
                        <Divider />
                        <Stack spacing={1}>
                          <Typography variant="body2">
                            <strong>Age:</strong> {caseItem.patient_age}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Bite Location:</strong> {caseItem.bite_location}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Status:</strong> {caseItem.status}
                          </Typography>
                        </Stack>
                        <Button variant="outlined" fullWidth>
                          Update Treatment
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {tab === 1 && (
          <Alert severity="info">No referrals pending. Refer cases when needed.</Alert>
        )}

        {tab === 2 && (
          <Alert severity="info">No pending treatment updates.</Alert>
        )}
      </Box>

      {/* Register Case Dialog */}
      <Dialog open={openRegisterDialog} onClose={() => setOpenRegisterDialog(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight="bold">
              Register Snake Bite Case
            </Typography>
            <TextField
              label="Patient Name"
              fullWidth
              value={registerForm.patient_name}
              onChange={(e) => setRegisterForm({ ...registerForm, patient_name: e.target.value })}
            />
            <TextField
              label="Patient Age"
              type="number"
              fullWidth
              value={registerForm.patient_age}
              onChange={(e) => setRegisterForm({ ...registerForm, patient_age: e.target.value })}
            />
            <TextField
              label="Bite Location"
              fullWidth
              value={registerForm.bite_location}
              onChange={(e) => setRegisterForm({ ...registerForm, bite_location: e.target.value })}
            />
            <TextField
              label="Symptoms"
              fullWidth
              multiline
              rows={3}
              value={registerForm.symptoms}
              onChange={(e) => setRegisterForm({ ...registerForm, symptoms: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenRegisterDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRegisterCase}
            disabled={loading}
            sx={{ background: "#1a1f36", color: "white", "&:hover": { background: "#0f1425" } }}
          >
            {loading ? "Registering..." : "Register Case"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────
// LOGISTICS/PROGRAM MANAGER DASHBOARD
// ──────────────────────────────────────────────────────────────────
function LogisticsManagerDashboard() {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: "",
    status: "all",
    district: "all",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bite-cases/bite-cases.php?action=getAll&limit=1000`);
      if (res.data.success) {
        setCases(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching cases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.patient_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
        c.id?.toString().includes(filter.search);
      const matchesStatus = filter.status === "all" || c.status === filter.status;
      const matchesDistrict = filter.district === "all" || c.bite_location === filter.district;
      return matchesSearch && matchesStatus && matchesDistrict;
    });
  }, [cases, filter]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'patient_name', headerName: 'Patient Name', flex: 1, minWidth: 150 },
    { field: 'patient_age', headerName: 'Age', width: 80 },
    { field: 'bite_location', headerName: 'Location', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            fontWeight: 700,
            textTransform: 'capitalize',
            bgcolor:
              params.value === 'recovered' ? '#f0fdf4' :
                params.value === 'reported' ? '#fffbeb' :
                  params.value === 'confirmed' ? '#eff6ff' : '#fef2f2',
            color:
              params.value === 'recovered' ? '#16a34a' :
                params.value === 'reported' ? '#d97706' :
                  params.value === 'confirmed' ? '#2563eb' : '#dc2626',
          }}
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'Reported Date',
      width: 150,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Details',
      width: 100,
      renderCell: () => (
        <IconButton size="small" color="primary"><Eye size={18} /></IconButton>
      ),
    }
  ];

  const themeColors = {
    primary: "#1a1f36",
    secondary: "#047857",
    bg: "#f8fafc",
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: themeColors.bg }}>
      {/* Premium Header */}
      <Box sx={{
        background: "linear-gradient(135deg, #1a1f36 0%, #2e3a59 100%)",
        color: "white",
        p: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 48, height: 48 }}>
                <TrendingUp size={24} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
                  Bite Management Console
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  System Overview • Logistics & Strategy
                </Typography>
              </Box>
            </Stack>
            <Button
              startIcon={<LogOut size={18} />}
              onClick={logout}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                borderRadius: "10px",
                textTransform: "none",
                px: 3
              }}
              variant="outlined"
            >
              Sign Out
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: "auto", p: 4 }}>
        {/* Modern Filters */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#94a3b8", mb: 1, display: "block", textTransform: "uppercase" }}>
                  Quick Search
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Patient name or Case ID..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon size={18} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: "12px", bgcolor: "#f1f5f9", "& fieldset": { border: "none" } }
                  }}
                  variant="outlined"
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#94a3b8", mb: 1, display: "block", textTransform: "uppercase" }}>
                  Filter by Status
                </Typography>
                <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
                  {['all', 'reported', 'confirmed', 'recovered', 'died'].map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      onClick={() => setFilter({ ...filter, status: s })}
                      variant={filter.status === s ? "contained" : "outlined"}
                      sx={{
                        textTransform: "capitalize",
                        borderRadius: "8px",
                        bgcolor: filter.status === s ? themeColors.primary : "transparent",
                        color: filter.status === s ? "white" : "text.secondary",
                        borderColor: filter.status === s ? "transparent" : "#e2e8f0",
                        fontWeight: 700,
                        "&:hover": { bgcolor: filter.status === s ? themeColors.primary : "#f8fafc" }
                      }}
                      size="small"
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#94a3b8", mb: 1, display: "block", textTransform: "uppercase" }}>
                  District / Zone
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={filter.district}
                  onChange={(e) => setFilter({ ...filter, district: e.target.value })}
                  SelectProps={{ native: true }}
                  InputProps={{
                    sx: { borderRadius: "12px", bgcolor: "#f1f5f9", "& fieldset": { border: "none" } }
                  }}
                  variant="outlined"
                  size="small"
                >
                  <option value="all">Across All Districts</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Kandy">Kandy</option>
                  {/* ... dynamic options ... */}
                </TextField>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Data Grid Section */}
        <Paper sx={{
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.05)"
        }}>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredCases}
              columns={columns}
              loading={loading}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
              disableSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  fontWeight: 800,
                  color: '#475569',
                },
                '& .MuiDataGrid-row:hover': {
                  bgcolor: '#f1f5f9',
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid #f1f5f9',
                  color: '#1e293b',
                  fontWeight: 500,
                },
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

// ──────────────────────────────────────────────────────────────────
// MAIN ROLE-SWITCHING COMPONENT
// ──────────────────────────────────────────────────────────────────
export default function SnakeBiteCase() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case "community_user":
      return <CommunityUserDashboard />;
    case "chw":
      return <CHWDashboard />;
    case "treatment_provider":
      return <TreatmentProviderDashboard />;
    case "logistics_manager":
    case "admin":
      return <LogisticsManagerDashboard />;
    default:
      return <Box sx={{ p: 3 }}><Alert severity="error">Unauthorized Role View</Alert></Box>;
  }
}