import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  InputAdornment,
  TablePagination,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  LocalHospital,
  Person,
  Close,
} from '@mui/icons-material';
import { format } from 'date-fns';

// ─── Design tokens (same system as Dashboard) ─────────────────────────────────
const COLORS = {
  primary:    '#1a1f36',
  accent:     '#00d4aa',
  accentAlt:  '#ff6b6b',
  amber:      '#ffb347',
  sky:        '#4fc3f7',
  purple:     '#9c8fff',
  surface:    '#ffffff',
  surfaceAlt: '#f6f8fc',
  border:     '#e8ecf4',
  textMuted:  '#8892a4',
};

const cardSx = {
  borderRadius: 3,
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 2px 12px rgba(26,31,54,0.06)',
  background: COLORS.surface,
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_META = {
  reported:        { color: COLORS.sky,      bg: '#eef9ff', label: 'Reported' },
  confirmed:       { color: COLORS.amber,    bg: '#fff8ee', label: 'Confirmed' },
  under_treatment: { color: COLORS.purple,   bg: '#f3f0ff', label: 'Under Treatment' },
  recovered:       { color: COLORS.accent,   bg: '#edfaf6', label: 'Recovered' },
  death:           { color: COLORS.accentAlt,bg: '#fff1f1', label: 'Death' },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { color: COLORS.textMuted, bg: '#f5f5f5', label: status };
  return (
    <Box
      sx={{
        display: 'inline-block',
        px: 1.5,
        py: 0.4,
        borderRadius: 99,
        background: meta.bg,
        color: meta.color,
        fontSize: '0.72rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {meta.label}
    </Box>
  );
};

const SNAKE_TYPES = ['Cobra', 'Viper', 'Krait', 'Python', 'Other'];
const STATUS_OPTIONS = ['reported', 'confirmed', 'under_treatment', 'recovered', 'death'];

const SNAKE_COLORS = {
  Cobra: COLORS.accentAlt,
  Viper: COLORS.amber,
  Krait: COLORS.purple,
  Python: COLORS.sky,
  Other: COLORS.textMuted,
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const mockCases = [
  { id: 1, patient_name: 'John Doe',       patient_age: 35, patient_gender: 'Male',   snake: 'Cobra',  hospital: 'Central Hospital', district: 'Central',  status: 'under_treatment', bite_time: new Date('2024-02-20T14:30:00') },
  { id: 2, patient_name: 'Jane Smith',     patient_age: 28, patient_gender: 'Female', snake: 'Viper',  hospital: 'Eastern Medical',  district: 'Eastern',  status: 'recovered',       bite_time: new Date('2024-02-19T08:15:00') },
  { id: 3, patient_name: 'Mike Johnson',   patient_age: 42, patient_gender: 'Male',   snake: 'Krait',  hospital: 'Western Clinic',   district: 'Western',  status: 'confirmed',       bite_time: new Date('2024-02-21T19:20:00') },
  { id: 4, patient_name: 'Sarah Williams', patient_age: 31, patient_gender: 'Female', snake: 'Cobra',  hospital: 'Northern Health',  district: 'Northern', status: 'under_treatment', bite_time: new Date('2024-02-22T11:00:00') },
];

const emptyForm = {
  patient_name: '', patient_age: '', patient_gender: '',
  snake: '', hospital: '', district: '', bite_location: '', status: 'reported',
};

// ─── Styled input sx ─────────────────────────────────────────────────────────
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    background: COLORS.surfaceAlt,
    '& fieldset': { borderColor: COLORS.border },
    '&:hover fieldset': { borderColor: COLORS.purple },
    '&.Mui-focused fieldset': { borderColor: COLORS.purple },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: COLORS.purple },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function BiteCases() {
  const [cases, setCases] = useState(mockCases);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState(emptyForm);

  const handleOpenDialog = (case_ = null) => {
    if (case_) {
      setSelectedCase(case_);
      setFormData({ patient_name: case_.patient_name, patient_age: case_.patient_age, patient_gender: case_.patient_gender, snake: case_.snake, hospital: case_.hospital, district: case_.district, bite_location: case_.bite_location || '', status: case_.status });
    } else {
      setSelectedCase(null);
      setFormData(emptyForm);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => { setOpenDialog(false); setSelectedCase(null); };

  const handleSubmit = () => {
    if (selectedCase) {
      setCases(cases.map((c) => c.id === selectedCase.id ? { ...c, ...formData } : c));
    } else {
      setCases([{ id: Date.now(), ...formData, bite_time: new Date(), created_at: new Date() }, ...cases]);
    }
    handleCloseDialog();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this case?')) setCases(cases.filter((c) => c.id !== id));
  };

  const field = (key, val) => setFormData((f) => ({ ...f, [key]: val }));

  const filteredCases = cases.filter(
    (c) =>
      c.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.snake.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCases      = cases.length;
  const activeCount     = cases.filter((c) => c.status === 'under_treatment').length;
  const recoveredCount  = cases.filter((c) => c.status === 'recovered').length;
  const criticalCount   = cases.filter((c) => c.status === 'death').length;

  const summaryCards = [
    { label: 'Total Cases',      value: totalCases,     color: COLORS.purple },
    { label: 'Under Treatment',  value: activeCount,    color: COLORS.amber },
    { label: 'Recovered',        value: recoveredCount, color: COLORS.accent },
    { label: 'Deaths',           value: criticalCount,  color: COLORS.accentAlt },
  ];

  return (
    <Box sx={{ background: COLORS.surfaceAlt, minHeight: '100vh', p: { xs: 2, md: 3, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: COLORS.primary, fontFamily: '"DM Sans", sans-serif', lineHeight: 1.2 }}>
            Bite Cases
          </Typography>
          <Typography sx={{ color: COLORS.textMuted, mt: 0.5, fontSize: '0.95rem' }}>
            Manage and track all snake bite cases
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: COLORS.primary,
            borderRadius: 2,
            px: 3,
            py: 1.2,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(26,31,54,0.25)',
            '&:hover': { background: '#2d3555', boxShadow: '0 6px 20px rgba(26,31,54,0.3)' },
          }}
        >
          Report New Case
        </Button>
      </Box>

      {/* Summary mini-cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map(({ label, value, color }) => (
          <Grid item xs={6} sm={3} key={label}>
            <Paper sx={{ ...cardSx, p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontWeight: 800, color, fontSize: '1.1rem', fontFamily: '"DM Sans", sans-serif' }}>{value}</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 600, lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                {label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <Paper sx={{ ...cardSx, p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by patient name, snake type, or district…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={inputSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: COLORS.textMuted }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Table */}
      <Paper sx={{ ...cardSx, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: COLORS.surfaceAlt }}>
                {['Patient', 'Age / Gender', 'Snake Type', 'Hospital', 'District', 'Status', 'Bite Time', 'Actions'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 700, color: COLORS.textMuted, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', borderBottom: `2px solid ${COLORS.border}`, py: 2 }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCases
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((c, idx) => (
                  <TableRow
                    key={c.id}
                    hover
                    sx={{
                      '&:hover': { background: '#f8f9ff' },
                      borderBottom: `1px solid ${COLORS.border}`,
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Patient */}
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: COLORS.primary, fontSize: '0.8rem', fontWeight: 700 }}>
                          {c.patient_name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primary }}>{c.patient_name}</Typography>
                      </Box>
                    </TableCell>

                    {/* Age/Gender */}
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 500 }}>{c.patient_age}</Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textMuted }}>{c.patient_gender}</Typography>
                    </TableCell>

                    {/* Snake */}
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, px: 1.5, py: 0.5, borderRadius: 99, background: (SNAKE_COLORS[c.snake] || COLORS.textMuted) + '18' }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: SNAKE_COLORS[c.snake] || COLORS.textMuted }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: SNAKE_COLORS[c.snake] || COLORS.textMuted }}>{c.snake}</Typography>
                      </Box>
                    </TableCell>

                    {/* Hospital */}
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <LocalHospital sx={{ fontSize: 14, color: COLORS.textMuted }} />
                        <Typography variant="body2" sx={{ color: COLORS.primary }}>{c.hospital}</Typography>
                      </Box>
                    </TableCell>

                    {/* District */}
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: COLORS.primary }}>{c.district}</Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ py: 2 }}>
                      <StatusBadge status={c.status} />
                    </TableCell>

                    {/* Bite time */}
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 500 }}>
                        {format(c.bite_time, 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
                        {format(c.bite_time, 'HH:mm')}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" sx={{ color: COLORS.sky, '&:hover': { background: COLORS.sky + '18' } }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenDialog(c)} sx={{ color: COLORS.purple, '&:hover': { background: COLORS.purple + '18' } }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(c.id)} sx={{ color: COLORS.accentAlt, '&:hover': { background: COLORS.accentAlt + '18' } }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredCases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: COLORS.textMuted }}>No cases found matching your search.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCases.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          sx={{ borderTop: `1px solid ${COLORS.border}`, color: COLORS.textMuted }}
        />
      </Paper>

      {/* ── Add / Edit Dialog ── */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {/* Dialog header */}
        <Box sx={{ background: COLORS.primary, px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, fontFamily: '"DM Sans", sans-serif' }}>
              {selectedCase ? 'Edit Bite Case' : 'Report New Bite Case'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Fill in the details below
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}>
            <Close />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, background: COLORS.surfaceAlt }}>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Patient Name" value={formData.patient_name} onChange={(e) => field('patient_name', e.target.value)} required sx={inputSx} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Age" type="number" value={formData.patient_age} onChange={(e) => field('patient_age', e.target.value)} required sx={inputSx} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth select label="Gender" value={formData.patient_gender} onChange={(e) => field('patient_gender', e.target.value)} required sx={inputSx}>
                {['Male', 'Female', 'Other'].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Snake Type" value={formData.snake} onChange={(e) => field('snake', e.target.value)} required sx={inputSx}>
                {SNAKE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Hospital" value={formData.hospital} onChange={(e) => field('hospital', e.target.value)} required sx={inputSx} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="District" value={formData.district} onChange={(e) => field('district', e.target.value)} required sx={inputSx} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select label="Status" value={formData.status} onChange={(e) => field('status', e.target.value)} required sx={inputSx}>
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>{STATUS_META[s]?.label || s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Bite Location (description)" value={formData.bite_location} onChange={(e) => field('bite_location', e.target.value)} multiline rows={2} sx={inputSx} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, background: COLORS.surfaceAlt, borderTop: `1px solid ${COLORS.border}`, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ borderRadius: 2, textTransform: 'none', color: COLORS.textMuted, fontWeight: 600, px: 3 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: COLORS.primary,
              borderRadius: 2,
              px: 4,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(26,31,54,0.25)',
              '&:hover': { background: '#2d3555' },
            }}
          >
            {selectedCase ? 'Update Case' : 'Submit Case'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}