import React from "react";
import {
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  Box,
  Card,
  Divider,
  CircularProgress
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const HealthHistoryTab = ({ onPrev, onSave, onEdit, patientData, updatePatientData, loading }) => {

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    updatePatientData({ [field]: value });
  };

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
        <Typography variant="h6">
          {patientData.NAME1 || patientData.SURNAME
            ? `${patientData.PRENAME || ''} ${patientData.NAME1} ${patientData.SURNAME}`.trim()
            : 'ผู้ป่วยใหม่'
          }
        </Typography>
        <Typography variant="body2">
          {patientData.AGE ? `${patientData.AGE} ปี` : ''}
          {patientData.AGE && patientData.SEX ? ', ' : ''}
          {patientData.SEX || ''}
        </Typography>
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
              value={patientData.DISEASE1 || ''}
              onChange={handleInputChange('DISEASE1')}
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
              value={patientData.DRUG_ALLERGY || ''}
              onChange={handleInputChange('DRUG_ALLERGY')}
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
              value={patientData.FOOD_ALLERGIES || ''}
              onChange={handleInputChange('FOOD_ALLERGIES')}
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
          justifyContent: "flex-start",
          mt: 4,
          px: 2
        }}>
          <Button
            variant="contained"
            onClick={onPrev}
            disabled={loading}
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

      {/* Summary Section */}
      <Card sx={{
        width: "100%",
        padding: '20px',
        mt: 3,
        border: "1px solid #E0E0E0",
        borderRadius: '15px',
        backgroundColor: '#F8F9FA'
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#2B69AC', fontWeight: 600 }}>
          สรุปข้อมูลผู้ป่วย
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">HN:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{patientData.HNCODE || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">ชื่อ-นามสกุล:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {`${patientData.PRENAME || ''} ${patientData.NAME1 || ''} ${patientData.SURNAME || ''}`.trim() || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">อายุ:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{patientData.AGE ? `${patientData.AGE} ปี` : '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">เพศ:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{patientData.SEX || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">เบอร์โทรศัพท์:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{patientData.TEL1 || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">อีเมล:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{patientData.EMAIL1 || '-'}</Typography>
          </Grid>
        </Grid>
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
          onClick={onEdit}
          disabled={loading}
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
          onClick={onSave}
          disabled={loading}
          sx={{
            backgroundColor: "#5698E0",
            color: "white",
            fontSize: "1rem",
            width: '150px',
            font: 'Lato',
            fontWeight: 600,
            position: 'relative'
          }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <SaveIcon sx={{ mr: 1 }} />บันทึกข้อมูล
            </>
          )}
        </Button>
      </Box>
    </div>
  );
};

export default HealthHistoryTab;