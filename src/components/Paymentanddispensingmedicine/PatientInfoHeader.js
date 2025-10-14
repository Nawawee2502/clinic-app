import React from 'react';
import {
    Card,
    Typography,
    Avatar,
    Box,
    Grid,
    Chip
} from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PaymentIcon from '@mui/icons-material/Payment';

// Import TreatmentService
import TreatmentService from "../../services/treatmentService";

const PatientInfoHeader = ({ patient }) => {
    if (!patient) return null;

    // ดึงข้อมูลสิทธิ์การรักษา
    const patientRight = TreatmentService.getPatientRight(patient);

    // เลือก icon ตามประเภทสิทธิ์
    const getRightIcon = (code) => {
        switch (code) {
            case 'SOCIAL':
                return <AccountBalanceIcon sx={{ fontSize: 20 }} />;
            case 'UCS':
                return <LocalHospitalIcon sx={{ fontSize: 20 }} />;
            case 'SELF':
                return <PaymentIcon sx={{ fontSize: 20 }} />;
            default:
                return <PaymentIcon sx={{ fontSize: 20 }} />;
        }
    };

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

            {/* อาการ และ สิทธิ์การรักษา */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* อาการเบื้องต้น */}
                {patient.SYMPTOM && (
                    <Grid item xs={12} md={8}>
                        <Box sx={{
                            p: 2,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, fontWeight: 600 }}>
                                💬 อาการเบื้องต้น:
                            </Typography>
                            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                {patient.SYMPTOM}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* สิทธิ์การรักษา */}
                <Grid item xs={12} md={patient.SYMPTOM ? 4 : 12}>
                    <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.95,
                                mb: 1.5,
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: 1,
                                textTransform: 'uppercase'
                            }}
                        >
                            สิทธิ์การรักษา
                        </Typography>

                        <Chip
                            icon={getRightIcon(patientRight.code)}
                            label={patientRight.name}
                            sx={{
                                bgcolor: patientRight.bgColor,
                                color: patientRight.color,
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                height: 42,
                                px: 2,
                                border: `2px solid ${patientRight.color}`,
                                boxShadow: `0 4px 12px ${patientRight.color}44`,
                                '& .MuiChip-icon': {
                                    color: patientRight.color,
                                    fontSize: 22
                                },
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 6px 16px ${patientRight.color}66`,
                                    bgcolor: patientRight.bgColor
                                },
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Card>
    );
};

export default PatientInfoHeader;