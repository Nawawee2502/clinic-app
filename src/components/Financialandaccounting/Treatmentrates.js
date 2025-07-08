import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar,InputAdornment,MenuItem, Tabs, Tab, Divider,Box,Checkbox,IconButton,FormGroup,FormControlLabel,LinearProgress, Grid2 } from "@mui/material";
// import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CheckBox} from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Pagination, Stack } from "@mui/material";

const Treatmentrates = () => {
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


       < Grid container spacing={2}>
        {/* Patient Profile Section */}              
               <Grid item xs={12} sm={15} sx={{mt:4,pr:1,textAlign: "right",width:90}}>
                <Button sx={{textAlign: "right",bgcolor:'#5698E0',color:'#FFFFFF',width:'150px',height:'55px',borderRadius:3,fontWeight:800}} onClick={handleFabClick}><AddIcon sx={{color:'#FFFFFF',fontWeight:600}}/>เพิ่ม</Button>
              </Grid>

              
        <Grid item xs={40} sm={12} sx={{mt:1,textAlign:'center'}}>
            {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
                <Card>
                    <CardContent>
                    <Grid container spacing={2} sx={{mt:1,ml:8}}>
                    {/* Patient Profile Section */}
                    <Grid item xs={12} sm={3}>
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                รหัส
                            </Typography>
                            <TextField
                                size="lg"
                                placeholder="รหัส"
                                sx={{
                                mt: "2px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={4}>
                            <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                            ชื่อการตรวจ
                            </Typography>
                            <TextField
                                size="lg"
                                placeholder="ชื่อการตรวจ"
                                sx={{
                                mt: "2px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={3} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                ราคา
                            </Typography>
                            <TextField
                                size="lg"
                                placeholder="ราคา"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                   
                    </Grid>
          
                    <Grid item xs={12} textAlign="center">
                        <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:3 }}><SaveIcon />บันทึกข้อมูล</Button>
                    </Grid>
                    </CardContent>
                </Card>
               </Grid>
        <Grid item xs={40} sm={10} sx={{mt:3,ml:10,}}>
            {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
                <Card sx={{borderRadius:10}}>
                    <CardContent >
                        {/* <Typography sx={{fontWeight:800}}>ระบบการเงิน/บัญชี</Typography> */}
                        <table style={{ width: '100%', marginTop: '1px',border: '1px solid #AFEEEE',borderRadius:10 }}>
                            <thead style={{ backgroundColor: "#F0F5FF",}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '12px 6px', textAlign: 'left', color:'#696969' }}> <Checkbox sx={{mr:2}} />ลำดับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>รหัส</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>ชื่อการตรวจ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>ราคา</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969',width:'2%', align:"center" }}></th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969',width:'2%', align:"center" }}></th>
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
               {/* <Grid item xs={12} textAlign="right">
          <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1 }}><SaveIcon />บันทึกข้อมูล</Button>
          </Grid> */}
      </Grid>
    </Container>
    
  );


};



export default Treatmentrates;
