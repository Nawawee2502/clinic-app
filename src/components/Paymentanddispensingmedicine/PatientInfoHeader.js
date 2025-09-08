import React from 'react';
import {
    Card,
    Typography,
    Avatar,
    Box,
    Grid
} from "@mui/material";

const PatientInfoHeader = ({ patient }) => {
    if (!patient) return null;

    return (
        <Card
            elevation={3}
            sx={{
                p: 3,
                background: 'linear-gradient(135deg, #5698E0 0%, #2B69AC 100%)',
                color: 'white',
                borderRadius: '16px',
                mb: 2
            }}
        >
            <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={2}>
                    <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                fontSize: '32px',
                                fontWeight: 'bold',
                                mx: { xs: 'auto', md: 0 }
                            }}
                        >
                            {patient.NAME1?.charAt(0) || '?'}
                        </Avatar>
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                        {patient.PRENAME} {patient.NAME1} {patient.SURNAME}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        อายุ {patient.AGE} ปี • {patient.SEX}
                    </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={4}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>VN Number</Typography>
                                <Typography variant="h6" fontWeight="bold">{patient.VNO}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>HN Code</Typography>
                                <Typography variant="h6" fontWeight="bold">{patient.HNCODE}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>คิวที่</Typography>
                                <Typography variant="h6" fontWeight="bold">{patient.queueNumber}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>เวลา</Typography>
                                <Typography variant="h6" fontWeight="bold">{patient.queueTime}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* อาการ */}
            {patient.SYMPTOM && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>อาการเบื้องต้น:</Typography>
                    <Typography variant="body1">{patient.SYMPTOM}</Typography>
                </Box>
            )}
        </Card>
    );
};

export default PatientInfoHeader;