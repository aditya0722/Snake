import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '../api/axios';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#0e0d1d",
    },
    error: {
      main: "#ef4444",
    },
    background: {
      default: "#03070a",
      paper: "#3b3d3d",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      background: "linear-gradient(to right, #303a4f, #322d8b)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "0.5rem",
    },
    body2: {
      color: "#3a5b88",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#d6d6d6",
            borderRadius: "0.5rem",
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "#d2d5d8",
            },
            "&.Mui-focused": {
              backgroundColor: "#ffffff",
              "& fieldset": {
                borderColor: "#40495c",
                borderWidth: 2,
              },
            },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderWidth: 2,
            },
          },
          "& .MuiOutlinedInput-input": {
            padding: "12px 4px",
            fontWeight: 500,
          },
          "& .MuiInputAdornment-positionStart": {
            marginRight: "8px",
            color: "#94a3b8",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontSize: "1rem",
          fontWeight: 600,
          borderRadius: "0.5rem",
          padding: "12px 16px",
          transition: "all 0.2s",
        },
        contained: {
          background: "linear-gradient(to right, #25272c, #0c321e)",
          "&:hover": {
            background: "linear-gradient(to right, #3e4454, #184134)",
            boxShadow: "0 10px 25px rgba(10, 49, 38, 0.3)",
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0px)",
          },
        },
      },
    },
  },
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await api.post('auth/login.php', {
        email: formData.email,
        password: formData.password,
      });

      console.log('Full response:', response.data);

      // Check exact success value
      if (response.data.status === true) {
        const { name,user_id, role, token, } = response.data.data;

        login({
          id: user_id,
          name: name,
          role: role,
          token: token,
        });

        navigate('/dashboard');
      } else {
        setErrorMessage(response.data.message || 'Invalid credentials');
      }

    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Server error. Please try again.'
      );
    }

    setLoading(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #202423, #1c5142, #023e1d)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: 80,
            right: 80,
            width: 288,
            height: 288,
            background: "#c9febf",
            borderRadius: "50%",
            filter: "blur(96px)",
            opacity: 0.2,
            animation: "pulse 4s ease-in-out infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            left: 80,
            width: 288,
            height: 288,
            background: "#c7d2fe",
            borderRadius: "50%",
            filter: "blur(96px)",
            opacity: 0.2,
            animation: "pulse 4s ease-in-out infinite 2s",
          }}
        />

        {/* Form Container */}
        <Box sx={{ position: "relative", width: "100%", maxWidth: 400, zIndex: 10 }}>
          {/* Main Form */}
          <Box
            sx={{
              background: "rgba(168, 193, 184, 0.95)",
              backdropFilter: "blur(8px)",
              borderRadius: "1rem",
              boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)",
              padding: 4,
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h2" sx={{ fontSize: "1.75rem", mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                Sign in to your account
              </Typography>
            </Box>

            {/* Error Message */}
            {errorMessage && (
              <Alert
                severity="error"
                icon={<AlertCircle size={20} />}
                sx={{
                  mb: 3,
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  border: "1px solid #fecaca",
                  borderRadius: "0.5rem",
                  animation: "slideIn 0.3s ease-out",
                  "& .MuiAlert-message": {
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  },
                }}
              >
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Email Field */}
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} />
                    </InputAdornment>
                  ),
                }}
                required
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        disabled={loading}
                        sx={{ color: "#64748b" }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                required
              />

              {/* Forgot Password Link */}
              <Box sx={{ textAlign: "right" }}>
                <Link
                  to="/forgot-password"
                  style={{
                    textDecoration: "none",
                    color: "#2563eb",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#2563eb", fontWeight: 500 }}>
                    Forgot Password?
                  </Typography>
                </Link>
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Box>

            {/* Divider */}
            <Divider sx={{ my: 3, backgroundColor: "#c0c0c0" }} />

           

            {/* Sign Up Link */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  style={{
                    textDecoration: "none",
                    color: "#2563eb",
                    fontWeight: 600,
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Footer text */}
          <Typography
            variant="caption"
            sx={{ display: "block", textAlign: "center", mt: 3, color: "#94a3b8" }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </Box>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ThemeProvider>
  );
}