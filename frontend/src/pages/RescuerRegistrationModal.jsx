import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Button, Alert, CircularProgress, Typography, Chip,
  CheckCircle, LocationOff,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';

export default function RescuerRegistrationModal({
  open,
  onClose,
  onConfirm,
  loading,
  locationData,
  userDistrict,
}) {
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        onConfirm({
          latitude: parseFloat(position.coords.latitude.toFixed(6)),
          longitude: parseFloat(position.coords.longitude.toFixed(6)),
          district: userDistrict,
        });
      },
      error => {
        alert(`Error getting location: ${error.message}`);
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationOn sx={{ color: '#10b981' }} />
        Apply as Snake Rescuer
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Info Alert */}
        <Alert severity="info" sx={{ mb: 2.5 }}>
          To register as a snake rescuer, we need your location. This helps us connect you with nearby incidents.
        </Alert>

        {/* Location Status Box */}
        <Box sx={{ p: 2.5, backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {locationData?.latitude && locationData?.longitude ? (
              <CheckCircle sx={{ color: '#10b981', fontSize: 28 }} />
            ) : (
              <LocationOff sx={{ color: '#9ca3af', fontSize: 28 }} />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, color: '#1a1f36', mb: 0.5 }}>
                {locationData?.latitude && locationData?.longitude ? 'Location Captured' : 'Location Required'}
              </Typography>
              {locationData?.latitude && locationData?.longitude ? (
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Latitude: {locationData.latitude}, Longitude: {locationData.longitude}
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Click below to share your current location
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* District Info */}
        <Box sx={{ mb: 2.5, p: 2, backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>SERVICE DISTRICT</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Chip label={userDistrict} size="small" sx={{ bgcolor: '#e0f2f1', color: '#00796b', fontWeight: 600 }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>You'll receive alerts for this district</Typography>
          </Box>
        </Box>

        {/* Details */}
        <Box sx={{ p: 2, backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fcd34d' }}>
          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600, display: 'block', mb: 1 }}>WHAT HAPPENS NEXT</Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
            • Your application will be submitted for admin verification<br />
            • Admins will verify your credentials and location<br />
            • Once approved, you'll receive real-time snake incident alerts
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1, backgroundColor: '#fafbfc' }}>
        <Button onClick={onClose} disabled={loading} sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleRequestLocation}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <LocationOn />}
          sx={{
            bgcolor: '#10b981',
            fontWeight: 700,
            '&:hover': { bgcolor: '#059669' },
            '&.Mui-disabled': { opacity: 0.6 },
          }}
        >
          {loading ? 'Processing...' : 'Share Location & Apply'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}