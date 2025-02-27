import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar,InputAdornment,MenuItem, Tabs, Tab, Divider,Box,Checkbox,IconButton,FormGroup,FormControlLabel,LinearProgress, Grid2 } from "@mui/material";
import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import { CheckBox} from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const Doctor = () => {
    const [currentWeek, setCurrentWeek] = useState(0);

    const handleNext = () => {
        setCurrentWeek((prev) => prev + 1);
      };
    
      const handlePrevious = () => {
        setCurrentWeek((prev) => (prev > 0 ? prev - 1 : 0));
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
        <Grid item xs={12} sm={6}>
        <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                    ชื่อแพทย์
                </Typography>
                <TextField
                    size="lg"
                    placeholder="ชื่อแพทย์"
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
        <Grid item xs={40} sm={6} sx={{pt:'2px'}}>
              <Grid container spacing={2}>
                

              <Grid item xs={12}>
              <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                    เลือกเดือน
                </Typography>
                <TextField
                    size="lg"
                    placeholder="เลือกเดือน"
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
              
              </Grid>
          
        {/* </Grid>
        <Grid item xs={40} sm={12} sx={{mt:10}}> */}
            <Divider sx={{ borderColor: '#5698E0', borderWidth: 3,mt:3,width:'600px',borderRadius:'10px 10px 0px 0px' }} />
                <Card sx={{width:'600px'}}>
                    <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center",mb:2}} >
                            <Button  size="small" sx={{borderRadius:'50px',bgcolor:'#F0F5FF',fontSize: "0.7rem", padding: "8px 8px", minWidth: "unset",mr:2}} startIcon={<NavigateBeforeIcon  />} >
                            
                            </Button>
                            {/* <span sx={{textAlign:'center',fontWeight:800,color:'#5698E0',fontSize:'24px'}}>มกราคม</span> */}
                            <Typography sx={{textAlign:'center',fontWeight:800,color:'#5698E0',fontSize:'24px'}}>มกราคม</Typography>
                            <Button  size="small" sx={{borderRadius:'50px',bgcolor:'#F0F5FF',fontSize: "0.7rem", padding: "8px 8px", minWidth: "unset",ml:2,}} endIcon={<NavigateNextIcon />}></Button>
                        </Box>
                        {/* <>Order ยา</> */}
                        {/* <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}> */}
                        <table style={{ width: '100%', marginTop: '24px',border: '1px solid #AFEEEE',textAlign:'center' }}>
                            <thead style={{ background: "linear-gradient(to bottom, #5BA9FF 0%, #F0F5FF 100%)",height:80,border: '1px solid #AFEEEE' }}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969',width:150 }}> <Checkbox sx={{mr:2}} />ลำดับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969',width:150 }}> <Checkbox sx={{mr:2}} />ลำดับ</th> */}
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color:'#696969',width:150 }}><div>จันทร์</div><div>12</div></th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color:'#696969',width:150  }}><div>อังคาร</div><div>13</div></th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color:'#696969',width:150  }}><div>พุธ</div><div>14</div></th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color:'#696969',width:150  }}><div>พฤหัส</div><div>15</div></th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center', color:'#696969',width:150  }}><div>ศุกร์</div><div>16</div></th>
                                </tr>
                                <tr>
                                    {/* <td colSpan="15">
                                        <Divider sx={{ width: '100%', color: '#754C27', border: '1px solid #754C27' }} />
                                    </td> */}
                                </tr>
                            </thead>
                            <tbody  style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black" }}>
                                {/* Table data will go here */}
                                <tr >
                                {/* <td style={{ padding: '12px 5px' }}> <Checkbox sx={{mr:8}} />{ 1}</td> */}
                                <td style={{ padding: '12px 16px',height:60, }}>10 เคส</td>
                                <td style={{ padding: '12px 16px' }}>10 เคส</td>
                                <td style={{ padding: '12px 16px' }}>10 เคส</td>
                                <td style={{ padding: '12px 16px' }}>10 เคส</td>
                                <td style={{ padding: '12px 16px' }}>10 เคส</td>
                                </tr>
                            </tbody>
                            </table>
                    {/* </Box> */}
                    <Box sx={{mt:4}}>
                                <Button sx={{textAlign:'left',border: '1px solid #DCDCDC',borderRadius:2}} onClick={handlePrevious} startIcon={<ArrowBackIcon C />} disabled={currentWeek === 0}>
                                Previous
                                </Button>
                                <Button  sx={{textAlign:'right',ml:45,border: '1px solid #DCDCDC',borderRadius:2}} onClick={handleNext} endIcon={<ArrowForwardIcon />}>Next</Button>
                    </Box>
                    </CardContent>
                </Card>
               </Grid>
               {/* <Grid item xs={12} textAlign="right">
                <Button variant="contained" sx={{ backgroundColor: "red", color: "FFFFFF", fontSize: "1rem",width:'100px',height:'50px', font:'Lato',fontWeight:600,mt:1,mr:5,borderRadius:3 }}>ยกเลิก</Button>
                <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1,mr:5 }}><SaveIcon />บันทึกข้อมูล</Button>
                <Button variant="contained" sx={{ backgroundColor: "#FFFFFF", color: "#5698E0", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1,mr:5, border: '1px solid #2196F3','&:hover': { backgroundColor: '#f0f0f0' } }}>พิมพ์ใบนัด</Button>
          </Grid> */}
      </Grid>
    </Container>
  );
};

export default Doctor;
