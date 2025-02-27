import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar,InputAdornment,MenuItem, Tabs, Tab, Divider,Box,Checkbox,IconButton,FormGroup,FormControlLabel,LinearProgress, Grid2 } from "@mui/material";
import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CheckBox} from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Pagination, Stack } from "@mui/material";

const Personnelsystem = () => {
  const [page, setPage] = useState(1); // ✅ เพิ่มตัวแปร page และ setPage
  const totalPages = 4; // ✅ กำหนดค่าจำนวนหน้าทั้งหมด
  
  const handleChange = (event, value) => {
    setPage(value);
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
                <Grid item xs={6} sm={12} sx={{mt:1,pt:'2px'}}>
              <Grid container spacing={2} sx={{pt:'1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>

              <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                    ค้นหาพนักงาน
                </Typography>
                <TextField
                    size="lg"
                    placeholder="ค้นหา"
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
               <Button sx={{textAlign: "right",bgcolor:'#5698E0',color:'#FFFFFF',width:'150px',height:'55px',borderRadius:3,fontWeight:800,mt:5.5,ml:3}} ><AddIcon sx={{color:'#FFFFFF',fontWeight:600}}/>เพิ่ม</Button>
              </Grid>
              </Grid>

                <Card sx={{ p: 3, textAlign: "center" }}>
                <Grid container spacing={3}>
                    {/* Avatar + ปุ่มแก้ไขรูปภาพ */}
                    <Grid item xs={12} sm={4}>
                    <Card sx={{ textAlign: "center", p: 2 }}>
                        <Avatar
                        src="/path/to/image.jpg"
                        sx={{ width: 180, height: 180, margin: "20px auto" }}
                        />
                        <Button
                        variant="contained"
                        size="medium"
                        sx={{
                            mt: 1,
                            backgroundColor: "white",
                            color: "#2196F3",
                            border: "2px solid #2196F3",
                            "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                        >
                        แก้ไขรูปภาพ
                        </Button>
                    </Card>
                    </Grid>

                    {/* ฟอร์มกรอกข้อมูล */}
                    <Grid item xs={12} sm={8}>
                    <Grid container spacing={2}>
                        {[
                        { label: "รหัสพนักงาน", placeholder: "รหัสพนักงาน" },
                        { label: "ชื่อพนักงาน", placeholder: "ชื่อ" },
                        { label: "นามสกุล", placeholder: "นามสกุล" },
                        { label: "เลขประจำตัว", placeholder: "เลขประจำตัว" },
                        { label: "ที่อยู่", placeholder: "ที่อยู่" },
                        { label: "ตำแหน่ง", placeholder: "ตำแหน่ง" },
                        { label: "เงินเดือน", placeholder: "เงินเดือน" },
                        ].map((field, index) => (
                        <Grid item xs={12} key={index}>
                            <Typography
                            sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}
                            >
                            {field.label}
                            </Typography>
                            <TextField
                            size="small"
                            placeholder={field.placeholder}
                            sx={{
                                mt: "8px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                },
                            }}
                            />
                        </Grid>
                        ))}
                    </Grid>
                    </Grid>

                    {/* ปุ่มบันทึก */}
                    <Grid item xs={12} textAlign="right">
                    <Button
                        variant="contained"
                        sx={{
                        backgroundColor: "#5698E0",
                        color: "#FFFFFF",
                        fontSize: "1rem",
                        width: "150px",
                        height: "50px",
                        fontFamily: "Lato",
                        fontWeight: 600,
                        mt: 1,
                        }}
                    >
                        <SaveIcon /> บันทึกข้อมูล
                    </Button>
                    </Grid>
                </Grid>
                </Card>

      <Grid item xs={40} sm={12} sx={{mt:5}}>
            {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
                <Card>
                    <CardContent>
                        <table style={{ width: '100%', marginTop: '5px',border: '1px solid #AFEEEE',width:'100%' }}>
                            <thead style={{ backgroundColor: "#F0F5FF",textAlignLast:'center'}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}> <Checkbox sx={{mr:2}} />ลำดับ</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}>ชื่อ</th>
                                    <th style={{ padding: '10px 20px', textAlign: 'left', color:'#696969' }}>นามสกุล</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}>เลขประจำตัว</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}>ที่อยู่</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}>ตำแหน่ง</th>
                                    <th style={{ padding: '10px 16px', textAlign: 'left', color:'#696969',width:'10%' }}>วิธีใช้</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969',width:'2%', align:"center" }}></th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969',width:'2%', align:"center" }}></th>
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
                                <td style={{ padding: '12px 5px' ,textAlignLast:'center'}}> <Checkbox sx={{mr:6}} />{ 1}</td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' ,width:'2%', align:"center"}}> <IconButton
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
                                    </IconButton></td>
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
    </Container>
  );
  
};

export default Personnelsystem;
