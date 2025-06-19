import React from "react";
import { 
  Grid, 
  TextField, 
  Button, 
  Avatar, 
  Typography, 
  Box, 
  Card, 
  Divider 
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const HealthHistoryTab = () => {
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
          ประวัติสุขภาพ
        </Box>

        <Divider sx={{ borderColor: '#5698E0', borderWidth: 1 }} />

        <Grid container spacing={2} sx={{ px: 2, mt: 2 }}>
          <Grid item xs={12}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              โรคประจำตัว
            </Typography>
            <TextField
              placeholder="กรอกโรคประจำตัว (ถ้ามี)"
              multiline
              rows={3}
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                  padding: '12px',
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ประวัติแพ้ยา
            </Typography>
            <TextField
              placeholder="กรอกประวัติแพ้ยา (ถ้ามี)"
              multiline
              rows={3}
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                  padding: '12px',
                  borderRadius: '10px',
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ fontWeight: '400', fontSize: '16px', textAlign: "left" }}>
              ประวัติแพ้อาหาร
            </Typography>
            <TextField
              placeholder="กรอกประวัติแพ้อาหาร (ถ้ามี)"
              multiline
              rows={3}
              fullWidth
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1rem',
                  padding: '12px',
                  borderRadius: '10px',
                },
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
        </Box>
      </Card>

      {/* Bottom Buttons */}
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        width: "100%",
        mt: 3,
        px: 2
      }}>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: "white", 
            color: "#2196F3", 
            border: "0.5px solid #2196F3", 
            fontSize: "1rem", 
            width: '145px', 
            font: 'Lato', 
            fontWeight: 600 
          }}
        >
          <EditIcon sx={{ mr: 1 }} />แก้ไขข้อมูล
        </Button>
        <Button 
          variant="contained" 
          sx={{ 
            backgroundColor: "#5698E0", 
            color: "white", 
            fontSize: "1rem", 
            width: '150px', 
            font: 'Lato', 
            fontWeight: 600 
          }}
        >
          <SaveIcon sx={{ mr: 1 }} />บันทึกข้อมูล
        </Button>
      </Box>
    </div>
  );
};

export default HealthHistoryTab;