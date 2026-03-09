// src/pages/PsychotropicReportPage.js
import React from 'react';
import { Container, Typography } from '@mui/material';
import PsychotropicDrugReport from '../components/Report/PsychotropicDrugReport';

const PsychotropicReportPage = () => {
    return (
        <Container maxWidth={false} sx={{ mt: 4, maxWidth: '1400px' }}>
            <Typography sx={{
                fontWeight: '600',
                fontSize: '24px',
                fontFamily: 'Instrument Sans',
                letterSpacing: '1.5px',
                lineHeight: '2',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
                รายงานยาวัตถุออกฤทธิ์
            </Typography>
            <PsychotropicDrugReport />
        </Container>
    );
};

export default PsychotropicReportPage;
