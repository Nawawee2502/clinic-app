import React from "react";
import { Tabs, Tab, Card, CardContent, Typography, Box } from "@mui/material";
import GeneralInfoTab from '../components/patientregistration/GeneralInfoTab';
import ContactInfoTab from '../components/patientregistration/ContactInfoTab';
import HealthHistoryTab from '../components/patientregistration/HealthHistoryTab';

const PatientRegistration = () => {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Box sx={{ width: "100%", pt: 2 }}>
      <Typography sx={{
        fontWeight: '600',
        fontSize: '24px',
        fontFamily: 'Instrument Sans',
        letterSpacing: '1.5px',
        lineHeight: '2',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
      }}>
        ลงทะเบียนผู้ป่วย
      </Typography>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        sx={{
          backgroundColor: "#F0F5FF",
          borderRadius: "8px",
          alignSelf: "start",
          "& .MuiTab-root": {
            color: "#6B7280",
            fontWeight: "bold",
            textAlign: "left",
          },
          "& .Mui-selected": {
            backgroundColor: "#D6E4FF",
            borderRadius: "8px",
            color: "#1D4ED8",
          },
          "& .MuiTabs-indicator": {
            display: "none",
          },
          // maxWidth: "500px",
          width: 'auto'
        }}
      >
        <Tab label="ข้อมูลทั่วไป" />
        <Tab label="ข้อมูลติดต่อ" />
        <Tab label="ประวัติสุขภาพ" />
      </Tabs>

      <Card sx={{ width: "100%", mt: 2 }}>
        <CardContent>
          {tabIndex === 0 && <GeneralInfoTab />}
          {tabIndex === 1 && <ContactInfoTab />}
          {tabIndex === 2 && <HealthHistoryTab />}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientRegistration;