import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import { CheckCircle, Cancel, ErrorOutline, Info } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#dc2626' },
        success: { main: '#10b981' },
        error: { main: '#ef4444' },
        background: { default: '#fef2f2', paper: '#ffffff' },
    },
    typography: {
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        h4: { fontWeight: 800, color: '#1a1f36' },
        h6: { fontWeight: 700, color: '#1a1f36' },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                },
            },
        },
    },
});

export default function FirstAid() {
    const dos = [
        "Stay calm and reassure the victim.",
        "Immobilize the bitten limb (like you would for a fractured bone).",
        "Keep the victim still to slow the spread of venom.",
        "Remove any tight clothing, rings, or watches near the bite area.",
        "Lay the patient on their side to prevent choking if they vomit.",
        "Note the time of the bite and symptoms.",
        "Get to the nearest hospital with Anti-Snake Venom (ASV) immediately.",
    ];

    const donts = [
        "DO NOT tie a tight tourniquet (can cause limb amputation).",
        "DO NOT cut or suck the bite wound.",
        "DO NOT apply ice, heat, herbs, or chemicals to the wound.",
        "DO NOT give the victim anything to eat or drink (including alcohol or medicine).",
        "DO NOT try to catch or kill the snake.",
        "DO NOT wait for symptoms to appear before seeking medical help.",
    ];

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', p: 3 }}>
                <Box sx={{ maxWidth: 1200, mx: 'auto' }}>

                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Info sx={{ fontSize: 36, color: '#dc2626' }} /> Snakebite First Aid
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', maxWidth: 600, mx: 'auto' }}>
                            Immediate and correct action can save a life. Follow these medical guidelines while waiting for emergency transport.
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Video Section */}
                        <Grid item xs={12}>
                            <Card sx={{ border: '2px solid #fecaca' }}>
                                <CardContent sx={{ p: 0 }}>
                                    <Box sx={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                                        <iframe
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                            src="https://www.youtube.com/embed/dQw4w9WgXcQ" /* Placeholder - replace with actual medical video */
                                            title="Snakebite First Aid Video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </Box>
                                    <Box sx={{ p: 2, background: '#fff' }}>
                                        <Typography variant="h6" color="primary" display="flex" alignItems="center" gap={1}>
                                            <ErrorOutline /> Watch Before Proceeding
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            This video demonstrates the correct Right Method (Immobilization) for snakebite first aid.
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Dos Section */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', border: '2px solid #a7f3d0' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ color: '#059669', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircle /> WHAT TO DO (Dos)
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <List>
                                        {dos.map((item, index) => (
                                            <ListItem key={index} sx={{ px: 0, py: 1 }}>
                                                <ListItemIcon sx={{ minWidth: 40 }}>
                                                    <CheckCircle color="success" fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item}
                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Donts Section */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ height: '100%', border: '2px solid #fca5a5' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ color: '#dc2626', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Cancel /> WHAT NOT TO DO (Don'ts)
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <List>
                                        {donts.map((item, index) => (
                                            <ListItem key={index} sx={{ px: 0, py: 1 }}>
                                                <ListItemIcon sx={{ minWidth: 40 }}>
                                                    <Cancel color="error" fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item}
                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                </Box>
            </Box>
        </ThemeProvider>
    );
}
