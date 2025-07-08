import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar,InputAdornment,MenuItem, Tabs, Tab, Divider,Box,Checkbox,IconButton,FormGroup,FormControlLabel,LinearProgress, Grid2, Select } from "@mui/material";
// import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CheckBox} from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Pagination, Stack } from "@mui/material";

const MedicalCertificateForm = () => {
  const [certificateType, setCertificateType] = useState("sickLeave");
  

  return (
    
    <Grid item xs={12} sm={12} sx={{mt:1,pr:1,textAlign: "center",width:"100%"}}>
    <Typography sx={{ml:-40}}>เลือกประเภทใบรับรองแพทย์</Typography>
      <Box component="select"
        // className="w-full p-2 border rounded mb-4"
        value={certificateType}
        onChange={(e) => setCertificateType(e.target.value)}
        sx={{
            mt: '8px',
            textAlign:'left',
            width: '40%',
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
        <option value="sickLeave">ใบรับรองแพทย์สำหรับลางาน</option>
        <option value="drivingLicense">ใบรับรองแพทย์สำหรับทำใบขับขี่</option>
      </Box>

      {certificateType === "sickLeave" && <SickLeaveForm />}
      {certificateType === "drivingLicense" && <DrivingLicenseForm />}
      </Grid>
  );
};

const SickLeaveForm = () => (
  <div className="p-4 border rounded bg-gray-100">
            <Grid item xs={40} sm={12} sx={{mt:1}}>
            {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
                <Card>
                    <CardContent>
                    <Typography sx={{color:'#5698E0',fontWeight:700,mb:3,mt:1,textAlign:'left'}}>ข้อมูลผู้ขอใบรับรองสุขภาพ</Typography>
                    <Grid container spacing={2}>
                    {/* Patient Profile Section */}
                    <Grid item xs={12} sm={2}>
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                คำนำหน้า
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="คำนำหน้า"
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
                            ชื่อ
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ชื่อ"
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
                                นามสกุล
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="นามสกุล"
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
                            เลขบัตรประชาชน
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="เลขบัตรประชาชน"
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
                                ที่อยู่
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ที่อยู่"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>

                    <Grid item xs={12} sm={12} ><Typography sx={{color:'#5698E0',fontWeight:700,mb:3,mt:1,mb:1,textAlign:'left'}}>ส่วนของแพทย์ (ข้อมูลการตรวจ)</Typography></Grid>
                    <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                         เลือกแพทย์
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="เลือกแพทย์"
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
                    ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่"
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
                        นํ้าหนัก (กก.)
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="นํ้าหนัก"
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
                                ความสูง(ซม.)
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ความสูง"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>

                    <Grid item xs={12} sm={12} ><Typography sx={{color:'#5698E0',fontWeight:700,mb:3,mt:1,mb:1,textAlign:'left'}}>สำหรับลางาน</Typography></Grid>
                    <Grid item xs={12} sm={12} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                             ผลการวินิจฉัย
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ผลการวินิจฉัย"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    
                    <Grid item xs={12} sm={12} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                             เห็นควรอนุญาตให้
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="เห็นควรอนุญาตให้"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={4} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                มีกำหนดวัน
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="วัน"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={4} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                ตั้งแต่วันที่
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="วัน"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={4} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                                ถึงวันที่
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="วัน"
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
          
                    </CardContent>
                </Card>
               </Grid>

                <Grid item xs={12} textAlign="center">
                        <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'200px',height:'50px', font:'Lato',fontWeight:600,mt:2 }}>สร้างใบรับรองแพทย์</Button>
                    </Grid>
  </div>
);

const DrivingLicenseForm = () => (
    <div className="p-4 border rounded bg-gray-100">
    <Grid item xs={40} sm={12} sx={{mt:1}}>
    {/* <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} /> */}
        <Card>
            <CardContent>
            <Typography sx={{color:'#5698E0',fontWeight:700,mb:3,mt:1,textAlign:'left'}}>ข้อมูลผู้ขอใบรับรองสุขภาพ</Typography>
            <Grid container spacing={2}>
            {/* Patient Profile Section */}
            <Grid item xs={12} sm={2}>
            {/* <Divider sx={{pt:2}}/> */}
            <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                        คำนำหน้า
                    </Typography>
                    <TextField
                        size="small"
                        placeholder="คำนำหน้า"
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
                    ชื่อ
                    </Typography>
                    <TextField
                        size="small"
                        placeholder="ชื่อ"
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
                        นามสกุล
                    </Typography>
                    <TextField
                        size="small"
                        placeholder="นามสกุล"
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
                    เลขบัตรประชาชน
                    </Typography>
                    <TextField
                        size="small"
                        placeholder="เลขบัตรประชาชน"
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
                        ที่อยู่
                    </Typography>
                    <TextField
                        size="small"
                        placeholder="ที่อยู่"
                        sx={{
                        mt: "1px",
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                        },
                        }}
                    />

            </Grid>

            <Grid item xs={12} sm={12} ><Typography sx={{color:'#5698E0',fontWeight:700,mb:3,mt:1,mb:1,textAlign:'left'}}>ประวัติสุขภาพ</Typography></Grid>
            <Grid item xs={12} sm={12}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1}}>
    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
      1.โรคประจำตัว
    </Typography>
    
    <Checkbox sx={{ml:35}} />
    <Typography component="span" sx={{ fontSize: "14px" }}>มี</Typography>
    
    <Checkbox />
    <Typography component="span" sx={{ fontSize: "14px" }}>ไม่มี</Typography>
    
    <TextField
      size="small"
      placeholder="ระบุโรคประจำตัว"
      sx={{
        ml: 15,  // เพิ่มระยะห่างจาก Checkbox
        width: "45%",
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
        },
      }}
    />
  </Box>
</Grid>

<Grid item xs={12} sm={12}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
      2.อุบัติเหตุและผ่าตัด
    </Typography>
    
    <Checkbox sx={{ml:30.5}}/>
    <Typography component="span" sx={{ fontSize: "14px" }}>มี</Typography>
    
    <Checkbox />
    <Typography component="span" sx={{ fontSize: "14px" }}>ไม่มี</Typography>
    
    <TextField
      size="small"
      placeholder="ระบุข้อมูลอุบัติเหตุและผ่าตัด"
      sx={{
        ml: 15,  // เพิ่มระยะห่างจาก Checkbox
        width: "45%",
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
        },
      }}
    />
  </Box>
</Grid>

<Grid item xs={12} sm={12}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
      3.เคยเข้ารับการรักษาในโรงพยาบาล
    </Typography>
    
    <Checkbox sx={{ml:18.2}} />
    <Typography component="span" sx={{ fontSize: "14px" }}>มี</Typography>
    
    <Checkbox />
    <Typography component="span" sx={{ fontSize: "14px" }}>ไม่มี</Typography>
    
    <TextField
      size="small"
      placeholder="ระบุข้อมูลการเข้ารับการรักษาในโรงพยาบาล"
      sx={{
        ml: 15,  // เพิ่มระยะห่างจาก Checkbox
        width: "45%",
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
        },
      }}
    />
  </Box>
</Grid>

<Grid item xs={12} sm={12}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
      4.โรคลมชัก (สำหรับใบอนุญาตขับรถ)
    </Typography>
    
    <Checkbox sx={{ml:17.5}}/>
    <Typography component="span" sx={{ fontSize: "14px" }}>มี</Typography>
    
    <Checkbox />
    <Typography component="span" sx={{ fontSize: "14px" }}>ไม่มี</Typography>
    
    <TextField
      size="small"
      placeholder="ระบุข้อมูล"
      sx={{
        ml: 15,  // เพิ่มระยะห่างจาก Checkbox
        width: "45%",
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
        },
      }}
    />
  </Box>
</Grid>
<Grid item xs={12} sm={12}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
      5.ประวัติอื่นที่สำคัญ
    </Typography>
    
    <Checkbox sx={{ml:32}} />
    <Typography component="span" sx={{ fontSize: "14px" }}>มี</Typography>
    
    <Checkbox />
    <Typography component="span" sx={{ fontSize: "14px" }}>ไม่มี</Typography>
    
    <TextField
      size="small"
      placeholder="ระบุข้อมูลประวัติอื่นที่สำคัญ"
      sx={{
        ml: 15,  // เพิ่มระยะห่างจาก Checkbox
        width: "45%",
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
        },
      }}
    />
  </Box>
</Grid>



            <Grid item xs={12} sm={12} ><Typography sx={{color:'#5698E0',fontWeight:700,mb:3,mt:1,mb:1,textAlign:'left'}}>ส่วนของแพทย์ (ข้อมูลการตรวจ)</Typography></Grid>
            <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                         เลือกแพทย์
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="เลือกแพทย์"
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
                    ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่"
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
                        นํ้าหนัก (กก.)
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="นํ้าหนัก"
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
                                ความสูง(ซม.)
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ความสูง"
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
                        ความดันโลหิต (มม.ปรอท)
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ความดันโลหิต"
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
                                ชีพจร(ครั้ง/นาที)
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ชีพจร"
                                sx={{
                                mt: "1px",
                                width: "100%",
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "10px",
                                },
                                }}
                            />

                    </Grid>
                    <Grid item xs={12} sm={12}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                    สภาพร่างกายทั่วไปอยู่ในเกณฑ์
                </Typography>
                
                <Checkbox sx={{ml:3}} />
                <Typography component="span" sx={{ fontSize: "14px" }}>ปกติ</Typography>
                
                <Checkbox />
                <Typography component="span" sx={{ fontSize: "14px" }}>ผิดปกติ(ระบุ)</Typography>
                
                <TextField
                size="small"
                placeholder="ระบุข้อมูล"
                sx={{
                    ml: 23,  // เพิ่มระยะห่างจาก Checkbox
                    width: "50%",
                    "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    },
                }}
                />
            </Box>
            </Grid>
            <Grid item xs={12} sm={6} >
                    {/* <Divider sx={{pt:2}}/> */}
                    <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left", }}>
                            โรคอื่นๆ (ถ้ามี)
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ระบุข้อมูล"
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
  
            </CardContent>
        </Card>
       </Grid>

        <Grid item xs={12} textAlign="center">
                <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'200px',height:'50px', font:'Lato',fontWeight:600,mt:2 }}>สร้างใบรับรองแพทย์</Button>
            </Grid>
</div>
);

export { MedicalCertificateForm, SickLeaveForm, DrivingLicenseForm };
export default MedicalCertificateForm;
