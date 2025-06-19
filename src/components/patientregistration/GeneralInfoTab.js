import React from "react";
import { 
  Grid, 
  TextField, 
  Button, 
  MenuItem, 
  Avatar, 
  Typography, 
  Box, 
  Card, 
  Divider 
} from "@mui/material";

const GeneralInfoTab = () => {
  return (
    <div style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0",
      margin: "0 auto",
    }}>
      {/* Profile Section */}
      <div style={{
        textAlign: "center",
        marginBottom: "30px",
        width: "100%"
      }}>
        <Avatar
          alt="User Avatar"
          src="https://via.placeholder.com/150"
          sx={{ width: 180, height: 180, margin: "0 auto" }}
        />
        <Typography variant="h6">Morshed Ali</Typography>
        <Typography variant="body2">22 Years, Male</Typography>
        <Button 
          variant="contained" 
          size="small" 
          sx={{ 
            mt: 1, 
            backgroundColor: 'white', 
            color: '#2196F3', 
            border: '1px solid #2196F3', 
            '&:hover': { backgroundColor: '#f0f0f0' } 
          }}
        >
          แก้ไขรูปภาพ
        </Button>
      </div>

      {/* Form Section */}
      <Card sx={{
        width: "100%",
        padding: '20px',
        textAlign: "center",
        border: "1px solid #BDBDBD",
        borderRadius: '20px',
        boxSizing: "border-box"
      }}>
        <Box
          sx={{
            width: '110px',
            height: '39px',
            bgcolor: '#70A1E5',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
            color: '#FFFFFF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          ข้อมูลทั่วไป
        </Box>

        <Divider sx={{ borderColor: '#5698E0', borderWidth: 1 }} />

        <Grid container spacing={2} sx={{ px: 2, mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              HN
            </Typography>
            <TextField
              placeholder="HN"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              เลขบัตรประชาชน
            </Typography>
            <TextField
              placeholder="เลขบัตรประชาชน"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              คำนำหน้า
            </Typography>
            <TextField
              select
              label="คำนำหน้า"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              <MenuItem value="นาย">นาย</MenuItem>
              <MenuItem value="นาง">นาง</MenuItem>
              <MenuItem value="นางสาว">นางสาว</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ชื่อ
            </Typography>
            <TextField
              placeholder="ชื่อ"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              นามสกุล
            </Typography>
            <TextField
              placeholder="นามสกุล"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              เพศ
            </Typography>
            <TextField
              select
              label="เพศ"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              <MenuItem value="ชาย">ชาย</MenuItem>
              <MenuItem value="หญิง">หญิง</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              วันเกิด
            </Typography>
            <TextField
              type="date"
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              อายุ
            </Typography>
            <TextField
              placeholder="อายุ"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              กรุ๊ปเลือด
            </Typography>
            <TextField
              select
              label="กรุ๊ปเลือด"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="O">O</MenuItem>
              <MenuItem value="AB">AB</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              อาชีพ
            </Typography>
            <TextField
              placeholder="อาชีพ"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              เชื้อชาติ
            </Typography>
            <TextField
              placeholder="เชื้อชาติ"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              สัญชาติ
            </Typography>
            <TextField
              placeholder="สัญชาติ"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ศาสนา
            </Typography>
            <TextField
              placeholder="ศาสนา"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              สถานภาพ
            </Typography>
            <TextField
              select
              label="สถานภาพ"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            >
              <MenuItem value="โสด">โสด</MenuItem>
              <MenuItem value="สมรส">สมรส</MenuItem>
              <MenuItem value="หม้าย">หม้าย</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              น้ำหนัก(kg.)
            </Typography>
            <TextField
              placeholder="น้ำหนัก(kg.)"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ส่วนสูง(cm.)
            </Typography>
            <TextField
              placeholder="ส่วนสูง(cm.)"
              size="small"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Navigation Buttons */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          mt: 4, 
          px: 2 
        }}>
          <Button 
            variant="contained" 
            sx={{ 
              backgroundColor: "#BCD8FF", 
              color: "#2B69AC", 
              fontSize: "1rem", 
              width: '100px', 
              font: 'Lato', 
              fontWeight: 600 
            }}
          >
            ถัดไป
          </Button>
        </Box>
      </Card>
    </div>
  );
};

export default GeneralInfoTab;