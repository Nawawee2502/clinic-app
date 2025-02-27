import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar,InputAdornment,MenuItem, Tabs, Tab, Divider,Box,Checkbox,IconButton,FormGroup,FormControlLabel,LinearProgress, Grid2 } from "@mui/material";
import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CheckBox} from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Pagination, Stack } from "@mui/material";

const Drugstockreport = () => {
  const [currentPage, setCurrentPage] = useState("list"); // state
  const [page, setPage] = useState(1); // ✅ เพิ่มตัวแปร page และ setPage
  const totalPages = 4; // ✅ กำหนดค่าจำนวนหน้าทั้งหมด

  const handleChange = (event, value) => {
    setPage(value);
  };

  const handleFabClick = () => {
    setCurrentPage("add"); // เปลี่ยนหน้าเป็น 'add'
  };

  const handleBackClick = () => {
    setCurrentPage("list"); // กลับไปยังหน้า 'list'
  };
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
        <Grid item xs={12} sm={3}>
          {/* <Divider sx={{pt:2}}/> */}
          <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                    วัน
                </Typography>
                <TextField
                    size="lg"
                    placeholder="วัน"
                    sx={{
                    mt: "8px",
                    mb:3,
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                    },
                    }}
                />

          </Grid>
          <Grid item xs={12} sm={5}>
          {/* <Divider sx={{pt:2}}/> */}
          <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                    เดือน
                </Typography>
                <TextField
                    size="lg"
                    placeholder="เดือน"
                    sx={{
                    mt: "8px",
                    mb:3,
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                    },
                    }}
                />

          </Grid>
          <Grid item xs={12} sm={4}>
          {/* <Divider sx={{pt:2}}/> */}
          <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                    ปี
                </Typography>
                <TextField
                    size="lg"
                    placeholder="ปี"
                    sx={{
                    mt: "8px",
                    mb:3,
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                    },
                    }}
                />

          </Grid>

        <Grid item xs={40} sm={12} sx={{mt:10}}>
            {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
                <Card>
                    <CardContent>
                        <Typography sx={{fontWeight:800}}>รายงานสต็อกยา/เวชภัณฑ์</Typography>
                        {/* <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}> */}
                        <table style={{ width: '100%', marginTop: '24px',border: '1px solid #AFEEEE' }}>
                            <thead style={{ backgroundColor: "#F0F5FF",}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '12px 6px', textAlign: 'left', color:'#696969' }}> <Checkbox sx={{mr:2}} />ลำดับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>รหัสยา/เวชภัณฑ์</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>ชื่อยา/เวชภัณฑ์</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>หน่วยนับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>จำนวนคงเหลือ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>รวมเงิน</th>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969',width:'2%', align:"center" }}></th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969',width:'2%', align:"center" }}></th> */}
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
                                <td style={{ padding: '12px 5px' }}> <Checkbox sx={{mr:2}} />{ 1}</td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                {/* <td style={{ padding: '12px 16px' ,width:'2%', align:"center"}}> <IconButton
                                    color="danger"
                                    size="md"
                                    //   onClick={() => handleDelete(row.refno)}
                                    sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                    >
                                    <EditIcon sx={{ color: '#5698E0' }} />
                                    </IconButton></td>
                                <td style={{ padding: '12px 16px' ,width:'2%', align:"center"}}> <IconButton
                                    color="danger"
                                    size="md"
                                    //   onClick={() => handleDelete(row.refno)}
                                    sx={{ border: '1px solid #F62626', borderRadius: '7px' }}
                                    >
                                    <DeleteIcon sx={{ color: '#F62626' }} />
                                    </IconButton></td> */}
                                </tr>
                            </tbody>
                        </table>
                    {/* </Box> */}
                    <Stack spacing={2} direction="row" justifyContent="right"sx={{mt:3}} >
                    <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={handleChange} 
                        shape="rounded"
                        color="primary"
                        sx={{textAlign:'right'}}
                    />
                    </Stack>
                    </CardContent>
                </Card>
               </Grid>
      </Grid>
    </Container>
    
  );


};



export default Drugstockreport;
