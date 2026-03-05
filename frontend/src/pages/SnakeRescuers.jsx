import { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Avatar, Chip, Card, CardContent,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
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
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{rescuer.user_name || rescuer.name}</Typography>
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
          sx={{ background: '#10b981', '&:hover': { background: '#059669' } }}
        >
          Get Directions
        </Button>
        <Button 
          variant="contained" 
          startIcon={<CallOutlined />} 
          onClick={handleCall}
          sx={{ background: '#1a1f36' }}
        >
          Call Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function NearestRescuers() {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const [rescuers, setRescuers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedRescuer, setSelectedRescuer] = useState(null);
  const [mapView, setMapView] = useState('map'); // 'map' or 'list'
  const [snack, setSnack] = useState({ open: false, message: '' });

  const showSnack = (message) => setSnack({ open: true, message });

  // Initialize map
  useEffect(() => {
    if (mapView === 'map' && mapRef.current && !mapInstanceRef.current) {
      // Dynamically load Leaflet
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = () => {
        const L = window.L;
        const defaultCenter = userLocation 
          ? [userLocation.lat, userLocation.lon]
          : [6.9271, 80.7789]; // Sri Lanka center

        const map = L.map(mapRef.current, {
          zoom: userLocation ? 12 : 7,
          center: defaultCenter,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Add user location marker
        if (userLocation) {
          L.circleMarker([userLocation.lat, userLocation.lon], {
            radius: 8,
            fillColor: '#1a1f36',
            color: '#10b981',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map).bindPopup('Your Location');
        }

        // Add rescuer markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        rescuers.forEach(rescuer => {
          if (rescuer.latitude && rescuer.longitude) {
            const markerColor = rescuer.is_verified ? '#10b981' : '#f59e0b';
            const marker = L.circleMarker(
              [parseFloat(rescuer.latitude), parseFloat(rescuer.longitude)],
              {
                radius: 12,
                fillColor: markerColor,
                color: '#fff',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.9,
              }
            ).addTo(map);

            marker.bindPopup(`
              <div style="font-family: Arial; font-size: 12px;">
                <strong>${rescuer.user_name}</strong><br/>
                ${rescuer.district}<br/>
                ${rescuer.distance} km away
              </div>
            `);

            marker.on('click', () => setSelectedRescuer(rescuer));
            markersRef.current.push(marker);
          }
        });
      };
      document.body.appendChild(script);
    }
  }, [mapView, userLocation, rescuers]);

  // Get user location
  useEffect(() => {
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
          setLocationError('Could not get your location. Using default view.');
        }
      );
    }
  }, []);

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

    fetchRescuers();
  }, [userLocation]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#f0f2f5' }}>
        {/* Header */}
        <Box sx={{ background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)', color: 'white', p: 3 }}>
          <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              🗺️ Nearest Rescuers
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Find verified snake rescuers near your location
            </Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
          {locationError && (
            <Alert severity="info" onClose={() => setLocationError(null)} sx={{ mb: 3 }}>
              {locationError}
            </Alert>
          )}

          {/* View Toggle & Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant={mapView === 'map' ? 'contained' : 'outlined'}
                onClick={() => setMapView('map')}
                sx={{ background: mapView === 'map' ? '#1a1f36' : undefined }}
              >
                📍 Map View
              </Button>
              <Button 
                variant={mapView === 'list' ? 'contained' : 'outlined'}
                onClick={() => setMapView('list')}
                sx={{ background: mapView === 'list' ? '#1a1f36' : undefined }}
              >
                📋 List View
              </Button>
            </Box>
            {userLocation && (
              <Chip
                icon={<MyLocation />}
                label={`${rescuers.length} rescuers found`}
                sx={{ height: 32, bgcolor: '#f0fdf4', color: '#10b981', fontWeight: 700 }}
              />
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
              <CircularProgress />
            </Box>
          ) : mapView === 'map' ? (
            // Map View
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', height: 600 }}>
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
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                          sx={{ background: '#3b82f6' }}
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

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })}>
          <Alert severity="success" variant="filled">{snack.message}</Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}