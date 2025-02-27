import React from "react";
import { Grid, TextField, Button, MenuItem, Avatar, Typography, Box,Card,CardContent,Container,Divider } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const HealthHistoryTab = () => {
  return (
    <Container maxWidth={false} sx={{ mt: 4, maxWidth: "1400px" }}>
    {/* <Grid container spacing={2} justifyContent="center" sx={{ mt: 3 }}> */}
    {/* <Card> */}
    {/* <h3>ประวัติสุขภาพ</h3> */}
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
            <Card sx={{ maxWidth: "1000px", mx: "auto",padding:'20px' ,textAlign: "center", border: "1px solid #BDBDBD",borderRadius:'20PX'}}>
              <Button  variant="contained" size="large"sx={{ display: "block", textAlign: "left" ,bgcolor:'#5698E0',borderRadius: "16px 16px 0 0"}} >ประวัติสุขภาพ</Button>
              <Divider sx={{ borderColor: '#5698E0', borderWidth: 1, }} />
              <h4 style={{ textAlign: "left", paddingLeft: "16px" }}></h4>
            <Grid item xs={10} sm={20}>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
                {/* <Box sx={{ position: 'relative', width: '50%' }}> */}
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        โรคประจำตัว
                    </Typography>
                    <TextField  
                        placeholder="กรอกโรคประจำตัว (ถ้ามี)"
                        sx={{
                          mt: '8px',
                          width: '100%', // กำหนดความกว้างให้เต็ม
                          height: '95px', // ขนาดความสูง
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1rem',  // ขนาดตัวอักษรใหญ่ขึ้น
                            padding: '16px',  // ระยะห่างภายใน
                            borderRadius: '10px',
                          },
                        }} 
                      />
                  {/* </Box> */}
                </Grid>
                <Grid item xs={12} sx={{ position: 'relative', width: '50%' }}>
                {/* <Box sx={{ position: 'relative', width: '50%' }}> */}
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        ประวัติแพ้ยา
                    </Typography>
                    <TextField  
                        placeholder="กรอกประวัติแพ้ยา (ถ้ามี)"
                        sx={{
                          mt: '8px',
                          width: '100%', // กำหนดความกว้างให้เต็ม
                          height: '95px', // ขนาดความสูง
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1rem',  // ขนาดตัวอักษรใหญ่ขึ้น
                            padding: '16px',  // ระยะห่างภายใน
                            borderRadius: '10px',
                          },
                        }} 
                      />
                  {/* </Box> */}
                </Grid>
                <Grid item xs={12} sx={{ position: 'relative', width: '50%' }}>
                {/* <Box sx={{ position: 'relative', width: '50%' }}> */}
                <Typography sx={{ fontWeight: '400', fontSize: '16px',textAlign: "left" }}>
                        ประวัติแพ้อาหาร
                    </Typography>
                    <TextField  
                        placeholder="กรอกประวัติแพ้อาหาร (ถ้ามี)"
                        sx={{
                          mt: '8px',
                          width: '100%', // กำหนดความกว้างให้เต็ม
                          height: '95px', // ขนาดความสูง
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1rem',  // ขนาดตัวอักษรใหญ่ขึ้น
                            padding: '16px',  // ระยะห่างภายใน
                            borderRadius: '10px',
                          },
                        }} 
                      />
                </Grid>
                
              </Grid>
            </Grid>

            <Grid container justifyContent="flex-start" sx={{ mt: 3 }}>
            <Button variant="contained" sx={{ backgroundColor: "#BCD8FF", color: "#5BA9FF", fontSize: "1rem",width:'100px', font:'Lato',fontWeight:600 }}>ย้อนกลับ</Button>
          </Grid>
            </Card>
            <Grid container justifyContent="space-between" sx={{ mt: 3,px: 25 }}>
              <Button variant="contained" sx={{ backgroundColor: "white", color: "#2196F3",border: "0.5px solid #2196F3", fontSize: "1rem",width:'145px', font:'Lato',fontWeight:600, }}> <EditIcon/>แก้ไขข้อมูล</Button>
              <Button variant="contained" sx={{ backgroundColor: "#5698E0", color: "FFFFFF", fontSize: "1rem",width:'150px', font:'Lato',fontWeight:600 }}><SaveIcon />บันทึกข้อมูล</Button>
            </Grid>
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


export default HealthHistoryTab;


