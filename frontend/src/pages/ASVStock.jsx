import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Grid,
} from '@mui/material';
import {
  Edit,
  TrendingDown,
  TrendingUp,
  LocalHospital,
  Vaccines,
  LocationOn,
  Phone,
  Medication,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

/* ─── Theme ─────────────────────────────────────────── */
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
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 } },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': { borderColor: '#e5e7eb' },
            '&:hover fieldset': { borderColor: '#1a1f36' },
            '&.Mui-focused fieldset': { borderColor: '#1a1f36' },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#1a1f36' },
        },
      },
    },
  },
});

/* ─── Data ───────────────────────────────────────────── */
const mockStockData = [
  { id: 1, hospital: 'Central Hospital', district: 'Central', address: '123 Main Street, Central District', phone: '+94 11 234 5678', available_quantity: 150, last_updated: new Date('2024-02-22T10:00:00'), updated_by: 'Dr. Smith', trend: 'up' },
  { id: 2, hospital: 'Eastern Medical Center', district: 'Eastern', address: '456 Hospital Road, Eastern District', phone: '+94 65 789 0123', available_quantity: 85, last_updated: new Date('2024-02-21T14:30:00'), updated_by: 'Nurse Johnson', trend: 'down' },
  { id: 3, hospital: 'Western Clinic', district: 'Western', address: '789 Health Avenue, Western District', phone: '+94 34 456 7890', available_quantity: 45, last_updated: new Date('2024-02-20T09:15:00'), updated_by: 'Dr. Williams', trend: 'down' },
  { id: 4, hospital: 'Northern Health Center', district: 'Northern', address: '321 North Road, Northern District', phone: '+94 21 345 6789', available_quantity: 120, last_updated: new Date('2024-02-22T08:00:00'), updated_by: 'Pharmacist Lee', trend: 'up' },
];

const getStockLevel = (qty) => {
  const pct = (qty / 200) * 100;
  if (pct < 25) return { label: 'Low Stock',    color: '#ef4444', bg: '#fef2f2', barColor: '#ef4444', textColor: '#ef4444' };
  if (pct < 50) return { label: 'Medium Stock', color: '#f59e0b', bg: '#fffbeb', barColor: '#f59e0b', textColor: '#d97706' };
  return              { label: 'Good Stock',    color: '#10b981', bg: '#f0fdf4', barColor: '#10b981', textColor: '#059669' };
};

const StockBar = ({ qty, color }) => {
  const pct = Math.min((qty / 200) * 100, 100);
  return (
    <Box sx={{ height: 6, borderRadius: 99, background: '#e5e7eb', overflow: 'hidden', mt: 1.5 }}>
      <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: color, transition: 'width 0.5s ease' }} />
    </Box>
  );
};

/* ─── Hospital Card ──────────────────────────────────── */
function HospitalCard({ stock, onUpdate }) {
  const status = getStockLevel(stock.available_quantity);
  return (
    <Paper sx={{ borderRadius: 1, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: 1, flexShrink: 0,
              background: '#1a1f36', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LocalHospital sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#1a1f36' }}>
                {stock.hospital}
              </Typography>
              <Chip label={stock.district} size="small" sx={{
                height: 20, fontSize: '0.65rem', fontWeight: 600,
                background: '#f3f4f6', color: '#6b7280', borderRadius: 1, mt: 0.25,
              }} />
            </Box>
          </Box>
          <IconButton size="small" onClick={() => onUpdate(stock)} sx={{ color: '#9ca3af', '&:hover': { color: '#1a1f36' } }}>
            <Edit fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocationOn sx={{ fontSize: 15, color: '#ef4444', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>{stock.address}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Phone sx={{ fontSize: 15, color: '#3b82f6', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>{stock.phone}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Stock Section */}
      <Box sx={{ mx: 2.5, p: 2, borderRadius: 2, background: status.bg, flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Medication sx={{ fontSize: 16, color: status.color }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ASV STOCK
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: status.textColor }}>{status.label}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1 }}>
          <Typography sx={{ fontWeight: 800, color: status.color, fontSize: '2.2rem', lineHeight: 1 }}>
            {stock.available_quantity}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.25 }}>vials</Typography>
          {stock.trend === 'up'
            ? <TrendingUp sx={{ color: '#10b981', fontSize: 18, ml: 0.5 }} />
            : <TrendingDown sx={{ color: '#ef4444', fontSize: 18, ml: 0.5 }} />}
        </Box>
        <StockBar qty={stock.available_quantity} color={status.barColor} />
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
        <Button fullWidth variant="outlined" onClick={() => onUpdate(stock)} sx={{
          borderColor: '#e5e7eb', color: '#1a1f36', background: '#fff', fontWeight: 700, py: 1.2,
          '&:hover': { borderColor: '#1a1f36', background: '#f9fafb' },
        }}>
          Update Stock
        </Button>
        <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', textAlign: 'center', mt: 1 }}>
          {format(stock.last_updated, 'MMM dd, HH:mm')} · {stock.updated_by}
        </Typography>
      </Box>
    </Paper>
  );
}

/* ─── Main ───────────────────────────────────────────── */
export default function ASVStock() {
  const [stockData, setStockData] = useState(mockStockData);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [formData, setFormData] = useState({ quantity: '', action: 'add' });

  const handleOpenDialog = (stock) => {
    setSelectedStock(stock);
    setFormData({ quantity: '', action: 'add' });
    setOpenDialog(true);
  };
  const handleCloseDialog = () => { setOpenDialog(false); setSelectedStock(null); };

  const handleSubmit = () => {
    const delta = formData.action === 'add' ? parseInt(formData.quantity) : -parseInt(formData.quantity);
    setStockData(stockData.map(s => s.id === selectedStock.id
      ? { ...s, available_quantity: Math.max(0, s.available_quantity + delta), last_updated: new Date(), updated_by: 'Current User', trend: formData.action === 'add' ? 'up' : 'down' }
      : s
    ));
    handleCloseDialog();
  };

  const totalStock = stockData.reduce((s, i) => s + i.available_quantity, 0);
  const lowStock = stockData.filter(i => getStockLevel(i.available_quantity).label === 'Low Stock').length;
  const goodStock = stockData.filter(i => getStockLevel(i.available_quantity).label === 'Good Stock').length;

  const newQty = selectedStock && formData.quantity !== ''
    ? Math.max(0, formData.action === 'add'
      ? selectedStock.available_quantity + parseInt(formData.quantity || 0)
      : selectedStock.available_quantity - parseInt(formData.quantity || 0))
    : null;

  const summaryCards = [
    { value: stockData.length, label: 'TOTAL HOSPITALS', color: '#818cf8', bg: '#eef2ff' },
    { value: totalStock,       label: 'TOTAL ASV VIALS', color: '#10b981', bg: '#f0fdf4' },
    { value: lowStock,         label: 'LOW STOCK',        color: '#ef4444', bg: '#fef2f2' },
    { value: goodStock,        label: 'GOOD STOCK',       color: '#f59e0b', bg: '#fffbeb' },
  ];

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
          <Button variant="contained" startIcon={<Vaccines />} sx={{
            background: '#1a1f36', color: '#fff', px: 3, py: 1.25, borderRadius: 0.3  ,
            boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' },
          }}>
            Add Hospital
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {summaryCards.map((card) => (
            <Grid item xs={6} sm={3} key={card.label}>
              <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  minWidth: 48, height: 48, borderRadius: 0, background: card.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Typography sx={{ color: card.color, fontWeight: 800, fontSize: '1.3rem' }}>{card.value}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.3 }}>
                  {card.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Cards Grid */}
        <Grid container spacing={2.5}>
          {stockData.map(stock => (
            <Grid item xs={12} sm={6} lg={4} xl={3} key={stock.id}>
              <HospitalCard stock={stock} onUpdate={handleOpenDialog} />
            </Grid>
          ))}
        </Grid>

        {/* Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ pb: 1 }}>
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
            <TextField fullWidth select label="Action" value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })} margin="normal" size="small">
              <MenuItem value="add">Add Stock (Received)</MenuItem>
              <MenuItem value="remove">Remove Stock (Used / Expired)</MenuItem>
            </TextField>
            <TextField fullWidth label="Quantity (vials)" type="number" value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} margin="normal" size="small" required
              helperText={`Current stock: ${selectedStock?.available_quantity} vials`}
              InputProps={{ inputProps: { min: 0 } }} />

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
            <Button onClick={handleCloseDialog} sx={{ color: '#6b7280', border: '1px solid #e5e7eb', px: 2.5 }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={!formData.quantity}
              sx={{ background: '#1a1f36', color: '#fff', px: 3, boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' }, '&.Mui-disabled': { opacity: 0.4, color: '#fff' } }}>
              Update Stock
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
}