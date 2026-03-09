import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Avatar, Chip, Card, CardContent,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack,
} from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation, MyLocation, Phone, Email, LocationOn, Close,
  CallOutlined, EmailOutlined, ContentCopy, CheckCircle,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from '../context/authContext';
import api from '../api/axios';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a1f36' },
    background: { default: '#f0f2f5', paper: '#ffffff' },
    text: { primary: '#1a1f36', secondary: '#6b7280' }
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1f36' }
  },
});

const avatarColors = ['#818cf8', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

/**
 * Calculate distance using Haversine formula
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

/**
 * Format distance with color coding
 */
function getDistanceColor(distance) {
  const km = parseFloat(distance);
  if (km < 10) return '#10b981'; // Green - very close
  if (km < 25) return '#3b82f6'; // Blue - close
  if (km < 50) return '#f59e0b'; // Orange - moderate
  return '#ef4444'; // Red - far
}

function RescuerContactDialog({ rescuer, open, onClose, distance }) {
  if (!rescuer) return null;
  const color = getAvatarColor(rescuer.user_name || rescuer.name || 'U');

  const handleCall = () => window.open(`tel:${(rescuer.phone_number || "6767676676").replace(/\s/g, '')}`);
  const handleEmail = () => window.open(`mailto:${rescuer.email}`);
  const handleCopyPhone = () => navigator.clipboard.writeText(rescuer.phone_number || rescuer.phone);
  const handleGetDirections = () => {
    if (rescuer.latitude && rescuer.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${rescuer.latitude},${rescuer.longitude}`, '_blank');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Rescuer Details</Typography>
          <IconButton size="small" onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 2 }}>
          <Avatar sx={{ width: 64, height: 64, fontSize: '1.5rem', fontWeight: 700, background: color }}>
            {(rescuer.user_name || rescuer.name || 'U').charAt(0)}
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '220px'
              }}
              title={rescuer.user_name || rescuer.name}
            >
              {rescuer.user_name || rescuer.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <LocationOn sx={{ fontSize: 14, color: '#ef4444' }} />
              <Typography variant="body2">{rescuer.district}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <Navigation sx={{ fontSize: 14, color: getDistanceColor(distance) }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: getDistanceColor(distance) }}>
                {distance} km away
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e5e7eb' }}>
            <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, display: 'block', mb: 0.75 }}>PHONE</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{rescuer.phone_number || rescuer.phone}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" onClick={handleCopyPhone}><ContentCopy sx={{ fontSize: 16 }} /></IconButton>
                <IconButton size="small" onClick={handleCall}><CallOutlined sx={{ fontSize: 16 }} /></IconButton>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #e5e7eb' }}>
            <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, display: 'block', mb: 0.75 }}>EMAIL</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{rescuer.email}</Typography>
              <IconButton size="small" onClick={handleEmail}><EmailOutlined sx={{ fontSize: 16 }} /></IconButton>
            </Box>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckCircle sx={{ fontSize: 20, color: '#10b981' }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>Verified Rescuer</Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#047857' }}>
              This rescuer is verified and active in the system.
            </Typography>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} sx={{ px: 2 }}>Close</Button>
        <Button
          variant="contained"
          startIcon={<Navigation />}
          onClick={handleGetDirections}
          sx={{ background: '#10b981', color: 'white', '&:hover': { background: '#059669' } }}
        >
          Get Directions
        </Button>
        <Button
          variant="contained"
          startIcon={<CallOutlined />}
          onClick={handleCall}
          sx={{ background: '#1a1f36', color: 'white', '&:hover': { background: '#0f1425' } }}
        >
          Call Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Fix Leaflet's broken default icon path in bundlers (Vite/CRA)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function NearestRescuers() {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [rescuers, setRescuers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [selectedRescuer, setSelectedRescuer] = useState(null);
  const [mapView, setMapView] = useState('map'); // 'map' or 'list'
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = (message, severity = 'success') => setSnack({ open: true, message, severity });

  // Initialize map
  useEffect(() => {
    if (mapView !== 'map' || !mapRef.current) return;

    // Small delay to ensure container is ready
    const timer = setTimeout(() => {
      // Avoid double-init
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const defaultCenter = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [6.9271, 80.7789];

      const map = L.map(mapRef.current, {
        zoomControl: true,
        tap: false
      }).setView(defaultCenter, userLocation ? 12 : 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add user location marker
      if (userLocation) {
        L.circleMarker([userLocation.lat, userLocation.lng], {
          radius: 8,
          fillColor: '#1a1f36',
          color: '#10b981',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map).bindPopup('Your Location');
      }

      // Add rescuer markers
      markersRef.current = [];
      rescuers.forEach(rescuer => {
        if (rescuer.latitude && rescuer.longitude) {
          const markerColor = rescuer.is_verified ? '#10b981' : '#f59e0b';
          const marker = L.circleMarker(
            [parseFloat(rescuer.latitude), parseFloat(rescuer.longitude)],
            {
              radius: 10,
              fillColor: markerColor,
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.9,
            }
          ).addTo(map);

          marker.bindPopup(`
            <div style="font-family: Inter, sans-serif; padding: 5px;">
              <strong style="display: block; margin-bottom: 5px;">${rescuer.user_name || rescuer.name}</strong>
              <span style="display: block; color: #666; font-size: 11px; margin-bottom: 8px;">${rescuer.district} District</span>
              <div style="font-weight: 700; color: #10b981; font-size: 11px; margin-bottom: 8px;">${rescuer.distance || 'N/A'} km away</div>
            </div>
          `);

          marker.on('click', () => setSelectedRescuer(rescuer));
          markersRef.current.push(marker);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [mapView, userLocation, rescuers]);

  // Handle map resizing when switching views
  useEffect(() => {
    if (mapView === 'map' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 200);
    }
  }, [mapView]);

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocating(false);
        showSnack('Location updated successfully', 'success');
      },
      (error) => {
        let msg = 'Could not get your location.';
        if (error.code === 1) msg = 'Location access denied. Please enable it in browser settings.';
        else if (error.code === 2) msg = 'Location unavailable accurately.';
        else if (error.code === 3) msg = 'Location request timed out.';

        setLocationError(msg);
        setLocating(false);
        showSnack(msg, 'error');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Fetch rescuers
  useEffect(() => {
    const fetchRescuers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/rescuers/rescuers.php?action=getVerified&limit=100');
        if (response.data?.success) {
          let data = response.data.data || [];

          // Calculate distances if user location available
          if (userLocation) {
            data = data.map(rescuer => ({
              ...rescuer,
              distance: calculateDistance(
                userLocation.lat,
                userLocation.lng,
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

    fetchRescuers();
  }, [userLocation]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: "#1a1f36", fontFamily: '"DM Sans", sans-serif', lineHeight: 1.2 }}
            >
              Nearest Rescuers
            </Typography>
            <Typography sx={{ color: "#64748b", mt: 0.5, fontSize: '0.95rem' }}>
              Find verified and available snake rescuers near your current coordinates
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label="Live · Community"
              size="small"
              sx={{ background: '#3b82f618', color: '#3b82f6', fontWeight: 700, border: '1px solid #3b82f640' }}
            />
            <Button
              variant="contained"
              startIcon={locating ? <CircularProgress size={14} /> : <MyLocation />}
              onClick={getUserLocation}
              disabled={locating}
              sx={{
                bgcolor: "#1a1f36",
                color: "white",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                "&:hover": { bgcolor: "#2e3a59" }
              }}
            >
              {locating ? "Locating..." : "Refresh My Location"}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {locationError && (
            <Alert severity="info" onClose={() => setLocationError(null)} sx={{ mb: 3 }}>
              {locationError}
            </Alert>
          )}

          {/* View Toggle & Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, bgcolor: '#f1f5f9', p: 0.5, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Button
                onClick={() => setMapView('map')}
                sx={{
                  bgcolor: mapView === 'map' ? 'white' : 'transparent',
                  color: mapView === 'map' ? '#1a1f36' : '#64748b',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                  boxShadow: mapView === 'map' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  "&:hover": { bgcolor: mapView === 'map' ? 'white' : 'rgba(0,0,0,0.04)' }
                }}
              >
                📍 Map View
              </Button>
              <Button
                onClick={() => setMapView('list')}
                sx={{
                  bgcolor: mapView === 'list' ? 'white' : 'transparent',
                  color: mapView === 'list' ? '#1a1f36' : '#64748b',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2.5,
                  boxShadow: mapView === 'list' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  "&:hover": { bgcolor: mapView === 'list' ? 'white' : 'rgba(0,0,0,0.04)' }
                }}
              >
                📋 List View
              </Button>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              {userLocation && (
                <Chip
                  icon={<CheckCircle sx={{ fontSize: '16px !important', color: '#10b981 !important' }} />}
                  label={`${rescuers.length} rescuers found`}
                  sx={{ height: 32, bgcolor: '#f0fdf4', color: '#10b981', fontWeight: 700, borderRadius: 2 }}
                />
              )}
            </Stack>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress />
            </Box>
          ) : mapView === 'map' ? (
            // Map View
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', height: { xs: 500, md: 700 }, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Box ref={mapRef} sx={{ width: '100%', height: '100%' }} />
            </Paper>
          ) : (
            // List View
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead sx={{ background: '#f3f4f6' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Rescuer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>District</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Distance</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rescuers.map((rescuer) => (
                    <TableRow
                      key={rescuer.id}
                      sx={{
                        '&:hover': { background: '#f9fafb' },
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedRescuer(rescuer)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              background: getAvatarColor(rescuer.user_name || rescuer.name || 'U'),
                              fontWeight: 700
                            }}
                          >
                            {(rescuer.user_name || rescuer.name || 'U').charAt(0)}
                          </Avatar>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '180px'
                            }}
                            title={rescuer.user_name || rescuer.name}
                          >
                            {rescuer.user_name || rescuer.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{rescuer.district}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${rescuer.distance} km`}
                          sx={{
                            background: getDistanceColor(rescuer.distance) + '20',
                            color: getDistanceColor(rescuer.distance),
                            fontWeight: 700
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${(rescuer.phone_number || rescuer.phone).replace(/\s/g, '')}`);
                          }}
                          sx={{ background: '#1a1f36', color: 'white', '&:hover': { background: '#0f1425' } }}
                        >
                          Call
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Distance Legend */}
          {mapView === 'map' && (
            <Paper sx={{ p: 2, mt: 3, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Distance Legend:</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }} />
                  <Typography variant="caption">Very Close (&lt;10 km)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }} />
                  <Typography variant="caption">Close (10-25 km)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
                  <Typography variant="caption">Moderate (25-50 km)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                  <Typography variant="caption">Far (&gt;50 km)</Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>

        <RescuerContactDialog
          rescuer={selectedRescuer}
          open={Boolean(selectedRescuer)}
          onClose={() => setSelectedRescuer(null)}
          distance={selectedRescuer?.distance || 'N/A'}
        />

        <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.message}</Alert>
        </Snackbar>
      </Box>
    
    </ThemeProvider >
  );
}