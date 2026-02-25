import { useState } from "react";
import { Dialog, Box, Button } from "@mui/material";
import { MyLocation } from "@mui/icons-material";
import HospitalMap from "./HospitalMap";

export default function NearbyHospitalsDialog({
  open,
  onClose,
  hospitals,
  selectedHospital,
  onAddHospital
}) {
  const [center, setCenter] = useState({
    lat: 20.2961,
    lng: 85.8245
  });

  const handleUseMyLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCenter({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <Box sx={{ height: "80vh", display: "flex", flexDirection: "column" }}>

        <Box sx={{ p:2 }}>
          <Button
            variant="contained"
            startIcon={<MyLocation />}
            onClick={handleUseMyLocation}
          >
            Use My Location
          </Button>
        </Box>

        <Box sx={{ flex:1 }}>
          <HospitalMap
            center={center}
            hospitals={hospitals}
            selectedHospital={selectedHospital}
            onAddHospital={onAddHospital}
          />
        </Box>

      </Box>
    </Dialog>
  );
}