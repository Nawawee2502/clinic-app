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
import { AccountBalanceWallet, MonetizationOn, Payment } from "@mui/icons-material";

const Expenses = () => {
    const summaryData = [
    { icon: <AccountBalanceWallet sx={{ fontSize: 40, color: "#5698E0" }} />, label: "รายการทั้งหมด", details: "28 รายการ" },
    { icon: <MonetizationOn sx={{ fontSize: 40, color: "#5698E0" }} />, label: "รายจ่ายทั้งหหมด", details: "฿12,750" },
    // { icon: <Payment sx={{ fontSize: 40, color: "#5698E0" }} />, label: "ประเภทการจ่าย", payments: [{ type: "โอนเงิน", count: 10, amount: "฿12,500" }, { type: "เงินสด", count: 20, amount: "฿5,400" }] },
    ];

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



  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>

      <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={3.5} sx={{ml:15}}>
          {/* <Divider sx={{pt:2}}/> */}
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

        {/* Vitals Form Section */}
        <Grid item xs={12} sm={6} sx={{pt:'2px'}}>
              <Grid container spacing={2}>

              <Grid item xs={12} sm={6}>
              <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                   ถึงวันที่
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
                <Button sx={{textAlign: "right",bgcolor:'#5698E0',color:'#FFFFFF',width:'150px',height:'55px',borderRadius:3,fontWeight:800}} >ค้นหา</Button>
              </Grid>
              {/* <Select/>สัปดาห์นี้</elect> */}
            <Grid item xs={4} sx={{ml:55}}>
                    <Box component="select"
                                    sx={{
                                        mt: '8px',
                                        textAlign:'left',
                                        width: '100%',
                                        height: '45px',
                                        borderRadius: '10px',
                                        padding: '0 14px',
                                        border: '1px solid rgba(0, 0, 0, 0.23)',
                                        fontSize: '16px',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: '#754C27',
                                        },
                                        '& option': {
                                            fontSize: '16px',
                                        },
                                    }}
                                >
                                    <option value="">สัปดาห์นี้</option>
                                   
                    </Box>
               </Grid>

              </Grid>
              
        </Grid>
        <Grid item xs={12} sm={3.5} sx={{mr:55}}>
          <Typography sx={{fontWeight:600,}}>สรุปรายจ่าย</Typography>
          </Grid>
        <Grid container spacing={2} sx={{ mt: 1 }}>
      {summaryData.map((item, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <Card sx={{ textAlign: "center", height: 200, bgcolor: "#FFFFFF", p: 2, borderRadius: 3 }}>
            <Box display="flex" alignItems="center">
              {item.icon}
              <Typography variant="body1" fontWeight="bold" sx={{ ml: 1 }}>
                {item.label}
              </Typography>
            </Box>
            {item.payments ? (
              item.payments.map((pay, idx) => (
                <Typography key={idx} variant="body2" sx={{ mt: idx === 0 ? 2 : 1 }}>
                  {pay.type} {pay.count} รายการ <strong>{pay.amount}</strong>
                </Typography>
              ))
            ) : (
              <>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
                {item.details}
                </Typography>
                {/* <Typography variant="body2" color="textSecondary">
                  {item.details}
                </Typography> */}
              </>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
                  {/* </Grid> */}
       
               {/* <Grid item xs={12} textAlign="right">
          <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1 }}><SaveIcon />บันทึกข้อมูล</Button>
          </Grid> */}
      </Grid>
    </Container>
    
  );


};



export default Expenses;
