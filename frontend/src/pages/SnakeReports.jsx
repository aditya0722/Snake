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

const COLORS = {
  primary: '#1a1f36', accent: '#00d4aa', accentAlt: '#ff6b6b',
  amber: '#ffb347', sky: '#4fc3f7', purple: '#9c8fff',
  surface: '#ffffff', surfaceAlt: '#f6f8fc', border: '#e8ecf4', textMuted: '#8892a4',
};

const cardSx = { borderRadius: 3, border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 12px rgba(26,31,54,0.06)', background: COLORS.surface };
const inputSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2, background: COLORS.surfaceAlt, '& fieldset': { borderColor: COLORS.border }, '&:hover fieldset': { borderColor: COLORS.purple }, '&.Mui-focused fieldset': { borderColor: COLORS.purple } },
  '& .MuiInputLabel-root.Mui-focused': { color: COLORS.purple },
};

const STATUS_META = {
  pending:  { color: COLORS.amber,   bg: '#fff8ee', label: 'Pending' },
  verified: { color: COLORS.accent,  bg: '#edfaf6', label: 'Verified' },
  rescued:  { color: COLORS.sky,     bg: '#eef9ff', label: 'Rescued' },
};
const STATUS_OPTIONS = ['pending', 'verified', 'rescued'];

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { color: COLORS.textMuted, bg: '#f5f5f5', label: status };
  return <Box sx={{ display: 'inline-block', px: 1.5, py: 0.4, borderRadius: 99, background: meta.bg, color: meta.color, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{meta.label}</Box>;
};

const SNAKE_COLORS = { Cobra: COLORS.accentAlt, Viper: COLORS.amber, Krait: COLORS.purple, Python: COLORS.sky, Other: COLORS.textMuted };

const mockReports = [
  { id: 1, snake_name: 'Cobra',  reporter: 'John Doe',     location: 'Central District, Village A', description: 'Found near the river bank, very aggressive behaviour observed near the fishing area.', status: 'verified', photo_url: 'https://images.unsplash.com/photo-1531386450450-969f935bd522?w=600&q=80', created_at: new Date('2024-02-22T10:30:00') },
  { id: 2, snake_name: 'Viper',  reporter: 'Jane Smith',   location: 'Eastern District, Town B',    description: 'Spotted in the backyard garden close to the water pipe. Children in the area.', status: 'pending',  photo_url: 'https://images.unsplash.com/photo-1586263361651-b6e0a31c0eb7?w=600&q=80', created_at: new Date('2024-02-21T15:45:00') },
  { id: 3, snake_name: 'Python', reporter: 'Mike Johnson', location: 'Western District, Area C',    description: 'Large python coiled around a tree near the school entrance. Rescue team alerted.', status: 'rescued',  photo_url: 'https://images.unsplash.com/photo-1531386450450-969f935bd522?w=600&q=80', created_at: new Date('2024-02-20T08:20:00') },
];

const emptyForm = { snake_name: '', location: '', description: '' };

const DialogHeader = ({ title, subtitle, onClose }) => (
  <Box sx={{ background: COLORS.primary, px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Box>
      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontFamily: '"DM Sans", sans-serif' }}>{title}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{subtitle}</Typography>}
    </Box>
    <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}><Close /></IconButton>
  </Box>
);

const InfoRow = ({ icon, label, value }) => (
  <Box sx={{ display: 'flex', gap: 2, py: 1.5, borderBottom: `1px solid ${COLORS.border}` }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 120, flexShrink: 0 }}>
      {icon}
      <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.67rem' }}>{label}</Typography>
    </Box>
    <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 500 }}>{value}</Typography>
  </Box>
);

const ReportCard = ({ report, onView, onUpdateStatus, onDelete }) => {
  const snakeColor = SNAKE_COLORS[report.snake_name] || COLORS.purple;
  return (
    <Card sx={{ ...cardSx, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 28px rgba(26,31,54,0.12)' } }}>
      <Box sx={{ position: 'relative', height: 200, overflow: 'hidden', background: '#e8ecf4' }}>
        <CardMedia component="img" image={report.photo_url} alt={report.snake_name} sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.04)' } }} />
        <Box sx={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ px: 1.5, py: 0.5, borderRadius: 99, background: snakeColor, color: '#fff', fontSize: '0.72rem', fontWeight: 800 }}>{report.snake_name}</Box>
          <StatusBadge status={report.status} />
        </Box>
        <IconButton size="small" onClick={() => onDelete(report.id)} sx={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(255,255,255,0.9)', color: COLORS.accentAlt, width: 30, height: 30, '&:hover': { background: COLORS.accentAlt, color: '#fff' } }}>
          <Delete sx={{ fontSize: 15 }} />
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
          <LocationOn sx={{ fontSize: 15, color: COLORS.accentAlt, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 500, fontSize: '0.82rem', lineHeight: 1.4 }}>{report.location}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Avatar sx={{ width: 22, height: 22, bgcolor: COLORS.primary, fontSize: '0.6rem', fontWeight: 700 }}>{report.reporter.charAt(0)}</Avatar>
            <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 600 }}>{report.reporter}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarToday sx={{ fontSize: 11, color: COLORS.textMuted }} />
            <Typography variant="caption" sx={{ color: COLORS.textMuted }}>{format(report.created_at, 'MMM dd, yyyy')}</Typography>
          </Box>
        </Box>
      </CardContent>
      <Box sx={{ px: 2.5, pb: 2.5, display: 'flex', gap: 1 }}>
        <Button size="small" endIcon={<ArrowForward sx={{ fontSize: '13px !important' }} />} onClick={() => onView(report)} sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', color: COLORS.primary, border: `1px solid ${COLORS.border}`, '&:hover': { background: COLORS.surfaceAlt, borderColor: COLORS.primary } }}>View Details</Button>
        <Button size="small" startIcon={<Edit sx={{ fontSize: '13px !important' }} />} onClick={() => onUpdateStatus(report)} sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', color: COLORS.purple, border: `1px solid ${COLORS.purple}30`, background: COLORS.purple + '0d', '&:hover': { background: COLORS.purple + '1a' } }}>Update Status</Button>
      </Box>
    </Card>
  );
};

export default function SnakeReports() {
  const [reports, setReports]             = useState(mockReports);
  const [openReport, setOpenReport]       = useState(false);
  const [viewReport, setViewReport]       = useState(null);
  const [statusReport, setStatusReport]   = useState(null);
  const [newStatus, setNewStatus]         = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData]           = useState(emptyForm);
  const [activeFilter, setActiveFilter]   = useState('all');

  const field = (key, val) => setFormData((f) => ({ ...f, [key]: val }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setReports([{ id: Date.now(), ...formData, reporter: 'Current User', photo_url: selectedImage || mockReports[0].photo_url, status: 'pending', created_at: new Date() }, ...reports]);
    setOpenReport(false); setFormData(emptyForm); setSelectedImage(null);
  };

  const handleStatusUpdate = () => {
    if (!newStatus || newStatus === statusReport.status) return;
    setReports(reports.map((r) => r.id === statusReport.id ? { ...r, status: newStatus } : r));
    setStatusReport(null); setNewStatus('');
  };

  const handleDelete = () => {
    setReports(reports.filter((r) => r.id !== confirmDelete));
    setConfirmDelete(null);
  };

  const FILTERS = [
    { key: 'all',      label: `All (${reports.length})` },
    { key: 'pending',  label: `Pending (${reports.filter(r => r.status === 'pending').length})` },
    { key: 'verified', label: `Verified (${reports.filter(r => r.status === 'verified').length})` },
    { key: 'rescued',  label: `Rescued (${reports.filter(r => r.status === 'rescued').length})` },
  ];

  const filtered = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (r.snake_name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q) || r.reporter.toLowerCase().includes(q))
      && (activeFilter === 'all' || r.status === activeFilter);
  });

  return (
    <Box sx={{ background: COLORS.surfaceAlt, minHeight: '100vh', p: { xs: 2, md: 3, lg: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.primary, fontFamily: '"DM Sans", sans-serif', lineHeight: 1.2 }}>Snake Reports</Typography>
          <Typography sx={{ color: COLORS.textMuted, mt: 0.5, fontSize: '0.95rem' }}>Community reported snake sightings</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenReport(true)} sx={{ background: COLORS.primary, borderRadius: 2, px: 3, py: 1.2, fontWeight: 700, textTransform: 'none', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(26,31,54,0.25)', '&:hover': { background: '#2d3555' } }}>
          Report Sighting
        </Button>
      </Box>

      <Paper sx={{ ...cardSx, p: 2, mb: 3 }}>
        <TextField fullWidth placeholder="Search by snake type, location, or reporter..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} sx={{ ...inputSx, mb: 2 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: COLORS.textMuted }} /></InputAdornment> }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {FILTERS.map(({ key, label }) => (
            <Box key={key} onClick={() => setActiveFilter(key)} sx={{ px: 2, py: 0.6, borderRadius: 99, cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem', transition: 'all 0.15s', background: activeFilter === key ? COLORS.primary : COLORS.surfaceAlt, color: activeFilter === key ? '#fff' : COLORS.textMuted, border: `1px solid ${activeFilter === key ? COLORS.primary : COLORS.border}`, '&:hover': { borderColor: COLORS.primary, color: activeFilter === key ? '#fff' : COLORS.primary } }}>{label}</Box>
          ))}
        </Box>
      </Paper>

      {filtered.length === 0 ? (
        <Paper sx={{ ...cardSx, p: 6, textAlign: 'center' }}><Typography sx={{ color: COLORS.textMuted }}>No reports found.</Typography></Paper>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((report) => (
            <Grid item xs={12} sm={6} lg={4} xl={3} key={report.id}>
              <ReportCard report={report} onView={(r) => setViewReport(r)} onUpdateStatus={(r) => { setStatusReport(r); setNewStatus(r.status); }} onDelete={(id) => setConfirmDelete(id)} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* POPUP 1: View Details */}
      <Dialog open={!!viewReport} onClose={() => setViewReport(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {viewReport && (<>
          <DialogHeader title="Sighting Details" subtitle={`Report #${viewReport.id}`} onClose={() => setViewReport(null)} />
          <DialogContent sx={{ p: 0, background: COLORS.surfaceAlt }}>
            <Box sx={{ height: 220, overflow: 'hidden', position: 'relative' }}>
              <img src={viewReport.photo_url} alt={viewReport.snake_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,31,54,0.55) 0%, transparent 55%)' }} />
              <Box sx={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', gap: 1 }}>
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 99, background: SNAKE_COLORS[viewReport.snake_name] || COLORS.purple, color: '#fff', fontSize: '0.78rem', fontWeight: 800 }}>{viewReport.snake_name}</Box>
                <StatusBadge status={viewReport.status} />
              </Box>
            </Box>
            <Box sx={{ px: 3, py: 2 }}>
              <InfoRow icon={<Person sx={{ fontSize: 15, color: COLORS.textMuted }} />}     label="Reporter" value={viewReport.reporter} />
              <InfoRow icon={<LocationOn sx={{ fontSize: 15, color: COLORS.textMuted }} />}  label="Location" value={viewReport.location} />
              <InfoRow icon={<AccessTime sx={{ fontSize: 15, color: COLORS.textMuted }} />}  label="Reported" value={format(viewReport.created_at, 'MMM dd, yyyy — HH:mm')} />
              {viewReport.description && (
                <Box sx={{ py: 1.5 }}>
                  <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.67rem', display: 'block', mb: 0.8 }}>Description</Typography>
                  <Typography variant="body2" sx={{ color: COLORS.primary, lineHeight: 1.7 }}>{viewReport.description}</Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, background: COLORS.surfaceAlt, borderTop: `1px solid ${COLORS.border}`, gap: 1 }}>
            <Button onClick={() => setViewReport(null)} sx={{ borderRadius: 2, textTransform: 'none', color: COLORS.textMuted, fontWeight: 600, px: 3 }}>Close</Button>
            <Button onClick={() => { setStatusReport(viewReport); setNewStatus(viewReport.status); setViewReport(null); }} variant="contained" startIcon={<Edit />} sx={{ background: COLORS.primary, borderRadius: 2, px: 3, fontWeight: 700, textTransform: 'none', '&:hover': { background: '#2d3555' } }}>Update Status</Button>
          </DialogActions>
        </>)}
      </Dialog>

      {/* POPUP 2: Update Status */}
      <Dialog open={!!statusReport} onClose={() => setStatusReport(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {statusReport && (<>
          <DialogHeader title="Update Status" subtitle={`${statusReport.snake_name} · ${statusReport.location}`} onClose={() => setStatusReport(null)} />
          <DialogContent sx={{ p: 3, background: COLORS.surfaceAlt }}>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, mb: 2.5 }}>Select a new status for this sighting report.</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {STATUS_OPTIONS.map((s) => {
                const meta = STATUS_META[s];
                const isSelected = newStatus === s;
                return (
                  <Box key={s} onClick={() => setNewStatus(s)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderRadius: 2, cursor: 'pointer', transition: 'all 0.15s', border: `2px solid ${isSelected ? meta.color : COLORS.border}`, background: isSelected ? meta.bg : COLORS.surface }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: meta.color }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: isSelected ? meta.color : COLORS.primary }}>{meta.label}</Typography>
                    </Box>
                    {isSelected && <CheckCircle sx={{ fontSize: 18, color: meta.color }} />}
                  </Box>
                );
              })}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, background: COLORS.surfaceAlt, borderTop: `1px solid ${COLORS.border}`, gap: 1 }}>
            <Button onClick={() => setStatusReport(null)} sx={{ borderRadius: 2, textTransform: 'none', color: COLORS.textMuted, fontWeight: 600, px: 3 }}>Cancel</Button>
            <Button onClick={handleStatusUpdate} variant="contained" disabled={newStatus === statusReport.status} sx={{ background: COLORS.primary, borderRadius: 2, px: 4, fontWeight: 700, textTransform: 'none', '&:hover': { background: '#2d3555' }, '&.Mui-disabled': { background: COLORS.border, color: COLORS.textMuted } }}>Save Status</Button>
          </DialogActions>
        </>)}
      </Dialog>

      {/* POPUP 3: Delete Confirmation */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <DialogHeader title="Delete Report" onClose={() => setConfirmDelete(null)} />
        <DialogContent sx={{ p: 3, background: COLORS.surfaceAlt }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 1 }}>
            <Box sx={{ width: 60, height: 60, borderRadius: '50%', background: COLORS.accentAlt + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Delete sx={{ color: COLORS.accentAlt, fontSize: 28 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 1 }}>Are you sure?</Typography>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, lineHeight: 1.7 }}>This will permanently delete the report. This action cannot be undone.</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, background: COLORS.surfaceAlt, borderTop: `1px solid ${COLORS.border}`, gap: 1 }}>
          <Button onClick={() => setConfirmDelete(null)} sx={{ borderRadius: 2, textTransform: 'none', color: COLORS.textMuted, fontWeight: 600, px: 3 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ background: COLORS.accentAlt, borderRadius: 2, px: 4, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px rgba(255,107,107,0.3)', '&:hover': { background: '#e55a5a' } }}>Yes, Delete</Button>
        </DialogActions>
      </Dialog>

      {/* POPUP 4: Report New Sighting */}
      <Dialog open={openReport} onClose={() => setOpenReport(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <DialogHeader title="Report Snake Sighting" subtitle="Help keep your community safe" onClose={() => setOpenReport(false)} />
        <DialogContent sx={{ p: 3, background: COLORS.surfaceAlt }}>
          {selectedImage ? (
            <Box sx={{ position: 'relative', mb: 2.5, borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
              <img src={selectedImage} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
              <IconButton size="small" onClick={() => setSelectedImage(null)} sx={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', '&:hover': { background: '#fff' } }}><Close fontSize="small" /></IconButton>
            </Box>
          ) : (
            <Box component="label" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 140, borderRadius: 2, border: `2px dashed ${COLORS.border}`, cursor: 'pointer', mb: 2.5, background: COLORS.surface, transition: 'all 0.15s', '&:hover': { borderColor: COLORS.purple, background: COLORS.purple + '06' } }}>
              <PhotoCamera sx={{ color: COLORS.textMuted, fontSize: 32, mb: 1 }} />
              <Typography variant="body2" sx={{ color: COLORS.textMuted, fontWeight: 600 }}>Click to upload snake photo</Typography>
              <Typography variant="caption" sx={{ color: COLORS.border }}>JPG, PNG up to 10MB</Typography>
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Box>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Snake Type (if known)" value={formData.snake_name} onChange={(e) => field('snake_name', e.target.value)} sx={inputSx} />
            <TextField fullWidth label="Location" value={formData.location} onChange={(e) => field('location', e.target.value)} required sx={inputSx} InputProps={{ startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: COLORS.textMuted, fontSize: 18 }} /></InputAdornment> }} />
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => field('description', e.target.value)} multiline rows={3} sx={inputSx} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, background: COLORS.surfaceAlt, borderTop: `1px solid ${COLORS.border}`, gap: 1 }}>
          <Button onClick={() => setOpenReport(false)} sx={{ borderRadius: 2, textTransform: 'none', color: COLORS.textMuted, fontWeight: 600, px: 3 }}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.location} sx={{ background: COLORS.primary, borderRadius: 2, px: 4, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px rgba(26,31,54,0.25)', '&:hover': { background: '#2d3555' }, '&.Mui-disabled': { background: COLORS.border, color: COLORS.textMuted } }}>Submit Report</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}