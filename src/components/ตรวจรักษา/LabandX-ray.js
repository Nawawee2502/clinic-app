import React, { useState, useEffect } from "react";
import {
  Grid, TextField, Button, Card, Typography, Avatar, Box,
  Checkbox, FormGroup, FormControlLabel, CircularProgress, Alert
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import PropTypes from 'prop-types';

// Import Services
import TreatmentService from "../../services/treatmentService";

const LabandXray = ({ currentPatient, onSaveSuccess }) => {
  const [labData, setLabData] = useState({
    radiological: {
      chestXray: false,
      xray: false,
      xrayNote: '',
      ultrasound: false,
      ultrasoundNote: ''
    },
    laboratory: {
      cbc: false,
      bunC: false,
      lipid: false,
      fbs: false,
      dtx: false,
      other: false,
      otherNote: ''
    }
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // โหลดข้อมูลเมื่อ currentPatient เปลี่ยน
  useEffect(() => {
    if (currentPatient?.VNO) {
      loadLabData();
    }
  }, [currentPatient]);

  const loadLabData = async () => {
    try {
      setLoading(true);
      const response = await TreatmentService.getTreatmentByVNO(currentPatient.VNO);

      if (response.success && response.data) {
        // โหลดข้อมูล Lab/X-ray ที่มีอยู่
        const { labTests, radiologicalTests } = response.data;

        // ตั้งค่า checkbox ตามข้อมูลที่มี
        const newLabData = { ...labData };

        if (radiologicalTests) {
          radiologicalTests.forEach(test => {
            if (test.RLNAME?.includes('Chest X-ray')) newLabData.radiological.chestXray = true;
            if (test.RLNAME?.includes('X-ray') && !test.RLNAME?.includes('Chest')) newLabData.radiological.xray = true;
            if (test.RLNAME?.includes('Ultrasound')) newLabData.radiological.ultrasound = true;
          });
        }

        if (labTests) {
          labTests.forEach(test => {
            if (test.LABNAME?.includes('CBC')) newLabData.laboratory.cbc = true;
            if (test.LABNAME?.includes('BUN')) newLabData.laboratory.bunC = true;
            if (test.LABNAME?.includes('Lipid')) newLabData.laboratory.lipid = true;
            if (test.LABNAME?.includes('FBS')) newLabData.laboratory.fbs = true;
            if (test.LABNAME?.includes('DTX')) newLabData.laboratory.dtx = true;
          });
        }

        setLabData(newLabData);
      }
    } catch (error) {
      console.error('Error loading lab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRadiologicalChange = (field, value) => {
    setLabData(prev => ({
      ...prev,
      radiological: {
        ...prev.radiological,
        [field]: value
      }
    }));
  };

  const handleLaboratoryChange = (field, value) => {
    setLabData(prev => ({
      ...prev,
      laboratory: {
        ...prev.laboratory,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // เตรียมข้อมูล Lab Tests
      const labTests = [];
      const radioTests = [];

      // Radiological Tests - แก้ไข: ใช้ชื่อฟิลด์ที่ถูกต้องตาม backend
      if (labData.radiological.chestXray) {
        radioTests.push({
          RLCODE: 'XR001',
          NOTE1: labData.radiological.xrayNote || ''
        });
      }
      if (labData.radiological.xray) {
        radioTests.push({
          RLCODE: 'XR002',
          NOTE1: labData.radiological.xrayNote || ''
        });
      }
      if (labData.radiological.ultrasound) {
        radioTests.push({
          RLCODE: 'US001',
          NOTE1: labData.radiological.ultrasoundNote || ''
        });
      }

      // Laboratory Tests - แก้ไข: ใช้ชื่อฟิลด์ที่ถูกต้องตาม backend
      if (labData.laboratory.cbc) {
        labTests.push({ LABCODE: 'LAB001' });
      }
      if (labData.laboratory.bunC) {
        labTests.push({ LABCODE: 'LAB002' });
      }
      if (labData.laboratory.lipid) {
        labTests.push({ LABCODE: 'LAB003' });
      }
      if (labData.laboratory.fbs) {
        labTests.push({ LABCODE: 'LAB004' });
      }
      if (labData.laboratory.dtx) {
        labTests.push({ LABCODE: 'LAB005' });
      }
      if (labData.laboratory.other && labData.laboratory.otherNote) {
        labTests.push({
          LABCODE: 'LAB999',
          NOTE1: labData.laboratory.otherNote
        });
      }

      const lockedStatuses = ['รอชำระเงิน', 'ชำระเงินแล้ว', 'ปิดการรักษา'];
      const currentStatus =
        (currentPatient?.queueStatus || currentPatient?.STATUS1 || '').trim();
      const isLockedStatus = lockedStatuses.includes(currentStatus);

      // แก้ไข: ปรับโครงสร้างข้อมูลให้ตรงกับ API backend
      const treatmentData = {
        VNO: currentPatient.VNO,
        HNNO: currentPatient.HNCODE,
        ...(isLockedStatus ? {} : { STATUS1: 'กำลังตรวจ' }),
        labTests: labTests,
        radioTests: radioTests
      };

      console.log('Sending lab data:', treatmentData);

      const response = await TreatmentService.updateTreatment(currentPatient.VNO, treatmentData);

      if (response.success) {
        if (onSaveSuccess) {
          onSaveSuccess(); // ย้ายมาก่อน alert
        }
        alert('บันทึกข้อมูล Lab/X-ray สำเร็จ!');
      } else {
        alert('ไม่สามารถบันทึกข้อมูลได้: ' + response.message);
      }
    } catch (error) {
      console.error('Error saving lab data:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!currentPatient) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>ไม่พบข้อมูลผู้ป่วย</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          กำลังโหลดข้อมูล Lab/X-ray...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {/* Patient Profile Section */}
        <Grid item xs={12} sm={5}>
          <Card sx={{ p: 3, mb: 3, border: 'none', boxShadow: 1 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Avatar
                  src={currentPatient.avatar}
                  sx={{ width: 120, height: 120, mx: "auto" }}
                >
                  {!currentPatient.avatar && (
                    <Typography variant="h4">
                      {currentPatient.NAME1?.charAt(0) || '?'}
                    </Typography>
                  )}
                </Avatar>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                    {currentPatient.PRENAME} {currentPatient.NAME1} {currentPatient.SURNAME}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    อายุ {currentPatient.AGE} ปี • {currentPatient.SEX}
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
                    {currentPatient.VNO || 'ยังไม่สร้าง VN'}
                  </Typography>
                  <Typography variant="body1" fontWeight="600" sx={{
                    bgcolor: '#E9F2FF',
                    color: 'black',
                    p: 1,
                    borderRadius: 1,
                    textAlign: 'center'
                  }}>
                    {currentPatient.HNCODE}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Lab/X-ray Form Section */}
        <Grid item xs={12} sm={7}>
          <Grid container spacing={2}>
            {/* Radiological Examination */}
            <Grid item xs={12}>
              <FormGroup sx={{ ml: 2, pt: 1 }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Radiological Examination
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={labData.radiological.chestXray}
                      onChange={(e) => handleRadiologicalChange('chestXray', e.target.checked)}
                    />
                  }
                  label="Chest X-ray"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={labData.radiological.xray}
                      onChange={(e) => handleRadiologicalChange('xray', e.target.checked)}
                    />
                  }
                  label="X-ray"
                />
              </FormGroup>

              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="หมายเหตุ X-ray"
                value={labData.radiological.xrayNote}
                onChange={(e) => handleRadiologicalChange('xrayNote', e.target.value)}
                sx={{
                  ml: 2, mt: 1, width: 'calc(100% - 16px)',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            {/* Ultrasound */}
            <Grid item xs={12}>
              <FormGroup sx={{ ml: 2, pt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={labData.radiological.ultrasound}
                      onChange={(e) => handleRadiologicalChange('ultrasound', e.target.checked)}
                    />
                  }
                  label="Ultrasound"
                />
              </FormGroup>

              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="หมายเหตุ Ultrasound"
                value={labData.radiological.ultrasoundNote}
                onChange={(e) => handleRadiologicalChange('ultrasoundNote', e.target.value)}
                sx={{
                  ml: 2, mt: 1, width: 'calc(100% - 16px)',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Grid>

            {/* Laboratory Investigation */}
            <Grid item xs={12}>
              <FormGroup sx={{ ml: 2, pt: 2 }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Laboratory Investigation
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={labData.laboratory.cbc}
                      onChange={(e) => handleLaboratoryChange('cbc', e.target.checked)}
                    />
                  }
                  label="CBC"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={labData.laboratory.bunC}
                      onChange={(e) => handleLaboratoryChange('bunC', e.target.checked)}
                    />
                  }
                  label="BUN,C"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={labData.laboratory.lipid}
                      onChange={(e) => handleLaboratoryChange('lipid', e.target.checked)}
                    />
                  }
                  label="Lipid"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={labData.laboratory.fbs}
                      onChange={(e) => handleLaboratoryChange('fbs', e.target.checked)}
                    />
                  }
                  label="FBS"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={labData.laboratory.dtx}
                      onChange={(e) => handleLaboratoryChange('dtx', e.target.checked)}
                    />
                  }
                  label="DTX"
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={labData.laboratory.other}
                        onChange={(e) => handleLaboratoryChange('other', e.target.checked)}
                      />
                    }
                    label="Other"
                  />
                  <TextField
                    size="small"
                    placeholder="ระบุ..."
                    value={labData.laboratory.otherNote}
                    onChange={(e) => handleLaboratoryChange('otherNote', e.target.value)}
                    disabled={!labData.laboratory.other}
                    sx={{
                      width: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '5px',
                      },
                    }}
                  />
                </Box>
              </FormGroup>
            </Grid>

            {/* Save Button */}
            <Grid item xs={12} sx={{ textAlign: "right", mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    backgroundColor: "#5698E0",
                    color: "#FFFFFF",
                    fontSize: "1rem",
                    width: '200px',
                    height: '50px',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: "#4285d1"
                    },
                    '&:disabled': {
                      backgroundColor: "#e0e0e0"
                    }
                  }}
                >
                  {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </Button>

                <Button
                  variant="outlined"
                  onClick={onSaveSuccess}
                  disabled={!onSaveSuccess}
                  sx={{
                    color: "#5698E0",
                    borderColor: "#5698E0",
                    fontSize: "1rem",
                    fontWeight: 600,
                    width: '120px',
                    height: '50px',
                    '&:hover': {
                      backgroundColor: "#f0f8ff"
                    }
                  }}
                >
                  ถัดไป →
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

LabandXray.propTypes = {
  currentPatient: PropTypes.object,
  onSaveSuccess: PropTypes.func
};

export default LabandXray;