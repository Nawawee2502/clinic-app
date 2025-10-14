import React from "react";
import { Container, Tabs, Tab, Card, CardContent, Typography } from "@mui/material";
import EnhancedDrugInformation from '../components/Drugandmedical/EnhancedDrugInformation';
import EnhancedMedicalProcedures from '../components/Drugandmedical/EnhancedMedicalProcedures';

const Medicalstock = () => {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, maxWidth: "1400px" }}>
      <Typography sx={{
        fontWeight: '600',
        fontSize: '24px',
        fontFamily: 'Instrument Sans',
        letterSpacing: '1.5px',
        lineHeight: '2',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
      }}>
        ระบบคลังยา/เวชภัณฑ์
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
        }}
      >
        <Tab label="ข้อมูลยา"/>
        <Tab label="ข้อมูลหัตถการ"/>
        <Tab label="ตัวแทนจำหน่าย"/>
        {/* <Tab label="ใบรับยา/เวชภัณฑ์"/>
        <Tab label="ใบคืนยา/เวชภัณฑ์"/>
        <Tab label="บันทึกจำนวนสินค้าประจำเดือน"/>
        <Tab label="สินค้าคงเหลือ"/>
        <Tab label="สต็อกการ์ด"/>
        <Tab label="รายงานการเคลื่อนไหวสินค้า"/>
        <Tab label="รายงานยาเวชภัณฑ์ที่ต้องสั่งซื้อ"/>
        <Tab label="รายงานยาเวชภัณฑ์ใกล้หมดอายุ"/> */}
      </Tabs>

      <Card>
        <CardContent>
          {tabIndex === 0 && <EnhancedDrugInformation />}
          {tabIndex === 1 && <EnhancedMedicalProcedures />}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Medicalstock;