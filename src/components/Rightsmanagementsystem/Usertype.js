import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography,Drawer, Avatar,InputAdornment,MenuItem, Tabs, Tab, Divider,Box,Checkbox,IconButton,FormGroup,FormControlLabel,LinearProgress, Grid2 } from "@mui/material";
import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CheckBox} from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { AccountBalanceWallet, MonetizationOn, Payment } from "@mui/icons-material";
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { Pagination, Stack } from "@mui/material";

const Usertype = () => {
    const [openDrawer, setOpenDrawer] = useState(false);

  const [page, setPage] = useState(1); // ✅ เพิ่มตัวแปร page และ setPage
  const totalPages = 4; // ✅ กำหนดค่าจำนวนหน้าทั้งหมด
  
  const handleChange = (event, value) => {
    setPage(value);
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>

      <Grid container spacing={2} sx={{pt:'1px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Button variant="contained" sx={{ backgroundColor: "white", color: "#2196F3",border: "0.5px solid #2196F3", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1,ml:2,borderRadius:3 }} onClick={() => setOpenDrawer(true)}><PersonAddAltIcon sx={{mr:2}}/>เพิ่มผู้ใช้</Button>

      </Grid>
      <Grid item xs={40} sm={10} sx={{mt:3,ml:10,}}>
            {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
                {/* <Card sx={{borderRadius:10}}>
                    <CardContent > */}
                        {/* <Typography sx={{fontWeight:800}}>ระบบการเงิน/บัญชี</Typography> */}
                        <table style={{ width: '100%', marginTop: '1px',border: '1px solid #AFEEEE',borderRadius:10 }}>
                            <thead style={{ backgroundColor: "#F0F5FF",}}>
                                <tr>
                                    {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                    <th style={{ padding: '12px 6px', textAlign: 'left', color:'#696969' }}> <Checkbox sx={{mr:2}} />ลำดับ</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>รหัสประเภทผู้ใช้</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}>ชื่อรประเภทผู้ใช้</th>
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
                    {/* </CardContent>
                </Card> */}
               </Grid>
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
      {/* </Grid> */}

                   {/* Drawer */}
                   <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                ModalProps={{
                    BackdropProps: {
                        style: { backgroundColor: 'transparent',borderRadius: '10px 0 0 10p' },
                    },
                }}
                PaperProps={{
                    sx: {
                        boxShadow: 'none',
                        width: '25%',
                        borderRadius: '10px 0 0 10p',
                        border: '1px solid #E4E4E4',
                        bgcolor: '#FAFAFA',
                        mt: '36px'
                    },
                }}
            >
                <Box sx={{ width: 300, p: 3,mt:5,ml:3 }}>
                
                 <Typography variant="h6" sx={{ color: '#3366CC',fontWeight:700}}>ประเภทผู้ใช้</Typography>
                 <Divider sx={{ bgcolor: '#5BA9FF',mt:2,width:350,borderWidth: 1.5}}/>
                 <Typography sx={{mt:3,fontWeight:700,}}>รหัสประเภทผู้ใช้</Typography>
                 <TextField
                  size="small"
                //   placeholder="รหัส"
                              sx={{
                              mt: "2px",
                              width: "150%",
                              "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                              },
                              }}
                 />
                 <Typography sx={{mt:3,fontWeight:700,}}>ชื่อประเภทผู้ใช้</Typography>
                 <TextField
                    size="small"
                    // placeholder="ชื่อ"
                                sx={{
                                mt: "2px",
                                width: "150%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                 />
                 <Typography sx={{mt:3,mb:1,fontWeight:700,}}>กำหนดสิทธิผู้ใช้</Typography>
                 <FormGroup>
                <FormControlLabel control={<Checkbox defaultChecked />} label="ลงทะเบียนผู้ป่วย" />
                <FormControlLabel control={<Checkbox />} label="ตรวจรักษา" />
                <FormControlLabel control={<Checkbox />} label="ระบบห้องตรวจปฏิบัติการ" />
                <FormControlLabel control={<Checkbox />} label="ชำระเงิน/จ่ายยา" />
                <FormControlLabel control={<Checkbox />} label="ระบบบุคลากร" />
                <FormControlLabel control={<Checkbox />} label=" ระบบคลังยา/เวชภัณฑ์" />
                <FormControlLabel control={<Checkbox />} label="ระบบการเงิน/บัญชี" />
                <FormControlLabel control={<Checkbox />} label="รายงานสำหรับผู้บริหาร" />
                <FormControlLabel control={<Checkbox />} label="ระบบการจัดการสิทธิ" />
                <FormControlLabel control={<Checkbox />} label="การตั้งค่า" />
                </FormGroup>
                 </Box>

                <Grid item xs={12} textAlign="center">
                    <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px',height:'50px', font:'Lato',fontWeight:600,mt:1 }}><SaveIcon />บันทึกข้อมูล</Button>
                </Grid>
            </Drawer>
    </Container>
    
  );


};



export default Usertype;
