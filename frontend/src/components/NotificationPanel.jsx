import { useState } from 'react';
import {
  Box, Paper, Typography, Badge, IconButton, Popover, List, ListItem,
  ListItemButton, Chip, Button, Divider, Alert, Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close, Check, Delete, DoneAll,
  Report, Inventory, People, Info as InfoIcon, LocalHospital,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
  snake_report: Report,
  asv_stock: Inventory,
  rescuer_application: People,
  system: InfoIcon,
  hospital_update: LocalHospital,
};

const notificationColors = {
  snake_report: '#ef4444',
  asv_stock: '#f59e0b',
  rescuer_application: '#10b981',
  system: '#3b82f6',
  hospital_update: '#8b5cf6',
};

const NotificationIcon = ({ type }) => {
  const Icon = notificationIcons[type] || InfoIcon;
  const color = notificationColors[type] || '#6b7280';

  return (
    <Box sx={{
      width: 40,
      height: 40,
      borderRadius: '10px',
      bgcolor: color + '15',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon sx={{ color, fontSize: 20 }} />
    </Box>
  );
};

export default function NotificationPanel({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDelete 
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (e, notification) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e, notificationId) => {
    e.stopPropagation();
    onDelete(notificationId);
  };

  // Get notification type from title or message
  const getNotificationType = (notification) => {
    const title = notification.title.toLowerCase();
    if (title.includes('snake')) return 'snake_report';
    if (title.includes('asv') || title.includes('stock')) return 'asv_stock';
    if (title.includes('rescuer')) return 'rescuer_application';
    if (title.includes('hospital')) return 'hospital_update';
    return 'system';
  };

  return (
    <>
      {/* Notification Bell Button */}
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleOpen}
          sx={{
            color: '#fff',
            mr: 2,
            position: 'relative',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: '#ef4444',
                color: '#fff',
                fontWeight: 800,
                boxShadow: '0 0 0 2px #047857',
                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': {
                    boxShadow: '0 0 0 2px #047857',
                  },
                  '50%': {
                    boxShadow: '0 0 0 6px rgba(16, 185, 129, 0.3)',
                  },
                },
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Notification Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            mt: 1.5,
          },
        }}
      >
        {/* Header */}
        <Box sx={{
          background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
          color: 'white',
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              🔔 Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {unreadCount} unread
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </Box>

        <Divider />

        {/* Notifications List - NO LOADING STATE */}
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 1 }} />
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 450, overflow: 'auto', p: 0 }}>
            {notifications.map((notification, index) => {
              const type = getNotificationType(notification);
              const isUnread = !notification.is_read;

              return (
                <Box key={notification.id}>
                  <ListItem
                    disablePadding
                    sx={{
                      bgcolor: isUnread ? 'rgba(16, 185, 129, 0.05)' : 'white',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isUnread ? 'rgba(16, 185, 129, 0.1)' : '#f9fafb',
                      },
                      borderLeft: isUnread ? '4px solid #10b981' : '4px solid transparent',
                    }}
                  >
                    <ListItemButton
                      sx={{
                        p: 2,
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'flex-start',
                      }}
                    >
                      <NotificationIcon type={type} />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isUnread ? 800 : 700,
                              color: '#1a1f36',
                              flex: 1,
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {isUnread && (
                            <Box sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: '#10b981',
                              flexShrink: 0,
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.5 },
                              },
                            }} />
                          )}
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{
                            color: '#6b7280',
                            display: 'block',
                            mb: 0.75,
                            lineHeight: 1.4,
                          }}
                        >
                          {notification.message}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#9ca3af',
                              fontSize: '0.75rem',
                            }}
                          >
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </Typography>
                          <Chip
                            label={type.replace(/_/g, ' ').toUpperCase()}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              bgcolor: notificationColors[type] + '20',
                              color: notificationColors[type],
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
                        {isUnread && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMarkAsRead(e, notification)}
                              sx={{
                                color: '#10b981',
                                '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' },
                              }}
                            >
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDelete(e, notification.id)}
                            sx={{
                              color: '#ef4444',
                              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' },
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider sx={{ my: 0 }} />}
                </Box>
              );
            })}
          </List>
        )}

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<DoneAll />}
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#10b981',
                    color: '#10b981',
                    bgcolor: 'rgba(16, 185, 129, 0.05)',
                  },
                }}
              >
                Mark All Read
              </Button>
            </Box>
          </>
        )}
      </Popover>
    </>
  );
}