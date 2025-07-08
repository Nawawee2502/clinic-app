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


const Druginformation = () => {
  const [textFields, setTextFields] = useState([""]); // เริ่มต้นมี 1 ฟิลด์

  const handleAddTextField = () => {
      setTextFields([...textFields, ""]); // เพิ่มฟิลด์ใหม่เข้าไป
    };
    
  const [currentPage, setCurrentPage] = useState("list"); // state
  const [page, setPage] = useState(1); // ✅ เพิ่มตัวแปร page และ setPage
  const totalPages = 4; // ✅ กำหนดค่าจำนวนหน้าทั้งหมด

  const handleFabClick = () => {
    setCurrentPage("add"); // เปลี่ยนหน้าเป็น 'add'
  };

  const handleBackClick = () => {
    setCurrentPage("list"); // กลับไปยังหน้า 'list'
  };

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

      <Grid container spacing={2}>
        {/* Patient Profile Section */}              
               <Grid item xs={12} sm={15} sx={{mt:4,pr:1,textAlign: "right",width:90}}>
                <Button sx={{textAlign: "right",bgcolor:'#5698E0',color:'#FFFFFF',width:'150px',height:'55px',borderRadius:3,fontWeight:800}} onClick={handleAddTextField}><AddIcon sx={{color:'#FFFFFF',fontWeight:600}}/>เพิ่ม</Button>
              </Grid>

              {textFields.map((value, index) => (
        <Grid item xs={40} sm={12} sx={{mt:1}}>
            {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
                <Card>
                    <CardContent>
                    <Grid container spacing={2}>
                    {/* Patient Profile Section */}
                    <Grid item xs={12} sm={6}>
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                รหัสยา
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="รหัสยา"
                                sx={{
                                mt: "2px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6}>
                            <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                            ชื่อยา / เวชภัณฑ์
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ชื่อยา"
                                sx={{
                                mt: "2px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                ชื่ออื่น
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ชื่ออื่น"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                            หน่วยใหญ่
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="หน่วยใหญ่"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                หน่วยเล็ก
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="หน่วยเล็ก"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                        จำนวนการแปลง
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="จำนวนการแปลง"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                ราคาขาย
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ราคาขาย"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                แจ้งเตือนขั้นตํ่า
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="แจ้งเตือนขั้นตํ่า"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                วิธีใช้
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="วิะีใช้"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                เวลา
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="รับจาก"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                ก่อนหลัง
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ก่อนหลัง"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                ข้อควรระวัง
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ข้อควรระวัง"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                สรรพคุณ
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="สรรพคุณ"
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
          
                    <Grid item xs={12} textAlign="right">
                        <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1 }}><SaveIcon />บันทึกข้อมูล</Button>
                    </Grid>
                    </CardContent>
                </Card>
               </Grid>
               ))}
               <Grid item xs={40} sm={12} sx={{mt:1}}>
            {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
                <Card>
                    <CardContent>
                        <table style={{ width: '100%', marginTop: '24px',border: '1px solid #AFEEEE',width:'100%' }}>
                            <thead style={{ backgroundColor: "#F0F5FF",textAlignLast:'center'}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}> <Checkbox sx={{mr:2}} />ลำดับ</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}>ชื่อยา / เวชภัณฑ์</th>
                                    <th style={{ padding: '10px 20px', textAlign: 'left', color:'#696969' }}>ชื่ออื่น</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}>หน่วยใหญ่</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}>หน่วยเล็ก</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}>จำนวนการแปลง</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}>ราคาขาย</th>
                                    <th style={{ padding: '10px 6px', textAlign: 'left', color:'#696969' }}>แจ้งเตือนขั้นตํ่า</th>
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
      </Grid>
    </Container>
    
  );


};



export default Druginformation;
