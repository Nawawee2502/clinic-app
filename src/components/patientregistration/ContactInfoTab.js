import React from "react";
import {
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Divider
} from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';

const ContactInfoTab = () => {
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
          ข้อมูลติดต่อ
        </Box>

        <Divider sx={{ borderColor: '#5698E0', borderWidth: 1 }} />

        <h4 style={{ textAlign: "left", paddingLeft: "16px", color: '#5698E0' }}>
          ที่อยู่ตามบัตรประชาชน
        </h4>

        {/* ID Card Address Section */}
        <Grid container spacing={2} sx={{ px: 2 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ที่อยู่ตามบัตรประชาชน
            </Typography>
            <TextField
              placeholder="ที่อยู่ตามบัตรประชาชน"
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

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ตำบล/แขวง
            </Typography>
            <TextField
              size="small"
              placeholder="ตำบล/แขวง"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              อำเภอ/เขต
            </Typography>
            <TextField
              size="small"
              placeholder="อำเภอ/เขต"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              จังหวัด
            </Typography>
            <TextField
              size="small"
              placeholder="จังหวัด"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              รหัสไปรษณีย์
            </Typography>
            <TextField
              size="small"
              placeholder="รหัสไปรษณีย์"
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

        {/* Current Address Section */}
        <h4 style={{ textAlign: "left", paddingLeft: "16px", color: '#5698E0', marginTop: "30px" }}>
          ที่อยู่ปัจจุบัน
        </h4>

        <Box sx={{ textAlign: "left", pl: 2, mb: 2 }}>
          <FormControlLabel
            control={<Checkbox />}
            label="ใช้ที่อยู่เดียวกับที่อยู่ตามบัตรประชาชน"
            sx={{ fontWeight: 'normal' }}
          />
        </Box>

        <Grid container spacing={2} sx={{ px: 2 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ที่อยู่ตามบัตรประชาชน
            </Typography>
            <TextField
              size="small"
              placeholder="ที่อยู่ตามบัตรประชาชน"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ตำบล/แขวง
            </Typography>
            <TextField
              size="small"
              placeholder="ตำบล/แขวง"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              อำเภอ/เขต
            </Typography>
            <TextField
              size="small"
              placeholder="อำเภอ/เขต"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              จังหวัด
            </Typography>
            <TextField
              size="small"
              placeholder="จังหวัด"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              รหัสไปรษณีย์
            </Typography>
            <TextField
              size="small"
              placeholder="รหัสไปรษณีย์"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              เบอร์โทรศัพท์
            </Typography>
            <TextField
              size="small"
              placeholder="เบอร์โทรศัพท์"
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              อีเมล
            </Typography>
            <TextField
              size="small"
              placeholder="อีเมล"
              fullWidth
              sx={{
                mt: 1,
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

        {/* Navigation Buttons */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
          px: 2
        }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "white",
              color: "#2196F3",
              border: "0.5px solid #2196F3",
              fontSize: "1rem",
              width: '110px',
              font: 'Lato',
              fontWeight: 600
            }}
          >
            ย้อนกลับ
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#BCD8FF",
              color: "#5BA9FF",
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

export default ContactInfoTab;