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

const drawerWidth = 260;

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { text: "Hospitals", icon: <LocalHospital />, path: "/hospitals" },
  { text: "ASV Stock", icon: <Inventory />, path: "/asv-stock" },
  { text: "Snake Rescuers", icon: <People />, path: "/snake-rescuers" },
  { text: "Snake Species", icon: <Pets />, path: "/snakes" },
  { text: "Users", icon: <Person />, path: "/users" },
  { text: "Audit Logs", icon: <Report />, path: "/audit-logs" },
  { text: "Rescuer Verification", icon: <CheckCircle />, path: "/rescuer-verification" },
];

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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
        background: "linear-gradient(135deg, #047857 0%, #10b981 100%)",
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
                "&.Mui-selected": {
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  borderRight: "3px solid #10b981",
                  color: "#10b981",
                  fontWeight: 700,
                },
                "&:hover": {
                  backgroundColor: "rgba(16, 185, 129, 0.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <ListItemIcon sx={{
                color: location.pathname === item.path ? "#10b981" : "#6b7280",
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
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
          background: "linear-gradient(135deg, #047857 0%, #10b981 100%)",
          borderRadius: "0",
          boxShadow: "0 4px 20px rgba(16, 185, 129, 0.2)",
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
            {menuItems.find((item) => item.path === location.pathname)?.text || "Dashboard"}
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
              bgcolor: "#d1fae5",
              color: "#047857",
              fontWeight: 800,
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
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
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                navigate("/profile");
                handleProfileMenuClose();
              }}
              sx={{
                color: "#1a1f36",
                fontWeight: 600,
                "&:hover": { bgcolor: "rgba(16, 185, 129, 0.1)" },
              }}
            >
              <Person fontSize="small" sx={{ mr: 1, color: "#10b981" }} />
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate("/settings");
                handleProfileMenuClose();
              }}
              sx={{
                color: "#1a1f36",
                fontWeight: 600,
                "&:hover": { bgcolor: "rgba(16, 185, 129, 0.1)" },
              }}
            >
              <Settings fontSize="small" sx={{ mr: 1, color: "#10b981" }} />
              Settings
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: "#ef4444",
                fontWeight: 600,
                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" },
              }}
            >
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Logout
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
            "& .MuiDrawer-paper": { width: drawerWidth },
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
              borderRight: "1px solid rgba(16, 185, 129, 0.1)",
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
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}