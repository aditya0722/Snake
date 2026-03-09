import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import {
  Box, Paper, Typography, Button, TextField, Grid, Avatar, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Snackbar, CircularProgress,
  Chip, Divider, IconButton, InputAdornment,
} from '@mui/material';
import {
  Edit, Save, Cancel, LocationOn, Phone, Email, Person,
  CheckCircle, PendingActions, LocationOff, ArrowRight,
} from '@mui/icons-material';
import api from '../api/axios';
import { usePermissions, normalizeRole } from '../hooks/usePermissions';


const UserProfilePage = () => {
  const { user } = useAuth();
  const { hasRole } = usePermissions();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [rescuerStatus, setRescuerStatus] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });

  const showSnack = (message, severity = 'success') => {
    setSnack({ open: true, message, severity });
  };

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const mockProfile = {
          id: user?.id || 1,
          name: user?.name || 'John Doe',
          email: user?.email || 'john@example.com',
          phone_number: '0712345678',
          role: user?.role || 'community_user',
          address: '123 Main Street',
          district: 'Colombo',
          latitude: null,
          longitude: null,
        };
        setProfile(mockProfile);
        setEditData(mockProfile);
        checkRescuerStatus();
      } catch (err) {
        showSnack('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const checkRescuerStatus = async () => {
    try {
      console.log("Checking rescuer status for user:", user?.id);

      const response = await api.get(
        "/rescuers/rescuers.php?action=getStatus",
        {
          params: {
            user_id: user?.id
          }
        }
      );

      console.log(response.data.data);

      const mockStatus = {
        is_rescuer: response.data.success && response.data.data ? true : false,
        is_verified: response.data.data?.is_verified || false,
        district: response.data.data?.district || 'Colombo',
        latitude: response.data.data?.latitude || null,
        longitude: response.data.data?.longitude || null,
      };
      setRescuerStatus(mockStatus);
    } catch (err) {
      console.error('Failed to check rescuer status:', err);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setProfile(editData);
      setEditMode(false);
      showSnack('Profile updated successfully', 'success');
    } catch (err) {
      showSnack('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = async () => {
    return new Promise((resolve, reject) => {
      setLocationLoading(true);
      if (!navigator.geolocation) {
        showSnack('Geolocation is not supported by your browser', 'error');
        setLocationLoading(false);
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setEditData(prev => ({
            ...prev,
            latitude: parseFloat(latitude.toFixed(6)),
            longitude: parseFloat(longitude.toFixed(6)),
          }));
          setLocationLoading(false);
          showSnack('Location captured successfully', 'success');
          resolve({ latitude, longitude });
        },
        error => {
          setLocationLoading(false);
          showSnack(`Error getting location: ${error.message}`, 'error');
          reject(error);
        }
      );
    });
  };

  const handleApplyRescuer = () => {
    if (!profile.district) {
      showSnack('Please set your district first', 'error');
      return;
    }
    setConfirmDialog({
      open: true,
      action: 'rescuer',
      title: 'Apply as Snake Rescuer',
      message: 'We need to access your location to register you as a snake rescuer. This information will help us connect you with snake bite incidents in your area. Do you agree?',
    });
  };

  const handleConfirmRescuer = async () => {
    try {
      setLocationLoading(true);
      const position = await handleGetLocation();

      const response = await api.post('/rescuers/rescuers.php?action=apply', {
        user_id: profile.id,
        district: editData.district,
        latitude: position.latitude,
        longitude: position.longitude,
      });

      if (response.data?.success) {
        setRescuerStatus({
          is_rescuer: true,
          is_verified: false,
          district: editData.district,
          latitude: position.latitude,
          longitude: position.longitude,
        });
        showSnack('Application submitted! Waiting for admin approval.', 'success');
        setConfirmDialog({ open: false, action: null });
      }
    } catch (err) {
      showSnack(err.response?.data?.message || 'Failed to apply as rescuer', 'error');
    } finally {
      setLocationLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const getRoleColor = (userRole) => {
    const role = normalizeRole(userRole);
    const colors = {
      admin: '#059669',
      community_user: '#10b981',
      chw: '#34d399',
      treatment_provider: '#6ee7b7',
      logistics_manager: '#a7f3d0',
    };
    return colors[role] || '#10b981';
  };

  const getRoleBgColor = (userRole) => {
    const role = normalizeRole(userRole);
    const colors = {
      admin: '#064e3b',
      community_user: '#047857',
      chw: '#065f46',
      treatment_provider: '#065f46',
      logistics_manager: '#065f46',
    };
    return colors[role] || '#047857';
  };

  if (loading && !profile) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
      }}>
        <CircularProgress sx={{ color: '#10b981' }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load profile</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
      p: { xs: 2, md: 4 },
    }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        {/* Hero Header Card */}
        <Card sx={{
          background: `linear-gradient(135deg, ${getRoleBgColor(profile.role)} 0%, #10b981 100%)`,
          color: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(16, 185, 129, 0.2)',
          mb: 4,
          overflow: 'hidden',
        }}>
          <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', position: 'relative' }}>
            {/* Decorative background elements */}
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)',
              opacity: 0.5,
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.05)',
              opacity: 0.5,
            }} />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  fontSize: '3rem',
                  mx: 'auto',
                  mb: 2.5,
                  backdropFilter: 'blur(10px)',
                  border: '4px solid rgba(255,255,255,0.5)',
                }}
              >
                {profile.name?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1px' }}>
                {profile.name}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  label={normalizeRole(profile.role).replace(/_/g, ' ').toUpperCase()}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    fontWeight: 700,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                />
                {rescuerStatus?.is_rescuer && (
                  <Chip
                    icon={rescuerStatus?.is_verified ? <CheckCircle /> : <PendingActions />}
                    label={rescuerStatus?.is_verified ? 'Verified Rescuer' : 'Pending Verification'}
                    sx={{
                      bgcolor: rescuerStatus?.is_verified ? 'rgba(34, 197, 94, 0.3)' : 'rgba(251, 146, 60, 0.3)',
                      color: 'white',
                      fontWeight: 700,
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  />
                )}
              </Box>

              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                {profile.email} • {profile.phone_number}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Profile Information Card */}
          <Grid item xs={12} md={7}>
            <Paper sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              overflow: 'hidden',
              border: '1px solid rgba(16, 185, 129, 0.1)',
            }}>
              {/* Card Header */}
              <Box sx={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                p: 3,
                borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#047857' }}>
                  Personal Information
                </Typography>
                {!editMode ? (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                    sx={{
                      bgcolor: '#1a1f36',
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 700,
                      borderRadius: '10px',
                      boxShadow: '0 4px 12px rgba(26, 31, 54, 0.3)',
                      '&:hover': {
                        bgcolor: '#0f1425',
                        boxShadow: '0 6px 16px rgba(26, 31, 54, 0.4)',
                      },
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : null}
              </Box>

              {/* Card Content */}
              <Box sx={{ p: 3 }}>
                {editMode ? (
                  <Box>
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={editData.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          variant="outlined"
                          size="small"
                          disabled={loading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              '&:hover fieldset': { borderColor: '#10b981' },
                              '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: 2 },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => handleEditChange('email', e.target.value)}
                          variant="outlined"
                          size="small"
                          disabled={loading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              '&:hover fieldset': { borderColor: '#10b981' },
                              '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: 2 },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={editData.phone_number}
                          onChange={(e) => handleEditChange('phone_number', e.target.value)}
                          variant="outlined"
                          size="small"
                          disabled={loading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              '&:hover fieldset': { borderColor: '#10b981' },
                              '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: 2 },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="District"
                          value={editData.district}
                          onChange={(e) => handleEditChange('district', e.target.value)}
                          variant="outlined"
                          size="small"
                          disabled={loading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              '&:hover fieldset': { borderColor: '#10b981' },
                              '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: 2 },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Address"
                          value={editData.address}
                          onChange={(e) => handleEditChange('address', e.target.value)}
                          variant="outlined"
                          size="small"
                          multiline
                          rows={2}
                          disabled={loading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              '&:hover fieldset': { borderColor: '#10b981' },
                              '&.Mui-focused fieldset': { borderColor: '#10b981', borderWidth: 2 },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#10b981' },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Latitude"
                          type="number"
                          value={editData.latitude || ''}
                          onChange={(e) => handleEditChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                          variant="outlined"
                          size="small"
                          disabled
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {editData.latitude && <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />}
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Longitude"
                          type="number"
                          value={editData.longitude || ''}
                          onChange={(e) => handleEditChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                          variant="outlined"
                          size="small"
                          disabled
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {editData.longitude && <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />}
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: '10px' },
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                        sx={{
                          bgcolor: '#1a1f36',
                          color: 'white',
                          fontWeight: 700,
                          borderRadius: '10px',
                          px: 3,
                          '&:hover': { bgcolor: '#0f1425' },
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => {
                          setEditMode(false);
                          setEditData(profile);
                        }}
                        disabled={loading}
                        sx={{
                          borderColor: '#d1d5db',
                          color: '#6b7280',
                          fontWeight: 700,
                          borderRadius: '10px',
                          px: 3,
                          '&:hover': { borderColor: '#10b981', color: '#10b981' },
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        bgcolor: '#f0fdf4',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}>
                        <Box sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          bgcolor: '#d1fae5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Person sx={{ color: '#10b981', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700 }}>FULL NAME</Typography>
                          <Typography sx={{ color: '#047857', fontWeight: 700 }}>{profile.name}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        bgcolor: '#f0fdf4',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}>
                        <Box sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          bgcolor: '#d1fae5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Email sx={{ color: '#10b981', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700 }}>EMAIL</Typography>
                          <Typography sx={{ color: '#047857', fontWeight: 700, fontSize: '0.95rem' }}>{profile.email}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        bgcolor: '#f0fdf4',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}>
                        <Box sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          bgcolor: '#d1fae5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Phone sx={{ color: '#10b981', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700 }}>PHONE</Typography>
                          <Typography sx={{ color: '#047857', fontWeight: 700 }}>{profile.phone_number}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{
                        p: 2.5,
                        borderRadius: '12px',
                        bgcolor: '#f0fdf4',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}>
                        <Box sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '10px',
                          bgcolor: '#d1fae5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <LocationOn sx={{ color: '#10b981', fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 700 }}>DISTRICT</Typography>
                          <Typography sx={{ color: '#047857', fontWeight: 700 }}>{profile.district}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Paper>
          </Grid>
          {hasRole('community_user') && (
            <>
              {/* Rescuer Status Card */}
              <Grid item xs={12} md={5}>
                <Card sx={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  border: rescuerStatus?.is_rescuer
                    ? '2px solid #10b981'
                    : '2px solid rgba(16, 185, 129, 0.2)',
                  overflow: 'hidden',
                }}>
                  {/* Card Header */}
                  <Box sx={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                    p: 2.5,
                    borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#047857' }}>
                      🚑 Rescuer Status
                    </Typography>
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    {rescuerStatus?.is_rescuer ? (
                      <Box>
                        {/* Verified/Pending Status */}
                        <Box sx={{
                          p: 2.5,
                          borderRadius: '12px',
                          bgcolor: rescuerStatus?.is_verified ? '#f0fdf4' : '#fffbeb',
                          border: rescuerStatus?.is_verified
                            ? '1px solid rgba(16, 185, 129, 0.3)'
                            : '1px solid rgba(251, 146, 60, 0.3)',
                          mb: 2.5,
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            {rescuerStatus?.is_verified
                              ? <CheckCircle sx={{ color: '#10b981', fontSize: 24 }} />
                              : <PendingActions sx={{ color: '#f59e0b', fontSize: 24 }} />
                            }
                            <Typography sx={{
                              fontWeight: 800,
                              color: rescuerStatus?.is_verified ? '#047857' : '#b45309',
                              fontSize: '0.95rem',
                            }}>
                              {rescuerStatus?.is_verified ? 'Verified Rescuer' : 'Pending Verification'}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                            {rescuerStatus?.is_verified
                              ? '✓ You are an active rescuer and will receive snake incident alerts in your area.'
                              : '⏳ Your application is under review. An admin will verify your details soon.'}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        {/* Not a rescuer - Call to action */}
                        <Box sx={{
                          p: 2.5,
                          borderRadius: '12px',
                          bgcolor: '#f0fdf4',
                          border: '2px dashed rgba(16, 185, 129, 0.3)',
                          mb: 2.5,
                        }}>
                          <Typography variant="body2" sx={{
                            color: '#6b7280',
                            lineHeight: 1.8,
                            mb: 2,
                          }}>
                            🐍 Join our snake rescue network and help save lives in your community.
                          </Typography>
                          <Typography variant="caption" sx={{
                            color: '#10b981',
                            fontWeight: 700,
                            display: 'block',
                          }}>
                            Benefits:
                          </Typography>
                          <Typography variant="caption" sx={{
                            color: '#6b7280',
                            display: 'block',
                            mt: 0.5,
                          }}>
                            • Real-time incident alerts<br />
                            • Connect with your community<br />
                            • Make a difference
                          </Typography>
                        </Box>

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<LocationOn />}
                          endIcon={<ArrowRight />}
                          onClick={handleApplyRescuer}
                          disabled={!profile.district || loading}
                          sx={{
                            background: '#1a1f36',
                            color: 'white',
                            fontWeight: 800,
                            py: 1.5,
                            borderRadius: '12px',
                            boxShadow: '0 6px 20px rgba(26, 31, 54, 0.3)',
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': {
                              background: '#0f1425',
                              boxShadow: '0 8px 25px rgba(26, 31, 54, 0.4)',
                              transform: 'translateY(-2px)',
                            },
                            '&.Mui-disabled': {
                              opacity: 0.6,
                              background: '#d1d5db',
                            },
                          }}
                        >
                          Apply as Rescuer
                        </Button>

                        {!profile.district && (
                          <Alert severity="info" sx={{ mt: 2, borderRadius: '10px' }}>
                            Please set your district in the profile to apply
                          </Alert>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, action: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.1)',
          fontWeight: 800,
          color: '#047857',
          py: 2.5,
        }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>
            Location access required for accurate service matching
          </Alert>
          <Typography sx={{ color: '#6b7280', mb: 2, lineHeight: 1.8, fontSize: '0.95rem' }}>
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button
            onClick={() => setConfirmDialog({ open: false, action: null })}
            disabled={locationLoading}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
            }}
          >
            Decline
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmRescuer}
            disabled={locationLoading}
            sx={{
              background: '#1a1f36',
              color: 'white',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(26, 31, 54, 0.3)',
              '&:hover': { background: '#0f1425' },
            }}
          >
            {locationLoading ? <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} /> : null}
            Accept & Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{
            borderRadius: '10px',
            fontWeight: 700,
            background: snack.severity === 'success'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : undefined,
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfilePage;