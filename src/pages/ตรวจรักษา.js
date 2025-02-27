import React from "react";
import { Grid, TextField, Button, MenuItem, Avatar,  Box,} from "@mui/material";
import { Container, Tabs, Tab, Card, CardContent, Typography } from "@mui/material";
import Todaypatientinformation from "../components/ตรวจรักษา/Todaypatientinformation"
import Medicalhistory from "../components/ตรวจรักษา/Medicalhistory"
import ตรวจวินิจฉัย from "../components/ตรวจรักษา/ตรวจวินิจฉัย"
import LabandXray from "../components/ตรวจรักษา/LabandX-ray"
import DxandTreatment from "../components/ตรวจรักษา/DxandTreatment"
import Ordermedicine from "../components/ตรวจรักษา/Ordermedicine"
import Procedure from "../components/ตรวจรักษา/Procedure"
import Appointment from "../components/ตรวจรักษา/Appointment"
import Medicalcertificate from "../components/ตรวจรักษา/Medicalcertificate"
import Doctor from "../components/ตรวจรักษา/Doctor"
import Cerwork from "../components/ตรวจรักษา/cerwork"
import Cerdriver from "../components/ตรวจรักษา/Cerdriver"

const ตรวจรักษา = () => {
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
            ตรวจรักษา
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
            <Tab label="ข้อมูลคนไข้วันนี้" />
            <Tab label="ประวัติการรักษา" />
            <Tab label="ตรวจวินิจฉัย" />
            <Tab label="ส่งLAB/X-ray" />
            <Tab label="Dx/ สรุป Treatment" />
            <Tab label="Order ยา" />
            <Tab label="หัตถการ" />
            <Tab label="นัดหมายคนไข้" />
            <Tab label="ใบรับรองแพทย์" />
            <Tab label="ตารางแพทย์" />
            <Tab label=" " />
            <Tab label=" " />
          </Tabs>
    
          <Card>
            <CardContent>
              {tabIndex === 0 && <Todaypatientinformation />}
              {tabIndex === 1 && <Medicalhistory />}
              {tabIndex === 2 && <ตรวจวินิจฉัย />}
              {tabIndex === 3 && <LabandXray />}
              {tabIndex === 4 && < DxandTreatment />}
              {tabIndex === 5 && < Ordermedicine/>}
              {tabIndex === 6 && < Procedure/>}
              {tabIndex === 7 && < Appointment/>}
              {tabIndex === 8 && < Medicalcertificate />}
              {tabIndex === 9 && <  Doctor/>}
              {tabIndex === 10 && < Cerwork/>}
              {tabIndex === 11 && < Cerdriver/>}
            </CardContent>
          </Card>
        </Container>
    );
};

export default ตรวจรักษา;