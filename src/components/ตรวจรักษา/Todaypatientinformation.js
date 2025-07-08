import React, { useState } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Box,
  Divider
} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const TodayPatientInformation = () => {
  // ข้อมูลจำลอง (Array)
  const patients = [
    {
      hn: "000001",
      citizenId: "1909805467809",
      firstName: "แอนดิสัน",
      lastName: "ลูปิน",
      age: "20 ปี 9 เดือน",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      hn: "000002",
      citizenId: "2909085467810",
      firstName: "สมชาย",
      lastName: "ใจดี",
      age: "25 ปี 3 เดือน",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
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
    <Box sx={{}}>
      {/* Patient Queue Bar - VN Tabs แบบเดิม */}
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          fontSize: "1.2rem",
          minHeight: 48,
          '& .Mui-selected': {
            background: 'linear-gradient(60deg, #FFFFFF, #FFFFFF)',
            color: 'primary',
          }
        }}
      >
        <Tab label="VN001" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
        <Tab label="VN002" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
        <Tab label="VN003" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
        <Tab label="VN004" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
        <Tab label="VN005" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
        <Tab label="VN006" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
        <Tab label="VN007" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
        <Tab label="VN008" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
        <Tab label="VN009" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
        <Tab label="VN010" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
        <Tab label="VN011" sx={{ fontSize: "1.1rem", px: 3, minHeight: 48, color: '#5BA9FF' }} />
      </Tabs>

      <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: "center", p: 2 }}>
            <Avatar
              src={patient.avatar}
              sx={{
                width: 160,
                height: 160,
                margin: "auto",
                mb: 2
              }}
            />
            <Divider sx={{ color: '#D0D5DD', mb: '16px' }} />

            <Grid container spacing={2}>
              <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold">
                  HN
                </Typography>
                <Typography variant="body2">{patient.hn}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'left', paddingRight: '1px' }}>
                <Typography variant="body2" fontWeight="bold">
                  เลขบัตรประชาชน
                </Typography>
                <Typography variant="body2">{patient.citizenId}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold">
                  ชื่อ
                </Typography>
                <Typography variant="body2">{patient.firstName}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'left', paddingRight: '1px' }}>
                <Typography variant="body2" fontWeight="bold">
                  นามสกุล
                </Typography>
                <Typography variant="body2">{patient.lastName}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold">
                  อายุ
                </Typography>
                <Typography variant="body2">{patient.age}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ color: '#D0D5DD', mb: '16px', mt: '16px' }} />

          </Box>
        </Grid>

        {/* Vitals Form Section */}
        <Grid item xs={12} sm={8}>
          <Box
            variant="contained"
            size="large"
            sx={{
              display: "block",
              textAlign: "center",
              width: "30%",
              bgcolor: '#5698E0',
              borderRadius: "16px 16px 0 0",
              fontSize: "18px",
              fontWeight: 600,
              py: 1.5,
              color: 'white'
            }}
          >
            Diag & Vital Sign
          </Box>

          <Box sx={{ borderRadius: "0 16px 16px 16px", p: '24px', border: '1px solid #D0D5DD' }}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                    VN
                  </Typography>
                  <TextField
                    placeholder="00001"
                    defaultValue="00001"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                    Date
                  </Typography>
                  <TextField
                    placeholder="16-12-2022"
                    defaultValue="16-12-2022"
                    size="small"
                    InputProps={{
                      endAdornment: <CalendarTodayIcon sx={{ color: "#ccc", fontSize: 20 }} />
                    }}
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                    Weight(kg)
                  </Typography>
                  <TextField
                    placeholder="Weight(kg)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                    Hight(cm)
                  </Typography>
                  <TextField
                    placeholder="Hight(cm)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                    BT (Celsius)
                  </Typography>
                  <TextField
                    placeholder="BT (Celsius)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                    BP (mmHg)
                  </Typography>
                  <TextField
                    placeholder="BP (mmHg)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                    RR (bpm)
                  </Typography>
                  <TextField
                    placeholder="RR (bpm)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                    PR (min)
                  </Typography>
                  <TextField
                    placeholder="PR (min)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                    SpO2 (%)
                  </Typography>
                  <TextField
                    placeholder="SpO2 (%)"
                    size="small"
                    sx={{
                      mt: '8px',
                      width: '100%',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                    อาการเบื้องต้น
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="กรอกอาการเบื้องต้น"
                    sx={{
                      mt: '8px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#BCD8FF",
                      color: "#2B69AC",
                      fontSize: "1rem",
                      width: '100px',
                      font: 'Lato',
                      fontWeight: 600
                    }}
                  >
                    ถัดไป
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TodayPatientInformation;