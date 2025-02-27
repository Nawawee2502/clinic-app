import React from "react";
import { Grid, TextField, Button, MenuItem, Avatar, Typography, Box,Card,CardContent,Container,Divider } from "@mui/material";

const GeneralInfoTab = () => {

  return (

    <Container maxWidth={false} sx={{ mt: 4, maxWidth: "1400px" }}>
    {/* <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}> */}
    {/* <Card> */}
    {/* <h3>ข้อมูลทั่วไป</h3> */}
    <CardContent>

        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Profile Section */}
            <Grid item xs={12} sm={4} sx={{ textAlign: "center",paddingBottom:'50px' }}>
              <Avatar
                alt="User Avatar"
                src="https://via.placeholder.com/150"
                // https://randomuser.me/api/portraits/men/32.jpg
                sx={{ width: 180, height: 180, margin: "0 auto", }}
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
            <Card sx={{ maxWidth: "1000px", mx: "auto",padding:'20px' ,textAlign: "center", border: "1px solid #BDBDBD",borderRadius:'20PX'}}>
              <Button  variant="contained" size="large"sx={{ display: "block", textAlign: "left" ,bgcolor:'#5698E0',borderRadius: "16px 16px 0 0"}} >ข้อมูลทั่วไป</Button>
              <Divider sx={{ borderColor: '#5698E0', borderWidth: 1, }} />
              <h4 style={{ textAlign: "left", paddingLeft: "16px" }}></h4>
            <Grid item xs={10} sm={20}>
              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ position: 'relative', width: '50%' }}>
                {/* <Box sx={{ position: 'relative', width: '50%' }}> */}
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        HN
                    </Typography>
                  <TextField  placeholder="HN"
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
                    เลขบัตรประชาชน
                </Typography>
                  <TextField   
                  size="small"
                      placeholder="เลขบัตรประชาชน"
                      sx={{
                         mt: '8px',
                         width: '100%',
                         '& .MuiOutlinedInput-root': {
                         borderRadius: '10px',
                          },
                         }} />
                </Grid>
                <Grid item xs={2.5} sx={{ position: 'relative', width: '30%' }}>
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                    คำนำหน้า
                </Typography>
                  <TextField  label="คำนำหน้า" select variant="outlined"
                  size="small"
                  sx={{
                         mt: '8px',
                         width: '100%',
                         '& .MuiOutlinedInput-root': {
                         borderRadius: '10px',
                          },
                         }} >
                    <MenuItem value="นาย">นาย</MenuItem>
                    <MenuItem value="นาง">นาง</MenuItem>
                    <MenuItem value="นางสาว">นางสาว</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={3.5}>
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                    ชื่อ
                </Typography>
                <TextField 
                      size="small"  
                      placeholder="ชื่อ"
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
                    นามสกุล
                </Typography>
                  <TextField   
                      size="small"
                      placeholder="นามสกุล"
                      sx={{
                         mt: '8px',
                         width: '100%',
                         '& .MuiOutlinedInput-root': {
                         borderRadius: '10px',
                          },
                         }} />
                </Grid>
                <Grid item xs={2.5} sx={{ position: 'relative', width: '30%' }}>
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                    เพศ
                </Typography>
                  <TextField  label="เพศ" select variant="outlined" 
                  size="small"
                  sx={{
                         mt: '8px',
                         width: '100%',
                         '& .MuiOutlinedInput-root': {
                         borderRadius: '10px',
                          },
                         }} >
                    <MenuItem value="นาย">ชาย</MenuItem>
                    <MenuItem value="นาง">หญิง</MenuItem>
                    {/* <MenuItem value="นางสาว">นางสาว</MenuItem> */}
                  </TextField>
                </Grid>
                <Grid item xs={3.5}>
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                    วันเกิด
                </Typography>
                <TextField  type="date" InputLabelProps={{ shrink: true }} variant="outlined"
                      size="small"
                      placeholder="วันเกิด"
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
                    อายุ
                </Typography>
                  <TextField 
                   size="small"
                   placeholder="อายุ"
                   sx={{
                    mt: '8px',
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                     },
                    }} />
                </Grid>
                <Grid item xs={2.5} sx={{ position: 'relative', width: '30%' }}>
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                    กรุ๊ปเลือด
                </Typography>
                  <TextField  label="กรุ๊ปเลือด" select variant="outlined" 
                  size="small"
                  sx={{
                         mt: '8px',
                         width: '100%',
                         '& .MuiOutlinedInput-root': {
                         borderRadius: '10px',
                          },
                         }} >
                    <MenuItem value="นาย">A</MenuItem>
                    <MenuItem value="นาง">B</MenuItem>
                    {/* <MenuItem value="นางสาว">นางสาว</MenuItem> */}
                  </TextField>
                </Grid>
                <Grid item xs={3.5}>
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                   อาชีพ
                </Typography>
                <TextField 
                      size="small"
                      placeholder="อาชีพ"
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
                    เชื้อชาติ
                </Typography>
                  <TextField 
                   size="small"
                   placeholder="เชื้อชาติ"
                   sx={{
                    mt: '8px',
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                     },
                    }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField 
                  size="small"
                  placeholder="สัญชาติ"
                  sx={{
                   mt: '8px',
                   width: '100%',
                   '& .MuiOutlinedInput-root': {
                   borderRadius: '10px',
                    },
                   }}  />
                </Grid>
                <Grid item xs={6}>
                <TextField 
                  size="small"
                  placeholder="ศาสนา"
                  sx={{
                   mt: '8px',
                   width: '100%',
                   '& .MuiOutlinedInput-root': {
                   borderRadius: '10px',
                    },
                   }}  />
                </Grid>
                <Grid item xs={2.5} sx={{ position: 'relative', width: '30%' }}>
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                    สถานภาพ
                </Typography>
                  <TextField  label="สถานภาพ" select variant="outlined" 
                  size="small"
                  sx={{
                         mt: '8px',
                         width: '100%',
                         '& .MuiOutlinedInput-root': {
                         borderRadius: '10px',
                          },
                         }} >
                    <MenuItem value="นาย">โสด</MenuItem>
                    <MenuItem value="นาง">สมรส</MenuItem>
                    <MenuItem value="นางสาว">หม้าย</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={3.5}>
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                    น้ำหนัก(kg.)
                </Typography>
                  <TextField
                  size="small"
                  placeholder="น้ำหนัก(kg.)"
                  sx={{
                   mt: '8px',
                   width: '100%',
                   '& .MuiOutlinedInput-root': {
                   borderRadius: '10px',
                    },
                   }}  />
                </Grid>
                <Grid item xs={6}>
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                  ส่วนสูง(cm.)
                </Typography>
                <TextField
                  size="small"
                  placeholder="ส่วนสูง(cm.)"
                  sx={{
                   mt: '8px',
                   width: '100%',
                   '& .MuiOutlinedInput-root': {
                   borderRadius: '10px',
                    },
                   }}  />
                </Grid>
              </Grid>
            </Grid>

            <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="contained" sx={{ backgroundColor: "#BCD8FF", color: "#5BA9FF", fontSize: "1rem",width:'100px', font:'Lato',fontWeight:600 }}>ถัดไป</Button>
          </Grid>
            </Card>
          </Grid>
          {/* </Card> */}
        </Box>
      {/* )} */}
    </CardContent>
  {/* </Card> */}
  {/* </Grid> */}
 </Container>
  );
};

export default GeneralInfoTab;
