import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, Chip, Alert,
  CircularProgress, Grid, IconButton, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, FormControlLabel, Switch,
} from '@mui/material';
import {
  LocalHospital, LocationOn, Send, Close, CheckCircle, Warning,
  Emergency, History, Phone, Email, Person,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from '../context/authContext';
import api from '../api/axios';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#dc2626' },
    background: { default: '#fef2f2', paper: '#ffffff' },
    text: { primary: '#1a1f36', secondary: '#6b7280' }
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1f36' }
  },
});

const statusColors = {
  reported: { label: 'Reported', emoji: '📝', color: '#3b82f6', bg: '#eff6ff' },
  confirmed: { label: 'Confirmed', emoji: '✅', color: '#10b981', bg: '#f0fdf4' },
  under_treatment: { label: 'Under Treatment', emoji: '🏥', color: '#f59e0b', bg: '#fffbeb' },
  recovered: { label: 'Recovered', emoji: '😊', color: '#8b5cf6', bg: '#f5f3ff' },
  death: { label: 'Deceased', emoji: '😔', color: '#6b7280', bg: '#f3f4f6' },
};

function ReportBiteCaseDialog({ open, onClose, onSubmit, loading, userLocation, hospitals }) {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: 'male',
    snake_id: null,
    hospital_id: null,
    bite_location: '',
    latitude: userLocation?.lat || null,
    longitude: userLocation?.lon || null,
    bite_time: new Date().toISOString().slice(0, 16),
    symptoms: '',
    treatment_given: '',
  });

  const [errors, setErrors] = useState({});

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setErrors({ location: 'Could not get location. Please enable location services.' });
        }
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patient_name) newErrors.patient_name = 'Patient name is required';
    if (!formData.patient_age || formData.patient_age <= 0 || formData.patient_age > 150) newErrors.patient_age = 'Valid age required';
    if (!formData.patient_gender) newErrors.patient_gender = 'Gender is required';
    if (!formData.bite_location) newErrors.bite_location = 'Bite location is required';
    if (formData.latitude === null || formData.longitude === null) newErrors.location = 'Location coordinates required';
    if (!formData.symptoms) newErrors.symptoms = 'Symptoms are required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>🚑 Report Snake Bite Case</Typography>
          <IconButton size="small" onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {/* Patient Information */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626', mt: 1 }}>Patient Information</Typography>
          
          <TextField
            fullWidth
            label="Patient Name"
            value={formData.patient_name}
            onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
            error={!!errors.patient_name}
            helperText={errors.patient_name}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <TextField
              label="Age"
              type="number"
              value={formData.patient_age}
              onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })}
              error={!!errors.patient_age}
              helperText={errors.patient_age}
            />
            <FormControl fullWidth error={!!errors.patient_gender}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.patient_gender}
                onChange={(e) => setFormData({ ...formData, patient_gender: e.target.value })}
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Bite Details */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626', mt: 2 }}>Bite Details</Typography>

          <TextField
            fullWidth
            label="Bite Location on Body"
            placeholder="e.g., Left leg, Right hand, Torso..."
            value={formData.bite_location}
            onChange={(e) => setFormData({ ...formData, bite_location: e.target.value })}
            error={!!errors.bite_location}
            helperText={errors.bite_location}
          />

          <TextField
            fullWidth
            label="Date & Time of Bite"
            type="datetime-local"
            value={formData.bite_time}
            onChange={(e) => setFormData({ ...formData, bite_time: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Symptoms Observed"
            placeholder="Describe symptoms: swelling, bleeding, pain, numbness, etc..."
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            error={!!errors.symptoms}
            helperText={errors.symptoms}
          />

          <TextField
            fullWidth
            multiline
            rows={2}
            label="First Aid Treatment Given"
            placeholder="Describe any treatment given before reporting..."
            value={formData.treatment_given}
            onChange={(e) => setFormData({ ...formData, treatment_given: e.target.value })}
          />

          {/* Location */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626', mt: 2 }}>Location Information</Typography>

          <TextField
            fullWidth
            label="Exact Location Name"
            placeholder="e.g., My house, Market street, School..."
            value={formData.bite_location}
            onChange={(e) => setFormData({ ...formData, bite_location: e.target.value })}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <TextField
              size="small"
              label="Latitude"
              value={formData.latitude || ''}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
              error={!!errors.latitude}
            />
            <TextField
              size="small"
              label="Longitude"
              value={formData.longitude || ''}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
              error={!!errors.latitude}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<LocationOn />}
            onClick={handleGetLocation}
            fullWidth
            sx={{ color: '#dc2626', borderColor: '#dc2626' }}
          >
            Get Current Location
          </Button>

          {/* Hospital Selection */}
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#dc2626', mt: 2 }}>Hospital Assignment</Typography>

          <FormControl fullWidth>
            <InputLabel>Select Hospital (Optional)</InputLabel>
            <Select
              value={formData.hospital_id || ''}
              onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value || null })}
              label="Select Hospital (Optional)"
            >
              <MenuItem value="">None</MenuItem>
              {hospitals.map((h) => (
                <MenuItem key={h.id} value={h.id}>
                  {h.name} - {h.district}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Alert */}
          <Alert severity="error" icon={<Emergency />} sx={{ borderRadius: 2, mt: 2 }}>
            This is an EMERGENCY case. Rescue teams and hospitals will be notified immediately. Please ensure all information is accurate.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          sx={{ background: '#dc2626' }}
        >
          {loading ? 'Reporting...' : 'Report Emergency'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ReportBiteCase() {
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [myCases, setMyCases] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  };

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => console.log('Could not get location')
      );
    }

    // Fetch hospitals
    fetchHospitals();
    // Fetch user's cases
    fetchMyCases();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await api.get('/hospitals/hospitals.php?action=getAll&limit=100');
      if (response.data?.success) {
        setHospitals(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyCases = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bite_cases/bite_cases.php?action=getMy&user_id=${user?.id}&limit=10`);
      if (response.data?.success) {
        setMyCases(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportCase = async (formData) => {
    try {
      setLoading(true);
      const response = await api.post('/bite_cases/bite_cases.php?action=report', {
        reported_by: user?.id,
        ...formData,
      });
      console.log(response.data);
      

      if (response.data?.success) {
        showSnack(
          `🚑 EMERGENCY REPORTED! ${response.data.data?.nearby_rescuers || 0} rescue teams and hospitals have been alerted!`,
          'success'
        );
        setOpenDialog(false);
        fetchMyCases();
      }
    } catch (err) {
      showSnack(err.response?.data?.message || 'Failed to report case', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const s = statusColors[status] || statusColors.reported;
    return (
      <Chip
        icon={<Typography>{s.emoji}</Typography>}
        label={s.label}
        sx={{ background: s.bg, color: s.color, fontWeight: 700 }}
      />
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Emergency sx={{ fontSize: 32 }} /> Report Snake Bite Case
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                  Emergency reporting for snake bite incidents - Rescue teams will be notified immediately
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Emergency />}
                onClick={() => setOpenDialog(true)}
                sx={{ background: '#dc2626', px: 3, py: 1.5, borderRadius: 2 }}
              >
                Report Bite Case Now
              </Button>
            </Box>

            {/* Statistics Cards */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, border: '2px solid #fecaca' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#dc2626' }}>{myCases.length}</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Total Cases Reported</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, border: '2px solid #fecaca' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                      {myCases.filter(c => ['reported', 'confirmed', 'under_treatment'].includes(c.status)).length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Active Cases</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, border: '2px solid #fecaca' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981' }}>
                      {myCases.filter(c => c.status === 'recovered').length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Recovered</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 2, border: '2px solid #fecaca' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>
                      {userLocation ? '✅' : '❌'}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>Location Access</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Case History */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <History /> Case History
            </Typography>
            {myCases.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Emergency sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#9ca3af' }}>
                  No cases reported yet. Click "Report Bite Case Now" to submit an emergency case.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table>
                  <TableHead sx={{ background: '#fef2f2' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Patient</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Age/Gender</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Bite Location</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Hospital</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reported</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myCases.map((caseItem) => (
                      <TableRow key={caseItem.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{caseItem.patient_name}</TableCell>
                        <TableCell>{caseItem.patient_age} / {caseItem.patient_gender}</TableCell>
                        <TableCell>{caseItem.bite_location}</TableCell>
                        <TableCell>{caseItem.hospital_name || 'Not assigned'}</TableCell>
                        <TableCell>{getStatusChip(caseItem.status)}</TableCell>
                        <TableCell>{new Date(caseItem.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Box>

        <ReportBiteCaseDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSubmit={handleReportCase}
          loading={loading}
          userLocation={userLocation}
          hospitals={hospitals}
        />

        {snack.open && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: snack.severity === 'success' ? '#10b981' : '#ef4444',
              color: 'white',
              p: 2,
              borderRadius: 2,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              zIndex: 9999,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {snack.message}
            </Typography>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}