import { useState, useRef } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Grid,
    IconButton,
    Alert,
    CircularProgress,
    Paper,
    Divider,
} from "@mui/material";
import {
    PhotoCamera,
    LocationOn,
    Send,
    DeleteOutline,
    CheckCircle,
    Pets,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useAuth } from "../context/authContext";
import api from "../api/axios";

// Reuse identical theme logic here
const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#10b981" },
        secondary: { main: "#3b82f6" },
    },
    typography: {
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        h4: { fontWeight: 800, color: "#1a1f36" },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: "none", borderRadius: 8, fontWeight: 700 },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: { borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
            },
        },
    },
});

export default function ReportSnake() {
    const { user } = useAuth();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        description: "",
        latitude: null,
        longitude: null,
        location_name: "",
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [locating, setLocating] = useState(false);

    const handleImageUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                setStatus({ type: "error", message: "Image size must be less than 5MB" });
                return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const getLocation = () => {
        setLocating(true);
        setStatus({ type: "", message: "" });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData((prev) => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }));
                    setLocating(false);
                    setStatus({ type: "success", message: "Location acquired successfully!" });
                },
                (error) => {
                    setLocating(false);
                    setStatus({
                        type: "error",
                        message: "Failed to get location. Please enable location services or enter it manually.",
                    });
                }
            );
        } else {
            setLocating(false);
            setStatus({ type: "error", message: "Geolocation is not supported by your browser." });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.latitude || !formData.longitude) {
            setStatus({ type: "error", message: "Please provide a location." });
            return;
        }

        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            // In a real application, you would use FormData to upload the file along with text
            // Note: adjust endpoint according to exact backend PHP spec
            const payload = new FormData();
            payload.append("reported_by", user?.id || "");
            payload.append("description", formData.description);
            payload.append("latitude", formData.latitude);
            payload.append("longitude", formData.longitude);
            payload.append("location_name", formData.location_name);
            if (file) {
                payload.append("snake_image", file);
            }

            await api.post("/snake_reports/report.php", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setStatus({ type: "success", message: "Snake sighting reported successfully! Rescuers have been notified." });
            setFormData({ description: "", latitude: null, longitude: null, location_name: "" });
            removeImage();
        } catch (err) {
            console.error(err);
            setStatus({
                type: "error",
                message: err.response?.data?.message || "Failed to submit report. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", p: 3 }}>
                <Box sx={{ maxWidth: 800, mx: "auto" }}>

                    <Box sx={{ mb: 4, textAlign: "center" }}>
                        <Typography variant="h4" sx={{ mb: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                            <Pets sx={{ fontSize: 36, color: "#10b981" }} /> Report a Snake Sighting
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#6b7280" }}>
                            Help us track snake populations and dispatch rescuers if a snake needs relocation.
                        </Typography>
                    </Box>

                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            {status.message && (
                                <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }}>
                                    {status.message}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={4}>

                                    {/* Image Upload Section */}
                                    <Grid item xs={12} md={5}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "#374151" }}>
                                            Photo Evidence (Optional but helpful)
                                        </Typography>

                                        {!imagePreview ? (
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    height: 240,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderStyle: "dashed",
                                                    borderWidth: 2,
                                                    borderColor: "#d1d5db",
                                                    bgcolor: "#f9fafb",
                                                    cursor: "pointer",
                                                    "&:hover": { borderColor: "#10b981", bgcolor: "#f0fdf4" },
                                                }}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <PhotoCamera sx={{ fontSize: 48, color: "#9ca3af", mb: 1 }} />
                                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                    Click to upload photo
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                    Max size: 5MB
                                                </Typography>
                                            </Paper>
                                        ) : (
                                            <Box sx={{ position: "relative", height: 240, borderRadius: 2, overflow: "hidden" }}>
                                                <img
                                                    src={imagePreview}
                                                    alt="Snake preview"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={removeImage}
                                                    sx={{
                                                        position: "absolute",
                                                        top: 8,
                                                        right: 8,
                                                        bgcolor: "rgba(255,255,255,0.9)",
                                                        color: "#ef4444",
                                                        "&:hover": { bgcolor: "#fff" },
                                                    }}
                                                >
                                                    <DeleteOutline />
                                                </IconButton>
                                            </Box>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                        />
                                    </Grid>

                                    {/* Details Section */}
                                    <Grid item xs={12} md={7}>
                                        <Grid container spacing={2}>

                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#374151" }}>
                                                    Location Details *
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    startIcon={locating ? <CircularProgress size={20} color="inherit" /> : <LocationOn />}
                                                    onClick={getLocation}
                                                    disabled={locating}
                                                    fullWidth
                                                    sx={{ mb: 2, py: 1.5, background: "#1a1f36", color: "white", "&:hover": { background: "#0f1425" } }}
                                                >
                                                    {locating ? "Acquiring coordinates..." : formData.latitude ? "Update Coordinates" : "Get Current Location"}
                                                </Button>

                                                {(formData.latitude || formData.longitude) && (
                                                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                                        <TextField
                                                            size="small"
                                                            label="Latitude"
                                                            value={formData.latitude || ""}
                                                            InputProps={{ readOnly: true }}
                                                            fullWidth
                                                        />
                                                        <TextField
                                                            size="small"
                                                            label="Longitude"
                                                            value={formData.longitude || ""}
                                                            InputProps={{ readOnly: true }}
                                                            fullWidth
                                                        />
                                                    </Box>
                                                )}

                                                <TextField
                                                    fullWidth
                                                    label="Location Description (e.g., Near water tank, inside shed)"
                                                    value={formData.location_name}
                                                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                                    required
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 1 }} />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#374151" }}>
                                                    Observation Details
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    label="Describe the snake (Color, pattern, size, behavior)"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="e.g., About 3 feet long, black with thin white bands. Was hiding under some rocks."
                                                />
                                            </Grid>

                                        </Grid>
                                    </Grid>

                                    {/* Submit Button */}
                                    <Grid item xs={12}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                                            sx={{ py: 2, background: "#1a1f36", color: "white", "&:hover": { background: "#0f1425" } }}
                                        >
                                            {loading ? "Submitting Report..." : "Submit Snake Report"}
                                        </Button>
                                    </Grid>

                                </Grid>
                            </form>
                        </CardContent>
                    </Card>

                </Box>
            </Box>
        </ThemeProvider>
    );
}
