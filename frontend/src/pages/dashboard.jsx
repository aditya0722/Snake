import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  CheckCircle,
  People,
  Dangerous,
  MedicalServices,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/authContext';

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLORS = {
  primary:   '#1a1f36',   // deep navy
  accent:    '#00d4aa',   // teal-green
  accentAlt: '#ff6b6b',   // coral-red
  amber:     '#ffb347',
  sky:       '#4fc3f7',
  purple:    '#9c8fff',
  surface:   '#ffffff',
  surfaceAlt:'#f6f8fc',
  border:    '#e8ecf4',
  textMuted: '#8892a4',
};

const cardSx = {
  borderRadius: 3,
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 2px 12px rgba(26,31,54,0.06)',
  background: COLORS.surface,
  height: '100%',
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, accentColor, trend, sub }) => (
  <Card sx={{ ...cardSx }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: COLORS.textMuted, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.7rem' }}
          >
            {title}
          </Typography>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: COLORS.primary, mt: 0.5, mb: 0.5, lineHeight: 1.1, fontFamily: '"DM Sans", sans-serif' }}
          >
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 14, color: COLORS.accent }} />
              <Typography variant="caption" sx={{ color: COLORS.accent, fontWeight: 700 }}>
                {trend}
              </Typography>
            </Box>
          )}
          {sub && (
            <Typography variant="caption" sx={{ color: COLORS.textMuted }}>
              {sub}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            background: accentColor + '18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ─── Mock data ────────────────────────────────────────────────────────────────
const monthlyData = [
  { month: 'Jan', cases: 45, recovered: 38, deaths: 2 },
  { month: 'Feb', cases: 52, recovered: 45, deaths: 3 },
  { month: 'Mar', cases: 48, recovered: 42, deaths: 1 },
  { month: 'Apr', cases: 61, recovered: 53, deaths: 4 },
  { month: 'May', cases: 55, recovered: 48, deaths: 2 },
  { month: 'Jun', cases: 58, recovered: 51, deaths: 3 },
];

const snakeTypeData = [
  { name: 'Cobra',  value: 120, color: '#1a1f36' },
  { name: 'Viper',  value: 80,  color: '#9c8fff' },
  { name: 'Krait',  value: 60,  color: '#4fc3f7' },
  { name: 'Other',  value: 40,  color: '#00d4aa' },
];

const districtData = [
  { district: 'Central',  cases: 45 },
  { district: 'Eastern',  cases: 38 },
  { district: 'Western',  cases: 52 },
  { district: 'Northern', cases: 28 },
  { district: 'Southern', cases: 35 },
];

const recentCases = [
  { id: 1, patient: 'John Doe',     snake: 'Cobra', status: 'Under Treatment', district: 'Central', time: '2 hours ago' },
  { id: 2, patient: 'Jane Smith',   snake: 'Viper', status: 'Recovered',       district: 'Eastern', time: '5 hours ago' },
  { id: 3, patient: 'Mike Johnson', snake: 'Krait', status: 'Under Treatment', district: 'Western', time: '1 day ago' },
];

const hospitalStock = [
  { name: 'Central Hospital',  pct: 75 },
  { name: 'Eastern Medical',   pct: 45 },
  { name: 'Western Clinic',    pct: 20 },
  { name: 'Northern Health',   pct: 85 },
];

const getStatusMeta = (status) => {
  switch (status) {
    case 'Under Treatment': return { color: COLORS.amber,    bg: '#fff8ee', label: status };
    case 'Recovered':       return { color: COLORS.accent,   bg: '#edfaf6', label: status };
    case 'Critical':        return { color: COLORS.accentAlt,bg: '#fff1f1', label: status };
    default:                return { color: COLORS.textMuted, bg: '#f5f5f5', label: status };
  }
};

const stockColor = (pct) =>
  pct < 30 ? COLORS.accentAlt : pct < 60 ? COLORS.amber : COLORS.accent;

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ background: COLORS.primary, borderRadius: 2, px: 2, py: 1.5, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
      <Typography variant="caption" sx={{ color: COLORS.accent, fontWeight: 700, display: 'block', mb: 0.5 }}>{label}</Typography>
      {payload.map((p) => (
        <Typography key={p.name} variant="caption" sx={{ color: '#fff', display: 'block' }}>
          {p.name}: <strong>{p.value}</strong>
        </Typography>
      ))}
    </Box>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Box sx={{ background: COLORS.surfaceAlt, minHeight: '100vh', p: { xs: 2, md: 3, lg: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: COLORS.primary, fontFamily: '"DM Sans", sans-serif', lineHeight: 1.2 }}
          >
            Welcome back, {user?.name}! 👋
          </Typography>
          <Typography sx={{ color: COLORS.textMuted, mt: 0.5, fontSize: '0.95rem' }}>
            Here's the snake bite case overview for today.
          </Typography>
        </Box>
        <Chip
          label="Live · Updated just now"
          size="small"
          sx={{ background: COLORS.accent + '18', color: COLORS.accent, fontWeight: 700, border: `1px solid ${COLORS.accent}40` }}
        />
      </Box>

      {/* ── Row 1: Stat cards ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Cases"       value="324" icon={<Dangerous fontSize="medium" />}        accentColor={COLORS.accentAlt} trend="+12% this month" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Under Treatment"   value="28"  icon={<Warning fontSize="medium" />}           accentColor={COLORS.amber}     sub="Active patients" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Recovered"         value="285" icon={<CheckCircle fontSize="medium" />}       accentColor={COLORS.accent}    trend="+8% this month" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Active Rescuers"   value="45"  icon={<People fontSize="medium" />}            accentColor={COLORS.sky}       sub="On duty today" />
        </Grid>
      </Grid>

      {/* ── Row 2: Line chart + Pie chart ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ ...cardSx, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 2.5, fontFamily: '"DM Sans", sans-serif' }}>
              Monthly Case Trends
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="month" tick={{ fill: COLORS.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: COLORS.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                <Line type="monotone" dataKey="cases"     stroke={COLORS.purple}    strokeWidth={2.5} dot={{ r: 4, fill: COLORS.purple }}    name="Total Cases" />
                <Line type="monotone" dataKey="recovered" stroke={COLORS.accent}    strokeWidth={2.5} dot={{ r: 4, fill: COLORS.accent }}     name="Recovered" />
                <Line type="monotone" dataKey="deaths"    stroke={COLORS.accentAlt} strokeWidth={2.5} dot={{ r: 4, fill: COLORS.accentAlt }} name="Deaths" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ ...cardSx, p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 2.5, fontFamily: '"DM Sans", sans-serif' }}>
              Cases by Snake Type
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={snakeTypeData}
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {snakeTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {snakeTypeData.map((d) => {
                const total = snakeTypeData.reduce((s, x) => s + x.value, 0);
                return (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 500 }}>{d.name}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: COLORS.textMuted, fontWeight: 600 }}>
                      {((d.value / total) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 3: Bar chart + Recent cases ── */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={5}>
          <Paper sx={{ ...cardSx, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 2.5, fontFamily: '"DM Sans", sans-serif' }}>
              Cases by District
            </Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={districtData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                <XAxis dataKey="district" tick={{ fill: COLORS.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: COLORS.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cases" fill={COLORS.purple} radius={[6, 6, 0, 0]} name="Cases" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper sx={{ ...cardSx, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, mb: 2, fontFamily: '"DM Sans", sans-serif' }}>
              Recent Cases
            </Typography>
            <Box>
              {recentCases.map((c, idx) => {
                const meta = getStatusMeta(c.status);
                return (
                  <Box
                    key={c.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 2,
                      borderBottom: idx < recentCases.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: COLORS.primary,
                          width: 42,
                          height: 42,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          fontFamily: '"DM Sans", sans-serif',
                        }}
                      >
                        {c.patient.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: COLORS.primary }}>{c.patient}</Typography>
                        <Typography variant="caption" sx={{ color: COLORS.textMuted }}>{c.snake} · {c.district}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
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
                          mb: 0.5,
                        }}
                      >
                        {meta.label}
                      </Box>
                      <Typography variant="caption" display="block" sx={{ color: COLORS.textMuted }}>
                        {c.time}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Row 4: ASV stock ── */}
      <Paper sx={{ ...cardSx, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <MedicalServices sx={{ color: COLORS.accent }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, fontFamily: '"DM Sans", sans-serif' }}>
            ASV Stock Status
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {hospitalStock.map(({ name, pct }) => (
            <Grid item xs={12} sm={6} lg={3} key={name}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: COLORS.primary }}>{name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: stockColor(pct), fontFamily: '"DM Sans", sans-serif' }}>
                    {pct}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: COLORS.border,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: stockColor(pct),
                      borderRadius: 4,
                    },
                  }}
                />
                {pct < 30 && (
                  <Typography variant="caption" sx={{ color: COLORS.accentAlt, fontWeight: 600, mt: 0.5, display: 'block' }}>
                    ⚠ Low stock — reorder needed
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}