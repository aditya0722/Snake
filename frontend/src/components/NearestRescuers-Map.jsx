import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Snackbar, Alert, CircularProgress,
  FormControlLabel, Switch, Card, CardContent,
} from '@mui/material';
import {
  Add, Phone, LocationOn, CheckCircle, Pending, Edit, Email,
  Shield, EmojiEvents, WorkspacePremium, LogoutOutlined, Close,
  ContentCopy, CallOutlined, EmailOutlined, Navigation, MyLocation,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from '../context/authContext';
import api from '../api/axios';

const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#1a1f36' }, background: { default: '#f0f2f5', paper: '#ffffff' }, text: { primary: '#1a1f36', secondary: '#6b7280' } },
  typography: { fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif', h4: { fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1f36' } },
  shape: { borderRadius: 4 },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 10, '& fieldset': { borderColor: '#e5e7eb' }, '&:hover fieldset': { borderColor: '#1a1f36' }, '&.Mui-focused fieldset': { borderColor: '#1a1f36' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#1a1f36' } } } },
  },
});

const avatarColors = ['#818cf8', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
}

function ContactDialog({ rescuer, open, onClose, onSnack, userLocation, sortByDistance }) {
  if (!rescuer) return null;
  const color = getAvatarColor(rescuer.user_name || rescuer.name || 'U');
  const distance = userLocation && rescuer.latitude && rescuer.longitude
    ? calculateDistance(userLocation.lat, userLocation.lon, parseFloat(rescuer.latitude), parseFloat(rescuer.longitude))
    : null;

  const handleCall = () => window.open(`tel:${(rescuer.phone_number || rescuer.phone).replace(/\s/g, '')}`);
  const handleEmail = () => window.open(`mailto:${rescuer.email}`);
  const handleCopyPhone = () => { navigator.clipboard.writeText(rescuer.phone_number || rescuer.phone); onSnack('Phone number copied!'); onClose(); };
  const handleGetDirections = () => {
    if (rescuer.latitude && rescuer.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${rescuer.latitude},${rescuer.longitude}`, '_blank');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Contact Rescuer</Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: '#9ca3af' }}><Close sx={{ fontSize: 18 }} /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 1 }}>
          <Avatar sx={{ width: 56, height: 56, fontSize: '1.4rem', fontWeight: 700, background: color, boxShadow: `0 0 0 3px white, 0 0 0 4px ${color}55` }}>
            {(rescuer.user_name || rescuer.name || 'U').charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1f36' }}>{rescuer.user_name || rescuer.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 13, color: '#ef4444' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>{rescuer.district} District</Typography>
            </Box>
            {distance && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                <Navigation sx={{ fontSize: 12, color: '#10b981' }} />
                <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>{distance} km away</Typography>
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone sx={{ fontSize: 18, color: '#3b82f6' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, display: 'block', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1f36' }}>{rescuer.phone_number || rescuer.phone}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" onClick={handleCopyPhone} sx={{ color: '#9ca3af', '&:hover': { color: '#3b82f7', background: '#eff6ff' } }}><ContentCopy sx={{ fontSize: 16 }} /></IconButton>
                <IconButton size="small" onClick={handleCall} sx={{ color: '#9ca3af', '&:hover': { color: '#10b981', background: '#f0fdf4' } }}><CallOutlined sx={{ fontSize: 16 }} /></IconButton>
              </Box>
            </Box>
          </Paper>
          <Paper sx={{ p: 2, borderRadius: 2.5, border: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Email sx={{ fontSize: 18, color: '#8b5cf6' }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, display: 'block', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1f36' }}>{rescuer.email}</Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={handleEmail} sx={{ color: '#9ca3af', '&:hover': { color: '#8b5cf6', background: '#f5f3ff' } }}><EmailOutlined sx={{ fontSize: 16 }} /></IconButton>
            </Box>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        {distance && (
          <Button fullWidth variant="outlined" startIcon={<Navigation />} onClick={handleGetDirections}
            sx={{ borderColor: '#e5e7eb', color: '#10b981', py: 1.2, '&:hover': { borderColor: '#10b981', background: '#f0fdf4' } }}>
            Get Directions
          </Button>
        )}
        <Button fullWidth variant="outlined" startIcon={<EmailOutlined />} onClick={handleEmail}
          sx={{ borderColor: '#e5e7eb', color: '#8b5cf6', py: 1.2, '&:hover': { borderColor: '#8b5cf6', background: '#f5f3ff' } }}>
          Send Email
        </Button>
        <Button fullWidth variant="contained" startIcon={<CallOutlined />} onClick={handleCall}
          sx={{ background: '#1a1f36', color: '#fff', py: 1.2, boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' } }}>
          Call Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function UnregisterDialog({ rescuer, open, onClose, onConfirm, loading }) {
  if (!rescuer) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogoutOutlined sx={{ color: '#ef4444', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Unregister Rescuer</Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>Remove from system</Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Are you sure you want to unregister <strong style={{ color: '#1a1f36' }}>{rescuer.user_name || rescuer.name}</strong>? They will no longer be registered as a rescuer and cannot receive incident alerts.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: '#6b7280', border: '1px solid #e5e7eb', px: 2.5 }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" disabled={loading}
          sx={{ background: '#ef4444', color: '#fff', px: 3, boxShadow: 'none', '&:hover': { background: '#dc2626', boxShadow: 'none' } }}>
          {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Unregister
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RescuerCard({ rescuer, onContact, onUnregister, isAdmin, loading, userLocation, distance }) {
  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: 4, background: rescuer.is_verified ? '#10b981' : '#f59e0b' }} />
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 52, height: 52, fontSize: '1.3rem', fontWeight: 700, background: getAvatarColor(rescuer.user_name || rescuer.name || 'U'), boxShadow: `0 0 0 3px white, 0 0 0 4px ${getAvatarColor(rescuer.user_name || rescuer.name || 'U')}33` }}>
              {(rescuer.user_name || rescuer.name || 'U').charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#1a1f36' }}>{rescuer.user_name || rescuer.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                <LocationOn sx={{ fontSize: 13, color: '#ef4444' }} />
                <Typography variant="caption" sx={{ color: '#6b7280' }}>{rescuer.district}</Typography>
              </Box>
              {distance && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                  <Navigation sx={{ fontSize: 12, color: '#10b981' }} />
                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>{distance} km away</Typography>
                </Box>
              )}
            </Box>
          </Box>
          {isAdmin && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Chip
                label={rescuer.is_verified ? 'Verified' : 'Pending'} size="small"
                icon={rescuer.is_verified ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Pending sx={{ fontSize: '14px !important' }} />}
                sx={{ height: 24, fontSize: '0.65rem', fontWeight: 700, background: rescuer.is_verified ? '#f0fdf4' : '#fffbeb', color: rescuer.is_verified ? '#059669' : '#d97706', border: `1px solid ${rescuer.is_verified ? '#10b98133' : '#f59e0b33'}`, '& .MuiChip-icon': { color: rescuer.is_verified ? '#059669' : '#d97706' } }}
              />
              {isAdmin && (
                <IconButton size="small" onClick={() => onUnregister(rescuer)} disabled={loading} sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' }, p: 0.25 }}>
                  <LogoutOutlined sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Phone sx={{ fontSize: 14, color: '#3b82f6', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>{rescuer.phone_number || rescuer.phone}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Email sx={{ fontSize: 14, color: '#8b5cf6', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>{rescuer.email}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto', mb: 2 }}>
          <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, background: '#f8fafc', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
              <LocationOn sx={{ fontSize: 14, color: '#ef4444' }} />
              <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distance</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1f36' }}>
              {distance ? `${distance} km` : 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, background: '#f8fafc', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
              <EmojiEvents sx={{ fontSize: 14, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1f36' }}>{rescuer.is_verified ? 'Active' : 'Pending'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button fullWidth variant="outlined" size="small" startIcon={<Phone sx={{ fontSize: 14 }} />} onClick={() => onContact(rescuer)}
            sx={{ borderColor: '#e5e7eb', color: '#3b82f6', fontWeight: 600, py: 0.8, '&:hover': { borderColor: '#3b82f6', background: '#eff6ff' } }}>Contact</Button>
          {isAdmin && (
            <Button fullWidth variant="outlined" size="small" startIcon={<LogoutOutlined sx={{ fontSize: 14 }} />} onClick={() => onUnregister(rescuer)} disabled={loading}
              sx={{ borderColor: '#e5e7eb', color: '#ef4444', fontWeight: 600, py: 0.8, '&:hover': { borderColor: '#ef4444', background: '#fef2f2' } }}>Unregister</Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default function SnakeRescuers() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rescuers, setRescuers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [contactRescuer, setContactRescuer] = useState(null);
  const [unregisterRescuer, setUnregisterRescuer] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '' });

  const showSnack = (message) => setSnack({ open: true, message });

  // Get user's location
  useEffect(() => {
    if (sortByDistance && !userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
            setLocationError(null);
          },
          (error) => {
            setLocationError('Could not get your location. Please enable location services.');
            setSortByDistance(false);
          }
        );
      } else {
        setLocationError('Geolocation is not supported by your browser.');
        setSortByDistance(false);
      }
    }
  }, [sortByDistance, userLocation]);

  // Fetch verified rescuers
  const fetchRescuers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rescuers/rescuers.php?action=getVerified&limit=100');
      if (response.data?.success) {
        let data = response.data.data || [];
        
        // Sort by distance if enabled
        if (sortByDistance && userLocation) {
          data = data.map(rescuer => ({
            ...rescuer,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lon,
              parseFloat(rescuer.latitude),
              parseFloat(rescuer.longitude)
            )
          })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        }
        
        setRescuers(data);
      }
    } catch (err) {
      showSnack('Failed to fetch rescuers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescuers();
  }, []);

  // Re-fetch when sort changes
  useEffect(() => {
    if (sortByDistance && userLocation) {
      fetchRescuers();
    }
  }, [sortByDistance, userLocation]);

  const handleUnregister = async () => {
    if (!unregisterRescuer) return;
    try {
      setLoading(true);
      const response = await api.post('/rescuers/rescuers.php?action=reject', {
        rescuer_id: unregisterRescuer.id,
        reason: 'Unregistered by admin'
      });
      if (response.data?.success) {
        setRescuers(rescuers.filter(r => r.id !== unregisterRescuer.id));
        showSnack(`${unregisterRescuer.user_name} has been unregistered.`);
        setUnregisterRescuer(null);
      }
    } catch (err) {
      showSnack('Failed to unregister rescuer');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifiedCount = rescuers.filter(r => r.is_verified).length;
  const summaryCards = [
    { value: rescuers.length, label: 'TOTAL RESCUERS', color: '#818cf8', bg: '#eef2ff' },
    { value: verifiedCount, label: 'VERIFIED', color: '#10b981', bg: '#f0fdf4' },
    { value: userLocation ? rescuers.filter(r => calculateDistance(userLocation.lat, userLocation.lon, parseFloat(r.latitude), parseFloat(r.longitude)) < 50).length : 0, label: 'WITHIN 50KM', color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#f0f2f5', p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>Snake Rescuers</Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>Verified rescuers in your network {userLocation && '• Distance enabled'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {userLocation && (
              <Chip
                icon={<MyLocation />}
                label="Location Enabled"
                sx={{ height: 32, bgcolor: '#f0fdf4', color: '#10b981', fontWeight: 700, borderRadius: 2 }}
              />
            )}
            <FormControlLabel
              control={<Switch checked={sortByDistance} onChange={(e) => setSortByDistance(e.target.checked)} />}
              label="Sort by Distance"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        {locationError && (
          <Alert severity="warning" onClose={() => setLocationError(null)} sx={{ mb: 3 }}>
            {locationError}
          </Alert>
        )}

        {loading && rescuers.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {summaryCards.map((card) => (
                <Grid item xs={6} sm={4} key={card.label}>
                  <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ minWidth: 48, height: 48, borderRadius: 2, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ color: card.color, fontWeight: 800, fontSize: '1.3rem' }}>{card.value}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.3 }}>{card.label}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {rescuers.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Shield sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                  No verified rescuers yet
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2.5}>
                {rescuers.map(rescuer => (
                  <Grid item xs={12} sm={6} lg={4} xl={3} key={rescuer.id}>
                    <RescuerCard 
                      rescuer={rescuer} 
                      onContact={setContactRescuer} 
                      onUnregister={setUnregisterRescuer}
                      isAdmin={isAdmin}
                      loading={loading}
                      userLocation={userLocation}
                      distance={rescuer.distance}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        <ContactDialog rescuer={contactRescuer} open={Boolean(contactRescuer)} onClose={() => setContactRescuer(null)} onSnack={showSnack} userLocation={userLocation} />
        <UnregisterDialog rescuer={unregisterRescuer} open={Boolean(unregisterRescuer)} onClose={() => setUnregisterRescuer(null)} onConfirm={handleUnregister} loading={loading} />

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="success" variant="filled" onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}