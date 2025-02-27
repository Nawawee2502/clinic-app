import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar,InputAdornment, Tabs, Tab, Divider,Box,Checkbox,FormGroup,FormControlLabel,LinearProgress, Grid2 } from "@mui/material";
import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { CheckBox} from "@mui/icons-material";

const DxandTreatment = () => {


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
              <Grid container spacing={2}>

              <Grid item xs={8}>
              <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                    Dx
                </Typography>
                <TextField
                    size="small"
                    placeholder="ค้นหา Dx"
                    sx={{
                    mt: "8px",
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                    },
                    }}
                    InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                        <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                    }}
                />
               </Grid>
               <Grid item xs={4}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                       ICD10
                  </Typography>
                    <TextField 
                        size="small"
                        placeholder="ICD10"
                        sx={{mt: '8px', width: '100%',
                            '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',},}} />
               </Grid>
                              
                                                      
                <Typography sx={{ml:'20px',pt:'1px',mt:2}}>สรุป Treatment</Typography>
                       <TextField fullWidth multiline rows={3} label=""   
                            sx={{ml:'20px',pt:'1px', width: '100%',
                            '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            height: '500px', // เพิ่มความสูงของ input
                            fontSize: '18px', // ขนาดตัวอักษร
                            },}}/>

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

export default DxandTreatment;
