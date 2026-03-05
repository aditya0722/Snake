import { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, CircularProgress,
  Grid, Card, CardContent, IconButton, Tooltip,
} from '@mui/material';
import {
  CheckCircle, Cancel, Info, Delete, Visibility, LocationOn, Person, Email, Phone,
} from '@mui/icons-material';
import { format } from 'date-fns';
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import api from '../api/axios';
import { useAuth } from '../context/authContext';

export default function RescuerVerificationPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRescuer, setSelectedRescuer] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [actionConfirm, setActionConfirm] = useState({ open: false, rescuer_id: null, action: null });

  const { user } = useAuth();



  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  };

  // Fetch pending applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/rescuers/rescuers.php?action=getPending&limit=50');

      if (response.data?.success) {
        setApplications(response.data.data || []);
        console.log('✅ Rescuer applications fetched:', response.data.data?.length || 0);
      } else {
        showSnack(response.data?.message || 'Failed to fetch applications', 'error');
      }
    } catch (err) {
      showSnack('Failed to connect to server', 'error');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleViewDetails = (rescuer) => {
    setSelectedRescuer(rescuer);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setOpenDetailsDialog(false);
    setSelectedRescuer(null);
  };

  const handleVerify = (rescuer_id) => {
    setActionConfirm({
      open: true,
      rescuer_id,
      action: 'verify',
      title: 'Verify Rescuer',
      message: 'Are you sure you want to verify this rescuer? They will be able to receive incident alerts.',
    });
  };

  const handleReject = (rescuer_id) => {
    setActionConfirm({
      open: true,
      rescuer_id,
      action: 'reject',
      title: 'Reject Application',
      message: 'Are you sure you want to reject this rescuer application? This action cannot be undone.',
    });
  };

  const handleConfirmAction = async () => {
    const { rescuer_id, action } = actionConfirm;

    try {
      setLoading(true);
      const endpoint = action === 'verify' ? 'verify' : 'reject';

      const response = await api.post(`/rescuers/rescuers.php?action=${endpoint}`, {
        rescuer_id,
      });

      if (response.data?.success) {
        showSnack(
          action === 'verify'
            ? 'Rescuer verified successfully!'
            : 'Application rejected successfully',
          'success'
        );

        // Update local state
        setApplications(prev => prev.filter(a => a.id !== rescuer_id));
        setOpenDetailsDialog(false);
        setSelectedRescuer(null);
      } else {
        showSnack(response.data?.message || 'Action failed', 'error');
      }
    } catch (err) {
      showSnack(err.response?.data?.message || 'Server error', 'error');
    } finally {
      setLoading(false);
      setActionConfirm({ open: false, rescuer_id: null, action: null });
    }
  };

  const getDistrictColor = (district) => {
    const colors = {
      'Colombo': '#3b82f6',
      'Gampaha': '#8b5cf6',
      'Kalutara': '#06b6d4',
      'Kandy': '#14b8a6',
      'Matara': '#f59e0b',
      'Galle': '#ef4444',
    };
    return colors[district] || '#6b7280';
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1f36', mb: 1 }}>
          Rescuer Verification
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Review and verify snake rescuer applications
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '10px',
                  bgcolor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Info sx={{ color: '#ef4444', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600 }}>
                    PENDING APPLICATIONS
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#ef4444' }}>
                    {applications.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Applications Table */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <CheckCircle sx={{ fontSize: 48, color: '#10b981', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 600 }}>
            No Pending Applications
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af', mt: 1 }}>
            All rescuer applications have been reviewed and verified.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f9fafb' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#1a1f36' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1f36' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1f36' }}>District</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a1f36' }}>Applied</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#1a1f36' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((rescuer) => (
                <TableRow key={rescuer.id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: '#3b82f7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                      }}>
                        {rescuer.user_name?.charAt(0)?.toUpperCase()}
                      </Box>
                      <Typography sx={{ fontWeight: 600, color: '#1a1f36' }}>
                        {rescuer.user_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      <Box>{rescuer.email}</Box>
                      <Box>{rescuer.phone_number}</Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={rescuer.district}
                      sx={{
                        bgcolor: getDistrictColor(rescuer.district) + '20',
                        color: getDistrictColor(rescuer.district),
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {format(new Date(rescuer.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(rescuer)}
                        sx={{ color: '#3b82f7' }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Verify">
                      <IconButton
                        size="small"
                        onClick={() => handleVerify(rescuer.id)}
                        sx={{ color: '#10b981' }}
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <IconButton
                        size="small"
                        onClick={() => handleReject(rescuer.id)}
                        sx={{ color: '#ef4444' }}
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontWeight: 700 }}>
          Rescuer Application Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRescuer && (
            <Grid container spacing={2.5}>
              {/* User Info */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#f3f4f6', borderRadius: '10px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Person sx={{ color: '#3b82f7', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280' }}>
                      PERSONAL INFORMATION
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#1a1f36', fontWeight: 600, mb: 0.5 }}>
                    {selectedRescuer.user_name}
                  </Typography>
                </Box>
              </Grid>

              {/* Contact Info */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#f0f4ff', borderRadius: '10px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Email sx={{ color: '#3b82f7', fontSize: 18 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280' }}>
                      EMAIL
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#1a1f36', fontWeight: 600 }}>
                    {selectedRescuer.email}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, bgcolor: '#f0f4ff', borderRadius: '10px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Phone sx={{ color: '#3b82f7', fontSize: 18 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280' }}>
                      PHONE
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#1a1f36', fontWeight: 600 }}>
                    {selectedRescuer.phone_number}
                  </Typography>
                </Box>
              </Grid>

              {/* Location Info */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: '10px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn sx={{ color: '#10b981', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280' }}>
                      SERVICE LOCATION
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#1a1f36', fontWeight: 600, mb: 0.5 }}>
                      District: <Chip label={selectedRescuer.district} size="small" sx={{ ml: 1 }} />
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                      Latitude: {selectedRescuer.latitude.toFixed(6)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      Longitude: {selectedRescuer.longitude.toFixed(6)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Application Date */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#fffbeb', borderRadius: '10px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon  sx={{ color: '#f59e0b', fontSize: 20 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280' }}>
                      APPLICATION DATE
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#1a1f36', fontWeight: 600 }}>
                    {format(new Date(selectedRescuer.created_at), 'MMMM dd, yyyy HH:mm')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1, bgcolor: '#fafbfc' }}>
          <Button onClick={handleCloseDetails} disabled={loading}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => handleVerify(selectedRescuer?.id)}
            disabled={loading}
            sx={{ bgcolor: '#10b981' }}
            startIcon={<CheckCircle />}
          >
            Verify
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleReject(selectedRescuer?.id)}
            disabled={loading}
            sx={{ color: '#ef4444', borderColor: '#ef4444' }}
            startIcon={<Cancel />}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={actionConfirm.open} onClose={() => setActionConfirm({ open: false, rescuer_id: null, action: null })}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {actionConfirm.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: 400 }}>
          <Alert severity={actionConfirm.action === 'verify' ? 'success' : 'error'}>
            {actionConfirm.message}
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setActionConfirm({ open: false, rescuer_id: null, action: null })} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmAction}
            disabled={loading}
            sx={{
              bgcolor: actionConfirm.action === 'verify' ? '#10b981' : '#ef4444',
            }}
          >
            {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: '10px' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}