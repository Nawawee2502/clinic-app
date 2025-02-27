import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, Tabs, Tab, Divider,Box,Checkbox,FormGroup,FormControlLabel,LinearProgress } from "@mui/material";
import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import { CheckBox} from "@mui/icons-material";

const LabandXray = () => {


      // ข้อมูลจำลอง (Array)
  const patients = [
    {
      hn: "000001",
      citizenId: "1909085467809",
      firstName: "แอนดิสัน",
      lastName: "ลูปิน",
      age: "20 ปี 9 เดือน",
    },
    {
      hn: "000002",
      citizenId: "2909085467810",
      firstName: "สมชาย",
      lastName: "ใจดี",
      age: "25 ปี 3 เดือน",
    },
  ];
    // เก็บ index คนไข้ที่เลือก (ตัวอย่างเลือกคนแรก)
    const [selectedIndex, setSelectedIndex] = useState(0);
    const patient = patients[selectedIndex];

  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Patient Queue Bar */}
       {/* <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}> */}
      {/* <Tabs 
        value={selectedTab} 
        onChange={handleTabChange}
        variant="scrollable" 
        scrollButtons="auto" 
        sx={{ mb: 2, fontSize: "1.2rem", minHeight: 48, 
          '& .Mui-selected': {
          background: 'linear-gradient(60deg, #FFFFFF, #FFFFFF)', // สีเมื่อเลือก
            color: 'primary', // สีตัวหนังสือเมื่อเลือก
          }
        }}
      >
        <Tab label="VN001" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF'}} />
        <Tab label="VN002" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF' }} />
        <Tab label="VN003" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF' }} />
        <Tab label="VN004" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF'}} />
        <Tab label="VN005" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF'}} />
      </Tabs> */}

      <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={6}>
          <Card sx={{ textAlign: "center", p: 2 }}>
            <Avatar src="/path/to/image.jpg" sx={{ width: 180, height: 180, margin: "20px" ,textAlign: "left"}} />
            <Grid container spacing={2}>
        <Grid item xs={6} sx={{ textAlign: 'left',paddingLeft:'100px' }}> 
            <Typography variant="body2" fontWeight="bold">
                ชื่อ: นามสกุล:
            </Typography>
            {/* <Typography variant="body2" fontWeight="bold">
                นามสกุล:
            </Typography> */}
            <Typography variant="body2" fontWeight="bold">
                อายุ:
            </Typography>
            {/* <Typography variant="body2">{patient.firstName}</Typography> */}
        </Grid>

    </Grid>

          </Card>
          {/* <Divider sx={{pt:2}}/> */}

          </Grid>

        {/* Vitals Form Section */}
        <Grid item xs={12} sm={6} sx={{pt:'2px'}}>
            {/* <Button variant="contained" size="large"sx={{ display: "block", textAlign: "left" ,bgcolor:'#5698E0',borderRadius: "16px 16px 0 0"}}>Diag & Vital Sign</Button> */}
          {/* <Card sx={{ textAlign: "center", p: 2 }}>
            <CardContent sx={{ textAlign: "center", p: 2 }}> */}
              {/* <Typography variant="h6" sx={{ mb: 2 }}>Diag & Vital Sign</Typography> */}
              <Grid container spacing={2}>

              <Typography variant="body1" sx={{ml:'20px',pt:'18px',pl:'1px',mb:10}}></Typography>
                            <FormGroup sx={{ml:'20px',pt:'10px',pl:'1px'}}>
                            <FormControlLabel control={<Checkbox defaultChecked />} label="Chest X-ray" />
                            <FormControlLabel control={<Checkbox defaultChecked />} label="X-ray" />
                            {/* <FormControlLabel control={<Checkbox defaultChecked />} label="LAB" /> */}
                            </FormGroup>
                {/* <Typography sx={{ml:'20px',pt:'1px'}}>Chief  complaint</Typography> */}
                <TextField fullWidth multiline rows={3} label=""   
                            sx={{ml:'20px',pt:'0px', width: '100%',
                            '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            height: '80px', // เพิ่มความสูงของ input
                            fontSize: '18px', // ขนาดตัวอักษร
                            },}}/>
                <Typography variant="body1" sx={{ml:'20px',pt:'18px',pl:'1px',mb:5}}></Typography>
              <FormGroup sx={{ml:'20px',pt:'10px',pl:'1px'}}>
                            <FormControlLabel control={<Checkbox defaultChecked />} label="Ultrasound" />
                            </FormGroup>
                {/* <Typography sx={{ml:'20px',pt:'1px'}}>Chief  complaint</Typography> */}
                <TextField fullWidth multiline rows={3} label=""   
                            sx={{ml:'20px',pt:'0px', width: '100%',
                            '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            height: '80px', // เพิ่มความสูงของ input
                            fontSize: '18px', // ขนาดตัวอักษร
                            },}}/>
                            <>                  </>
                {/* <Typography sx={{ml:'20px',pt:'1px',mt:2,}}>Laboratary investigation</Typography> */}
                <Typography variant="body1" sx={{ml:'20px',pt:'18px',pl:'1px',mb:10}}></Typography>
                            <FormGroup sx={{ml:'20px',pt:'10px',pl:'1px'}}>
                            <FormControlLabel control={<Checkbox defaultChecked />} label="CBC" />
                            <FormControlLabel control={<Checkbox defaultChecked />} label="BUN,C" />
                            <FormControlLabel control={<Checkbox defaultChecked />} label="Lipid" />
                            <FormControlLabel control={<Checkbox defaultChecked />} label="FBS" />
                            <FormControlLabel control={<Checkbox defaultChecked />} label="DTX" />
                            <FormControlLabel control={<Checkbox defaultChecked />} label="Other" />
                            </FormGroup>

                {/* <Grid item xs={12} textAlign="right">
                  <Button variant="contained" sx={{ backgroundColor: "#BCD8FF", color: "#5BA9FF", fontSize: "1rem",width:'100px', font:'Lato',fontWeight:600 }}>ถัดไป</Button>
                </Grid> */}
              </Grid>
            {/* </CardContent>
          </Card> */}
          <Grid item xs={12} textAlign="right">
          <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1 }}><SaveIcon />บันทึกข้อมูล</Button>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LabandXray;
