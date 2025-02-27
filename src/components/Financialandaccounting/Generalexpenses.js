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

const Generalexpenses = () => {
  const [currentPage, setCurrentPage] = useState("list"); // state

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

  if (currentPage === "add") {
    return (
        <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={6}>
          {/* <Divider sx={{pt:2}}/> */}
          <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                    เลขที่เอกสาร
                </Typography>
                <TextField
                    size="lg"
                    placeholder="เลขที่เอกสาร"
                    sx={{
                    mt: "8px",
                    mb:3,
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
          <Grid item xs={12} sm={6}>
                <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                    วันที่รับ
                </Typography>
                <TextField
                    size="lg"
                    placeholder="เลือกวันที่"
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
                        <CalendarTodayIcon color="action" />
                        </InputAdornment>
                    ),
                    }}
                />

          </Grid>
          <Grid item xs={12} sm={6} >
          {/* <Divider sx={{pt:2}}/> */}
          <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                    จ่ายให้
                </Typography>
                <TextField
                    size="lg"
                    placeholder="จ่ายให้"
                    sx={{
                    mt: "8px",
                    mb:3,
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

        {/* Vitals Form Section */}
        <Grid item xs={6} sm={12} sx={{mt:1,pt:'2px'}}>
              <Grid container spacing={2} sx={{pt:'1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>

              <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                    รายการจ่าย
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
              </Grid>

        </Grid>
        <Grid item xs={40} sm={12} sx={{mt:1}}>
            {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
                <Card>
                    <CardContent>
                        <table style={{ width: '100%', marginTop: '24px',border: '1px solid #AFEEEE' }}>
                            <thead style={{ backgroundColor: "#F0F5FF",textAlignLast:'center'}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '12px 6px', textAlign: 'left', color:'#696969' }}> <Checkbox sx={{mr:2}} />ลำดับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>รหัสการจ่าย</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>รายการจ่าย</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>จำนวนเงิน</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>ประเภทการจ่าย</th>
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
                                <td style={{ padding: '12px 5px' ,textAlignLast:'center'}}> <Checkbox sx={{mr:6}} />{ 1}</td>
                                <td style={{ padding: '12px 16px' }}>Dr0001</td>
                                <td style={{ padding: '12px 16px' }}>19/02/2568</td>
                                <td style={{ padding: '12px 16px' }}>john</td>
                                <td style={{ padding: '12px 16px' }}>100$</td>
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
                        <Typography sx={{mt:3,ml:3}}>รวมจ่าย</Typography>
                    {/* </Box> */}
                    </CardContent>
                </Card>
               </Grid>
               <Grid  container justifyContent="space-between" sx={{ mt: 3 }}>
          <Button variant="contained" sx={{ backgroundColor: "white", color: "#2196F3",border: "0.5px solid #2196F3", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1,ml:2 }} onClick={handleBackClick}>ย้อนกลับ</Button>
          <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1 }}><SaveIcon />บันทึกข้อมูล</Button>
          </Grid>
          </Grid>
    );
  }
  

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>

      <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={6}>
          {/* <Divider sx={{pt:2}}/> */}
          <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                    เลขที่เอกสาร
                </Typography>
                <TextField
                    size="lg"
                    placeholder="เลขที่เอกสาร"
                    sx={{
                    mt: "8px",
                    mb:3,
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

        {/* Vitals Form Section */}
        <Grid item xs={12} sm={6} sx={{pt:'2px'}}>
              <Grid container spacing={2}>

              <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                   วันที่
                </Typography>
                <TextField
                    size="lg"
                    placeholder="เลือกวันที่"
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
                        <CalendarTodayIcon color="action" />
                        </InputAdornment>
                    ),
                    }}
                />
               </Grid>
               <Grid item xs={12} sm={6} sx={{mt:4,pr:20,textAlign: "right",width:90}}>
                <Button sx={{textAlign: "right",bgcolor:'#5698E0',color:'#FFFFFF',width:'150px',height:'55px',borderRadius:3,fontWeight:800}} onClick={handleFabClick}><AddIcon sx={{color:'#FFFFFF',fontWeight:600}}/>เพิ่ม</Button>
              </Grid>

              </Grid>
          
        </Grid>
        <Grid item xs={40} sm={12} sx={{mt:10}}>
            {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
                <Card>
                    <CardContent>
                        <Typography sx={{fontWeight:800}}>ระบบการเงิน/บัญชี</Typography>
                        {/* <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}> */}
                        <table style={{ width: '100%', marginTop: '24px',border: '1px solid #AFEEEE' }}>
                            <thead style={{ backgroundColor: "#F0F5FF",}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '12px 6px', textAlign: 'left', color:'#696969' }}> <Checkbox sx={{mr:2}} />ลำดับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>เลขที่เอกสาร</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>วันที่</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>จ่ายให้</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>จำนวนเงิน</th>
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
                                <td style={{ padding: '12px 16px' }}>Dr0001</td>
                                <td style={{ padding: '12px 16px' }}>19/02/2568</td>
                                <td style={{ padding: '12px 16px' }}>john</td>
                                <td style={{ padding: '12px 16px' }}>100$</td>
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
                    </CardContent>
                </Card>
               </Grid>
               <Grid item xs={12} textAlign="right">
          <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1 }}><SaveIcon />บันทึกข้อมูล</Button>
          </Grid>
      </Grid>
    </Container>
    
  );


};



export default Generalexpenses;
