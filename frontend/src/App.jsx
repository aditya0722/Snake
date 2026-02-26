import { AuthProvider } from './context/authContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/Mainlayout";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import SnakeReports from "./pages/SnakeReports";
import Hospitals from "./pages/Hospitals";
import ASVStock from "./pages/ASVStock";
import SnakeRescuers from "./pages/SnakeRescuers";
import Snakes from "./pages/Snakes";
import Users from "./pages/Users";
import SnakeBiteCase from "./pages/SnakeBiteCase";
import AuditLogPage from "./pages/AuditLogPage";
const theme = createTheme({
  palette: {
    primary: {
      main: "#8f3a3f",
    },
    secondary: {
      main: "#764ba2",
    },
  },
  typography: {
    fontFamily:
      '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
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
              
              <Route
                path="snake-reports"
                element={<SnakeReports />}
              />
              <Route path="hospitals" element={<Hospitals />} />
              <Route path="asv-stock" element={<ASVStock />} />
              <Route
                path="snake-rescuers"
                element={<SnakeRescuers />}
              /> 
              <Route path="snakes" element={<Snakes />} />
              <Route path="users" element={<Users />} />
              <Route path="bite-cases/:id" element={<SnakeBiteCase />} />
              <Route path="audit-logs" element={<AuditLogPage />} />
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