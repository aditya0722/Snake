import { Alert, Typography } from "@mui/material";
  import { usePermissions } from "../hooks/usePermissions";

  export const ProtectedFeature = ({ permission, children, fallback }) => {
    const { check } = usePermissions();
    
    if (!check(permission)) {
      return fallback || (
        <Alert severity="warning">
          <Typography variant="body2">
            You don't have permission to access this feature.
          </Typography>
        </Alert>
      );
    }
    
    return <>{children}</>;
  };