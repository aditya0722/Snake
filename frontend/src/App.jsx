import { AuthProvider } from './context/authContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/Mainlayout";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import ReportBiteCase from "./pages/ReportBiteCase";
import Hospitals from "./pages/Hospitals";
import ASVStock from "./pages/ASVStock";
import SnakeRescuers from "./pages/SnakeRescuers";
import Snakes from "./pages/Snakes";
import Users from "./pages/Users";
import SnakeBiteCase from "./pages/SnakeBiteCase";
import AuditLogPage from "./pages/AuditLogPage";
import UserProfilePage from './pages/UserProfilePage';
import RescuerVerificationPage from './pages/RescuerVerificationPage';
import FirstAid from './pages/FirstAid';
import ReportSnake from './pages/ReportSnake';
import { RoleProtected } from "./hooks/usePermissions";
const theme = createTheme({
  palette: {
    primary: {
      main: "#1a1f36", // Deep navy/black
      light: "#2e3a59",
      dark: "#0f1425",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#047857", // Emerald 700 (Green)
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    success: {
      main: "#10b981",
    },
  },
  typography: {
    fontFamily: '"Inter", "Outfit", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 20px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(4, 120, 87, 0.15)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #1a1f36 0%, #2e3a59 100%)",
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #047857 0%, #10b981 100%)",
          color: "#ffffff",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          border: "1px solid rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/dashboard" replace />}
              />
              <Route path="dashboard" element={<Dashboard />} />

              <Route path="hospitals" element={<RoleProtected permissions={['view_hospitals', 'view_hospital_details', 'manage_hospitals']}><Hospitals /></RoleProtected>} />
              <Route path="asv-stock" element={<RoleProtected permissions={['manage_asv_stock', 'manage_asv_inventory']}><ASVStock /></RoleProtected>} />
              <Route path="snake-rescuers" element={<RoleProtected permissions={['view_rescuers']}><SnakeRescuers /></RoleProtected>} />
              <Route path="snakes" element={<RoleProtected permission="view_snake_info"><Snakes /></RoleProtected>} />
              <Route path="users" element={<RoleProtected roles={['admin', 'logistics_manager']}><Users /></RoleProtected>} />
              <Route path="bite-cases" element={<RoleProtected permissions={['view_all_cases', 'view_my_cases', 'confirm_bite_case', 'view_active_cases', 'register_new_case']}><SnakeBiteCase /></RoleProtected>} />
              <Route path="audit-logs" element={<RoleProtected permissions={['view_audit_logs']}><AuditLogPage /></RoleProtected>} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="rescuer-verification" element={<RoleProtected roles={['community_user']}><RescuerVerificationPage /></RoleProtected>} />
              <Route path="report-snake-bite" element={<RoleProtected permission="report_bite_case"><ReportBiteCase /></RoleProtected>} />
              <Route path="first-aid" element={<RoleProtected permission="view_first_aid"><FirstAid /></RoleProtected>} />
              <Route path="report-snake" element={<RoleProtected permission="report_snake"><ReportSnake /></RoleProtected>} />
            </Route>

            {/* Catch all */}
            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}