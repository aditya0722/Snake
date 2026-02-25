import { useState, useEffect } from "react";
import {
  Dialog, Box, Button, Typography, IconButton,
  Chip, Stack, Divider, CircularProgress, Tooltip
} from "@mui/material";
import {
  MyLocation, Close, LocalHospital, NavigateNext,
  ZoomIn, ZoomOut, Layers, Refresh, NearMe,
  FmdGood, Phone, DirectionsCar, FullscreenExit, Fullscreen
} from "@mui/icons-material";
import HospitalMap from "./HospitalMap";

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

export default function NearbyHospitalsDialog({
  open,
  onClose,
  hospitals = [],
  selectedHospital: initialSelected,
  onAddHospital,
  savedHospitals = [],
}) {
  const [center, setCenter]                   = useState({ lat: 6.9271, lng: 79.8612 });
  const [locating, setLocating]               = useState(false);
  const [locError, setLocError]               = useState("");
  const [userPos, setUserPos]                 = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(initialSelected || null);
  const [fullscreen, setFullscreen]           = useState(false);

  // Sync external selectedHospital
  useEffect(() => { setSelectedHospital(initialSelected || null); }, [initialSelected]);

  // Reset on close
  useEffect(() => {
    if (!open) { setLocError(""); setSelectedHospital(null); }
  }, [open]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported"); return; }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenter(loc);
        setUserPos(loc);
        setLocating(false);
      },
      () => { setLocError("Could not get location"); setLocating(false); }
    );
  };

  // Hospitals sorted by distance if userPos available
  const sortedHospitals = userPos
    ? [...savedHospitals]
        .filter(h => h.lat && h.lng)
        .map(h => ({ ...h, dist: parseFloat(haversine(userPos.lat, userPos.lng, h.lat, h.lng)) }))
        .sort((a, b) => a.dist - b.dist)
    : savedHospitals.filter(h => h.lat && h.lng);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={fullscreen ? false : "lg"}
      fullScreen={fullscreen}
      PaperProps={{
        sx: {
          borderRadius: fullscreen ? 0 : "20px",
          overflow: "hidden",
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          height: fullscreen ? "100vh" : "88vh",
        },
      }}
    >
      {/* ── Top Bar ── */}
      <Box sx={{
        px: 3, py: 2,
        background: "linear-gradient(180deg, #161b27 0%, #0d1117 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        {/* Left: title */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{
            width: 38, height: 38, borderRadius: "10px",
            background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(231,76,60,0.4)",
          }}>
            <LocalHospital sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{
              fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
              color: "#fff", fontSize: "1rem", letterSpacing: "-0.02em",
            }}>
              Hospital Network
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.72rem", fontWeight: 500 }}>
              {sortedHospitals.length} registered · Live map view
            </Typography>
          </Box>
        </Stack>

        {/* Right: controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* My Location button */}
          <Button
            variant="contained"
            size="small"
            startIcon={locating ? <CircularProgress size={13} color="inherit" /> : <MyLocation sx={{ fontSize: 15 }} />}
            onClick={handleUseMyLocation}
            disabled={locating}
            sx={{
              background: "linear-gradient(135deg, #1a233a 0%, #2d3a5c 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.78rem",
              px: 2,
              color: "#fff",
              boxShadow: "none",
              "&:hover": { background: "linear-gradient(135deg, #232d4a 0%, #374570 100%)", boxShadow: "none" },
              "&.Mui-disabled": { opacity: 0.5, color: "#fff" },
            }}
          >
            {locating ? "Locating…" : "My Location"}
          </Button>

          <Tooltip title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <IconButton
              size="small"
              onClick={() => setFullscreen(v => !v)}
              sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff", background: "rgba(255,255,255,0.08)" } }}
            >
              {fullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff", background: "rgba(231,76,60,0.15)" } }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Error bar */}
      {locError && (
        <Box sx={{ px: 3, py: 1, background: "rgba(231,76,60,0.15)", borderBottom: "1px solid rgba(231,76,60,0.2)" }}>
          <Typography sx={{ color: "#ff6b6b", fontSize: "0.78rem", fontWeight: 600 }}>⚠ {locError}</Typography>
        </Box>
      )}

      {/* ── Body: Sidebar + Map ── */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <Box sx={{
          width: 280, flexShrink: 0,
          display: "flex", flexDirection: "column",
          background: "#10151f",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}>
          {/* Sidebar header */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ color: "rgba(255,255,255,0.35)", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {userPos ? "Sorted by distance" : "Saved Hospitals"}
              </Typography>
              {userPos && (
                <Chip
                  icon={<NearMe sx={{ fontSize: "11px !important", color: "#00d4aa !important" }} />}
                  label="Near you"
                  size="small"
                  sx={{ height: 20, fontSize: "0.62rem", fontWeight: 700, background: "rgba(0,212,170,0.12)", color: "#00d4aa", border: "1px solid rgba(0,212,170,0.2)" }}
                />
              )}
            </Stack>
          </Box>

          {/* Hospital list */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, pb: 2,
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.1)", borderRadius: 4 },
          }}>
            {sortedHospitals.length === 0 && (
              <Box sx={{ textAlign: "center", mt: 6, px: 2 }}>
                <LocalHospital sx={{ fontSize: 36, color: "rgba(255,255,255,0.1)" }} />
                <Typography sx={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", mt: 1, lineHeight: 1.5 }}>
                  No hospitals with coordinates yet.<br />Add lat/lng when registering.
                </Typography>
              </Box>
            )}

            {sortedHospitals.map((h, i) => {
              const isSelected = selectedHospital?.id === h.id;
              return (
                <Box
                  key={h.id}
                  onClick={() => { setSelectedHospital(h); setCenter({ lat: h.lat, lng: h.lng }); }}
                  sx={{
                    p: 2, mb: 1, borderRadius: "12px", cursor: "pointer",
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(231,76,60,0.15) 0%, rgba(192,57,43,0.08) 100%)"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isSelected ? "rgba(231,76,60,0.35)" : "rgba(255,255,255,0.05)"}`,
                    transition: "all 0.18s ease",
                    "&:hover": {
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(231,76,60,0.2) 0%, rgba(192,57,43,0.12) 100%)"
                        : "rgba(255,255,255,0.06)",
                      borderColor: isSelected ? "rgba(231,76,60,0.5)" : "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    {/* Rank badge */}
                    {userPos && (
                      <Box sx={{
                        minWidth: 24, height: 24, borderRadius: "50%",
                        background: i === 0 ? "linear-gradient(135deg, #e74c3c, #c0392b)" : "rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: 0.2,
                        border: `1px solid ${i === 0 ? "rgba(231,76,60,0.5)" : "rgba(255,255,255,0.08)"}`,
                      }}>
                        <Typography sx={{ fontSize: "0.6rem", fontWeight: 800, color: i === 0 ? "#fff" : "rgba(255,255,255,0.3)" }}>
                          {i + 1}
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{
                        color: isSelected ? "#fff" : "rgba(255,255,255,0.75)",
                        fontWeight: 700, fontSize: "0.82rem", lineHeight: 1.3,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {h.name}
                      </Typography>

                      {h.address && (
                        <Typography sx={{ color: "rgba(255,255,255,0.28)", fontSize: "0.7rem", mt: 0.4, lineHeight: 1.3 }}
                          noWrap>
                          {h.address}
                        </Typography>
                      )}

                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                        {userPos && h.dist !== undefined && (
                          <Chip
                            icon={<DirectionsCar sx={{ fontSize: "11px !important", color: "#4fc3f7 !important" }} />}
                            label={`${h.dist} km`}
                            size="small"
                            sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, background: "rgba(79,195,247,0.1)", color: "#4fc3f7", border: "1px solid rgba(79,195,247,0.2)" }}
                          />
                        )}
                        {isSelected && (
                          <Chip label="Viewing" size="small"
                            sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, background: "rgba(231,76,60,0.2)", color: "#ff6b6b", border: "1px solid rgba(231,76,60,0.3)" }} />
                        )}
                      </Stack>
                    </Box>

                    <IconButton size="small"
                      onClick={e => {
                        e.stopPropagation();
                        window.open(`https://www.openstreetmap.org/directions?to=${h.lat}%2C${h.lng}`, "_blank");
                      }}
                      sx={{ color: "rgba(255,255,255,0.2)", flexShrink: 0, mt: -0.5, "&:hover": { color: "#fff", background: "rgba(255,255,255,0.08)" } }}>
                      <NavigateNext sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                </Box>
              );
            })}
          </Box>

          {/* Status footer */}
          <Box sx={{ px: 2.5, py: 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Stack direction="row" spacing={2}>
              {[
                { label: "Total", value: savedHospitals.length, color: "#9c8fff" },
                { label: "On map", value: sortedHospitals.length, color: "#00d4aa" },
              ].map(stat => (
                <Box key={stat.label}>
                  <Typography sx={{ color: stat.color, fontWeight: 800, fontSize: "1.1rem", lineHeight: 1 }}>{stat.value}</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.25)", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</Typography>
                </Box>
              ))}
              {userPos && (
                <Box sx={{ ml: "auto !important" }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4aa", boxShadow: "0 0 8px #00d4aa", animation: "pulse 2s infinite" }} />
                </Box>
              )}
            </Stack>
          </Box>
        </Box>

        {/* ── Map area ── */}
        <Box sx={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Map */}
          <Box sx={{ width: "100%", height: "100%" }}>
            <HospitalMap
              center={center}
              savedHospitals={savedHospitals}
              selectedHospital={selectedHospital}
              onAddHospital={onAddHospital}
            />
          </Box>

          {/* Selected hospital info overlay */}
          {selectedHospital && (
            <Box sx={{
              position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
              background: "rgba(13,17,23,0.92)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(231,76,60,0.3)", borderRadius: "16px",
              px: 3, py: 2, minWidth: 300, maxWidth: 420,
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "rgba(231,76,60,0.15)", border: "1px solid rgba(231,76,60,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <LocalHospital sx={{ color: "#e74c3c", fontSize: 18 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: "0.88rem" }} noWrap>
                    {selectedHospital.name}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.3 }}>
                    {selectedHospital.contact_number && selectedHospital.contact_number !== "N/A" && (
                      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem" }}>
                        📞 {selectedHospital.contact_number}
                      </Typography>
                    )}
                    {userPos && selectedHospital.lat && selectedHospital.lng && (
                      <Chip
                        label={`${haversine(userPos.lat, userPos.lng, selectedHospital.lat, selectedHospital.lng)} km away`}
                        size="small"
                        sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, background: "rgba(79,195,247,0.15)", color: "#4fc3f7" }}
                      />
                    )}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    size="small" variant="contained"
                    onClick={() => window.open(`https://www.openstreetmap.org/directions?to=${selectedHospital.lat}%2C${selectedHospital.lng}`, "_blank")}
                    sx={{ background: "#e74c3c", borderRadius: "8px", textTransform: "none", fontWeight: 700, fontSize: "0.72rem", px: 1.5, minWidth: 0, boxShadow: "none", "&:hover": { background: "#c0392b", boxShadow: "none" } }}>
                    Directions
                  </Button>
                  <IconButton size="small" onClick={() => setSelectedHospital(null)}
                    sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "#fff", background: "rgba(255,255,255,0.08)" } }}>
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          )}

          {/* No location hint */}
          {!userPos && (
            <Box sx={{
              position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
              background: "rgba(13,17,23,0.85)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "99px",
              px: 2, py: 0.8, display: "flex", alignItems: "center", gap: 1,
            }}>
              <Box sx={{ width: 7, height: 7, borderRadius: "50%", background: "#ffb347", boxShadow: "0 0 8px #ffb347" }} />
              <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", fontWeight: 600 }}>
                Click "My Location" to sort hospitals by distance
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </Dialog>
  );
}