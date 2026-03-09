import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import useNotifications from "../hooks/useNotifications";
import NotificationPanel from "../components/NotificationPanel";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Report,
  LocalHospital,
  People,
  Pets,
  Person,
  Logout,
  Settings,
  Inventory,
  CheckCircle,

} from "@mui/icons-material";

import { getMenuForRole } from "../hooks/usePermissions";

const drawerWidth = 280;

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const menuItems = getMenuForRole(user?.role);

  // Silent real-time notifications hook
  // No loading state, no spinners - just background polling
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(
    user?.id,
    30000, // Light poll: check unread count every 30 seconds
    60000  // Heavy poll: fetch full notifications every 60 seconds
  );

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawer = (
    <Box>
      <Toolbar sx={{
        background: "linear-gradient(135deg, #1a1f36 0%, #2e3a59 100%)",
        color: "white",
        minHeight: 70,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
          🐍 SnakeBite Manager
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                mx: 1,
                borderRadius: "10px",
                mb: 0.5,
                "&.Mui-selected": {
                  backgroundColor: "#1a1f36",
                  color: "white",
                  "& .MuiListItemIcon-root": { color: "white" },
                  "& .MuiTypography-root": { fontWeight: 700 },
                  boxShadow: "0 4px 12px rgba(26, 31, 54, 0.3)",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#2e3a59",
                },
                "&:hover": {
                  backgroundColor: "rgba(26, 31, 54, 0.08)",
                },
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <ListItemIcon sx={{
                color: location.pathname === item.path ? "#1a1f36" : "#6b7280",
              }}>
                <Box sx={{ display: 'flex' }}>
                  {item.icon}
                </Box>
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: "linear-gradient(135deg, #1a1f36 0%, #2e3a59 100%)",
          borderRadius: "0",
          boxShadow: "0 4px 20px rgba(26, 31, 54, 0.2)",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" }, color: "#fff" }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{ flexGrow: 1, color: "#fff", fontWeight: 800 }}
          >
            {menuItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
          </Typography>

          {/* 
            SILENT Real-time Notification Panel 
            - No loading spinner
            - No visible refresh animation
            - Background polling only
            - Updates appear smoothly without interruption
          */}
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
          />

          {/* Profile Menu */}
          <IconButton onClick={handleProfileMenuOpen}>
            <Avatar sx={{
              bgcolor: "rgba(26, 31, 54, 0.1)",
              color: "#1a1f36",
              fontWeight: 800,
              boxShadow: "0 2px 8px rgba(26, 31, 54, 0.1)",
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                borderRadius: "14px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                mt: 1.5,
                border: "1px solid rgba(26, 31, 54, 0.08)",
                minWidth: 200,
                "& .MuiList-root": { p: 1 },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                navigate("/profile");
                handleProfileMenuClose();
              }}
              sx={{
                borderRadius: "8px",
                py: 1,
                "&:hover": { bgcolor: "rgba(26, 31, 54, 0.04)" },
              }}
            >
              <ListItemIcon>
                <Person fontSize="small" sx={{ color: "#1a1f36" }} />
              </ListItemIcon>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1f36" }}>Profile</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate("/settings");
                handleProfileMenuClose();
              }}
              sx={{
                borderRadius: "8px",
                py: 1,
                "&:hover": { bgcolor: "rgba(26, 31, 54, 0.04)" },
              }}
            >
              <ListItemIcon>
                <Settings fontSize="small" sx={{ color: "#1a1f36" }} />
              </ListItemIcon>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1f36" }}>Settings</Typography>
            </MenuItem>
            <Divider sx={{ my: 1, opacity: 0.6 }} />
            <MenuItem
              onClick={handleLogout}
              sx={{
                borderRadius: "8px",
                py: 1,
                color: "#ef4444",
                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" },
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: "#ef4444" }} />
              </ListItemIcon>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Box component="nav" sx={{ width: { md: drawerWidth } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              borderRadius: 0,
              border: "none",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              borderRadius: 0,
              border: "none",
              boxShadow: "4px 0 10px rgba(0,0,0,0.02)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          background: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}