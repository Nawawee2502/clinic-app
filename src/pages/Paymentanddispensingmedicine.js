import React from "react";
import { Grid, TextField, Button, MenuItem, Avatar,  Box,} from "@mui/material";
import { Container, Tabs, Tab, Card, CardContent, Typography } from "@mui/material";
import MedicalBilling from "../components/Paymentanddispensingmedicine/MedicalBilling"
import Receipt from "../components/Paymentanddispensingmedicine/Receipt"
import Medicinelabel from "../components/Paymentanddispensingmedicine/Medicinelabel"


const Paymentanddispensingmedicine = () => {
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
        letterSpacing: '1.5px', // เพิ่มระยะห่างระหว่างตัวอักษร
        lineHeight: '2',     // เพิ่มความสูงของบรรทัด
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)' // เพิ่มเงาให้ตัวหนังสือ
        }}>
            ชำระเงิน/จ่ายยา
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
              maxWidth: "1400px" 
            }}
          >
            <Tab label="ชำระเงิน/จ่ายยา" />
            <Tab label="ใบเสร็จ" />
            <Tab label="ฉลากยา" />
            {/* <Tab label="ส่งLAB/X-ray" />
            <Tab label="Dx/ สรุป Treatment" />
            <Tab label="Order ยา" />
            <Tab label="หัตถการ" />
            <Tab label="นัดหมายคนไข้" />
            <Tab label="ใบรับรองแพทย์" />
            <Tab label="ตารางแพทย์" /> */}
          </Tabs>
    
          <Card>
            <CardContent>
              {tabIndex === 0 && <MedicalBilling />}
              {tabIndex === 1 && <Receipt />}
              {tabIndex === 2 && <Medicinelabel />}
              {/* {tabIndex === 3 && <LabandXray />}
              {tabIndex === 4 && < DxandTreatment />}
              {tabIndex === 5 && < Ordermedicine/>}
              {tabIndex === 6 && < Procedure/>}
              {tabIndex === 7 && < Appointment/>}
              {tabIndex === 9 && <  Doctor/>} */}
             
            </CardContent>
          </Card>
        </Container>
    );
};

export default Paymentanddispensingmedicine;