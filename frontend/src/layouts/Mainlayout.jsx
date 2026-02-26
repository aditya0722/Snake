import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
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
  Badge,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  Dangerous,
  Report,
  LocalHospital,
  People,
  Pets,
  Person,
  Notifications,
  Logout,
  Settings,
  Inventory,
} from "@mui/icons-material";

const drawerWidth = 260;

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { text: "Snake Reports", icon: <Report />, path: "/snake-reports" },
  { text: "Hospitals", icon: <LocalHospital />, path: "/hospitals" },
  { text: "ASV Stock", icon: <Inventory />, path: "/asv-stock" },
  { text: "Snake Rescuers", icon: <People />, path: "/snake-rescuers" },
  { text: "Snake Species", icon: <Pets />, path: "/snakes" },
  { text: "Users", icon: <Person />, path: "/users" },
  { text: "Audit Logs", icon: <Report />, path: "/audit-logs" },
];

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // 🔔 Dummy Notifications (Replace later with API)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Snake Report",
      message: "A new snake report was submitted.",
      is_read: false,
      related_entity_type: "snake_report",
      related_entity_id: 23,
      created_at: "10 min ago",
    },
    {
      id: 2,
      title: "ASV Stock Updated",
      message: "ASV stock updated at District Hospital.",
      is_read: true,
      related_entity_type: "asv_stock",
      related_entity_id: 5,
      created_at: "1 hour ago",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleProfileMenuOpen = (event) =>
    setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleNotificationOpen = (event) =>
    setNotificationAnchor(event.currentTarget);
  const handleNotificationClose = () =>
    setNotificationAnchor(null);

  const handleNotificationClick = (notification) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, is_read: true } : n
      )
    );

    if (notification.related_entity_type === "snake_report") {
      navigate("/snake-reports");
    } else if (notification.related_entity_type === "asv_stock") {
      navigate("/asv-stock");
    }

    handleNotificationClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const drawer = (
    <Box>
      <Toolbar sx={{ backgroundColor: "#456766", color: "white" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          SnakeBite Manager
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
                  backgroundColor: "rgba(37, 40, 51, 0.1)",
                  borderRight: "3px solid #030511",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
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
          backgroundColor: "#456766",
          borderRadius: "0",
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
            sx={{ flexGrow: 1, color: "#fff", fontWeight: 700 }}
          >
            {menuItems.find((item) => item.path === location.pathname)
              ?.text || "Dashboard"}
          </Typography>

          {/* 🔔 Notifications */}
          <IconButton
            onClick={handleNotificationOpen}
            sx={{ color: "#fff", mr: 2 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* 👤 Avatar */}
          <IconButton onClick={handleProfileMenuOpen}>
            <Avatar sx={{ bgcolor: "#afea66", color: "#333" }}>
              {user?.name?.charAt(0) || "U"}
            </Avatar>
          </IconButton>

          {/* PROFILE MENU */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => navigate("/profile")}>
              <Person fontSize="small" sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={() => navigate("/settings")}>
              <Settings fontSize="small" sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>

          {/* NOTIFICATION MENU */}
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            PaperProps={{ sx: { width: 320, maxHeight: 400 } }}
          >
            {notifications.length === 0 ? (
              <MenuItem>No notifications</MenuItem>
            ) : (
              notifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() =>
                    handleNotificationClick(notification)
                  }
                  sx={{
                    backgroundColor: notification.is_read
                      ? "#fff"
                      : "#f0f7ff",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {notification.created_at}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
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
            "& .MuiDrawer-paper": { width: drawerWidth },
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
          backgroundColor: "#f7f9fc",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}