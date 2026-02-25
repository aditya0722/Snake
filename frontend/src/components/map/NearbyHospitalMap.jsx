import { useState, useEffect } from 'react';
import {
  Dialog, Box, Button, Typography,
  TextField, CircularProgress, Paper, Chip
} from '@mui/material';
import { MyLocation, DirectionsCar } from '@mui/icons-material';
import HospitalMap from './components/HospitalMap';

function NearbyHospitalsMap({ hospitals, open, onClose }) {
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [sorted, setSorted] = useState([]);

  useEffect(() => {
    if (!open) {
      setUserLocation(null);
      setError('');
      setSorted([]);
    }
  }, [open]);

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const applyLocation = (lat, lng) => {
    const ranked = hospitals
      .map(h => ({
        ...h,
        distance: haversine(lat, lng, h.lat, h.lng),
      }))
      .sort((a, b) => a.distance - b.distance);

    setSorted(ranked);
    setUserLocation({ lat, lng });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      pos => {
        applyLocation(
          pos.coords.latitude,
          pos.coords.longitude
        );
        setLocating(false);
      },
      () => {
        setError('Permission denied or unavailable.');
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const applyManual = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid coordinates.');
      return;
    }

    applyLocation(lat, lng);
    setError('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{ sx: { height: '85vh' } }}
    >
      <Box sx={{ display: 'flex', height: '100%' }}>

        {/* Sidebar */}
        <Box sx={{ width: 320, p: 2, borderRight: '1px solid #eee' }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={locating ? <CircularProgress size={16} /> : <MyLocation />}
            onClick={detectLocation}
            disabled={locating}
            sx={{ mb: 2 }}
          >
            {locating ? 'Detecting...' : 'Use My Location'}
          </Button>

          <TextField
            fullWidth
            label="Latitude"
            value={manualLat}
            onChange={e => setManualLat(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Longitude"
            value={manualLng}
            onChange={e => setManualLng(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button fullWidth variant="outlined" onClick={applyManual}>
            Apply Coordinates
          </Button>

          {error && (
            <Typography color="error" mt={2}>
              {error}
            </Typography>
          )}

          <Box mt={3}>
            {userLocation && sorted.map(h => (
              <Paper key={h.id} sx={{ p: 1.5, mb: 1 }}>
                <Typography fontWeight={600}>
                  {h.name}
                </Typography>
                <Chip
                  size="small"
                  icon={<DirectionsCar />}
                  label={`${h.distance.toFixed(1)} km`}
                />
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Map */}
        <Box sx={{ flex: 1 }}>
          <HospitalMap
            hospitals={hospitals}
            userLocation={userLocation}
          />
        </Box>
      </Box>
    </Dialog>
  );
}

export default NearbyHospitalsMap;