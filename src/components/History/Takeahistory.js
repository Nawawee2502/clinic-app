import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, Tabs, Tab, InputAdornment, Grid2 } from "@mui/material";
// import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

const Takeahistory = () => {

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
        <Tab label="VN006" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF'}} />
        <Tab label="VN007" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF' }} />
        <Tab label="VN008" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF' }} />
        <Tab label="VN009" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF'}} />
        <Tab label="VN010" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF'}} />
        <Tab label="VN011" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48 ,color:'#5BA9FF'}} />
      </Tabs> */}
      <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
        <TextField
          size="lg"
          placeholder="ค้นหาชื่อผู้ป่วย/เบอร์โทรศัพท์"
          sx={{
            mt: "8px",
            mb: 3,
            width: "60%",
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
        <Button sx={{ textAlign: "right", bgcolor: '#5698E0', color: '#FFFFFF', width: '150px', height: '55px', borderRadius: 3, fontWeight: 800, mt: 1, ml: 3 }} ><AddIcon sx={{ color: '#FFFFFF', fontWeight: 600 }} />เพิ่มคนไข้</Button>
      </Grid>

      {/* </Grid> */}
      <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: "center", p: 2 }}>
            <Avatar src="/path/to/image.jpg" sx={{ width: 160, height: 160, margin: "auto" }} />
            <Grid container spacing={2}>
              <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold">
                  HN
                </Typography>
                <Typography variant="body2">{patient.hn}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'left', paddingRight: '1px' }}>
                <Typography variant="body2" fontWeight="bold">
                  เลขบัตรประชาชน:
                </Typography>
                <Typography variant="body2">{patient.citizenId}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold">
                  ชื่อ:
                </Typography>
                <Typography variant="body2">{patient.firstName}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'left', paddingRight: '1px' }}>
                <Typography variant="body2" fontWeight="bold">
                  นามสกุล:
                </Typography>
                <Typography variant="body2">{patient.lastName}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold">
                  อายุ:
                </Typography>
                <Typography variant="body2">{patient.age}</Typography>
              </Grid>
            </Grid>


          </Card>

        </Grid>

        {/* Vitals Form Section */}
        <Grid item xs={12} sm={8}>
          <Button variant="contained" size="large" sx={{ display: "block", textAlign: "left", bgcolor: '#5698E0', borderRadius: "16px 16px 0 0" }}>Diag & Vital Sign</Button>
          <Card>
            <CardContent>
              {/* <Typography variant="h6" sx={{ mb: 2 }}>Diag & Vital Sign</Typography> */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}> VN</Typography>
                  <TextField
                    placeholder="VN"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}> Date</Typography>
                  <TextField
                    placeholder="Date"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }} />
                </Grid>
                {/* <Grid item xs={6}><DatePicker label="Date" value={new Date()} renderInput={(params) => <TextField fullWidth {...params} />} /></Grid> */}
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>Weight(kg)</Typography>
                  <TextField
                    placeholder="Weight(kg)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}> Hight(cm)</Typography>
                  <TextField
                    placeholder=" Hight(cm)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>BT (Celsius)</Typography>
                  <TextField
                    placeholder="BT (Celsius)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>BP (mmHg)</Typography>
                  <TextField
                    placeholder="BP (mmHg)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>RR (bpm)</Typography>
                  <TextField
                    placeholder="RR (bpm)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>PR (min)</Typography>
                  <TextField
                    placeholder="PR (min)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>SpO2 (%)</Typography>
                  <TextField
                    placeholder="SpO2 (%)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>อาการเบื้องต้น</Typography>
                  <TextField fullWidth multiline rows={3} label="อาการเบื้องต้น" /></Grid>
                <Grid item xs={12} textAlign="right">
                  <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem", width: '150px', font: 'Lato', fontWeight: 600 }}><SaveIcon />บันทึกข้อมูล</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Takeahistory
