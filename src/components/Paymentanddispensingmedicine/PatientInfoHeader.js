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

const PatientInfoHeader = ({ patient, treatmentData }) => {
    if (!patient) return null;

    // ดึงข้อมูลสิทธิ์การรักษา
    const patientRight = TreatmentService.getPatientRight(patient);

    // ดึงข้อมูลเพิ่มเติมจาก treatmentData
    const patientInfo = treatmentData?.patient || {};
    const treatment = treatmentData?.treatment || {};
    const diagnosis = treatmentData?.diagnosis || {};

    // รวมข้อมูลผู้ป่วย
    const drugAllergy = patient.DRUG_ALLERGY || patientInfo.DRUG_ALLERGY || '';
    const disease = patient.DISEASE1 || patientInfo.DISEASE1 || '';
    const weight = treatment.WEIGHT1 || patient.WEIGHT1 || null;
    const dxCode = treatment.DXCODE || '';
    const dxName = treatment.DXNAME_THAI || '';
    const chiefComplaint = diagnosis.CHIEF_COMPLAINT || patient.SYMPTOM || treatment.SYMPTOM || '';
    const presentIll = diagnosis.PRESENT_ILL || '';
    const physicalExam = diagnosis.PHYSICAL_EXAM || '';
    const plan = diagnosis.PLAN1 || '';

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

            {/* ข้อมูลเพิ่มเติม: อาการ, ประวัติแพ้ยา, โรคประจำตัว, น้ำหนัก, Diagnosis */}
            <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* ข้อมูลด้านซ้าย - รวมทั้งหมดใน Box เดียว แสดงในบรรทัดเดียวกัน */}
                <Grid item xs={12} md={8}>
                    {(chiefComplaint || drugAllergy || disease || weight || dxCode) && (
                        <Box sx={{
                            p: 2,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            borderRadius: 2,
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <Grid container spacing={2} alignItems="flex-start">
                                {/* อาการเบื้องต้น */}
                                {chiefComplaint && (
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.5, fontWeight: 600, display: 'block', fontSize: '11px' }}>
                                            💬 อาการเบื้องต้น:
                                        </Typography>
                                        <Typography variant="body2" sx={{ lineHeight: 1.4, fontSize: '13px' }}>
                                            {chiefComplaint}
                                        </Typography>
                                    </Grid>
                                )}

                                {/* ประวัติแพ้ยา */}
                                <Grid item xs={12} sm={6} md={chiefComplaint ? 3 : 4}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600, display: 'block', mb: 0.5, fontSize: '11px' }}>
                                        ⚠️ ประวัติแพ้ยา:
                                    </Typography>
                                    <Typography variant="body2" sx={{ lineHeight: 1.4, fontSize: '13px' }}>
                                        {drugAllergy || 'ไม่มี'}
                                    </Typography>
                                </Grid>

                                {/* โรคประจำตัว */}
                                {disease && (
                                    <Grid item xs={12} sm={6} md={chiefComplaint ? 3 : 4}>
                                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600, display: 'block', mb: 0.5, fontSize: '11px' }}>
                                            🏥 โรคประจำตัว:
                                        </Typography>
                                        <Typography variant="body2" sx={{ lineHeight: 1.4, fontSize: '13px' }}>
                                            {disease}
                                        </Typography>
                                    </Grid>
                                )}

                                {/* น้ำหนัก */}
                                {weight && (
                                    <Grid item xs={12} sm={6} md={chiefComplaint ? 3 : 4}>
                                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600, display: 'block', mb: 0.5, fontSize: '11px' }}>
                                            ⚖️ น้ำหนัก:
                                        </Typography>
                                        <Typography variant="body2" sx={{ lineHeight: 1.4, fontWeight: 600, fontSize: '13px' }}>
                                            {weight} กก.
                                        </Typography>
                                    </Grid>
                                )}

                                {/* Diagnosis */}
                                {dxCode && (
                                    <Grid item xs={12} sm={6} md={chiefComplaint ? 3 : 4}>
                                        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600, display: 'block', mb: 0.5, fontSize: '11px' }}>
                                            🩺 Diagnosis:
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center', flexWrap: 'wrap' }}>
                                            <Chip
                                                label={dxCode}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.25)',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: '11px',
                                                    height: 22,
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                                }}
                                            />
                                            {dxName && (
                                                <Typography variant="body2" sx={{ lineHeight: 1.4, fontSize: '12px', opacity: 0.95 }}>
                                                    {dxName}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Box>
                    )}
                </Grid>

                {/* สิทธิ์การรักษา */}
                <Grid item xs={12} md={4}>
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