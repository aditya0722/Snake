import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const dummyLogs = [
  {
    id: 1,
    date: "2026-02-26 22:42",
    user: "John Doe",
    role: "CHW",
    action: "STATUS_CHANGE",
    entity: "Snake Report",
    entityId: 23,
    ip: "192.168.1.2",
    oldData: { status: "Pending" },
    newData: { status: "Verified" },
  },
];

export default function AuditLogPage() {
  const [open, setOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleView = (row) => {
    setSelectedLog(row);
    setOpen(true);
  };

  const columns = [
    { field: "date", headerName: "Date & Time", flex: 1.2 },
    { field: "user", headerName: "User", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => {
        const color =
          params.value === "CREATE"
            ? "success"
            : params.value === "DELETE"
            ? "error"
            : params.value === "STATUS_CHANGE"
            ? "warning"
            : "info";
        return <Chip label={params.value} color={color} size="small" />;
      },
    },
    { field: "entity", headerName: "Entity", flex: 1 },
    { field: "entityId", headerName: "Entity ID", flex: 0.7 },
    { field: "ip", headerName: "IP Address", flex: 1 },
    {
      field: "view",
      headerName: "View",
      flex: 0.8,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleView(params.row)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Audit Logs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track all system activity and changes
          </Typography>
        </Box>
        <Button variant="contained">Export CSV</Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {["Total Today", "Status Changes", "Deleted Records", "New Records"].map(
          (title, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    {title}
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    12
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        )}
      </Grid>

      {/* Filter Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Action">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="CREATE">CREATE</MenuItem>
                <MenuItem value="UPDATE">UPDATE</MenuItem>
                <MenuItem value="DELETE">DELETE</MenuItem>
                <MenuItem value="STATUS_CHANGE">STATUS_CHANGE</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Entity ID" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={dummyLogs}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
          />
        </Box>
      </Card>

      {/* View Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <>
              <Typography mb={2}>
                <strong>User:</strong> {selectedLog.user} ({selectedLog.role})
              </Typography>
              <Typography mb={2}>
                <strong>Action:</strong> {selectedLog.action}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box p={2} bgcolor="#fdecea" borderRadius={2}>
                    <Typography fontWeight={600}>Old Data</Typography>
                    <pre>{JSON.stringify(selectedLog.oldData, null, 2)}</pre>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box p={2} bgcolor="#e8f5e9" borderRadius={2}>
                    <Typography fontWeight={600}>New Data</Typography>
                    <pre>{JSON.stringify(selectedLog.newData, null, 2)}</pre>
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}