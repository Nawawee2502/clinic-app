import React from "react";
import { Grid, TextField, Button, MenuItem, Avatar, Typography, Box,Card,CardContent,Container,Checkbox,FormControlLabel,InputAdornment,Divider } from "@mui/material";
import { CheckBox } from "@mui/icons-material";
import EmailIcon from '@mui/icons-material/Email';

const ContactInfoTab = () => {
    return (

        <Container maxWidth={false} sx={{ mt: 4, maxWidth: "1400px" }}>
        {/* <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}> */}
        {/* <Card> */}
        {/* <h3>ข้อมูลติดต่อ</h3>
        <h4>ที่อยู่ตามบัตรประชาชน</h4> */}
        <CardContent>
    
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Profile Section */}
                <Grid item xs={12} sm={4} sx={{ textAlign: "center",paddingBottom:'50px' }}>
                  <Avatar
                    alt="User Avatar"
                    src="https://via.placeholder.com/150"
                    sx={{ width: 180, height: 180, margin: "0 auto" }}
                  />
                  <Typography variant="h6">Morshed Ali</Typography>
                  <Typography variant="body2">22 Years, Male</Typography>
                  <Button variant="contained" size="small"  sx={{ mt: 1, backgroundColor: 'white', color: '#2196F3', border: '1px solid #2196F3','&:hover': { backgroundColor: '#f0f0f0' }}}>
                      แก้ไขรูปภาพ
                  </Button>
                </Grid>
                </Grid>
                
                {/* Form Section */}
                <Grid container spacing={2}>
                <Card sx={{ maxWidth: "1000px", mx: "auto",padding:'20px' ,textAlign: "center", border: "1px solid #BDBDBD",borderRadius:'20PX',}}>
                <Button  variant="contained" size="large"sx={{ display: "block", textAlign: "left" ,bgcolor:'#5698E0',borderRadius: "16px 16px 0 0"}} >ข้อมูลติดต่อ</Button>
                <Divider sx={{ borderColor: '#5698E0', borderWidth: 1, }} />
                <h4 style={{ textAlign: "left", paddingLeft: "16px",color:'#5698E0' }}>ที่อยู่ตามบัตรประชาชน</h4>
                <Grid item xs={10} sm={20}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sx={{ position: 'relative', width: '50%' }}>
                    {/* <Box sx={{ position: 'relative', width: '50%' }}> */}
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                           ที่อยู่ตามบัตรประชาชน
                        </Typography>
                      <TextField  
                      placeholder="ที่อยู่ตามบัตรประชาชน"
                      size="small"
                       sx={{
                             mt: '8px',
                             width: '100%',
                             '& .MuiOutlinedInput-root': {
                             borderRadius: '10px',
                              },
                             }} />
                      {/* </Box> */}
                    </Grid>
                    <Grid item xs={6}  sx={{ position: 'relative', width: '50%' }}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        ตำบล/แขวง
                    </Typography>
                      <TextField   
                      size="small"
                          placeholder="ตำบล/แขวง"
                          sx={{
                             mt: '8px',
                             width: '100%',
                             '& .MuiOutlinedInput-root': {
                             borderRadius: '10px',
                              },
                             }} />
                    </Grid>
                    <Grid item xs={6} sx={{ position: 'relative', width: '30%' }}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        อำเภอ/เขต
                    </Typography>
                    <TextField   
                      size="small"
                          placeholder="อำเภอ/เขต"
                          sx={{
                             mt: '8px',
                             width: '100%',
                             '& .MuiOutlinedInput-root': {
                             borderRadius: '10px',
                              },
                             }} />
                    </Grid>
                    <Grid item xs={6}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        จังหวัด
                    </Typography>
                    <TextField 
                          size="small"  
                          placeholder="จังหวัด"
                          sx={{
                             mt: '8px',
                             width: '100%',
                             '& .MuiOutlinedInput-root': {
                             borderRadius: '10px',
                              },
                             }} />
                    </Grid>
                    <Grid item xs={6}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                       รหัสไปรษณีย์
                    </Typography>
                      <TextField   
                          size="small"
                          placeholder="รหัสไปรษณีย์"
                          sx={{
                             mt: '8px',
                             width: '100%',
                             '& .MuiOutlinedInput-root': {
                             borderRadius: '10px',
                              },
                             }} />
                    </Grid>
                    </Grid>
                    <h4 style={{ textAlign: "left", paddingLeft: "16px",color:'#5698E0' }}>ที่อยู่ปัจจุบัน</h4>
                    <h4 style={{ fontWeight:10,textAlign: "left", paddingLeft: "16px" }}><Checkbox />ใช้ที่อยู่เดียวกับที่อยู่ตามบัตรประชาชน</h4>


                    <Grid container spacing={2}>
                    <Grid item xs={6} sx={{ position: 'relative', width: '30%' }}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        ที่อยู่ตามบัตรประชาชน
                    </Typography>
                    <TextField   
                          size="small"
                          placeholder="ที่อยู่ตามบัตรประชาชน"
                          sx={{
                             mt: '8px',
                             width: '100%',
                             '& .MuiOutlinedInput-root': {
                             borderRadius: '10px',
                              },
                             }} />
                    </Grid>
                    <Grid item xs={6}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        ตำบล/แขวง
                    </Typography>
                    <TextField   
                          size="small"
                          placeholder="ตำบล/แขวง"
                          sx={{
                             mt: '8px',
                             width: '100%',
                             '& .MuiOutlinedInput-root': {
                             borderRadius: '10px',
                              },
                             }} />
                      {/* <TextField fullWidth label="วันเกิด" type="date" InputLabelProps={{ shrink: true }} variant="outlined" /> */}
                    </Grid>
                    <Grid item xs={6}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                      อำเภอ/เขต
                    </Typography>
                      <TextField 
                       size="small"
                       placeholder="อำเภอ/เขต"
                       sx={{
                        mt: '8px',
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                         },
                        }} />
                    </Grid>
                    <Grid item xs={6}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        จังหวัด
                    </Typography>
                      <TextField 
                       size="small"
                       placeholder="จังหวัด"
                       sx={{
                        mt: '8px',
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                         },
                        }} />
                    </Grid>
                    <Grid item xs={6}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        รหัสไปรษณีย์
                    </Typography>
                      <TextField 
                       size="small"
                       placeholder="รหัสไปรษณีย์"
                       sx={{
                        mt: '8px',
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                         },
                        }} />
                    </Grid>
                    <Grid item xs={6}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        เบอร์โทรศัพท์
                    </Typography>
                      <TextField 
                       size="small"
                       placeholder="เบอร์โทรศัพท์"
                       sx={{
                        mt: '8px',
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                         },
                        }} />
                    </Grid>
                    <Grid item xs={6}>
                    <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        อีเมล
                    </Typography>
                      <TextField 
                       size="small"
                       placeholder="อีเมล"
                       sx={{
                        mt: '8px',
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                         },
                        }} 
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
                            </InputAdornment>
                          ),
                        }}
                        />
                    </Grid>
                    
                  </Grid>
                </Grid>
                {/* <Grid container justifyContent="flex-start" sx={{ mt: 3 }}>
                <Button variant="contained" sx={{ backgroundColor: "#BCD8FF", color: "#5BA9FF", fontSize: "1rem",width:'100px', font:'Lato',fontWeight:600 }}>ย้อนกลับ</Button>
              </Grid> */}
                <Grid container justifyContent="space-between" sx={{ mt: 3 }}>
                <Button variant="contained" sx={{ backgroundColor: "white", color: "#2196F3",border: "0.5px solid #2196F3", fontSize: "1rem",width:'110px', font:'Lato',fontWeight:600, }}>ย้อนกลับ</Button>
                <Button variant="contained" sx={{ backgroundColor: "#BCD8FF", color: "#5BA9FF", fontSize: "1rem",width:'100px', font:'Lato',fontWeight:600 }}>ถัดไป</Button>
              </Grid>
                </Card>
              </Grid>
            </Box>
        </CardContent>
     </Container>
      );
    };

export default ContactInfoTab;
