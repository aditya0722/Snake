import { useState } from "react";
import NearbyHospitalsDialog from "../components/map/NearbyHospitalsDialog";

import {
  Box, Typography, Grid, Card, CardContent,
  Button, Dialog, DialogContent, DialogActions,
  TextField, IconButton, Snackbar, Alert
} from "@mui/material";

import { Add, Edit, Delete, Map as MapIcon } from "@mui/icons-material";

const emptyForm = {
  name: "",
  district: "",
  address: "",
  contact_number: "",
  lat: "",
  lng: ""
};

export default function Hospitals() {

  const [hospitals, setHospitals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const showSnack = (message, severity = "success") => {
    setSnack({ open: true, message, severity });
  };

  const handleAddHospital = (hospital) => {
    const exists = hospitals.find(h => h.id === hospital.id);
    if (exists) {
      showSnack("Hospital already exists", "warning");
      return;
    }

    setHospitals(prev => [...prev, { ...hospital, asv_stock: 0 }]);
    showSnack("Hospital added from map");
  };

  const saveHospital = () => {
    setHospitals(prev => [
      ...prev,
      { id: Date.now(), ...form, asv_stock: 0 }
    ]);
    setOpenDialog(false);
    showSnack("Hospital added");
  };

  const deleteHospital = (id) => {
    setHospitals(prev => prev.filter(h => h.id !== id));
    showSnack("Hospital removed", "info");
  };

  return (
    <Box sx={{ p: 4 }}>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          Hospitals
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" startIcon={<MapIcon />} onClick={() => setMapOpen(true)}>
            Open Map
          </Button>

          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
            Add Manually
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {hospitals.map(h => (
          <Grid key={h.id} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>

                <Typography fontWeight={700}>{h.name}</Typography>
                <Typography variant="body2">{h.address}</Typography>
                <Typography variant="body2">{h.contact_number}</Typography>

                <Button
                  fullWidth
                  sx={{ mt: 2 }}
                  variant="contained"
                  onClick={() => {
                    setSelectedHospital(h);
                    setMapOpen(true);
                  }}
                >
                  Show Directions
                </Button>

                <Button
                  fullWidth
                  sx={{ mt: 1 }}
                  color="error"
                  onClick={() => deleteHospital(h.id)}
                >
                  Delete
                </Button>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextField label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          <TextField label="Phone" value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} />
          <TextField label="Latitude" value={form.lat} onChange={e => setForm({ ...form, lat: e.target.value })} />
          <TextField label="Longitude" value={form.lng} onChange={e => setForm({ ...form, lng: e.target.value })} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveHospital}>Save</Button>
        </DialogActions>
      </Dialog>

      <NearbyHospitalsDialog
        open={mapOpen}
        onClose={() => {
          setMapOpen(false);
          setSelectedHospital(null);
        }}
        savedHospitals={hospitals}
        selectedHospital={selectedHospital}
        onAddHospital={handleAddHospital}
      />

      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}