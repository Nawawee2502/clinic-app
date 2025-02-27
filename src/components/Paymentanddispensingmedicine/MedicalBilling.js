import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, Tabs, Tab,Box ,Checkbox,IconButton,Drawer,List,ListItem, Divider} from "@mui/material";
import { DatePicker } from "@mui/lab";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from "react-router-dom";
import Receipt from "./Receipt"

const MedicalBilling = () => {

    const [tabIndex, setTabIndex] = useState(0);

    const handleReceiptClick = () => {
      setTabIndex(1); // ไปที่แท็บใบเสร็จ
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
      {/* Patient Queue Bar */}
      <Tabs 
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
      </Tabs>

       {/* Patient Info */}
       <Card sx={{ p: 2, display: "flex", alignItems: "center", mb: 2,width:'75%' }}>
        {/* <Box sx={{ width: 60, height: 60, borderRadius: "50%", bgcolor: "#ddd", mr: 2 }} /> */}
        <Avatar src="/path/to/image.jpg" sx={{ width: 60, height: 60, mr: 2 }} />
        <Box>
          <Typography variant="h6">Demi Wilkinson</Typography>
          <Typography variant="body2">อายุ 22 ปี 9 เดือน</Typography>
        </Box>
      </Card>

      <Grid container spacing={2}>
      

        {/* Vitals Form Section */}
        <Grid item xs={12} sm={4.5}>
            <Button variant="contained" size="large"sx={{ display: "block", textAlign: "left" ,bgcolor:'#5698E0',borderRadius: "16px 16px 0 0"}}>ค่า LAB / X-ray</Button>
            <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} />
          <Card>
            <CardContent>
              {/* <Typography variant="h6" sx={{ mb: 2 }}>Diag & Vital Sign</Typography> */}
              <Grid container spacing={2}  sx={{fontWeight:800,ml:2}}>
              <Typography sx={{fontWeight:800,mt:3,mb:2}}>รายการ</Typography> 
              </Grid>
              <table style={{ width: '100%', marginTop: '1px',border: '1px solid #AFEEEE',borderRadius:10 }}>
                            <thead style={{ backgroundColor: "#F0F5FF",}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '12px 6px', textAlign: 'left', color:'#696969' }}>ลำดับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>รายการ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>ราคา</th>
                                </tr>
                                <tr>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Table data will go here */}
                                <tr >
                                <td style={{ padding: '12px 5px' }}>{ 1}</td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                </tr>
                            </tbody>
                        </table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4.5}>
            <Button variant="contained" size="large"sx={{ display: "block", textAlign: "left" ,bgcolor:'#5698E0',borderRadius: "16px 16px 0 0"}}>ค่าหัตถการ</Button>
            <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} />
          <Card>
            <CardContent>
              {/* <Typography variant="h6" sx={{ mb: 2 }}>Diag & Vital Sign</Typography> */}
              <Grid container spacing={2}  sx={{ml:2}}>
              <Typography sx={{fontWeight:800,mt:3,mb:2}}>รายการ</Typography> 
              <table style={{ width: '90%', marginTop: '1px',border: '1px solid #AFEEEE',borderRadius:10 }}>
                            <thead style={{ backgroundColor: "#F0F5FF",}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '12px 6px', textAlign: 'left', color:'#696969' }}>ลำดับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>รายการ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>ราคา</th>
                                </tr>
                                <tr>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Table data will go here */}
                                <tr >
                                <td style={{ padding: '12px 5px' }}>{ 1}</td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                </tr>
                            </tbody>
                        </table>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={9}>
            <Button variant="contained" size="large"sx={{ display: "block", textAlign: "left" ,bgcolor:'#5698E0',borderRadius: "16px 16px 0 0"}}>ค่ายา/เวชภัณฑ์</Button>
            <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} />
          <Card>
            <CardContent>
              {/* <Typography variant="h6" sx={{ mb: 2 }}>Diag & Vital Sign</Typography> */}
              <Grid container spacing={2}  sx={{fontWeight:800,ml:2,mb:2}}>
              <Typography sx={{fontWeight:800,mt:3}}>รายการ</Typography> 
              </Grid>
              <table style={{ width: '100%', marginTop: '1px',border: '1px solid #AFEEEE',borderRadius:10 }}>
                            <thead style={{ backgroundColor: "#F0F5FF",}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '12px 6px', textAlign: 'left', color:'#696969' }}>ลำดับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>ชื่อยา</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>จำนวน</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>ราคา/หน่วย</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>ราคา</th>
                                </tr>
                                <tr>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Table data will go here */}
                                <tr >
                                <td style={{ padding: '12px 5px' }}>{ 1}</td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                <td style={{ padding: '12px 16px' }}></td>
                                </tr>
                            </tbody>
                        </table>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3} sx={{ mt: -46, mb: 5 }}>
          <Card sx={{ p: 2,width:350,height:610 }}>
            <Typography variant="h6" sx={{color:'#2b69ac'}}>ยอดที่ต้องชำระ</Typography>
            <Divider sx={{bgcolor:'#5BA9FF',mt:1}}/>
            <TextField label="ยอดที่ต้องชำระ" fullWidth margin="normal" />
            <TextField label="ส่วนลด" fullWidth margin="normal" />
            <TextField label="ยอดชำระทั้งหมด" fullWidth margin="normal" />
            <Typography variant="h6" sx={{color:'#2b69ac'}}>ชำระโดย</Typography>
            <Divider sx={{bgcolor:'#5BA9FF',mt:1}}/>
            <TextField label="จำนวนเงินสด" fullWidth margin="normal" />
            <TextField label="โอนเงิน" fullWidth margin="normal" />
            <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px', font:'Lato',fontWeight:600,ml:10,mt:3 }}><SaveIcon />บันทึกข้อมูล</Button>
            </Card>
        </Grid>
      </Grid>
      
     
      {/* </Grid> */}

      
      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="contained" sx={{ bgcolor:"#5698E0",height:40,width:140,borderRadius:2}} onClick={handleReceiptClick} >พิมพ์ใบเสร็จ</Button>
        <Button variant="contained" sx={{ bgcolor:"#2b69ac",height:40,width:140,borderRadius:2}}>พิมพ์ฉลากยา</Button>
        <Button variant="contained" sx={{backgroundColor: "white",color: "#2196F3",border: "2px solid #2196F3","&:hover": { backgroundColor: "#f0f0f0" },borderRadius:2}}>พิมพ์ใบรับรองแพทย์</Button>
      </Box>
    </Container>
  );
};

export default MedicalBilling;
