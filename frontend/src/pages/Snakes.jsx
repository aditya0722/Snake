import { useState } from 'react';
import {
  Box, Paper, Typography, Button, Grid, Card, CardContent, CardMedia,
  Dialog, DialogContent, DialogActions, TextField, IconButton,
  InputAdornment, Avatar,
} from '@mui/material';
import {
  Add, Search, LocationOn, PhotoCamera, Close, CalendarToday,
  ArrowForward, Edit, Delete, Person, AccessTime, CheckCircle,
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
      styleOverrides: { paper: { borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', overflow: 'hidden' } },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10, background: '#f8fafc',
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

const STATUS_META = {
  pending:  { color: '#d97706', bg: '#fffbeb', label: 'Pending'  },
  verified: { color: '#059669', bg: '#f0fdf4', label: 'Verified' },
  rescued:  { color: '#2563eb', bg: '#eff6ff', label: 'Rescued'  },
};
const STATUS_OPTIONS = ['pending', 'verified', 'rescued'];

const SNAKE_COLORS = {
  Cobra: '#ef4444', Viper: '#f59e0b', Krait: '#8b5cf6', Python: '#3b82f6', Other: '#6b7280',
};

const mockReports = [
  { id: 1, snake_name: 'Cobra',  reporter: 'John Doe',     location: 'Central District, Village A', description: 'Found near the river bank, very aggressive behaviour observed near the fishing area.', status: 'verified', photo_url: 'https://images.unsplash.com/photo-1531386450450-969f935bd522?w=600&q=80', created_at: new Date('2024-02-22T10:30:00') },
  { id: 2, snake_name: 'Viper',  reporter: 'Jane Smith',   location: 'Eastern District, Town B',    description: 'Spotted in the backyard garden close to the water pipe. Children in the area.', status: 'pending',  photo_url: 'https://images.unsplash.com/photo-1586263361651-b6e0a31c0eb7?w=600&q=80', created_at: new Date('2024-02-21T15:45:00') },
  { id: 3, snake_name: 'Python', reporter: 'Mike Johnson', location: 'Western District, Area C',    description: 'Large python coiled around a tree near the school entrance. Rescue team alerted.', status: 'rescued',  photo_url: 'https://images.unsplash.com/photo-1531386450450-969f935bd522?w=600&q=80', created_at: new Date('2024-02-20T08:20:00') },
];

/* ─── Sub-components ─────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { color: '#6b7280', bg: '#f3f4f6', label: status };
  return (
    <Box sx={{ display: 'inline-block', px: 1.5, py: 0.4, borderRadius: 99, background: meta.bg, color: meta.color, fontSize: '0.68rem', fontWeight: 700, border: `1px solid ${meta.color}33` }}>
      {meta.label}
    </Box>
  );
};

const DialogHeader = ({ title, subtitle, onClose }) => (
  <Box sx={{ background: '#1a1f36', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Box>
      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.2 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{subtitle}</Typography>}
    </Box>
    <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}><Close /></IconButton>
  </Box>
);

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 120, flexShrink: 0 }}>
      {icon}
      <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.64rem' }}>{label}</Typography>
    </Box>
    <Typography variant="body2" sx={{ color: '#1a1f36', fontWeight: 500 }}>{value}</Typography>
  </Box>
);

const ReportCard = ({ report, onView, onUpdateStatus, onDelete }) => {
  const snakeColor = SNAKE_COLORS[report.snake_name] || '#8b5cf6';
  return (
    <Card sx={{
      height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderRadius: 1, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' },
    }}>
      <Box sx={{ position: 'relative', height: 190, overflow: 'hidden', background: '#e5e7eb' }}>
        <CardMedia component="img" image={report.photo_url} alt={report.snake_name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.04)' } }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
        <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
          <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1, background: snakeColor, color: '#fff', fontSize: '0.7rem', fontWeight: 800 }}>
            {report.snake_name}
          </Box>
        </Box>
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <StatusBadge status={report.status} />
        </Box>
        {/* Delete button */}
        <IconButton size="small" onClick={() => onDelete(report.id)} sx={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(255,255,255,0.92)', color: '#ef4444', width: 30, height: 30,
          '&:hover': { background: '#ef4444', color: '#fff' },
        }}>
          <Delete sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 1.5 }}>
          <LocationOn sx={{ fontSize: 14, color: '#ef4444', flexShrink: 0, mt: 0.15 }} />
          <Typography variant="body2" sx={{ color: '#1a1f36', fontWeight: 500, fontSize: '0.82rem', lineHeight: 1.4 }}>
            {report.location}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Avatar sx={{ width: 20, height: 20, bgcolor: '#1a1f36', fontSize: '0.6rem', fontWeight: 700 }}>
              {report.reporter.charAt(0)}
            </Avatar>
            <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>{report.reporter}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarToday sx={{ fontSize: 11, color: '#9ca3af' }} />
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>{format(report.created_at, 'MMM dd, yyyy')}</Typography>
          </Box>
        </Box>
      </CardContent>

      <Box sx={{ px: 2.5, pb: 2.5, display: 'flex', gap: 1 }}>
        <Button size="small" endIcon={<ArrowForward sx={{ fontSize: '13px !important' }} />} onClick={() => onView(report)}
          sx={{ flex: 1, borderRadius: 1, fontWeight: 700, fontSize: '0.76rem', color: '#1a1f36', border: '1px solid #e5e7eb', '&:hover': { background: '#f9fafb', borderColor: '#1a1f36' } }}>
          Details
        </Button>
        <Button size="small" startIcon={<Edit sx={{ fontSize: '13px !important' }} />} onClick={() => onUpdateStatus(report)}
          sx={{ flex: 1, borderRadius: 1, fontWeight: 700, fontSize: '0.76rem', color: '#6b7280', border: '1px solid #e5e7eb', '&:hover': { background: '#f9fafb', borderColor: '#6b7280' } }}>
          Status
        </Button>
      </Box>
    </Card>
  );
};

/* ─── Main ───────────────────────────────────────────── */
export default function SnakeReports() {
  const [reports, setReports]             = useState(mockReports);
  const [openReport, setOpenReport]       = useState(false);
  const [viewReport, setViewReport]       = useState(null);
  const [statusReport, setStatusReport]   = useState(null);
  const [newStatus, setNewStatus]         = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData]           = useState({ snake_name: '', location: '', description: '' });
  const [activeFilter, setActiveFilter]   = useState('all');

  const field = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setReports([{ id: Date.now(), ...formData, reporter: 'Current User', photo_url: selectedImage || mockReports[0].photo_url, status: 'pending', created_at: new Date() }, ...reports]);
    setOpenReport(false); setFormData({ snake_name: '', location: '', description: '' }); setSelectedImage(null);
  };

  const handleStatusUpdate = () => {
    if (!newStatus || newStatus === statusReport.status) return;
    setReports(reports.map(r => r.id === statusReport.id ? { ...r, status: newStatus } : r));
    setStatusReport(null); setNewStatus('');
  };

  const handleDelete = () => {
    setReports(reports.filter(r => r.id !== confirmDelete));
    setConfirmDelete(null);
  };

  const FILTERS = [
    { key: 'all',      label: `All (${reports.length})` },
    { key: 'pending',  label: `Pending (${reports.filter(r => r.status === 'pending').length})` },
    { key: 'verified', label: `Verified (${reports.filter(r => r.status === 'verified').length})` },
    { key: 'rescued',  label: `Rescued (${reports.filter(r => r.status === 'rescued').length})` },
  ];

  const filtered = reports.filter(r => {
    const q = searchQuery.toLowerCase();
    return (r.snake_name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.reporter.toLowerCase().includes(q))
      && (activeFilter === 'all' || r.status === activeFilter);
  });

  const summaryCards = [
    { value: reports.length,                                     label: 'TOTAL REPORTS', color: '#818cf8', bg: '#eef2ff' },
    { value: reports.filter(r => r.status === 'pending').length,  label: 'PENDING',       color: '#d97706', bg: '#fffbeb' },
    { value: reports.filter(r => r.status === 'verified').length, label: 'VERIFIED',      color: '#10b981', bg: '#f0fdf4' },
    { value: reports.filter(r => r.status === 'rescued').length,  label: 'RESCUED',       color: '#3b82f6', bg: '#eff6ff' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: '#f0f2f5', p: { xs: 2, sm: 3, md: 4 } }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>Snake Reports</Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>Community reported snake sightings</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenReport(true)} sx={{
            background: '#1a1f36', color: '#fff', px: 3, py: 1.25, borderRadius: 2,
            boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' },
          }}>
            Report Sighting
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {summaryCards.map(card => (
            <Grid item xs={6} sm={3} key={card.label}>
              <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ minWidth: 48, height: 48, borderRadius: 1, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: card.color, fontWeight: 800, fontSize: '1.3rem' }}>{card.value}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', lineHeight: 1.3 }}>{card.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Search + Filters */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <TextField fullWidth placeholder="Search by snake type, location, or reporter…" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} size="small" sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9ca3af' }} /></InputAdornment> }} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {FILTERS.map(({ key, label }) => (
              <Box key={key} onClick={() => setActiveFilter(key)} sx={{
                px: 2, py: 0.6, borderRadius: 2, cursor: 'pointer', fontWeight: 700, fontSize: '0.76rem',
                transition: 'all 0.15s',
                background: activeFilter === key ? '#1a1f36' : '#f3f4f6',
                color: activeFilter === key ? '#fff' : '#6b7280',
                border: `1px solid ${activeFilter === key ? '#1a1f36' : '#e5e7eb'}`,
                '&:hover': { borderColor: '#1a1f36', color: activeFilter === key ? '#fff' : '#1a1f36' },
              }}>{label}</Box>
            ))}
          </Box>
        </Paper>

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <Paper sx={{ p: 6, borderRadius: 2, textAlign: 'center' }}>
            <Typography sx={{ color: '#9ca3af' }}>No reports found.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map(report => (
              <Grid item xs={12} sm={6} lg={4} xl={3} key={report.id}>
                <ReportCard report={report} onView={r => setViewReport(r)} onUpdateStatus={r => { setStatusReport(r); setNewStatus(r.status); }} onDelete={id => setConfirmDelete(id)} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* ── DIALOG: View Details ── */}
        <Dialog open={!!viewReport} onClose={() => setViewReport(null)} maxWidth="sm" fullWidth>
          {viewReport && (<>
            <DialogHeader title="Sighting Details" subtitle={`Report #${viewReport.id}`} onClose={() => setViewReport(null)} />
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ height: 210, overflow: 'hidden', position: 'relative' }}>
                <img src={viewReport.photo_url} alt={viewReport.snake_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />
                <Box sx={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', gap: 1 }}>
                  <Box sx={{ px: 1.5, py: 0.4, borderRadius: 3, background: SNAKE_COLORS[viewReport.snake_name] || '#8b5cf6', color: '#fff', fontSize: '0.72rem', fontWeight: 800 }}>{viewReport.snake_name}</Box>
                  <StatusBadge status={viewReport.status} />
                </Box>
              </Box>
              <Box sx={{ px: 3, py: 2 }}>
                <InfoRow icon={<Person sx={{ fontSize: 14, color: '#9ca3af' }} />}    label="Reporter" value={viewReport.reporter} />
                <InfoRow icon={<LocationOn sx={{ fontSize: 14, color: '#9ca3af' }} />} label="Location" value={viewReport.location} />
                <InfoRow icon={<AccessTime sx={{ fontSize: 14, color: '#9ca3af' }} />} label="Reported" value={format(viewReport.created_at, 'MMM dd, yyyy — HH:mm')} />
                {viewReport.description && (
                  <Box sx={{ py: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.64rem', display: 'block', mb: 0.8 }}>Description</Typography>
                    <Typography variant="body2" sx={{ color: '#1a1f36', lineHeight: 1.7 }}>{viewReport.description}</Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', gap: 1 }}>
              <Button onClick={() => { setConfirmDelete(viewReport.id); setViewReport(null); }}
                sx={{ color: '#ef4444', border: '1px solid #fecaca', borderRadius: 2, px: 2.5, '&:hover': { background: '#fef2f2' } }}
                startIcon={<Delete sx={{ fontSize: 16 }} />}>Delete</Button>
              <Box sx={{ flex: 1 }} />
              <Button onClick={() => setViewReport(null)} sx={{ color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 2, px: 2.5 }}>Close</Button>
              <Button onClick={() => { setStatusReport(viewReport); setNewStatus(viewReport.status); setViewReport(null); }}
                variant="contained" startIcon={<Edit />}
                sx={{ background: '#1a1f36', borderRadius: 2, px: 3, boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' } }}>
                Update Status
              </Button>
            </DialogActions>
          </>)}
        </Dialog>

        {/* ── DIALOG: Update Status ── */}
        <Dialog open={!!statusReport} onClose={() => setStatusReport(null)} maxWidth="xs" fullWidth>
          {statusReport && (<>
            <DialogHeader title="Update Status" subtitle={`${statusReport.snake_name} · ${statusReport.location}`} onClose={() => setStatusReport(null)} />
            <DialogContent sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 2.5 }}>Select a new status for this report.</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {STATUS_OPTIONS.map(s => {
                  const meta = STATUS_META[s];
                  const isSelected = newStatus === s;
                  return (
                    <Box key={s} onClick={() => setNewStatus(s)} sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      px: 2, py: 1.5, borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s',
                      border: `2px solid ${isSelected ? meta.color : '#e5e7eb'}`,
                      background: isSelected ? meta.bg : '#fff',
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: meta.color }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: isSelected ? meta.color : '#1a1f36' }}>{meta.label}</Typography>
                      </Box>
                      {isSelected && <CheckCircle sx={{ fontSize: 18, color: meta.color }} />}
                    </Box>
                  );
                })}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', gap: 1 }}>
              <Button onClick={() => setStatusReport(null)} sx={{ color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 2, px: 2.5 }}>Cancel</Button>
              <Button onClick={handleStatusUpdate} variant="contained" disabled={newStatus === statusReport.status}
                sx={{ background: '#1a1f36', borderRadius: 2, px: 4, boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' }, '&.Mui-disabled': { opacity: 0.4, color: '#fff' } }}>
                Save Status
              </Button>
            </DialogActions>
          </>)}
        </Dialog>

        {/* ── DIALOG: Delete Confirm ── */}
        <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
          <DialogHeader title="Delete Report" onClose={() => setConfirmDelete(null)} />
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 1 }}>
              <Box sx={{ width: 60, height: 60, borderRadius: 2, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Delete sx={{ color: '#ef4444', fontSize: 28 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1f36', mb: 1 }}>Are you sure?</Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.7 }}>
                This will permanently delete the report. This action cannot be undone.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', gap: 1 }}>
            <Button onClick={() => setConfirmDelete(null)} sx={{ color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 2, px: 2.5 }}>Cancel</Button>
            <Button onClick={handleDelete} variant="contained"
              sx={{ background: '#ef4444', borderRadius: 2, px: 4, boxShadow: 'none', '&:hover': { background: '#dc2626', boxShadow: 'none' } }}>
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── DIALOG: Report New Sighting ── */}
        <Dialog open={openReport} onClose={() => setOpenReport(false)} maxWidth="sm" fullWidth>
          <DialogHeader title="Report Snake Sighting" subtitle="Help keep your community safe" onClose={() => setOpenReport(false)} />
          <DialogContent sx={{ p: 3 }}>
            {selectedImage ? (
              <Box sx={{ position: 'relative', mb: 2.5, borderRadius: 2, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <img src={selectedImage} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                <IconButton size="small" onClick={() => setSelectedImage(null)} sx={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', '&:hover': { background: '#fff' } }}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box component="label" sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: 140, borderRadius: 2, border: '2px dashed #e5e7eb', cursor: 'pointer', mb: 2.5,
                background: '#f8fafc', transition: 'all 0.15s',
                '&:hover': { borderColor: '#1a1f36', background: '#f1f5f9' },
              }}>
                <PhotoCamera sx={{ color: '#9ca3af', fontSize: 32, mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600 }}>Click to upload snake photo</Typography>
                <Typography variant="caption" sx={{ color: '#9ca3af' }}>JPG, PNG up to 10MB</Typography>
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
              </Box>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField fullWidth label="Snake Type (if known)" value={formData.snake_name} onChange={(e) => field('snake_name', e.target.value)} size="small" />
              <TextField fullWidth label="Location" value={formData.location} onChange={(e) => field('location', e.target.value)} required size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: '#9ca3af', fontSize: 18 }} /></InputAdornment> }} />
              <TextField fullWidth label="Description" value={formData.description} onChange={(e) => field('description', e.target.value)} multiline rows={3} size="small" />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f1f5f9', gap: 1 }}>
            <Button onClick={() => setOpenReport(false)} sx={{ color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 2, px: 2.5 }}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={!formData.location}
              sx={{ background: '#1a1f36', borderRadius: 2, px: 4, boxShadow: 'none', '&:hover': { background: '#2d3561', boxShadow: 'none' }, '&.Mui-disabled': { opacity: 0.4, color: '#fff' } }}>
              Submit Report
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
}