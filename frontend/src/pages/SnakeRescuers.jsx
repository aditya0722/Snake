import { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Avatar, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Snackbar, Alert,
} from '@mui/material';
import {
  Add, Phone, LocationOn, CheckCircle, Pending, Edit, Email,
  Shield, EmojiEvents, WorkspacePremium, Delete, Close,
  ContentCopy, CallOutlined, EmailOutlined,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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

const mockRescuers = [
  { id: 1, name: 'Ravi Kumar',     phone: '+94 77 123 4567', email: 'ravi@example.com',  district: 'Central',  experience: '5 years', is_verified: true,  rescues_completed: 145 },
  { id: 2, name: 'Nimal Silva',    phone: '+94 76 234 5678', email: 'nimal@example.com', district: 'Eastern',  experience: '3 years', is_verified: true,  rescues_completed: 87  },
  { id: 3, name: 'Kasun Perera',   phone: '+94 75 345 6789', email: 'kasun@example.com', district: 'Western',  experience: '2 years', is_verified: false, rescues_completed: 42  },
  { id: 4, name: 'Sunil Fernando', phone: '+94 71 456 7890', email: 'sunil@example.com', district: 'Northern', experience: '7 years', is_verified: true,  rescues_completed: 203 },
];

const avatarColors = ['#818cf8', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length];

function ContactDialog({ rescuer, open, onClose, onSnack }) {
  if (!rescuer) return null;
  const color = getAvatarColor(rescuer.name);
  const handleCall  = () => window.open(`tel:${rescuer.phone.replace(/\s/g, '')}`);
  const handleEmail = () => window.open(`mailto:${rescuer.email}`);
  const handleCopyPhone = () => { navigator.clipboard.writeText(rescuer.phone); onSnack('Phone number copied!'); onClose(); };

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
            {rescuer.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1a1f36' }}>{rescuer.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 13, color: '#ef4444' }} />
              <Typography variant="caption" sx={{ color: '#6b7280' }}>{rescuer.district} District</Typography>
            </Box>
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
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1f36' }}>{rescuer.phone}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" onClick={handleCopyPhone} sx={{ color: '#9ca3af', '&:hover': { color: '#3b82f6', background: '#eff6ff' } }}><ContentCopy sx={{ fontSize: 16 }} /></IconButton>
                <IconButton size="small" onClick={handleCall}      sx={{ color: '#9ca3af', '&:hover': { color: '#10b981', background: '#f0fdf4' } }}><CallOutlined  sx={{ fontSize: 16 }} /></IconButton>
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

function DeleteDialog({ rescuer, open, onClose, onConfirm }) {
  if (!rescuer) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Delete sx={{ color: '#ef4444', fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Remove Rescuer</Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>This action cannot be undone</Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Are you sure you want to remove <strong style={{ color: '#1a1f36' }}>{rescuer.name}</strong> from the system? All their data will be permanently deleted.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#6b7280', border: '1px solid #e5e7eb', px: 2.5 }}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained"
          sx={{ background: '#ef4444', color: '#fff', px: 3, boxShadow: 'none', '&:hover': { background: '#dc2626', boxShadow: 'none' } }}>
          Yes, Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RescuerCard({ rescuer, onEdit, onToggleVerify, onContact, onDelete }) {
  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: 4, background: rescuer.is_verified ? '#10b981' : '#f59e0b' }} />
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 52, height: 52, fontSize: '1.3rem', fontWeight: 700, background: getAvatarColor(rescuer.name), boxShadow: `0 0 0 3px white, 0 0 0 4px ${getAvatarColor(rescuer.name)}33` }}>
              {rescuer.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#1a1f36' }}>{rescuer.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                <LocationOn sx={{ fontSize: 13, color: '#ef4444' }} />
                <Typography variant="caption" sx={{ color: '#6b7280' }}>{rescuer.district}</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            <Chip
              label={rescuer.is_verified ? 'Verified' : 'Pending'} size="small"
              icon={rescuer.is_verified ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : <Pending sx={{ fontSize: '14px !important' }} />}
              onClick={() => onToggleVerify(rescuer.id)}
              sx={{ height: 24, fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', background: rescuer.is_verified ? '#f0fdf4' : '#fffbeb', color: rescuer.is_verified ? '#059669' : '#d97706', border: `1px solid ${rescuer.is_verified ? '#10b98133' : '#f59e0b33'}`, '& .MuiChip-icon': { color: rescuer.is_verified ? '#059669' : '#d97706' }, '&:hover': { opacity: 0.85 } }}
            />
            <Box sx={{ display: 'flex', gap: 0.25 }}>
              <IconButton size="small" onClick={() => onEdit(rescuer)}   sx={{ color: '#9ca3af', '&:hover': { color: '#1a1f36' }, p: 0.25 }}><Edit   sx={{ fontSize: 16 }} /></IconButton>
              <IconButton size="small" onClick={() => onDelete(rescuer)} sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' }, p: 0.25 }}><Delete sx={{ fontSize: 16 }} /></IconButton>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Phone sx={{ fontSize: 14, color: '#3b82f6', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>{rescuer.phone}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Email sx={{ fontSize: 14, color: '#8b5cf6', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#6b7280' }}>{rescuer.email}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto' }}>
          <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, background: '#f8fafc', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
              <WorkspacePremium sx={{ fontSize: 14, color: '#818cf8' }} />
              <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Experience</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1f36' }}>{rescuer.experience}</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 1.5, borderRadius: 2, background: '#f8fafc', border: '1px solid #f1f5f9', textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.25 }}>
              <EmojiEvents sx={{ fontSize: 14, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rescues</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a1f36' }}>{rescuer.rescues_completed}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button fullWidth variant="outlined" size="small" startIcon={<Edit sx={{ fontSize: 14 }} />} onClick={() => onEdit(rescuer)}
            sx={{ borderColor: '#e5e7eb', color: '#1a1f36', fontWeight: 600, py: 0.8, '&:hover': { borderColor: '#1a1f36', background: '#f9fafb' } }}>Edit</Button>
          <Button fullWidth variant="outlined" size="small" startIcon={<Phone sx={{ fontSize: 14 }} />} onClick={() => onContact(rescuer)}
            sx={{ borderColor: '#e5e7eb', color: '#3b82f6', fontWeight: 600, py: 0.8, '&:hover': { borderColor: '#3b82f6', background: '#eff6ff' } }}>Contact</Button>
          <Button fullWidth variant="outlined" size="small" startIcon={<Delete sx={{ fontSize: 14 }} />} onClick={() => onDelete(rescuer)}
            sx={{ borderColor: '#e5e7eb', color: '#ef4444', fontWeight: 600, py: 0.8, '&:hover': { borderColor: '#ef4444', background: '#fef2f2' } }}>Delete</Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default function SnakeRescuers() {
  const [rescuers, setRescuers]             = useState(mockRescuers);
  const [openDialog, setOpenDialog]         = useState(false);
  const [selectedRescuer, setSelectedRescuer] = useState(null);
  const [formData, setFormData]             = useState({ name: '', phone: '', email: '', district: '', experience: '' });
  const [contactRescuer, setContactRescuer] = useState(null);
  const [deleteRescuer, setDeleteRescuer]   = useState(null);
  const [snack, setSnack]                   = useState({ open: false, message: '' });
  const showSnack = (message) => setSnack({ open: true, message });

  const handleOpenDialog = (rescuer = null) => {
    setSelectedRescuer(rescuer);
    setFormData(rescuer ? { name: rescuer.name, phone: rescuer.phone, email: rescuer.email, district: rescuer.district, experience: rescuer.experience } : { name: '', phone: '', email: '', district: '', experience: '' });
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (selectedRescuer) {
      setRescuers(rescuers.map(r => r.id === selectedRescuer.id ? { ...r, ...formData } : r));
      showSnack('Rescuer updated successfully!');
    } else {
      setRescuers([...rescuers, { id: Date.now(), ...formData, is_verified: false, rescues_completed: 0 }]);
      showSnack('New rescuer added!');
    }
    setOpenDialog(false);
  };

  const toggleVerification = (id) => setRescuers(rescuers.map(r => r.id === id ? { ...r, is_verified: !r.is_verified } : r));

  const handleDeleteConfirm = () => {
    showSnack(`${deleteRescuer.name} has been removed.`);
    setRescuers(rescuers.filter(r => r.id !== deleteRescuer.id));
    setDeleteRescuer(null);
  };

  const verifiedCount = rescuers.filter(r => r.is_verified).length;
  const totalRescues  = rescuers.reduce((s, r) => s + r.rescues_completed, 0);
  const summaryCards  = [
    { value: rescuers.length,               label: 'TOTAL RESCUERS', color: '#818cf8', bg: '#eef2ff' },
    { value: verifiedCount,                  label: 'VERIFIED',       color: '#10b981', bg: '#f0fdf4' },
    { value: rescuers.length - verifiedCount, label: 'PENDING',       color: '#f59e0b', bg: '#fffbeb' },
    { value: totalRescues,                   label: 'TOTAL RESCUES',  color: '#3b82f6', bg: '#eff6ff' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#f0f2f5', p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>Snake Rescuers</Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>Manage registered snake rescuers in your area</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}
            sx={{ background: '#1a1f36', color: '#fff', px: 3, py: 1.25, borderRadius: 2, boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' } }}>
            Add Rescuer
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {summaryCards.map((card) => (
            <Grid item xs={6} sm={3} key={card.label}>
              <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ minWidth: 48, height: 48, borderRadius: 2, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: card.color, fontWeight: 800, fontSize: '1.3rem' }}>{card.value}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.3 }}>{card.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          {rescuers.map(rescuer => (
            <Grid item xs={12} sm={6} lg={4} xl={3} key={rescuer.id}>
              <RescuerCard rescuer={rescuer} onEdit={handleOpenDialog} onToggleVerify={toggleVerification} onContact={setContactRescuer} onDelete={setDeleteRescuer} />
            </Grid>
          ))}
        </Grid>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1.5, background: '#1a1f36', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{selectedRescuer ? 'Edit Rescuer' : 'Add New Rescuer'}</Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>{selectedRescuer ? selectedRescuer.name : 'Fill in the details below'}</Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {[{ label: 'Full Name', key: 'name', type: 'text' }, { label: 'Phone Number', key: 'phone', type: 'text' }, { label: 'Email', key: 'email', type: 'email' }, { label: 'District', key: 'district', type: 'text' }, { label: 'Experience (e.g. 5 years)', key: 'experience', type: 'text' }].map(field => (
              <TextField key={field.key} fullWidth label={field.label} type={field.type} value={formData[field.key]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} margin="normal" size="small" required />
            ))}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ color: '#6b7280', border: '1px solid #e5e7eb', px: 2.5 }}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || !formData.phone}
              sx={{ background: '#1a1f36', color: '#fff', px: 3, boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' }, '&.Mui-disabled': { opacity: 0.4, color: '#fff' } }}>
              {selectedRescuer ? 'Update' : 'Add Rescuer'}
            </Button>
          </DialogActions>
        </Dialog>

        <ContactDialog rescuer={contactRescuer} open={Boolean(contactRescuer)} onClose={() => setContactRescuer(null)} onSnack={showSnack} />
        <DeleteDialog  rescuer={deleteRescuer}  open={Boolean(deleteRescuer)}  onClose={() => setDeleteRescuer(null)}  onConfirm={handleDeleteConfirm} />

        <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="success" variant="filled" onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}