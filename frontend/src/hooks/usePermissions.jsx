import { Dashboard, Report, LocalHospital, People, Pets, Person, Settings, Inventory, CheckCircle } from "@mui/icons-material";
import React from "react";
import { Box, Alert, Typography, CardContent } from "@mui/material";
import { useAuth } from "../context/authContext";

// 1. Define all permissions by role
// ────────────────────────────────────────────────────────────────────────────

export const ROLE_PERMISSIONS = {
  community_user: {
    label: "Community User",
    permissions: [
      "view_dashboard",
      "report_bite_case",
      "view_my_cases",
      "view_hospitals",
      "view_rescuers",
      "apply_as_rescuer",
      "view_first_aid",
      "view_snake_info",
      "report_snake",
      "edit_profile",
    ],
  },

  chw: {
    label: "Community Health Worker",
    permissions: [
      "view_dashboard",
      "view_notifications",
      "confirm_bite_case",
      "view_hospital_details",
      "view_asv_availability",
      "check_patient_status",
      "followup_patients",
      "edit_profile",
    ],
  },

  treatment_provider: {
    label: "Treatment Provider",
    permissions: [
      "view_dashboard",
      "view_notifications",
      "register_new_case",
      "view_active_cases",
      "update_treatment",
      "record_asv_given",
      "refer_to_hospital",
      "update_patient_outcome",
      "manage_asv_stock",
      "edit_profile",
    ],
  },

  logistics_manager: {
    label: "Logistics/Program Manager",
    permissions: [
      "view_dashboard",
      "view_all_cases",
      "view_statistics",
      "manage_asv_inventory",
      "manage_hospitals",
      "view_hospital_stock",
      "generate_reports",
      "analytics",
      "edit_profile",
    ],
  },

  admin: {
    label: "System Administrator",
    permissions: [
      "view_dashboard",
      "view_all_cases",
      "view_statistics",
      "manage_asv_inventory",
      "manage_hospitals",
      "view_hospital_details",
      "view_hospital_stock",
      "generate_reports",
      "analytics",
      "view_rescuers",
      "view_snake_info",
      "manage_users",
      "view_audit_logs",
      "edit_profile",
    ],
  },
};

/**
 * Normalizes role names to handle legacy aliases
 * @param {string} role 
 * @returns {string}
 */
export const normalizeRole = (role) => {
  if (role === "community") return "community_user";
  if (role === "programme_manager") return "logistics_manager";
  return role;
};

// 2. Utility functions for permission checking
// ────────────────────────────────────────────────────────────────────────────

/**
 * Check if user has specific permission
 * @param {string} userRole - User's role from auth
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (userRole, permission) => {
  const role = normalizeRole(userRole);

  // Admin has all permissions
  if (role === "admin") {
    return true;
  }

  // Check if role exists and has permissions
  if (!role || !ROLE_PERMISSIONS[role]) {
    return false;
  }

  // Check specific permission
  return ROLE_PERMISSIONS[role].permissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 * @param {string} userRole - User's role
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

/**
 * Check if user has all specified permissions
 * @param {string} userRole - User's role
 * @param {string[]} permissions - Array of permissions
 * @returns {boolean}
 */
export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// 3. React Hook for permission checking
// ────────────────────────────────────────────────────────────────────────────



/**
 * Custom hook to check permissions
 * Usage: const { canView, canEdit } = usePermissions();
 */
export const usePermissions = () => {
  const { user } = useAuth();

  const check = (permission) => {
    return hasPermission(user?.role, permission);
  };

  const checkAny = (permissions) => {
    return hasAnyPermission(user?.role, permissions);
  };

  const checkAll = (permissions) => {
    return hasAllPermissions(user?.role, permissions);
  };

  return {
    check,
    checkAny,
    checkAll,
    userRole: normalizeRole(user?.role),
    hasRole: (role) => normalizeRole(user?.role) === normalizeRole(role),
  };
};

// 4. Protected Component Wrapper
// ────────────────────────────────────────────────────────────────────────────



/**
 * Component that only renders if user has required permission
 * Usage: ProtectedComponent permission="view_dashboard"
 *          <YourComponent />
 *        </ProtectedComponent>
 */
export const ProtectedComponent = ({
  permission,
  permissions = null,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { check, checkAny, checkAll } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = check(permission);
  } else if (permissions) {
    hasAccess = requireAll ? checkAll(permissions) : checkAny(permissions);
  }

  if (!hasAccess) {
    return fallback || (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="body2">
          You don't have permission to access this feature.
        </Typography>
      </Alert>
    );
  }

  return <>{children}</>;
};

/**
 * Component that only renders if user has specific role
 * Usage: RoleProtected role="treatment_provider"
 *          <YourComponent />
 *        </RoleProtected>
 */
export const RoleProtected = ({
  role,
  roles = null,
  permission,
  permissions = null,
  requireAll = false,
  children,
  fallback = null,
}) => {
  const { hasRole, check, checkAny, checkAll } = usePermissions();

  let hasAccess = false;

  // 1. Check roles
  if (role) {
    hasAccess = hasRole(role);
  } else if (roles) {
    hasAccess = roles.some(r => hasRole(r));
  }

  // 2. Check permissions (if access not already granted by role)
  if (!hasAccess) {
    if (permission) {
      hasAccess = check(permission);
    } else if (permissions) {
      hasAccess = requireAll ? checkAll(permissions) : checkAny(permissions);
    }
  }

  if (!hasAccess) {
    return fallback || (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="body2">
          This feature is not available for your role or you lack required permissions.
        </Typography>
      </Alert>
    );
  }

  return <>{children}</>;
};

// 5. Usage Examples
// ────────────────────────────────────────────────────────────────────────────

/*
EXAMPLE 1: Using usePermissions hook in a component
─────────────────────────────────────────────────────

function MyComponent() {
  const { check, checkAny, userRole } = usePermissions();

  if (!check("view_dashboard")) {
    return <Alert severity="error">Access Denied</Alert>;
  }

  return (
    <Box>
      {check("report_bite_case") && (
        <Button>Report Case</Button>
      )}
      
      {checkAny(["manage_asv_stock", "update_treatment"]) && (
        <Button>Update Medical Info</Button>
      )}
      
      <Typography>Your role: {userRole}</Typography>
    </Box>
  );
}

EXAMPLE 2: Using ProtectedComponent wrapper
─────────────────────────────────────────────

<ProtectedComponent permission="manage_asv_stock">
  <ASVManagementPanel />
</ProtectedComponent>

EXAMPLE 3: Using RoleProtected wrapper
──────────────────────────────────────

<RoleProtected role="treatment_provider">
  <TreatmentProviderDashboard />
</RoleProtected>

<RoleProtected 
  roles={["chw", "treatment_provider"]}
  fallback={<Alert>Only CHW and Providers can access</Alert>}
>
  <CaseConfirmationForm />
</RoleProtected>

EXAMPLE 4: Conditional button visibility
─────────────────────────────────────────

function CaseCard({ caseData }) {
  const { check } = usePermissions();

  return (
    <Card>
      <CardContent>
        <Typography>{caseData.patient_name}</Typography>
        
        {check("confirm_bite_case") && (
          <Button color="primary">Confirm Case</Button>
        )}
        
        {check("register_new_case") && (
          <Button color="success">Register Patient</Button>
        )}
        
        {check("view_statistics") && (
          <Button color="secondary">View Analytics</Button>
        )}
      </CardContent>
    </Card>
  );
}

*/

// 6. Advanced: Permission-based Route Protection
// ────────────────────────────────────────────────────────────────────────────

/**
 * Route protection wrapper for React Router
 * Usage: <PermissionRoute permission="view_dashboard" component={Dashboard} />
 */
export const PermissionRoute = ({
  permission,
  component: Component,
  ...rest
}) => {
  const { check } = usePermissions();

  if (!check(permission)) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error">Access Denied</Alert>
      </Box>
    );
  }

  return <Component {...rest} />;
};

// 7. API Request Authorization
// ────────────────────────────────────────────────────────────────────────────

/**
 * Check if user can make specific API request based on their role
 * Add this to your api.js interceptor
 */
export const checkAPIPermission = (userRole, endpoint, method = "GET") => {
  const routePermissions = {
    "POST:/api/bite-cases/report": "report_bite_case",
    "POST:/api/bite-cases/confirm": "confirm_bite_case",
    "POST:/api/bite-cases/update-treatment": "update_treatment",
    "POST:/api/asv-stock/update": "manage_asv_stock",
    "POST:/api/rescuers/apply": "apply_as_rescuer",
    "GET:/api/statistics": "view_statistics",
    "GET:/api/hospitals": "view_hospital_details",
  };

  const key = `${method}:${endpoint}`;
  const requiredPermission = routePermissions[key];

  if (!requiredPermission) {
    return true; // If no specific permission defined, allow
  }

  return hasPermission(userRole, requiredPermission);
};

// 8. Complete integration in api.js
// ────────────────────────────────────────────────────────────────────────────

/*
// Add to your existing api.js file:

import { checkAPIPermission } from "./permissions";
import { useAuth } from "./context/authContext";

// In your request interceptor:
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (user) {
    // Check if user has permission for this API call
    const hasPermission = checkAPIPermission(
      user.role,
      config.url,
      config.method
    );

    if (!hasPermission) {
      return Promise.reject(
        new Error("You don't have permission to perform this action")
      );
    }

    config.headers.Authorization = `Bearer ${user.token}`;
  }
  
  return config;
});
*/

// 9. Navigation Menu based on Role
// ────────────────────────────────────────────────────────────────────────────

export const ROLE_BASED_MENUS = {
  community_user: [
    { label: "Dashboard", path: "/dashboard", icon: <Dashboard />, permission: "view_dashboard" },
    { label: "Report Bite Case", path: "/report-snake-bite", icon: <Report />, permission: "report_bite_case" },
    { label: "Report Snake", path: "/report-snake", icon: <Pets />, permission: "report_snake" },
    { label: "First Aid", path: "/first-aid", icon: <LocalHospital />, permission: "view_first_aid" },
    { label: "Find Hospital", path: "/hospitals", icon: <LocalHospital />, permission: "view_hospitals" },
    { label: "Rescuers", path: "/snake-rescuers", icon: <People />, permission: "view_rescuers" },
    { label: "Apply as Rescuer", path: "/rescuer-verification", icon: <CheckCircle />, permission: "apply_as_rescuer" }
  ],

  chw: [
    { label: "Dashboard", path: "/dashboard", icon: <Dashboard />, permission: "view_dashboard" },
    { label: "Cases", path: "/bite-cases", icon: <Report />, permission: "confirm_bite_case" },
    { label: "Hospitals", path: "/hospitals", icon: <LocalHospital />, permission: "view_hospital_details" },
    { label: "Rescuers", path: "/snake-rescuers", icon: <People />, permission: "view_rescuers" }
  ],

  treatment_provider: [
    { label: "Dashboard", path: "/dashboard", icon: <Dashboard />, permission: "view_dashboard" },
    { label: "Active Cases", path: "/bite-cases", icon: <Report />, permission: "view_active_cases" },
    { label: "Hospitals", path: "/hospitals", icon: <LocalHospital />, permission: "view_hospital_details" },
    { label: "ASV Stock", path: "/asv-stock", icon: <Inventory />, permission: "manage_asv_stock" },
    { label: "Rescuers", path: "/snake-rescuers", icon: <People />, permission: "view_rescuers" }
  ],

  logistics_manager: [
    { label: "Dashboard", path: "/dashboard", icon: <Dashboard />, permission: "view_dashboard" },
    { label: "Active Cases", path: "/bite-cases", icon: <Report />, permission: "view_all_cases" },
    { label: "ASV Inventory", path: "/asv-stock", icon: <Inventory />, permission: "manage_asv_inventory" },
    { label: "Users", path: "/users", icon: <Person />, permission: "view_dashboard" }
  ],

  admin: [
    { label: "Dashboard", path: "/dashboard", icon: <Dashboard />, permission: "view_dashboard" },
    { label: "Hospitals", path: "/hospitals", icon: <LocalHospital />, permission: "view_hospital_details" },
    { label: "ASV Stock", path: "/asv-stock", icon: <Inventory />, permission: "manage_asv_inventory" },
    { label: "Snake Rescuers", path: "/snake-rescuers", icon: <People />, permission: "view_rescuers" },
    { label: "Bite Cases", path: "/bite-cases", icon: <Report />, permission: "view_all_cases" },
    { label: "Snake Species", path: "/snakes", icon: <Pets />, permission: "view_snake_info" },
    { label: "Users", path: "/users", icon: <Person />, permission: "manage_users" },
    { label: "Audit Logs", path: "/audit-logs", icon: <Report />, permission: "view_audit_logs" }
  ]
};

// Aliases for roles
ROLE_BASED_MENUS.community = ROLE_BASED_MENUS.community_user;
ROLE_BASED_MENUS.programme_manager = ROLE_BASED_MENUS.logistics_manager;

/**
 * Get menu items visible for user's role
 * @param {string} userRole - User's role
 * @returns {Array} Filtered menu items
 */
export const getMenuForRole = (userRole) => {
  const role = normalizeRole(userRole);
  const menu = ROLE_BASED_MENUS[role] || [];

  return menu.filter(item => {
    return hasPermission(role, item.permission);
  });
};

// 10. Dynamic Navigation Component
// ────────────────────────────────────────────────────────────────────────────

export const RoleBasedNavigation = () => {
  const { user } = useAuth();
  const { check } = usePermissions();
  const menuItems = getMenuForRole(user?.role);

  return (
    <nav>
      {menuItems.map((item) => (
        <a key={item.path} href={item.path}>
          {item.label}
        </a>
      ))}
    </nav>
  );
};

// 11. Dashboard Selection based on Role
// ────────────────────────────────────────────────────────────────────────────

/**
 * Render appropriate dashboard based on user role
 * Usage: {renderDashboard(user.role, components)}
 */
export const renderDashboard = (userRole, components) => {
  const role = normalizeRole(userRole);
  const dashboards = {
    community_user: components.CommunityUserDashboard,
    chw: components.CHWDashboard,
    treatment_provider: components.TreatmentProviderDashboard,
    logistics_manager: components.LogisticsManagerDashboard,
    admin: components.LogisticsManagerDashboard,
  };

  const Dashboard = dashboards[role];

  if (!Dashboard) {
    return <Alert severity="error">Invalid role: {userRole}</Alert>;
  }

  return <Dashboard />;
};

// 12. Permission Matrix for Admin Reference
// ────────────────────────────────────────────────────────────────────────────

export const PERMISSION_MATRIX = {
  "Report Snake Bite": ["community_user"],
  "Confirm Bite Case": ["chw"],
  "Register Patient": ["treatment_provider"],
  "Update Treatment": ["treatment_provider"],
  "Manage ASV Stock": ["treatment_provider", "logistics_manager"],
  "View Statistics": ["logistics_manager"],
  "View All Cases": ["logistics_manager"],
  "Apply as Rescuer": ["community_user"],
  "Check Patient Status": ["chw", "treatment_provider"],
  "Follow-up Patients": ["chw"],
  "View Hospitals": ["community_user", "chw", "treatment_provider"],
};

// 13. Complete Example: Role-Aware Case Management Component
// ────────────────────────────────────────────────────────────────────────────

// import { usePermissions, ProtectedComponent } from "./permissions";
// import { useAuth } from "./authContext";
//
// function CaseManagement() {
//   const { user } = useAuth();
//   const { check, userRole } = usePermissions();
//
//   return (
//     <Box>
//       {/* Header shows user role */}
//       <Typography variant="h6">
//         Welcome, {user?.name} ({userRole})
//       </Typography>
//
//       {/* Community User: Can report cases */}
//       <ProtectedComponent permission="report_bite_case">
//         <Card sx={{ mb: 2 }}>
//           <CardContent>
//             <Typography variant="h6">Report a Snake Bite</Typography>
//             <ReportBiteForm />
//           </CardContent>
//         </Card>
//       </ProtectedComponent>
//
//       {/* CHW: Can confirm cases */}
//       <ProtectedComponent permission="confirm_bite_case">
//         <Card sx={{ mb: 2 }}>
//           <CardContent>
//             <Typography variant="h6">Cases to Confirm</Typography>
//             <CasesListForConfirmation />
//           </CardContent>
//         </Card>
//       </ProtectedComponent>
//
//       {/* Treatment Provider: Can register and manage cases */}
//       <ProtectedComponent
//         permissions={["register_new_case", "manage_asv_stock"]}
//         requireAll={false}
//       >
//         <Card sx={{ mb: 2 }}>
//           <CardContent>
//             <Typography variant="h6">Case Management</Typography>
//
//             {check("register_new_case") && (
//               <Button>Register New Patient</Button>
//             )}
//
//             {check("manage_asv_stock") && (
//               <Button>Update ASV Stock</Button>
//             )}
//           </CardContent>
//         </Card>
//       </ProtectedComponent>
//
//       {/* Logistics Manager: Full visibility */}
//       <ProtectedComponent permission="view_statistics">
//         <Card sx={{ mb: 2 }}>
//           <CardContent>
//             <Typography variant="h6">System Analytics</Typography>
//             <AnalyticsDashboard />
//           </CardContent>
//         </Card>
//       </ProtectedComponent>
//     </Box>
//   );
// }
//
// export default CaseManagement;


// 14. Session & Permission Validation
// ────────────────────────────────────────────────────────────────────────────

/**
 * Validate user session and permissions
 * Call this on app startup to ensure user still has access
 */
export const validateUserSession = async (user, requiredPermission = null) => {
  if (!user) {
    return false;
  }

  // Check if user role is valid
  if (!ROLE_PERMISSIONS[user.role]) {
    return false;
  }

  // Check specific permission if provided
  if (requiredPermission) {
    return hasPermission(user.role, requiredPermission);
  }

  return true;
};

// 15. Quick Permission Check Utility
// ────────────────────────────────────────────────────────────────────────────

/**
 * Get all permissions for a role
 * @param {string} userRole
 * @returns {string[]}
 */
export const getPermissionsForRole = (userRole) => {
  return ROLE_PERMISSIONS[userRole]?.permissions || [];
};

/**
 * Get role label
 * @param {string} userRole
 * @returns {string}
 */
export const getRoleLabel = (userRole) => {
  return ROLE_PERMISSIONS[userRole]?.label || "Unknown Role";
};

/**
 * Check if role exists
 * @param {string} userRole
 * @returns {boolean}
 */
export const isValidRole = (userRole) => {
  return !!ROLE_PERMISSIONS[userRole];
};