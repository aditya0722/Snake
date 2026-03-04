import { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Chip, Grid, CircularProgress, Alert, Snackbar,
} from '@mui/material';
import { Edit, LocalHospital, Phone, LocationOn, Medication, Refresh, Add } from '@mui/icons-material';
import { format } from 'date-fns';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import api from '../api/axios';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a1f36' },
    background: { default: '#f0f2f5', paper: '#ffffff' },
    text: { primary: '#1a1f36', secondary: '#6b7280' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1f36' },
  },
  shape: { borderRadius: 16 },
});

const getStockLevel = (qty) => {
  if (qty < 50) return { label: 'Low Stock', color: '#ef4444', bg: '#fef2f2', barColor: '#ef4444', textColor: '#ef4444' };
  if (qty < 100) return { label: 'Medium Stock', color: '#f59e0b', bg: '#fffbeb', barColor: '#f59e0b', textColor: '#d97706' };
  return { label: 'Good Stock', color: '#10b981', bg: '#f0fdf4', barColor: '#10b981', textColor: '#059669' };
};

const StockBar = ({ qty, color }) => {
  const pct = Math.min((qty / 200) * 100, 100);
  return (
    <Box sx={{ height: 6, borderRadius: 99, background: '#e5e7eb', overflow: 'hidden', mt: 1.5 }}>
      <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: color, transition: 'width 0.5s ease' }} />
    </Box>
  );
};

// Hospital Card with ASV Stock
function HospitalCard({ stock, onUpdate, isLoading }) {
  const status = getStockLevel(stock?.available_quantity || 0);
  const qty = stock?.available_quantity || 0;

  return (
    <Paper sx={{ borderRadius: 1, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', opacity: isLoading ? 0.6 : 1 }}>
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 1, flexShrink: 0, background: '#1a1f36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LocalHospital sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#1a1f36' }}>
                {stock?.hospital || 'Unknown Hospital'}
              </Typography>
              <Chip label={stock?.district || 'No District'} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, background: '#f3f4f6', color: '#6b7280', borderRadius: 1, mt: 0.25 }} />
            </Box>
          </Box>
          <IconButton size="small" onClick={() => onUpdate(stock)} disabled={isLoading} sx={{ color: '#9ca3af', '&:hover': { color: '#1a1f36' } }}>
            <Edit fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {stock?.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LocationOn sx={{ fontSize: 15, color: '#ef4444', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>{stock.address}</Typography>
            </Box>
          )}
          {stock?.contact_number && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Phone sx={{ fontSize: 15, color: '#3b82f6', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>{stock.contact_number}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ mx: 2.5, p: 2, borderRadius: 2, background: status.bg, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Medication sx={{ fontSize: 16, color: status.color }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
              ASV STOCK
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: status.textColor, fontSize: '0.7rem' }}>{status.label}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1 }}>
          <Typography sx={{ fontWeight: 800, color: status.color, fontSize: '2rem', lineHeight: 1 }}>
            {qty}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.25, fontSize: '0.75rem' }}>vials</Typography>
        </Box>
        <StockBar qty={qty} color={status.barColor} />
      </Box>

      <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
        <Button fullWidth variant="outlined" disabled={isLoading} onClick={() => onUpdate(stock)} sx={{ borderColor: '#e5e7eb', color: '#1a1f36', background: '#fff', fontWeight: 700, py: 1.2, '&:hover': { borderColor: '#1a1f36', background: '#f9fafb' } }}>
          Update Stock
        </Button>
      </Box>
    </Paper>
  );
}

// Unregistered Hospital Card
function UnregisteredHospitalCard({ hospital, onRegister, isLoading }) {

  
  return (
    <Paper sx={{ borderRadius: 1, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', border: '2px dashed #64c63a', opacity: isLoading ? 0.6 : 1 }}>
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 1, flexShrink: 0, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LocalHospital sx={{ color: '#10B981', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#1a1f36' }}>
                {hospital?.hospital || 'Unknown Hospital'}
              </Typography>
              <Chip label={hospital?.district || 'No District'} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, background: '#fffbeb', color: '#d97706', borderRadius: 1, mt: 0.25 }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {hospital?.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LocationOn sx={{ fontSize: 15, color: '#ef4444', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>{hospital.address}</Typography>
            </Box>
          )}
          {hospital?.contact_number && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Phone sx={{ fontSize: 15, color: '#3b82f6', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>{hospital.contact_number}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ mx: 2.5, p: 2, borderRadius: 2, background: '#ebfffb', flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Medication sx={{ fontSize: 16, color: '#5c8c7c' }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
            NOT REGISTERED FOR ASV
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#d97706', fontWeight: 600, mt: 1 }}>
          Click "Register for ASV" to add this hospital to the ASV stock management system.
        </Typography>
      </Box>

      <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
        <Button fullWidth variant="contained" disabled={isLoading} onClick={() => onRegister(hospital)} startIcon={<Add />}
          sx={{ background: '#10B981', color: '#fff', fontWeight: 700, py: 1.2, '&:hover': { background: '#d97706' }, '&.Mui-disabled': { opacity: 0.6 } }}>
          Register for ASV
        </Button>
      </Box>
    </Paper>
  );
}

export default function ASVStock() {
  const [stockData, setStockData] = useState([]);
  const [unregisteredHospitals, setUnregisteredHospitals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [formData, setFormData] = useState({ quantity: '', action: 'add', notes: '' });
  const [loading, setLoading] = useState(false);
  const [loadingItem, setLoadingItem] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [error, setError] = useState(null);

  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  };

  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || 1;
      }
    } catch (e) {
      console.error('Error getting user ID:', e);
    }
    return 1;
  };

  const fetchStockData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching ASV stock...');
      const response = await api.get('/asv/asv_stock.php?action=getAll&limit=100');
      console.log('Response:', response.data);

      if (response.data && response.data.success === true) {
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setStockData(data);
        
        // Separate unregistered hospitals
        const registeredIds = new Set(data.map(s => s.hospital_id));
        const unregistered = data.filter(d => !d.id); // Hospitals without ASV records
        setUnregisteredHospitals(unregistered);
        
        console.log('✅ ASV stock fetched:', data.length, 'records');
        console.log('📋 Unregistered hospitals:', unregistered.length);
      } else {
        const msg = response.data?.message || 'No data received from server';
        setError(msg);
        console.error('❌ API Error:', msg);
        showSnack(msg, 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to connect to server';
      setError(msg);
      console.error('❌ Fetch Error:', msg);
      showSnack(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.get('/asv/asv_stock.php?action=getSummary');
      if (response.data?.success) {
        setSummary(response.data.data);
      }
    } catch (err) {
      console.error('Summary fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchStockData();
    fetchSummary();
  }, [fetchStockData, fetchSummary]);

  const handleOpenDialog = (stock) => {
    if (!stock) {
      showSnack('Invalid hospital selected', 'error');
      return;
    }
    console.log("selectedStock:", stock);
    setSelectedStock(stock);
    setFormData({ quantity: '', action: 'add', notes: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStock(null);
  };

  const handleOpenRegisterDialog = (hospital) => {
    setSelectedHospital(hospital);
    setOpenRegisterDialog(true);
  };

  const handleCloseRegisterDialog = () => {
    setOpenRegisterDialog(false);
    setSelectedHospital(null);
  };

  const handleRegisterHospital = async () => {
    if (!selectedHospital) return;

    const currentUserId = getCurrentUserId();

    try {
      setLoadingItem(selectedHospital.hospital_id);

      const response = await api.post('/asv/asv_stock.php?action=create', {
        hospital_id: selectedHospital.hospital_id,
        available_quantity: 0,
        updated_by: currentUserId,
      });

      console.log("Register response:", response);

      if (response.data?.success) {
        showSnack(`${selectedHospital.hospital} registered for ASV successfully!`, 'success');
        handleCloseRegisterDialog();
        await fetchStockData();
        await fetchSummary();
      } else {
        showSnack(response.data?.message || 'Failed to register hospital', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error registering hospital';
      showSnack(msg, 'error');
    } finally {
      setLoadingItem(null);
    }
  };

  const handleSubmit = async () => {
    if (!formData.quantity) {
      showSnack('Please enter a quantity', 'error');
      return;
    }

    const quantityChange = formData.action === 'add'
      ? parseInt(formData.quantity)
      : -parseInt(formData.quantity);

    const currentUserId = getCurrentUserId();

    try {
      setLoadingItem(selectedStock.hospital_id);

      const response = await api.post('/asv/asv_stock.php?action=update', {
        id: selectedStock.id,
        quantity_change: quantityChange,
        updated_by: currentUserId,
        notes: formData.notes,
      });
      console.log("response:", response);

      if (response.data?.success) {
        const newQty = response.data.data?.new_quantity || 0;
        showSnack(`Stock updated! New quantity: ${newQty} vials`, 'success');
        handleCloseDialog();
        await fetchStockData();
        await fetchSummary();
      } else {
        showSnack(response.data?.message || 'Failed to update stock', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Server error updating stock';
      showSnack(msg, 'error');
    } finally {
      setLoadingItem(null);
    }
  };

  const newQty = selectedStock && formData.quantity !== ''
    ? Math.max(0, formData.action === 'add'
      ? (selectedStock.available_quantity || 0) + parseInt(formData.quantity || 0)
      : (selectedStock.available_quantity || 0) - parseInt(formData.quantity || 0))
    : null;

  const summaryCards = summary ? [
    { value: summary.total_hospitals || 0, label: 'TOTAL HOSPITALS', color: '#818cf8', bg: '#eef2ff' },
    { value: summary.total_vials || 0, label: 'TOTAL ASV VIALS', color: '#10b981', bg: '#f0fdf4' },
    { value: summary.low_stock_count || 0, label: 'LOW STOCK', color: '#ef4444', bg: '#fef2f2' },
    { value: summary.good_stock_count || 0, label: 'GOOD STOCK', color: '#f59e0b', bg: '#fffbeb' },
  ] : [];

  const registeredCount = stockData.filter(s => s.id).length;
  const unregisteredCount = unregisteredHospitals.length;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#f0f2f5', p: { xs: 2, sm: 3, md: 4 } }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>
              ASV Stock Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
              Monitor and manage Anti-Snake Venom stock across hospitals
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Refresh />} onClick={() => { fetchStockData(); fetchSummary(); }} disabled={loading}
            sx={{ background: '#1a1f36', color: '#fff', px: 3, py: 1.25, boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' } }}>
            Refresh
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: '#9ca3af' }}>Loading ASV stock data...</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {summaryCards.map((card) => (
                <Grid item xs={6} sm={4} md={3} key={card.label}>
                  <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ minWidth: 48, height: 48, borderRadius: 0, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ color: card.color, fontWeight: 800, fontSize: '1.3rem' }}>{card.value}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.3, fontSize: '0.65rem' }}>
                      {card.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Registered Hospitals Section */}
            {registeredCount > 0 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1f36', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  Hospitals with ASV Stock ({registeredCount})
                </Typography>
                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                  {stockData.filter(s => s.id).map(stock => (
                    <Grid item xs={12} sm={6} lg={4} xl={3} key={stock?.id || Math.random()}>
                      <HospitalCard stock={stock} onUpdate={handleOpenDialog} isLoading={loadingItem === stock?.hospital_id} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Unregistered Hospitals Section */}
            {unregisteredCount > 0 && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1f36', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                  Hospitals Awaiting ASV Registration ({unregisteredCount})
                </Typography>
                <Grid container spacing={2.5}>
                  {unregisteredHospitals.map(hospital => (
                    <Grid item xs={12} sm={6} lg={4} xl={3} key={hospital?.hospital_id || Math.random()}>
                      <UnregisteredHospitalCard hospital={hospital} onRegister={handleOpenRegisterDialog} isLoading={loadingItem === hospital?.hospital_id} />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {stockData.length === 0 && (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <LocalHospital sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#9ca3af', fontWeight: 600 }}>
                  No hospitals found.
                </Typography>
              </Paper>
            )}
          </>
        )}

        {/* Update Stock Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: '#1a1f36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Medication sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Update ASV Stock</Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>{selectedStock?.hospital}</Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent>
            <TextField fullWidth select label="Action" value={formData.action} onChange={(e) => setFormData({ ...formData, action: e.target.value })} margin="normal" size="small">
              <MenuItem value="add">Add Stock (Received)</MenuItem>
              <MenuItem value="remove">Remove Stock (Used / Expired)</MenuItem>
            </TextField>
            <TextField fullWidth label="Quantity (vials)" type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} margin="normal" size="small" required
              helperText={`Current: ${selectedStock?.available_quantity || 0} vials`} InputProps={{ inputProps: { min: 0 } }} />
            <TextField fullWidth label="Notes (optional)" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} margin="normal" size="small" multiline rows={2} />

            {newQty !== null && (() => {
              const ns = getStockLevel(newQty);
              return (
                <Box sx={{ mt: 1.5, p: 2, borderRadius: 2, background: ns.bg, border: `1px solid ${ns.color}22` }}>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>New Stock Level</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mt: 0.5 }}>
                    <Typography sx={{ fontWeight: 800, color: ns.color, fontSize: '1.6rem', lineHeight: 1 }}>{newQty}</Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>vials</Typography>
                    <Typography variant="caption" sx={{ ml: 'auto', fontWeight: 700, color: ns.textColor }}>{ns.label}</Typography>
                  </Box>
                  <StockBar qty={newQty} color={ns.barColor} />
                </Box>
              );
            })()}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={handleCloseDialog} disabled={loadingItem !== null}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={!formData.quantity || loadingItem !== null}
              sx={{ background: '#1a1f36', color: '#fff', boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' } }}>
              Update Stock
            </Button>
          </DialogActions>
        </Dialog>

        {/* Register Hospital Dialog */}
        <Dialog open={openRegisterDialog} onClose={handleCloseRegisterDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Add sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Register Hospital for ASV</Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>Confirm registration</Typography>
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are about to register <strong>{selectedHospital?.hospital}</strong> for ASV stock management.
            </Alert>
            
            <Box sx={{ p: 2, backgroundColor: '#fffbeb', borderRadius: 2, border: '1px solid #fcd34d' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1f36' }}>
                Hospital Details:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>NAME</Typography>
                  <Typography variant="body2" sx={{ color: '#1a1f36' }}>{selectedHospital?.hospital}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>DISTRICT</Typography>
                  <Typography variant="body2" sx={{ color: '#1a1f36' }}>{selectedHospital?.district || 'Not specified'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>ADDRESS</Typography>
                  <Typography variant="body2" sx={{ color: '#1a1f36' }}>{selectedHospital?.address || 'Not specified'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>INITIAL STOCK</Typography>
                  <Typography variant="body2" sx={{ color: '#1a1f36' }}>0 vials (You can update this immediately after registration)</Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ mt: 2, color: '#6b7280' }}>
              Click "Confirm Registration" to proceed. You'll be able to update the stock quantity immediately.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={handleCloseRegisterDialog} disabled={loadingItem !== null}>Cancel</Button>
            <Button onClick={handleRegisterHospital} variant="contained" disabled={loadingItem !== null}
              sx={{ background: '#f59e0b', color: '#fff', boxShadow: 'none', '&:hover': { background: '#d97706', boxShadow: 'none' } }}>
              Confirm Registration
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
    </ThemeProvider>
  );
}