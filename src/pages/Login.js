import React from "react";
import { TextField, Button, Card, CardContent, Typography, Grid, Box, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // const handleClick = () => {
  //   navigate("/clinic"); // ไปที่หน้า /clinic
  // };
  const handleClick = () => {
    // เพิ่มข้อมูลใน localStorage เพื่อจำลองการล็อกอินสำเร็จ
    localStorage.setItem('userData2', JSON.stringify({ username: 'admin' }));
    navigate("/clinic/dashboard"); // เปลี่ยนจาก "/clinic" เป็น "/clinic/dashboard"
  };

  return (
    <Grid container alignItems="center" style={{ height: "100vh", backgroundColor: "#f4f4f4", }}>
      <Grid item xs={12} sm={6.5} style={{ display: "flex", justifyContent: "center", height: "100vh", backgroundColor: '#d9eef9' }}>
        {/* <Card style={{ width: 500, padding: 20, textAlign: 'left',backgroundColor: "transparent"  }}> */}
        <CardContent style={{ width: 500, padding: 20, textAlign: 'left', backgroundColor: "transparent" }}>
          {/* <Box sx={{ width: 400,height:200, padding: 20, boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", textAlign: 'left',mt:20, }}> */}
          <Typography variant="h5" align="center" gutterBottom sx={{ mt: 30 }}>
            Login
          </Typography>
          <Typography sx={{ color: 'gray', textAlign: 'center', mb: 5 }}>Welcome back! Please enter your details.</Typography>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Typography>Email*</Typography>
            <TextField label="Enter your e-mail" variant="outlined" fullWidth sx={{ bgcolor: '#FFFFFF', borderRadius: 2 }} />
            <Typography>Password*</Typography>
            <TextField label="Enter your Password" type="password" variant="outlined" fullWidth sx={{ bgcolor: '#FFFFFF', borderRadius: 2 }} />
            <Typography sx={{ color: 'black', fontSize: 14, mt: -1 }}>Must be at least 8 characters.</Typography>
            <Button variant="contained" color="primary" fullWidth sx={{ bgcolor: '#5698E0', height: 50, borderRadius: 3 }} onClick={handleClick}>
              Login
            </Button>
            <Typography sx={{ textAlign: 'center' }}>I don’t have an account?<Link href="/signup" sx={{ ml: 1 }}>sign up</Link></Typography>
          </div>
        </CardContent>
        {/* </Card> */}
        {/* </Box> */}
      </Grid >
      {/* Right Side - Background Image */}
      <Grid item xs={12} sm={5.5} style={{ backgroundImage: "url('/rightbg.png')", backgroundSize: "cover", backgroundPosition: "right", height: "100vh", ml: -30 }}>
      </Grid>
    </Grid>
  );
};

export default Login;

// /rightbg.png  ,,backgroundImage:"url('/leftbg.jpg')", backgroundSize: "cover", backgroundPosition: "center", 