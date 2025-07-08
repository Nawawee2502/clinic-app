import React, { useState } from "react";
import { Container, Grid, TextField, Button, Card, CardContent, Typography, Avatar, InputAdornment, MenuItem, Tabs, Tab, Divider, Box, Checkbox, IconButton, FormGroup, FormControlLabel, LinearProgress, Grid2 } from "@mui/material";
// import { DatePicker } from "@mui/lab";
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { CheckBox } from "@mui/icons-material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Ordermedicine = () => {



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
        <Box sx={{ mt: 4 }}>

            <Grid container spacing={2}>
                {/* Patient Profile Section */}
                <Grid item xs={12} sm={5} sx={{ mt:'70px' }}>
                    <Card sx={{ p: 3, mb: 3, border: 'none', boxShadow: 1 }}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <Avatar
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                                    sx={{ width: 120, height: 120, mx: "auto" }}
                                />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                    <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                                        Demi Wilkinson
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        อายุ 22 ปี 9 เดือน
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    justifyContent: 'space-between',
                                    gap: 2
                                }}>
                                    <Typography variant="body1" fontWeight="600" sx={{
                                        bgcolor: '#E9F2FF',
                                        color: 'black',
                                        p: 1,
                                        borderRadius: 1,
                                        textAlign: 'center'
                                    }}>
                                        VN021202
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600" sx={{
                                        bgcolor: '#E9F2FF',
                                        color: 'black',
                                        p: 1,
                                        borderRadius: 1,
                                        textAlign: 'center'
                                    }}>
                                        HN000001
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Card>
                    {/* <Divider sx={{pt:2}}/> */}

                </Grid>

                {/* Vitals Form Section */}
                <Grid item xs={12} sm={7} sx={{ pt: '2px' }}>
                    <Grid container spacing={2}>

                        <Grid item xs={10} sm={20} sx={{ mt: 0.5, textAlign: "right" }}>
                            <Button sx={{ textAlign: "right", bgcolor: '#5698E0', color: '#FFFFFF', width: 130 }}><AddIcon sx={{ color: '#FFFFFF' }} />เพิ่ม</Button>
                        </Grid>

                        <Grid item xs={6}>
                            <Typography sx={{ fontWeight: "400", fontSize: "16px", textAlign: "left" }}>
                                ชื่อยา
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="ชื่อยา"
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
                        <Grid item xs={6}>
                            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                                วิธีใช้
                            </Typography>
                            <Box component="select"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    height: '40px',
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
                                <option value="">วิธีใช้</option>

                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                                ก่อนหลัง
                            </Typography>
                            <Box component="select"
                                sx={{
                                    mt: '8px',
                                    width: '100%',
                                    height: '40px',
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
                                <option value="">ก่อนหลัง</option>

                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                                จำนวน
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="จำนวน"
                                sx={{
                                    mt: '8px', width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }} />
                        </Grid>
                        <Grid item xs={6}>
                            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
                                เวลา
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="เวลา"
                                sx={{
                                    mt: '8px', width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '10px',
                                    },
                                }} />
                        </Grid>

                    </Grid>

                </Grid>
                <Grid item xs={40} sm={12} sx={{ mt: 10 }}>
                    <Divider sx={{ borderColor: '#5698E0', borderWidth: 3, }} />
                    <Card>
                        <CardContent>
                            <Typography sx={{ fontWeight: 800 }}>Order ยา</Typography>
                            {/* <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: '12px' }}> */}
                            <table style={{ width: '100%', marginTop: '24px', border: '1px solid #AFEEEE' }}>
                                <thead style={{ backgroundColor: "#F0F5FF", }}>
                                    <tr>
                                        {/* <th style={{ padding: '12px 16px', textAlign: 'left', color:'#696969' }}><Checkbox /></th> */}
                                        <th style={{ padding: '12px 6px', textAlign: 'left', color: '#696969' }}> <Checkbox sx={{ mr: 2 }} />ลำดับ</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#696969' }}>ชื่อยา</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#696969' }}>จำนวน</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#696969' }}>วิธีใช้</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#696969' }}>ก่อนหลัง</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#696969', width: '2%', align: "center" }}></th>
                                        <th style={{ padding: '12px 16px', textAlign: 'left', color: '#696969', width: '2%', align: "center" }}></th>
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
                                        <td style={{ padding: '12px 5px' }}> <Checkbox sx={{ mr: 2 }} />{1}</td>
                                        <td style={{ padding: '12px 16px' }}>Paracetamol</td>
                                        <td style={{ padding: '12px 16px' }}>24</td>
                                        <td style={{ padding: '12px 16px' }}>รับประทาน</td>
                                        <td style={{ padding: '12px 16px' }}>หลัง</td>
                                        <td style={{ padding: '12px 16px', width: '2%', align: "center" }}> <IconButton
                                            color="danger"
                                            size="md"
                                            //   onClick={() => handleDelete(row.refno)}
                                            sx={{ border: '1px solid #5698E0', borderRadius: '7px' }}
                                        >
                                            <EditIcon sx={{ color: '#5698E0' }} />
                                        </IconButton></td>
                                        <td style={{ padding: '12px 16px', width: '2%', align: "center" }}> <IconButton
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
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} textAlign="right">
                    <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "#FFFFFF", fontSize: "1rem", width: '150px', height: '50px', font: 'Lato', fontWeight: 600, mt: 1 }}><SaveIcon />บันทึกข้อมูล</Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Ordermedicine;
