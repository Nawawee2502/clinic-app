import React from "react";
import { TextField, Button, Card, CardContent, Typography, Grid,Box,Link } from "@mui/material";

const Signup = () => {
  return (
    <Grid container alignItems="center" style={{ height: "100vh", backgroundColor: "#f4f4f4", }}>
      <Grid item xs={12} sm={6.5} style={{ display: "flex", justifyContent: "center", height: "100vh",backgroundColor:'#d9eef9'}}>
        {/* <Card style={{ width: 500, padding: 20, textAlign: 'left',backgroundColor: "transparent"  }}> */}
        {/* <img src="/logo3.png" alt="Logo" width="150" height="auto" /> */}
          <CardContent style={{ width: 500, padding: 20, textAlign: 'left',backgroundColor: "transparent" }}>
          <img src="/logo5.png" alt="Logo" width="300px" height="auto" style={{ marginLeft: "100px", display: "block" ,marginBottom:'50px'}}  />

          {/* <Box sx={{ width: 400,height:200, padding: 20, boxShadow: "0px 4px 10px rgba(0,0,0,0.1)", textAlign: 'left',mt:20, }}> */}
            <Typography variant="h5" align="center" gutterBottom  sx={{mt:-8}}>
                 Create an account
            </Typography>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Typography> Name*</Typography>
              <TextField label="Enter your  Name" variant="outlined" fullWidth sx={{bgcolor:'#FFFFFF',borderRadius:2}}/>
            <Typography>Email*</Typography>
              <TextField label="Enter your e-mail" variant="outlined" fullWidth sx={{bgcolor:'#FFFFFF',borderRadius:2}}/>
              <Typography>Password*</Typography>
              <TextField label="Enter your Password" type="password" variant="outlined" fullWidth  sx={{bgcolor:'#FFFFFF',borderRadius:2}}/>
              <Typography sx={{color:'black',fontSize:14,mt:-1}}>Must be at least 8 characters.</Typography>
              <Button variant="contained" color="primary" fullWidth sx={{bgcolor:'#5698E0',height:50,borderRadius:3}}>
                Getstart
              </Button>
              <Typography sx={{textAlign:'center'}}>Already have an account?<Link href="/login" sx={{ml:1}}>Login</Link></Typography>
            </div>
          </CardContent>
        {/* </Card> */}
        {/* </Box> */}
      </Grid >
      {/* Right Side - Background Image */}
      <Grid item xs={12} sm={5.5} style={{ backgroundImage:"url('/bgsignup.jpg')", backgroundSize: "cover", backgroundPosition: "right", height: "100vh",ml:-30 }}>
      </Grid>
    </Grid>
  );
};

export default Signup;

// /rightbg.png  ,,backgroundImage:"url('/leftbg.jpg')", backgroundSize: "cover", backgroundPosition: "center", 