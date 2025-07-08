import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, Tabs, Tab, Divider, Box, Checkbox, FormGroup, FormControlLabel, LinearProgress } from "@mui/material";
import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import { CheckBox } from "@mui/icons-material";

const Medicalhistory = () => {

  const vitalsData = [
    { label: "Blood Pressure", value: 30, display: "141/90 mmHg" },
    { label: "Heart Rate", value: 30, display: "75 bpm" },
    // { label: "Body Height", value: 30, display: "170 cm" },
    // { label: "Body Weight", value: 30, display: "65 kg" },
  ];

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
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={5}>
          <Card sx={{ p: 3, mb: 3, border: 'none', boxShadow: 1 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Avatar
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                  sx={{ width: 120, height: 120, mx: "auto" }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                    Demi Wilkinson
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    อายุ 22 ปี 9 เดือน
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between',
                  gap: 2
                }}>
                  <Typography variant="body1" fontWeight="600" sx={{
                    bgcolor: '#E9F2FF',
                    color: 'black',
                    p: 1,
                    borderRadius: 1,
                    textAlign: 'center'
                  }}>
                    VN021202
                  </Typography>
                  <Typography variant="body1" fontWeight="600" sx={{
                    bgcolor: '#E9F2FF',
                    color: 'black',
                    p: 1,
                    borderRadius: 1,
                    textAlign: 'center'
                  }}>
                    HN000001
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
          <Divider sx={{ pt: 2 }} />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {vitalsData.map((item, index) => (
              <React.Fragment key={index}>
                <Grid item xs={12} sm={6}>
                  <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                    <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {item.value}%
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={item.value}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#e0e0e0',
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: "#1976d2",
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body1" fontWeight="600">
                      {item.display}
                    </Typography>
                  </Card>
                </Grid>
                {index === 0 && (
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                      <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                        Temperature
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {item.value}%
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={item.value}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#e0e0e0',
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: "#1976d2",
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="body1" fontWeight="600">
                        {item.temp}
                      </Typography>
                    </Card>
                  </Grid>
                )}
                {index === 1 && (
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ p: 2, bgcolor: "#E9F2FF", height: 140, boxShadow: 'none' }}>
                      <Typography variant="body1" fontWeight="600" sx={{ mb: 2 }}>
                        Height
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {item.value}%
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={item.value}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#e0e0e0',
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: "#1976d2",
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="body1" fontWeight="600">
                        {item.height}
                      </Typography>
                    </Card>
                  </Grid>
                )}
              </React.Fragment>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} sm={7} sx={{}}>
          <Grid container spacing={2}>
            <Typography sx={{ ml: '20px', pt: '1px' }}>Chief  complaint</Typography>
            <TextField
              size="lg"
              //    placeholder="เบอร์โทรศัพท์"
              sx={{
                mt: '8px',
                ml: '25px',
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }} />

            <Typography sx={{ ml: '20px', pt: '1px', mt: 2 }}>Present ill</Typography>
            <TextField fullWidth multiline rows={3} label=""
              sx={{
                ml: '20px', pt: '1px', width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  height: '200px', // เพิ่มความสูงของ input
                  fontSize: '18px', // ขนาดตัวอักษร
                },
              }} />

            <Typography sx={{ ml: '20px', pt: '1px', mt: 2 }}>Physical Examination</Typography>
            <TextField fullWidth multiline rows={3} label=""
              sx={{
                ml: '20px', pt: '1px', width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  height: '200px', // เพิ่มความสูงของ input
                  fontSize: '18px', // ขนาดตัวอักษร
                },
              }} />
            <Typography variant="body1" sx={{ ml: '20px', pt: '18px', pl: '1px', mb: 20 }}>Ix:</Typography>
            <FormGroup sx={{ ml: '20px', pt: '10px', pl: '1px' }}>
              <FormControlLabel control={<Checkbox />} label="N/A" />
              <FormControlLabel control={<Checkbox />} label="Imaging" />
              <FormControlLabel control={<Checkbox />} label="LAB" />
            </FormGroup>

            <Typography sx={{ ml: '-140px', pt: '60px', mt: 15, pl: '1px' }}>Plan</Typography>
            <TextField fullWidth multiline rows={3} label=""
              sx={{
                ml: '20px', pt: '0px', width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  height: '80px', // เพิ่มความสูงของ input
                  fontSize: '18px', // ขนาดตัวอักษร
                },
              }} />

          </Grid>
          <Grid item xs={12} textAlign="right">
            <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "#FFFFFF", fontSize: "1rem", width: '150px', height: '50px', font: 'Lato', fontWeight: 600, mt: 1 }}><SaveIcon />บันทึกข้อมูล</Button>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Medicalhistory;
