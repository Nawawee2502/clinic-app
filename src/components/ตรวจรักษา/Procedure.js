import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, InputAdornment, MenuItem, Tabs, Tab, Divider, Box, Checkbox, IconButton, FormGroup, FormControlLabel, LinearProgress, Grid2 } from "@mui/material";
// import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CheckBox } from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Procedure = () => {



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
          {/* <Divider sx={{pt:2}}/> */}

        </Grid>

        {/* Vitals Form Section */}
        <Grid item xs={12} sm={7} sx={{ pt: '2px' }}>
          <Grid container spacing={2}>


            <Grid item xs={12}>
              <TextField
                size="small"
                placeholder="ค้นหาหัตถการ"
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

          </Grid>

          {/* </Grid>
        <Grid item xs={40} sm={12} sx={{mt:10}}> */}
          <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, mt: 3,  borderRadius: '10px 10px 0px 0px' }} />
          <Card sx={{ }}>
            <CardContent>
              <Typography sx={{ fontWeight: 800, fontSize: '24px' }}>รายการทำหัตถการ</Typography>
              {/* <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}> */}
              <table style={{ width: '100%', marginTop: '24px', border: '1px solid #AFEEEE', textAlign: 'center' }}>
                <thead style={{ backgroundColor: "#F0F5FF", }}>
                  <tr>
                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#696969', width: 150 }}> <Checkbox sx={{ mr: 2 }} />ลำดับ</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#696969' }}>รายการทำหัตถการ</th>
                  </tr>
                  <tr>
                    {/* <td colSpan="15">
                                        <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                    </td> */}
                  </tr>
                </thead>
                <tbody>
                  {/* Table data will go here */}
                  <tr >
                    <td style={{ padding: '12px 5px' }}> <Checkbox sx={{ mr: 8 }} />{1}</td>
                    <td style={{ padding: '12px 16px' }}></td>
                  </tr>
                </tbody>
              </table>
              {/* </Box> */}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} textAlign="right">
          <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "#FFFFFF", fontSize: "1rem", width: '150px', height: '50px', font: 'Lato', fontWeight: 600, mt: 1 }}><SaveIcon />บันทึกข้อมูล</Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Procedure;
